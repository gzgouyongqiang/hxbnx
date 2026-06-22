/**
 * diary.js — 2027届高考日记
 * 周次网格导航 + 展开面板 + 学习进度显示
 */

(function() {
  var TOTAL_WEEKS = 40;

  function getWeekDateRange(weekNum) {
    var start = new Date(2026, 6, 6);
    start.setDate(start.getDate() + (weekNum - 1) * 7);
    var end = new Date(start);
    end.setDate(end.getDate() + 6);
    return formatDate(start) + ' ~ ' + formatDate(end);
  }

  function formatDate(d) {
    return (d.getMonth() + 1) + '月' + d.getDate() + '日';
  }

  // 计算当前周次
  function getCurrentWeek() {
    var now = new Date();
    var start = new Date(2026, 6, 6);
    var diffDays = Math.floor((now - start) / 86400000);
    return Math.max(1, Math.min(TOTAL_WEEKS, Math.floor(diffDays / 7) + 1));
  }

  // 初始化顶部统计
  function initStats() {
    var s = HXBNX_GAME.getStatus ? HXBNX_GAME.getStatus() : { state: {} };
    var state = s.state || {};
    var scoreEl = document.getElementById('scoreNum');
    var streakEl = document.getElementById('streakNum');
    var wrongEl = document.getElementById('wrongNum');
    var weekEl = document.getElementById('weekNum');
    if (scoreEl) scoreEl.textContent = state.score || 0;
    if (streakEl) streakEl.textContent = state.currentStreak || 0;
    if (wrongEl) wrongEl.textContent = (state.wrongQuestions || []).length;
    if (weekEl) weekEl.textContent = getCurrentWeek();

    // 显示学习等级
    if (HXBNX_GAME.getLearnLevel) {
      var level = HXBNX_GAME.getLearnLevel();
      var levelEl = document.getElementById('levelDisplay');
      if (levelEl) {
        levelEl.textContent = level.icon + ' ' + level.name;
      }
    }
  }

  // 生成周次网格（带学习进度标记）
  function generateWeekGrid() {
    var grid = document.getElementById('weekGrid');
    if (!grid) return;
    var currentWeek = getCurrentWeek();
    var html = '';
    for (var i = 1; i <= TOTAL_WEEKS; i++) {
      var cls = 'week-cell';
      if (i === currentWeek) cls += ' current';

      // 检查该周的学习进度
      var progress = 0;
      if (HXBNX_GAME.getWeekProgress) {
        var p = HXBNX_GAME.getWeekProgress(i);
        progress = p.done;
      }

      var statusIcon = '';
      if (progress === 3) {
        statusIcon = '<div class="week-status complete">✓</div>';
        cls += ' completed';
      } else if (progress > 0) {
        statusIcon = '<div class="week-status partial">' + progress + '/3</div>';
        cls += ' in-progress';
      }

      html += '<div class="' + cls + '" data-week="' + i + '" onclick="toggleWeek(' + i + ')">';
      html += '<div class="week-num">' + i + '</div>';
      html += statusIcon;
      html += '</div>';
    }
    grid.innerHTML = html;
  }

  // 点击周次跳转到独立页面
  window.toggleWeek = function(weekNum) {
    window.location.href = 'week.html?w=' + weekNum;
  };

  // 初始化
  generateWeekGrid();
  initStats();

})();
