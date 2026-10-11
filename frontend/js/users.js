const API_BASE = 'http://localhost:5001/api';
let allUsers = [];
let filteredUsers = [];

function getToken() {
  return localStorage.getItem('token');
}

function redirectToLogin() {
  window.location.href = 'login.html';
}

function getInitials(name) {
  if (!name) return 'U';
  return name
    .trim()
    .split(/\s+/)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatHandle(username, email) {
  const clean = String(username || '').trim().replace(/^@+/, '').toLowerCase();
  if (clean) return `@${clean}`;
  if (!email) return '@user';
  return `@${email.split('@')[0].toLowerCase()}`;
}

function isProfileComplete(user) {
  return user.name && user.email && user.age && user.phone;
}

async function apiRequest(path, method = 'GET', body) {
  const token = getToken();
  if (!token) {
    redirectToLogin();
    throw new Error('Login required');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : null
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with ${response.status}`);
  }
  return data;
}

function createUserCard(user) {
  const complete = isProfileComplete(user);
  const initials = getInitials(user.name);
  const handle = formatHandle(user.username, user.email);
  
  return `
    <div class="user-card">
      <div class="user-avatar">${initials}</div>
      <h3 class="user-name">${user.name || 'Unnamed User'}</h3>
      <p class="user-handle">${handle}</p>
      
      <div class="user-info">
        <div class="user-info-item">
          <span class="user-info-label">Email:</span>
          <span class="user-info-value">${user.email || 'N/A'}</span>
        </div>
        <div class="user-info-item">
          <span class="user-info-label">Age:</span>
          <span class="user-info-value">${user.age ? user.age + ' years' : 'Not added'}</span>
        </div>
        <div class="user-info-item">
          <span class="user-info-label">Phone:</span>
          <span class="user-info-value">${user.phone ? user.phone : 'Not added'}</span>
        </div>
        <div class="user-info-item">
          <span class="user-info-label">Status:</span>
          <span class="user-info-value">${complete ? '✓ Complete' : '⊘ Incomplete'}</span>
        </div>
      </div>
      
      <div class="user-actions">
        <button class="btn-view" onclick="viewUserProfile('${user._id}')">View Profile</button>
        <button class="btn-contact" onclick="contactUser('${user.email}')">Contact</button>
      </div>
    </div>
  `;
}

function renderUsers(users) {
  const container = document.getElementById('usersContainer');
  
  if (users.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h2>No users found</h2>
        <p>Try adjusting your search criteria</p>
      </div>
    `;
    return;
  }

  container.classList.remove('loading');
  container.innerHTML = `<div class="users-grid">${users.map(createUserCard).join('')}</div>`;
  
  // Update stats
  const completeCount = users.filter(u => isProfileComplete(u)).length;
  document.getElementById('totalUsers').textContent = allUsers.length;
  document.getElementById('displayedUsers').textContent = users.length;
  document.getElementById('onlineUsers').textContent = completeCount;
}

function filterUsers(query) {
  if (!query.trim()) {
    filteredUsers = [...allUsers];
    renderUsers(filteredUsers);
    return;
  }

  const q = query.toLowerCase();
  filteredUsers = allUsers.filter(user =>
    (user.name && user.name.toLowerCase().includes(q)) ||
    (user.email && user.email.toLowerCase().includes(q)) ||
    (user.username && user.username.toLowerCase().includes(q))
  );

  renderUsers(filteredUsers);
}

function resetSearch() {
  document.getElementById('searchInput').value = '';
  filteredUsers = [...allUsers];
  renderUsers(filteredUsers);
}

async function loadUsers() {
  try {
    const response = await apiRequest('/users');
    
    // Handle array or object with users property
    allUsers = Array.isArray(response) ? response : (response.users || []);
    
    // Filter out current user
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    allUsers = allUsers.filter(u => u._id !== currentUser.id && u._id !== currentUser._id);
    
    filteredUsers = [...allUsers];
    renderUsers(filteredUsers);
  } catch (error) {
    console.error('Error loading users:', error);
    const container = document.getElementById('usersContainer');
    container.innerHTML = `
      <div class="empty-state">
        <h2>Error loading users</h2>
        <p>${error.message}</p>
        <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
      </div>
    `;
  }
}

function viewUserProfile(userId) {
  alert('Profile viewing feature coming soon!\nUser ID: ' + userId);
  // Future: Could redirect to a shared profile view page
}

function contactUser(email) {
  // Open email client
  window.location.href = `mailto:${email}?subject=Hello from Nexus`;
}

function goToProfile() {
  window.location.href = 'profile.html';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// Search event listener
document.addEventListener('DOMContentLoaded', () => {
  if (!getToken()) {
    redirectToLogin();
    return;
  }

  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    filterUsers(e.target.value);
  });

  loadUsers();
});
