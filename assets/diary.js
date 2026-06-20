/**
 * diary.js — 2027届高考日记
 * 周次网格导航 + 展开面板
 */

(function() {
  var TOTAL_WEEKS = 40;
  var activeWeek = 0;

  // 40周占位数据
  var weekData = [];
  for (var i = 1; i <= TOTAL_WEEKS; i++) {
    weekData.push({
      week: i,
      title: '第' + i + '周',
      dateRange: getWeekDateRange(i),
      topics: [
        { name: '（待填入本周复习知识点1）', placeholder: true },
        { name: '（待填入本周复习知识点2）', placeholder: true },
        { name: '（待填入本周复习知识点3）', placeholder: true }
      ],
      tasks: [
        { name: '完成本周知识点复习', done: false },
        { name: '做配套练习题', done: false },
        { name: '整理错题', done: false }
      ]
    });
  }

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
  }

  // 生成周次网格
  function generateWeekGrid() {
    var grid = document.getElementById('weekGrid');
    if (!grid) return;
    var currentWeek = getCurrentWeek();
    var html = '';
    for (var i = 1; i <= TOTAL_WEEKS; i++) {
      var cls = 'week-cell';
      if (i === currentWeek) cls += ' current';
      html += '<div class="' + cls + '" data-week="' + i + '" onclick="toggleWeek(' + i + ')">';
      html += '<div class="week-num">' + i + '</div>';
      html += '</div>';
    }
    grid.innerHTML = html;
  }

  // 切换周次面板
  window.toggleWeek = function(weekNum) {
    var panel = document.getElementById('weekPanel');
    var cells = document.querySelectorAll('.week-cell');

    if (activeWeek === weekNum) {
      // 收起
      closeWeekPanel();
      return;
    }

    // 更新网格高亮
    cells.forEach(function(c) { c.classList.remove('active'); });
    var activeCell = document.querySelector('.week-cell[data-week="' + weekNum + '"]');
    if (activeCell) activeCell.classList.add('active');

    // 填充面板内容
    var data = weekData[weekNum - 1];
    document.getElementById('panelTitle').textContent = data.title;
    document.getElementById('panelDate').textContent = data.dateRange;

    var topicsHtml = '';
    for (var i = 0; i < data.topics.length; i++) {
      var t = data.topics[i];
      topicsHtml += '<li class="' + (t.placeholder ? 'placeholder' : '') + '">' + t.name + '</li>';
    }
    document.getElementById('panelTopics').innerHTML = topicsHtml;

    var tasksHtml = '';
    for (var j = 0; j < data.tasks.length; j++) {
      var task = data.tasks[j];
      tasksHtml += '<li><input type="checkbox" ' + (task.done ? 'checked' : '') + ' disabled><span>' + task.name + '</span></li>';
    }
    document.getElementById('panelTasks').innerHTML = tasksHtml;

    // 显示面板
    panel.classList.add('active');
    activeWeek = weekNum;

    // 滚动到面板
    setTimeout(function() {
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  // 收起面板
  window.closeWeekPanel = function() {
    var panel = document.getElementById('weekPanel');
    var cells = document.querySelectorAll('.week-cell');
    panel.classList.remove('active');
    cells.forEach(function(c) { c.classList.remove('active'); });
    activeWeek = 0;
  };

  // 初始化
  generateWeekGrid();
  initStats();

})();
