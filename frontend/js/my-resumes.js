import { getResumes } from './api.js';

const resumesList = document.getElementById('resumesList');

const renderResumes = (resumes) => {
  if (!resumes.length) {
    resumesList.innerHTML = '<p>No resumes found. Create one from the dashboard.</p>';
    return;
  }

  resumesList.innerHTML = resumes.map(resume => `
    <article class="resume-card">
      <h2>${resume.title}</h2>
      <p>${resume.profileSummary || 'No summary provided'}</p>
      <div class="actions">
        <a href="resume-builder.html">Edit</a>
        <a href="#">Download</a>
      </div>
    </article>
  `).join('');
};

window.onload = async () => {
  const result = await getResumes();
  renderResumes(result || []);
};
