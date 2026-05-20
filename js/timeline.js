(function () {
  // ---- 排序：最新旅行在前 ----
  TRIPS.sort((a, b) => new Date(b.dateSort) - new Date(a.dateSort));

  const track       = document.getElementById('timeline-track');
  const navDotsCtn  = document.getElementById('nav-dots');
  const countCurrent = document.getElementById('count-current');
  const countTotal  = document.getElementById('count-total');
  const scrollHint  = document.getElementById('scroll-hint');
  const bgA         = document.getElementById('bg-a');
  const bgB         = document.getElementById('bg-b');

  let currentIndex = 0;
  let bgActive     = 'a';
  let lastNavTime  = 0;      // 时间戳冷却，替代 isAnimating 锁
  let scrollAccum  = 0;      // 触控板累积量

  const COOLDOWN = 420;      // ms，与 CSS transition 保持一致

  const cards = [];
  const dots  = [];

  // ---- 卡片位置定义 (offset → 视觉参数) ----
  // 卡片高度 min(330,50vw) → 半高 ≈ 165px
  // y[1] ≥ 165 + 330*0.76/2 + gap = 165+125+20 = 310 → 用 325
  // y[2] ≥ 325+125+330*0.55/2+20 = 325+125+90+20 = 560 → 用 570
  const LAYOUT = {
    0: { y: 0,    scale: 1.00, opacity: 1.00 },
    1: { y: 325,  scale: 0.76, opacity: 0.58 },
    2: { y: 570,  scale: 0.54, opacity: 0.26 },
    3: { y: 740,  scale: 0.36, opacity: 0.08 },
  };

  // ---- 初始化 ----
  function init() {
    countTotal.textContent = String(TRIPS.length).padStart(2, '0');

    TRIPS.forEach((trip, i) => {
      // 创建卡片
      const card = buildCard(trip, i);
      track.appendChild(card);
      cards.push(card);

      // 导航点
      const dot = document.createElement('button');
      dot.className = 'nav-dot';
      dot.title = `${trip.date} ${trip.title}`;
      dot.addEventListener('click', () => navigateTo(i));
      navDotsCtn.appendChild(dot);
      dots.push(dot);
    });

    applyLayout(false);
    applyBackground(false);

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    setupTouch();
  }

  // ---- 构建单张卡片 ----
  function buildCard(trip, i) {
    const el = document.createElement('div');
    el.className = 'trip-card';
    el.dataset.index = i;

    const bgStyle = trip.coverPhoto
      ? `background-image: url('${trip.coverPhoto}'); background-size: cover; background-position: center;`
      : `background: ${trip.gradient};`;

    el.innerHTML = `
      <div class="card-bg" style="${bgStyle}"></div>
      <div class="card-overlay"></div>
      <div class="card-body">
        <div class="card-meta-row">
          <span class="card-date">${trip.date}</span>
          <span class="card-country">${trip.location}</span>
        </div>
        <div class="card-city">${trip.title}</div>
        <div class="card-desc">${trip.description}</div>
      </div>
      <div class="card-enter-hint">
        <span class="enter-label">进入旅行</span>
        <div class="enter-circle">→</div>
      </div>
    `;

    el.addEventListener('click', () => {
      if (i === currentIndex) {
        enterTrip(trip);
      } else {
        navigateTo(i);
      }
    });

    return el;
  }

  // ---- 应用 Cover Flow 布局 ----
  function applyLayout(animate) {
    if (!animate) {
      // 首次渲染：关闭过渡，下一帧再打开
      cards.forEach(c => { c.style.transition = 'none'; });
    }

    cards.forEach((card, i) => {
      const offset = i - currentIndex;
      const abs    = Math.abs(offset);
      const sign   = offset < 0 ? -1 : 1;

      if (abs > 3) {
        card.style.opacity = '0';
        card.style.pointerEvents = 'none';
        card.style.zIndex = '0';
        return;
      }

      const p  = LAYOUT[abs];
      const ty = sign * p.y;

      card.style.transform  = `translateY(${ty}px) scale(${p.scale})`;
      card.style.opacity    = String(p.opacity);
      card.style.zIndex     = String(40 - abs * 10);
      card.style.pointerEvents = abs <= 2 ? 'auto' : 'none';
      card.classList.toggle('active', abs === 0);
    });

    // 更新导航点
    dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));

    // 更新计数
    countCurrent.textContent = String(currentIndex + 1).padStart(2, '0');

    if (!animate) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          cards.forEach(c => { c.style.transition = ''; });
        });
      });
    }
  }

  // ---- 切换背景渐变 ----
  function applyBackground(animate) {
    const trip = TRIPS[currentIndex];
    const incoming = bgActive === 'a' ? bgB : bgA;
    const outgoing = bgActive === 'a' ? bgA : bgB;

    if (!animate) {
      bgA.style.background = trip.gradient;
      bgA.style.opacity = '1';
      bgB.style.opacity = '0';
      bgActive = 'a';
      return;
    }

    incoming.style.background  = trip.gradient;
    incoming.style.transition  = 'opacity 1.3s ease';
    outgoing.style.transition  = 'opacity 1.3s ease';
    incoming.style.opacity     = '1';
    outgoing.style.opacity     = '0';
    bgActive = bgActive === 'a' ? 'b' : 'a';
  }

  // ---- 导航到指定索引 ----
  function navigateTo(index) {
    const now = Date.now();
    if (now - lastNavTime < COOLDOWN) return;
    if (index < 0 || index >= TRIPS.length) return;
    if (index === currentIndex) return;

    lastNavTime = now;
    currentIndex = index;

    applyLayout(true);
    applyBackground(true);
    scrollHint.classList.add('hidden');
  }

  // ---- 进入旅行详情 ----
  function enterTrip(trip) {
    window.location.href = `trips/${trip.id}/index.html`;
  }

  // ---- 鼠标滚轮 ----
  function onWheel(e) {
    e.preventDefault();
    const dy = e.deltaY;

    if (Math.abs(dy) >= 50) {
      // 鼠标滚轮：每格直接导航
      scrollAccum = 0;
      navigateTo(currentIndex + (dy > 0 ? 1 : -1));
    } else {
      // 触控板：累积到阈值再触发
      scrollAccum += dy;
      if (Math.abs(scrollAccum) >= 90) {
        navigateTo(currentIndex + (scrollAccum > 0 ? 1 : -1));
        scrollAccum = 0;
      }
    }
  }

  // ---- 键盘 ----
  function onKey(e) {
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
      case 'j':
        navigateTo(currentIndex + 1); break;
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'k':
        navigateTo(currentIndex - 1); break;
      case 'Enter':
        enterTrip(TRIPS[currentIndex]); break;
    }
  }

  // ---- 触摸 ----
  let touchStartY = 0;

  function setupTouch() {
    window.addEventListener('touchstart', e => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', e => {
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 45) {
        navigateTo(currentIndex + (dy > 0 ? 1 : -1));
      }
    }, { passive: true });
  }

  init();
})();
