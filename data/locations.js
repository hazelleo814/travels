// ============================================================
//  位置数据 — 地图页使用
//
//  每个 LOCATION 是一个大的地点（城市/区域），作为所属照片的兜底坐标
//
//  每张照片可以有自己的精确坐标：
//    { src: "路径", text: "一句话", lat: 25.69, lng: 100.17 }
//  如果照片没有写 lat/lng，就用所属地点的坐标（会自动小幅偏移避免重叠）
//
//  坐标获取方式：
//    - iPhone：打开地图 App，长按位置，坐标显示在底部
//    - Google Maps：长按地图上的点，坐标显示在搜索框
//    - 直接用手机拍摄的照片 GPS 元数据也可以
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
    photos:  [
      // { src: "photos/kl/petronas.jpg", text: "双子塔在夜晚会发光，我们站在塔下很久，什么都没说。" },
    ],
  },
  {
    id:      "kunming",
    name:    "Kunming",
    nameZh:  "昆明",
    country: "china",
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
    lat:     25.6065,
    lng:     100.2679,
    photos:  [
      {
        src:  "trips/yunnan-2025-08/photos/cover.jpg",
        text: "我们在大理古城的小巷里迷路，又在苍山的夏风里找回彼此。洱海的水是那种很安静的蓝。",
        lat:  25.6965,   // 洱海边
        lng:  100.1737,
      },
      // 没有写 lat/lng 的照片会用大理中心坐标兜底：
      // { src: "photos/dali/oldtown.jpg", text: "古城的街道走到尽头就是苍山。" },
      // { src: "photos/dali/cangshan.jpg", text: "苍山的雪还没化。", lat: 25.68, lng: 100.13 },
    ],
  },
  {
    id:      "guilin",
    name:    "Guilin",
    nameZh:  "桂林",
    country: "china",
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
    lat:     26.6470,
    lng:     106.6302,
    photos:  [
      // { src: "photos/guiyang/night.jpg", text: "贵阳的夜宵摊，串串和折耳根。" },
    ],
  },
];
