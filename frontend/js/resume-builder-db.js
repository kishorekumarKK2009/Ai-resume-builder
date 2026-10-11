/**
 * Resume Builder Integration
 * Handles resume creation and saving to database
 */

/**
 * Save resume to database
 */
async function saveResumeToDatabase() {
  if (!checkAuthentication()) return;

  try {
    // Get form data
    const resumeData = {
      title: document.getElementById('resumeTitle')?.value || 'My Resume',
      full_name: document.getElementById('fullName')?.value || '',
      email: document.getElementById('email')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      location: document.getElementById('location')?.value || '',
      professional_summary: document.getElementById('summary')?.value || '',
      template: localStorage.getItem('selected_template') || 'default',
      experiences: getExperiencesFromForm(),
      education: getEducationFromForm(),
      skills: getSkillsFromForm()
    };

    const resumeId = new URLSearchParams(window.location.search).get('id');

    let result;
    if (resumeId) {
      result = await db.updateResume(resumeId, resumeData);
    } else {
      result = await db.createResume(resumeData);
    }

    if (result.success) {
      showNotification('Resume saved successfully!', 'success');
      if (!resumeId) {
        localStorage.setItem('current_resume_id', result.data.id);
      }
      return result.data;
    } else {
      showNotification(result.error, 'error');
    }
  } catch (error) {
    showNotification(db.formatError(error), 'error');
  }
}

/**
 * Save resume locally (temporary)
 */
function saveResumeLocally() {
  const resumeData = {
    title: document.getElementById('resumeTitle')?.value || 'My Resume',
    full_name: document.getElementById('fullName')?.value || '',
    email: document.getElementById('email')?.value || '',
    phone: document.getElementById('phone')?.value || '',
    location: document.getElementById('location')?.value || '',
    professional_summary: document.getElementById('summary')?.value || '',
    experiences: getExperiencesFromForm(),
    education: getEducationFromForm(),
    skills: getSkillsFromForm(),
    savedAt: new Date().toISOString()
  };

  db.saveResumeLocally(resumeData);
  showNotification('Resume saved locally', 'success');
}

/**
 * Load existing resume from database
 */
async function loadResumeFromDatabase() {
  const resumeId = new URLSearchParams(window.location.search).get('id');
  if (!resumeId) return;

  try {
    const result = await db.getResume(resumeId);
    if (result.success) {
      populateResumeForm(result.data);
    } else {
      showNotification(result.error, 'error');
    }
  } catch (error) {
    showNotification(db.formatError(error), 'error');
  }
}

/**
 * Load resume from local storage
 */
function loadResumeLocally() {
  const resume = db.loadResumeLocally();
  if (resume) {
    populateResumeForm(resume);
  }
}

/**
 * Populate form with resume data
 */
function populateResumeForm(resumeData) {
  if (resumeData.title) document.getElementById('resumeTitle').value = resumeData.title;
  if (resumeData.full_name) document.getElementById('fullName').value = resumeData.full_name;
  if (resumeData.email) document.getElementById('email').value = resumeData.email;
  if (resumeData.phone) document.getElementById('phone').value = resumeData.phone;
  if (resumeData.location) document.getElementById('location').value = resumeData.location;
  if (resumeData.professional_summary) document.getElementById('summary').value = resumeData.professional_summary;

  // Populate experiences
  if (resumeData.experiences && resumeData.experiences.length > 0) {
    const container = document.getElementById('experiencesContainer');
    if (container) {
      container.innerHTML = resumeData.experiences.map((exp, i) => `
        <div class="experience-item">
          <input type="text" placeholder="Job Title" value="${exp.title || ''}" class="exp-title">
          <input type="text" placeholder="Company" value="${exp.company || ''}" class="exp-company">
          <input type="text" placeholder="Location" value="${exp.location || ''}" class="exp-location">
          <input type="text" placeholder="Start Date" value="${exp.start_date || ''}" class="exp-start">
          <input type="text" placeholder="End Date" value="${exp.end_date || ''}" class="exp-end">
          <textarea placeholder="Description" class="exp-desc">${exp.description || ''}</textarea>
          <button onclick="removeExperience(this)" type="button">Remove</button>
        </div>
      `).join('');
    }
  }

  // Populate education
  if (resumeData.education && resumeData.education.length > 0) {
    const container = document.getElementById('educationContainer');
    if (container) {
      container.innerHTML = resumeData.education.map((edu, i) => `
        <div class="education-item">
          <input type="text" placeholder="School" value="${edu.school || ''}" class="edu-school">
          <input type="text" placeholder="Degree" value="${edu.degree || ''}" class="edu-degree">
          <input type="text" placeholder="Field" value="${edu.field || ''}" class="edu-field">
          <input type="text" placeholder="Start Date" value="${edu.start_date || ''}" class="edu-start">
          <input type="text" placeholder="End Date" value="${edu.end_date || ''}" class="edu-end">
          <button onclick="removeEducation(this)" type="button">Remove</button>
        </div>
      `).join('');
    }
  }

  // Populate skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    const container = document.getElementById('skillsContainer');
    if (container) {
      container.innerHTML = resumeData.skills.map((skill, i) => `
        <div class="skill-item">
          <input type="text" placeholder="Skill" value="${skill.name || ''}" class="skill-name">
          <select class="skill-level">
            <option value="">Select Level</option>
            <option value="Beginner" ${skill.level === 'Beginner' ? 'selected' : ''}>Beginner</option>
            <option value="Intermediate" ${skill.level === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
            <option value="Advanced" ${skill.level === 'Advanced' ? 'selected' : ''}>Advanced</option>
            <option value="Expert" ${skill.level === 'Expert' ? 'selected' : ''}>Expert</option>
          </select>
          <button onclick="removeSkill(this)" type="button">Remove</button>
        </div>
      `).join('');
    }
  }
}

