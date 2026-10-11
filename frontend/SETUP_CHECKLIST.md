# Database Integration Checklist

## ✅ Setup Steps

- [ ] **Step 1: Ensure Backend is Running**
  ```bash
  cd d:\kishore\backend
  python manage.py runserver
  ```
  Backend should be at: `http://localhost:8000`

- [ ] **Step 2: Verify Backend is Working**
  - Visit `http://localhost:8000/api/docs/` in browser
  - Should see Swagger API documentation

- [ ] **Step 3: Add Database Scripts to HTML Files**
  Add these three lines before `</body>` in each HTML:
  ```html
  <script src="js/database.js"></script>
  <script src="js/db-helpers.js"></script>
  <script src="js/resume-builder-db.js"></script>
  ```

- [ ] **Step 4: Test in Browser Console**
  Open DevTools (F12) → Console tab and run:
  ```javascript
  console.log(db)  // Should show DatabaseService
  ```

- [ ] **Step 5: Test Login Flow**
  - Go to login.html
  - Try logging in with test credentials
  - Should redirect to dashboard

## 📝 Files to Update

### Authentication Pages

#### login.html
```html
<script src="js/database.js"></script>
<script src="js/db-helpers.js"></script>

<!-- In form -->
<form onsubmit="handleLoginSubmit(event)">
    <input type="email" id="email" required>
    <input type="password" id="password" required>
    <button type="submit">Login</button>
</form>

<script>
    function handleLoginSubmit(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        handleAuth(email, password, true);
    }
</script>
```

#### signup.html
```html
<script src="js/database.js"></script>
<script src="js/db-helpers.js"></script>

<!-- Similar to login -->
```

### Dashboard Pages

#### dashboard.html
```html
<div id="user-section"></div>
<div id="auth-section"></div>
<div id="resumes-container"></div>

<script src="js/database.js"></script>
<script src="js/db-helpers.js"></script>

<script>
    if (db.isAuthenticated()) {
        loadUserResumes('resumes-container');
    }
</script>
```

#### resume-builder.html
```html
<script src="js/database.js"></script>
<script src="js/db-helpers.js"></script>
<script src="js/resume-builder-db.js"></script>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        checkAuthentication();
        loadResumeFromDatabase();
    });
</script>
```

#### templates.html
```html
<div id="templates-container"></div>

<script src="js/database.js"></script>
<script src="js/db-helpers.js"></script>

<script>
    loadTemplates('templates-container');
</script>
```

#### profile.html
```html
<script src="js/database.js"></script>
<script src="js/db-helpers.js"></script>

<script>
    if (db.isAuthenticated()) {
        loadProfile();
    }
</script>
```

## 🧪 Testing Commands

### In Browser Console (F12)

```javascript
// 1. Check if services loaded
console.log(db);

// 2. Check authentication status
console.log(db.isAuthenticated());

// 3. Get current user
console.log(db.currentUser);

// 4. Test API connection
await db.checkBackendConnection();

// 5. Test register
await db.registerUser({
    name: 'Test User',
    email: 'test@example.com',
    username: 'testuser',
    password: 'testpass123'
});

// 6. Test login
await db.loginUser('test@example.com', 'testpass123');

// 7. Create resume
await db.createResume({
    title: 'Test Resume',
    full_name: 'Test User',
    email: 'test@example.com'
});

// 8. Get user resumes
await db.getUserResumes();

// 9. Get templates
await db.getTemplates();

// 10. Logout
db.logout();
```

## 🔧 Backend Test Data

### Create Test User
```bash
# In backend folder, open Python shell
python manage.py shell

# Run these commands
from resume_api.users.models import User

User.objects.create(
    name='John Doe',
    email='john@test.com',
    username='johndoe',
    password='test123'
)
```

### Create Test Templates
```bash
python manage.py shell

from resume_api.templates_app.models import Template

Template.objects.create(
    name='Modern Blue',
    slug='modern-blue',
    category='Modern',
    description='A modern resume template',
    is_active=True
)
```

## 🐛 Common Issues

### Issue: "CORS error" or "Network Error"

**Solution:**
1. Check if backend is running: `http://localhost:8000/api/docs/`
2. Verify API_CONFIG.BASE_URL in js/database.js
3. Check backend CORS settings in settings.py

### Issue: "Token not found" / "Not authenticated"

**Solution:**
1. User must login first
2. Check localStorage: `localStorage.getItem('resume_ai_token')`
3. Try clearing browser cache

### Issue: "404 Not Found"

**Solution:**
1. Check backend API routes
2. Verify endpoint format
3. Check backend logs

### Issue: "Timeout"

**Solution:**
1. Backend might be slow
2. Check network latency
3. Increase TIMEOUT in database.js

## 📊 Database Architecture

```
Frontend (HTML/JS)
    ↓
database.js (APIService + DatabaseService)
    ↓
db-helpers.js (User-friendly functions)
    ↓
HTTP Requests
    ↓
Django Backend (http://localhost:8000)
    ↓
MongoDB (mongodb://localhost:27017)
```

## 🔐 Security Notes

1. **Tokens**: Stored in localStorage (consider using sessionStorage)
2. **CORS**: Only allow your frontend domain in production
3. **HTTPS**: Use HTTPS in production
4. **Secrets**: Never hardcode API keys

## 📱 Responsive Considerations

- All functions work on mobile
- Notifications are responsive
- Handle network timeouts gracefully

## 🚀 Deployment Checklist

- [ ] Update API_CONFIG.BASE_URL to production URL
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set DEBUG=False in backend
- [ ] Setup database backups
- [ ] Configure logging
- [ ] Test all flows in production

## 💡 Tips

1. **Always check authentication before critical operations**
   ```javascript
   if (!checkAuthentication()) return;
   ```

2. **Use try-catch for database operations**
   ```javascript
   try {
       const result = await db.createResume(data);
   } catch (error) {
       showNotification(error.message, 'error');
   }
   ```

3. **Show loading state while fetching**
   ```javascript
   button.disabled = true;
   button.textContent = 'Loading...';
   // ... perform operation ...
   button.disabled = false;
   ```

4. **Cache frequently accessed data**
   ```javascript
   const templates = db.getCachedTemplates();
   ```

## 📞 Support

For detailed API reference, see: `DATABASE_INTEGRATION.md`

For backend docs, see: `backend/README.md`

---

**Status**: ✅ Ready to integrate

**Next Step**: Update your HTML files following this checklist!
