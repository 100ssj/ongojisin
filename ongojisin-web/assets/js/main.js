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
    detail.innerHTML = `<div class="project-story"><div class="project-monogram">${project.ko}</div><p>${project.ko} 프로젝트 · ${project.sdg}</p><h3>${project.tale}에서 발견한<br><em>${project.theme}</em></h3><span class="range-badge">탐구 범위 · ${project.range}</span></div><div class="project-content"><div class="project-specs"><span><small>대상</small><b>${project.grade}</b></span><span><small>운영</small><b>${project.periods}</b></span><span><small>연계 교과</small><b>${project.subjects}</b></span></div><p class="project-label">핵심 질문</p><blockquote>${project.question}</blockquote><p class="project-label">주요 디지털 실천</p><ul>${project.activities.map(a => `<li>${a}</li>`).join('')}</ul><dl class="project-design-meta"><div><dt>핵심·관련 개념</dt><dd>${project.concepts}</dd></div><div><dt>과정중심평가</dt><dd>${project.assessment}</dd></div><div><dt>교육과정 연계</dt><dd>${project.standards}</dd></div></dl><button class="text-button" type="button" data-filter-jump="${project.id}">${project.ko} 프로젝트 자료 보기 →</button></div>`;
    detail.querySelector('[data-filter-jump]').addEventListener('click', e => { setFilter(e.currentTarget.dataset.filterJump); document.querySelector('#resources').scrollIntoView({behavior:'smooth'}); });
  }
  selectProject('on');

  const filterGroup = document.querySelector('.filter-group');
  const typeFilterGroup = document.querySelector('.type-filter-group');
  const resourceSections = document.querySelector('#resource-sections');
  const count = document.querySelector('#resource-count');
  const search = document.querySelector('#resource-search');
  const empty = document.querySelector('#empty-state');
  const resourceParams = new URLSearchParams(window.location.search);
  const validProjectIds = new Set(data.projects.map(project => project.id));
  const validStageIds = new Set(['ongo','gochal','jihye','hyeoksin']);
  let activeFilter = validProjectIds.has(resourceParams.get('project')) ? resourceParams.get('project') : 'all';
  let activeCategory = resourceParams.get('view') === 'results' ? 'results' : 'teaching';
  let activeType = activeCategory === 'results' && validStageIds.has(resourceParams.get('stage')) ? resourceParams.get('stage') : 'all';
  function syncResourceUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('view', activeCategory);
    activeFilter === 'all' ? url.searchParams.delete('project') : url.searchParams.set('project', activeFilter);
    activeCategory === 'results' && activeType !== 'all' ? url.searchParams.set('stage', activeType) : url.searchParams.delete('stage');
    url.hash = 'resources';
    history.replaceState(null, '', url);
  }
  const categoryTabs = [...document.querySelectorAll('[data-category]')];
  categoryTabs.forEach(tab => tab.setAttribute('aria-selected', String(tab.dataset.category === activeCategory)));
  categoryTabs.forEach(button => button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    activeType = 'all';
    categoryTabs.forEach(tab => tab.setAttribute('aria-selected', String(tab === button)));
    renderTypeFilters(); renderResources(); syncResourceUrl();
  }));
  [{id:'all',ko:'전체'}, ...data.projects].forEach((item, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.filter = item.id;
    button.className = `${item.id === activeFilter ? 'active ' : ''}${item.id === 'all' ? 'filter-all' : 'project-filter'}`;
    if (item.id === 'all') {
      button.innerHTML = '<strong>전체 보기</strong><small>네 프로젝트 한눈에</small>';
    } else {
      button.style.setProperty('--filter-color', item.color);
      button.innerHTML = `<span class="filter-monogram">${item.ko}</span><span class="filter-copy"><strong>${item.ko} 프로젝트</strong><small>${item.range}</small></span>`;
    }
    button.addEventListener('click', () => setFilter(item.id)); filterGroup.append(button);
  });
  function setFilter(id) { activeFilter = id; filterGroup.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.filter === id)); renderResources(); syncResourceUrl(); }
  function renderTypeFilters() {
    const categoryOf = item => item.category || 'teaching';
    const filters = activeCategory === 'results'
      ? [{id:'all',label:'모든 단계'},{id:'ongo',label:'온고'},{id:'gochal',label:'고찰'},{id:'jihye',label:'지혜'},{id:'hyeoksin',label:'혁신'}]
      : [{id:'all',label:'모든 유형'}, ...[...new Set(data.resources.filter(item => categoryOf(item) === activeCategory).map(item => item.type))].map(type => ({id:type,label:type}))];
    typeFilterGroup.innerHTML = filters.map(item => `<button type="button" data-type="${item.id}" class="${item.id === activeType ? 'active ' : ''}${item.id === '교수·학습과정안' ? 'lesson-plan-filter' : ''}">${item.label}</button>`).join('');
    typeFilterGroup.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { activeType = button.dataset.type; renderTypeFilters(); renderResources(); syncResourceUrl(); }));
  }
  function renderResources() {
    const query = search.value.trim().toLocaleLowerCase('ko');
    const categoryOf = item => item.category || 'teaching';
    const filtered = data.resources.filter(item => categoryOf(item) === activeCategory && (activeFilter === 'all' || item.project === activeFilter) && (activeCategory === 'results' || activeType === 'all' || item.type === activeType) && [item.title,item.purpose,item.tool,item.type,...(item.stages || []).map(stage => `${stage.name} ${stage.focus}`)].join(' ').toLocaleLowerCase('ko').includes(query));
    if (activeCategory === 'results') {
      const stageCount = filtered.reduce((total, item) => total + (activeType === 'all' ? item.stages.length : item.stages.filter(stage => stage.id === activeType).length), 0);
      count.textContent = `${filtered.length}개 프로젝트 · ${stageCount}개 단계 결과물`;
      empty.hidden = filtered.length !== 0;
      const stageLinks = stage => stage.links?.length
        ? `<ul class="stage-link-list">${stage.links.map(link => `<li><a href="${link.url}" target="_blank" rel="noopener noreferrer"><span><small>${link.tool}</small><strong>${link.label}</strong></span><b aria-hidden="true">↗</b></a></li>`).join('')}</ul>`
        : '<button type="button" disabled>단계 링크 준비 중</button>';
      const stageCard = (item, stage, index) => `<article class="stage-result-card ${stage.id} ${stage.links?.length ? 'has-links' : ''}"><div><span>${String(index + 1).padStart(2,'0')}</span><strong>${stage.name}</strong></div><p>${stage.focus}</p>${stageLinks(stage)}</article>`;
      resourceSections.innerHTML = filtered.length ? `<section class="student-result-hub" aria-labelledby="student-result-title"><header><div><span>프로젝트·단계별 보기</span><h3 id="student-result-title">학생의 탐구 과정을 순서대로 확인하세요</h3></div><p>프로젝트 전체 기록을 보거나, 온고·고찰·지혜·혁신 단계에서 만들어진 결과물로 바로 이동할 수 있습니다.</p></header><div class="result-project-list">${filtered.map(item => { const project = data.projects.find(project => project.id === item.project); const stages = activeType === 'all' ? item.stages : item.stages.filter(stage => stage.id === activeType); return `<article class="result-project-panel" style="--result-color:${project.color}"><header><img src="${projectVisuals[item.project].glyph}" alt="${project.ko}"><div><span>${project.tale} · ${project.range}</span><h4>${item.title}</h4><p>${project.theme}</p></div><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.action} <span aria-hidden="true">↗</span></a></header><div class="stage-result-grid ${stages.length === 1 ? 'single-stage' : ''}">${stages.map((stage,index) => stageCard(item, stage, item.stages.indexOf(stage))).join('')}</div></article>`;}).join('')}</div></section>` : '';
      return;
    }
    count.textContent = `총 ${filtered.length}개의 자료`;
    empty.hidden = filtered.length !== 0;
    const groups = [
      {id:'teaching', title:'교수·학습 자료', description:'교사가 프로젝트 수업을 설계하고 운영할 때 바로 활용하는 자료'},
      {id:'results', title:'학생 활동 결과물', description:'온·고·지·신 프로젝트에서 학생들이 완성한 탐구와 실천의 기록'}
    ];
    const card = item => `<article class="resource-card ${item.preview ? 'has-preview' : ''} ${item.url ? '' : 'pending'} ${item.type === '교수·학습과정안' ? 'lesson-plan-card' : ''}">${item.preview ? `<img class="resource-preview" src="${item.preview}" alt="${item.title} 미리보기" loading="lazy">` : ''}<div class="resource-card-body"><div class="resource-top"><span class="project-chip ${item.project}">${projectNames[item.project]}</span><span class="type-chip">${item.type}</span></div><h3>${item.title}</h3><p>${item.purpose}</p><div class="resource-meta"><span>${item.tool}</span>${item.url ? '<span>외부 링크</span>' : '<span>자료 준비 중</span>'}</div><div class="resource-actions">${item.url ? `<a href="${item.url}" target="_blank" rel="noopener noreferrer" aria-label="${item.title} ${item.action}, 새 창 열림">${item.action}<span aria-hidden="true">↗</span></a>${item.secondaryUrl ? `<a href="${item.secondaryUrl}" target="_blank" rel="noopener noreferrer" aria-label="${item.title} ${item.secondaryAction}, 새 창 열림">${item.secondaryAction}<span aria-hidden="true">↗</span></a>` : ''}` : `<button type="button" disabled>${item.action}</button>`}</div></div></article>`;
    const group = groups.find(item => item.id === activeCategory);
    resourceSections.innerHTML = filtered.length ? `<section class="resource-category ${group.id}" aria-labelledby="resource-${group.id}"><header><div><h3 id="resource-${group.id}">${group.title}</h3></div><p>${group.description}</p></header><div class="resource-grid">${filtered.map(card).join('')}</div></section>` : '';
  }
  search.addEventListener('input', renderResources); renderTypeFilters(); renderResources();

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