/**
 * Get experiences from form
 */
function getExperiencesFromForm() {
  const items = [];
  const container = document.getElementById('experiencesContainer');
  if (container) {
    container.querySelectorAll('.experience-item').forEach(item => {
      items.push({
        title: item.querySelector('.exp-title')?.value || '',
        company: item.querySelector('.exp-company')?.value || '',
        location: item.querySelector('.exp-location')?.value || '',
        start_date: item.querySelector('.exp-start')?.value || '',
        end_date: item.querySelector('.exp-end')?.value || '',
        description: item.querySelector('.exp-desc')?.value || ''
      });
    });
  }
  return items;
}

/**
 * Get education from form
 */
function getEducationFromForm() {
  const items = [];
  const container = document.getElementById('educationContainer');
  if (container) {
    container.querySelectorAll('.education-item').forEach(item => {
      items.push({
        school: item.querySelector('.edu-school')?.value || '',
        degree: item.querySelector('.edu-degree')?.value || '',
        field: item.querySelector('.edu-field')?.value || '',
        start_date: item.querySelector('.edu-start')?.value || '',
        end_date: item.querySelector('.edu-end')?.value || ''
      });
    });
  }
  return items;
}

/**
 * Get skills from form
 */
function getSkillsFromForm() {
  const items = [];
  const container = document.getElementById('skillsContainer');
  if (container) {
    container.querySelectorAll('.skill-item').forEach(item => {
      items.push({
        name: item.querySelector('.skill-name')?.value || '',
        level: item.querySelector('.skill-level')?.value || ''
      });
    });
  }
  return items;
}

/**
 * Add new experience
 */
function addExperience() {
  const container = document.getElementById('experiencesContainer');
  if (container) {
    const html = `
      <div class="experience-item">
        <input type="text" placeholder="Job Title" class="exp-title">
        <input type="text" placeholder="Company" class="exp-company">
        <input type="text" placeholder="Location" class="exp-location">
        <input type="text" placeholder="Start Date" class="exp-start">
        <input type="text" placeholder="End Date" class="exp-end">
        <textarea placeholder="Description" class="exp-desc"></textarea>
        <button onclick="removeExperience(this)" type="button">Remove</button>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  }
}

/**
 * Remove experience
 */
function removeExperience(element) {
  element.closest('.experience-item').remove();
}

/**
 * Add new education
 */
function addEducation() {
  const container = document.getElementById('educationContainer');
  if (container) {
    const html = `
      <div class="education-item">
        <input type="text" placeholder="School" class="edu-school">
        <input type="text" placeholder="Degree" class="edu-degree">
        <input type="text" placeholder="Field" class="edu-field">
        <input type="text" placeholder="Start Date" class="edu-start">
        <input type="text" placeholder="End Date" class="edu-end">
        <button onclick="removeEducation(this)" type="button">Remove</button>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  }
}

/**
 * Remove education
 */
function removeEducation(element) {
  element.closest('.education-item').remove();
}

/**
 * Add new skill
 */
function addSkill() {
  const container = document.getElementById('skillsContainer');
  if (container) {
    const html = `
      <div class="skill-item">
        <input type="text" placeholder="Skill" class="skill-name">
        <select class="skill-level">
          <option value="">Select Level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Expert">Expert</option>
        </select>
        <button onclick="removeSkill(this)" type="button">Remove</button>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
  }
}

/**
 * Remove skill
 */
function removeSkill(element) {
  element.closest('.skill-item').remove();
}

/**
 * Export resume as PDF/JSON
 */
function exportResume(format = 'json') {
  const resumeData = {
    title: document.getElementById('resumeTitle')?.value || 'My Resume',
    full_name: document.getElementById('fullName')?.value || '',
    email: document.getElementById('email')?.value || '',
    phone: document.getElementById('phone')?.value || '',
    location: document.getElementById('location')?.value || '',
    professional_summary: document.getElementById('summary')?.value || '',
    experiences: getExperiencesFromForm(),
    education: getEducationFromForm(),
    skills: getSkillsFromForm(),
    exported_at: new Date().toISOString()
  };

  if (format === 'json') {
    const dataStr = JSON.stringify(resumeData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `resume_${Date.now()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  showNotification('Resume exported!', 'success');
}

// Initialize resume builder on page load
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('resume-builder')) {
    checkAuthentication();
    loadResumeFromDatabase();
  }
});
