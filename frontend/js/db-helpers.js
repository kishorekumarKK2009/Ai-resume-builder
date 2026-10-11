/**
 * Database Helper Functions
 * Ready-to-use functions for common database operations
 */

/**
 * Show notification/toast message
 */
function showNotification(message, type = 'info') {
  // Create or get existing toast element
  let toast = document.getElementById('db-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'db-notification';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 20px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      max-width: 400px;
    `;
    document.body.appendChild(toast);
  }

  // Set colors based on type
  const colors = {
    success: '#1b8a6b',
    error: '#a33',
    info: '#16191c',
    warning: '#c2461b'
  };

  toast.textContent = message;
  toast.style.background = colors[type] || colors.info;
  toast.style.color = 'white';
  toast.style.display = 'block';

  // Auto-hide after 3 seconds
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

/**
 * Handle authentication
 */
async function handleAuth(email, password, isLogin = true) {
  try {
    let result;
    if (isLogin) {
      result = await db.loginUser(email, password);
    } else {
      result = await db.registerUser({
        email,
        password,
        name: email.split('@')[0],
        username: email.split('@')[0]
      });
    }

    if (result.success) {
      showNotification(`${isLogin ? 'Logged in' : 'Registered'} successfully!`, 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 500);
    } else {
      showNotification(result.error, 'error');
    }
  } catch (error) {
    showNotification(db.formatError(error), 'error');
  }
}

/**
 * Load and display user resumes
 */
async function loadUserResumes(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    container.innerHTML = '<p>Loading resumes...</p>';
    const result = await db.getUserResumes();

    if (!result.success) {
      container.innerHTML = `<p>Error: ${result.error}</p>`;
      return;
    }

    const resumes = result.data || [];
    if (resumes.length === 0) {
      container.innerHTML = '<p>No resumes found. Create one to get started!</p>';
      return;
    }

    container.innerHTML = resumes.map(resume => `
      <div class="resume-card" style="
        padding: 16px;
        border: 1.5px solid #e3ddd0;
        border-radius: 4px;
        margin-bottom: 12px;
        cursor: pointer;
      " onclick="viewResume('${resume.id}')">
        <h3 style="margin: 0 0 8px 0; font-size: 16px;">${escapeHtml(resume.title)}</h3>
        <p style="margin: 0; color: #8b8478; font-size: 13px;">
          Created: ${new Date(resume.created_at).toLocaleDateString()}
        </p>
        <button onclick="event.stopPropagation(); editResume('${resume.id}')" style="
          margin-top: 10px;
          padding: 8px 12px;
          background: #c2461b;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
        ">Edit</button>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = `<p>Error loading resumes: ${error.message}</p>`;
  }
}

/**
 * Load and display templates
 */
