// ============================================================
//  旅行数据 — 所有内容只在这里维护
//  每个旅行的详情页只声明自己的 ID，其余全从这里读取
// ============================================================
const TRIPS = [
  {
    // ---- 基本信息（时间轴卡片用）----
    id:          "london-2026-04",
    title:       "London",
    titleZh:     "伦敦",
    date:        "2026.04",
    dateSort:    "2026-04-18",
    dateRange:   "2026年4月18日 — 22日",
    location:    "英国",
    duration:    "5天4晚",
    description: "雾都春日，大本钟下的静默时光",
    gradient:    "linear-gradient(145deg, #1c2847 0%, #2d3a6b 45%, #3d2a5a 100%)",

    // ---- 详情页内容 ----
    weather:    "多云，12°C",
    story:      "四月的伦敦，春意朦胧。我们穿过泰晤士河上的桥，看见大本钟在薄雾里若隐若现。这座城市的美，是需要慢慢品味的那种。Borough Market 的咖啡还在冒热气，窗外的伦敦就这样静静流淌。",
    highlights: ["威斯敏斯特大教堂与大本钟", "泰特现代美术馆", "Borough Market 觅食"],
    tags:       ["城市", "文化", "美食", "历史"],

    // 照片：把图片放进 trips/london-2026-04/photos/ 后取消注释
    photos: [
      // { src: "./photos/cover.jpg",   caption: "泰晤士河畔的清晨" },
      // { src: "./photos/big-ben.jpg", caption: "薄雾中的大本钟" },
    ],

    // 可选字段
    // budget: "人均 ¥12,000",
    // notes: [{ emoji: "☕", text: "Monmouth Coffee 排了20分钟，值得" }],
  },

  {
    id:          "paris-2025-12",
    title:       "Paris",
    titleZh:     "巴黎",
    date:        "2025.12",
    dateSort:    "2025-12-20",
    dateRange:   "2025年12月20日 — 25日",
    location:    "法国",
    duration:    "6天5晚",
    description: "圣诞节前夕，塞纳河畔的万家灯火",
    gradient:    "linear-gradient(145deg, #2b1f2a 0%, #5c3453 50%, #7a4a35 100%)",

    weather:    "晴间多云，6°C",
    story:      "圣诞节前夕的巴黎，整座城市都被温暖的灯光包裹。埃菲尔铁塔在夜晚整点闪烁的那一刻，我们都沉默了。卢浮宫里人很少，我们在《蒙娜丽莎》前站了很久，不知道在期待什么。",
    highlights: ["埃菲尔铁塔夜景闪光", "卢浮宫半日", "蒙马特高地漫步"],
    tags:       ["浪漫", "艺术", "美食", "圣诞"],
    photos: [
      // { src: "./photos/eiffel.jpg",     caption: "铁塔闪光的瞬间" },
      // { src: "./photos/louvre.jpg",     caption: "卢浮宫玻璃金字塔" },
    ],
  },

  {
    id:          "edinburgh-2025-08",
    title:       "Edinburgh",
    titleZh:     "爱丁堡",
    date:        "2025.08",
    dateSort:    "2025-08-05",
    dateRange:   "2025年8月5日 — 8日",
    location:    "苏格兰",
    duration:    "4天3晚",
    description: "高地风情，城堡里的千年历史",
    gradient:    "linear-gradient(145deg, #162420 0%, #1e3a2e 40%, #2d2a40 100%)",

    weather:    "晴，17°C",
    story:      "站在亚瑟王座的顶端，整个爱丁堡尽收眼底。八月是艺穗节，街头的表演者们用古老的凯尔特乐器奏响旋律。城堡里陈列的苏格兰王冠，沉默地讲述着一段段我们无从知晓的故事。",
    highlights: ["爱丁堡城堡", "亚瑟王座登顶", "皇家英里大道·艺穗节"],
    tags:       ["历史", "自然", "文化", "艺穗节"],
    photos: [
      // { src: "./photos/castle.jpg",  caption: "爱丁堡城堡" },
      // { src: "./photos/arthurs.jpg", caption: "亚瑟王座山顶" },
    ],
  },

  {
    id:          "yunnan-2025-08",
    title:       "Yunnan",
    titleZh:     "云南",
    date:        "2025.08",
    dateSort:    "2025-08-15",
    dateRange:   "2025年8月15日 — 21日",
    location:    "中国云南",
    duration:    "7天6晚",
    description: "苍山洱海，云端之上的人间烟火",
    gradient:    "linear-gradient(145deg, #0d2318 0%, #1a3d28 45%, #2a3510 100%)",
    coverPhoto:  "trips/yunnan-2025-08/photos/cover.jpg",

    weather:    "晴转多云，22°C",
    story:      "无人机飞过洱海上空的那一刻，夕阳把水面染成了金橙色，连远处的苍山也变得温柔起来。云南的美是那种铺天盖地的，随便停下来，都是一张照片。我们在大理古城的小巷里迷路，又在玉龙雪山的风里找回彼此。",
    highlights: ["洱海无人机航拍", "大理古城漫步", "玉龙雪山"],
    tags:       ["自然", "航拍", "古城", "雪山"],

    photos: [
      { src: "./photos/cover.jpg", caption: "洱海暮色" },
    ],
  },

  {
    id:          "santorini-2025-05",
    title:       "Santorini",
    titleZh:     "圣托里尼",
    date:        "2025.05",
    dateSort:    "2025-05-10",
    dateRange:   "2025年5月10日 — 14日",
    location:    "希腊",
    duration:    "5天4晚",
    description: "蓝顶白墙，爱琴海落日的最后一秒",
    gradient:    "linear-gradient(145deg, #0d1f3c 0%, #1a4070 45%, #3a2560 100%)",

    weather:    "晴，24°C",
    story:      "在伊亚等待落日的那两个小时，我们什么都没说，只是坐在台阶上，看着太阳一点点沉入爱琴海。那种平静，是我们旅行以来最奢侈的时刻。蓝色屋顶在黄昏里变成了深紫，然后是黑色。",
    highlights: ["伊亚落日", "蓝顶教堂散步", "红沙滩游泳"],
    tags:       ["海岛", "浪漫", "摄影", "美食"],
    photos: [
      // { src: "./photos/sunset.jpg", caption: "伊亚的最后一道光" },
      // { src: "./photos/dome.jpg",   caption: "蓝顶教堂" },
    ],
  },

  {
    id:          "kyoto-2024-11",
    title:       "Kyoto",
    titleZh:     "京都",
    date:        "2024.11",
    dateSort:    "2024-11-18",
    dateRange:   "2024年11月18日 — 24日",
    location:    "日本",
    duration:    "7天6晚",
    description: "红叶掩寺庙，千年古都的秋日之美",
    gradient:    "linear-gradient(145deg, #2a1010 0%, #5c2815 45%, #3a2a10 100%)",

    weather:    "晴，13°C",
    story:      "岚山的红叶把整个世界都染成了橙红色。竹林小道上风吹过的声音像是古老的歌谣，我们走了很久，没有说话。清水寺的木台悬在半空，京都就在脚下蔓延开来，一直到远山的轮廓。",
    highlights: ["岚山竹林与红叶", "清水寺木舞台", "伏见稻荷千本鸟居"],
    tags:       ["历史", "自然", "红叶", "寺庙"],
    photos: [
      // { src: "./photos/arashiyama.jpg", caption: "岚山红叶" },
      // { src: "./photos/kiyomizu.jpg",   caption: "清水寺木台" },
    ],
  },

  {
    id:          "amsterdam-2024-03",
    title:       "Amsterdam",
    titleZh:     "阿姆斯特丹",
    date:        "2024.03",
    dateSort:    "2024-03-22",
    dateRange:   "2024年3月22日 — 25日",
    location:    "荷兰",
    duration:    "4天3晚",
    description: "郁金香初开，运河边的第一次同行",
    gradient:    "linear-gradient(145deg, #1a2535 0%, #1e3a30 40%, #2a1e3a 100%)",

    weather:    "晴间多云，10°C",
    story:      "三月底的荷兰，郁金香刚刚盛开。我们租了自行车，沿着运河骑行，路过无数像画里一样美的吊桥和老房子。那是我们第一次一起旅行，什么都不熟悉，但什么都觉得新奇。",
    highlights: ["库肯霍夫花园郁金香", "梵高博物馆", "运河游船"],
    tags:       ["自行车", "鲜花", "博物馆", "初次旅行"],
    photos: [
      // { src: "./photos/tulips.jpg", caption: "库肯霍夫的郁金香海" },
      // { src: "./photos/canal.jpg",  caption: "运河倒影" },
    ],
  },
];
