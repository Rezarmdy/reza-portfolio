const grid = document.getElementById('projects');
const more = document.getElementById('more');
const dialog = document.getElementById('project-dialog');
let settings, projects = [], filter = 'All', expanded = false, lastFocus;
const iconPaths = {
  email: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  whatsapp: '<path d="M20.5 11.7a8.5 8.5 0 0 1-12.7 7.4L3 20.5l1.4-4.6A8.5 8.5 0 1 1 20.5 11.7Z"/><path d="M8.5 7.5c-.9.5-.9 1.8-.2 3.2.9 1.8 2.7 3.5 4.5 4.2 1.4.6 2.7.3 3.2-.6l-2.6-1.7-1.2 1c-1.4-.6-2.6-1.9-3.1-3.1l1-1.1-1.6-1.9Z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>',
  tiktok: '<path d="M14 3v12a4 4 0 1 1-4-4h1M14 3c0 3 2.2 5 5.5 5v3c-2.1 0-4-.8-5.5-2"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.5 10v7M11.5 17v-7m0 3a3 3 0 0 1 6 0v4"/><circle cx="7.5" cy="7" r=".9" fill="currentColor" stroke="none"/>'
};
function icon(name) {
  const holder = document.createElement('span');
  holder.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (iconPaths[name] || iconPaths.email) + '</svg>';
  return holder;
}
function text(tag, value, className) {
  const el = document.createElement(tag); el.textContent = value || '';
  if (className) el.className = className;
  return el;
}
function safeUrl(value, media = false) {
  try {
    const url = new URL(value || '', location.origin);
    const protocols = media ? ['http:', 'https:'] : ['http:', 'https:', 'mailto:'];
    return protocols.includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}
function appendTags(target, tags) {
  target.replaceChildren(...(tags || []).map(tag => text('span', tag)));
}
function applySettings(s) {
  document.title = s.seo.title;
  document.querySelector('meta[name="description"]').content = s.seo.description;
  document.querySelectorAll('[data-bind]').forEach(el => {
    const value = el.dataset.bind.split('.').reduce((item, key) => item?.[key], s);
    if (typeof value === 'string') el.textContent = value;
  });
  document.querySelectorAll('[data-cv]').forEach(el => el.href = safeUrl(s.cv.file, true));
  for (const [id, photo, alt] of [['hero-photo', s.hero.photo, s.hero.photoAlt], ['about-photo', s.about.photo, s.about.photoAlt]]) {
    const el = document.getElementById(id); el.src = safeUrl(photo, true); el.alt = alt;
  }
  document.getElementById('about-paragraphs').replaceChildren(...s.about.paragraphs.map(p => text('p', p)));
  const toolGrid = document.getElementById('design-tools'); toolGrid.replaceChildren();
  for (const tool of s.designTools || []) {
    const el = document.createElement('div'); el.className = 'tool';
    const img = document.createElement('img'); img.src = safeUrl(tool.logo, true); img.alt = ''; img.width = 44; img.height = 44;
    el.append(img, text('span', tool.name)); toolGrid.append(el);
  }
  appendTags(document.getElementById('core-skills'), s.coreSkills);
  appendTags(document.getElementById('soft-skills'), s.softSkills);
  const ai = document.getElementById('ai-tools'); ai.replaceChildren();
  for (const group of s.aiGroups || []) {
    const el = document.createElement('div'); el.className = 'ai-row';
    const tags = document.createElement('div'); tags.className = 'skills'; appendTags(tags, group.tags);
    el.append(text('p', group.title), tags); ai.append(el);
  }
  const languages = document.getElementById('languages'); languages.replaceChildren();
  const levels = {Beginner:1, Working:2, Professional:3, Native:4};
  for (const language of s.languages || []) {
    const el = document.createElement('div'); el.className = 'language';
    const label = document.createElement('div'); label.className = 'language-label';
    label.append(text('span', language.name), text('span', language.level));
    const bar = document.createElement('div'); bar.className = 'language-bar'; bar.setAttribute('role','meter');
    bar.setAttribute('aria-label', language.name + ' proficiency'); bar.setAttribute('aria-valuemin','1'); bar.setAttribute('aria-valuemax','4');
    bar.setAttribute('aria-valuenow', levels[language.level] || 1); bar.setAttribute('aria-valuetext', language.level);
    const fill = document.createElement('div'); fill.className = 'language-fill'; fill.style.setProperty('--level', ((levels[language.level] || 1) * 25) + '%');
    bar.append(fill); el.append(label,bar); languages.append(el);
  }
  document.getElementById('email-link').href = 'mailto:' + encodeURIComponent(s.contact.email);
  document.getElementById('whatsapp-link').href = 'https://wa.me/' + s.contact.whatsappNumber.replace(/\D/g,'');
  const socials = document.getElementById('social-links'); socials.replaceChildren();
  for (const social of s.contact.socials || []) {
    const link = document.createElement('a'); link.href = safeUrl(social.url); link.target = '_blank'; link.rel = 'noopener noreferrer';
    const label = text('span', social.label); label.append(text('small',social.handle));
    link.append(icon(social.icon), label); socials.append(link);
  }
  document.querySelectorAll('[data-icon]').forEach(el => el.replaceChildren(icon(el.dataset.icon)));
}
function selectedProjects() {
  const featured = projects.filter(p => p.featured);
  return expanded || filter !== 'All' ? projects : (featured.length ? featured : projects.slice(0,6));
}
function render() {
  grid.replaceChildren();
  const visible = selectedProjects().filter(p => filter === 'All' || p.category === filter);
  for (const p of visible) {
    const button = document.createElement('button'); button.className = 'project reveal'; button.dataset.project = p.id;
    button.setAttribute('aria-label', settings.labels.viewProject + ': ' + p.title);
    const media = document.createElement('div'); media.className = 'project-media';
    const img = document.createElement('img'); img.src = safeUrl(p.cover, true); img.alt = p.title; img.loading = 'lazy'; img.decoding = 'async';
    media.append(img, text('span',settings.labels.viewProject,'view-label'));
    const meta = document.createElement('div'); meta.className = 'project-meta';
    meta.append(text('h3',p.title),text('span',p.category,'category'));
    button.append(media,meta,text('p',p.short,'project-caption')); grid.append(button);
  }
  const remaining = projects.length - selectedProjects().length;
  more.hidden = expanded || filter !== 'All' || remaining <= 0;
  document.getElementById('more-count').textContent = '+' + remaining;
}
function openProject(id) {
  const p = projects.find(p => p.id === id); if (!p) return;
  lastFocus = document.activeElement;
  document.getElementById('dialog-title').textContent = p.title;
  document.getElementById('dialog-category').textContent = p.brand || p.category;
  document.getElementById('dialog-description').textContent = p.short;
  document.getElementById('dialog-role').textContent = p.role;
  const gallery = document.getElementById('dialog-gallery'); gallery.replaceChildren();
  for (const [i, media] of (p.gallery || []).entries()) {
    const figure = document.createElement('figure'); figure.className = 'gallery-figure';
    const link = document.createElement('a'); link.href = safeUrl(media.image, true); link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', settings.labels.openImage + ': ' + (media.alt || p.title));
    const img = document.createElement('img'); img.src = link.href; img.alt = media.alt || p.title + ' — visual ' + (i+1);
    img.loading = i ? 'lazy' : 'eager'; img.decoding = 'async';
    link.append(img); figure.append(link);
    if (media.caption) figure.append(text('figcaption', media.caption));
    gallery.append(figure);
  }
  dialog.showModal(); dialog.scrollTop = 0; document.body.style.overflow = 'hidden';
}
document.addEventListener('click', e => {
  const card = e.target.closest('[data-project]'); if (card) openProject(Number(card.dataset.project));
  const selected = e.target.closest('[data-filter]');
  if (selected && settings) {
    filter = selected.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(button => {
      button.classList.toggle('active',button === selected); button.setAttribute('aria-pressed', String(button === selected));
    }); render();
  }
});
more.addEventListener('click', () => {
  const previous = new Set(selectedProjects().map(p => p.id)); expanded = true; render();
  [...grid.children].find(el => !previous.has(Number(el.dataset.project)))?.focus({preventScroll:true});
});
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click', e => {
  if (e.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
});
dialog.addEventListener('close',()=>{document.body.style.overflow='';lastFocus?.focus({preventScroll:true});});
async function loadContent() {
  try {
    const responses = await Promise.all(['/data/site.json','/data/projects.json'].map(url=>fetch(url,{cache:'no-cache'})));
    if (responses.some(response=>!response.ok)) throw new Error('Content unavailable');
    const [site, portfolio] = await Promise.all(responses.map(response=>response.json()));
    settings = site; projects = portfolio.projects.map((p,id)=>({...p,id})).filter(p=>p.published !== false);
    applySettings(site); render();
  } catch {
    grid.replaceChildren(text('p','Projects could not load. Please refresh the page.','content-status'));
  }
}
loadContent();
