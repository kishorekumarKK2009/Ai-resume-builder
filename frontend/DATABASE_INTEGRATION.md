# Database Integration Guide

## Overview

This guide shows how to integrate the frontend with the Django + MongoDB backend for the Resume.ai application.

## Files Created

1. **`js/database.js`** - Core API and database service
2. **`js/db-helpers.js`** - Ready-to-use helper functions
3. **`js/resume-builder-db.js`** - Resume builder integration

## Quick Setup

### Step 1: Add Scripts to HTML

Add these script tags to the `<head>` or before `</body>` in your HTML files:

```html
<!-- Core Database Services -->
<script src="js/database.js"></script>
<script src="js/db-helpers.js"></script>
<script src="js/resume-builder-db.js"></script>
```

### Step 2: Update API Configuration

Edit `js/database.js` line 6 to match your backend URL:

```javascript
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api',  // Update if backend is on different server
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};
```

### Step 3: Start Using Database Functions

## Integration Examples

### Login Page (login.html)

Add this to your login form:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="js/database.js"></script>
    <script src="js/db-helpers.js"></script>
</head>
<body>
    <form onsubmit="handleLoginSubmit(event)">
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="password" placeholder="Password" required>
        <button type="submit">Login</button>
    </form>

    <script>
        function handleLoginSubmit(event) {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            handleAuth(email, password, true);  // true = login
        }
    </script>
</body>
</html>
```

### Signup Page (signup.html)

```html
<form onsubmit="handleSignupSubmit(event)">
    <input type="email" id="email" placeholder="Email" required>
    <input type="password" id="password" placeholder="Password" required>
    <input type="text" id="name" placeholder="Full Name" required>
    <button type="submit">Sign Up</button>
</form>

<script>
    function handleSignupSubmit(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value;
        
        db.registerUser({
            email,
            password,
            name,
            username: email.split('@')[0]
        }).then(result => {
            if (result.success) {
                showNotification('Account created! Logging in...', 'success');
                setTimeout(() => window.location.href = 'dashboard.html', 1000);
            } else {
                showNotification(result.error, 'error');
            }
        });
    }
</script>
```

### Dashboard Page (dashboard.html)

```html
<div id="auth-section">
    <a href="login.html">Login</a> | <a href="signup.html">Sign Up</a>
</div>

<div id="user-section" style="display:none;">
    <!-- Will be auto-populated by initAuthUI() -->
</div>

<h2>My Resumes</h2>
<div id="resumes-container"></div>

<button onclick="window.location.href='resume-builder.html'">Create New Resume</button>

<script src="js/database.js"></script>
<script src="js/db-helpers.js"></script>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        if (db.isAuthenticated()) {
            loadUserResumes('resumes-container');
        }
    });
</script>
```

### Resume Builder Page (resume-builder.html)

```html
<form id="resume-form">
    <input type="text" id="resumeTitle" placeholder="Resume Title" required>
    <input type="text" id="fullName" placeholder="Full Name" required>
    <input type="email" id="email" placeholder="Email" required>
    <input type="tel" id="phone" placeholder="Phone" required>
    <input type="text" id="location" placeholder="Location" required>
    <textarea id="summary" placeholder="Professional Summary"></textarea>

    <!-- Experiences -->
    <h3>Experience</h3>
    <div id="experiencesContainer"></div>
    <button type="button" onclick="addExperience()">Add Experience</button>

    <!-- Education -->
    <h3>Education</h3>
    <div id="educationContainer"></div>
    <button type="button" onclick="addEducation()">Add Education</button>

    <!-- Skills -->
    <h3>Skills</h3>
    <div id="skillsContainer"></div>
    <button type="button" onclick="addSkill()">Add Skill</button>

    <button type="button" onclick="saveResumeLocally()">Save Locally</button>
    <button type="button" onclick="saveResumeToDatabase()">Save to Database</button>
    <button type="button" onclick="exportResume('json')">Export as JSON</button>
</form>

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

### Templates Page (templates.html)

```html
<h2>Resume Templates</h2>
<div id="templates-container"></div>

<script src="js/database.js"></script>
<script src="js/db-helpers.js"></script>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        loadTemplates('templates-container');
    });
</script>
```

### Profile Page (profile.html)

```html
<div id="profile-info">
    <!-- Will be populated -->
</div>

<form onsubmit="handleProfileUpdate(event)">
    <input type="text" id="profileName" placeholder="Name" required>
    <input type="tel" id="profilePhone" placeholder="Phone">
    <input type="text" id="profileLocation" placeholder="Location">
    <textarea id="profileBio" placeholder="Bio"></textarea>
    <button type="submit">Update Profile</button>
</form>

<script src="js/database.js"></script>
<script src="js/db-helpers.js"></script>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        if (db.isAuthenticated()) {
            displayProfile();
        }
    });

    function displayProfile() {
        const user = db.currentUser;
        document.getElementById('profileName').value = user.name || '';
        document.getElementById('profilePhone').value = user.phone || '';
        document.getElementById('profileLocation').value = user.location || '';
        document.getElementById('profileBio').value = user.bio || '';
    }

    function handleProfileUpdate(event) {
        event.preventDefault();
        db.updateUserProfile({
            name: document.getElementById('profileName').value,
            phone: document.getElementById('profilePhone').value,
            location: document.getElementById('profileLocation').value,
            bio: document.getElementById('profileBio').value
        }).then(result => {
            if (result.success) {
                showNotification('Profile updated!', 'success');
            }
        });
    }
</script>
```

