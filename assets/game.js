/**
 * game.js v5 — 2027届高考日记 联动版
 * 保留：积分、连续打卡、错题本、toast、副本积分同步
 * 新增：学习等级系统、每日签到奖励、周次任务积分、练功房加成
 * localStorage key: hxbnx_game_v2 (兼容旧数据)
 */
const HXBNX_GAME = (function () {

  const KEY = 'hxbnx_game_v2';

  // ===== 学习等级系统 =====
  var LEARN_LEVELS = [
    { lv: 1, name: '化学萌新', minScore: 0, icon: '🌱' },
    { lv: 2, name: '化学学徒', minScore: 50, icon: '📘' },
    { lv: 3, name: '化学达人', minScore: 200, icon: '📗' },
    { lv: 4, name: '化学高手', minScore: 500, icon: '📙' },
    { lv: 5, name: '化学学霸', minScore: 1000, icon: '📕' },
    { lv: 6, name: '化学大师', minScore: 2000, icon: '🎓' },
    { lv: 7, name: '化学宗师', minScore: 5000, icon: '🏆' },
    { lv: 8, name: '化学之神', minScore: 10000, icon: '👑' }
  ];

  // ===== 每日签到奖励 =====
  var CHECKIN_REWARDS = [
    { day: 1, score: 5, desc: '+5积分' },
    { day: 2, score: 8, desc: '+8积分' },
    { day: 3, score: 10, desc: '+10积分' },
    { day: 4, score: 12, desc: '+12积分' },
    { day: 5, score: 15, desc: '+15积分' },
    { day: 6, score: 20, desc: '+20积分' },
    { day: 7, score: 30, desc: '+30积分（周日大礼包）' }
  ];

  // ===== 周次任务积分配置 =====
  var WEEK_TASK_SCORES = {
    review: 5,    // 完成知识点复习
    practice: 10,  // 做配套练习题
    wrongbook: 5    // 整理错题
  };

  function defaultState() {
    return {
      checkinDates: [],
      currentStreak: 0,
      maxStreak: 0,
      totalExp: 0,
      wrongQuestions: [],
      clearedWrong: 0,
      score: 0,
      clearedQuests: [],
      createdAt: new Date().toISOString(),
      version: 5,
      // 新增字段
      weekTasks: {},        // { "week_1": { review: true, practice: false, wrongbook: false } }
      dailyPracticeDone: {}, // { "2026-06-22": { nickname: true, equation: false, element: false } }
      lastCheckinReward: '' // 上次签到奖励日期
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      return Object.assign(defaultState(), JSON.parse(raw));
    } catch (e) {
      return defaultState();
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      toaster('存档空间不足', 'error');
    }
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
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

  // ===== Toast =====
  function toaster(msg, type, duration) {
    type = type || 'info';
    duration = duration || 3000;
    var container = document.getElementById('game-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'game-toast-container';
      container.style.cssText = 'position:fixed;top:72px;right:18px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
      document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    var colors = { success: '#10b981', info: '#22d3ee', error: '#ef4444' };
    toast.style.cssText = 'background:#2a1810;color:#f5e6c8;border-left:4px solid ' + (colors[type]||colors.info) +
      ';border-radius:8px;padding:12px 18px;font-size:14px;min-width:200px;max-width:300px;' +
      'box-shadow:0 4px 20px rgba(0,0,0,0.4);animation:slideInRight 0.3s ease;font-family:inherit;';
    toast.innerHTML = msg;
    container.appendChild(toast);
    setTimeout(function() {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(function() { toast.remove(); }, 300);
    }, duration);
  }

  // ===== 副本积分同步 =====
  function addSideScore(sideQuestId, points) {
    var s = load();
    s.score = (s.score || 0) + points;
    s.totalExp = (s.totalExp || 0) + points;
    if (s.clearedQuests.indexOf(sideQuestId) === -1) {
      s.clearedQuests.push(sideQuestId);
    }
    updateStreak(s);
    save(s);
    return { score: points };
  }

  // ===== 答题积分（供副本内部使用） =====
  function addQuizScore(points) {
    var s = load();
    s.score = (s.score || 0) + points;
    s.totalExp = (s.totalExp || 0) + points;
    updateStreak(s);
    save(s);
    return { score: s.score };
  }

  // ===== API =====
  var api = {
    // 状态
    getStatus: function () {
      var s = load();
      return {
        state: s,
        score: s.score || 0,
        currentStreak: s.currentStreak || 0,
        todayCheckin: s.checkinDates.indexOf(todayStr()) >= 0
      };
    },

    // 积分
    addScore: function (points) {
      return addQuizScore(points);
    },

    addSideScore: addSideScore,

    // 错题本
    addWrongQuestion: function (data) {
      var s = load();
      if (!s.wrongQuestions) s.wrongQuestions = [];
      var exists = false;
      for (var i = 0; i < s.wrongQuestions.length; i++) {
        if (s.wrongQuestions[i].questionText === data.questionText) {
          exists = true; break;
        }
      }
      if (!exists) {
        s.wrongQuestions.push({
          filename: data.filename || '',
          topicName: data.topicName || '',
          questionText: data.questionText || '',
          options: data.options || [],
          correctIndex: data.correctIndex,
          wrongIndex: data.wrongIndex,
          date: todayStr()
        });
        save(s);
        toaster('已收入错题本', 'info');
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
      save(s);
    },

    getWrongCount: function () {
      var s = load();
      return (s.wrongQuestions || []).length;
    },

    // 打卡
    checkin: function () {
      var s = load();
      var today = todayStr();
      if (s.checkinDates.indexOf(today) >= 0) {
        return { already: true, streak: s.currentStreak };
      }
      updateStreak(s);

      // 每日签到奖励（基于连续打卡天数）
      var streakDay = s.currentStreak % 7;
      if (streakDay === 0) streakDay = 7;
      var reward = CHECKIN_REWARDS[streakDay - 1] || CHECKIN_REWARDS[0];
      var bonusScore = reward.score;

      // 连续签到7天以上额外奖励
      if (s.currentStreak > 7 && s.currentStreak % 7 === 0) {
        bonusScore += 20; // 每7天额外+20
      }

      s.score = (s.score || 0) + bonusScore;
      s.totalExp = (s.totalExp || 0) + bonusScore;
      s.lastCheckinReward = today;
      save(s);
      toaster('打卡成功！连续' + s.currentStreak + '天，' + reward.desc, 'success');
      return { already: false, streak: s.currentStreak, bonusScore: bonusScore, reward: reward };
    },

    // ===== 学习等级系统 =====
    getLearnLevel: function() {
      var s = load();
      var score = s.score || 0;
      var level = LEARN_LEVELS[0];
      for (var i = LEARN_LEVELS.length - 1; i >= 0; i--) {
        if (score >= LEARN_LEVELS[i].minScore) { level = LEARN_LEVELS[i]; break; }
      }
      return level;
    },

    getLearnLevels: function() { return LEARN_LEVELS; },

    // ===== 周次任务积分 =====
    getWeekTaskStatus: function(weekNum) {
      var s = load();
      var key = 'week_' + weekNum;
      return s.weekTasks ? (s.weekTasks[key] || { review: false, practice: false, wrongbook: false }) : { review: false, practice: false, wrongbook: false };
    },

    completeWeekTask: function(weekNum, taskType) {
      var s = load();
      if (!s.weekTasks) s.weekTasks = {};
      var key = 'week_' + weekNum;
      if (!s.weekTasks[key]) s.weekTasks[key] = { review: false, practice: false, wrongbook: false };

      if (s.weekTasks[key][taskType]) {
        return { ok: false, msg: '该任务已完成' };
      }

      s.weekTasks[key][taskType] = true;
      var points = WEEK_TASK_SCORES[taskType] || 5;

      // 连续打卡加成
      var streakBonus = 1 + Math.min(s.currentStreak * 0.05, 0.5); // 最多+50%
      points = Math.floor(points * streakBonus);

      s.score = (s.score || 0) + points;
      s.totalExp = (s.totalExp || 0) + points;
      updateStreak(s);
      save(s);

      var taskNames = { review: '完成知识点复习', practice: '做配套练习题', wrongbook: '整理错题' };
      toaster('任务完成！' + (taskNames[taskType] || taskType) + ' +' + points + '积分' + (s.currentStreak > 1 ? '（连续' + s.currentStreak + '天加成）' : ''), 'success');
      return { ok: true, points: points, streakBonus: streakBonus };
    },

    getWeekProgress: function(weekNum) {
      var status = this.getWeekTaskStatus(weekNum);
      var done = 0;
      if (status.review) done++;
      if (status.practice) done++;
      if (status.wrongbook) done++;
      return { done: done, total: 3, status: status };
    },

    // ===== 练功房每日加成 =====
    recordDailyPractice: function(practiceType) {
      var s = load();
      var today = todayStr();
      if (!s.dailyPracticeDone) s.dailyPracticeDone = {};
      if (!s.dailyPracticeDone[today]) s.dailyPracticeDone[today] = {};
      var isFirst = !s.dailyPracticeDone[today][practiceType];
      s.dailyPracticeDone[today][practiceType] = true;
      save(s);
      return { isFirst: isFirst, todayDone: s.dailyPracticeDone[today] };
    },

    isDailyPracticeDone: function(practiceType) {
      var s = load();
      var today = todayStr();
      return s.dailyPracticeDone && s.dailyPracticeDone[today] && s.dailyPracticeDone[today][practiceType];
    },

    getDailyPracticeSummary: function() {
      var s = load();
      var today = todayStr();
      var done = s.dailyPracticeDone ? (s.dailyPracticeDone[today] || {}) : {};
      return {
        nickname: !!done.nickname,
        equation: !!done.equation,
        element: !!done.element,
        allDone: !!done.nickname && !!done.equation && !!done.element,
        count: (done.nickname ? 1 : 0) + (done.equation ? 1 : 0) + (done.element ? 1 : 0)
      };
    },

    // 带加成的练功房积分
    addPracticeScore: function(practiceType, basePoints) {
      var s = load();
      var today = todayStr();
      if (!s.dailyPracticeDone) s.dailyPracticeDone = {};
      if (!s.dailyPracticeDone[today]) s.dailyPracticeDone[today] = {};

      var isFirst = !s.dailyPracticeDone[today][practiceType];
      s.dailyPracticeDone[today][practiceType] = true;

      var multiplier = 1;
      // 首次完成该练功房今日任务：+50%
      if (isFirst) multiplier += 0.5;
      // 连续打卡加成
      multiplier += Math.min(s.currentStreak * 0.03, 0.3);

      var points = Math.floor(basePoints * multiplier);
      s.score = (s.score || 0) + points;
      s.totalExp = (s.totalExp || 0) + points;
      updateStreak(s);
      save(s);

      var bonusText = '';
      if (isFirst) bonusText += '首次+50% ';
      if (s.currentStreak > 1) bonusText += '连续' + s.currentStreak + '天加成 ';

      if (bonusText) {
        toaster('+' + points + '积分（' + bonusText.trim() + '）', 'success');
      }

      return { points: points, multiplier: multiplier, isFirst: isFirst };
    },

    // ===== 签到奖励信息 =====
    getCheckinRewardInfo: function() {
      var s = load();
      var streak = s.currentStreak || 0;
      var streakDay = streak % 7;
      if (streakDay === 0) streakDay = 7;
      var nextReward = CHECKIN_REWARDS[streakDay - 1] || CHECKIN_REWARDS[0];
      return {
        streak: streak,
        streakDay: streakDay,
        nextReward: nextReward,
        todayChecked: s.checkinDates.indexOf(todayStr()) >= 0,
        rewards: CHECKIN_REWARDS
      };
    },

    // Toast
    toaster: toaster,

    // 内部
    _saveState: save,
    _loadState: load
  };

  return api;
})();
