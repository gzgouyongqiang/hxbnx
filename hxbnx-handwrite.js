/**
 * hxbnx-handwrite.js — 触屏手写画板（课堂大屏版 v4 竖向单列菜单）
 * 用法：与课件HTML放同一文件夹，在课件 </body> 前插入一行：
 *   <script src="hxbnx-handwrite.js"></script>
 * 交互：平时只显示 ✏️ 悬浮按钮；点击向下单列展开菜单并开启手写；再点收起并关闭。
 * 支持触屏手指、触控笔、鼠标。快捷键：Ctrl+H 开关，Ctrl+Shift+C 清空
 */
(function () {
  'use strict';
  if (window.__hxbnxHandwrite) return;

  function init() {
    if (window.__hxbnxHandwrite) return;
    window.__hxbnxHandwrite = true;

    var config = { penColor: '#e74c3c', penSize: 3, eraserSize: 25 };
    var enabled = false;      // 手写功能开关
    var mode = 'pen';         // 'pen' | 'eraser'
    var drawing = false, lastX = 0, lastY = 0;

    // ===== Canvas =====
    var canvas = document.createElement('canvas');
    canvas.id = 'hxbnx-draw-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99998;touch-action:none;';
    document.body.appendChild(canvas);
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
    document.body.appendChild(toolbar);

    // 菜单区（竖向单列：每个控件独占一行，默认收起）
    // 注意：历史上这里误建过“颜色菜单”和“粗细菜单”两个容器，两个都叫
    // hxbnx-draw-menu（重复 id），而颜色/粗细按钮实际全塞进后一个，前一个
    // 永远为空。空 div 一直挂在 toolbar 里还会在展开时多一段 padding，已删。
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
      // 菜单展开/收起（带过渡）
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

    console.log('[hxbnx] 手写画板v2已加载：点✏️或Ctrl+H开关，Ctrl+Shift+C清空');
  }

  // 无论这行 <script> 插在 head 还是 body，都能正确初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
