/**
 * diary.js — 2027届高考日记
 * 讲次网格导航（第1讲~第67讲）
 */

(function() {
  var TOTAL_LESSONS = 67;

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
    if (weekEl) weekEl.textContent = TOTAL_LESSONS;

    // 显示学习等级
    if (HXBNX_GAME.getLearnLevel) {
      var level = HXBNX_GAME.getLearnLevel();
      var levelEl = document.getElementById('levelDisplay');
      if (levelEl) {
        levelEl.textContent = level.icon + ' ' + level.name;
      }
    }
  }

  // 生成讲次网格（第1讲~第67讲）
  function generateWeekGrid() {
    var grid = document.getElementById('weekGrid');
    if (!grid) return;
    var html = '';
    for (var i = 1; i <= TOTAL_LESSONS; i++) {
      html += '<div class="week-cell" onclick="openLesson(' + i + ')">';
      html += '<div class="week-num">第' + i + '讲</div>';
      html += '</div>';
    }
    grid.innerHTML = html;
  }

  // 点击讲次跳转到 topics 讲次页
  window.openLesson = function(n) {
    var file = (n < 10 ? '0' + n : String(n));
    window.location.href = 'topics/' + file + '.html';
  };

  // 初始化
  generateWeekGrid();
  initStats();

})();
