// ============================================================
//  位置数据 — 地图页使用
//
//  adcode：中国城市的行政区划代码，用于加载真实边界轮廓
//  查询地址：https://geo.datav.aliyun.com/areas_v3/bound/
//  非中国城市不填 adcode，自动用圆形代替
// ============================================================

const COUNTRIES_VISITED = [
  {
    id:     "china",
    nameZh: "中国",
    center: [28.5, 107.0],
    zoom:   5,
  },
  {
    id:     "malaysia",
    nameZh: "马来西亚",
    center: [3.14, 101.69],
    zoom:   10,
  },
];

const LOCATIONS = [
  {
    id:      "kuala-lumpur",
    name:    "Kuala Lumpur",
    nameZh:  "吉隆坡",
    country: "malaysia",
    lat:     3.1390,
    lng:     101.6869,
    // 非中国城市无 adcode，用圆形高亮
    photos:  [
      // { src: "photos/kl/petronas.jpg", text: "双子塔在夜晚会发光，我们站在塔下很久，什么都没说。" },
    ],
  },
  {
    id:      "kunming",
    name:    "Kunming",
    nameZh:  "昆明",
    country: "china",
    adcode:  "530100",   // 昆明市
    lat:     25.0389,
    lng:     102.7183,
    photos:  [
      // { src: "photos/kunming/flower.jpg", text: "斗南花市，凌晨四点钟的玫瑰。" },
    ],
  },
  {
    id:      "dali",
    name:    "Dali",
    nameZh:  "大理",
    country: "china",
    adcode:  "532900",   // 大理白族自治州
    lat:     25.6065,
    lng:     100.2679,
    photos:  [
      {
        src:  "trips/yunnan-2025-08/photos/cover.jpg",
        date: "2025.08.25",
        text: "云烧成了橘红色。我们没多说什么，但都知道，这样的傍晚还要一起看很多次。",
        lat:  25.6965,
        lng:  100.1737,
      },
      {
        src:  "trips/yunnan-2025-08/photos/01.jpg",
        text: "我们正在喝一杯超级贵的咖啡。",
        lat:  25.6947,
        lng:  100.1608,
      }, 
      {
        src:  "trips/yunnan-2025-08/photos/02.jpg",
        date: "2025.08.21",
        text: "听着音乐，吃着前一天晚上买的桃子，很爽。",
        lat:  25.6110,   // 大理白族自治州鸡足山路永昌祥邑水花都北侧
        lng:  100.2180,
      },
    ],
  },
  {
    id:      "guilin",
    name:    "Guilin",
    nameZh:  "桂林",
    country: "china",
    adcode:  "450300",   // 桂林市
    lat:     25.2736,
    lng:     110.2907,
    photos:  [
      // { src: "photos/guilin/karst.jpg", text: "桂林山水甲天下，这句话是真的。" },
    ],
  },
  {
    id:      "yangshuo",
    name:    "Yangshuo",
    nameZh:  "阳朔",
    country: "china",
    adcode:  "450321",   // 阳朔县
    lat:     24.7783,
    lng:     110.4946,
    photos:  [
      // { src: "photos/yangshuo/lijiang.jpg", text: "竹筏漂在漓江上，两岸的山像是画里的。" },
    ],
  },
  {
    id:      "guiyang",
    name:    "Guiyang",
    nameZh:  "贵阳",
    country: "china",
    adcode:  "520100",   // 贵阳市
    lat:     26.6470,
    lng:     106.6302,
    photos:  [
      // { src: "photos/guiyang/night.jpg", text: "贵阳的夜宵摊，串串和折耳根。" },
    ],
  },
];