## Available Functions

### Authentication

```javascript
// Login
await db.loginUser(email, password);

// Register
await db.registerUser({ email, password, name, username });

// Logout
db.logout();

// Check if authenticated
db.isAuthenticated();

// Get current user
await db.getCurrentUser();

// Update profile
await db.updateUserProfile(userData);
```

### Resumes

```javascript
// Create resume
await db.createResume(resumeData);

// Get user's resumes
await db.getUserResumes();

// Get single resume
await db.getResume(resumeId);

// Update resume
await db.updateResume(resumeId, resumeData);

// Delete resume
await db.deleteResume(resumeId);

// Publish resume
await db.publishResume(resumeId);

// Unpublish resume
await db.unpublishResume(resumeId);
```

### Templates

```javascript
// Get all templates
await db.getTemplates();

// Get templates by category
await db.getTemplates('Modern');

// Get single template
await db.getTemplate(templateId);

// Get cached templates
db.getCachedTemplates();
```

### Local Storage

```javascript
// Save resume locally
await db.saveResumeLocally(resumeData);

// Load resume from local storage
db.loadResumeLocally();
```

### Helper Functions

```javascript
// Show notification
showNotification(message, type); // type: 'success', 'error', 'info', 'warning'

// Handle auth
handleAuth(email, password, isLogin);

// Load user resumes
loadUserResumes(containerId);

// Load templates
loadTemplates(containerId);

// Create resume
createNewResume(resumeData);

// Update resume
updateResumeData(resumeId, resumeData);

// Delete resume
deleteResumeData(resumeId);

// View resume
viewResume(resumeId);

// Edit resume
editResume(resumeId);

// Publish resume
publishResume(resumeId);

// Unpublish resume
unpublishResume(resumeId);

// Check authentication
checkAuthentication();

// Logout
logoutUser();
```

## Resume Data Structure

```javascript
{
    title: "Software Engineer Resume",
    full_name: "John Doe",
    email: "john@example.com",
    phone: "(555) 123-4567",
    location: "San Francisco, CA",
    professional_summary: "Experienced developer...",
    template: "modern",
    experiences: [
        {
            title: "Senior Developer",
            company: "Tech Corp",
            location: "San Francisco, CA",
            start_date: "2021-01",
            end_date: "present",
            description: "Led development..."
        }
    ],
    education: [
        {
            school: "University of California",
            degree: "Bachelor of Science",
            field: "Computer Science",
            start_date: "2014-09",
            end_date: "2018-05"
        }
    ],
    skills: [
        {
            name: "Python",
            level: "Expert"
        }
    ]
}
```

## Error Handling

All functions return a result object:

```javascript
{
    success: true/false,
    data: {...},           // On success
    error: "error message" // On failure
}
```

Example:

```javascript
const result = await db.loginUser(email, password);
if (result.success) {
    console.log('Logged in:', result.data);
} else {
    console.error('Error:', result.error);
}
```

## Local Storage Keys

- `resume_ai_user` - Current user data
- `resume_ai_token` - Authentication token
- `resume_ai_resumes` - Cached resumes
- `resume_ai_templates` - Cached templates
- `resume_ai_current_resume` - Current resume being edited

## Notifications

Notifications appear in the top-right corner:

```javascript
showNotification('Success!', 'success');    // Green
showNotification('Error!', 'error');        // Red
showNotification('Info', 'info');           // Black
showNotification('Warning', 'warning');     // Orange
```

## Testing

### 1. Test Backend Connection

Open browser console and run:

```javascript
await db.checkBackendConnection()
```

### 2. Test Login

```javascript
await db.loginUser('test@example.com', 'password123')
```

### 3. Test Create Resume

```javascript
await db.createResume({
    title: 'Test Resume',
    full_name: 'John Doe',
    email: 'john@example.com'
})
```

### 4. Test Get Resumes

```javascript
await db.getUserResumes()
```

## Troubleshooting

### "CORS error"
- Make sure backend is running
- Check API_CONFIG.BASE_URL in database.js
- Ensure CORS is configured in Django settings

### "Not authenticated"
- User needs to login first
- Check localStorage for auth token
- Try clearing browser cache

### "Network error"
- Verify backend server is running
- Check internet connection
- Verify API endpoint URL

### "Resume not saving"
- Check if user is authenticated
- Verify form fields are filled
- Check browser console for errors

## Next Steps

1. ✅ Add script tags to all HTML files
2. ✅ Update API_CONFIG.BASE_URL if needed
3. ✅ Test backend connection
4. ✅ Test login/signup flow
5. ✅ Test resume CRUD operations
6. ✅ Deploy to production

## Support

For issues:
1. Check browser console (F12)
2. Check backend logs
3. Verify API endpoint URLs
4. Check MongoDB connection

---

**Happy integrating!** 🚀
