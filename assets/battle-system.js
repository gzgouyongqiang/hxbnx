/**
 * battle-system.js — 元素徽章对战系统
 * 与炼丹炉(alchemy.js)和游戏系统(game.js)配合工作
 *
 * 核心循环：
 *   学习获得积分 → 积分用于炼丹获得宠物 → 宠物进化变强 → 用宠物对战 → 胜利获得元素徽章
 * 终极目标：集齐118种元素徽章
 *
 * localStorage key: hxbnx_game_v2（与 game.js 和 alchemy.js 共享）
 * 依赖：ALCHEMY_SYSTEM（alchemy.js）、ELEMENTS_DATA（elements-data.js）
 */

var BATTLE_SYSTEM = (function() {
  var KEY = 'hxbnx_game_v2';

  // ===== 元素分类（用于徽章统计）=====
  var ELEMENT_CATEGORIES = {
    nm: '非金属',   // nonmetal
    am: '碱金属',   // alkali metal
    ae: '碱土金属', // alkaline earth
    tm: '过渡金属', // transition metal
    me: '类金属',   // metalloid
    pm: '后过渡金属', // post-transition metal
    ng: '稀有气体', // noble gas
    la: '镧系',     // lanthanide
    ac: '锕系'      // actinide
  };

  // ===== 元素难度配置 =====
  // 难度1: H-Ca (原子序数1-20)，难度2: Sc-Kr (21-36)，难度3: Rb-Xe (37-54)，难度4: Cs-Rn (55-86)，难度5: Fr-Og (87-118)
  var DIFFICULTY_RANGES = [
    { difficulty: 1, minZ: 1,  maxZ: 20,  name: '基础元素', unlockReq: 0 },
    { difficulty: 2, minZ: 21, maxZ: 36,  name: '进阶元素', unlockReq: 10 },
    { difficulty: 3, minZ: 37, maxZ: 54,  name: '高级元素', unlockReq: 20 },
    { difficulty: 4, minZ: 55, maxZ: 86,  name: '稀有元素', unlockReq: 40 },
    { difficulty: 5, minZ: 87, maxZ: 118, name: '传说元素', unlockReq: 60 }
  ];

  // ===== AI对手稀有度配置（根据元素难度）=====
  var AI_RARITY_RANGE = {
    1: { min: 1, max: 2 },  // 普通宠物
    2: { min: 2, max: 3 },  // 稀有宠物
    3: { min: 3, max: 4 },  // 史诗宠物
    4: { min: 4, max: 5 },  // 传说宠物
    5: { min: 5, max: 5 }   // 神话宠物
  };

  // ===== 属性克制关系（基于化学原理）=====
  // 攻击方类型 -> 被克制方类型
  var TYPE_ADVANTAGE = {
    metal:    ['nonmetal'],           // 金属克非金属（金属活动性）
    acid:     ['base'],               // 酸克碱（中和反应）
    base:     ['oxide', 'acid'],      // 碱克酸酐/酸性氧化物，碱也克酸（双向中和）
    oxide:    ['organic'],            // 氧化物氧化有机物
    nonmetal: ['noble'],              // 非金属与稀有气体反应（如氟化氙）
    noble:    ['special'],            // 稀有气体特殊反应
    special:  ['metal'],              // 氧化剂克还原剂（特殊->金属）
    salt:     ['acid'],              // 盐类缓冲酸
    organic:  ['salt']               // 有机物与盐反应
  };

  // ===== 对战积分奖励配置 =====
  var BATTLE_REWARDS = {
    1: { winScore: 15, loseScore: 3 },   // 难度1
    2: { winScore: 30, loseScore: 5 },   // 难度2
    3: { winScore: 50, loseScore: 8 },   // 难度3
    4: { winScore: 80, loseScore: 12 },  // 难度4
    5: { winScore: 120, loseScore: 15 }  // 难度5
  };

  // ===== 当前活跃对战（内存中，不持久化）=====
  var activeBattles = {};  // { battleId: battleState }

  // ===== 工具函数 =====

  /** 从 localStorage 读取共享存档 */
  function defaultState() {
    return {
      checkinDates: [], currentStreak: 0, maxStreak: 0,
      totalExp: 0, wrongQuestions: [], clearedWrong: 0,
      score: 0, clearedQuests: [], version: 5,
      weekTasks: {}, dailyPracticeDone: {}, lastCheckinReward: '',
      petCollection: {}, pets: [],
      alchemyExp: 0, alchemyTotalCount: 0, alchemyDailyCount: 0, alchemyLastDate: '',
      elementBadges: {}, battleRecord: { wins: 0, losses: 0 }
    };
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) {
        var def = defaultState();
        save(def);
        return def;
      }
      var parsed = JSON.parse(raw);
      var def = defaultState();
      for (var key in def) {
        if (!(key in parsed)) parsed[key] = def[key];
      }
      return parsed;
    } catch (e) {
      var def = defaultState();
      save(def);
      return def;
    }
  }

  /** 写入共享存档到 localStorage */
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  /** 获取今天日期字符串 YYYY-MM-DD */
  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  /** 生成唯一对战ID */
  function generateBattleId() {
    return 'battle_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
  }

  /** 获取元素的难度等级 */
  function getElementDifficulty(z) {
    for (var i = 0; i < DIFFICULTY_RANGES.length; i++) {
      if (z >= DIFFICULTY_RANGES[i].minZ && z <= DIFFICULTY_RANGES[i].maxZ) {
        return DIFFICULTY_RANGES[i].difficulty;
      }
    }
    return 1;
  }

  /** 获取元素数据（从 ELEMENTS_DATA） */
  function getElementData(elementId) {
    if (typeof ELEMENTS_DATA !== 'undefined' && ELEMENTS_DATA) {
      for (var i = 0; i < ELEMENTS_DATA.length; i++) {
        if ((ELEMENTS_DATA[i].sym || ELEMENTS_DATA[i].symbol) === elementId) return ELEMENTS_DATA[i];
      }
    }
    // 如果 ELEMENTS_DATA 不可用，用内置的118元素基础数据
    return getBuiltinElement(elementId);
  }

  /** 内置的118元素基础数据（备用，当 ELEMENTS_DATA 未加载时使用） */
  var BUILTIN_ELEMENTS = [
    {sym:'H',name:'氢',num:1,cat:'nm',stars:1},{sym:'He',name:'氦',num:2,cat:'ng',stars:1},
    {sym:'Li',name:'锂',num:3,cat:'am',stars:2},{sym:'Be',name:'铍',num:4,cat:'ae',stars:2},
    {sym:'B',name:'硼',num:5,cat:'me',stars:2},{sym:'C',name:'碳',num:6,cat:'nm',stars:1},
    {sym:'N',name:'氮',num:7,cat:'nm',stars:1},{sym:'O',name:'氧',num:8,cat:'nm',stars:1},
    {sym:'F',name:'氟',num:9,cat:'nm',stars:2},{sym:'Ne',name:'氖',num:10,cat:'ng',stars:2},
    {sym:'Na',name:'钠',num:11,cat:'am',stars:2},{sym:'Mg',name:'镁',num:12,cat:'ae',stars:2},
    {sym:'Al',name:'铝',num:13,cat:'pm',stars:2},{sym:'Si',name:'硅',num:14,cat:'me',stars:2},
    {sym:'P',name:'磷',num:15,cat:'nm',stars:2},{sym:'S',name:'硫',num:16,cat:'nm',stars:2},
    {sym:'Cl',name:'氯',num:17,cat:'nm',stars:2},{sym:'Ar',name:'氩',num:18,cat:'ng',stars:2},
    {sym:'K',name:'钾',num:19,cat:'am',stars:2},{sym:'Ca',name:'钙',num:20,cat:'ae',stars:2},
    {sym:'Sc',name:'钪',num:21,cat:'tm',stars:3},{sym:'Ti',name:'钛',num:22,cat:'tm',stars:3},
    {sym:'V',name:'钒',num:23,cat:'tm',stars:3},{sym:'Cr',name:'铬',num:24,cat:'tm',stars:3},
    {sym:'Mn',name:'锰',num:25,cat:'tm',stars:3},{sym:'Fe',name:'铁',num:26,cat:'tm',stars:3},
    {sym:'Co',name:'钴',num:27,cat:'tm',stars:3},{sym:'Ni',name:'镍',num:28,cat:'tm',stars:3},
    {sym:'Cu',name:'铜',num:29,cat:'tm',stars:3},{sym:'Zn',name:'锌',num:30,cat:'tm',stars:3},
    {sym:'Ga',name:'镓',num:31,cat:'pm',stars:3},{sym:'Ge',name:'锗',num:32,cat:'me',stars:3},
    {sym:'As',name:'砷',num:33,cat:'me',stars:3},{sym:'Se',name:'硒',num:34,cat:'nm',stars:3},
    {sym:'Br',name:'溴',num:35,cat:'nm',stars:3},{sym:'Kr',name:'氪',num:36,cat:'ng',stars:3},
    {sym:'Rb',name:'铷',num:37,cat:'am',stars:3},{sym:'Sr',name:'锶',num:38,cat:'ae',stars:3},
    {sym:'Y',name:'钇',num:39,cat:'tm',stars:3},{sym:'Zr',name:'锆',num:40,cat:'tm',stars:3},
    {sym:'Nb',name:'铌',num:41,cat:'tm',stars:3},{sym:'Mo',name:'钼',num:42,cat:'tm',stars:3},
    {sym:'Tc',name:'锝',num:43,cat:'tm',stars:3},{sym:'Ru',name:'钌',num:44,cat:'tm',stars:3},
    {sym:'Rh',name:'铑',num:45,cat:'tm',stars:3},{sym:'Pd',name:'钯',num:46,cat:'tm',stars:3},
    {sym:'Ag',name:'银',num:47,cat:'tm',stars:3},{sym:'Cd',name:'镉',num:48,cat:'tm',stars:3},
    {sym:'In',name:'铟',num:49,cat:'pm',stars:3},{sym:'Sn',name:'锡',num:50,cat:'pm',stars:3},
    {sym:'Sb',name:'锑',num:51,cat:'me',stars:3},{sym:'Te',name:'碲',num:52,cat:'me',stars:3},
    {sym:'I',name:'碘',num:53,cat:'nm',stars:3},{sym:'Xe',name:'氙',num:54,cat:'ng',stars:3},
    {sym:'Cs',name:'铯',num:55,cat:'am',stars:4},{sym:'Ba',name:'钡',num:56,cat:'ae',stars:4},
    {sym:'La',name:'镧',num:57,cat:'la',stars:4},{sym:'Ce',name:'铈',num:58,cat:'la',stars:4},
    {sym:'Pr',name:'镨',num:59,cat:'la',stars:4},{sym:'Nd',name:'钕',num:60,cat:'la',stars:4},
    {sym:'Pm',name:'钷',num:61,cat:'la',stars:4},{sym:'Sm',name:'钐',num:62,cat:'la',stars:4},
    {sym:'Eu',name:'铕',num:63,cat:'la',stars:4},{sym:'Gd',name:'钆',num:64,cat:'la',stars:4},
    {sym:'Tb',name:'铽',num:65,cat:'la',stars:4},{sym:'Dy',name:'镝',num:66,cat:'la',stars:4},
    {sym:'Ho',name:'钬',num:67,cat:'la',stars:4},{sym:'Er',name:'铒',num:68,cat:'la',stars:4},
    {sym:'Tm',name:'铥',num:69,cat:'la',stars:4},{sym:'Yb',name:'镱',num:70,cat:'la',stars:4},
    {sym:'Lu',name:'镥',num:71,cat:'la',stars:4},{sym:'Hf',name:'铪',num:72,cat:'tm',stars:4},
    {sym:'Ta',name:'钽',num:73,cat:'tm',stars:4},{sym:'W',name:'钨',num:74,cat:'tm',stars:4},
    {sym:'Re',name:'铼',num:75,cat:'tm',stars:4},{sym:'Os',name:'锇',num:76,cat:'tm',stars:4},
    {sym:'Ir',name:'铱',num:77,cat:'tm',stars:4},{sym:'Pt',name:'铂',num:78,cat:'tm',stars:4},
    {sym:'Au',name:'金',num:79,cat:'tm',stars:4},{sym:'Hg',name:'汞',num:80,cat:'tm',stars:4},
    {sym:'Tl',name:'铊',num:81,cat:'pm',stars:4},{sym:'Pb',name:'铅',num:82,cat:'pm',stars:4},
    {sym:'Bi',name:'铋',num:83,cat:'pm',stars:4},{sym:'Po',name:'钋',num:84,cat:'pm',stars:4},
    {sym:'At',name:'砹',num:85,cat:'nm',stars:4},{sym:'Rn',name:'氡',num:86,cat:'ng',stars:4},
    {sym:'Fr',name:'钫',num:87,cat:'am',stars:5},{sym:'Ra',name:'镭',num:88,cat:'ae',stars:5},
    {sym:'Ac',name:'锕',num:89,cat:'ac',stars:5},{sym:'Th',name:'钍',num:90,cat:'ac',stars:5},
    {sym:'Pa',name:'镤',num:91,cat:'ac',stars:5},{sym:'U',name:'铀',num:92,cat:'ac',stars:5},
    {sym:'Np',name:'镎',num:93,cat:'ac',stars:5},{sym:'Pu',name:'钚',num:94,cat:'ac',stars:5},
    {sym:'Am',name:'镅',num:95,cat:'ac',stars:5},{sym:'Cm',name:'锔',num:96,cat:'ac',stars:5},
    {sym:'Bk',name:'锫',num:97,cat:'ac',stars:5},{sym:'Cf',name:'锎',num:98,cat:'ac',stars:5},
    {sym:'Es',name:'锿',num:99,cat:'ac',stars:5},{sym:'Fm',name:'镄',num:100,cat:'ac',stars:5},
    {sym:'Md',name:'钔',num:101,cat:'ac',stars:5},{sym:'No',name:'锘',num:102,cat:'ac',stars:5},
    {sym:'Lr',name:'铹',num:103,cat:'ac',stars:5},{sym:'Rf',name:'鑪',num:104,cat:'tm',stars:5},
    {sym:'Db',name:'𨧀',num:105,cat:'tm',stars:5},{sym:'Sg',name:'𨭎',num:106,cat:'tm',stars:5},
    {sym:'Bh',name:'𨨏',num:107,cat:'tm',stars:5},{sym:'Hs',name:'𨭆',num:108,cat:'tm',stars:5},
    {sym:'Mt',name:'鿏',num:109,cat:'tm',stars:5},{sym:'Ds',name:'𫟼',num:110,cat:'tm',stars:5},
    {sym:'Rg',name:'𬬭',num:111,cat:'tm',stars:5},{sym:'Cn',name:'鿔',num:112,cat:'tm',stars:5},
    {sym:'Nh',name:'鿭',num:113,cat:'pm',stars:5},{sym:'Fl',name:'𫓧',num:114,cat:'pm',stars:5},
    {sym:'Mc',name:'镆',num:115,cat:'pm',stars:5},{sym:'Lv',name:'𫟷',num:116,cat:'pm',stars:5},
    {sym:'Ts',name:'鿬',num:117,cat:'nm',stars:5},{sym:'Og',name:'鿫',num:118,cat:'ng',stars:5}
  ];

  function getBuiltinElement(elementId) {
    for (var i = 0; i < BUILTIN_ELEMENTS.length; i++) {
      if (BUILTIN_ELEMENTS[i].sym === elementId) return BUILTIN_ELEMENTS[i];
    }
    return null;
  }

  /** 获取宠物定义（从 ALCHEMY_SYSTEM 的 PET_DB） */
  function getPetDef(petId) {
    if (typeof ALCHEMY_SYSTEM !== 'undefined' && ALCHEMY_SYSTEM.getPetById) {
      return ALCHEMY_SYSTEM.getPetById(petId);
    }
    return null;
  }

  /** 获取全部宠物数据库 */
  function getAllPets() {
    if (typeof ALCHEMY_SYSTEM !== 'undefined' && ALCHEMY_SYSTEM.getPetDB) {
      return ALCHEMY_SYSTEM.getPetDB();
    }
    return [];
  }

  // ===== 属性克制计算 =====

  /**
   * 计算属性克制倍率
   * @param {string} attackerType - 攻击方宠物类型
   * @param {string} defenderType - 防御方宠物类型
   * @returns {number} 伤害倍率（1.5=克制, 0.7=被克制, 1.0=无克制）
   */
  function getTypeMultiplier(attackerType, defenderType) {
    if (attackerType === defenderType) return 1.0;

    // 检查是否克制对方
    var advantages = TYPE_ADVANTAGE[attackerType] || [];
    if (advantages.indexOf(defenderType) >= 0) return 1.5;

    // 检查是否被对方克制
    var defenderAdvantages = TYPE_ADVANTAGE[defenderType] || [];
    if (defenderAdvantages.indexOf(attackerType) >= 0) return 0.7;

    return 1.0;
  }

  // ===== 宠物属性计算 =====

  /**
   * 计算宠物的实际战斗属性
   * 宠物等级 = 该宠物收集数量（count）
   * 等级加成：每级 HP+5%, ATK+3%, DEF+3%, SPD+2%
   * 进化后的宠物属性为基础x1.5
   *
   * @param {string} petId - 宠物ID
   * @returns {object|null} 计算后的战斗属性 { hp, atk, def, spd, level, isEvolved }
   */
  function calcPetStats(petId) {
    var def = getPetDef(petId);
    if (!def) return null;

    // 从存档获取宠物收集数量作为等级
    var s = load();
    var count = 1; // 默认等级1
    if (s && s.petCollection && s.petCollection[petId]) {
      count = s.petCollection[petId].count || 1;
    }

    // 判断是否为进化宠物（有 evolveFrom 字段说明是进化后的）
    var isEvolved = !!def.evolveFrom;

    // 基础属性
    var baseHp = def.hp || 40;
    var baseAtk = def.atk || 20;
    var baseDef = def.def || 10;
    var baseSpd = def.spd || 15; // 如果宠物没有 spd 字段，使用默认值

    // 进化加成：进化后属性为基础x1.5
    if (isEvolved) {
      baseHp = Math.floor(baseHp * 1.5);
      baseAtk = Math.floor(baseAtk * 1.5);
      baseDef = Math.floor(baseDef * 1.5);
      baseSpd = Math.floor(baseSpd * 1.5);
    }

    // 等级加成：每级 HP+5%, ATK+3%, DEF+3%, SPD+2%
    var level = count;
    var hpMul = 1 + (level - 1) * 0.05;
    var atkMul = 1 + (level - 1) * 0.03;
    var defMul = 1 + (level - 1) * 0.03;
    var spdMul = 1 + (level - 1) * 0.02;

    return {
      hp: Math.floor(baseHp * hpMul),
      atk: Math.floor(baseAtk * atkMul),
      def: Math.floor(baseDef * defMul),
      spd: Math.floor(baseSpd * spdMul),
      level: level,
      isEvolved: isEvolved
    };
  }

  /**
   * 计算宠物综合战力
   * 战力 = HP + ATK*2 + DEF*2 + SPD*1.5
   *
   * @param {string} petId - 宠物ID
   * @returns {number} 综合战力值
   */
  function calcPetPower(petId) {
    var stats = calcPetStats(petId);
    if (!stats) return 0;
    return Math.floor(stats.hp + stats.atk * 2 + stats.def * 2 + stats.spd * 1.5);
  }

  // ===== AI对手生成 =====

  /**
   * 生成AI对手
   * AI宠物从PET_DB中选取，稀有度与元素难度相关
   * AI宠物等级 = 元素难度 * 3
   * AI名字格式："守护者·[元素名]"
   *
   * @param {string} elementId - 元素符号
   * @param {number} difficulty - 元素难度(1-5)
   * @returns {object} AI对手信息
   */
  function generateAIOpponent(elementId, difficulty) {
    var elemData = getElementData(elementId);
    var elemName = elemData ? elemData.name : elementId;

    // 根据难度选择稀有度范围
    var rarityRange = AI_RARITY_RANGE[difficulty] || AI_RARITY_RANGE[1];
    var allPets = getAllPets();

    // 筛选符合稀有度的宠物
    var pool = [];
    for (var i = 0; i < allPets.length; i++) {
      if (allPets[i].rarity >= rarityRange.min && allPets[i].rarity <= rarityRange.max) {
        pool.push(allPets[i]);
      }
    }
    // 如果池子为空，使用全部宠物
    if (pool.length === 0) pool = allPets;
    if (pool.length === 0) {
      // 极端情况：PET_DB 不可用，生成一个默认AI宠物
      return {
        name: '守护者·' + elemName,
        elementId: elementId,
        difficulty: difficulty,
        pet: {
          id: 'unknown_ai',
          name: '神秘守护者',
          formula: elementId,
          type: 'special',
          rarity: difficulty,
          hp: 50 * difficulty,
          atk: 25 * difficulty,
          def: 15 * difficulty,
          spd: 20 * difficulty,
          skill: '元素之力',
          skillDesc: '守护者的力量'
        },
        level: difficulty * 3
      };
    }

    // 随机选择一只宠物
    var chosen = pool[Math.floor(Math.random() * pool.length)];

    // AI宠物等级 = 元素难度 * 3
    var aiLevel = difficulty * 3;

    // 计算AI宠物属性（使用等级加成，但不依赖存档中的count）
    var baseHp = chosen.hp || 40;
    var baseAtk = chosen.atk || 20;
    var baseDef = chosen.def || 10;
    var baseSpd = chosen.spd || 15;

    var hpMul = 1 + (aiLevel - 1) * 0.05;
    var atkMul = 1 + (aiLevel - 1) * 0.03;
    var defMul = 1 + (aiLevel - 1) * 0.03;
    var spdMul = 1 + (aiLevel - 1) * 0.02;

    return {
      name: '守护者·' + elemName,
      elementId: elementId,
      difficulty: difficulty,
      pet: {
        id: chosen.id,
        name: chosen.name,
        formula: chosen.formula,
        type: chosen.type,
        rarity: chosen.rarity,
        icon: chosen.icon,
        hp: Math.floor(baseHp * hpMul),
        atk: Math.floor(baseAtk * atkMul),
        def: Math.floor(baseDef * defMul),
        spd: Math.floor(baseSpd * spdMul),
        skill: chosen.skill,
        skillDesc: chosen.skillDesc,
        voice: chosen.voice
      },
      level: aiLevel
    };
  }

  // ===== 伤害计算 =====

  /**
   * 计算单次攻击伤害
   * 公式：damage = ATK * (1 + random*0.2) - DEF*0.5
   * 然后应用属性克制加成
   *
   * @param {object} attacker - 攻击方 { atk, type }
   * @param {object} defender - 防御方 { def, type }
   * @param {boolean} useSkill - 是否使用技能
   * @returns {object} { damage, typeMultiplier, isCrit }
   */
  function calcDamage(attacker, defender, useSkill) {
    // 基础伤害公式
    var randomFactor = 1 + Math.random() * 0.2;
    var baseDamage = attacker.atk * randomFactor - defender.def * 0.5;

    // 技能伤害加成（技能伤害为基础的1.3倍）
    var skillMultiplier = useSkill ? 1.3 : 1.0;

    // 属性克制倍率
    var typeMultiplier = getTypeMultiplier(attacker.type, defender.type);

    // 暴击判定（10%概率，暴击伤害x1.5）
    var isCrit = Math.random() < 0.1;
    var critMultiplier = isCrit ? 1.5 : 1.0;

    // 最终伤害（最低为1）
    var finalDamage = Math.max(1, Math.floor(
      baseDamage * skillMultiplier * typeMultiplier * critMultiplier
    ));

    return {
      damage: finalDamage,
      typeMultiplier: typeMultiplier,
      isCrit: isCrit,
      useSkill: useSkill
    };
  }

  // ===== 对战状态管理 =====

  /**
   * 创建对战状态
   * @param {string} battleId - 对战ID
   * @param {object} myPet - 玩家宠物（含计算后的属性）
   * @param {object} aiOpponent - AI对手信息
   * @param {string} elementId - 关联的元素符号
   * @returns {object} 对战状态
   */
  function createBattleState(battleId, myPet, aiOpponent, elementId) {
    var aiPet = aiOpponent.pet;

    return {
      battleId: battleId,
      elementId: elementId,
      difficulty: aiOpponent.difficulty,

      // 玩家宠物
      player: {
        petId: myPet.id,
        name: myPet.name,
        formula: myPet.formula,
        type: myPet.type,
        icon: myPet.icon,
        skill: myPet.skill,
        skillDesc: myPet.skillDesc,
        hp: myPet.hp,
        maxHp: myPet.hp,
        atk: myPet.atk,
        def: myPet.def,
        spd: myPet.spd,
        level: myPet.level,
        isDefending: false  // 本回合是否选择防御
      },

      // AI宠物
      enemy: {
        petId: aiPet.id,
        name: aiOpponent.name,
        formula: aiPet.formula,
        type: aiPet.type,
        icon: aiPet.icon,
        skill: aiPet.skill,
        skillDesc: aiPet.skillDesc,
        hp: aiPet.hp,
        maxHp: aiPet.hp,
        atk: aiPet.atk,
        def: aiPet.def,
        spd: aiPet.spd,
        level: aiOpponent.level,
        isDefending: false
      },

      // 对战信息
      turn: 1,
      status: 'active',  // active | win | lose
      logs: [],          // 对战日志
      score: 0            // 本场获得的积分
    };
  }

  // ===== AI行动选择 =====

  /**
   * AI自动选择行动
   * AI策略：根据HP比例和属性克制关系选择最优行动
   *
   * @param {object} ai - AI宠物状态
   * @param {object} player - 玩家宠物状态
   * @returns {string} 行动类型：attack/skill/defend
   */
  function aiChooseAction(ai, player) {
    var hpRatio = ai.hp / ai.maxHp;
    var typeMul = getTypeMultiplier(ai.type, player.type);

    // HP低于20%时有概率防御
    if (hpRatio < 0.2 && Math.random() < 0.4) return 'defend';

    // 属性克制时更倾向使用技能
    if (typeMul >= 1.5 && Math.random() < 0.6) return 'skill';

    // 正常情况：30%概率使用技能，10%概率防御，60%普通攻击
    var r = Math.random();
    if (r < 0.3) return 'skill';
    if (r < 0.4) return 'defend';
    return 'attack';
  }

  // ===== 执行回合 =====

  /**
   * 执行一个回合
   * 行动类型：attack（普通攻击）/ skill（使用技能）/ defend（防御，本回合受到伤害减半）
   *
   * @param {string} battleId - 对战ID
   * @param {string} action - 玩家行动：attack/skill/defend
   * @returns {object} 回合结果
   */
  function executeTurn(battleId, action) {
    var battle = activeBattles[battleId];
    if (!battle || battle.status !== 'active') {
      return { ok: false, msg: '对战不存在或已结束' };
    }

    var logs = [];
    var player = battle.player;
    var enemy = battle.enemy;

    // 重置防御状态
    player.isDefending = false;
    enemy.isDefending = false;

    // 玩家行动
    if (action === 'defend') {
      player.isDefending = true;
      logs.push({
        turn: battle.turn,
        actor: 'player',
        action: 'defend',
        msg: player.name + ' 选择了防御姿态！'
      });
    } else {
      var useSkill = (action === 'skill');
      var pResult = calcDamage(player, enemy, useSkill);

      // 防御减半
      if (enemy.isDefending) {
        pResult.damage = Math.floor(pResult.damage * 0.5);
      }

      enemy.hp = Math.max(0, enemy.hp - pResult.damage);

      var pMsg = player.name + (useSkill ? ' 使用了【' + player.skill + '】' : ' 发动了攻击') +
        '，造成 ' + pResult.damage + ' 点伤害！';
      if (pResult.typeMultiplier >= 1.5) pMsg += '（属性克制！）';
      if (pResult.typeMultiplier <= 0.7) pMsg += '（属性被克制...）';
      if (pResult.isCrit) pMsg += '（暴击！）';

      logs.push({
        turn: battle.turn,
        actor: 'player',
        action: action,
        damage: pResult.damage,
        typeMultiplier: pResult.typeMultiplier,
        isCrit: pResult.isCrit,
        msg: pMsg,
        enemyHp: enemy.hp,
        enemyMaxHp: enemy.maxHp
      });
    }

    // 检查AI是否被击败
    if (enemy.hp <= 0) {
      battle.status = 'win';
      endBattle(battle, true);
      logs.push({
        turn: battle.turn,
        actor: 'system',
        msg: '守护者·' + getElementData(battle.elementId).name + ' 被击败了！胜利！'
      });
      battle.logs = battle.logs.concat(logs);
      return { ok: true, battle: battle, logs: logs, result: 'win' };
    }

    // AI行动
    var aiAction = aiChooseAction(enemy, player);

    if (aiAction === 'defend') {
      enemy.isDefending = true;
      logs.push({
        turn: battle.turn,
        actor: 'enemy',
        action: 'defend',
        msg: enemy.name + ' 选择了防御姿态！'
      });
    } else {
      var aiUseSkill = (aiAction === 'skill');
      var eResult = calcDamage(enemy, player, aiUseSkill);

      // 防御减半
      if (player.isDefending) {
        eResult.damage = Math.floor(eResult.damage * 0.5);
      }

      player.hp = Math.max(0, player.hp - eResult.damage);

      var eMsg = enemy.name + (aiUseSkill ? ' 使用了【' + enemy.skill + '】' : ' 发动了攻击') +
        '，造成 ' + eResult.damage + ' 点伤害！';
      if (eResult.typeMultiplier >= 1.5) eMsg += '（属性克制！）';
      if (eResult.typeMultiplier <= 0.7) eMsg += '（属性被克制...）';
      if (eResult.isCrit) eMsg += '（暴击！）';

      logs.push({
        turn: battle.turn,
        actor: 'enemy',
        action: aiAction,
        damage: eResult.damage,
        typeMultiplier: eResult.typeMultiplier,
        isCrit: eResult.isCrit,
        msg: eMsg,
        playerHp: player.hp,
        playerMaxHp: player.maxHp
      });
    }

    // 检查玩家是否被击败
    if (player.hp <= 0) {
      battle.status = 'lose';
      endBattle(battle, false);
      logs.push({
        turn: battle.turn,
        actor: 'system',
        msg: player.name + ' 倒下了...挑战失败！'
      });
      battle.logs = battle.logs.concat(logs);
      return { ok: true, battle: battle, logs: logs, result: 'lose' };
    }

    // 回合结束
    battle.turn++;
    battle.logs = battle.logs.concat(logs);

    return { ok: true, battle: battle, logs: logs, result: 'ongoing' };
  }

  // ===== 对战结算 =====

  /**
   * 对战结束处理
   * 胜利：获得元素徽章 + 积分奖励
   * 失败：获得少量安慰积分
   *
   * @param {object} battle - 对战状态
   * @param {boolean} isWin - 是否胜利
   */
  function endBattle(battle, isWin) {
    var s = load();
    if (!s) return;

    var difficulty = battle.difficulty;
    var rewards = BATTLE_REWARDS[difficulty] || BATTLE_REWARDS[1];

    if (isWin) {
      // 胜利奖励
      var scoreGain = rewards.winScore;

      // 记录元素徽章
      if (!s.elementBadges) s.elementBadges = {};
      s.elementBadges[battle.elementId] = {
        won: true,
        date: todayStr()
      };

      // 记录对战胜利次数
      if (!s.battleWins) s.battleWins = 0;
      s.battleWins++;

      battle.score = scoreGain;
    } else {
      // 失败安慰积分
      var scoreGain = rewards.loseScore;
      battle.score = scoreGain;
    }

    // 增加积分
    s.score = (s.score || 0) + scoreGain;
    s.totalExp = (s.totalExp || 0) + scoreGain;

    save(s);
  }

  // ===== 徽章系统 =====

  /**
   * 获取已收集的徽章
   * @returns {object} { elementId: { won, date } }
   */
  function getBadges() {
    var s = load();
    return (s && s.elementBadges) ? s.elementBadges : {};
  }

  /**
   * 获取徽章统计信息
   * @returns {object} { total, byCategory, byDifficulty }
   */
  function getBadgeStats() {
    var badges = getBadges();
    var stats = {
      total: 0,
      byCategory: {},
      byDifficulty: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };

    for (var elemId in badges) {
      if (!badges[elemId].won) continue;
      stats.total++;

      // 按分类统计
      var elemData = getElementData(elemId);
      if (elemData) {
        var cat = elemData.cat || 'unknown';
        stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;

        // 按难度统计
        var diff = getElementDifficulty(elemData.num || elemData.z);
        stats.byDifficulty[diff] = (stats.byDifficulty[diff] || 0) + 1;
      }
    }

    return stats;
  }

  /**
   * 检查某个难度是否已解锁
   * 难度1：初始可用
   * 难度2：需要10个难度1徽章
   * 难度3：需要20个总徽章
   * 难度4：需要40个总徽章
   * 难度5：需要60个总徽章
   *
   * @param {number} difficulty - 难度等级(1-5)
   * @returns {boolean} 是否已解锁
   */
  function isDifficultyUnlocked(difficulty) {
    if (difficulty <= 1) return true;

    var stats = getBadgeStats();

    switch (difficulty) {
      case 2: return stats.byDifficulty[1] >= 10;  // 需要10个难度1徽章
      case 3: return stats.total >= 20;              // 需要20个总徽章
      case 4: return stats.total >= 40;              // 需要40个总徽章
      case 5: return stats.total >= 60;              // 需要60个总徽章
      default: return false;
    }
  }

  /**
   * 获取可挑战的元素列表
   * 只返回已解锁难度中尚未获得徽章的元素
   *
   * @returns {Array} 可挑战的元素列表
   */
  function getAvailableElements() {
    var badges = getBadges();
    var result = [];

    // 遍历所有118个元素
    var allElems = (typeof ELEMENTS_DATA !== 'undefined' && ELEMENTS_DATA)
      ? ELEMENTS_DATA
      : BUILTIN_ELEMENTS;

    for (var i = 0; i < allElems.length; i++) {
      var elem = allElems[i];
      // 兼容 ELEMENTS_DATA(z/symbol/category) 和 BUILTIN_ELEMENTS(num/sym/cat)
      var eNum = elem.num || elem.z;
      var eSym = elem.sym || elem.symbol;
      var eName = elem.name;
      var eCat = elem.cat || elem.category;
      var difficulty = getElementDifficulty(eNum);

      // 检查难度是否已解锁
      if (!isDifficultyUnlocked(difficulty)) continue;

      // 检查是否已获得徽章
      var alreadyWon = badges[eSym] && badges[eSym].won;

      result.push({
        sym: eSym,
        name: eName,
        num: eNum,
        cat: eCat,
        stars: elem.stars || elem.difficulty || 1,
        difficulty: difficulty,
        alreadyWon: !!alreadyWon,
        wonDate: alreadyWon ? badges[eSym].date : null
      });
    }

    return result;
  }

  // ===== 获取玩家对战宠物列表 =====

  /**
   * 获取玩家的对战宠物列表（含等级和属性计算）
   * 只返回玩家已拥有的宠物
   *
   * @returns {Array} 宠物列表
   */
  function getMyBattlePets() {
    var s = load();
    if (!s || !s.petCollection) return [];

    var result = [];
    for (var petId in s.petCollection) {
      var def = getPetDef(petId);
      if (!def) continue;

      var stats = calcPetStats(petId);
      var power = calcPetPower(petId);

      result.push({
        id: petId,
        name: def.name,
        formula: def.formula,
        type: def.type,
        rarity: def.rarity,
        icon: def.icon,
        skill: def.skill,
        skillDesc: def.skillDesc,
        voice: def.voice,
        count: s.petCollection[petId].count,
        firstDate: s.petCollection[petId].firstDate,
        // 计算后的战斗属性
        level: stats.level,
        hp: stats.hp,
        atk: stats.atk,
        def: stats.def,
        spd: stats.spd,
        isEvolved: stats.isEvolved,
        power: power
      });
    }

    // 按战力降序排列
    result.sort(function(a, b) { return b.power - a.power; });
    return result;
  }

  // ===== 开始对战 =====

  /**
   * 开始一场元素徽章对战
   *
   * @param {string} elementId - 要挑战的元素符号（如 'H', 'Fe'）
   * @param {string} myPetId - 玩家出战的宠物ID
   * @returns {object} { ok, battleState? , msg? }
   */
  function startBattle(elementId, myPetId) {
    // 验证元素
    var elemData = getElementData(elementId);
    if (!elemData) {
      return { ok: false, msg: '元素不存在：' + elementId };
    }

    // 验证难度是否解锁
    var difficulty = getElementDifficulty(elemData.num || elemData.z);
    if (!isDifficultyUnlocked(difficulty)) {
      return { ok: false, msg: '该难度尚未解锁！需要先收集更多低难度徽章。' };
    }

    // 验证是否已获得该徽章
    var badges = getBadges();
    if (badges[elementId] && badges[elementId].won) {
      return { ok: false, msg: '你已经获得了 ' + elemData.name + ' 的徽章！' };
    }

    // 验证玩家是否拥有该宠物
    var s = load();
    if (!s || !s.petCollection || !s.petCollection[myPetId]) {
      return { ok: false, msg: '你没有这只宠物！请先通过炼丹获得宠物。' };
    }

    // 获取玩家宠物属性
    var petDef = getPetDef(myPetId);
    if (!petDef) {
      return { ok: false, msg: '宠物数据异常：' + myPetId };
    }

    var petStats = calcPetStats(myPetId);

    var myPet = {
      id: petDef.id,
      name: petDef.name,
      formula: petDef.formula,
      type: petDef.type,
      icon: petDef.icon,
      skill: petDef.skill,
      skillDesc: petDef.skillDesc,
      voice: petDef.voice,
      hp: petStats.hp,
      atk: petStats.atk,
      def: petStats.def,
      spd: petStats.spd,
      level: petStats.level,
      isEvolved: petStats.isEvolved
    };

    // 生成AI对手
    var aiOpponent = generateAIOpponent(elementId, difficulty);

    // 创建对战
    var battleId = generateBattleId();
    var battleState = createBattleState(battleId, myPet, aiOpponent, elementId);

    // 存入活跃对战
    activeBattles[battleId] = battleState;

    return {
      ok: true,
      battleId: battleId,
      battleState: battleState,
      element: {
        sym: elemData.sym,
        name: elemData.name,
        num: elemData.num,
        difficulty: difficulty
      }
    };
  }

  // ===== 获取活跃对战 =====

  /**
   * 获取当前活跃的对战状态
   * @param {string} battleId - 对战ID
   * @returns {object|null} 对战状态
   */
  function getActiveBattle(battleId) {
    return activeBattles[battleId] || null;
  }

  // ===== 清理已结束的对战 =====

  /**
   * 清理已结束的对战，释放内存
   * @param {string} battleId - 对战ID
   */
  function cleanupBattle(battleId) {
    if (activeBattles[battleId]) {
      delete activeBattles[battleId];
    }
  }

  // ===== 公开 API =====
  var api = {
    /** 获取可挑战的元素列表（只返回已解锁难度中的元素） */
    getAvailableElements: getAvailableElements,

    /** 获取已收集的徽章 { elementId: { won, date } } */
    getBadges: getBadges,

    /** 获取徽章统计 { total, byCategory, byDifficulty } */
    getBadgeStats: getBadgeStats,

    /** 开始对战 (elementId, myPetId) => { ok, battleId, battleState } */
    startBattle: startBattle,

    /** 执行回合 (battleId, action) => { ok, battle, logs, result } */
    executeTurn: executeTurn,

    /** 获取我的宠物列表（含等级计算，按战力排序） */
    getMyBattlePets: getMyBattlePets,

    /** 计算宠物战力 (petId) => number */
    calcPetPower: calcPetPower,

    /** 计算宠物战斗属性 (petId) => { hp, atk, def, spd, level, isEvolved } */
    calcPetStats: calcPetStats,

    /** 获取属性克制倍率 (attackerType, defenderType) => number */
    getTypeMultiplier: getTypeMultiplier,

    /** 检查难度是否已解锁 (difficulty) => boolean */
    isDifficultyUnlocked: isDifficultyUnlocked,

    /** 获取活跃对战状态 (battleId) => object|null */
    getActiveBattle: getActiveBattle,

    /** 清理已结束的对战 (battleId) */
    cleanupBattle: cleanupBattle,

    /** 获取难度配置信息 */
    getDifficultyRanges: function() { return DIFFICULTY_RANGES; },

    /** 获取属性克制关系表 */
    getTypeAdvantage: function() { return TYPE_ADVANTAGE; },

    /** 获取对战积分奖励配置 */
    getBattleRewards: function() { return BATTLE_REWARDS; }
  };

  return api;
})();