async function loadTemplates(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    container.innerHTML = '<p>Loading templates...</p>';
    const result = await db.getTemplates();

    if (!result.success) {
      container.innerHTML = `<p>Error: ${result.error}</p>`;
      return;
    }

    const templates = result.data || [];
    if (templates.length === 0) {
      container.innerHTML = '<p>No templates available.</p>';
      return;
    }

    container.innerHTML = templates.map(template => `
      <div class="template-card" style="
        padding: 16px;
        border: 1.5px solid #e3ddd0;
        border-radius: 4px;
        margin-bottom: 12px;
      ">
        <h3 style="margin: 0 0 8px 0; font-size: 16px;">${escapeHtml(template.name)}</h3>
        <p style="margin: 0 0 10px 0; color: #8b8478; font-size: 13px;">
          ${escapeHtml(template.description || 'No description')}
        </p>
        <button onclick="useTemplate('${template.id}')" style="
          padding: 8px 12px;
          background: #16191c;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
        ">Use Template</button>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = `<p>Error loading templates: ${error.message}</p>`;
  }
}

/**
 * Create new resume
 */
async function createNewResume(resumeData) {
  try {
    const result = await db.createResume(resumeData);
    if (result.success) {
      showNotification('Resume created successfully!', 'success');
      return result.data;
    } else {
      showNotification(result.error, 'error');
      return null;
    }
  } catch (error) {
    showNotification(db.formatError(error), 'error');
    return null;
  }
}

/**
 * Update resume
 */
async function updateResumeData(resumeId, resumeData) {
  try {
    const result = await db.updateResume(resumeId, resumeData);
    if (result.success) {
      showNotification('Resume updated successfully!', 'success');
      return result.data;
    } else {
      showNotification(result.error, 'error');
      return null;
    }
  } catch (error) {
    showNotification(db.formatError(error), 'error');
    return null;
  }
}

/**
 * Delete resume
 */
async function deleteResumeData(resumeId) {
  if (!confirm('Are you sure you want to delete this resume?')) return;

  try {
    const result = await db.deleteResume(resumeId);
    if (result.success) {
      showNotification(result.message, 'success');
      return true;
    } else {
      showNotification(result.error, 'error');
      return false;
    }
  } catch (error) {
    showNotification(db.formatError(error), 'error');
    return false;
  }
}

/**
 * View resume details
 */
async function viewResume(resumeId) {
  try {
    const result = await db.getResume(resumeId);
    if (result.success) {
      localStorage.setItem('current_resume', JSON.stringify(result.data));
      window.location.href = 'resume-view.html?id=' + resumeId;
    } else {
      showNotification(result.error, 'error');
    }
  } catch (error) {
    showNotification(db.formatError(error), 'error');
  }
}

/**
 * Edit resume
 */
async function editResume(resumeId) {
  try {
    const result = await db.getResume(resumeId);
    if (result.success) {
      localStorage.setItem('current_resume', JSON.stringify(result.data));
      window.location.href = 'resume-builder.html?id=' + resumeId;
    } else {
      showNotification(result.error, 'error');
    }
  } catch (error) {
    showNotification(db.formatError(error), 'error');
  }
}

/**
 * Use template
 */
function useTemplate(templateId) {
  localStorage.setItem('selected_template', templateId);
  window.location.href = 'resume-builder.html?template=' + templateId;
}

/**
 * Publish resume
 */
async function publishResume(resumeId) {
  try {
    const result = await db.publishResume(resumeId);
    if (result.success) {
      showNotification('Resume published!', 'success');
      return true;
    } else {
      showNotification(result.error, 'error');
      return false;
    }
  } catch (error) {
    showNotification(db.formatError(error), 'error');
    return false;
  }
}

/**
 * Unpublish resume
 */
async function unpublishResume(resumeId) {
  try {
    const result = await db.unpublishResume(resumeId);
    if (result.success) {
      showNotification('Resume unpublished!', 'success');
      return true;
    } else {
      showNotification(result.error, 'error');
      return false;
    }
  } catch (error) {
    showNotification(db.formatError(error), 'error');
    return false;
  }
}

/**
 * Check authentication status
 */
function checkAuthentication() {
  if (!db.isAuthenticated()) {
    showNotification('Please log in first', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
    return false;
  }
  return true;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Initialize authentication UI
 */
function initAuthUI() {
  const userSection = document.getElementById('user-section');
  const authSection = document.getElementById('auth-section');

  if (!userSection && !authSection) return;

  if (db.isAuthenticated()) {
    if (userSection) {
      userSection.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 13px;">Welcome, ${escapeHtml(db.currentUser.name)}</span>
          <button onclick="logoutUser()" style="
            padding: 8px 12px;
            background: #a33;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 12px;
          ">Logout</button>
        </div>
      `;
      userSection.style.display = 'block';
    }
    if (authSection) {
      authSection.style.display = 'none';
    }
  } else {
    if (userSection) {
      userSection.style.display = 'none';
    }
    if (authSection) {
      authSection.style.display = 'block';
    }
  }
}

/**
 * Logout user
 */
function logoutUser() {
  if (confirm('Are you sure you want to log out?')) {
    db.logout();
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 500);
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();
});
