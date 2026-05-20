(function () {
  // ---- 从 URL 读取旅行 ID ----
  const params = new URLSearchParams(window.location.search);
  const tripId = params.get('id');

  // 排序：最新在前
  TRIPS.sort((a, b) => new Date(b.dateSort) - new Date(a.dateSort));

  const trip = TRIPS.find(t => t.id === tripId);
  if (!trip) {
    window.location.href = 'index.html';
    return;
  }

  const tripIndex = TRIPS.findIndex(t => t.id === tripId);

  // ---- 页面标题 ----
  document.title = `${trip.title} ${trip.date} — 我们的旅行时光`;

  // ---- 顶部 nav 名称 ----
  document.getElementById('nav-trip-name').textContent = `${trip.title} · ${trip.date}`;

  // ---- 英雄区背景 ----
  document.getElementById('hero-bg').style.background = trip.gradient;

  // ---- 英雄区内容 ----
  document.getElementById('hero-content').innerHTML = `
    <div class="hero-eyebrow">${trip.location} &nbsp;·&nbsp; ${trip.date}</div>
    <h1 class="hero-title">${trip.title}</h1>
    <div class="hero-title-zh">${trip.titleZh}</div>
    <div class="hero-meta">
      <div class="meta-item">
        <span class="meta-dot"></span>
        <span>${trip.dateRange}</span>
      </div>
      <div class="meta-item">
        <span class="meta-dot"></span>
        <span>${trip.duration}</span>
      </div>
      <div class="meta-item">
        <span class="meta-dot"></span>
        <span>${trip.weather}</span>
      </div>
    </div>
  `;

  // ---- 正文内容 ----
  const contentEl = document.getElementById('trip-content');
  contentEl.innerHTML = buildContent(trip);

  // ---- 底部导航 ----
  const footerEl = document.getElementById('trip-footer');
  footerEl.innerHTML = buildFooter(trip, tripIndex);

  // ---- 导航栏滚动效果 ----
  const nav = document.getElementById('trip-nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // ---- 构建正文 HTML ----
  function buildContent(t) {
    let html = '';

    // 我们的故事
    html += `
      <section class="section">
        <div class="section-label">我们的故事</div>
        <p class="story-text">${t.story}</p>
      </section>
    `;

    // 旅行亮点
    if (t.highlights && t.highlights.length) {
      html += `
        <section class="section">
          <div class="section-label">旅行亮点</div>
          <ul class="highlights-list">
            ${t.highlights.map((h, i) => `
              <li class="highlight-item">
                <span class="highlight-num">0${i + 1}</span>
                <span>${h}</span>
              </li>
            `).join('')}
          </ul>
        </section>
      `;
    }

    // 照片墙 (占位符 — 添加真实照片时替换 photo-cell 内容)
    html += `
      <section class="section">
        <div class="section-label">旅行照片</div>
        <div class="photo-grid">
          <div class="photo-cell cell-large" style="background: ${t.gradient}; opacity: 0.55;">
            <span class="photo-placeholder-icon">🖼</span>
            <span class="photo-placeholder-text">封面大图</span>
          </div>
          ${Array(4).fill(0).map((_, i) => `
            <div class="photo-cell" style="background: ${t.gradient}; opacity: ${0.35 - i * 0.04};">
              <span class="photo-placeholder-icon">📷</span>
              <span class="photo-placeholder-text">照片 ${i + 2}</span>
            </div>
          `).join('')}
        </div>
      </section>
    `;

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
            <div class="info-card-label">行程长度</div>
            <div class="info-card-value">${t.duration}</div>
          </div>
          <div class="info-card">
            <div class="info-card-label">天气</div>
            <div class="info-card-value">${t.weather}</div>
          </div>
        </div>
      </section>
    `;

    // 标签
    if (t.tags && t.tags.length) {
      html += `
        <section class="section">
          <div class="section-label">旅行标签</div>
          <div class="tags-row">
            ${t.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </section>
      `;
    }

    return html;
  }

  // ---- 构建底部导航 ----
  function buildFooter(t, idx) {
    const prev = idx > 0 ? TRIPS[idx - 1] : null;
    const next = idx < TRIPS.length - 1 ? TRIPS[idx + 1] : null;

    const prevHtml = prev ? `
      <a href="trip.html?id=${prev.id}" class="footer-nav-btn prev">
        <span class="nav-arrow">←</span>
        <div class="nav-btn-info">
          <span class="nav-btn-hint">更近的旅行</span>
          <span class="nav-btn-name">${prev.title}</span>
        </div>
      </a>
    ` : '<div></div>';

    const nextHtml = next ? `
      <a href="trip.html?id=${next.id}" class="footer-nav-btn next">
        <div class="nav-btn-info">
          <span class="nav-btn-hint">更早的旅行</span>
          <span class="nav-btn-name">${next.title}</span>
        </div>
        <span class="nav-arrow">→</span>
      </a>
    ` : '<div></div>';

    return `
      <div class="footer-nav">${prevHtml}${nextHtml}</div>
      <div class="footer-home">
        <a href="index.html" class="footer-home-link">↑ 返回时光轴</a>
      </div>
    `;
  }
})();
