# -*- coding: utf-8 -*-
"""
讲次页构建脚本 build_lesson.py
把强哥的讲次 HTML（第N讲_主题.html）合并底部导航栏，输出 topics/NN.html

用法：
  单个：python build_lesson.py <讲次号N> <源文件路径>
  批量：python build_lesson.py --batch <文件夹路径>
"""
import sys, os, re

TOTAL_LESSONS = 67

# 非标准讲次文件关键词（含这些词的一律不推送）
EXCLUDE_KEYWORDS = ['缺口', '热点', '滚动默写', '真题训练', '默写']

def is_standard(fname):
    for kw in EXCLUDE_KEYWORDS:
        if kw in fname:
            return False
    return True

def pad(n):
    return str(n).zfill(2)

NAV_STYLE = """
<!-- 讲次导航栏 -->
<style>
.lesson-nav{position:fixed;bottom:0;left:0;right:0;z-index:9998;display:flex;justify-content:center;align-items:center;gap:12px;padding:12px 16px;background:rgba(10,14,26,.96);border-top:1px solid rgba(103,232,249,.22);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
.lesson-nav a{color:#cbd5e1;text-decoration:none;font-size:15px;padding:8px 22px;border:1px solid rgba(103,232,249,.28);border-radius:22px;background:rgba(17,24,43,.7);transition:all .2s;white-space:nowrap}
.lesson-nav a:hover{color:#f0c040;border-color:#f0c040;transform:translateY(-1px)}
.lesson-nav a.disabled{opacity:.3;pointer-events:none;cursor:not-allowed}
.lesson-nav a.home{color:#f0c040;border-color:#f0c040;background:rgba(240,192,64,.08)}
.lesson-nav a.home:hover{color:#67e8f9;border-color:#67e8f9}
body{padding-bottom:88px !important}
</style>
"""

def nav_html(n):
    prev = '<a href="%s.html">← 上一讲</a>' % pad(n-1) if n > 1 else '<a class="disabled">← 上一讲</a>'
    nxt = '<a href="%s.html">下一讲 →</a>' % pad(n+1) if n < TOTAL_LESSONS else '<a class="disabled">下一讲 →</a>'
    return (NAV_STYLE
            + '<div class="lesson-nav">\n  ' + prev
            + '\n  <a href="../index.html" class="home">🏠 回到首页</a>\n  ' + nxt
            + '\n</div>\n')

def build(src, n, dst_dir='topics'):
    with open(src, 'r', encoding='utf-8') as f:
        html = f.read()
    # 若已存在旧导航栏，先移除
    html = re.sub(r'<!-- 讲次导航栏 -->.*?</div>\s*(?=</body>)', '', html, flags=re.S)
    html = html.replace('</body>', nav_html(n) + '\n</body>', 1)
    os.makedirs(dst_dir, exist_ok=True)
    dst = os.path.join(dst_dir, pad(n) + '.html')
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(html)
    print('OK 第%d讲 -> %s' % (n, dst))
    return dst

def batch(folder):
    pattern = re.compile(r'^第(\d+)讲[_.]')
    files = sorted([f for f in os.listdir(folder) if f.endswith('.html')])
    hit = 0
    skipped = []
    for f in files:
        if not is_standard(f):
            skipped.append(f)
            continue
        m = pattern.match(f)
        if m:
            n = int(m.group(1))
            build(os.path.join(folder, f), n)
            hit += 1
    print('批量完成：处理 %d 个标准讲次' % hit)
    if skipped:
        print('跳过 %d 个非标准文件：' % len(skipped))
        for s in skipped:
            print('  - %s' % s)

if __name__ == '__main__':
    if len(sys.argv) >= 3 and sys.argv[1] == '--batch':
        batch(sys.argv[2])
    elif len(sys.argv) >= 3:
        build(sys.argv[2], int(sys.argv[1]))
    else:
        print(__doc__)
