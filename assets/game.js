/**
 * game.js v2 — quest-based gamified learning engine
 * Unified engine for main quests + side quests + topics pages
 * localStorage key: hxbnx_game_v2 (auto-migrate from v1 + hxbnx_progress)
 */
const HXBNX_GAME = (function () {

  // ===== Level config =====
  const LEVELS = [
    { lv: 1,  name: '初入江湖',  minExp: 0    },
    { lv: 2,  name: '炼气初阶',  minExp: 50   },
    { lv: 3,  name: '炼气中阶',  minExp: 120  },
    { lv: 4,  name: '炼气大成',  minExp: 210  },
    { lv: 5,  name: '筑基初阶',  minExp: 320  },
    { lv: 6,  name: '筑基中阶',  minExp: 450  },
    { lv: 7,  name: '筑基大成',  minExp: 600  },
    { lv: 8,  name: '金丹初阶',  minExp: 780  },
    { lv: 9,  name: '金丹中阶',  minExp: 980  },
    { lv: 10, name: '金丹大成',  minExp: 1200 },
    { lv: 11, name: '元婴初阶',  minExp: 1450 },
    { lv: 12, name: '元婴中阶',  minExp: 1730 },
    { lv: 13, name: '元婴大成',  minExp: 2040 },
    { lv: 14, name: '化神初阶',  minExp: 2380 },
    { lv: 15, name: '化神中阶',  minExp: 2760 },
    { lv: 16, name: '化神大成',  minExp: 3180 },
    { lv: 17, name: '炼虚初阶',  minExp: 3640 },
    { lv: 18, name: '炼虚中阶',  minExp: 4150 },
    { lv: 19, name: '炼虚大成',  minExp: 4710 },
    { lv: 20, name: '合体初阶',  minExp: 5330 },
    { lv: 21, name: '合体中阶',  minExp: 6010 },
    { lv: 22, name: '合体大成',  minExp: 6760 },
    { lv: 23, name: '大乘初阶',  minExp: 7580 },
    { lv: 24, name: '大乘中阶',  minExp: 8480 },
    { lv: 25, name: '大乘大成',  minExp: 9460 },
    { lv: 26, name: '渡劫初阶',  minExp: 10530},
    { lv: 27, name: '渡劫中阶',  minExp: 11700},
    { lv: 28, name: '渡劫大成',  minExp: 12980},
    { lv: 29, name: '飞升境',    minExp: 14380},
    { lv: 30, name: '元素之主',  minExp: 16000},
  ];

  // ===== Achievement config (v1 compat) =====
  const ACHIEVEMENTS = [
    { id: 'first_step',   name: '初入江湖',   desc: '完成第一个练功房',                icon: '⚗️',  exp: 10,  tier: 'bronze',   check: s => s.completedTopics.length >= 1 },
    { id: 'first_quiz',   name: '初试锋芒',   desc: '首次答题通关',                    icon: '🗡️',  exp: 10,  tier: 'bronze',   check: s => { var n=0; for(var k in s.quizResults){if(s.quizResults[k].passed)n++;} return n>=1; } },
    { id: 'quiz5',        name: '小试牛刀',   desc: '通关5个练功房答题',               icon: '📝',  exp: 20,  tier: 'bronze',   check: s => { var n=0; for(var k in s.quizResults){if(s.quizResults[k].passed)n++;} return n>=5; } },
    { id: 'quiz10',       name: '勤修苦练',   desc: '通关10个练功房答题',              icon: '💪',  exp: 30,  tier: 'bronze',   check: s => { var n=0; for(var k in s.quizResults){if(s.quizResults[k].passed)n++;} return n>=10; } },
    { id: 'exam_start',   name: '踏入训练场', desc: '在试炼之塔查看第一道真题',        icon: '🏹',  exp: 10,  tier: 'bronze',   check: s => s.viewedExams >= 1 },
    { id: 'combo3',       name: '三昧真火',   desc: '连续打卡3天',                     icon: '🔥',  exp: 15,  tier: 'bronze',   check: s => s.maxStreak >= 3 },
    { id: 'exp100',       name: '聚气初成',   desc: '累计经验值达到100',               icon: '💨',  exp: 15,  tier: 'bronze',   check: s => s.totalExp >= 100 },
    { id: 'wrong_first',  name: '初尝败绩',   desc: '第一次答错收入错题本',            icon: '💧',  exp: 5,   tier: 'bronze',   check: s => (s.wrongQuestions || []).length >= 1 },
    { id: 'export',       name: '传承有序',   desc: '导出过存档',                      icon: '📦',  exp: 5,   tier: 'bronze',   check: s => s.hasExported === true },
    { id: 'perfect5',     name: '五连绝杀',   desc: '5次一次答对',                     icon: '🎯',  exp: 30,  tier: 'silver',   check: s => { var n=0; for(var k in s.quizResults){if(s.quizResults[k].attempts===1&&s.quizResults[k].passed)n++;} return n>=5; } },
    { id: 'combo7',       name: '七日炼丹',   desc: '连续打卡7天',                     icon: '🔥',  exp: 50,  tier: 'silver',   check: s => s.maxStreak >= 7 },
    { id: 'quiz20',       name: '百步穿杨',   desc: '通关20个练功房答题',              icon: '🏹',  exp: 50,  tier: 'silver',   check: s => { var n=0; for(var k in s.quizResults){if(s.quizResults[k].passed)n++;} return n>=20; } },
    { id: 'half_way',     name: '半途不废',   desc: '完成34个练功房',                  icon: '⚡',  exp: 60,  tier: 'silver',   check: s => s.completedTopics.length >= 34 },
    { id: 'wrong5',       name: '败而不馁',   desc: '收藏5道错题',                     icon: '📖',  exp: 15,  tier: 'silver',   check: s => (s.wrongQuestions || []).length >= 5 },
    { id: 'wrong_clear5', name: '亡羊补牢',   desc: '从错题本移除5道已掌握的题',       icon: '✨',  exp: 30,  tier: 'silver',   check: s => (s.clearedWrong || 0) >= 5 },
    { id: 'exam10',       name: '百战老兵',   desc: '查看10道以上真题',                icon: '🛡️',  exp: 50,  tier: 'silver',   check: s => s.viewedExams >= 10 },
    { id: 'exp500',       name: '灵气充盈',   desc: '累计经验值达到500',               icon: '🔮',  exp: 40,  tier: 'silver',   check: s => s.totalExp >= 500 },
    { id: 'no_wrong_10',  name: '十面埋伏',   desc: '连续10题一次答对（无错题）',      icon: '🏅',  exp: 60,  tier: 'silver',   check: s => { var c=0,mx=0; var ks=Object.keys(s.quizResults||{}).sort(); for(var i=0;i<ks.length;i++){var q=s.quizResults[ks[i]]; if(q.attempts===1&&q.passed){c++;if(c>mx)mx=c;}else{c=0;}} return mx>=10; } },
    { id: 'wrong_clear10',name: '知耻后勇',   desc: '从错题本移除10道已掌握的题',      icon: '💫',  exp: 50,  tier: 'silver',   check: s => (s.clearedWrong || 0) >= 10 },
    { id: 'perfect15',    name: '弹无虚发',   desc: '15次一次答对',                    icon: '🎖️',  exp: 80,  tier: 'gold',     check: s => { var n=0; for(var k in s.quizResults){if(s.quizResults[k].attempts===1&&s.quizResults[k].passed)n++;} return n>=15; } },
    { id: 'combo14',      name: '半月修炼',   desc: '连续打卡14天',                    icon: '🌙',  exp: 100, tier: 'gold',     check: s => s.maxStreak >= 14 },
    { id: 'wrong20',      name: '知错能改',   desc: '收藏20道错题',                    icon: '📚',  exp: 40,  tier: 'gold',     check: s => (s.wrongQuestions || []).length >= 20 },
    { id: 'wrong_clear20',name: '浴火重生',   desc: '从错题本移除20道已掌握的题',      icon: '🦅',  exp: 80,  tier: 'gold',     check: s => (s.clearedWrong || 0) >= 20 },
    { id: 'quiz30',       name: '炉火纯青',   desc: '通关30个练功房答题',              icon: '🔥',  exp: 100, tier: 'gold',     check: s => { var n=0; for(var k in s.quizResults){if(s.quizResults[k].passed)n++;} return n>=30; } },
    { id: 'exp2000',      name: '金丹初成',   desc: '累计经验值达到2000',              icon: '💊',  exp: 100, tier: 'gold',     check: s => s.totalExp >= 2000 },
    { id: 'exam30',       name: '沙场老将',   desc: '查看30道以上真题',                icon: '⚔️',  exp: 80,  tier: 'gold',     check: s => s.viewedExams >= 30 },
    { id: 'combo30',      name: '月圆炼金',   desc: '连续打卡30天',                    icon: '🌕',  exp: 200, tier: 'gold',     check: s => s.maxStreak >= 30 },
    { id: 'perfect30',    name: '百发百中',   desc: '30次一次答对',                    icon: '💎',  exp: 200, tier: 'diamond',  check: s => { var n=0; for(var k in s.quizResults){if(s.quizResults[k].attempts===1&&s.quizResults[k].passed)n++;} return n>=30; } },
    { id: 'all_topics',   name: '通关大师',   desc: '完成全部67个练功房',              icon: '👑',  exp: 500, tier: 'diamond',  check: s => s.completedTopics.length >= 67 },
    { id: 'exp5000',      name: '元婴大成',   desc: '累计经验值达到5000',              icon: '🌀',  exp: 300, tier: 'diamond',  check: s => s.totalExp >= 5000 },
    { id: 'wrong_clear50',name: '脱胎换骨',   desc: '从错题本移除50道已掌握的题',      icon: '🦋',  exp: 200, tier: 'diamond',  check: s => (s.clearedWrong || 0) >= 50 },
    { id: 'exam100',      name: '身经百战',   desc: '查看100道以上真题',               icon: '🏛️',  exp: 200, tier: 'diamond',  check: s => s.viewedExams >= 100 },
    { id: 'no_wrong_30',  name: '三十天罡',   desc: '连续30题一次答对',                icon: '⭐',  exp: 300, tier: 'diamond',  check: s => { var c=0,mx=0; var ks=Object.keys(s.quizResults||{}).sort(); for(var i=0;i<ks.length;i++){var q=s.quizResults[ks[i]]; if(q.attempts===1&&q.passed){c++;if(c>mx)mx=c;}else{c=0;}} return mx>=30; } },
    { id: 'exp10000',     name: '大道至简',   desc: '累计经验值超过10000',             icon: '🌟',  exp: 1000,tier: 'legendary', check: s => s.totalExp >= 10000 },
    { id: 'perfect_all',  name: '满分神话',   desc: '所有已答题目全部一次答对',        icon: '🏆',  exp: 2000,tier: 'legendary', hidden: true, check: s => { var t=0,p=0; for(var k in s.quizResults){t++;if(s.quizResults[k].attempts===1&&s.quizResults[k].passed)p++;} return t>=20 && t===p; } },
    { id: 'combo100',     name: '百日筑基',   desc: '连续打卡100天',                   icon: '🏮',  exp: 1000,tier: 'legendary', check: s => s.maxStreak >= 100 },
    { id: 'collector',    name: '收藏大师',   desc: '收藏50道错题并全部移除',          icon: '🗝️',  exp: 1500,tier: 'legendary', check: s => (s.wrongQuestions||[]).length + (s.clearedWrong||0) >= 50 && (s.clearedWrong||0) >= 50 },
    { id: 'elem10',       name: '元素学徒',   desc: '收集10种不同元素卡',              icon: '🔬',  exp: 30,  tier: 'silver',   check: s => (s.elementCards || []).length >= 10 },
    { id: 'elem30',       name: '元素猎人',   desc: '收集30种不同元素卡',              icon: '🔭',  exp: 100, tier: 'gold',     check: s => (s.elementCards || []).length >= 30 },
    { id: 'elem50',       name: '周期表征服者', desc: '收集50种不同元素卡',            icon: '🌌',  exp: 300, tier: 'diamond',  check: s => (s.elementCards || []).length >= 50 },
    { id: 'mythic_elem',  name: '神话降临',   desc: '获得1张⭐⭐⭐⭐⭐传说元素卡',       icon: '💫',  exp: 200, tier: 'legendary', hidden: true, check: s => (s.elementCards || []).some(function(c) { return c.t >= 5; }) },
  ];

  // ===== Storage =====
  const KEY = 'hxbnx_game_v2';

  function defaultState() {
    return {
      completedTopics: [],
      quizResults: {},
      checkinDates: [],
      currentStreak: 0,
      maxStreak: 0,
      totalExp: 0,
      unlockedAchievements: [],
      viewedExams: 0,
      hasExported: false,
      wrongQuestions: [],
      clearedWrong: 0,
      elementCards: [],
      elementDraws: 0,
      lastFreeDrawDate: '',
      createdAt: new Date().toISOString(),
      // v2: quest-level progress
      clearedQuests: [],
      questProgress: {},
      score: 0,
      gachaCards: [],
      questBadges: {},
      version: 2
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) {
        // Try migration from v1
        var migrated = migrateFromV1();
        if (migrated) return migrated;
        return defaultState();
      }
      return Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) {
      return defaultState();
    }
  }

  function migrateFromV1() {
    try {
      var v1 = localStorage.getItem('hxbnx_game_v1');
      var legacy = localStorage.getItem('hxbnx_progress');
      if (!v1 && !legacy) return null;

      var state = defaultState();
      if (v1) {
        var v1Data = JSON.parse(v1);
        state.completedTopics = v1Data.completedTopics || [];
        state.quizResults = v1Data.quizResults || {};
        state.checkinDates = v1Data.checkinDates || [];
        state.currentStreak = v1Data.currentStreak || 0;
        state.maxStreak = v1Data.maxStreak || 0;
        state.totalExp = v1Data.totalExp || 0;
        state.unlockedAchievements = v1Data.unlockedAchievements || [];
        state.viewedExams = v1Data.viewedExams || 0;
        state.wrongQuestions = v1Data.wrongQuestions || [];
        state.clearedWrong = v1Data.clearedWrong || 0;
        state.elementCards = v1Data.elementCards || [];
        state.elementDraws = v1Data.elementDraws || 0;
        state.lastFreeDrawDate = v1Data.lastFreeDrawDate || '';
      }
      if (legacy) {
        var legacyData = JSON.parse(legacy);
        state.score = legacyData.score || 0;
        if (legacyData.cleared) {
          state.clearedQuests = legacyData.cleared;
        }
        if (legacyData.badges) {
          // Convert legacy badges
          for (var i = 0; i < legacyData.badges.length; i++) {
            state.questBadges[legacyData.badges[i]] = true;
          }
        }
        if (legacyData.cards) {
          for (var j = 0; j < legacyData.cards.length; j++) {
            var c = legacyData.cards[j];
            state.gachaCards.push({ rarity: c.split(':')[0] || 'common', name: c.split(':')[1] || 'unknown' });
          }
        }
      }
      save(state);
      toaster('✅ 存档已自动迁移到 v2', 'info');
      return state;
    } catch (e) {
      return null;
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      toaster('⚠️ 存档空间不足，请清理', 'error');
    }
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function calcLevel(exp) {
    var info = LEVELS[0];
    for (var i = LEVELS.length - 1; i >= 0; i--) {
      if (exp >= LEVELS[i].minExp) { info = LEVELS[i]; break; }
    }
    var nextLv = null;
    for (var j = 0; j < LEVELS.length; j++) {
      if (LEVELS[j].lv === info.lv + 1) { nextLv = LEVELS[j]; break; }
    }
    var prevExp = info.minExp;
    var nextExp = nextLv ? nextLv.minExp : info.minExp + 9999;
    var progress = nextLv ? Math.round((exp - prevExp) / (nextExp - prevExp) * 100) : 100;
    return { lv: info.lv, name: info.name, progress: progress, currentExp: exp, prevExp: prevExp, nextExp: nextExp };
  }

  function updateStreak(state) {
    var today = todayStr();
    if (state.checkinDates.indexOf(today) >= 0) return;
    state.checkinDates.push(today);
    var sorted = state.checkinDates.slice().sort();
    var streak = 1, maxStreak = 1, cur = 1;
    for (var i = 1; i < sorted.length; i++) {
      var diff = (new Date(sorted[i]) - new Date(sorted[i-1])) / 86400000;
      if (diff === 1) { cur++; streak = cur; }
      else { cur = 1; }
      if (cur > maxStreak) maxStreak = cur;
    }
    state.currentStreak = streak;
    state.maxStreak = Math.max(state.maxStreak, maxStreak);
  }

  function checkAchievements(state) {
    var newlyUnlocked = [];
    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
      var ach = ACHIEVEMENTS[i];
      if (state.unlockedAchievements.indexOf(ach.id) === -1 && ach.check(state)) {
        state.unlockedAchievements.push(ach.id);
        state.totalExp += ach.exp;
        newlyUnlocked.push(ach);
      }
    }
    return newlyUnlocked;
  }

  // ===== Toast / Visual Effects =====

  function toaster(msg, type, duration) {
    type = type || 'info';
    duration = duration || 3500;
    var container = document.getElementById('game-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'game-toast-container';
      container.style.cssText = 'position:fixed;top:72px;right:18px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
      document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    var colors = { success: '#10b981', achievement: '#fbbf24', info: '#22d3ee', error: '#ef4444' };
    toast.style.cssText = 'background:#0f172a;color:#f1f5f9;border-left:4px solid ' + (colors[type]||colors.info) +
      ';border-radius:8px;padding:12px 18px;font-size:14px;min-width:200px;max-width:300px;' +
      'box-shadow:0 4px 20px rgba(0,0,0,0.4);animation:slideInRight 0.3s ease;';
    toast.innerHTML = msg;
    container.appendChild(toast);
    setTimeout(function() {
      toast.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(function() { toast.remove(); }, 300);
    }, duration);
  }

  var TOAST = toaster; // alias for internal use

  // ===== v2: Quest-based system =====

  var _questCombo = 0;
  var _questMaxCombo = 0;
  var _questTotalCorrect = 0;
  var _questTotalWrong = 0;
  var _questStartTime = 0;
  var _questId = null;
  var _certWrongs = {};
  var _answeredStages = {};
  var _cardPool = [];

  function resetQuestState() {
    _questCombo = 0;
    _questMaxCombo = 0;
    _questTotalCorrect = 0;
    _questTotalWrong = 0;
    _questStartTime = 0;
    _questId = null;
    _certWrongs = {};
    _answeredStages = {};
  }

  function startQuest(questId) {
    resetQuestState();
    _questId = questId;
    _questStartTime = Date.now();
    var s = load();
    // init quest progress if not exists
    if (!s.questProgress[questId]) {
      s.questProgress[questId] = { started: true, stageResults: {} };
      save(s);
    }
    return { questId: questId, combo: 0, score: 0 };
  }

  function submitQuizOption(stageId, optionIndex, correctIndex) {
    if (_questStartTime === 0) _questStartTime = Date.now();
    if (_answeredStages[stageId]) return { alreadyAnswered: true };

    var isCorrect = (optionIndex === correctIndex);
    _answeredStages[stageId] = isCorrect;

    if (isCorrect) {
      _questCombo++;
      _questTotalCorrect++;
      if (_questCombo > _questMaxCombo) _questMaxCombo = _questCombo;
      return { correct: true, combo: _questCombo, comboBonus: (_questCombo >= 3) };
    } else {
      _questTotalWrong++;
      _questCombo = 0;
      return { correct: false, combo: 0, comboBroken: true };
    }
  }

  function recordCertWrong(stageId) {
    var key = stageId || 'cert-' + _questTotalWrong;
    _certWrongs[key] = (_certWrongs[key] || 0) + 1;
    return { penalty: _certWrongs[key] === 1 ? 2 : 5, times: _certWrongs[key] };
  }

  function submitCert(questId, baseScore) {
    baseScore = baseScore || 10;

    // Check all cert questions answered correctly
    var allCorrect = true;
    for (var key in _answeredStages) {
      if (_answeredStages.hasOwnProperty(key) && key.indexOf('cert-') === 0) {
        if (!_answeredStages[key]) { allCorrect = false; break; }
      }
    }
    if (!allCorrect) {
      return { success: false, msg: '请先答对全部通关考题再提交！' };
    }

    var elapsed = _questStartTime ? (Date.now() - _questStartTime) / 1000 : 999;
    var bonus = _questCombo >= 5 ? 2 : _questCombo >= 3 ? 1.5 : 1;
    var points = Math.round(baseScore * bonus);

    // Cert penalty
    var totalPenalty = 0;
    for (var k in _certWrongs) {
      if (_certWrongs.hasOwnProperty(k)) {
        var wc = _certWrongs[k];
        totalPenalty += (wc >= 1 ? 2 : 0) + (wc >= 2 ? (wc - 1) * 5 : 0);
      }
    }
    points = Math.max(1, points - totalPenalty);

    var s = load();
    s.score = (s.score || 0) + points;
    s.totalExp = (s.totalExp || 0) + points;
    if (s.clearedQuests.indexOf(questId) === -1) {
      s.clearedQuests.push(questId);
    }
    s.questProgress[questId] = {
      cleared: true,
      score: points,
      elapsed: Math.round(elapsed),
      combo: _questMaxCombo,
      totalCorrect: _questTotalCorrect,
      totalWrong: _questTotalWrong,
      date: todayStr()
    };

    // Badge check
    var unlockedBadges = [];
    if (_questTotalWrong === 0 && s.questBadges['zero_error'] !== true) {
      s.questBadges['zero_error'] = true;
      unlockedBadges.push('zero_error');
    }
    if (elapsed < 120 && s.questBadges['speed_120s'] !== true) {
      s.questBadges['speed_120s'] = true;
      unlockedBadges.push('speed_120s');
    }
    if (s.questBadges['first_clear'] !== true) {
      s.questBadges['first_clear'] = true;
      unlockedBadges.push('first_clear');
    }

    updateStreak(s);
    var newAch = checkAchievements(s);
    save(s);

    return {
      success: true,
      score: points,
      baseScore: baseScore,
      combo: _questCombo,
      bonus: bonus,
      totalPenalty: totalPenalty,
      elapsed: Math.round(elapsed),
      unlockedBadges: unlockedBadges,
      achievements: newAch
    };
  }

  // ===== v2: Card Draw =====

  function registerCardPool(pool) {
    _cardPool = pool || [];
  }

  function drawCard() {
    if (_cardPool.length === 0) return null;
    var r = Math.random();
    var card = null;
    // Sort by probability desc
    var cumulative = 0;
    for (var i = 0; i < _cardPool.length; i++) {
      cumulative += (_cardPool[i].probability || 0.25);
      if (r < cumulative) { card = _cardPool[i]; break; }
    }
    if (!card) card = _cardPool[_cardPool.length - 1];

    var s = load();
    s.gachaCards.push({ rarity: card.rarity, name: card.name, date: todayStr() });
    if (s.questBadges['first_card'] !== true) {
      s.questBadges['first_card'] = true;
    }
    save(s);
    return card;
  }

  // ===== v2: Badge Story =====

  var _badgeData = null;

  function registerBadgeData(data) {
    _badgeData = data;
  }

  function getBadgeStory(badgeId) {
    if (!_badgeData || !_badgeData.badges || !_badgeData.badges[badgeId]) return null;
    return _badgeData.badges[badgeId].story || null;
  }

  function getBadgeDef(badgeId) {
    if (!_badgeData || !_badgeData.badges) return null;
    return _badgeData.badges[badgeId] || null;
  }

  // ===== Quest progress query =====

  function getQuestProgress(questId) {
    var s = load();
    return s.questProgress[questId] || null;
  }

  function isQuestCleared(questId) {
    var s = load();
    return s.clearedQuests.indexOf(questId) >= 0;
  }

  function isQuestUnlocked(questId, questDef) {
    if (!questDef || !questDef.unlock) return true;
    var s = load();
    var unlock = questDef.unlock;

    if (unlock.minCourse !== undefined && unlock.minTier !== undefined) {
      // Check if player has cleared the prerequisite
      var tierMap = { bronze: 1, silver: 2, gold: 3 };
      var requiredTierVal = tierMap[unlock.minTier] || 1;
      for (var course = 1; course < unlock.minCourse; course++) {
        for (var tier = 3; tier >= 1; tier--) {
          var qid = 'main-' + course + '-' + Object.keys(tierMap).find(function(k){return tierMap[k]===tier;});
          if (s.clearedQuests.indexOf(qid) >= 0) {
            // Found a cleared quest in this course. But need to check tier level.
          }
        }
      }
      // Simple check: is the prerequisite quest cleared?
      var prereqQid = 'main-' + unlock.minCourse + '-' + unlock.minTier;
      return s.clearedQuests.indexOf(prereqQid) >= 0;
    }

    if (unlock.triggerAchievement) {
      return s.unlockedAchievements.indexOf(unlock.triggerAchievement) >= 0;
    }

    return true;
  }

  function calcSideQuestState(questDef) {
    var s = load();
    var qid = questDef.questId || '';
    if (questDef.validUntil && new Date(questDef.validUntil) < new Date()) return 'expired';
    if (s.clearedQuests.indexOf(qid) >= 0) return 'cleared';
    if (!isQuestUnlocked(qid, questDef)) return 'locked';
    if (s.questProgress[qid] && s.questProgress[qid].started) return 'in_progress';
    return 'unlocked';
  }

  // ===== v2: Particle effects =====

  function spawnParticles(x, y, count, colors) {
    colors = colors || ['#f0c040', '#6ee7b7', '#a78bfa'];
    for (var i = 0; i < count; i++) {
      var p = document.createElement('div');
      p.style.cssText = 'position:fixed;pointer-events:none;z-index:9997;' +
        'left:' + x + 'px;top:' + y + 'px;' +
        'width:' + (4 + Math.random() * 8) + 'px;height:' + (4 + Math.random() * 8) + 'px;' +
        'border-radius:50%;' +
        'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
        'animation:particleFly 1.2s ease-out forwards;' +
        '--dx:' + ((Math.random() - 0.5) * 200) + 'px;' +
        '--dy:' + ((Math.random() - 0.8) * 160) + 'px;';
      document.body.appendChild(p);
      setTimeout(function() { p.remove(); }, 1300);
    }
  }

  // ===== v2: Combo popup =====

  function showComboPopup(count, msg) {
    var pop = document.getElementById('comboPop');
    if (!pop) {
      pop = document.createElement('div');
      pop.id = 'comboPop';
      pop.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);' +
        'font-size:32px;font-weight:800;text-align:center;line-height:1.4;z-index:9999;pointer-events:none;' +
        'background:linear-gradient(135deg,#f0c040,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;' +
        'transition:transform .15s ease-out;';
      document.body.appendChild(pop);
    }
    pop.innerHTML = '<span style="font-size:42px">COMBO x' + count + '</span><span style="font-size:13px;display:block;color:#6ee7b7">' + (msg || '') + '</span>';
    pop.style.transform = 'translate(-50%,-50%) scale(0)';
    void pop.offsetWidth;
    pop.style.transform = 'translate(-50%,-50%) scale(1)';
    pop.style.animation = 'comboPulse 0.4s ease-out';
    setTimeout(function() { pop.style.transform = 'translate(-50%,-50%) scale(0)'; }, 2000);

    var comboNum = document.getElementById('comboNum');
    if (comboNum) comboNum.textContent = count;
  }

  function showComboBreak() {
    var pop = document.getElementById('comboPop');
    if (!pop) return;
    pop.innerHTML = '<span style="font-size:28px;color:#f87171">COMBO 断裂!</span>';
    pop.style.transform = 'translate(-50%,-50%) scale(0)';
    void pop.offsetWidth;
    pop.style.transform = 'translate(-50%,-50%) scale(1)';
    pop.style.animation = 'comboPulse 0.4s ease-out';
    setTimeout(function() { pop.style.transform = 'translate(-50%,-50%) scale(0)'; }, 1800);

    var comboNum = document.getElementById('comboNum');
    if (comboNum) comboNum.textContent = '0';
  }

  // ===== v1 Compat API (unchanged for topics pages) =====

  var api = {
    // ── Quest v2 API ──
    startQuest: startQuest,
    resetQuestState: resetQuestState,
    submitQuizOption: submitQuizOption,
    recordCertWrong: recordCertWrong,
    submitCert: submitCert,
    registerCardPool: registerCardPool,
    drawCard: drawCard,
    registerBadgeData: registerBadgeData,
    getBadgeStory: getBadgeStory,
    getBadgeDef: getBadgeDef,
    getQuestProgress: getQuestProgress,
    isQuestCleared: isQuestCleared,
    isQuestUnlocked: isQuestUnlocked,
    calcSideQuestState: calcSideQuestState,
    spawnParticles: spawnParticles,
    showComboPopup: showComboPopup,
    showComboBreak: showComboBreak,
    toaster: toaster,
    getQuestCombo: function() { return _questCombo; },
    getQuestMaxCombo: function() { return _questMaxCombo; },

    // ── v1 Compat API ──

    getStatus: function () {
      var s = load();
      var lvInfo = calcLevel(s.totalExp);
      return {
        state: s,
        level: lvInfo,
        completedCount: s.completedTopics.length,
        currentStreak: s.currentStreak,
        todayCheckin: s.checkinDates.indexOf(todayStr()) >= 0,
        achievementsCount: s.unlockedAchievements.length,
        achievements: ACHIEVEMENTS,
        score: s.score || 0,
        clearedQuests: s.clearedQuests.length
      };
    },

    completeTopic: function (filename) {
      var s = load();
      if (s.completedTopics.indexOf(filename) === -1) {
        s.completedTopics.push(filename);
        s.totalExp += 20;
        updateStreak(s);
        var newAch = checkAchievements(s);
        save(s);
        TOAST('⚔️ <strong>通关！</strong> +20 EXP', 'success');
        if (newAch.length > 0) {
          setTimeout(function() {
            for (var i = 0; i < newAch.length; i++) {
              var a = newAch[i];
              TOAST(a.icon + ' <strong>成就解锁：' + a.name + '</strong><br><small>' + a.desc + '</small>', 'achievement', 5000);
            }
          }, 1000);
        }
        return true;
      } else {
        TOAST('✅ 本关已通关，继续保持', 'info');
        return false;
      }
    },

    viewExam: function () {
      var s = load();
      s.viewedExams = (s.viewedExams || 0) + 1;
      var newAch = checkAchievements(s);
      save(s);
      if (newAch.length > 0) {
        for (var i = 0; i < newAch.length; i++) {
          var a = newAch[i];
          TOAST(a.icon + ' <strong>成就解锁：' + a.name + '</strong>', 'achievement', 5000);
        }
      }
    },

    isCompleted: function (filename) {
      var s = load();
      if (s.quizResults && s.quizResults[filename] && s.quizResults[filename].exp > 0) return true;
      return s.completedTopics.indexOf(filename) >= 0;
    },

    quizSubmit: function (filename, choiceIndex, correctIndex) {
      var s = load();
      if (!s.quizResults) s.quizResults = {};
      var qr = s.quizResults[filename] || { attempts: 0, choices: [], passed: false, exp: 0 };
      qr.attempts++;
      qr.choices.push(choiceIndex);

      if (choiceIndex === correctIndex) {
        qr.passed = true;
        if (qr.attempts === 1)      qr.exp = 20;
        else if (qr.attempts === 2)  qr.exp = 10;
        else if (qr.attempts === 3)  qr.exp = 5;
        else                         qr.exp = 0;

        s.totalExp += qr.exp;
        if (qr.exp > 0 && s.completedTopics.indexOf(filename) === -1) {
          s.completedTopics.push(filename);
        }
        s.elementDraws = (s.elementDraws || 0) + 1;
        updateStreak(s);
        var newAch = checkAchievements(s);
        s.quizResults[filename] = qr;
        save(s);

        var emoji = qr.exp >= 20 ? '🎉' : qr.exp >= 10 ? '👍' : qr.exp >= 5 ? '💪' : '📖';
        var msg = emoji + ' <strong>通关文牒！</strong>';
        if (qr.exp > 0) msg += ' +' + qr.exp + ' EXP（第' + qr.attempts + '次答对）';
        else msg += ' 不计分（第4次答对）';
        TOAST(msg, qr.exp > 0 ? 'success' : 'info');
        setTimeout(function() { TOAST('🧪 <strong>获得1次元素抽卡机会！</strong>', 'info'); }, 1500);

        if (newAch.length > 0) {
          setTimeout(function() {
            for (var i = 0; i < newAch.length; i++) {
              var a = newAch[i];
              TOAST(a.icon + ' <strong>成就解锁：' + a.name + '</strong><br><small>' + a.desc + '</small>', 'achievement', 5000);
            }
          }, 1000);
        }
        return { correct: true, attempts: qr.attempts, exp: qr.exp, newAch: newAch };
      } else {
        s.quizResults[filename] = qr;
        save(s);
        return { correct: false, attempts: qr.attempts, remaining: 4 - qr.attempts };
      }
    },

    addWrongQuestion: function (data) {
      var s = load();
      if (!s.wrongQuestions) s.wrongQuestions = [];
      var exists = false;
      for (var i = 0; i < s.wrongQuestions.length; i++) {
        if (s.wrongQuestions[i].filename === data.filename && s.wrongQuestions[i].questionText === data.questionText) {
          exists = true; break;
        }
      }
      if (!exists) {
        s.wrongQuestions.push({
          filename: data.filename, topicName: data.topicName || '',
          questionText: data.questionText || '', options: data.options || [],
          correctIndex: data.correctIndex, wrongIndex: data.wrongIndex, date: todayStr()
        });
        var newAch = checkAchievements(s);
        save(s);
        TOAST('📖 <strong>已收入错题本</strong>', 'info');
        if (newAch.length > 0) {
          setTimeout(function() {
            for (var i = 0; i < newAch.length; i++) {
              var a = newAch[i];
              TOAST(a.icon + ' <strong>成就解锁：' + a.name + '</strong><br><small>' + a.desc + '</small>', 'achievement', 5000);
            }
          }, 1000);
        }
      }
    },

    getWrongQuestions: function () {
      var s = load();
      return s.wrongQuestions || [];
    },

    removeWrongQuestion: function (index) {
      var s = load();
      if (!s.wrongQuestions) return;
      s.wrongQuestions.splice(index, 1);
      if (!s.clearedWrong) s.clearedWrong = 0;
      s.clearedWrong++;
      var newAch = checkAchievements(s);
      save(s);
      if (newAch.length > 0) {
        for (var i = 0; i < newAch.length; i++) {
          var a = newAch[i];
          TOAST(a.icon + ' <strong>成就解锁：' + a.name + '</strong>', 'achievement', 5000);
        }
      }
    },

    getWrongCount: function () {
      var s = load();
      return (s.wrongQuestions || []).length;
    },

    drawElementCard: function (sym, stars) {
      var s = load();
      if (!s.elementCards) s.elementCards = [];
      if ((s.elementDraws || 0) <= 0) return { ok: false };
      var isNew = true;
      for (var i = 0; i < s.elementCards.length; i++) {
        if (s.elementCards[i].s === sym) { isNew = false; break; }
      }
      if (isNew) {
        s.elementCards.push({ s: sym, t: stars });
      } else {
        s.totalExp += 3;
      }
      s.elementDraws = Math.max(0, (s.elementDraws || 0) - 1);
      var newAch = checkAchievements(s);
      save(s);
      return { ok: true, isNew: isNew, newAch: newAch };
    },

    getElementCards: function () {
      var s = load();
      return s.elementCards || [];
    },

    getElementDrawCount: function () {
      var s = load();
      return s.elementDraws || 0;
    },

    claimFreeDraw: function () {
      var s = load();
      var today = todayStr();
      if (s.lastFreeDrawDate !== today) {
        s.lastFreeDrawDate = today;
        s.elementDraws = (s.elementDraws || 0) + 1;
        save(s);
        return true;
      }
      return false;
    },

    canAccessTopic: function (topicNum) {
      if (topicNum <= 1) return true;
      var s = load();
      var prevFile = (topicNum - 1 < 10 ? '0' : '') + (topicNum - 1) + '.html';
      if (s.quizResults && s.quizResults[prevFile] && s.quizResults[prevFile].passed) return true;
      if (s.completedTopics.indexOf(prevFile) >= 0) return true;
      return false;
    },

    getQuizResult: function (filename) {
      var s = load();
      return (s.quizResults && s.quizResults[filename]) || null;
    },

    exportSave: function () {
      var s = load();
      s.hasExported = true;
      checkAchievements(s);
      save(s);
      var blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'hxbnx_save_' + todayStr() + '.json';
      a.click();
      TOAST('📦 存档已导出', 'info');
    },

    importSave: function (jsonStr) {
      try {
        var data = JSON.parse(jsonStr);
        save(Object.assign(defaultState(), data));
        TOAST('✅ 存档导入成功，刷新页面生效', 'success', 5000);
        return true;
      } catch (e) {
        TOAST('❌ 存档格式错误', 'error');
        return false;
      }
    },

    renderProgressBar: function (selector) {
      var el = document.querySelector(selector);
      if (!el) return;
      var status = this.getStatus();
      var level = status.level, state = status.state;
      el.innerHTML =
        '<div class="game-bar">' +
          '<div class="game-bar-lv">Lv.' + level.lv + '</div>' +
          '<div class="game-bar-info">' +
            '<div class="game-bar-name">' + level.name + '</div>' +
            '<div class="game-bar-track"><div class="game-bar-fill" style="width:' + level.progress + '%"></div></div>' +
            '<div class="game-bar-nums">' + state.totalExp + ' / ' + level.nextExp + ' EXP</div>' +
          '</div>' +
          '<div class="game-bar-stats">' +
            '<span class="game-stat" title="已通关练功房">⚔️ ' + status.completedCount + '/67</span>' +
            '<span class="game-stat ' + (status.currentStreak > 0 ? 'hot' : '') + '" title="连修天数">🔥 ' + status.currentStreak + '天</span>' +
            '<span class="game-stat">⭐ ' + (state.score || 0) + '</span>' +
          '</div>' +
        '</div>';
    },

    renderCheckinBtn: function (selector, filename) {
      var el = document.querySelector(selector);
      if (!el) return;
      var completed = this.isCompleted(filename);
      el.innerHTML =
        '<div class="game-checkin">' +
          '<button class="game-btn-checkin ' + (completed ? 'done' : '') + '"' +
            'onclick="HXBNX_GAME.completeTopicAndUpdate(\'' + filename + '\', this)">' +
            (completed ? '✅ 已通关' : '⚔️ 通关打卡 +20 EXP') +
          '</button>' +
          '<span class="game-checkin-hint">' + (completed ? '继续下一讲吧！' : '学完本讲，点击打卡记录战绩') + '</span>' +
        '</div>';
    },

    completeTopicAndUpdate: function (filename, btn) {
      var result = this.completeTopic(filename);
      if (result) {
        btn.textContent = '✅ 已通关';
        btn.classList.add('done');
        var hint = btn.nextElementSibling;
        if (hint) hint.textContent = '继续下一讲吧！';
        this.renderProgressBar('#game-progress-bar');
      }
    },

    LEVELS: LEVELS,
    ACHIEVEMENTS: ACHIEVEMENTS,
  };

  // Inject CSS animations
  var style = document.createElement('style');
  style.textContent =
    '@keyframes slideInRight { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }' +
    '@keyframes fadeOut { from { opacity:1; } to { opacity:0; transform:translateX(20px); } }' +
    '@keyframes particleFly { 0%{opacity:1;transform:translate(0,0) scale(1)} 100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(0)} }' +
    '@keyframes comboPulse { 0%{transform:translate(-50%,-50%) scale(1.5);opacity:0} 40%{transform:translate(-50%,-50%) scale(0.9);opacity:1} 100%{transform:translate(-50%,-50%) scale(1);opacity:1} }';
  document.head.appendChild(style);

  return api;
})();
