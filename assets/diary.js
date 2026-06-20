/**
 * diary.js — 2027届高考日记
 * 桌面端：3D翻页书
 * 手机端：单页卡片滑动
 */

(function() {
  var TOTAL_WEEKS = 40;
  var currentPage = -1;
  var isOpen = false;
  var isMobile = window.innerWidth <= 768;

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
    return (d.getMonth() + 1) + '/' + d.getDate();
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

    var now = new Date();
    var start = new Date(2026, 6, 6);
    var diffDays = Math.floor((now - start) / 86400000);
    var currentWeek = Math.max(1, Math.min(40, Math.floor(diffDays / 7) + 1));
    if (weekEl) weekEl.textContent = currentWeek;
  }

  // ========== 桌面端：3D翻页书 ==========
  function generateDesktopPages() {
    var container = document.getElementById('bookPages');
    if (!container) return;
    var html = '';
    html += generateTocPage();
    for (var i = 0; i < TOTAL_WEEKS; i++) {
      html += generateWeekPage(weekData[i], i + 1);
    }
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
    h += '<div style="font-size:14px;color:var(--ink-light);margin-bottom:24px;">化学</div>';
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

  window.openBook = function() {
    if (isOpen) return;
    isOpen = true;
    var cover = document.getElementById('bookCover');
    var pages = document.getElementById('bookPages');
    if (!cover || !pages) return;
    cover.style.transform = 'rotateY(-160deg)';
    cover.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
    setTimeout(function() {
      cover.style.display = 'none';
      pages.style.display = 'block';
      currentPage = 0;
      showPage(0);
    }, 500);
  };

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

  window.nextPage = function() {
    if (currentPage < TOTAL_WEEKS + 1) {
      showPage(currentPage + 1);
    }
  };

  window.prevPage = function() {
    if (currentPage > 0) {
      showPage(currentPage - 1);
    }
  };

  window.goToWeek = function(weekNum) {
    if (isMobile) {
      showMobileWeek(weekNum);
    } else {
      showPage(weekNum);
    }
  };

  // ========== 手机端：单页卡片 ==========
  var mobileCurrentWeek = 0; // 0 = 封面, -1 = 目录

  function generateMobilePages() {
    var container = document.getElementById('mobilePages');
    if (!container) return;
    var html = '';

    // 手机端封面
    html += '<div class="mobile-cover" id="mobileCover">';
    html += '<div class="mobile-cover-title">2027届高考日记</div>';
    html += '<div class="mobile-cover-sub">化学</div>';
    html += '<button class="mobile-open-btn" onclick="openMobileBook()">翻开日记</button>';
    html += '</div>';

    // 手机端目录
    html += '<div class="mobile-toc" id="mobileToc">';
    html += '<div class="mobile-toc-title">目 录</div>';
    html += '<div class="mobile-toc-grid">';
    for (var i = 1; i <= TOTAL_WEEKS; i++) {
      html += '<div class="mobile-toc-item" onclick="showMobileWeek(' + i + ')">第' + i + '周</div>';
    }
    html += '</div>';
    html += '</div>';

    // 手机端周卡片
    for (var j = 0; j < TOTAL_WEEKS; j++) {
      html += generateMobileWeekCard(weekData[j], j + 1);
    }

    container.innerHTML = html;
  }

  function generateMobileWeekCard(data, weekNum) {
    var h = '<div class="mobile-card" id="mobile-week-' + weekNum + '" data-week="' + weekNum + '">';
    h += '<div class="mobile-card-header">';
    h += '<div class="mobile-card-week">' + data.title + '</div>';
    h += '<div class="mobile-card-date">' + data.dateRange + '</div>';
    h += '</div>';

    h += '<div class="mobile-section-title">本周复习内容</div>';
    h += '<ul class="mobile-topic-list">';
    for (var i = 0; i < data.topics.length; i++) {
      var t = data.topics[i];
      h += '<li class="' + (t.placeholder ? 'placeholder' : '') + '">' + t.name + '</li>';
    }
    h += '</ul>';

    h += '<div class="mobile-section-title">本周任务</div>';
    for (var j = 0; j < data.tasks.length; j++) {
      var task = data.tasks[j];
      h += '<div class="mobile-task-item">';
      h += '<input type="checkbox" ' + (task.done ? 'checked' : '') + ' disabled>';
      h += '<span>' + task.name + '</span>';
      h += '</div>';
    }

    h += '<div class="mobile-section-title">学习心得</div>';
    h += '<div style="background:var(--paper-dark);border-radius:8px;padding:12px;min-height:80px;font-size:13px;color:var(--ink-light);">（点击此处记录本周学习心得...）</div>';

    h += '<div class="mobile-nav-bar">';
    h += '<button class="mobile-nav-btn" onclick="mobilePrevWeek()">← 上一周</button>';
    h += '<span class="mobile-week-indicator">' + weekNum + ' / ' + TOTAL_WEEKS + '</span>';
    h += '<button class="mobile-nav-btn" onclick="mobileNextWeek()">下一周 →</button>';
    h += '</div>';

    h += '</div>';
    return h;
  }

  window.openMobileBook = function() {
    var cover = document.getElementById('mobileCover');
    var toc = document.getElementById('mobileToc');
    if (cover) cover.style.display = 'none';
    if (toc) {
      toc.classList.add('active');
      toc.style.display = 'block';
    }
    mobileCurrentWeek = -1;
  };

  window.showMobileWeek = function(weekNum) {
    var toc = document.getElementById('mobileToc');
    if (toc) toc.style.display = 'none';

    // 隐藏所有卡片
    var allCards = document.querySelectorAll('.mobile-card');
    allCards.forEach(function(c) { c.classList.remove('active'); });

    // 显示指定周
    var card = document.getElementById('mobile-week-' + weekNum);
    if (card) card.classList.add('active');
    mobileCurrentWeek = weekNum;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.mobileNextWeek = function() {
    if (mobileCurrentWeek < TOTAL_WEEKS) {
      showMobileWeek(mobileCurrentWeek + 1);
    }
  };

  window.mobilePrevWeek = function() {
    if (mobileCurrentWeek > 1) {
      showMobileWeek(mobileCurrentWeek - 1);
    } else if (mobileCurrentWeek === 1) {
      // 回到目录
      var toc = document.getElementById('mobileToc');
      var allCards = document.querySelectorAll('.mobile-card');
      allCards.forEach(function(c) { c.classList.remove('active'); });
      if (toc) {
        toc.style.display = 'block';
        toc.classList.add('active');
      }
      mobileCurrentWeek = -1;
    }
  };

  // ========== 初始化 ==========
  function init() {
    initStats();
    if (isMobile) {
      generateMobilePages();
    } else {
      generateDesktopPages();
    }
  }

  // 窗口大小变化时刷新
  window.addEventListener('resize', function() {
    var newIsMobile = window.innerWidth <= 768;
    if (newIsMobile !== isMobile) {
      location.reload();
    }
  });

  init();

})();
