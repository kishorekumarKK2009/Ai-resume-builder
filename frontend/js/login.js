const API_BASE = 'http://localhost:5001/api';

async function handleLogin(event) {
  event.preventDefault();
  const button = document.getElementById('loginBtn');
  const buttonText = document.getElementById('loginBtnText');
  const email = document.getElementById('email')?.value.trim() || '';
  const password = document.getElementById('pass')?.value || '';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    window.shake && window.shake('email');
    showMessage('Enter a valid email address');
    return;
  }

  if (!password) {
    window.shake && window.shake('pass');
    showMessage('Please enter your password');
    return;
  }

  setLoading(button, buttonText, true);

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }

    if (result.token) {
      localStorage.setItem('token', result.token);
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
      }
      window.location.href = 'dashboard.html';
    } else {
      throw new Error(result.error || result.message || 'Login failed');
    }
  } catch (err) {
    showMessage(mapError(err.message));
    setLoading(button, buttonText, false);
  }
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}

function mapError(message) {
  if (!message) return 'Login failed. Please try again.';
  const m = message.toLowerCase();
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('network request failed')) {
    return 'Cannot reach the backend. Start it with npm start in the backend folder.';
  }
  return message;
}

function setLoading(button, text, loading) {
  if (!button || !text) return;
  button.disabled = loading;
  button.style.opacity = loading ? '0.8' : '';
  text.textContent = loading ? 'Signing in...' : 'Sign In';
}

function showMessage(message) {
  if (typeof window.showToast === 'function') {
    window.showToast(message);
  } else {
    alert(message);
  }
}
