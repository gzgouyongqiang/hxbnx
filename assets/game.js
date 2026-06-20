/**
 * game.js v4 — 2027届高考日记 精简版
 * 保留：积分、连续打卡、错题本、toast、副本积分同步
 * 去掉：等级、成就、抽卡、元素收集、银行、每日任务、排行榜
 * localStorage key: hxbnx_game_v2 (兼容旧数据)
 */
const HXBNX_GAME = (function () {

  const KEY = 'hxbnx_game_v2';

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
      version: 4
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
      save(s);
      toaster('打卡成功！连续' + s.currentStreak + '天', 'success');
      return { already: false, streak: s.currentStreak };
    },

    // Toast
    toaster: toaster,

    // 内部
    _saveState: save,
    _loadState: load
  };

  return api;
})();
