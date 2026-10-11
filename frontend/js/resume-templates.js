// ---- HELPERS ----
function escapeHTML(str){return (str||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderContact(data,sep){sep=sep||' Â· ';return[data.email,data.phone,data.location,data.website].filter(Boolean).map(escapeHTML).join(sep);}
function renderExperience(data){
  return data.experience.filter(exp=>exp.role||exp.company||exp.location||exp.type||exp.dates||exp.bullets?.some(b=>b.trim())).map(exp=>`
    <div class="r-exp">
      <div class="r-exp-head">
        <span class="r-exp-role">${escapeHTML(exp.role)}${exp.company?' — '+escapeHTML(exp.company):''}</span>
        <span class="r-exp-dates">${escapeHTML(exp.dates)}</span>
      </div>
      ${[exp.location, exp.type].filter(Boolean).length?`<p class="r-exp-sub">${[exp.location?escapeHTML(exp.location):'', exp.type?escapeHTML(exp.type):''].filter(Boolean).join(' · ')}</p>`:''}
      <ul class="r-bullets">${(exp.bullets||[]).filter(b=>b.trim()).map(b=>`<li>${escapeHTML(b)}</li>`).join('')}</ul>
    </div>`).join('');
}
function renderEducation(data){
  return data.education.filter(e=>e.degree||e.school||e.location||e.grade||e.notes).map(ed=>`
    <div class="r-edu-item">
      <div class="r-exp-head">
        <span class="r-exp-role">${escapeHTML(ed.degree)}</span>
        <span class="r-exp-dates">${escapeHTML(ed.dates)}</span>
      </div>
      ${[ed.school, ed.location].filter(Boolean).length?`<p class="r-exp-sub">${[ed.school?escapeHTML(ed.school):'', ed.location?escapeHTML(ed.location):''].filter(Boolean).join(' · ')}</p>`:''}
      ${ed.grade?`<p class="r-exp-sub">Grade: ${escapeHTML(ed.grade)}</p>`:''}
      ${ed.notes?`<p class="r-exp-sub">${escapeHTML(ed.notes)}</p>`:''}
    </div>`).join('');
}
function renderProjects(data){
  return data.projects.filter(pr=>pr.name||pr.link||pr.tech||pr.role||pr.desc).map(pr=>`
    <div class="r-exp">
      <div class="r-exp-head">
        <span class="r-exp-role">${escapeHTML(pr.name)}</span>
        <span class="r-exp-dates">${escapeHTML(pr.role)}</span>
      </div>
      ${pr.link?`<p class="r-exp-sub">${escapeHTML(pr.link)}</p>`:''}
      ${pr.tech?`<p class="r-exp-sub">${escapeHTML(pr.tech)}</p>`:''}
      ${pr.desc?`<p class="r-exp-sub">${escapeHTML(pr.desc)}</p>`:''}
    </div>`).join('');
}
function renderSkillTags(data){return data.skills.filter(s=>s.trim()).map(s=>`<span class="r-skill">${escapeHTML(s)}</span>`).join('');}

function renderWithProjects(renderer){
  return function(data){
    const html = renderer(data);
    const projects = renderProjects(data);
    if(!projects) return html;
    const skillsSection = /<section[^>]*>\s*<h2[^>]*>\s*Skills\s*<\/h2>/i;
    if(skillsSection.test(html)){
      return html.replace(skillsSection, `<section class="r-section"><h2 class="r-section-title">Projects</h2>${projects}</section>$&`);
    }
    return html + `<section class="r-section"><h2 class="r-section-title">Projects</h2>${projects}</section>`;
  };
}

// ---- TEMPLATE RENDERS ----
function renderLedger(d){return `
  <div class="r-header">
    <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
    <p class="r-title">${escapeHTML(d.jobTitle)}</p>
    <p class="r-contact">${renderContact(d)}</p>
  </div>
  <hr class="r-rule">
  <div class="r-columns">
    <div class="r-main">
      <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
      <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
    </div>
    <div class="r-side">
      <section class="r-section"><h2 class="r-section-title">Summary</h2><p>${escapeHTML(d.summary)}</p></section>
      <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>
    </div>
  </div>`;}

function renderStudio(d){return `
  <div class="r-band">
    <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
    <p class="r-title">${escapeHTML(d.jobTitle)}</p>
    <p class="r-contact">${renderContact(d)}</p>
  </div>
  <div class="r-body">
    <p class="r-summary">${escapeHTML(d.summary)}</p>
    <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
    <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
    <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>
  </div>`;}

function renderFieldNotes(d){
  const skills=d.skills.filter(s=>s.trim()); const cols=[[],[],[]]; skills.forEach((s,i)=>cols[i%3].push(escapeHTML(s)));
  return `
  <div class="r-header">
    <div><h1 class="r-name">${escapeHTML(d.fullName)}</h1><p class="r-title">${escapeHTML(d.jobTitle)}</p></div>
    <div class="r-contact">${[d.email,d.phone,d.location,d.website].filter(Boolean).map(escapeHTML).join('<br>')}</div>
  </div>
  <section class="r-section"><h2 class="r-section-title">Summary</h2><p style="font-size:.88rem;margin:0;">${escapeHTML(d.summary)}</p></section>
  <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills-grid">${cols.map(c=>`<div class="r-skill-list">${c.join('<br>')}</div>`).join('')}</div></section>
  <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>`;}

function renderEclipse(d){return `
  <div class="r-header-top">
    <div><h1 class="r-name">${escapeHTML(d.fullName)}</h1><p class="r-title">${escapeHTML(d.jobTitle)}</p></div>
    <div class="r-contact">${[d.email,d.phone,d.location].filter(Boolean).map(escapeHTML).join('<br>')}</div>
  </div>
  <hr class="r-rule">
  <div class="r-columns">
    <div class="r-main">
      <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
      <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
    </div>
    <div class="r-side">
      <section class="r-section"><h2 class="r-section-title">Summary</h2><p>${escapeHTML(d.summary)}</p></section>
      <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>
    </div>
  </div>`;}

function renderCardinal(d){return `
  <div class="r-stripe"></div>
  <div class="r-wrap">
    <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
    <p class="r-title">${escapeHTML(d.jobTitle)}</p>
    <p class="r-contact">${renderContact(d)}</p>
    <div class="r-columns">
      <div class="r-main">
        <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
        <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
      </div>
      <div class="r-side">
        <section class="r-section"><h2 class="r-section-title">Summary</h2><p style="font-size:.84rem;color:#6B7178;line-height:1.6;margin:0;">${escapeHTML(d.summary)}</p></section>
        <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>
      </div>
    </div>
  </div>`;}

function renderTypewriter(d){return `
  <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
  <p class="r-title">${escapeHTML(d.jobTitle)}</p>
  <p class="r-contact">${renderContact(d)}</p>
  <section class="r-section"><h2 class="r-section-title">Summary</h2><p style="font-size:.86rem;line-height:1.65;margin:0;">${escapeHTML(d.summary)}</p></section>
  <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>`;}

function renderAtlas(d){return `
  <div class="r-sidebar">
    <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
    <p class="r-title">${escapeHTML(d.jobTitle)}</p>
    <div class="r-section-title">Contact</div>
    ${[d.email,d.phone,d.location,d.website].filter(Boolean).map(x=>`<div class="r-contact-item">${escapeHTML(x)}</div>`).join('')}
    <div class="r-section-title">Summary</div>
    <p>${escapeHTML(d.summary)}</p>
    <div class="r-section-title">Skills</div>
    ${d.skills.filter(s=>s.trim()).map(s=>`<span class="r-skill">${escapeHTML(s)}</span>`).join('')}
  </div>
  <div class="r-main-col">
    <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
    <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
  </div>`;}

function renderMemo(d){return `
  <div class="r-top">
    <p class="r-from-line">Candidate record</p>
    <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
    <p style="font-family:'IBM Plex Mono',monospace;font-size:.75rem;color:#6B7178;margin:0;">${escapeHTML(d.jobTitle)}</p>
    <div class="r-meta">
      ${d.email?`<div class="r-meta-item"><span class="r-meta-label">Email</span>${escapeHTML(d.email)}</div>`:''}
      ${d.phone?`<div class="r-meta-item"><span class="r-meta-label">Phone</span>${escapeHTML(d.phone)}</div>`:''}
      ${d.location?`<div class="r-meta-item"><span class="r-meta-label">Location</span>${escapeHTML(d.location)}</div>`:''}
    </div>
  </div>
  <section class="r-section"><h2 class="r-section-title">Summary</h2><p style="font-size:.88rem;line-height:1.65;margin:0;">${escapeHTML(d.summary)}</p></section>
  <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>`;}

function renderPrism(d){return `
  <div class="r-top">
    <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
    <p class="r-title">${escapeHTML(d.jobTitle)}</p>
    <p class="r-contact">${renderContact(d)}</p>
  </div>
  <div class="r-accent-bar"></div>
  <div class="r-body">
    <p class="r-summary">${escapeHTML(d.summary)}</p>
    <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
    <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
    <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>
  </div>`;}

function renderBlueprint(d){return `
  <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
  <p class="r-title">${escapeHTML(d.jobTitle)}</p>
  <p class="r-contact">${renderContact(d)}</p>
  <hr class="r-rule">
  <section class="r-section"><h2 class="r-section-title">Summary</h2><p style="font-size:.88rem;line-height:1.65;margin:0;">${escapeHTML(d.summary)}</p></section>
  <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>`;}

function renderLinen(d){return `
  <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
  <p class="r-tagline">${escapeHTML(d.jobTitle)}</p>
  <p class="r-contact">${renderContact(d)}</p>
  <section class="r-section"><h2 class="r-section-title">Profile</h2><p style="font-size:.9rem;line-height:1.7;color:#5A5A5A;margin:0;">${escapeHTML(d.summary)}</p></section>
  <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>`;}

function renderNeon(d){return `
  <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
  <p class="r-title">${escapeHTML(d.jobTitle)}</p>
  <p class="r-contact">${renderContact(d)}</p>
  <p class="r-summary">${escapeHTML(d.summary)}</p>
  <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>`;}

function renderHerald(d){return `
  <div class="r-masthead">
    <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
    <p class="r-title">${escapeHTML(d.jobTitle)}</p>
  </div>
  <p class="r-contact">${renderContact(d)}</p>
  <p style="font-size:.88rem;line-height:1.65;color:#4A4A4A;margin:0 0 20px;font-family:'Libre Baskerville',serif;">${escapeHTML(d.summary)}</p>
  <div class="r-columns">
    <div>
      <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
    </div>
    <div>
      <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
      <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>
    </div>
  </div>`;}

function renderCopper(d){return `
  <div class="r-header">
    <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
    <p class="r-title">${escapeHTML(d.jobTitle)}</p>
    <p class="r-contact">${renderContact(d)}</p>
  </div>
  <div class="r-body">
    <p class="r-summary">${escapeHTML(d.summary)}</p>
    <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
    <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
    <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>
  </div>`;}

function renderIvory(d){return `
  <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
  <p class="r-degrees">${escapeHTML(d.jobTitle)}</p>
  <p class="r-contact">${renderContact(d)}</p>
  <section class="r-section"><h2 class="r-section-title">Profile</h2><p style="font-size:.88rem;line-height:1.65;margin:0;">${escapeHTML(d.summary)}</p></section>
  <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>`;}

function renderSlate(d){return `
  <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
  <p class="r-title">${escapeHTML(d.jobTitle)}</p>
  <div class="r-contact">${[d.email,d.phone,d.location,d.website].filter(Boolean).map(escapeHTML).join('<span style="color:#D0D0D0;margin:0 8px;">|</span>')}</div>
  <section class="r-section"><h2 class="r-section-title">Summary</h2><p style="font-size:.88rem;line-height:1.65;margin:0;">${escapeHTML(d.summary)}</p></section>
  <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>`;}

function renderGilded(d){return `
  <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
  <p class="r-title">${escapeHTML(d.jobTitle)}</p>
  <p class="r-contact">${renderContact(d)}</p>
  <hr class="r-rule">
  <p class="r-summary">${escapeHTML(d.summary)}</p>
  <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
  <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>`;}

function renderGridMod(d){return `
  <div class="r-header">
    <div class="r-name-box">
      <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
      <p class="r-title">${escapeHTML(d.jobTitle)}</p>
    </div>
    <div class="r-contact-box">
      ${[d.email,d.phone,d.location,d.website].filter(Boolean).map(x=>`<span class="r-contact-item">${escapeHTML(x)}</span>`).join('')}
    </div>
  </div>
  <div class="r-body">
    <div class="r-col">
      <section class="r-section"><h2 class="r-section-title">Summary</h2><p style="font-size:.88rem;line-height:1.65;margin:0;">${escapeHTML(d.summary)}</p></section>
      <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
    </div>
    <div class="r-col">
      <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
      <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>
    </div>
  </div>`;}

function renderTerra(d){return `
  <div class="r-top">
    <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
    <p class="r-title">${escapeHTML(d.jobTitle)}</p>
    <p class="r-contact">${renderContact(d)}</p>
  </div>
  <div class="r-stripe"></div>
  <div class="r-body">
    <p class="r-summary">${escapeHTML(d.summary)}</p>
    <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
    <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
    <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>
  </div>`;}

function renderWave(d){return `
  <div class="r-top">
    <h1 class="r-name">${escapeHTML(d.fullName)}</h1>
    <p class="r-title">${escapeHTML(d.jobTitle)}</p>
    <p class="r-contact">${renderContact(d)}</p>
  </div>
  <div class="r-body">
    <p class="r-summary">${escapeHTML(d.summary)}</p>
    <section class="r-section"><h2 class="r-section-title">Experience</h2>${renderExperience(d)}</section>
    <section class="r-section"><h2 class="r-section-title">Education</h2>${renderEducation(d)}</section>
    <section class="r-section"><h2 class="r-section-title">Skills</h2><div class="r-skills">${renderSkillTags(d)}</div></section>
  </div>`;}

const TEMPLATES={
  ledger:{render:renderWithProjects(renderLedger)}, studio:{render:renderWithProjects(renderStudio)}, fieldnotes:{render:renderWithProjects(renderFieldNotes)},
  eclipse:{render:renderWithProjects(renderEclipse)}, cardinal:{render:renderWithProjects(renderCardinal)}, typewriter:{render:renderWithProjects(renderTypewriter)},
  atlas:{render:renderWithProjects(renderAtlas)}, memo:{render:renderWithProjects(renderMemo)}, prism:{render:renderWithProjects(renderPrism)},
  blueprint:{render:renderWithProjects(renderBlueprint)}, linen:{render:renderWithProjects(renderLinen)}, neon:{render:renderWithProjects(renderNeon)},
  herald:{render:renderWithProjects(renderHerald)}, copper:{render:renderWithProjects(renderCopper)}, ivory:{render:renderWithProjects(renderIvory)},
  slate:{render:renderWithProjects(renderSlate)}, gilded:{render:renderWithProjects(renderGilded)}, 'grid-mod':{render:renderWithProjects(renderGridMod)},
  terra:{render:renderWithProjects(renderTerra)}, wave:{render:renderWithProjects(renderWave)}
};
window.TEMPLATES = TEMPLATES;


