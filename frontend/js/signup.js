const API_BASE = 'http://localhost:5001/api';

const form = document.getElementById('signupForm');
if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const btn = document.getElementById('signupBtn');
    const fullname = document.getElementById('fullname').value.trim();
    const age = parseInt(document.getElementById('age').value);
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    const pass2 = document.getElementById('pass2').value;
    const terms = document.getElementById('terms').checked;

    if(!fullname || fullname.split(' ').length<2){ window.shake && window.shake('fullname'); window.showToast('⚠ Enter your full name (first & last)'); return; }
    if(!age || age<13 || age>120){ window.shake && window.shake('age'); window.showToast('⚠ Enter a valid age (13–120)'); return; }
    if(!username || !/^[a-zA-Z0-9_@]{3,}$/.test(username)){ window.shake && window.shake('username'); window.showToast('⚠ Username must be 3+ characters, no spaces'); return; }
    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ window.shake && window.shake('email'); window.showToast('⚠ Enter a valid email address'); return; }
    if(pass.length<8){ window.shake && window.shake('pass'); window.showToast('⚠ Password must be at least 8 characters'); return; }
    if(pass!==pass2){ window.shake && window.shake('pass2'); window.showToast('⚠ Passwords do not match'); return; }
    if(!terms){ window.showToast('⚠ Please accept the Terms of Service'); return; }

    document.getElementById('signupBtnText').textContent='Creating account…';
    btn.disabled=true;btn.style.opacity='0.8';

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullname, email, password: pass, username, age })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Signup failed');
      }
      if (result && result.token) {
        localStorage.setItem('token', result.token);
        if (result.user) localStorage.setItem('user', JSON.stringify(result.user));
        window.location.href = 'dashboard.html';
      } else {
        window.showToast(result.message || 'Signup failed');
        btn.disabled=false;btn.style.opacity='';
        document.getElementById('signupBtnText').textContent='Create Free Account';
      }
    } catch (err) {
      const friendly = (window.friendlyError && window.friendlyError(err.message)) || (err.message || 'Signup failed');
      window.showToast(`⚠ ${friendly}`);
      btn.disabled=false;btn.style.opacity='';
      document.getElementById('signupBtnText').textContent='Create Free Account';
    }
  });
}
