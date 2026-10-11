import { createResume, generateAIDraft } from './api.js';

document.getElementById('resumeForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = document.getElementById('title').value;
  const profileSummary = document.getElementById('profileSummary').value;
  const result = await createResume({ title, profileSummary, skills: [], experience: [], education: [] });
  if (result._id) {
    // Redirect to success page with resume name as parameter
    const encodedTitle = encodeURIComponent(title || 'Untitled Resume');
    window.location.href = `save-success.html?name=${encodedTitle}`;
  } else {
    alert(result.message || 'Save failed');
  }
});

window.generateDraft = async () => {
  const prompt = document.getElementById('profileSummary').value;
  const result = await generateAIDraft(prompt);
  if (result.draft) {
    document.getElementById('profileSummary').value = result.draft;
  }
};
