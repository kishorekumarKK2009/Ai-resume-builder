(() => {
  const API_BASE = 'http://localhost:5001/api';
  let profile = null;

  const $ = (id) => document.getElementById(id);

  function getToken() {
    return localStorage.getItem('token');
  }

  function goToLogin() {
    window.location.href = 'login.html';
  }

  function replaceButton(id) {
    const original = $(id);
    const replacement = original.cloneNode(true);
    original.replaceWith(replacement);
    return replacement;
  }

  async function request(path, method = 'GET', body) {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`
      },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Unable to update your profile.');
    }
    return data;
  }

  function initials(name) {
    return String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';
  }

  function render() {
    $('viewName').textContent = profile.name || 'Your name';
    $('viewUsername').textContent = profile.username ? `@${profile.username.replace(/^@+/, '')}` : 'Not added';
    $('viewPhone').textContent = profile.phone || 'Not added';
    $('viewAge').textContent = profile.age || 'Not added';
    $('viewEmail').textContent = profile.email || 'Not added';
    $('avatarInitials').textContent = initials(profile.name);
  }

  function fillForm() {
    $('name').value = profile.name || '';
    $('username').value = profile.username || '';
    $('password').value = '';
    $('age').value = profile.age || '';
    $('email').value = profile.email || '';
    $('phone').value = profile.phone || '';
  }

  function showPanel(panel) {
    ['viewPanel', 'editPanel', 'signedOutPanel'].forEach((id) => $(id).classList.add('hidden'));
    $(panel).classList.remove('hidden');
    $('backBtn').classList.toggle('show', panel === 'editPanel');
  }

  function saveLocalUser(user) {
    const previous = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...previous, ...user, id: user._id || user.id || previous.id }));
  }

  async function saveProfile(saveButton) {
    const name = $('name').value.trim();
    const email = $('email').value.trim().toLowerCase();
    const username = $('username').value.trim().replace(/^@+/, '');
    const phone = $('phone').value.trim();
    const ageText = $('age').value.trim();
    const password = $('password').value;

    if (!name || !email) {
      alert('Name and email are required.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      alert('Enter a valid email address.');
      return;
    }
    if (ageText && (!Number.isInteger(Number(ageText)) || Number(ageText) < 13 || Number(ageText) > 120)) {
      alert('Age must be between 13 and 120.');
      return;
    }
    if (password && password.length < 8) {
      alert('A new password must be at least 8 characters.');
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = 'Saving...';
    try {
      profile = await request('/profile', 'PUT', {
        name,
        email,
        username: username || undefined,
        phone: phone || undefined,
        age: ageText ? Number(ageText) : undefined,
        password: password || undefined
      });
      saveLocalUser(profile);
      render();
      showPanel('viewPanel');
    } catch (error) {
      alert(error.message);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = 'Save';
    }
  }

  async function loadProfile() {
    if (!getToken()) {
      goToLogin();
      return;
    }

    try {
      profile = await request('/profile');
      saveLocalUser(profile);
      render();
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('Your session has expired. Please sign in again.');
      goToLogin();
    }
  }

  function initialize() {
    const editButton = replaceButton('editBtn');
    const logoutButton = replaceButton('logoutBtn');
    const saveButton = replaceButton('saveBtn');
    const resetButton = replaceButton('resetBtn');
    const backButton = replaceButton('backBtn');
    const reloginButton = replaceButton('reloginBtn');

    editButton.addEventListener('click', () => {
      fillForm();
      showPanel('editPanel');
    });
    backButton.addEventListener('click', () => showPanel('viewPanel'));
    resetButton.addEventListener('click', fillForm);
    saveButton.addEventListener('click', () => saveProfile(saveButton));
    logoutButton.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      goToLogin();
    });
    reloginButton.addEventListener('click', goToLogin);

    loadProfile();
  }

  initialize();
})();
