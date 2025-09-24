let clicks = 0;
let timer = 10;
let timerInterval = null;
let gameActive = false;
let currentUsername = null;

async function api(path, opts = {}) {
  const res = await fetch(path, opts);
  if (!res.ok) {
    const text = await res.text();
    try {
      return { ok: false, body: JSON.parse(text) };
    } catch (e) {
      return { ok: false, body: { error: text || res.statusText } };
    }
  }
  const body = await res.json().catch(() => null);
  return { ok: true, body };
}

function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

async function checkAuth() {
  const res = await api('/api/me');
  if (res.ok && res.body && res.body.loggedIn) {
    currentUsername = res.body.username;
    $('#loginForm').classList.add('d-none');
    $('#registerForm').classList.add('d-none');
    document.getElementById('logoutBtn').classList.remove('d-none');
    $('#nav-user-area').innerHTML = `<div class="nav-link">Signed in as <strong>${escapeHtml(currentUsername)}</strong></div>`;
    $('#nameForm #yourname').value = '';
    loadScores();
  } else {
    currentUsername = null;
    $('#loginForm').classList.remove('d-none');
    document.getElementById('logoutBtn').classList.add('d-none');
    $('#nav-user-area').innerHTML = `<div class="nav-link">Not signed in</div>`;
    clearScoresTable();
  }
}

window.addEventListener('load', () => {
  initUI();
  checkAuth();
});

function initUI() {
  $('#loginForm').onsubmit = async (e) => {
    e.preventDefault();
    const username = $('#loginUsername').value.trim();
    const password = $('#loginPassword').value;
    $('#authMessage').textContent = 'Signing in…';
    const res = await api('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      $('#authMessage').textContent = 'Signed in';
      await checkAuth();
    } else {
      $('#authMessage').textContent = res.body?.error || 'Sign in failed';
    }
  };

  $('#showRegister').onclick = () => {
    $('#registerForm').classList.remove('d-none');
    $('#registerForm').removeAttribute('aria-hidden');
    $('#registerUsername').focus();
    $('#loginForm').classList.add('d-none');
  };
  $('#cancelRegister').onclick = () => {
    $('#registerForm').classList.add('d-none');
    $('#registerForm').setAttribute('aria-hidden', 'true');
    $('#loginForm').classList.remove('d-none');
  };

  $('#registerForm').onsubmit = async (e) => {
    e.preventDefault();
    const username = $('#registerUsername').value.trim();
    const password = $('#registerPassword').value;
    $('#registerMessage').textContent = 'Registering…';
    const res = await api('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      $('#registerMessage').textContent = 'Registered and signed in';
      await checkAuth();
    } else {
      $('#registerMessage').textContent = res.body?.error || 'Register failed';
    }
  };

  $('#logoutBtn').onclick = async () => {
    await api('/api/logout', { method: 'POST' });
    currentUsername = null;
    await checkAuth();
  };

  $('#nameForm').onsubmit = startGame;
  $('#clickButton').onclick = registerClick;
}

function startGame(e) {
  e?.preventDefault();
  const labelInput = $('#yourname').value.trim();
  if (!currentUsername) {
    $('#gameMessage').textContent = 'Please sign in to save scores.';
    return;
  }
  const label = labelInput || `${currentUsername} run`;

  clicks = 0;
  timer = 10;
  gameActive = true;

  $('#clickCountDisplay').textContent = `Clicks: 0`;
  $('#nameForm').classList.add('hidden');
  $('#gameArea').classList.remove('hidden');
  $('#gameArea').setAttribute('aria-hidden', 'false');
  $('#timer').textContent = `Time left: ${timer}`;
  $('#gameMessage').textContent = '';

  const clickBtn = $('#clickButton');
  clickBtn.disabled = false;
  clickBtn.setAttribute('aria-disabled', 'false');
  clickBtn.focus();

  timerInterval = setInterval(() => {
    timer--;
    $('#timer').textContent = `Time left: ${timer}`;
    if (timer <= 0) endGame(label);
  }, 1000);
}

function registerClick() {
  if (!gameActive) return;
  clicks++;
  $('#clickCountDisplay').textContent = `Clicks: ${clicks}`;
}

$('#clickButton').addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault();
    $('#clickButton').click();
  }
});

