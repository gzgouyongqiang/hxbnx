/**
 * hxbnx-handwrite.js — 课堂大屏工具条（手写标注 + 字号 + 亮度 + 打印讲义）v6
 * ------------------------------------------------------------------
 * 用法：与课件HTML放同一文件夹，在课件 </body> 前插入一行：
 *   [script src="hxbnx-handwrite.js"]
 *
 * 包含两个模块：
 *   ① 手写标注画板：平时只显示 ✏️ 悬浮按钮；点击向下单列展开菜单并开启手写；
 *      再点收起并关闭。支持触屏手指、触控笔、鼠标。Ctrl+H 开关，Ctrl+Shift+C 清空。
 *   ② 显示控制条（字号 / 亮度）：左下角常驻，点一下循环切换，自动记住选择。
 *
 * ★ 兼容策略（重要）：
 *   - 课件若自带控制条（存在 #fsBtn / #lumBtn / #uiBar），本脚本 **不再重复创建**，
 *     避免和课件原有的字号/亮度功能打架（线上 67 讲课件都自带）。
 *   - 课件若使用 CSS 变量字号体系（:root 里有 --fs-* 变量）→ 走「变量模式」：
 *     精确缩放每个 --fs-* 字号、并对颜色变量做明暗调整，与课件原有观感一致。
 *   - 课件若没有变量体系 → 走「通用模式」：整体 zoom 放大 + filter 调亮度。
 *
 * ★ 手写画布与工具栏挂在 documentElement（body 之外）：
 *   这样即便通用模式给 body 加了 filter/zoom，手写笔迹也不会被一起缩放或跑位。
 */
