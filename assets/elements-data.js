/**
 * 元素徽章收集系统 - 118个元素数据
 *
 * 本文件包含化学元素周期表中全部118个元素的完整数据，
 * 用于元素徽章收集与对战系统。
 *
 * 字段说明：
 *   z          - 原子序数
 *   symbol     - 元素符号
 *   name       - 中文名
 *   nameEn     - 英文名
 *   category   - 分类（alkali-metal / alkaline-earth / transition / post-transition / metalloid / nonmetal / halogen / noble-gas / lanthanide / actinide）
 *   period     - 周期数（1-7）
 *   group      - 族数（1-18），镧系/锕系使用特殊值
 *   difficulty - 对战难度（1-5）
 *   color      - 该元素的代表颜色（hex）
 *   desc       - 一句话描述该元素的用途或特征
 *   badge      - 徽章图标emoji
 */

// 分类对应的主题色系
const CATEGORY_COLORS = {
  'alkali-metal':    '#ef4444',  // 红色系
  'alkaline-earth':  '#f97316',  // 橙色系
  'transition':      '#3b82f6',  // 蓝色系
  'post-transition': '#06b6d4',  // 青色系
  'metalloid':       '#22c55e',  // 绿色系
  'nonmetal':        '#eab308',  // 黄色系
  'halogen':         '#a855f7',  // 紫色系
  'noble-gas':       '#ec4899',  // 粉色系
  'lanthanide':      '#d4a017',  // 金色系
  'actinide':        '#b91c1c',  // 深红系
};

// 分类对应的徽章emoji
const CATEGORY_BADGES = {
  'alkali-metal':    '🔥',
  'alkaline-earth':  '⚡',
  'transition':      '⚔️',
  'post-transition': '🛡️',
  'metalloid':       '🌿',
  'nonmetal':        '💎',
  'halogen':         '☠️',
  'noble-gas':       '👑',
  'lanthanide':      '🌟',
  'actinide':        '☢️',
};

