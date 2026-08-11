(() => {
  'use strict';
  const data = window.ONGOJISIN_DATA;
  const projectNames = Object.fromEntries(data.projects.map(p => [p.id, p.ko]));
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');

  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('open', !open);
  });
  nav.addEventListener('click', e => {
    if (e.target.matches('a')) { nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }
  });

  const tabs = document.querySelector('.project-tabs');
  const detail = document.querySelector('#project-detail');
  const projectVisuals = {
    on: {scene:'assets/images/tale-heungbu.png', glyph:'assets/images/project-on.png'},
    go: {scene:'assets/images/tale-kongjwi.png', glyph:'assets/images/project-go.png'},
    ji: {scene:'assets/images/tale-byeoljubu.png', glyph:'assets/images/project-ji.png'},
    sin: {scene:'assets/images/tale-haenim.png', glyph:'assets/images/project-sin.png'}
  };
  data.projects.forEach((project, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.role = 'tab'; button.dataset.project = project.id;
    button.setAttribute('aria-selected', String(index === 0));
    const visual = projectVisuals[project.id];
    button.innerHTML = `<img class="project-tab-scene" src="${visual.scene}" alt="${project.tale} 삽화"><span class="project-tab-info"><img class="project-tab-glyph" src="${visual.glyph}" alt="${project.ko}"><span><strong>${project.tale}</strong><small>${project.theme}</small></span></span>`;
    button.addEventListener('click', () => selectProject(project.id));
    tabs.append(button);
  });

  function selectProject(id) {
    const project = data.projects.find(item => item.id === id);
    tabs.querySelectorAll('button').forEach(button => button.setAttribute('aria-selected', String(button.dataset.project === id)));
    detail.style.setProperty('--project-color', project.color);
    detail.innerHTML = `<div class="project-story"><div class="project-monogram">${project.ko}</div><p>${project.ko} 프로젝트 · ${project.sdg}</p><h3>${project.tale}에서 발견한<br><em>${project.theme}</em></h3><span class="range-badge">탐구 범위 · ${project.range}</span></div><div class="project-content"><p class="project-label">핵심 질문</p><blockquote>${project.question}</blockquote><p class="project-label">주요 디지털 실천</p><ul>${project.activities.map(a => `<li>${a}</li>`).join('')}</ul><div class="standards"><b>교육과정 연계</b><span>${project.standards}</span></div><button class="text-button" type="button" data-filter-jump="${project.id}">${project.ko} 프로젝트 자료 보기 →</button></div>`;
    detail.querySelector('[data-filter-jump]').addEventListener('click', e => { setFilter(e.currentTarget.dataset.filterJump); document.querySelector('#resources').scrollIntoView({behavior:'smooth'}); });
  }
  selectProject('on');

  const filterGroup = document.querySelector('.filter-group');
  const resourceGrid = document.querySelector('#resource-grid');
  const count = document.querySelector('#resource-count');
  const search = document.querySelector('#resource-search');
  const empty = document.querySelector('#empty-state');
  let activeFilter = 'all';
  [{id:'all',ko:'전체'}, ...data.projects].forEach((item, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.filter = item.id;
    button.className = index === 0 ? 'active' : ''; button.textContent = item.ko;
    button.addEventListener('click', () => setFilter(item.id)); filterGroup.append(button);
  });
  function setFilter(id) { activeFilter = id; filterGroup.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.filter === id)); renderResources(); }
  function renderResources() {
    const query = search.value.trim().toLocaleLowerCase('ko');
    const filtered = data.resources.filter(item => (activeFilter === 'all' || item.project === activeFilter) && [item.title,item.purpose,item.tool,item.type].join(' ').toLocaleLowerCase('ko').includes(query));
    count.textContent = `총 ${filtered.length}개의 자료`;
    empty.hidden = filtered.length !== 0;
    resourceGrid.innerHTML = filtered.map(item => `<article class="resource-card ${item.url ? '' : 'pending'}"><div class="resource-top"><span class="project-chip ${item.project}">${projectNames[item.project]}</span><span class="type-chip">${item.type}</span></div><h3>${item.title}</h3><p>${item.purpose}</p><div class="resource-meta"><span>${item.tool}</span>${item.url ? '<span>외부 링크</span>' : '<span>자료 준비 중</span>'}</div><div class="resource-actions">${item.url ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="${item.title} ${item.action}, 새 창 열림">${item.action}<span aria-hidden="true">↗</span></a>${item.secondaryUrl ? `<a href="${item.secondaryUrl}" target="_blank" rel="noopener noreferrer" aria-label="${item.title} ${item.secondaryAction}, 새 창 열림">${item.secondaryAction}<span aria-hidden="true">↗</span></a>` : ''}` : `<button type="button" disabled>${item.action}</button>`}</div></article>`).join('');
  }
  search.addEventListener('input', renderResources); renderResources();

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...nav.querySelectorAll('a')];
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`)); }), {rootMargin:'-35% 0px -60%'});
  sections.forEach(section => observer.observe(section));

  const backToTop = document.querySelector('#back-to-top');
  backToTop?.addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({top: 0, behavior: 'smooth'});
    history.replaceState(null, '', '#top');
  });
})();