(function () {
  'use strict';

  /* ================================================================
     模块一：手写标注画板
     ================================================================ */
  (function () {
    if (window.__hxbnxHandwrite) return;

    function init() {
      if (window.__hxbnxHandwrite) return;
      window.__hxbnxHandwrite = true;

      var config = { penColor: '#e74c3c', penSize: 3, eraserSize: 25 };
      var enabled = false;      // 手写功能开关
      var mode = 'pen';         // 'pen' | 'eraser'
      var drawing = false, lastX = 0, lastY = 0;
      var curStroke = null;     // 当前这一笔

      // 笔迹记录（文档坐标）：屏幕上的画布是视口固定的，
      // 滚动后插位会“留在屏幕上”。但打印讲义时要把笔迹对准内容。
      // 所以每一点都记一份文档坐标，打印时再按页的坐标区间叠加。
      var strokes = [];         // { c:颜色, w:粗细, e:1表示模擦, p:[[x,y],...] }
      try { window.__hxbnxHandwriteStrokes = strokes; } catch (ex) {}

      // 挂载点：body 之外（documentElement），避免受 body 的 filter/zoom 影响
      var host = document.documentElement;

      // ===== Canvas =====
      var canvas = document.createElement('canvas');
      canvas.id = 'hxbnx-draw-canvas';
      canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99998;touch-action:none;';
      host.appendChild(canvas);
      var ctx = canvas.getContext('2d');

      function resizeKeep() {
        var img = null;
        try { img = ctx.getImageData(0, 0, canvas.width, canvas.height); } catch (ex) {}
        var dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (img) ctx.putImageData(img, 0, 0);
      }
      resizeKeep();
      window.addEventListener('resize', resizeKeep);

      // ===== 工具栏：外容器（右上角，竖向向下展开） =====
      var toolbar = document.createElement('div');
      toolbar.id = 'hxbnx-draw-toolbar';
      toolbar.style.cssText = 'position:fixed;top:12px;right:12px;z-index:99999;display:flex;flex-direction:column;align-items:flex-end;gap:0;background:rgba(30,30,40,0.92);border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.3);font-family:sans-serif;user-select:none;transition:background .25s,padding .2s;';
      host.appendChild(toolbar);

      // 菜单区（竖向单列：每个控件独占一行，默认收起）
      var menuWrap = document.createElement('div');
      menuWrap.id = 'hxbnx-draw-menu';
      menuWrap.style.cssText = 'display:none;flex-direction:column;align-items:center;gap:6px;padding:10px 0 4px 0;';
      toolbar.appendChild(menuWrap);

      function mkBtn(label, title, onclick) {
        var b = document.createElement('button');
        b.textContent = label;
        b.title = title;
        b.style.cssText = 'min-width:40px;height:40px;border:none;border-radius:8px;background:rgba(255,255,255,0.12);color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;';
        b.addEventListener('mouseenter', function () { b.style.background = 'rgba(255,255,255,0.25)'; });
        b.addEventListener('mouseleave', function () {
          if (b !== eraserBtn || mode !== 'eraser') b.style.background = 'rgba(255,255,255,0.12)';
        });
        b.addEventListener('click', onclick);
        return b;
      }

      var eraserBtn; // 前置声明

      // 颜色按钮（红黄绿三色，每个独占一行）
      var colors = ['#e74c3c', '#f1c40f', '#2ecc71'];
      colors.forEach(function (c) {
        var b = document.createElement('button');
        b.title = '选择画笔颜色';
        b.style.cssText = 'width:34px;height:34px;border:2px solid rgba(255,255,255,0.4);border-radius:50%;background:' + c + ';cursor:pointer;padding:0;';
        b.addEventListener('click', function () {
          config.penColor = c;
          mode = 'pen';
          eraserBtn.style.background = 'rgba(255,255,255,0.12)';
        });
        menuWrap.appendChild(b);
      });

      // 笔粗细（竖排三行：＋ / 数字 / －）
      menuWrap.appendChild(mkBtn('＋', '加粗', function () {
        config.penSize = Math.min(config.penSize + 1, 20);
        sizeLabel.textContent = config.penSize;
      }));

      var sizeLabel = document.createElement('span');
      sizeLabel.textContent = config.penSize;
      sizeLabel.style.cssText = 'color:#fff;font-size:14px;line-height:24px;min-width:24px;text-align:center';
      menuWrap.appendChild(sizeLabel);

      menuWrap.appendChild(mkBtn('－', '变细', function () {
        config.penSize = Math.max(config.penSize - 1, 1);
        sizeLabel.textContent = config.penSize;
      }));

      // 橡皮擦（独占一行）
      eraserBtn = mkBtn('🧽', '橡皮擦', function () {
        mode = (mode === 'eraser') ? 'pen' : 'eraser';
        eraserBtn.style.background = (mode === 'eraser') ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.12)';
      });
      menuWrap.appendChild(eraserBtn);

      // 清空（独占一行）
      menuWrap.appendChild(mkBtn('🗑', '清空画板（Ctrl+Shift+C）', function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        strokes.length = 0;   // 一起清掉记录，打印时也不会出现
      }));

      // ===== 笔图标开关按钮（第一行，始终可见，菜单在其下方展开） =====
      var toggleBtn = document.createElement('button');
      toggleBtn.id = 'hxbnx-draw-toggle';
      toggleBtn.title = '点击开启手写标注，再点关闭（Ctrl+H）';
      toggleBtn.textContent = '✏️';
      toggleBtn.style.cssText = 'width:44px;height:44px;border:none;border-radius:12px;background:rgba(255,255,255,0.12);color:#fff;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,transform .15s;margin:4px;';
      toggleBtn.addEventListener('mouseenter', function () { if (!enabled) toggleBtn.style.background = 'rgba(255,255,255,0.25)'; });
      toggleBtn.addEventListener('mouseleave', function () { if (!enabled) toggleBtn.style.background = 'rgba(255,255,255,0.12)'; });
      toolbar.insertBefore(toggleBtn, toolbar.firstChild);

      function setEnabled(on) {
        enabled = on;
        canvas.style.pointerEvents = enabled ? 'auto' : 'none';
        if (enabled) {
          menuWrap.style.display = 'flex';
          toolbar.style.padding = '0 10px 8px 10px';
          toggleBtn.style.background = 'rgba(231,76,60,0.6)';
          toggleBtn.style.transform = 'rotate(-15deg)';
        } else {
          menuWrap.style.display = 'none';
          toolbar.style.padding = '0';
          toggleBtn.style.background = 'rgba(255,255,255,0.12)';
          toggleBtn.style.transform = 'rotate(0deg)';
          drawing = false;           // 防止关菜单时笔画悬空
          mode = 'pen';              // 关闭时重置回画笔模式
          eraserBtn.style.background = 'rgba(255,255,255,0.12)';
        }
      }
      setEnabled(false); // 初始收起，只显示笔图标

      toggleBtn.addEventListener('click', function () { setEnabled(!enabled); });

      // ===== 绘画 =====
      function getPos(e) {
        var rect = canvas.getBoundingClientRect();
        if (e.touches && e.touches.length > 0) {
          return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      }

      // 文档坐标（相对页面顶部）
      function docPos(e) {
        var rect = canvas.getBoundingClientRect();
        var cx, cy;
        if (e.touches && e.touches.length > 0) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
        else { cx = e.clientX; cy = e.clientY; }
        return [cx - rect.left + (window.scrollX || 0), cy - rect.top + (window.scrollY || 0)];
      }

      function startDraw(e) {
        if (!enabled) return;
        if (e.cancelable) e.preventDefault();
        drawing = true;
        var p = getPos(e);
        lastX = p.x; lastY = p.y;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (mode === 'eraser' ? config.eraserSize : config.penSize) / 2, 0, Math.PI * 2);
        ctx.fillStyle = (mode === 'eraser' ? 'rgba(0,0,0,1)' : config.penColor);
        ctx.globalCompositeOperation = (mode === 'eraser' ? 'destination-out' : 'source-over');
        ctx.fill();
        // 开始新的一笔
        curStroke = {
          c: config.penColor,
          w: config.penSize,
          e: (mode === 'eraser' ? 1 : 0),
          p: [docPos(e)]
        };
        strokes.push(curStroke);
      }

      function draw(e) {
        if (!enabled || !drawing) return;
        if (e.cancelable) e.preventDefault();
        var p = getPos(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(p.x, p.y);
        ctx.lineWidth = (mode === 'eraser') ? config.eraserSize : config.penSize;
        ctx.strokeStyle = (mode === 'eraser') ? 'rgba(0,0,0,1)' : config.penColor;
        ctx.globalCompositeOperation = (mode === 'eraser') ? 'destination-out' : 'source-over';
        ctx.stroke();
        lastX = p.x; lastY = p.y;
        if (curStroke) curStroke.p.push(docPos(e));
      }

      function endDraw(e) {
        drawing = false;
        curStroke = null;
        if (e && e.cancelable) e.preventDefault();
      }

      canvas.addEventListener('touchstart', startDraw, { passive: false });
      canvas.addEventListener('touchmove', draw, { passive: false });
      canvas.addEventListener('touchend', endDraw, { passive: false });
      canvas.addEventListener('touchcancel', endDraw, { passive: false });
      canvas.addEventListener('mousedown', startDraw);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', endDraw);
      canvas.addEventListener('mouseleave', endDraw);

      // ===== 快捷键 =====
      document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && !e.shiftKey && (e.key === 'h' || e.key === 'H')) {
          e.preventDefault();
          setEnabled(!enabled);
        }
        if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
          e.preventDefault();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          strokes.length = 0;
        }
      });

      console.log('[hxbnx] 手写画板v6已加载：点✏️或Ctrl+H开关，Ctrl+Shift+C清空');
    }

    // 无论引用这行插在 head 还是 body，都能正确初始化
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();

  /* ================================================================
     模块二：显示控制条（字号 / 亮度）
     ================================================================ */
  (function () {
    if (window.__hxbnxDisplay) return;

    var FS_MUL = [1, 1.15, 1.3];          // 标准 / 大 / 特大
    var FS_NAME = ['标准', '大', '特大'];
    var LV = [80, 90, 100, 110, 120];      // 亮度档位
    var curFs = 0, curLum = 100;

    function collectRootVars() {
      var map = {};
      var styles = document.querySelectorAll('style');
      for (var i = 0; i < styles.length; i++) {
        var txt = styles[i].textContent || '';
        var re = /:root\s*\{([^}]*)\}/g, m;
        while ((m = re.exec(txt))) {
          m[1].replace(/(--[a-zA-Z0-9-]+)\s*:\s*([^;]+)/g, function (_, k, v) {
            map[k] = String(v).trim();
            return '';
          });
        }
      }
      return map;
    }

    function hasVar(map, prefix) {
      for (var k in map) { if (k.indexOf(prefix) === 0) return true; }
      return false;
    }

    function shade(hex, k) {
      var m = hex.slice(1).match(/../g);
      if (!m) return hex;
      var o = '#';
      for (var i = 0; i < 3; i++) {
        var v = Math.round(parseInt(m[i], 16) * k);
        if (v > 255) v = 255;
        if (v < 0) v = 0;
        o += ('0' + v.toString(16)).slice(-2);
      }
      return o;
    }

    function init() {
      if (window.__hxbnxDisplay) return;

      // 课件自带控制条 → 不重复造（线上 67 讲课件都自带，避免双份打架）
      var own = document.getElementById('fsBtn') || document.getElementById('lumBtn') || document.getElementById('uiBar');
      if (own) { console.log('[hxbnx] 课件自带控制条，显示控制模块跳过'); return; }

      var vars = collectRootVars();
      var varMode = hasVar(vars, '--fs-');

      var styleEl = document.createElement('style');
      styleEl.id = 'hxbnx-disp-style';
      (document.head || document.documentElement).appendChild(styleEl);

      var bar = document.createElement('div');
      bar.id = 'hxbnx-disp-bar';
      bar.style.cssText = 'position:fixed;left:12px;bottom:12px;z-index:99996;display:flex;gap:6px;opacity:.28;transition:opacity .2s;font-family:"Microsoft YaHei",sans-serif;user-select:none;';
      // 挂在 documentElement（body 之外）：通用模式给 body 加 zoom/filter 时，
      // 控制条本身不被缩放、也永远压在内容之上
      (document.documentElement || document.body).appendChild(bar);
      bar.addEventListener('mouseenter', function () { bar.style.opacity = '1'; });
      bar.addEventListener('mouseleave', function () { bar.style.opacity = '.28'; });

      function mkBtn(label, title) {
        var b = document.createElement('button');
        b.textContent = label;
        b.title = title;
        b.style.cssText = 'height:32px;padding:0 12px;border:none;border-radius:8px;background:rgba(30,30,40,.86);color:#fff;font-size:13px;cursor:pointer;';
        return b;
      }
      var fsBtn = mkBtn('🔤 字号：标准', '字号：标准 / 大 / 特大（自动记住）');
      var lumBtn = mkBtn('☀️ 亮度：100%', '亮度：80% ~ 120%（自动记住）');
      bar.appendChild(fsBtn);
      bar.appendChild(lumBtn);

      function applyVarMode() {
        var fsMul = FS_MUL[curFs], lumMul = curLum / 100, out = ':root{';
        for (var k in vars) {
          var v = vars[k];
          if (k.indexOf('--fs-') === 0) {
            var num = parseFloat(v);
            if (isFinite(num) && /px$/.test(v)) out += k + ':' + (num * fsMul).toFixed(2) + 'px;';
            else out += k + ':' + v + ';';
          } else if (/^#[0-9a-fA-F]{6}$/.test(v)) {
            out += k + ':' + shade(v, lumMul) + ';';
          } else {
            out += k + ':' + v + ';';
          }
        }
        out += '}';
        styleEl.textContent = out;
      }

      function applyGenericMode() {
        var body = document.body;
        if (!body) return;
        body.style.zoom = FS_MUL[curFs];
        body.style.filter = 'brightness(' + (curLum / 100) + ')';
      }

      function apply() {
        if (varMode) applyVarMode(); else applyGenericMode();
        fsBtn.textContent = '🔤 字号：' + FS_NAME[curFs];
        lumBtn.textContent = '☀️ 亮度：' + curLum + '%';
      }

      try {
        var fi = parseInt(localStorage.getItem('hxbnx_fs_i'), 10);
        if (fi >= 0 && fi < FS_MUL.length) curFs = fi;
        var l = parseInt(localStorage.getItem('hxbnx_lum'), 10);
        if (LV.indexOf(l) >= 0) curLum = l;
      } catch (e) {}

      var lastTouch = 0;
      function bind(el, fn) {
        el.addEventListener('click', function () { if (Date.now() - lastTouch < 600) return; fn(); });
        el.addEventListener('touchstart', function (e) { lastTouch = Date.now(); e.preventDefault(); fn(); }, { passive: false });
      }
      bind(fsBtn, function () {
        curFs = (curFs + 1) % FS_MUL.length;
        try { localStorage.setItem('hxbnx_fs_i', curFs); } catch (e) {}
        apply();
      });
      bind(lumBtn, function () {
        curLum = LV[(LV.indexOf(curLum) + 1) % LV.length];
        try { localStorage.setItem('hxbnx_lum', curLum); } catch (e) {}
        apply();
      });

      apply();
      window.__hxbnxDisplay = true;
      console.log('[hxbnx] 显示控制条已加载（' + (varMode ? '变量模式' : '通用模式') + '）');
    }

    // 延后一点再初始化：等课件自己的脚本（可能自建控制条）先跑完
    function boot() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); });
      } else {
        setTimeout(init, 0);
      }
    }
    boot();
  })();

  /* ================================================================
     模块三：打印讲义（A4 横向 · 一屏一页 · 手写板书一起印）
     ------------------------------------------------------------------
     右下角一个半透明的「🖨」按钮，点一下弹出打印预览：
       - 课件内容按「模块」自动切页，一屏一页，A4 横向；
       - 右侧留一条批注区；
       - 你在触屏上写的粉笔字（以及擦除痕迹）会按原位置叠回讲义上。
     ================================================================ */
  (function () {
    if (window.__hxbnxPrintModule) return;
    window.__hxbnxPrintModule = true;

    /* ---- 打印引擎（由 print_engine.js 注入，两处共用同一份源码）---- */
/* ===== PRINT-ENGINE-BEGIN ===== */
/* ================================================================
 * hxbnx-print-engine — 讲义式打印引擎（单一源）
 * ------------------------------------------------------------------
 * 由 build_print.py 同时注入到：
 *   ① hxbnx-handwrite.js（模块三）—— 课件里用，打印带手写板书
 *   ② HTML编辑器.html —— 编辑器里用，打印干净内容（编辑器内课件脚本惰性化，无板书）
 *
 * 思路（A4 横排 · 按模块自动切页）：
 *   - 把课件 body 的顶层子元素当作「模块」，按顺序分配到若干页；
 *   - 每页 = 同一份完整内容 + 不同的负 margin-top（滚动到对应位置），
 *     所以模块相对位置完全不变，手写板书也能用原始坐标直接叠加；
 *   - 内容整体 zoom 缩放到 A4 横排可用宽度 ⇒ 打印所见 = 屏幕所见。
 * ================================================================ */
(function (global) {
  'use strict';
  if (global.__hxbnxPrint) return;

  var MM = 96 / 25.4;              // 1mm = 3.7795 px

  var DEFAULTS = {
    pageW: 297,                    // A4 横排宽 (mm)
    pageH: 210,                    // A4 横排高 (mm)
    margin: 10,                    // 页边距 (mm)
    noteW: 42,                     // 右侧批注区宽 (mm)，0 = 不要
    noteGap: 4,                    // 批注区与正文的间距 (mm)
    showNotes: true,
    showInk: true,
    pageNumbers: true,
    maxScale: 1.15,                // 内容窄于纸张时的最大放大倍数
    fontBase: ''                   // 预留
  };

  /* ---------- 小工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function absUrl(u, base) {
    try { return new URL(u, base).href; } catch (e) { return u; }
  }
  function isRuntimeNode(el) {
    var id = el.id || '';
    if (id === 'hxbnx-draw-canvas' || id === 'hxbnx-draw-toolbar' || id === 'hxbnx-draw-menu' ||
        id === 'hxbnx-draw-toggle' || id === 'hxbnx-disp-bar' || id === 'hxbnx-disp-style' ||
        id === 'dynUi' || id === 'mvStyle' || id === 'mvGhost' || id === 'mvIndicator') return true;
    var tag = (el.tagName || '').toUpperCase();
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'LINK' || tag === 'META' || tag === 'NOSCRIPT') return true;
    var cls = el.className;
    if (cls && typeof cls === 'string' && /\bdynUi\b/.test(cls)) return true;
    return false;
  }

  /* ---------- 收集源文档的样式 ---------- */
  function collectHead(srcDoc) {
    var out = [];
    var head = srcDoc.head;
    if (!head) return '';
    var kids = head.children;
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i], tag = (el.tagName || '').toUpperCase();
      if (tag === 'STYLE') {
        out.push('<style>' + (el.textContent || '') + '</style>');
      } else if (tag === 'LINK') {
        var rel = (el.getAttribute('rel') || '').toLowerCase();
        if (rel.indexOf('stylesheet') >= 0) {
          var href = absUrl(el.getAttribute('href') || '', srcDoc.baseURI);
          out.push('<link rel="stylesheet" href="' + esc(href) + '">');
        }
      }
    }
    return out.join('\n');
  }

  /* ---------- 打印页布局样式 ---------- */
  function layoutCSS(o) {
    var contentW = o.pageW - o.margin * 2 - (o.showNotes ? (o.noteW + o.noteGap) : 0);
    return [
      '@page { size: ' + o.pageW + 'mm ' + o.pageH + 'mm; margin: 0; }',
      'html, body { margin:0 !important; padding:0 !important; background:#fff !important; }',
      'body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; ' +
        'font-family:"Microsoft YaHei","PingFang SC",sans-serif; }',
      '.pp-page { width:' + o.pageW + 'mm; height:' + o.pageH + 'mm; box-sizing:border-box; ' +
        'padding:' + o.margin + 'mm; position:relative; overflow:hidden; background:#fff; ' +
        'margin:0; page-break-after:always; break-after:page; }',
      '.pp-page:last-of-type { page-break-after:auto; break-after:auto; }',
      '.pp-view { position:relative; overflow:hidden; width:' + contentW + 'mm; }',
      '.pp-body { position:relative; transform-origin:0 0; display:flow-root; }',
      '.pp-ink { position:absolute; left:0; top:0; pointer-events:none; }',
      '.pp-notes { position:absolute; top:' + o.margin + 'mm; bottom:' + o.margin + 'mm; right:' + o.margin + 'mm; ' +
        'width:' + o.noteW + 'mm; border:1px dashed #c2c8d0; border-radius:4px; box-sizing:border-box; }',
      '.pp-notes span { position:absolute; top:6px; left:8px; font-size:8pt; color:#a8b0ba; letter-spacing:2px; }',
      '.pp-pageno { position:absolute; bottom:4mm; right:' + o.margin + 'mm; font-size:8pt; color:#9aa2ac; }',
      '.pp-title { position:absolute; top:4mm; left:' + o.margin + 'mm; font-size:8pt; color:#9aa2ac; max-width:60%; ' +
        'white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }'
    ].join('\n');
  }

  /* ================================================================
   * build —— 生成打印页面的完整 HTML 字符串
   * ================================================================ */
  function build(srcDoc, opts) {
    opts = opts || {};
    var o = {};
    for (var k in DEFAULTS) o[k] = DEFAULTS[k];
    for (var k2 in opts) if (opts[k2] !== undefined && opts[k2] !== null) o[k2] = opts[k2];

    var srcBody = srcDoc.body;
    if (!srcBody) return null;
    var srcWin = srcDoc.defaultView || window;

    /* ---- 1. 取模块（body 顶层子元素）---- */
    var mods = [];
    var kids = srcBody.children;
    for (var i = 0; i < kids.length; i++) {
      if (isRuntimeNode(kids[i])) continue;
      mods.push(kids[i]);
    }
    if (!mods.length) return null;

    /* ---- 2. 量宽度 / 缩放比 ---- */
    var bodyRect = srcBody.getBoundingClientRect();
    var W = srcBody.offsetWidth || Math.round(bodyRect.width) || 1024;   // 布局宽
    var z = 1;
    if (srcBody.offsetWidth && bodyRect.width) z = bodyRect.width / srcBody.offsetWidth;
    if (!isFinite(z) || z <= 0) z = 1;

    var contentWmm = o.pageW - o.margin * 2 - (o.showNotes ? (o.noteW + o.noteGap) : 0);
    var availWpx = contentWmm * MM;
    var availHpx = (o.pageH - o.margin * 2) * MM;
    var k = availWpx / W;
    if (k > o.maxScale) k = o.maxScale;
    if (!(k > 0)) k = 1;
    var availHLayout = availHpx / k;      // 布局坐标下的每页可用高

    /* ---- 3. 在源文档里测量每个模块的布局高度与纵向位置 ----
       注意：offsetHeight 不含 margin，所以要用「下一个模块的 offsetTop 差」来算占位高，
       否则模块之间的 margin 会被漏算，分页就会把一个模块切两半。 */
    var meas = srcDoc.createElement('div');
    meas.setAttribute('style', 'position:absolute;left:-99999px;top:0;width:' + W + 'px;visibility:hidden;');
    srcBody.appendChild(meas);
    var hArr = [], topArr = [], botArr = [], mbArr = [];
    for (var m = 0; m < mods.length; m++) {
      var c = mods[m].cloneNode(true);
      meas.appendChild(c);
      hArr.push(c.offsetHeight);
      topArr.push(c.offsetTop);
      botArr.push(c.offsetTop + c.offsetHeight);
      var mbs = srcWin.getComputedStyle ? srcWin.getComputedStyle(c) : null;
      var mb = mbs ? parseFloat(mbs.marginBottom) : 0;
      mbArr.push(isFinite(mb) ? mb : 0);
    }
    srcBody.removeChild(meas);

    /* 每个模块真正占掉的高度（含自身下边距）——用于粗略估算 */
    var span = [];
    for (var sp = 0; sp < mods.length; sp++) {
      span.push(hArr[sp] + mbArr[sp]);
    }

    /* ---- 4. 分页 ----
       规则：只要「下一个模块的底」还在本页可用高度内，就放进本页；
       于是每页覆盖的文档区间是连续的 [topArr[首], botArr[尾]+mb]，
       下一个模块绝不会在页尾露出半截。 */
    var pages = [], cur = [];
    for (var p = 0; p < mods.length; p++) {
      if (cur.length) {
        var first0 = cur[0];
        var startY0 = topArr[first0];
        var nextBottom = botArr[p] + mbArr[p];
        if (nextBottom - startY0 > availHLayout) {
          pages.push(cur);
          cur = [p];
        } else {
          cur.push(p);
        }
      } else {
        cur.push(p);
      }
    }
    if (cur.length) pages.push(cur);

    /* ---- 5. 手写板书 ---- */
    var inkSVG = '';
    if (o.showInk) {
      var strokes = srcWin.__hxbnxHandwriteStrokes;
      if (strokes && strokes.length) {
        var bodyDocLeft = bodyRect.left + (srcWin.scrollX || 0);
        var bodyDocTop = bodyRect.top + (srcWin.scrollY || 0);
        var parts = [];
        var maxY = 0;
        for (var s = 0; s < strokes.length; s++) {
          var st = strokes[s];
          if (!st || !st.p || !st.p.length) continue;
          var col = st.c || '#e74c3c', wid = st.w || 3;
          var pts = [];
          for (var q = 0; q < st.p.length; q++) {
            var lx = (st.p[q][0] - bodyDocLeft) / z;
            var ly = (st.p[q][1] - bodyDocTop) / z;
            if (ly > maxY) maxY = ly;
            pts.push(lx.toFixed(1) + ',' + ly.toFixed(1));
          }
          if (pts.length === 1) {
            parts.push('<circle cx="' + pts[0].split(',')[0] + '" cy="' + pts[0].split(',')[1] + '" r="' + (wid / 2) +
              '" fill="' + col + '"></circle>');
          } else {
            parts.push('<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + col +
              '" stroke-width="' + wid + '" stroke-linecap="round" stroke-linejoin="round"></polyline>');
          }
        }
        var docH = 0;
        for (var t = 0; t < mods.length; t++) {
          var bot = botArr[t] + mbArr[t];
          if (bot > docH) docH = bot;
        }
        var svgH = Math.max(docH, maxY + 20);
        inkSVG = '<svg class="pp-ink" width="' + W + '" height="' + svgH + '" viewBox="0 0 ' + W + ' ' + svgH +
          '">' + parts.join('') + '</svg>';
      }
    }

    /* ---- 6. 逐页拼 HTML ---- */
    var bodyHTML = '';
    for (var mm = 0; mm < mods.length; mm++) {
      var clone = mods[mm].cloneNode(true);
      absolutize(clone, srcDoc.baseURI);
      bodyHTML += clone.outerHTML;
    }

    var out = '';
    for (var pg = 0; pg < pages.length; pg++) {
      var first = pages[pg][0];
      var lastI = pages[pg][pages[pg].length - 1];
      var startY = topArr[first];
      var endY = botArr[lastI] + mbArr[lastI];
      var viewH = Math.max(0, Math.min(availHpx, (endY - startY) * k));
      out += '<div class="pp-page">';
      out += '<div class="pp-view" style="height:' + viewH.toFixed(2) + 'px;">';
      out += '<div class="pp-body" style="width:' + W + 'px;zoom:' + k.toFixed(5) + ';margin-top:-' + startY.toFixed(2) + 'px;">';
      out += bodyHTML;
      out += inkSVG;
      out += '</div></div>';
      if (o.showNotes && o.noteW > 0) {
        out += '<div class="pp-notes"><span>批 注 区</span></div>';
      }
      if (o.title) out += '<div class="pp-title">' + esc(o.title) + '</div>';
      if (o.pageNumbers) out += '<div class="pp-pageno">第 ' + (pg + 1) + ' 页 / 共 ' + pages.length + ' 页</div>';
      out += '</div>';
    }

    var head = collectHead(srcDoc);
    var html = '<!DOCTYPE html>\n<html lang="zh-CN"><head><meta charset="utf-8">' +
      '<title>' + esc(o.title || '讲义') + '</title>' +
      head +
      '<style>' + layoutCSS(o) + '</style>' +
      '</head><body>' + out + '</body></html>';
    return { html: html, pages: pages.length, scale: k };
  }

  /* ---------- 克隆体内的相对路径转绝对 ---------- */
  function absolutize(root, base) {
    var imgs = root.querySelectorAll ? root.querySelectorAll('img[src]') : [];
    for (var i = 0; i < imgs.length; i++) {
      var s = imgs[i].getAttribute('src');
      if (s && s.indexOf('data:') !== 0) imgs[i].setAttribute('src', absUrl(s, base));
    }
    var srcs = root.querySelectorAll ? root.querySelectorAll('source[src]') : [];
    for (var j = 0; j < srcs.length; j++) {
      var s2 = srcs[j].getAttribute('src');
      if (s2 && s2.indexOf('data:') !== 0) srcs[j].setAttribute('src', absUrl(s2, base));
    }
  }

  /* ================================================================
   * open —— 生成预览（iframe）+ 底栏 + 打印
   * ================================================================ */
  function open(srcDoc, hostDoc, opts) {
    hostDoc = hostDoc || (srcDoc && srcDoc.defaultView ? srcDoc.defaultView.document : document);
    if (!build(srcDoc, opts)) return null;

    var prev = hostDoc.getElementById('hxbnx-print-frame');
    if (prev) prev.remove();
    var oldBar = hostDoc.getElementById('hxbnx-print-bar');
    if (oldBar) oldBar.remove();

    var fr = hostDoc.createElement('iframe');
    fr.id = 'hxbnx-print-frame';
    fr.setAttribute('style', 'position:fixed;inset:0;width:100%;height:100%;border:0;z-index:100000;background:#4a4a4a;');
    hostDoc.body.appendChild(fr);
    var cd = fr.contentDocument;

    // 当前生效的选项（复选框改了就重新排一遍）
    var cur = {};
    for (var kk in DEFAULTS) cur[kk] = DEFAULTS[kk];
    for (var kk2 in (opts || {})) if (opts[kk2] !== undefined && opts[kk2] !== null) cur[kk2] = opts[kk2];

    var res = null;
    function render() {
      res = build(srcDoc, cur);
      if (!res) return;
      cd.open();
      cd.write(res.html);
      cd.close();
      if (info) info.textContent = '共 ' + res.pages + ' 页 · A4 横向 · 内容缩放 ' + Math.round(res.scale * 100) + '%';
    }

    var bar = hostDoc.createElement('div');
    bar.id = 'hxbnx-print-bar';
    bar.setAttribute('style', 'position:fixed;left:0;right:0;bottom:0;z-index:100001;display:flex;align-items:center;gap:12px;' +
      'padding:10px 16px;background:rgba(24,26,32,.94);color:#fff;font:13px/1.4 "Microsoft YaHei",sans-serif;box-shadow:0 -2px 14px rgba(0,0,0,.35);');
    var btn = function (txt, primary, fn) {
      var b = hostDoc.createElement('button');
      b.textContent = txt;
      b.setAttribute('style', 'height:34px;padding:0 16px;border:none;border-radius:8px;cursor:pointer;font-size:13px;' +
        (primary ? 'background:#2471a3;color:#fff;font-weight:600;' : 'background:rgba(255,255,255,.14);color:#fff;'));
      b.addEventListener('click', fn);
      return b;
    };
    bar.appendChild(btn('✕ 关闭预览', false, function () { close(); }));
    bar.appendChild(btn('🖨 打印 / 存为 PDF', true, function () {
      try { fr.contentWindow.focus(); fr.contentWindow.print(); } catch (e) { window.print(); }
    }));
    var info = hostDoc.createElement('span');
    info.setAttribute('style', 'opacity:.85;');
    bar.appendChild(info);

    // —— 现场可调开关 ——
    var spacer = hostDoc.createElement('span');
    spacer.setAttribute('style', 'flex:1;');
    bar.appendChild(spacer);
    var chk = function (label, key, title) {
      var wrap = hostDoc.createElement('label');
      wrap.setAttribute('style', 'display:inline-flex;align-items:center;gap:5px;cursor:pointer;opacity:.9;');
      var c = hostDoc.createElement('input');
      c.type = 'checkbox';
      c.checked = !!cur[key];
      c.title = title || '';
      c.addEventListener('change', function () { cur[key] = c.checked; render(); });
      wrap.appendChild(c);
      var t = hostDoc.createElement('span');
      t.textContent = label;
      wrap.appendChild(t);
      bar.appendChild(wrap);
      return c;
    };
    chk('批注区', 'showNotes', '右侧留一条空白，学生写答案 / 老师写板书');
    chk('页码', 'pageNumbers', '每页右下角标页码');
    chk('板书', 'showInk', '把触屏上手写的粉笔字印进讲义');

    var tip = hostDoc.createElement('span');
    tip.textContent = '打印对话框请选：A4、横向、边距「无」、勾选「背景图形」';
    tip.setAttribute('style', 'opacity:.55;font-size:12px;');
    bar.appendChild(tip);
    hostDoc.body.appendChild(bar);

    render();

    function close() {
      if (fr && fr.parentNode) fr.parentNode.removeChild(fr);
      if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
    }
    return { close: close, pages: res ? res.pages : 0, frame: fr, rerender: render };
  }

  global.__hxbnxPrint = {
    version: 'v1',
    build: build,
    open: open,
    defaults: DEFAULTS
  };
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
/* ===== PRINT-ENGINE-END ===== *//* ===== PRINT-ENGINE-END ===== *//* ===== PRINT-ENGINE-END ===== */

    /* ---- 右下角「🖨 打印讲义」按钮 ---- */
    function initPrintBtn() {
      try {
      if (document.getElementById('hxbnx-print-btn')) return;
      var btn = document.createElement('button');
      btn.id = 'hxbnx-print-btn';
      btn.textContent = '🖨';
      btn.title = '打印讲义（A4 横向 · 一屏一页 · 手写板书一起印出来）';
      btn.setAttribute('style', 'position:fixed;right:12px;bottom:12px;z-index:99999;width:44px;height:44px;' +
        'border:none;border-radius:12px;background:rgba(30,30,40,.86);color:#fff;font-size:20px;cursor:pointer;' +
        'display:flex;align-items:center;justify-content:center;opacity:.3;transition:opacity .2s;');
      btn.addEventListener('mouseenter', function () { btn.style.opacity = '1'; });
      btn.addEventListener('mouseleave', function () { btn.style.opacity = '.3'; });
      btn.addEventListener('click', function () {
        if (window.__hxbnxPrint) window.__hxbnxPrint.open(document, document);
      });
      (document.documentElement || document.body).appendChild(btn);
      } catch (ex) { console.warn('[hxbnx] 打印按钮初始化失败', ex); }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(initPrintBtn, 0); });
    } else {
      setTimeout(initPrintBtn, 0);
    }
  })();
})();
