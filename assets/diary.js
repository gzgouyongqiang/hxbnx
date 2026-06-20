/**
 * diary.js — 2027届高考日记
 * 3D翻页书交互 + 周导航
 */

(function() {
  var TOTAL_WEEKS = 40;
  var currentPage = -1; // -1 = 封面, 0 = 目录, 1~40 = 周页面
  var isOpen = false;

  // 40周占位数据（后续强哥一周一周填入）
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

  // 计算周次对应的日期范围（假设从2026年7月第1周开始）
  function getWeekDateRange(weekNum) {
    var start = new Date(2026, 6, 6); // 2026年7月6日（周一）
    start.setDate(start.getDate() + (weekNum - 1) * 7);
    var end = new Date(start);
    end.setDate(end.getDate() + 6);
    return formatDate(start) + ' ~ ' + formatDate(end);
  }

  function formatDate(d) {
    return (d.getMonth() + 1) + '/' + d.getDate();
  }

  // 初始化顶部统计
  function initStats() {
    var s = HXBNX_GAME.getStatus ? HXBNX_GAME.getStatus() : { state: {} };
    var state = s.state || {};
    document.getElementById('scoreNum').textContent = state.score || 0;
    document.getElementById('streakNum').textContent = state.currentStreak || 0;
    document.getElementById('wrongNum').textContent = (state.wrongQuestions || []).length;

    // 计算当前周次
    var now = new Date();
    var start = new Date(2026, 6, 6);
    var diffDays = Math.floor((now - start) / 86400000);
    var currentWeek = Math.max(1, Math.min(40, Math.floor(diffDays / 7) + 1));
    document.getElementById('weekNum').textContent = currentWeek;
  }

  // 生成所有页面
  function generatePages() {
    var container = document.getElementById('bookPages');
    var html = '';

    // 第0页：目录
    html += generateTocPage();

    // 第1~40页：周页面
    for (var i = 0; i < TOTAL_WEEKS; i++) {
      html += generateWeekPage(weekData[i], i + 1);
    }

    // 封底
    html += generateBackPage();

    container.innerHTML = html;
  }

  function generateTocPage() {
    var h = '<div class="page toc-page" data-page="0">';
    h += '<div class="page-content">';
    h += '<div class="toc-title">目 录</div>';
    h += '<div class="toc-grid">';
    for (var i = 1; i <= TOTAL_WEEKS; i++) {
      h += '<div class="toc-item" onclick="goToWeek(' + i + ')">第' + i + '周</div>';
    }
    h += '</div>';
    h += '</div>';
    h += '<div class="page-nav page-nav-right">';
    h += '<button class="page-btn" onclick="nextPage()">下一页 →</button>';
    h += '</div>';
    h += '</div>';
    return h;
  }

  function generateWeekPage(data, pageNum) {
    var h = '<div class="page" data-page="' + pageNum + '">';

    // 左页：知识点
    h += '<div class="page-content page-left">';
    h += '<div class="page-header">';
    h += '<div class="page-week">' + data.title + '</div>';
    h += '<div class="page-date">' + data.dateRange + '</div>';
    h += '</div>';
    h += '<div style="font-size:13px;color:var(--ink-light);margin-bottom:10px;">本周复习内容</div>';
    h += '<ul class="topic-list">';
    for (var i = 0; i < data.topics.length; i++) {
      var t = data.topics[i];
      h += '<li class="' + (t.placeholder ? 'placeholder' : '') + '">' + t.name + '</li>';
    }
    h += '</ul>';
    h += '</div>';

    // 右页：任务
    h += '<div class="page-content page-right">';
    h += '<div style="font-size:13px;color:var(--ink-light);margin-bottom:10px;">本周任务</div>';
    h += '<div class="task-box">';
    for (var j = 0; j < data.tasks.length; j++) {
      var task = data.tasks[j];
      h += '<div class="task-item">';
      h += '<input type="checkbox" ' + (task.done ? 'checked' : '') + ' disabled>';
      h += '<span>' + task.name + '</span>';
      h += '</div>';
    }
    h += '</div>';
    h += '<div style="margin-top:16px;font-size:12px;color:var(--ink-light);line-height:1.8;">';
    h += '<div style="font-weight:700;color:var(--red-ink);margin-bottom:6px;">学习心得</div>';
    h += '<div style="background:var(--paper-dark);border-radius:6px;padding:10px;min-height:60px;">（点击此处记录本周学习心得...）</div>';
    h += '</div>';
    h += '</div>';

    // 翻页按钮
    h += '<div class="page-nav page-nav-left">';
    h += '<button class="page-btn" onclick="prevPage()">← 上一页</button>';
    h += '</div>';
    h += '<div class="page-nav page-nav-right">';
    h += '<button class="page-btn" onclick="nextPage()">下一页 →</button>';
    h += '</div>';

    h += '</div>';
    return h;
  }

  function generateBackPage() {
    var h = '<div class="page" data-page="' + (TOTAL_WEEKS + 1) + '">';
    h += '<div class="page-content" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">';
    h += '<div style="font-size:28px;font-weight:800;color:var(--red-ink);margin-bottom:12px;">2027届高考日记</div>';
    h += '<div style="font-size:14px;color:var(--ink-light);margin-bottom:24px;">化学 · 一轮复习</div>';
    h += '<div style="font-size:13px;color:var(--ink-light);line-height:2;">';
    h += '<div>坚持每一天，积累每一步</div>';
    h += '<div>愿你在高考中取得优异成绩</div>';
    h += '</div>';
    h += '<div style="margin-top:30px;font-size:12px;color:var(--gold-dim);">— 化学不难学 —</div>';
    h += '</div>';
    h += '<div class="page-nav page-nav-left">';
    h += '<button class="page-btn" onclick="prevPage()">← 上一页</button>';
    h += '</div>';
    h += '</div>';
    return h;
  }

  // 翻开书
  window.openBook = function() {
    if (isOpen) return;
    isOpen = true;
    var cover = document.getElementById('bookCover');
    var pages = document.getElementById('bookPages');

    cover.style.transform = 'rotateY(-160deg)';
    cover.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';

    setTimeout(function() {
      cover.style.display = 'none';
      pages.style.display = 'block';
      currentPage = 0;
      showPage(0);
    }, 500);
  };

  // 显示指定页面
  function showPage(pageNum) {
    var pages = document.querySelectorAll('.page');
    pages.forEach(function(p, idx) {
      if (idx < pageNum) {
        p.classList.add('flipped');
      } else {
        p.classList.remove('flipped');
      }
    });
    currentPage = pageNum;
  }

  // 下一页
  window.nextPage = function() {
    if (currentPage < TOTAL_WEEKS + 1) {
      showPage(currentPage + 1);
    }
  };

  // 上一页
  window.prevPage = function() {
    if (currentPage > 0) {
      showPage(currentPage - 1);
    }
  };

  // 跳转到指定周
  window.goToWeek = function(weekNum) {
    showPage(weekNum);
  };

  // 初始化
  generatePages();
  initStats();

})();
