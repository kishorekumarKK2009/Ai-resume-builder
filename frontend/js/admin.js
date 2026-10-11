import { getAdminResumes } from './api.js';

const container = document.getElementById('resumeTableContainer');

const renderResumes = (resumes) => {
  if (!resumes.length) {
    container.innerHTML = '<p>No resumes found.</p>';
    return;
  }

  const rows = resumes.map((resume) => {
    const created = new Date(resume.createdAt).toLocaleString();
    return `
      <tr>
        <td>${resume._id}</td>
        <td>${resume.title || 'Untitled'}</td>
        <td>${resume.user?.name || 'Unknown'}</td>
        <td>${resume.user?.email || 'Unknown'}</td>
        <td>${resume.profileSummary ? resume.profileSummary.substring(0, 120) : ''}</td>
        <td>${created}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>User</th>
          <th>Email</th>
          <th>Summary</th>
          <th>Created</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

window.onload = async () => {
  const result = await getAdminResumes();
  if (result.message) {
    container.innerHTML = `<p>Error loading resumes: ${result.message}</p>`;
    return;
  }
  renderResumes(result || []);
};
