# Complete Code Examples for Database Integration

## Example 1: Login Page (login.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login — Resume.ai</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Inter', Arial, sans-serif;
            background: linear-gradient(135deg, #f7f4ed 0%, #efeada 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-container {
            background: white;
            border-radius: 8px;
            padding: 40px;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        h1 { font-size: 28px; margin-bottom: 8px; }
        .subtitle { color: #8b8478; margin-bottom: 30px; }
        .form-group { margin-bottom: 16px; }
        label { display: block; margin-bottom: 6px; color: #3a3d3f; font-weight: 600; }
        input { width: 100%; padding: 10px; border: 1.5px solid #e3ddd0; border-radius: 4px; }
        input:focus { outline: none; border-color: #c2461b; box-shadow: 0 0 0 3px rgba(194, 70, 27, 0.1); }
        button { width: 100%; padding: 12px; background: #16191c; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; }
        button:hover { background: #c2461b; }
        .error { color: #a33; font-size: 13px; }
        .link { text-align: center; margin-top: 16px; }
        .link a { color: #c2461b; text-decoration: none; }
    </style>
</head>
<body>
    <div class="login-container">
        <h1>Welcome Back</h1>
        <p class="subtitle">Sign in to your Resume.ai account</p>
        
        <form id="login-form" onsubmit="handleLoginSubmit(event)">
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required placeholder="you@example.com">
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required placeholder="••••••••">
            </div>

            <button type="submit" id="submit-btn">Sign In</button>
        </form>

        <div class="link">
            Don't have an account? <a href="signup.html">Sign up</a>
        </div>
    </div>

    <!-- Database Scripts -->
    <script src="js/database.js"></script>
    <script src="js/db-helpers.js"></script>

    <script>
        async function handleLoginSubmit(event) {
            event.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const submitBtn = document.getElementById('submit-btn');

            // Disable button while processing
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';

            try {
                const result = await db.loginUser(email, password);
                
                if (result.success) {
                    showNotification('Welcome back! Redirecting...', 'success');
                    setTimeout(() => window.location.href = 'dashboard.html', 800);
                } else {
                    showNotification(result.error || 'Login failed', 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Sign In';
                }
            } catch (error) {
                showNotification(db.formatError(error), 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        }
    </script>
</body>
</html>
```

## Example 2: Dashboard (dashboard.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Dashboard — Resume.ai</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', Arial, sans-serif; background: #f7f4ed; padding: 40px 20px; }
        .container { max-width: 1000px; margin: 0 auto; }
        header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        h1 { font-size: 32px; }
        #user-section { font-size: 14px; }
        .btn { padding: 10px 16px; background: #16191c; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .btn:hover { background: #c2461b; }
        .resumes-grid { display: grid; gap: 20px; margin-bottom: 30px; }
        .resume-card { background: white; padding: 20px; border-radius: 6px; border: 1.5px solid #e3ddd0; }
        .resume-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
        .resume-date { color: #8b8478; font-size: 13px; }
        .resume-actions { display: flex; gap: 8px; margin-top: 12px; }
        .resume-actions button { padding: 8px 12px; font-size: 12px; }
        .empty { background: white; padding: 40px; border-radius: 6px; text-align: center; color: #8b8478; }
        .empty-icon { font-size: 48px; margin-bottom: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Dashboard</h1>
            <div id="user-section"></div>
        </header>

        <section>
            <h2 style="margin-bottom: 20px;">My Resumes</h2>
            <div id="resumes-container" class="resumes-grid"></div>
        </section>

        <button class="btn" onclick="window.location.href='resume-builder.html'">
            + Create New Resume
        </button>
    </div>

    <!-- Database Scripts -->
    <script src="js/database.js"></script>
    <script src="js/db-helpers.js"></script>

    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            // Initialize auth UI (shows user section or redirects to login)
            if (!db.isAuthenticated()) {
                window.location.href = 'login.html';
                return;
            }

            // Load and display user's resumes
            loadUserResumes('resumes-container');
        });

        // Override resume-container display
        async function loadUserResumes(containerId) {
            const container = document.getElementById(containerId);
            
            try {
                container.innerHTML = '<p>Loading your resumes...</p>';
                const result = await db.getUserResumes();

                if (!result.success) {
                    container.innerHTML = `<div class="empty">Error: ${result.error}</div>`;
                    return;
                }

                const resumes = result.data || [];
                
                if (resumes.length === 0) {
                    container.innerHTML = `
                        <div class="empty">
                            <div class="empty-icon">📄</div>
                            <p>No resumes yet. Create one to get started!</p>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = resumes.map(resume => `
                    <div class="resume-card">
                        <div class="resume-title">${escapeHtml(resume.title || 'Untitled Resume')}</div>
                        <div class="resume-date">Created ${formatDate(resume.created_at)}</div>
                        <div class="resume-actions">
                            <button class="btn" onclick="editResume('${resume.id}')">Edit</button>
                            <button class="btn" onclick="viewResume('${resume.id}')">View</button>
                            <button class="btn" onclick="deleteResumeData('${resume.id}')">Delete</button>
                        </div>
                    </div>
                `).join('');
            } catch (error) {
                container.innerHTML = `<div class="empty">Error: ${error.message}</div>`;
            }
        }
    </script>
</body>
</html>
```

## Example 3: Resume Builder (resume-builder.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Resume Builder</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', Arial, sans-serif; background: #f7f4ed; padding: 30px 20px; }
        .container { max-width: 900px; margin: 0 auto; }
        h2 { margin: 30px 0 15px; font-size: 18px; }
        .section { background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
        .form-row.full { grid-template-columns: 1fr; }
        label { display: block; margin-bottom: 5px; font-weight: 600; color: #3a3d3f; font-size: 13px; }
        input, textarea, select { width: 100%; padding: 10px; border: 1.5px solid #e3ddd0; border-radius: 4px; font-family: inherit; }
        textarea { min-height: 100px; }
        button { padding: 10px 16px; background: #16191c; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px; }
        button:hover { background: #c2461b; }
        button.secondary { background: #e3ddd0; color: #16191c; }
        .item { background: #f7f4ed; padding: 15px; margin-bottom: 10px; border-radius: 4px; }
        .item-header { display: flex; justify-content: space-between; align-items: center; }
        .item-content { margin-top: 10px; }
        .remove-btn { background: #a33; color: white; padding: 6px 12px; font-size: 12px; }
        .buttons { display: flex; gap: 10px; margin-top: 30px; flex-wrap: wrap; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Resume Builder</h1>

        <form id="resume-form">
            <!-- Personal Info -->
            <div class="section">
                <h2>Personal Information</h2>
                
                <div class="form-row full">
                    <div>
                        <label>Resume Title</label>
                        <input type="text" id="resumeTitle" placeholder="e.g., Software Engineer Resume" required>
                    </div>
                </div>

                <div class="form-row">
                    <div>
                        <label>Full Name</label>
                        <input type="text" id="fullName" placeholder="Your name" required>
                    </div>
                    <div>
                        <label>Email</label>
                        <input type="email" id="email" placeholder="your@email.com" required>
                    </div>
                </div>

                <div class="form-row">
                    <div>
                        <label>Phone</label>
                        <input type="tel" id="phone" placeholder="(555) 123-4567">
                    </div>
                    <div>
                        <label>Location</label>
                        <input type="text" id="location" placeholder="City, State">
                    </div>
                </div>

                <div class="form-row full">
                    <div>
                        <label>Professional Summary</label>
                        <textarea id="summary" placeholder="Brief overview of your career..."></textarea>
                    </div>
                </div>
            </div>

            <!-- Experience -->
            <div class="section">
                <h2>Experience</h2>
                <div id="experiencesContainer"></div>
                <button type="button" onclick="addExperience()">+ Add Experience</button>
            </div>

            <!-- Education -->
            <div class="section">
                <h2>Education</h2>
                <div id="educationContainer"></div>
                <button type="button" onclick="addEducation()">+ Add Education</button>
            </div>

            <!-- Skills -->
            <div class="section">
                <h2>Skills</h2>
                <div id="skillsContainer"></div>
                <button type="button" onclick="addSkill()">+ Add Skill</button>
            </div>

            <!-- Action Buttons -->
            <div class="buttons">
                <button type="button" onclick="saveResumeLocally()" class="secondary">Save Locally</button>
                <button type="button" onclick="saveResumeToDatabase()">Save to Database</button>
                <button type="button" onclick="exportResume('json')" class="secondary">Export JSON</button>
            </div>
        </form>
    </div>

    <!-- Database Scripts -->
    <script src="js/database.js"></script>
    <script src="js/db-helpers.js"></script>
    <script src="js/resume-builder-db.js"></script>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Check authentication
            if (!db.isAuthenticated()) {
                window.location.href = 'login.html';
                return;
            }

            // Load existing resume if editing
            loadResumeFromDatabase();

            // Add initial empty experience field
            addExperience();
        });

        // Add experience HTML
        function addExperience() {
            const container = document.getElementById('experiencesContainer');
            const html = `
                <div class="item">
                    <input type="text" placeholder="Job Title" class="exp-title">
                    <input type="text" placeholder="Company" class="exp-company">
                    <input type="text" placeholder="Location" class="exp-location">
                    <input type="text" placeholder="Start Date (e.g., 2020-01)" class="exp-start">
                    <input type="text" placeholder="End Date (e.g., 2023-12 or 'present')" class="exp-end">
                    <textarea placeholder="Job description..." class="exp-desc"></textarea>
                    <button type="button" onclick="removeExperience(this)" class="remove-btn">Remove</button>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        }

        function removeExperience(btn) {
            btn.closest('.item').remove();
        }

        // Similar for education and skills...
    </script>
</body>
</html>
```

## Example 4: Profile Page (profile.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Profile</title>
</head>
<body>
    <div id="user-section"></div>

    <div class="profile-form">
        <h2>My Profile</h2>
        
        <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="profileName">
        </div>

        <div class="form-group">
            <label>Email</label>
            <input type="email" id="profileEmail" readonly>
        </div>

        <div class="form-group">
            <label>Phone</label>
            <input type="tel" id="profilePhone">
        </div>

        <div class="form-group">
            <label>Location</label>
            <input type="text" id="profileLocation">
        </div>

        <div class="form-group">
            <label>Bio</label>
            <textarea id="profileBio"></textarea>
        </div>

        <button onclick="updateProfile()">Update Profile</button>
    </div>

    <!-- Database Scripts -->
    <script src="js/database.js"></script>
    <script src="js/db-helpers.js"></script>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            if (!db.isAuthenticated()) {
                window.location.href = 'login.html';
                return;
            }

            loadProfile();
        });

        function loadProfile() {
            const user = db.currentUser;
            document.getElementById('profileName').value = user.name || '';
            document.getElementById('profileEmail').value = user.email || '';
            document.getElementById('profilePhone').value = user.phone || '';
            document.getElementById('profileLocation').value = user.location || '';
            document.getElementById('profileBio').value = user.bio || '';
        }

        async function updateProfile() {
            const result = await db.updateUserProfile({
                name: document.getElementById('profileName').value,
                phone: document.getElementById('profilePhone').value,
                location: document.getElementById('profileLocation').value,
                bio: document.getElementById('profileBio').value
            });

            if (result.success) {
                showNotification('Profile updated!', 'success');
            } else {
                showNotification(result.error, 'error');
            }
        }
    </script>
</body>
</html>
```

---

**These examples are ready to use!** Copy and paste into your HTML files and customize as needed.