// 118个元素完整数据
const ELEMENTS_DATA = [
  // ===== 第1周期 =====
  {
    z: 1, symbol: 'H',
    electronConfig: '1s¹', name: '氢', nameEn: 'Hydrogen',
    category: 'nonmetal', period: 1, group: 1, difficulty: 1,
    color: '#eab308', badge: '💎',
    desc: '宇宙中最丰富的元素，水的组成成分'
  },
  {
    z: 2, symbol: 'He',
    electronConfig: '1s²', name: '氦', nameEn: 'Helium',
    category: 'noble-gas', period: 1, group: 18, difficulty: 1,
    color: '#ec4899', badge: '👑',
    desc: '最轻的惰性气体，常用于气球填充和低温研究'
  },

  // ===== 第2周期 =====
  {
    z: 3, symbol: 'Li',
    electronConfig: '1s² 2s¹', name: '锂', nameEn: 'Lithium',
    category: 'alkali-metal', period: 2, group: 1, difficulty: 1,
    color: '#ef4444', badge: '🔥',
    desc: '最轻的金属元素，广泛用于锂电池制造'
  },
  {
    z: 4, symbol: 'Be',
    electronConfig: '1s² 2s²', name: '铍', nameEn: 'Beryllium',
    category: 'alkaline-earth', period: 2, group: 2, difficulty: 1,
    color: '#f97316', badge: '⚡',
    desc: '质轻且坚硬的金属，用于航天材料和X射线窗口'
  },
  {
    z: 5, symbol: 'B',
    electronConfig: '1s² 2s² 2p¹', name: '硼', nameEn: 'Boron',
    category: 'metalloid', period: 2, group: 13, difficulty: 1,
    color: '#22c55e', badge: '🌿',
    desc: '准金属元素，硼砂和硼酸的组成成分'
  },
  {
    z: 6, symbol: 'C',
    electronConfig: '1s² 2s² 2p²', name: '碳', nameEn: 'Carbon',
    category: 'nonmetal', period: 2, group: 14, difficulty: 1,
    color: '#eab308', badge: '💎',
    desc: '有机生命的基础元素，形成金刚石和石墨'
  },
  {
    z: 7, symbol: 'N',
    electronConfig: '1s² 2s² 2p³', name: '氮', nameEn: 'Nitrogen',
    category: 'nonmetal', period: 2, group: 15, difficulty: 1,
    color: '#eab308', badge: '💎',
    desc: '大气中含量最多的气体，约占空气的78%'
  },
  {
    z: 8, symbol: 'O',
    electronConfig: '1s² 2s² 2p⁴', name: '氧', nameEn: 'Oxygen',
    category: 'nonmetal', period: 2, group: 16, difficulty: 1,
    color: '#eab308', badge: '💎',
    desc: '生命呼吸所必需的元素，支持燃烧反应'
  },
  {
    z: 9, symbol: 'F',
    electronConfig: '1s² 2s² 2p⁵', name: '氟', nameEn: 'Fluorine',
    category: 'halogen', period: 2, group: 17, difficulty: 1,
    color: '#a855f7', badge: '☠️',
    desc: '电负性最强的元素，用于制造含氟牙膏和特氟龙'
  },
  {
    z: 10, symbol: 'Ne',
    electronConfig: '1s² 2s² 2p⁶', name: '氖', nameEn: 'Neon',
    category: 'noble-gas', period: 2, group: 18, difficulty: 1,
    color: '#ec4899', badge: '👑',
    desc: '通电后发出红橙色光，广泛用于霓虹灯'
  },

  // ===== 第3周期 =====
  {
    z: 11, symbol: 'Na',
    electronConfig: '1s² 2s² 2p⁶ 3s¹', name: '钠', nameEn: 'Sodium',
    category: 'alkali-metal', period: 3, group: 1, difficulty: 1,
    color: '#ef4444', badge: '🔥',
    desc: '活泼碱金属，遇水剧烈反应生成氢氧化钠'
  },
  {
    z: 12, symbol: 'Mg',
    electronConfig: '1s² 2s² 2p⁶ 3s²', name: '镁', nameEn: 'Magnesium',
    category: 'alkaline-earth', period: 3, group: 2, difficulty: 1,
    color: '#f97316', badge: '⚡',
    desc: '轻质金属，燃烧发出耀眼白光，用于烟花和合金'
  },
  {
    z: 13, symbol: 'Al',
    electronConfig: '1s² 2s² 2p⁶ 3s² 3p¹', name: '铝', nameEn: 'Aluminium',
    category: 'post-transition', period: 3, group: 13, difficulty: 1,
    color: '#06b6d4', badge: '🛡️',
    desc: '地壳中含量最丰富的金属，广泛用于日常生活'
  },
  {
    z: 14, symbol: 'Si',
    electronConfig: '1s² 2s² 2p⁶ 3s² 3p²', name: '硅', nameEn: 'Silicon',
    category: 'metalloid', period: 3, group: 14, difficulty: 1,
    color: '#22c55e', badge: '🌿',
    desc: '半导体工业的核心材料，芯片制造的基础'
  },
  {
    z: 15, symbol: 'P',
    electronConfig: '1s² 2s² 2p⁶ 3s² 3p³', name: '磷', nameEn: 'Phosphorus',
    category: 'nonmetal', period: 3, group: 15, difficulty: 1,
    color: '#eab308', badge: '💎',
    desc: '生命必需元素，存在于DNA、ATP和骨骼中'
  },
  {
    z: 16, symbol: 'S',
    electronConfig: '1s² 2s² 2p⁶ 3s² 3p⁴', name: '硫', nameEn: 'Sulfur',
    category: 'nonmetal', period: 3, group: 16, difficulty: 1,
    color: '#eab308', badge: '💎',
    desc: '火山附近常见元素，用于制造硫酸和橡胶硫化'
  },
  {
    z: 17, symbol: 'Cl',
    electronConfig: '1s² 2s² 2p⁶ 3s² 3p⁵', name: '氯', nameEn: 'Chlorine',
    category: 'halogen', period: 3, group: 17, difficulty: 1,
    color: '#a855f7', badge: '☠️',
    desc: '黄绿色有毒气体，用于自来水消毒和漂白'
  },
  {
    z: 18, symbol: 'Ar',
    electronConfig: '1s² 2s² 2p⁶ 3s² 3p⁶', name: '氩', nameEn: 'Argon',
    category: 'noble-gas', period: 3, group: 18, difficulty: 1,
    color: '#ec4899', badge: '👑',
    desc: '大气中含量第三的气体，常用作焊接保护气'
  },

  // ===== 第4周期 =====
  {
    z: 19, symbol: 'K',
    electronConfig: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹', name: '钾', nameEn: 'Potassium',
    category: 'alkali-metal', period: 4, group: 1, difficulty: 1,
    color: '#ef4444', badge: '🔥',
    desc: '生物体必需的电解质，维持神经和肌肉功能'
  },
  {
    z: 20, symbol: 'Ca',
    electronConfig: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s²', name: '钙', nameEn: 'Calcium',
    category: 'alkaline-earth', period: 4, group: 2, difficulty: 1,
    color: '#f97316', badge: '⚡',
    desc: '骨骼和牙齿的主要成分，维持人体结构'
  },
  {
    z: 21, symbol: 'Sc',
    electronConfig: '[Ar] 3d¹ 4s²', name: '钪', nameEn: 'Scandium',
    category: 'transition', period: 4, group: 3, difficulty: 2,
    color: '#3b82f6', badge: '⚔️',
    desc: '第一个过渡金属，用于高强度铝合金'
  },
  {
    z: 22, symbol: 'Ti',
    electronConfig: '[Ar] 3d² 4s²', name: '钛', nameEn: 'Titanium',
    category: 'transition', period: 4, group: 4, difficulty: 2,
    color: '#3b82f6', badge: '⚔️',
    desc: '强度高、密度低、耐腐蚀，被誉为"太空金属"'
  },
  {
    z: 23, symbol: 'V',
    electronConfig: '[Ar] 3d³ 4s²', name: '钒', nameEn: 'Vanadium',
    category: 'transition', period: 4, group: 5, difficulty: 2,
    color: '#3b82f6', badge: '⚔️',
    desc: '用于制造高强度合金钢，提升材料韧性'
  },
  {
    z: 24, symbol: 'Cr',
    electronConfig: '[Ar] 3d⁵ 4s¹', name: '铬', nameEn: 'Chromium',
    category: 'transition', period: 4, group: 6, difficulty: 2,
    color: '#3b82f6', badge: '⚔️',
    desc: '赋予金属光亮表面的元素，用于不锈钢镀层'
  },
  {
    z: 25, symbol: 'Mn',
    electronConfig: '[Ar] 3d⁵ 4s²', name: '锰', nameEn: 'Manganese',
    category: 'transition', period: 4, group: 7, difficulty: 2,
    color: '#3b82f6', badge: '⚔️',
    desc: '钢铁工业中重要的合金元素，干电池的核心材料'
  },
  {
    z: 26, symbol: 'Fe',
    electronConfig: '[Ar] 3d⁶ 4s²', name: '铁', nameEn: 'Iron',
    category: 'transition', period: 4, group: 8, difficulty: 2,
    color: '#3b82f6', badge: '⚔️',
    desc: '最常见的金属，血红蛋白的核心元素'
  },
  {
    z: 27, symbol: 'Co',
    electronConfig: '[Ar] 3d⁷ 4s²', name: '钴', nameEn: 'Cobalt',
    category: 'transition', period: 4, group: 9, difficulty: 2,
    color: '#3b82f6', badge: '⚔️',
    desc: '用于制造高温合金和锂离子电池正极材料'
  },
  {
    z: 28, symbol: 'Ni',
    electronConfig: '[Ar] 3d⁸ 4s²', name: '镍', nameEn: 'Nickel',
    category: 'transition', period: 4, group: 10, difficulty: 2,
    color: '#3b82f6', badge: '⚔️',
    desc: '耐腐蚀金属，用于不锈钢和充电电池'
  },
  {
    z: 29, symbol: 'Cu',
    electronConfig: '[Ar] 3d¹⁰ 4s¹', name: '铜', nameEn: 'Copper',
    category: 'transition', period: 4, group: 11, difficulty: 2,
    color: '#3b82f6', badge: '⚔️',
    desc: '人类最早使用的金属之一，优良的电导体'
  },
  {
    z: 30, symbol: 'Zn',
    electronConfig: '[Ar] 3d¹⁰ 4s²', name: '锌', nameEn: 'Zinc',
    category: 'transition', period: 4, group: 12, difficulty: 2,
    color: '#3b82f6', badge: '⚔️',
    desc: '用于镀锌防腐和制造锌锰电池'
  },
  {
    z: 31, symbol: 'Ga',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p¹', name: '镓', nameEn: 'Gallium',
    category: 'post-transition', period: 4, group: 13, difficulty: 2,
    color: '#06b6d4', badge: '🛡️',
    desc: '熔点仅29.76°C，在手心即可融化，用于半导体'
  },
  {
    z: 32, symbol: 'Ge',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p²', name: '锗', nameEn: 'Germanium',
    category: 'metalloid', period: 4, group: 14, difficulty: 2,
    color: '#22c55e', badge: '🌿',
    desc: '早期半导体材料，现用于红外光学和光纤通信'
  },
  {
    z: 33, symbol: 'As',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p³', name: '砷', nameEn: 'Arsenic',
    category: 'metalloid', period: 4, group: 15, difficulty: 2,
    color: '#22c55e', badge: '🌿',
    desc: '著名的有毒准金属，少量用于半导体掺杂'
  },
  {
    z: 34, symbol: 'Se',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁴', name: '硒', nameEn: 'Selenium',
    category: 'nonmetal', period: 4, group: 16, difficulty: 2,
    color: '#eab308', badge: '💎',
    desc: '人体必需的微量元素，具有抗氧化功能'
  },
  {
    z: 35, symbol: 'Br',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁵', name: '溴', nameEn: 'Bromine',
    category: 'halogen', period: 4, group: 17, difficulty: 2,
    color: '#a855f7', badge: '☠️',
    desc: '常温下唯一的液态非金属，红棕色有刺鼻气味'
  },
  {
    z: 36, symbol: 'Kr',
    electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁶', name: '氪', nameEn: 'Krypton',
    category: 'noble-gas', period: 4, group: 18, difficulty: 2,
    color: '#ec4899', badge: '👑',
    desc: '惰性气体，用于高性能闪光灯和激光器'
  },

  // ===== 第5周期 =====
  {
    z: 37, symbol: 'Rb',
    electronConfig: '[Kr] 5s¹', name: '铷', nameEn: 'Rubidium',
    category: 'alkali-metal', period: 5, group: 1, difficulty: 3,
    color: '#ef4444', badge: '🔥',
    desc: '遇水即爆炸的活泼金属，用于原子钟研究'
  },
  {
    z: 38, symbol: 'Sr',
    electronConfig: '[Kr] 5s²', name: '锶', nameEn: 'Strontium',
    category: 'alkaline-earth', period: 5, group: 2, difficulty: 3,
    color: '#f97316', badge: '⚡',
    desc: '燃烧呈洋红色火焰，用于烟花和信号弹'
  },
  {
    z: 39, symbol: 'Y',
    electronConfig: '[Kr] 4d¹ 5s²', name: '钇', nameEn: 'Yttrium',
    category: 'transition', period: 5, group: 3, difficulty: 3,
    color: '#3b82f6', badge: '⚔️',
    desc: '用于制造LED荧光粉和高温超导材料'
  },
  {
    z: 40, symbol: 'Zr',
    electronConfig: '[Kr] 4d² 5s²', name: '锆', nameEn: 'Zirconium',
    category: 'transition', period: 5, group: 4, difficulty: 3,
    color: '#3b82f6', badge: '⚔️',
    desc: '耐高温耐腐蚀，用于核反应堆燃料棒包壳'
  },
  {
    z: 41, symbol: 'Nb',
    electronConfig: '[Kr] 4d⁴ 5s¹', name: '铌', nameEn: 'Niobium',
    category: 'transition', period: 5, group: 5, difficulty: 3,
    color: '#3b82f6', badge: '⚔️',
    desc: '用于制造超导磁体和高强度合金钢'
  },
  {
    z: 42, symbol: 'Mo',
    electronConfig: '[Kr] 4d⁵ 5s¹', name: '钼', nameEn: 'Molybdenum',
    category: 'transition', period: 5, group: 6, difficulty: 3,
    color: '#3b82f6', badge: '⚔️',
    desc: '生物体必需的微量元素，用于高强度合金'
  },
  {
    z: 43, symbol: 'Tc',
    electronConfig: '[Kr] 4d⁵ 5s²', name: '锝', nameEn: 'Technetium',
    category: 'transition', period: 5, group: 7, difficulty: 3,
    color: '#3b82f6', badge: '⚔️',
    desc: '首个人工合成的元素，用于医学放射性造影'
  },
  {
    z: 44, symbol: 'Ru',
    electronConfig: '[Kr] 4d⁷ 5s¹', name: '钌', nameEn: 'Ruthenium',
    category: 'transition', period: 5, group: 8, difficulty: 3,
    color: '#3b82f6', badge: '⚔️',
    desc: '铂族金属之一，用于电子元件和催化剂'
  },
  {
    z: 45, symbol: 'Rh',
    electronConfig: '[Kr] 4d⁸ 5s¹', name: '铑', nameEn: 'Rhodium',
    category: 'transition', period: 5, group: 9, difficulty: 3,
    color: '#3b82f6', badge: '⚔️',
    desc: '最昂贵的贵金属之一，用于汽车尾气催化转化器'
  },
  {
    z: 46, symbol: 'Pd',
    electronConfig: '[Kr] 4d¹⁰', name: '钯', nameEn: 'Palladium',
    category: 'transition', period: 5, group: 10, difficulty: 3,
    color: '#3b82f6', badge: '⚔️',
    desc: '重要的催化金属，用于汽车催化转化器和氢气净化'
  },
  {
    z: 47, symbol: 'Ag',
    electronConfig: '[Kr] 4d¹⁰ 5s¹', name: '银', nameEn: 'Silver',
    category: 'transition', period: 5, group: 11, difficulty: 3,
    color: '#3b82f6', badge: '⚔️',
    desc: '导电导热性最好的金属，用于首饰和摄影'
  },
  {
    z: 48, symbol: 'Cd',
    electronConfig: '[Kr] 4d¹⁰ 5s²', name: '镉', nameEn: 'Cadmium',
    category: 'transition', period: 5, group: 12, difficulty: 3,
    color: '#3b82f6', badge: '⚔️',
    desc: '用于镍镉电池和颜料，但具有毒性'
  },
  {
    z: 49, symbol: 'In',
    electronConfig: '[Kr] 4d¹⁰ 5s² 5p¹', name: '铟', nameEn: 'Indium',
    category: 'post-transition', period: 5, group: 13, difficulty: 3,
    color: '#06b6d4', badge: '🛡️',
    desc: '质地柔软的稀有金属，用于触摸屏的ITO薄膜'
  },
  {
    z: 50, symbol: 'Sn',
    electronConfig: '[Kr] 4d¹⁰ 5s² 5p²', name: '锡', nameEn: 'Tin',
    category: 'post-transition', period: 5, group: 14, difficulty: 3,
    color: '#06b6d4', badge: '🛡️',
    desc: '人类最早冶炼的金属之一，用于焊料和镀锡'
  },
  {
    z: 51, symbol: 'Sb',
    electronConfig: '[Kr] 4d¹⁰ 5s² 5p³', name: '锑', nameEn: 'Antimony',
    category: 'metalloid', period: 5, group: 15, difficulty: 3,
    color: '#22c55e', badge: '🌿',
    desc: '阻燃剂的重要成分，古代用于化妆品'
  },
  {
    z: 52, symbol: 'Te',
    electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁴', name: '碲', nameEn: 'Tellurium',
    category: 'metalloid', period: 5, group: 16, difficulty: 3,
    color: '#22c55e', badge: '🌿',
    desc: '半导体材料，用于太阳能电池和热电转换器'
  },
  {
    z: 53, symbol: 'I',
    electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁵', name: '碘', nameEn: 'Iodine',
    category: 'halogen', period: 5, group: 17, difficulty: 3,
    color: '#a855f7', badge: '☠️',
    desc: '人体甲状腺激素的必需成分，预防甲状腺肿大'
  },
  {
    z: 54, symbol: 'Xe',
    electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁶', name: '氙', nameEn: 'Xenon',
    category: 'noble-gas', period: 5, group: 18, difficulty: 3,
    color: '#ec4899', badge: '👑',
    desc: '能形成化合物的惰性气体，用于氙灯和医学成像'
  },

  // ===== 第6周期 =====
  {
    z: 55, symbol: 'Cs',
    electronConfig: '[Xe] 6s¹', name: '铯', nameEn: 'Cesium',
    category: 'alkali-metal', period: 6, group: 1, difficulty: 4,
    color: '#ef4444', badge: '🔥',
    desc: '最活泼的天然金属，用于原子钟定义"秒"'
  },
  {
    z: 56, symbol: 'Ba',
    electronConfig: '[Xe] 6s²', name: '钡', nameEn: 'Barium',
    category: 'alkaline-earth', period: 6, group: 2, difficulty: 4,
    color: '#f97316', badge: '⚡',
    desc: '硫酸钡用作X射线造影剂，钡盐大多有毒'
  },
  // 镧系元素 (57-71)
  {
    z: 57, symbol: 'La',
    electronConfig: '[Xe] 5d¹ 6s²', name: '镧', nameEn: 'Lanthanum',
    category: 'lanthanide', period: 6, group: 3, difficulty: 4,
    color: '#d4a017', badge: '🌟',
    desc: '镧系元素之首，用于光学玻璃和催化剂'
  },
  {
    z: 58, symbol: 'Ce',
    electronConfig: '[Xe] 4f¹ 5d¹ 6s²', name: '铈', nameEn: 'Cerium',
    category: 'lanthanide', period: 6, group: 3, difficulty: 4,
    color: '#d4a017', badge: '🌟',
    desc: '最丰富的稀土元素，用于汽车尾气催化和打火石'
  },
  {
    z: 59, symbol: 'Pr',
    electronConfig: '[Xe] 4f³ 6s²', name: '镨', nameEn: 'Praseodymium',
    category: 'lanthanide', period: 6, group: 3, difficulty: 4,
    color: '#d4a017', badge: '🌟',
    desc: '用于制造高强度永磁体和特种玻璃'
  },
  {
    z: 60, symbol: 'Nd',
    electronConfig: '[Xe] 4f⁴ 6s²', name: '钕', nameEn: 'Neodymium',
    category: 'lanthanide', period: 6, group: 3, difficulty: 4,
    color: '#d4a017', badge: '🌟',
    desc: '制造强力钕铁硼永磁体，广泛用于电机和耳机'
  },
  {
    z: 61, symbol: 'Pm',
    electronConfig: '[Xe] 4f⁵ 6s²', name: '钷', nameEn: 'Promethium',
    category: 'lanthanide', period: 6, group: 3, difficulty: 4,
    color: '#d4a017', badge: '🌟',
    desc: '唯一具有放射性的镧系元素，用于核电池'
  },
  {
    z: 62, symbol: 'Sm',
    electronConfig: '[Xe] 4f⁶ 6s²', name: '钐', nameEn: 'Samarium',
    category: 'lanthanide', period: 6, group: 3, difficulty: 4,
    color: '#d4a017', badge: '🌟',
    desc: '用于钐钴永磁体和癌症放射治疗'
  },
  {
    z: 63, symbol: 'Eu',
    electronConfig: '[Xe] 4f⁷ 6s²', name: '铕', nameEn: 'Europium',
    category: 'lanthanide', period: 6, group: 3, difficulty: 4,
    color: '#d4a017', badge: '🌟',
    desc: '用于制造红色荧光粉，是彩色电视的关键材料'
  },
  {
    z: 64, symbol: 'Gd',
    electronConfig: '[Xe] 4f⁷ 5d¹ 6s²', name: '钆', nameEn: 'Gadolinium',
    category: 'lanthanide', period: 6, group: 3, difficulty: 4,
    color: '#d4a017', badge: '🌟',
    desc: 'MRI造影剂的重要成分，具有特殊磁性质'
  },
  {
    z: 65, symbol: 'Tb',
    electronConfig: '[Xe] 4f⁹ 6s²', name: '铽', nameEn: 'Terbium',
    category: 'lanthanide', period: 6, group: 3, difficulty: 4,
    color: '#d4a017', badge: '🌟',
    desc: '用于绿色荧光粉和节能灯，Tb-Dy合金用于声纳'
  },
  {
    z: 66, symbol: 'Dy',
    electronConfig: '[Xe] 4f¹⁰ 6s²', name: '镝', nameEn: 'Dysprosium',
    category: 'lanthanide', period: 6, group: 3, difficulty: 4,
    color: '#d4a017', badge: '🌟',
    desc: '用于高性能钕铁硼磁体添加和核反应堆控制棒'
  },
  {
    z: 67, symbol: 'Ho',
    electronConfig: '[Xe] 4f¹¹ 6s²', name: '钬', nameEn: 'Holmium',
    category: 'lanthanide', period: 6, group: 3, difficulty: 4,
    color: '#d4a017', badge: '🌟',
    desc: '拥有已知元素中最高的磁矩，用于磁极片'
  },
  {
    z: 68, symbol: 'Er',
    electronConfig: '[Xe] 4f¹² 6s²', name: '铒', nameEn: 'Erbium',
    category: 'lanthanide', period: 6, group: 3, difficulty: 4,
    color: '#d4a017', badge: '🌟',
    desc: '掺铒光纤放大器是光纤通信的核心技术'
  },
  {
    z: 69, symbol: 'Tm',
    electronConfig: '[Xe] 4f¹³ 6s²', name: '铥', nameEn: 'Thulium',
    category: 'lanthanide', period: 6, group: 3, difficulty: 4,
    color: '#d4a017', badge: '🌟',
    desc: '最稀少的镧系元素之一，用于便携式X射线设备'
  },
  {
    z: 70, symbol: 'Yb',
    electronConfig: '[Xe] 4f¹⁴ 6s²', name: '镱', nameEn: 'Ytterbium',
    category: 'lanthanide', period: 6, group: 3, difficulty: 4,
    color: '#d4a017', badge: '🌟',
    desc: '用于不锈钢改进和某些激光器的掺杂材料'
  },
  {
    z: 71, symbol: 'Lu',
    electronConfig: '[Xe] 4f¹⁴ 5d¹ 6s²', name: '镥', nameEn: 'Lutetium',
    category: 'lanthanide', period: 6, group: 3, difficulty: 4,
    color: '#d4a017', badge: '🌟',
    desc: '镧系最后一个元素，密度最大的稀土金属'
  },
  // 第6周期续 (72-86)
  {
    z: 72, symbol: 'Hf',
    electronConfig: '[Xe] 4f¹⁴ 5d² 6s²', name: '铪', nameEn: 'Hafnium',
    category: 'transition', period: 6, group: 4, difficulty: 4,
    color: '#3b82f6', badge: '⚔️',
    desc: '用于核反应堆控制棒和先进芯片栅极材料'
  },
  {
    z: 73, symbol: 'Ta',
    electronConfig: '[Xe] 4f¹⁴ 5d³ 6s²', name: '钽', nameEn: 'Tantalum',
    category: 'transition', period: 6, group: 5, difficulty: 4,
    color: '#3b82f6', badge: '⚔️',
    desc: '极其耐腐蚀的金属，用于手机电容和医疗植入物'
  },
  {
    z: 74, symbol: 'W',
    electronConfig: '[Xe] 4f¹⁴ 5d⁴ 6s²', name: '钨', nameEn: 'Tungsten',
    category: 'transition', period: 6, group: 6, difficulty: 4,
    color: '#3b82f6', badge: '⚔️',
    desc: '熔点最高的金属（3422°C），用于灯丝和切削工具'
  },
  {
    z: 75, symbol: 'Re',
    electronConfig: '[Xe] 4f¹⁴ 5d⁵ 6s²', name: '铼', nameEn: 'Rhenium',
    category: 'transition', period: 6, group: 7, difficulty: 4,
    color: '#3b82f6', badge: '⚔️',
    desc: '极其稀有的高熔点金属，用于喷气发动机合金'
  },
  {
    z: 76, symbol: 'Os',
    electronConfig: '[Xe] 4f¹⁴ 5d⁶ 6s²', name: '锇', nameEn: 'Osmium',
    category: 'transition', period: 6, group: 8, difficulty: 4,
    color: '#3b82f6', badge: '⚔️',
    desc: '密度最大的天然元素，四氧化锇有剧毒'
  },
  {
    z: 77, symbol: 'Ir',
    electronConfig: '[Xe] 4f¹⁴ 5d⁷ 6s²', name: '铱', nameEn: 'Iridium',
    category: 'transition', period: 6, group: 9, difficulty: 4,
    color: '#3b82f6', badge: '⚔️',
    desc: '极其坚硬耐腐蚀，用于火花塞和国际千克原器'
  },
  {
    z: 78, symbol: 'Pt',
    electronConfig: '[Xe] 4f¹⁴ 5d⁹ 6s¹', name: '铂', nameEn: 'Platinum',
    category: 'transition', period: 6, group: 10, difficulty: 4,
    color: '#3b82f6', badge: '⚔️',
    desc: '贵金属之王，用于珠宝首饰和汽车催化转化器'
  },
  {
    z: 79, symbol: 'Au',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', name: '金', nameEn: 'Gold',
    category: 'transition', period: 6, group: 11, difficulty: 4,
    color: '#3b82f6', badge: '⚔️',
    desc: '人类最早使用的贵金属，化学性质极其稳定'
  },
  {
    z: 80, symbol: 'Hg',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', name: '汞', nameEn: 'Mercury',
    category: 'transition', period: 6, group: 12, difficulty: 4,
    color: '#3b82f6', badge: '⚔️',
    desc: '常温下唯一的液态金属，曾用于温度计和血压计'
  },
  {
    z: 81, symbol: 'Tl',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', name: '铊', nameEn: 'Thallium',
    category: 'post-transition', period: 6, group: 13, difficulty: 4,
    color: '#06b6d4', badge: '🛡️',
    desc: '剧毒金属，曾用于灭鼠剂，现用于红外探测器'
  },
  {
    z: 82, symbol: 'Pb',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', name: '铅', nameEn: 'Lead',
    category: 'post-transition', period: 6, group: 14, difficulty: 4,
    color: '#06b6d4', badge: '🛡️',
    desc: '古代广泛使用的金属，曾用于水管和油漆'
  },
  {
    z: 83, symbol: 'Bi',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', name: '铋', nameEn: 'Bismuth',
    category: 'post-transition', period: 6, group: 15, difficulty: 4,
    color: '#06b6d4', badge: '🛡️',
    desc: '具有美丽的彩虹色氧化层，用于胃药和防火剂'
  },
  {
    z: 84, symbol: 'Po',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', name: '钋', nameEn: 'Polonium',
    category: 'metalloid', period: 6, group: 16, difficulty: 4,
    color: '#22c55e', badge: '🌿',
    desc: '居里夫人发现的强放射性元素，极其危险'
  },
  {
    z: 85, symbol: 'At',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', name: '砹', nameEn: 'Astatine',
    category: 'metalloid', period: 6, group: 17, difficulty: 4,
    color: '#22c55e', badge: '🌿',
    desc: '最稀少的天然元素之一，具有强放射性'
  },
  {
    z: 86, symbol: 'Rn',
    electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', name: '氡', nameEn: 'Radon',
    category: 'noble-gas', period: 6, group: 18, difficulty: 4,
    color: '#ec4899', badge: '👑',
    desc: '唯一的放射性惰性气体，是室内空气污染源之一'
  },

  // ===== 第7周期 =====
  {
    z: 87, symbol: 'Fr',
    electronConfig: '[Rn] 7s¹', name: '钫', nameEn: 'Francium',
    category: 'alkali-metal', period: 7, group: 1, difficulty: 5,
    color: '#ef4444', badge: '🔥',
    desc: '最活泼的碱金属，具有极强的放射性且极其稀有'
  },
  {
    z: 88, symbol: 'Ra',
    electronConfig: '[Rn] 7s²', name: '镭', nameEn: 'Radium',
    category: 'alkaline-earth', period: 7, group: 2, difficulty: 5,
    color: '#f97316', badge: '⚡',
    desc: '居里夫妇发现的放射性元素，曾用于夜光表盘'
  },
  // 锕系元素 (89-103)
  {
    z: 89, symbol: 'Ac',
    electronConfig: '[Rn] 6d¹ 7s²', name: '锕', nameEn: 'Actinium',
    category: 'actinide', period: 7, group: 3, difficulty: 5,
    color: '#b91c1c', badge: '☢️',
    desc: '锕系元素之首，具有强放射性，发出蓝白光'
  },
  {
    z: 90, symbol: 'Th',
    electronConfig: '[Rn] 6d² 7s²', name: '钍', nameEn: 'Thorium',
    category: 'actinide', period: 7, group: 3, difficulty: 5,
    color: '#b91c1c', badge: '☢️',
    desc: '潜在的核燃料，储量比铀更丰富'
  },
  {
    z: 91, symbol: 'Pa',
    electronConfig: '[Rn] 5f² 6d¹ 7s²', name: '镤', nameEn: 'Protactinium',
    category: 'actinide', period: 7, group: 3, difficulty: 5,
    color: '#b91c1c', badge: '☢️',
    desc: '极其稀少的放射性元素，在铀矿中以微量存在'
  },
  {
    z: 92, symbol: 'U',
    electronConfig: '[Rn] 5f³ 6d¹ 7s²', name: '铀', nameEn: 'Uranium',
    category: 'actinide', period: 7, group: 3, difficulty: 5,
    color: '#b91c1c', badge: '☢️',
    desc: '核能发电和核武器的主要原料'
  },
  {
    z: 93, symbol: 'Np',
    electronConfig: '[Rn] 5f⁴ 6d¹ 7s²', name: '镎', nameEn: 'Neptunium',
    category: 'actinide', period: 7, group: 3, difficulty: 5,
    color: '#b91c1c', badge: '☢️',
    desc: '第一个超铀元素，以海王星命名'
  },
  {
    z: 94, symbol: 'Pu',
    electronConfig: '[Rn] 5f⁶ 7s²', name: '钚', nameEn: 'Plutonium',
    category: 'actinide', period: 7, group: 3, difficulty: 5,
    color: '#b91c1c', badge: '☢️',
    desc: '核武器和太空探测器核电池的关键材料'
  },
  {
    z: 95, symbol: 'Am',
    electronConfig: '[Rn] 5f⁷ 7s²', name: '镅', nameEn: 'Americium',
    category: 'actinide', period: 7, group: 3, difficulty: 5,
    color: '#b91c1c', badge: '☢️',
    desc: '家用烟雾探测器中的放射性源，以美洲命名'
  },
  {
    z: 96, symbol: 'Cm',
    electronConfig: '[Rn] 5f⁷ 6d¹ 7s²', name: '锔', nameEn: 'Curium',
    category: 'actinide', period: 7, group: 3, difficulty: 5,
    color: '#b91c1c', badge: '☢️',
    desc: '以居里夫妇命名，用于深空探测器的同位素热源'
  },
  {
    z: 97, symbol: 'Bk',
    electronConfig: '[Rn] 5f⁹ 7s²', name: '锫', nameEn: 'Berkelium',
    category: 'actinide', period: 7, group: 3, difficulty: 5,
    color: '#b91c1c', badge: '☢️',
    desc: '以伯克利命名，首次在回旋加速器中合成'
  },
  {
    z: 98, symbol: 'Cf',
    electronConfig: '[Rn] 5f¹⁰ 7s²', name: '锎', nameEn: 'Californium',
    category: 'actinide', period: 7, group: 3, difficulty: 5,
    color: '#b91c1c', badge: '☢️',
    desc: '极强的中子发射源，用于核反应堆启动和癌症治疗'
  },
  {
    z: 99, symbol: 'Es',
    electronConfig: '[Rn] 5f¹¹ 7s²', name: '锿', nameEn: 'Einsteinium',
    category: 'actinide', period: 7, group: 3, difficulty: 5,
    color: '#b91c1c', badge: '☢️',
    desc: '以爱因斯坦命名，首次在氢弹试验残骸中发现'
  },
  {
    z: 100, symbol: 'Fm',
    electronConfig: '[Rn] 5f¹² 7s²', name: '镄', nameEn: 'Fermium',
    category: 'actinide', period: 7, group: 3, difficulty: 5,
    color: '#b91c1c', badge: '☢️',
    desc: '以费米命名，首次在氢弹爆炸产物中合成'
  },
  {
    z: 101, symbol: 'Md',
    electronConfig: '[Rn] 5f¹³ 7s²', name: '钔', nameEn: 'Mendelevium',
    category: 'actinide', period: 7, group: 3, difficulty: 5,
    color: '#b91c1c', badge: '☢️',
    desc: '以门捷列夫命名，元素周期表发现者'
  },
  {
    z: 102, symbol: 'No',
    electronConfig: '[Rn] 5f¹⁴ 7s²', name: '锘', nameEn: 'Nobelium',
    category: 'actinide', period: 7, group: 3, difficulty: 5,
    color: '#b91c1c', badge: '☢️',
    desc: '以诺贝尔命名，通过核反应人工合成'
  },
  {
    z: 103, symbol: 'Lr',
    electronConfig: '[Rn] 5f¹⁴ 7s² 7p¹', name: '铹', nameEn: 'Lawrencium',
    category: 'actinide', period: 7, group: 3, difficulty: 5,
    color: '#b91c1c', badge: '☢️',
    desc: '锕系最后一个元素，以劳伦斯命名'
  },
  // 第7周期续 - 超重过渡金属和后过渡金属 (104-118)
  {
    z: 104, symbol: 'Rf',
    electronConfig: '[Rn] 5f¹⁴ 6d² 7s²', name: '𬬻', nameEn: 'Rutherfordium',
    category: 'transition', period: 7, group: 4, difficulty: 5,
    color: '#3b82f6', badge: '⚔️',
    desc: '以卢瑟福命名，第一个超重过渡金属'
  },
  {
    z: 105, symbol: 'Db',
    electronConfig: '[Rn] 5f¹⁴ 6d³ 7s²', name: '𬭊', nameEn: 'Dubnium',
    category: 'transition', period: 7, group: 5, difficulty: 5,
    color: '#3b82f6', badge: '⚔️',
    desc: '以杜布纳研究所命名，人工合成的放射性元素'
  },
  {
    z: 106, symbol: 'Sg',
    electronConfig: '[Rn] 5f¹⁴ 6d⁴ 7s²', name: '𬭳', nameEn: 'Seaborgium',
    category: 'transition', period: 7, group: 6, difficulty: 5,
    color: '#3b82f6', badge: '⚔️',
    desc: '以西博格命名，他重新排列了元素周期表'
  },
  {
    z: 107, symbol: 'Bh',
    electronConfig: '[Rn] 5f¹⁴ 6d⁵ 7s²', name: '𬭛', nameEn: 'Bohrium',
    category: 'transition', period: 7, group: 7, difficulty: 5,
    color: '#3b82f6', badge: '⚔️',
    desc: '以玻尔命名，半衰期极短的超重元素'
  },
  {
    z: 108, symbol: 'Hs',
    electronConfig: '[Rn] 5f¹⁴ 6d⁶ 7s²', name: '𬭶', nameEn: 'Hassium',
    category: 'transition', period: 7, group: 8, difficulty: 5,
    color: '#3b82f6', badge: '⚔️',
    desc: '以黑森州命名，预测在室温下可能是固态金属'
  },
  {
    z: 109, symbol: 'Mt',
    electronConfig: '[Rn] 5f¹⁴ 6d⁷ 7s²', name: '鿏', nameEn: 'Meitnerium',
    category: 'transition', period: 7, group: 9, difficulty: 5,
    color: '#3b82f6', badge: '⚔️',
    desc: '以迈特纳命名，她发现了核裂变现象'
  },
  {
    z: 110, symbol: 'Ds',
    electronConfig: '[Rn] 5f¹⁴ 6d⁸ 7s²', name: '𫟼', nameEn: 'Darmstadtium',
    category: 'transition', period: 7, group: 10, difficulty: 5,
    color: '#3b82f6', badge: '⚔️',
    desc: '以达姆施塔特命名，仅能存在几分之一秒'
  },
  {
    z: 111, symbol: 'Rg',
    electronConfig: '[Rn] 5f¹⁴ 6d⁹ 7s²', name: '𬬭', nameEn: 'Roentgenium',
    category: 'transition', period: 7, group: 11, difficulty: 5,
    color: '#3b82f6', badge: '⚔️',
    desc: '以伦琴命名，X射线的发现者'
  },
  {
    z: 112, symbol: 'Cn',
    electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s²', name: '鿔', nameEn: 'Copernicium',
    category: 'transition', period: 7, group: 12, difficulty: 5,
    color: '#3b82f6', badge: '⚔️',
    desc: '以哥白尼命名，预测性质类似汞'
  },
  {
    z: 113, symbol: 'Nh',
    electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', name: '鿭', nameEn: 'Nihonium',
    category: 'post-transition', period: 7, group: 13, difficulty: 5,
    color: '#06b6d4', badge: '🛡️',
    desc: '以日本命名（Nihon），首个由亚洲国家发现的元素'
  },
  {
    z: 114, symbol: 'Fl',
    electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', name: '𫓧', nameEn: 'Flerovium',
    category: 'post-transition', period: 7, group: 14, difficulty: 5,
    color: '#06b6d4', badge: '🛡️',
    desc: '以弗列罗夫命名，预测可能具有惰性气体性质'
  },
  {
    z: 115, symbol: 'Mc',
    electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', name: '镆', nameEn: 'Moscovium',
    category: 'post-transition', period: 7, group: 15, difficulty: 5,
    color: '#06b6d4', badge: '🛡️',
    desc: '以莫斯科命名，人工合成的超重后过渡金属'
  },
  {
    z: 116, symbol: 'Lv',
    electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', name: '𫟷', nameEn: 'Livermorium',
    category: 'post-transition', period: 7, group: 16, difficulty: 5,
    color: '#06b6d4', badge: '🛡️',
    desc: '以利弗莫尔命名，存在时间不足一毫秒'
  },
  {
    z: 117, symbol: 'Ts',
    electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', name: '鿬', nameEn: 'Tennessine',
    category: 'halogen', period: 7, group: 17, difficulty: 5,
    color: '#a855f7', badge: '☠️',
    desc: '以田纳西州命名，第二个卤族超重元素'
  },
  {
    z: 118, symbol: 'Og',
    electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', name: '鿫', nameEn: 'Oganesson',
    category: 'noble-gas', period: 7, group: 18, difficulty: 5,
    color: '#ec4899', badge: '👑',
    desc: '元素周期表的最后一个元素，以奥甘尼相命名'
  }
];