// 通用旅行页渲染器
// TRIP_ID 由各自的 index.html 定义（唯一需要写的内容）
// TRIPS   由 ../../data/trips.js 提供（所有旅行数据）
(function () {
  TRIPS.sort((a, b) => new Date(b.dateSort) - new Date(a.dateSort));

  const TRIP = TRIPS.find(t => t.id === TRIP_ID);
  if (!TRIP) { document.body.innerHTML = '<p style="padding:2rem">找不到旅行数据，请检查 TRIP_ID</p>'; return; }

  const idx = TRIPS.findIndex(t => t.id === TRIP_ID);

  document.title = `${TRIP.title} ${TRIP.date} — Hazel & Leo 的旅行时光`;
  document.getElementById('nav-trip-name').textContent = `${TRIP.title} · ${TRIP.date}`;
  document.getElementById('hero-bg').style.background = TRIP.gradient;
  document.getElementById('hero-content').innerHTML = buildHero(TRIP);
  document.getElementById('trip-content').innerHTML  = buildContent(TRIP);
  document.getElementById('trip-footer').innerHTML   = buildFooter(TRIP, idx);

  // 滚动后导航栏变色
  const nav = document.getElementById('trip-nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // ---- 英雄区 ----
  function buildHero(t) {
    return `
      <div class="hero-eyebrow">${t.location} &nbsp;·&nbsp; ${t.date}</div>
      <h1 class="hero-title">${t.title}</h1>
      <div class="hero-title-zh">${t.titleZh}</div>
      <div class="hero-meta">
        <div class="meta-item"><span class="meta-dot"></span><span>${t.dateRange}</span></div>
        <div class="meta-item"><span class="meta-dot"></span><span>${t.duration}</span></div>
        <div class="meta-item"><span class="meta-dot"></span><span>${t.weather}</span></div>
      </div>
    `;
  }

  // ---- 正文 ----
  function buildContent(t) {
    let html = '';

    // 故事
    if (t.story) {
      html += `
        <section class="section">
          <div class="section-label">我们的故事</div>
          <p class="story-text">${t.story}</p>
        </section>`;
    }

    // 亮点
    if (t.highlights && t.highlights.length) {
      html += `
        <section class="section">
          <div class="section-label">旅行亮点</div>
          <ul class="highlights-list">
            ${t.highlights.map((h, i) => `
              <li class="highlight-item">
                <span class="highlight-num">0${i + 1}</span>
                <span>${h}</span>
              </li>`).join('')}
          </ul>
        </section>`;
    }

    // 照片墙
    html += `
      <section class="section">
        <div class="section-label">旅行照片</div>
        ${buildPhotoGrid(t)}
      </section>`;

    // 旅行信息
    html += `
      <section class="section">
        <div class="section-label">旅行信息</div>
        <div class="info-grid">
          <div class="info-card">
            <div class="info-card-label">目的地</div>
            <div class="info-card-value">${t.titleZh}，${t.location}</div>
          </div>
          <div class="info-card">
            <div class="info-card-label">出行时间</div>
            <div class="info-card-value">${t.dateRange}</div>
          </div>
          <div class="info-card">
            <div class="info-card-label">行程天数</div>
            <div class="info-card-value">${t.duration}</div>
          </div>
          <div class="info-card">
            <div class="info-card-label">天气</div>
            <div class="info-card-value">${t.weather}</div>
          </div>
          ${t.budget ? `
          <div class="info-card">
            <div class="info-card-label">花费</div>
            <div class="info-card-value">${t.budget}</div>
          </div>` : ''}
        </div>
      </section>`;

    // 标签
    if (t.tags && t.tags.length) {
      html += `
        <section class="section">
          <div class="section-label">旅行标签</div>
          <div class="tags-row">
            ${t.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </section>`;
    }

    // 小故事 / 特别记忆（可选）
    if (t.notes && t.notes.length) {
      html += `
        <section class="section">
          <div class="section-label">特别记忆</div>
          <div class="notes-list">
            ${t.notes.map(n => `<div class="note-item"><span class="note-emoji">${n.emoji || '✦'}</span><span>${n.text}</span></div>`).join('')}
          </div>
        </section>`;
    }

    return html;
  }

  // ---- 照片网格 ----
  function buildPhotoGrid(t) {
    const photos = t.photos || [];

    if (photos.length === 0) {
      // 占位格
      return `
        <div class="photo-grid">
          <div class="photo-cell cell-large" style="background:${t.gradient};opacity:.45">
            <span class="photo-placeholder-icon">🖼</span>
            <span class="photo-placeholder-text">封面大图</span>
          </div>
          ${[1,2,3,4].map(i => `
            <div class="photo-cell" style="background:${t.gradient};opacity:${0.3 - i*0.04}">
              <span class="photo-placeholder-icon">📷</span>
              <span class="photo-placeholder-text">照片 ${i + 1}</span>
            </div>`).join('')}
        </div>`;
    }

    // 有真实照片时显示
    return `
      <div class="photo-grid">
        ${photos.map((p, i) => `
          <div class="photo-cell ${i === 0 ? 'cell-large' : ''}">
            <img src="${p.src}" alt="${p.caption || ''}" loading="lazy">
            ${p.caption ? `<div class="photo-caption">${p.caption}</div>` : ''}
          </div>`).join('')}
      </div>`;
  }

  // ---- 底部导航 ----
  function buildFooter(t, idx) {
    const prev = idx > 0 ? TRIPS[idx - 1] : null;
    const next = idx < TRIPS.length - 1 ? TRIPS[idx + 1] : null;

    // 从 trips/[id]/ 出发，兄弟目录路径为 ../<id>/
    const prevHtml = prev
      ? `<a href="../${prev.id}/index.html" class="footer-nav-btn prev">
           <span class="nav-arrow">←</span>
           <div class="nav-btn-info">
             <span class="nav-btn-hint">更近的旅行</span>
             <span class="nav-btn-name">${prev.title}</span>
           </div>
         </a>`
      : '<div></div>';

    const nextHtml = next
      ? `<a href="../${next.id}/index.html" class="footer-nav-btn next">
           <div class="nav-btn-info">
             <span class="nav-btn-hint">更早的旅行</span>
             <span class="nav-btn-name">${next.title}</span>
           </div>
           <span class="nav-arrow">→</span>
         </a>`
      : '<div></div>';

    return `
      <div class="footer-nav">${prevHtml}${nextHtml}</div>
      <div class="footer-home">
        <a href="../../index.html" class="footer-home-link">↑ 返回时光轴</a>
      </div>`;
  }
})();
