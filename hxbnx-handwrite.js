/**
 * hxbnx-handwrite.js — 课堂大屏工具条（手写标注 + 字号 + 亮度）v5
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

      function startDraw(e) {
        if (!enabled) return;
        if (e.cancelable) e.preventDefault();
        drawing = true;
        var p = getPos(e);
        lastX = p.x; lastY = p.y;
        ctx.beginPath();
        ctx.arc(p.x, p.y, (mode === 'eraser' ? config.eraserSize : config.penSize) / 2, 0, Math.PI * 2);
        ctx.fillStyle = (mode === 'eraser') ? 'rgba(0,0,0,1)' : config.penColor;
        ctx.globalCompositeOperation = (mode === 'eraser') ? 'destination-out' : 'source-over';
        ctx.fill();
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
      }

      function endDraw(e) {
        drawing = false;
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
        }
      });

      console.log('[hxbnx] 手写画板v5已加载：点✏️或Ctrl+H开关，Ctrl+Shift+C清空');
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
})();
