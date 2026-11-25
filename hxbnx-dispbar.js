/*!
 * hxbnx-dispbar.js —— 课件页码「字号 / 亮度」浮条（独立外部脚本）
 * ------------------------------------------------------------------
 * 用法：<script src="../hxbnx-dispbar.js"></script>
 *       放在 hxbnx-handwrite.js **之前**（本脚本会建 #uiBar，
 *       手写脚本检测到 #uiBar 就不再重复造自己那条）。
 *
 * 字号：写 --zs 变量（1 / 1.08 / 1.16）。页面 CSS 里凡
 *       font-size:calc(19px * var(--zs,1)) 都会跟着缩放。
 *       没有用 --zs 的页面（如 67 讲老课件）自动退化为 body 字号整体缩放。
 * 亮度：给 <html> 加 brightness 滤镜（100% 不处理）。
 * 两个值都记在 localStorage，各讲次共用。
 */
(function () {
  'use strict';
  if (window.__hxbnxDispbar) return;
  window.__hxbnxDispbar = true;

  var FS   = [1, 1.08, 1.16];
  var FS_N = ['标准', '大', '特大'];
  var LU   = [100, 92, 85, 78, 110];
  var K_FS = 'hxbnx_zs_i', K_LU = 'hxbnx_lum2';

  function ls(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      localStorage.setItem(k, v);
    } catch (e) { return null; }
  }

  var iFs = 0, iLu = 0;
  var a = parseInt(ls(K_FS), 10); if (a >= 0 && a < FS.length) iFs = a;
  var b = parseInt(ls(K_LU), 10); if (b >= 0 && b < LU.length) iLu = b;

  var root = document.documentElement;

  // 页面是否用 --zs 做字号基准
  var useVar = false;
  try {
    var cs = getComputedStyle(root);
    useVar = !!(cs.getPropertyValue('--zs') || '').trim() ||
             /var\(--zs/.test(document.querySelector('style') ? document.querySelector('style').textContent : '');
  } catch (e) {}

  function apply() {
    // ---- 字号 ----
    if (useVar) {
      root.style.setProperty('--zs', String(FS[iFs]));
      // 兜底：老课件没有 --zs 时，缩放正文根字号
      root.style.fontSize = '';
    } else {
      root.style.fontSize = (16 * FS[iFs]) + 'px';
    }
    // ---- 亮度 ----
    var v = LU[iLu];
    root.style.filter = v === 100 ? '' : 'brightness(' + (v / 100) + ')';
    root.style.setProperty('--lum', String(v / 100));

    fsBtn.innerHTML = '<b>Aa</b> ' + FS_N[iFs];
    luBtn.innerHTML = '<b>☀</b> ' + v + '%';
    fsBtn.title = '字号：标准 / 大 / 特大（自动记住）';
    luBtn.title = '亮度：100% → 92% → 85% → 78% → 110%，循环（自动记住）';
  }

  // ---------- DOM ----------
  var css = ''
    + '#uiBar{position:fixed;left:14px;bottom:14px;z-index:99996;display:flex;gap:6px;'
    + '  opacity:.45;transition:opacity .18s;user-select:none;'
    + '  font-family:"PingFang SC","Microsoft YaHei",sans-serif}'
    + '#uiBar:hover,#uiBar.touched{opacity:1}'
    + '#uiBar button{height:30px;padding:0 11px;border:1px solid rgba(255,255,255,.16);'
    + '  border-radius:999px;box-shadow:0 2px 10px rgba(0,0,0,.3);background:rgba(18,26,20,.9);color:#dbe6d8;font-size:13px;'
    + '  line-height:1;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:5px;'
    + '  backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);transition:border-color .15s,color .15s}'
    + '#uiBar button b{font-weight:700;font-size:12px;opacity:.85}'
    + '#uiBar button:hover{border-color:#9ccb8c;color:#fff}'
    + '#uiBar button:active{transform:translateY(1px)}'
    + '@media print{#uiBar{display:none!important}}';

  var st = document.createElement('style');
  st.id = 'hxbnx-dispbar-style';
  st.textContent = css;
  (document.head || root).appendChild(st);

  var bar = document.createElement('div');
  bar.id = 'uiBar';
  (document.body || root).appendChild(bar);

  function mk() {
    var el = document.createElement('button');
    el.type = 'button';
    bar.appendChild(el);
    return el;
  }
  var fsBtn = mk(); fsBtn.id = 'fsBtn';
  var luBtn = mk(); luBtn.id = 'lumBtn';

  // 触屏：hover 失效，点完亮 2 秒
  function flash() {
    bar.classList.add('touched');
    clearTimeout(bar.__t);
    bar.__t = setTimeout(function () { bar.classList.remove('touched'); }, 2000);
  }
  var lastTouch = 0;
  function bind(el, fn) {
    el.addEventListener('click', function () {
      if (Date.now() - lastTouch < 600) return;
      fn(); flash();
    });
    el.addEventListener('touchstart', function (e) {
      lastTouch = Date.now(); e.preventDefault(); fn(); flash();
    }, { passive: false });
  }

  bind(fsBtn, function () {
    iFs = (iFs + 1) % FS.length;
    ls(K_FS, iFs); apply();
  });
  bind(luBtn, function () {
    iLu = (iLu + 1) % LU.length;
    ls(K_LU, iLu); apply();
  });

  apply();
})();
