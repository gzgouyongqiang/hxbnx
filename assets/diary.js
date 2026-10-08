/**
 * diary.js — 2027届高考日记
 * 讲次网格导航：每讲双入口（课堂展示 / 缺口真题）
 *
 * 讲次数据来自 assets/lessons.js，页面本身不硬编码讲次信息。
 * 未上传的讲次：按钮渲染为灰色、无链接、不可点击。
 */

(function () {
  var TOTAL_LESSONS = (window.HXBNX_TOTAL_LESSONS || 67);
  var UNIT_NAMES = {
    '一': '大单元一　物质基础与实验',
    '二': '大单元二　元素化合物',
    '三': '大单元三　物质结构与性质',
    '四': '大单元四　化学反应原理与工业',
    '五': '大单元五　有机化学',
    '六': '大单元六　化学实验'
  };

  function lessons() {
    return window.HXBNX_LESSONS || [];
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ===== 顶部统计 ===== */
  function initStats() {
    var s = (window.HXBNX_GAME && HXBNX_GAME.getStatus) ? HXBNX_GAME.getStatus() : { state: {} };
    var state = s.state || {};
    var set = function (id, v) {
      var el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    set('scoreNum', state.score || 0);
    set('streakNum', state.currentStreak || 0);
    set('wrongNum', (state.wrongQuestions || []).length);
    set('weekNum', TOTAL_LESSONS);

    var all = lessons();
    var done = all.filter(function (l) { return l.cls || l.gap; }).length;
    set('uploadNum', done);

    if (window.HXBNX_GAME && HXBNX_GAME.getLearnLevel) {
      var level = HXBNX_GAME.getLearnLevel();
      var lv = document.getElementById('levelDisplay');
      if (lv) lv.textContent = level.icon + ' ' + level.name;
    }
  }

  /* ===== 单个资源按钮 ===== */
  function resourceBtn(label, href, ready) {
    if (ready && href) {
      return '<a class="res-btn res-on" href="' + esc(href) + '">' + label + '</a>';
    }
    return '<span class="res-btn res-off" aria-disabled="true" title="待上传">' + label + '</span>';
  }

  function lessonCell(l) {
    var html = '<div class="week-pair">';
    html += '<div class="week-head"><span class="week-num">第' + l.n + '讲</span></div>';
    html += '<div class="week-title">' + esc(l.t) + '</div>';
    html += '<div class="week-res">';
    html += resourceBtn('课堂展示', l.cls, !!l.cls);
    html += resourceBtn('缺口真题', l.gap, !!l.gap);
    html += '</div></div>';
    return html;
  }

  /* ===== 按大单元分组渲染 ===== */
  function generateWeekGrid() {
    var grid = document.getElementById('weekGrid');
    if (!grid) return;
    var all = lessons();
    var html = '';
    var order = [];
    var groups = {};

    all.forEach(function (l) {
      if (!groups[l.unit]) { groups[l.unit] = []; order.push(l.unit); }
      groups[l.unit].push(l);
    });

    order.forEach(function (u) {
      html += '<div class="unit-block">';
      html += '<div class="unit-name">' + esc(UNIT_NAMES[u] || ('大单元' + u)) + '</div>';
      html += '<div class="week-grid">';
      groups[u].forEach(function (l) { html += lessonCell(l); });
      html += '</div></div>';
    });

    grid.innerHTML = html;
  }

  /* ===== 兼容旧调用：openLesson(n) 走课堂展示 ===== */
  window.openLesson = function (n) {
    var l = window.HXBNX_getLesson ? HXBNX_getLesson(n) : null;
    if (l && l.cls) { window.location.href = l.cls; return; }
    if (l && l.gap) { window.location.href = l.gap; return; }
    alert('第' + n + '讲的资料尚未上传');
  };

  generateWeekGrid();
  initStats();
})();