async function endGame(labelFromStart) {
  clearInterval(timerInterval);
  gameActive = false;

  $('#gameArea').classList.add('hidden');
  $('#nameForm').classList.remove('hidden');
  $('#gameArea').setAttribute('aria-hidden', 'true');

  const clickBtn = $('#clickButton');
  clickBtn.disabled = true;
  clickBtn.setAttribute('aria-disabled', 'true');

  const totalTime = 10;
  const cps = (clicks / totalTime) || 0;

  $('#gameMessage').textContent = `Run complete — score ${clicks} (${cps.toFixed(2)} clicks/sec). Saving...`;

  const res = await api('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: labelFromStart, score: clicks, clicksPerSecond: Number(cps.toFixed(2)) })
  });

  if (res.ok) {
    $('#gameMessage').textContent = 'Saved!';
    await loadScores();
  } else {
    $('#gameMessage').textContent = 'Could not save: ' + (res.body?.error || JSON.stringify(res.body));
  }
}

function clearScoresTable() {
  const tbody = $('#scoreTable tbody');
  if (tbody) tbody.innerHTML = '';
}

async function loadScores() {
  clearScoresTable();
  const res = await api('/api/results');
  if (!res.ok) {
    return;
  }
  const scores = res.body || [];
  const tbody = $('#scoreTable tbody');

  scores.sort((a, b) => b.score - a.score);

  scores.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <span class="label-text">${escapeHtml(row.name)}</span>
        <input class="form-control form-control-sm edit-name d-none" value="${escapeHtml(row.name)}" />
      </td>
      <td>
        <span class="score-text">${row.score}</span>
        <input type="number" class="form-control form-control-sm edit-score d-none" value="${row.score}" min="0" />
      </td>
      <td>
        <span class="cps-text">${Number(row.clicksPerSecond).toFixed(2)}</span>
        <input type="number" step="0.01" class="form-control form-control-sm edit-cps d-none" value="${Number(row.clicksPerSecond).toFixed(2)}" min="0" />
      </td>
      <td>${new Date(row.createdAt).toLocaleString()}</td>
      <td>
        <div class="btn-group" role="group" aria-label="Actions">
          <button class="btn btn-sm btn-outline-light edit-btn">Edit</button>
          <button class="btn btn-sm btn-success save-btn d-none">Save</button>
          <button class="btn btn-sm btn-secondary cancel-btn d-none">Cancel</button>
          <button class="btn btn-sm btn-danger delete-btn">Delete</button>
        </div>
      </td>
    `;
    const editBtn = tr.querySelector('.edit-btn');
    const saveBtn = tr.querySelector('.save-btn');
    const cancelBtn = tr.querySelector('.cancel-btn');
    const deleteBtn = tr.querySelector('.delete-btn');

    const labelSpan = tr.querySelector('.label-text');
    const scoreSpan = tr.querySelector('.score-text');
    const cpsSpan = tr.querySelector('.cps-text');

    const editName = tr.querySelector('.edit-name');
    const editScore = tr.querySelector('.edit-score');
    const editCps = tr.querySelector('.edit-cps');

    editBtn.onclick = () => {
      labelSpan.classList.add('d-none');
      scoreSpan.classList.add('d-none');
      cpsSpan.classList.add('d-none');
      editName.classList.remove('d-none');
      editScore.classList.remove('d-none');
      editCps.classList.remove('d-none');
      editBtn.classList.add('d-none');
      saveBtn.classList.remove('d-none');
      cancelBtn.classList.remove('d-none');
    };

    cancelBtn.onclick = () => {
      labelSpan.classList.remove('d-none');
      scoreSpan.classList.remove('d-none');
      cpsSpan.classList.remove('d-none');
      editName.classList.add('d-none');
      editScore.classList.add('d-none');
      editCps.classList.add('d-none');
      editBtn.classList.remove('d-none');
      saveBtn.classList.add('d-none');
      cancelBtn.classList.add('d-none');
    };

    saveBtn.onclick = async () => {
      const newName = editName.value.trim() || row.name;
      const newScore = Number(editScore.value) || row.score;
      const newCps = Number(editCps.value) || row.clicksPerSecond;
      const res = await api(`/api/score/${row._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, score: newScore, clicksPerSecond: newCps })
      });
      if (res.ok) {
        labelSpan.textContent = newName;
        scoreSpan.textContent = newScore;
        cpsSpan.textContent = newCps.toFixed(2);
        cancelBtn.click();
      } else {
        alert('Update failed: ' + (res.body?.error || JSON.stringify(res.body)));
      }
    };

    deleteBtn.onclick = async () => {
      if (!confirm('Delete this run?')) return;
      const res = await api(`/api/score/${row._id}`, { method: 'DELETE' });
      if (res.ok) {
        tr.remove();
      } else {
        alert('Delete failed: ' + (res.body?.error || JSON.stringify(res.body)));
      }
    };

    tbody.appendChild(tr);
  });
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#39;");
}
