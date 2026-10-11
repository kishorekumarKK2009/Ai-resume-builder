const API_BASES = ['http://localhost:8000/api', 'http://localhost:5000/api'];
const STORAGE_KEY = 'resume_builder_data';
const HISTORY_KEY = 'resume_builder_history';
const TEMPLATE_STORAGE_KEY = 'resume_builder_template';
const COLOR_STORAGE_KEY = 'resume_builder_color';

const tags = document.querySelectorAll('.chip');
const input = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const sortSelect = document.getElementById('sortSelect');
const countEl = document.getElementById('resultCount');
const emptyEl = document.getElementById('emptyState');
const resultsEl = document.getElementById('results');

let activeTag = 'all';
let resumes = [];

const normalize = (value) => (value || '').toString().toLowerCase();
const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const request = async (path) => {
  let lastError;
  for (const base of API_BASES) {
    try {
      const response = await fetch(`${base}${path}`);
      if (response.ok) return response.json();
      lastError = new Error(`Request failed with ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('API request failed');
};

const getResumes = () => request('/resumes/');

const readLocalHistory = () => {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return history.map((item) => {
      const personal = item.data?.personal || {};
      const currentWork = currentWorkFromExperience(item.data?.experience || []);
      return {
        id: item.id,
        source: 'local',
        title: item.title || personal.name || 'Untitled Resume',
        role: item.role || personal.title || '',
        currentWork,
        summary: personal.summary || item.data?.experience?.find((exp) => exp.desc)?.desc || '',
        createdAt: item.savedAt,
        status: 'saved',
        data: item.data,
        skills: (item.data?.skills || []).map((skill) => skill.name).filter(Boolean),
        searchText: JSON.stringify(item).toLowerCase(),
      };
    });
  } catch (error) {
    return [];
  }
};

const mapDatabaseResume = (resume) => ({
  id: String(resume.id || resume._id || ''),
  source: 'database',
  title: resume.title || resume.personal?.name || 'Untitled Resume',
  role: resume.personal?.title || '',
  currentWork: resume.current_work || resume.currentWork || currentWorkFromExperience(resume.experience || []),
  summary: resume.profileSummary || resume.personal?.summary || '',
  createdAt: resume.created_at || resume.createdAt || resume.updated_at || resume.updatedAt,
  status: resume.status || 'saved',
  data: resume,
  skills: Array.isArray(resume.skills) ? resume.skills.map((skill) => typeof skill === 'string' ? skill : skill.name).filter(Boolean) : [],
  searchText: JSON.stringify(resume).toLowerCase(),
});

function currentWorkFromExperience(expArray){
  try{
    if(!Array.isArray(expArray) || !expArray.length) return '';
    const ongoing = expArray.find(e => !e.end || /present/i.test(String(e.end)));
    const item = ongoing || expArray[0];
    const role = item.role || '';
    const company = item.company || '';
    const parts = [role, company].filter(Boolean);
    return parts.join(' at ');
  }catch(e){ return ''; }
}

const initials = (title) => {
  const clean = title.trim();
  if (!clean) return 'R';
  return clean.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
};

const formatDate = (value) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return date.toLocaleDateString();
};

const sortItems = (items) => {
  const sorted = [...items];
  const sort = sortSelect.value;
  if (sort === 'match') {
    sorted.sort((a, b) => (parseInt(b.match || '0', 10) || 0) - (parseInt(a.match || '0', 10) || 0));
    return sorted;
  }
  if (sort === 'exp') {
    sorted.sort((a, b) => {
      const aNum = parseInt(a.exp || '0', 10) || 0;
      const bNum = parseInt(b.exp || '0', 10) || 0;
      return bNum - aNum;
    });
    return sorted;
  }
  return sorted;
};

const renderResumeCards = (items) => {
  if (!items.length) {
    resultsEl.innerHTML = '';
    return;
  }

  resultsEl.innerHTML = items.map((resume) => {
    const sourceLabel = resume.source === 'local' ? 'Local save' : 'Database';
    const statusLabel = resume.status === 'draft' ? 'Draft' : 'Saved';
    const skills = resume.skills.slice(0, 6);
    const summary = resume.summary || 'No summary added yet.';
    const action = 'Edit';

    return `
      <article class="r-card">
        <div>
          <div class="r-avatar" style="background:#f2ede6;color:#5a4a3a;">${escapeHtml(initials(resume.title))}</div>
          <div class="r-name">${escapeHtml(resume.title)}</div>
          <div class="r-role">${escapeHtml(resume.role || 'No role added')}</div>
          ${resume.currentWork ? `<div class="r-current">${escapeHtml(resume.currentWork)}</div>` : ''}
          <div class="r-tags">${skills.map((skill) => `<span class="r-tag">${escapeHtml(skill)}</span>`).join('')}</div>
          <div class="r-foot">
            <span class="r-foot-loc">${escapeHtml(sourceLabel)} · ${escapeHtml(statusLabel)}</span>
            <span class="r-match">${escapeHtml(formatDate(resume.createdAt))}</span>
          </div>
          <p class="r-summary">${escapeHtml(summary).slice(0, 220)}</p>
        </div>
        <div class="d-actions">
          <button class="btn-prim" data-action="open" data-id="${escapeHtml(resume.id)}" data-source="${escapeHtml(resume.source)}" type="button">${action}</button>
          <button class="btn-sec" data-action="details" data-id="${escapeHtml(resume.id)}" data-source="${escapeHtml(resume.source)}" type="button">View Details</button>
        </div>
      </article>
    `;
  }).join('');
};

const filterResumes = () => {
  const query = normalize(input.value);
  const filtered = resumes.filter((resume) => {
    const queryMatch = !query || resume.searchText.includes(query);
    if (!queryMatch) return false;
    if (activeTag === 'all') return true;
    if (activeTag === 'local') return resume.source === 'local';
    if (activeTag === 'database') return resume.source === 'database';
    if (activeTag === 'draft' || activeTag === 'drafts') return resume.status === 'draft';
    return true;
  });

  // Remove entries that do not contain a detected current work to show only real work
  const filteredWithWork = filtered.filter(r => r.currentWork && String(r.currentWork).trim().length > 0);

  const sorted = sortItems(filteredWithWork);
  renderResumeCards(sorted);
  countEl.textContent = `${sorted.length} ${sorted.length === 1 ? 'result' : 'results'}`;
  emptyEl.style.display = sorted.length === 0 ? 'block' : 'none';
};

const findResume = (id, source) => resumes.find((resume) => resume.id === id && resume.source === source);

const handleResultAction = (event) => {
  const btn = event.target.closest('[data-action]');
  if (!btn) return;

  const resume = findResume(btn.dataset.id, btn.dataset.source);
  if (!resume) return;

  if (btn.dataset.action === 'open') {
    if (resume.source === 'local') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resume.data));
      if (resume.data?.template) localStorage.setItem(TEMPLATE_STORAGE_KEY, resume.data.template);
      if (resume.data?.color) localStorage.setItem(COLOR_STORAGE_KEY, resume.data.color);
      window.location.href = 'resume-builder.html';
      return;
    }
    window.location.href = `database-resume-editor.html?id=${encodeURIComponent(resume.id)}`;
  }

  if (btn.dataset.action === 'details') {
    window.location.href = `resume-view.html?id=${encodeURIComponent(resume.id)}`;
  }
};

const loadResumes = async () => {
  const localResumes = readLocalHistory();
  let databaseResumes = [];

  try {
    const result = await getResumes();
    databaseResumes = Array.isArray(result) ? result.map(mapDatabaseResume) : [];
  } catch (error) {
    databaseResumes = [];
  }

  resumes = [...localResumes, ...databaseResumes];
  filterResumes();
};

const init = () => {
  tags.forEach((tag) => {
    tag.addEventListener('click', () => {
      tags.forEach((item) => item.classList.remove('active'));
      tag.classList.add('active');
      activeTag = tag.dataset.tag;
      filterResumes();
    });
  });

  input.addEventListener('input', filterResumes);
  searchButton.addEventListener('click', filterResumes);
  sortSelect.addEventListener('change', filterResumes);
  resultsEl.addEventListener('click', handleResultAction);

  resumes = readLocalHistory();
  filterResumes();
  loadResumes();
};

init();

// Expose small compatibility helpers for inline markup or other pages
// (some pages use `setChip(this,'all')` or `doSearch()` inline)
window.setChip = (el, key) => {
  try{
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    if(el && el.classList) el.classList.add('active');
    activeTag = key;
    filterResumes();
  }catch(e){ console.warn('setChip failed', e); }
};

window.doSearch = () => { try{ filterResumes(); }catch(e){ console.warn('doSearch failed', e); } };
