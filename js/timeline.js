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
  let lastNavTime  = 0;
  let scrollAccum  = 0;

  const COOLDOWN = 420;

  const cards = [];
  const dots  = [];

  const LAYOUT = {
    0: { y: 0,    scale: 1.00, opacity: 1.00 },
    1: { y: 325,  scale: 0.76, opacity: 0.58 },
    2: { y: 570,  scale: 0.54, opacity: 0.26 },
    3: { y: 740,  scale: 0.36, opacity: 0.08 },
  };

  // ---- 从封面图采样并生成背景渐变 ----
  // 采样三个区域取均色，然后压暗+微降饱和，保留色相，产生与图片有"视觉距离"的暗调渐变
  function extractGradientFromPhoto(src, callback) {
    const img = new Image();
    img.onload = function () {
      const S = 80;
      const canvas = document.createElement('canvas');
      canvas.width = S; canvas.height = S;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, S, S);

      // 左上、中心、右下三个区域，各取平均色
      const zones = [
        [0,        0,        S * 0.45, S * 0.45],
        [S * 0.28, S * 0.28, S * 0.44, S * 0.44],
        [S * 0.55, S * 0.55, S * 0.45, S * 0.45],
      ];

      const stops = zones.map(([x, y, w, h]) => {
        const d = ctx.getImageData(x | 0, y | 0, w | 0, h | 0).data;
        let r = 0, g = 0, b = 0, n = d.length / 4;
        for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i+1]; b += d[i+2]; }
        return moodify(r / n, g / n, b / n);
      });

      callback(`linear-gradient(145deg, ${stops[0]} 0%, ${stops[1]} 45%, ${stops[2]} 100%)`);
    };
    img.onerror = function () { /* 静默失败，保留原 gradient */ };
    img.src = src;
  }

  // 将 RGB 颜色转成暗调版本：保留色相，压暗至 25~30% 亮度，微降饱和
  function moodify(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0, s = 0, l = (max + min) / 2;
    if (d > 0) {
      s = d / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case r: h = ((g - b) / d + 6) % 6; break;
        case g: h = (b - r) / d + 2;       break;
        case b: h = (r - g) / d + 4;       break;
      }
      h /= 6;
    }
    // 核心变换：把任意亮度压到 6~22% 区间，饱和度保留八成
    l = Math.max(0.06, l * 0.28 + 0.03);
    s = s * 0.82;

    // HSL → RGB
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    }
    let r2, g2, b2;
    if (s === 0) {
      r2 = g2 = b2 = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r2 = hue2rgb(p, q, h + 1/3);
      g2 = hue2rgb(p, q, h);
      b2 = hue2rgb(p, q, h - 1/3);
    }
    return `rgb(${r2 * 255 | 0},${g2 * 255 | 0},${b2 * 255 | 0})`;
  }

  // ---- 初始化 ----
  function init() {
    countTotal.textContent = String(TRIPS.length).padStart(2, '0');

    TRIPS.forEach((trip, i) => {
      const card = buildCard(trip, i);
      track.appendChild(card);
      cards.push(card);

      const dot = document.createElement('button');
      dot.className = 'nav-dot';
      dot.title = `${trip.date} ${trip.title}`;
      dot.addEventListener('click', () => navigateTo(i));
      navDotsCtn.appendChild(dot);
      dots.push(dot);

      // 有封面图时异步提取背景渐变
      if (trip.coverPhoto) {
        extractGradientFromPhoto(trip.coverPhoto, gradient => {
          trip._derivedGradient = gradient;
          // 若当前正好在这张卡片，立刻刷新背景
          if (TRIPS[currentIndex].id === trip.id) {
            applyBackground(false);
          }
        });
      }
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

    dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
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
    // 有封面图时优先用从图中提取的渐变，否则用手写 gradient
    const gradient = trip._derivedGradient || trip.gradient;
    const incoming = bgActive === 'a' ? bgB : bgA;
    const outgoing = bgActive === 'a' ? bgA : bgB;

    if (!animate) {
      bgA.style.background = gradient;
      bgA.style.opacity = '1';
      bgB.style.opacity = '0';
      bgActive = 'a';
      return;
    }

    incoming.style.background  = gradient;
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
      scrollAccum = 0;
      navigateTo(currentIndex + (dy > 0 ? 1 : -1));
    } else {
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
