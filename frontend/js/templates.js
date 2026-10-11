import { getTemplates } from './api.js';

const templateGrid = document.getElementById('templateGrid');

const renderTemplates = (templates) => {
  templateGrid.innerHTML = templates.map(t => `
    <div class="template-card">
      <h2>${t.name}</h2>
      <p>${t.description}</p>
      <button onclick="window.location.href='resume-builder.html'">Use Template</button>
    </div>
  `).join('');
};

window.onload = async () => {
  const result = await getTemplates();
  renderTemplates(result || []);
};
