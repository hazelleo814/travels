(function () {

  // ============================================================
  //  从图片提取主色调 → 转为 pin 色板
  // ============================================================

  function extractCardBg(src, callback) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      const S = 60;
      const canvas = document.createElement('canvas');
      canvas.width = S; canvas.height = S;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, S, S);
      const d = ctx.getImageData(0, 0, S, S).data;
      let r = 0, g = 0, b = 0, n = d.length / 4;
      for (let i = 0; i < d.length; i += 4) {
        r += d[i]; g += d[i + 1]; b += d[i + 2];
      }
      callback(toCardPalette(r / n, g / n, b / n));
    };
    img.onerror = () => callback(null);
    img.src = src;
  }

  // 把 RGB 均色转为同色系色板：浅背景 + 边框/尖角强调色
  function toCardPalette(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0, s = 0;
    if (d > 0) {
      const l = (max + min) / 2;
      s = d / (1 - Math.abs(2 * l - 1));
      switch (max) {
        case r: h = ((g - b) / d + 6) % 6; break;
        case g: h = (b - r) / d + 2;       break;
        case b: h = (r - g) / d + 4;       break;
      }
      h /= 6;
    }
    const hDeg = Math.round(h * 360);
    const textSPct = Math.round(Math.min(s, 0.45) * 100);
    const textBg = `hsl(${hDeg}, ${textSPct}%, 94%)`;
    return {
      textBg,
      frame: textBg,
    };
  }

  // ============================================================
  //  坐标系转换：WGS-84（GPS）→ GCJ-02（火星坐标，高德/国标）
  //  data/locations.js 中的坐标均为 GPS 标准坐标（方便从手机/地图复制）
  //  显示到高德底图前，中国境内的点需要做此转换，否则会有 100~500m 偏移
  //  中国以外的地点（如吉隆坡）不做转换
  // ============================================================

  function wgs84ToGcj02(lat, lng) {
    const a  = 6378245.0;
    const ee = 0.00669342162296594323;

    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLng = transformLng(lng - 105.0, lat - 35.0);
    const radLat = lat / 180.0 * Math.PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * Math.PI);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * Math.PI);
    return [lat + dLat, lng + dLng];
  }

  function transformLat(x, y) {
    let r = -100.0 + 2.0*x + 3.0*y + 0.2*y*y + 0.1*x*y + 0.2*Math.sqrt(Math.abs(x));
    r += (20.0*Math.sin(6.0*x*Math.PI) + 20.0*Math.sin(2.0*x*Math.PI)) * 2.0/3.0;
    r += (20.0*Math.sin(y*Math.PI)     + 40.0*Math.sin(y/3.0*Math.PI)) * 2.0/3.0;
    r += (160.0*Math.sin(y/12.0*Math.PI) + 320*Math.sin(y*Math.PI/30.0)) * 2.0/3.0;
    return r;
  }

  function transformLng(x, y) {
    let r = 300.0 + x + 2.0*y + 0.1*x*x + 0.1*x*y + 0.1*Math.sqrt(Math.abs(x));
    r += (20.0*Math.sin(6.0*x*Math.PI) + 20.0*Math.sin(2.0*x*Math.PI)) * 2.0/3.0;
    r += (20.0*Math.sin(x*Math.PI)     + 40.0*Math.sin(x/3.0*Math.PI)) * 2.0/3.0;
    r += (150.0*Math.sin(x/12.0*Math.PI) + 300.0*Math.sin(x/30.0*Math.PI)) * 2.0/3.0;
    return r;
  }

  // 根据 country 字段决定是否转换（只对中国境内做转换）
  function toMapCoord(lat, lng, country) {
    return country === 'china' ? wgs84ToGcj02(lat, lng) : [lat, lng];
  }

  // 国家中心坐标转换（locations.js 里 center 也是 WGS-84）
  function countryCenter(country) {
    return country.id === 'china'
      ? wgs84ToGcj02(country.center[0], country.center[1])
      : country.center;
  }

  // ---- 地图初始化 ----
  // 高德地图底图：符合中国测绘标准，正确显示中国领土（含台湾、南海诸岛）
  const map = L.map('map', {
    center: wgs84ToGcj02(22, 108),   // 亚洲中心，转为 GCJ-02
    zoom: 4,
    zoomControl: false,
    minZoom: 3,
    maxZoom: 17,
  });

  // 高德路网底图（GCJ-02 坐标系，符合中国测绘法规）
  L.tileLayer(
    'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    {
      subdomains: ['1', '2', '3', '4'],
      attribution: '© <a href="https://www.amap.com/">高德地图</a>',
      maxZoom: 18,
    }
  ).addTo(map);

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  // ---- 状态 ----
  let currentCountry    = null;
  let countryMarkerLayers = [];
  let cityMarkerLayers    = [];

  // 按国家分组位置
  const byCountry = {};
  LOCATIONS.forEach(loc => {
    if (!byCountry[loc.country]) byCountry[loc.country] = [];
    byCountry[loc.country].push(loc);
  });

  function getCountry(id) {
    return COUNTRIES_VISITED.find(c => c.id === id);
  }

  // ---- 国家级标记 ----
  function showCountryMarkers() {
    COUNTRIES_VISITED.forEach((country, idx) => {
      const locs = byCountry[country.id] || [];
      if (!locs.length) return;

      // 用国家 center 字段作为标记位置（转换为 GCJ-02）
      const [lat, lng] = countryCenter(country);

      const icon = L.divIcon({
        className: '',
        html: `<div class="country-marker" style="animation-delay:${idx * 0.1}s">
          <div class="country-marker-inner">
            <div class="country-name-zh">${country.nameZh}</div>
            <div class="country-count">${locs.length} 个地方</div>
          </div>
        </div>`,
        iconSize:   [120, 56],
        iconAnchor: [60, 28],
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .on('click', () => enterCountry(country));

      countryMarkerLayers.push(marker);
    });
  }

  function removeCountryMarkers() {
    countryMarkerLayers.forEach(m => map.removeLayer(m));
    countryMarkerLayers = [];
  }

  // ---- 进入国家视图 ----
  function enterCountry(country) {
    currentCountry = country;

    removeCountryMarkers();

    map.flyTo(countryCenter(country), country.zoom, { duration: 1.1, easeLinearity: 0.35 });

    const crumb = document.getElementById('nav-breadcrumb');
    crumb.innerHTML = `
      <span class="breadcrumb-item clickable" id="crumb-asia">亚洲</span>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-item active">${country.nameZh}</span>
    `;
    document.getElementById('crumb-asia').addEventListener('click', backToAsia);

    setTimeout(() => showCityMarkers(country.id), 1100);
  }

  // ---- 城市级标记：每张照片一个 pin ----
  // 多张照片在同一地点时自动小幅偏移，避免完全重叠
  const PIN_OFFSETS = [
    [ 0.000,  0.000],
    [ 0.003,  0.002],
    [-0.002,  0.003],
    [ 0.003, -0.003],
    [-0.003, -0.002],
  ];

  function showCityMarkers(countryId) {
    const locs = byCountry[countryId] || [];
    locs.forEach((loc, locIdx) => {
      const [baseLat, baseLng] = toMapCoord(loc.lat, loc.lng, loc.country);

      // 城市区域高亮：有 adcode 用真实行政边界，否则用圆形兜底
      if (loc.adcode) {
        fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${loc.adcode}.json`)
          .then(r => r.json())
          .then(geojson => {
            // 层1：柔光填充（blur 向外晕散，陶土暖色）
            const glowLayer = L.geoJSON(geojson, {
              style:       { color: 'none', weight: 0, fillColor: '#c4784a', fillOpacity: 0.22 },
              className:   'city-boundary-glow',
              interactive: false,
            }).addTo(map);

            // 层2：流动虚线轮廓（比填充色稍深）
            const lineLayer = L.geoJSON(geojson, {
              style:       { color: '#b8624a', weight: 1.6, opacity: 0.60, fillOpacity: 0, dashArray: '7 4' },
              className:   'city-boundary-line',
              interactive: false,
            }).addTo(map);

            cityMarkerLayers.push(glowLayer, lineLayer);
          })
          .catch(() => {});
      } else {
        // 非中国城市用圆形兜底（如吉隆坡）
        const glowCircle = L.circle([baseLat, baseLng], {
          radius: 12000, color: 'none', weight: 0,
          fillColor: '#c4784a', fillOpacity: 0.22,
          interactive: false, className: 'city-boundary-glow',
        }).addTo(map);
        const lineCircle = L.circle([baseLat, baseLng], {
          radius: 12000, color: '#b8624a', weight: 1.6,
          opacity: 0.60, fillOpacity: 0, dashArray: '7 4',
          interactive: false,
        }).addTo(map);
        cityMarkerLayers.push(glowCircle, lineCircle);
      }

      if (!loc.photos || !loc.photos.length) {
        // 无照片：显示简单圆点占位
        const icon = L.divIcon({
          className: '',
          html: `<div class="city-marker" style="animation-delay:${locIdx * 0.08}s">
            <div class="city-dot"></div>
            <div class="city-label">${loc.nameZh}</div>
          </div>`,
          iconSize:   [80, 36],
          iconAnchor: [40, 7],
        });
        cityMarkerLayers.push(
          L.marker([baseLat, baseLng], { icon }).addTo(map)
        );
        return;
      }

      // 有照片：每张照片一个卡片 pin
      loc.photos.forEach((photo, pIdx) => {
        // 照片有自己的坐标就用精确位置，否则在地点中心附近自动偏移
        let lat, lng;
        if (photo.lat && photo.lng) {
          [lat, lng] = toMapCoord(photo.lat, photo.lng, loc.country);
        } else {
          const off = PIN_OFFSETS[pIdx % PIN_OFFSETS.length];
          lat = baseLat + off[0];
          lng = baseLng + off[1];
        }
        const delay = (locIdx * loc.photos.length + pIdx) * 0.07;

        const icon = L.divIcon({
          className: '',
          html: `<div class="city-pin" style="animation-delay:${delay}s">
            <div class="city-card">
              <div class="city-card-content">
                <div class="pin-expanded-img-wrap">
                  <div class="pin-expanded-media" style="background-image:url('${photo.src}')"></div>
                  ${photo.date ? `<span class="pin-expanded-date">${photo.date}</span>` : ''}
                </div>
                ${photo.text ? `<p class="pin-expanded-text">${photo.text}</p>` : ''}
              </div>
            </div>
            <div class="city-pin-tail"></div>
          </div>`,
          iconSize:   [64, 78],
          iconAnchor: [32, 74],
        });

        const marker = L.marker([lat, lng], { icon }).addTo(map);
        cityMarkerLayers.push(marker);

        const bindPinHoverLayer = () => {
          const el = marker.getElement();
          if (!el) return;
          const base = el.style.zIndex;
          if (el.dataset.hoverLayerBound) return;
          el.dataset.hoverLayerBound = '1';

          el.addEventListener('mouseenter', () => {
            el.classList.add('pin-hover-layer');
            el.style.zIndex = 10000;
            marker.setZIndexOffset(10000);
          });
          el.addEventListener('mouseleave', () => {
            el.classList.remove('pin-hover-layer');
            el.style.zIndex = base;
            marker.setZIndexOffset(0);
          });
        };

        bindPinHoverLayer();
        marker.on('add', bindPinHoverLayer);

        // 从照片提取主色调，应用到 pin 边框、尖角和展开文字区背景
        extractCardBg(photo.src, (palette) => {
          if (!palette) return;
          const el = marker.getElement();
          if (!el) return;
          el.style.setProperty('--pin-frame', palette.frame);
          const textArea = el.querySelector('.pin-expanded-text');
          if (textArea) textArea.style.background = palette.textBg;
        });
      });
    });
  }

  function removeCityMarkers() {
    cityMarkerLayers.forEach(m => map.removeLayer(m));
    cityMarkerLayers = [];
  }

  // ---- 返回亚洲视图 ----
  function backToAsia() {
    removeCityMarkers();
    currentCountry = null;

    map.flyTo(wgs84ToGcj02(22, 108), 4, { duration: 1.1, easeLinearity: 0.35 });

    const crumb = document.getElementById('nav-breadcrumb');
    crumb.innerHTML = `<span class="breadcrumb-item active" id="crumb-asia">亚洲</span>`;

    setTimeout(showCountryMarkers, 1100);
  }

  // 点地图空白处不做任何事（tooltip 纯 CSS 控制）

  // ---- 启动 ----
  showCountryMarkers();

})();
