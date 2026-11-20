const featured = [0, 5, 8, 12, 10, 13];
const grid = document.getElementById('projects');
const more = document.getElementById('more');
const dialog = document.getElementById('project-dialog');
let filter = 'All', expanded = false, lastFocus;

function render() {
  const ids = expanded || filter !== 'All' ? PROJECTS.map(p => p.id) : featured;
  grid.replaceChildren();
  for (const id of ids) {
    const p = PROJECTS[id];
    if (filter !== 'All' && p.filter !== filter) continue;
    const button = document.createElement('button');
    button.className = 'project reveal';
    button.dataset.project = id;
    button.setAttribute('aria-label', 'View project: ' + p.title);
    const media = document.createElement('div');
    media.className = 'project-media';
    const img = document.createElement('img');
    img.src = p.cover; img.alt = p.title; img.loading = 'lazy';
    media.append(img);
    const view = document.createElement('span');
    view.className = 'view-label'; view.textContent = 'View project';
    media.append(view);
    const meta = document.createElement('div');
    meta.className = 'project-meta';
    const title = document.createElement('h3'); title.textContent = p.title;
    const category = document.createElement('span');
    category.className = 'category'; category.textContent = p.filter;
    meta.append(title, category);
    const caption = document.createElement('p');
    caption.className = 'project-caption'; caption.textContent = p.short;
    button.append(media, meta, caption); grid.append(button);
  }
  more.hidden = expanded || filter !== 'All';
}
function openProject(id) {
  const p = PROJECTS[id]; if (!p) return;
  lastFocus = document.activeElement;
  document.getElementById('dialog-title').textContent = p.title;
  document.getElementById('dialog-category').textContent = p.category;
  document.getElementById('dialog-description').textContent = p.short;
  document.getElementById('dialog-role').textContent = p.role;
  const gallery = document.getElementById('dialog-gallery'); gallery.replaceChildren();
  p.gallery.forEach((src, i) => {
    const im = document.createElement('img');
    im.src = src; im.alt = p.title + ' — visual ' + (i + 1);
    im.loading = i ? 'lazy' : 'eager'; gallery.append(im);
  });
  dialog.showModal(); dialog.scrollTop = 0; document.body.style.overflow = 'hidden';
}
document.addEventListener('click', e => {
  const card = e.target.closest('[data-project]');
  if (card) openProject(Number(card.dataset.project));
  const selected = e.target.closest('[data-filter]');
  if (selected) {
    filter = selected.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => {
      b.classList.toggle('active', b === selected);
      b.setAttribute('aria-pressed', String(b === selected));
    });
    render();
  }
});
more.addEventListener('click', () => {
  expanded = true; render();
  const newCard = Array.from(grid.children).find(el => !featured.includes(Number(el.dataset.project)));
  newCard?.focus({ preventScroll: true });
});
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => {
  if (e.target !== dialog) return;
  const r = dialog.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.style.overflow = ''; lastFocus?.focus({ preventScroll: true });
});

const tools = [
  ['Adobe Photoshop', 'photoshop'], ['Adobe Illustrator', 'illustrator'],
  ['Adobe InDesign', 'indesign'], ['Adobe After Effects', 'after-effects'],
  ['Adobe Premiere Pro', 'premiere-pro'], ['Figma', 'figma'],
  ['Canva', 'canva'], ['LottieFiles', 'lottiefiles']
];
for (const [name, icon] of tools) {
  const item = document.createElement('div'); item.className = 'tool';
  const img = document.createElement('img');
  img.src = 'assets/icons/' + icon + '.svg'; img.alt = ''; img.width = 48; img.height = 48;
  const label = document.createElement('span'); label.textContent = name;
  item.append(img, label); document.getElementById('design-tools').append(item);
}
function appendTags(target, tags) {
  for (const tag of tags) {
    const span = document.createElement('span'); span.textContent = tag; target.append(span);
  }
}
appendTags(document.getElementById('core-skills'), [
  'Visual Campaigns', 'Social Content', 'Digital Imaging', 'Video & Motion',
  'Brand Identity Design', 'Design Systems', 'Visual Content', 'Strategy',
  'Typography', 'Layout Design', 'Color Theory', 'Art Direction', 'Concept Development',
  'Visual Storytelling', 'Motion Graphics', 'Print Production', 'Video Editing',
  'Digital Campaigns', 'E-commerce Creative', 'In-app Visual Assets'
]);
appendTags(document.getElementById('soft-skills'), [
  'Team Leadership', 'Creative Planning', 'Mentoring Junior Designers',
  'Project Management', 'Cross-functional Collaboration',
  'Stakeholder Communication', 'Time Management'
]);
const aiGroups = [
  ['Concept visualisation & moodboarding', ['Midjourney', 'Nano Banana Pro']],
  ['Generative asset production', ['Adobe Firefly']],
  ['AI video & motion generation', ['Kling', 'RunwayML', 'Seedance']],
  ['Brief development & copywriting support', ['ChatGPT', 'Claude']]
];
for (const [name, tags] of aiGroups) {
  const group = document.createElement('div'); group.className = 'ai-row';
  const label = document.createElement('p'); label.textContent = name;
  const list = document.createElement('div'); list.className = 'skills';
  appendTags(list, tags); group.append(label, list); document.getElementById('ai-tools').append(group);
}
const iconPaths = {
  email: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  whatsapp: '<path d="M20.5 11.7a8.5 8.5 0 0 1-12.7 7.4L3 20.5l1.4-4.6A8.5 8.5 0 1 1 20.5 11.7Z"/><path d="M8.5 7.5c-.9.5-.9 1.8-.2 3.2.9 1.8 2.7 3.5 4.5 4.2 1.4.6 2.7.3 3.2-.6l-2.6-1.7-1.2 1c-1.4-.6-2.6-1.9-3.1-3.1l1-1.1-1.6-1.9Z"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/>',
  tiktok: '<path d="M14 3v12a4 4 0 1 1-4-4h1M14 3c0 3 2.2 5 5.5 5v3c-2.1 0-4-.8-5.5-2"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.5 10v7M11.5 17v-7m0 3a3 3 0 0 1 6 0v4"/><circle cx="7.5" cy="7" r=".9" fill="currentColor" stroke="none"/>'
};
for (const element of document.querySelectorAll('[data-icon]')) {
  element.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + iconPaths[element.dataset.icon] + '</svg>';
}
render();
