# -*- coding: utf-8 -*-
"""
一键给本地课件HTML批量插入手写画板功能
用法：python insert-handwrite.py [课件文件夹路径]
不传参数则处理当前文件夹。
效果：在每个 .html 的 </body> 前插入一行 <script src="hxbnx-handwrite.js"></script>
      并把 hxbnx-handwrite.js 复制到该文件夹
"""
import os
import re
import shutil
import sys

TAG = '<script src="hxbnx-handwrite.js"></script>'
JS_NAME = 'hxbnx-handwrite.js'

# 本脚本与 hxbnx-handwrite.js 同目录（hxbnx_repo 根目录）
JS_SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), JS_NAME)


def process_html(path):
    """返回 (状态, 信息)：added=新插入, exists=已有, skip=无</body>"""
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # 已插入过则跳过
    if 'hxbnx-handwrite.js' in content:
        return 'exists', '已有，跳过'

    # 优先插在 </body> 前
    if '</body>' in content:
        content = content.replace('</body>', TAG + '\n</body>', 1)
    elif '</BODY>' in content:
        content = content.replace('</BODY>', TAG + '\n</BODY>', 1)
    else:
        # 没闭合标签的极简页面，直接追加到末尾
        content = content + '\n' + TAG + '\n'

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    return 'added', '已插入'


def main():
    folder = sys.argv[1] if len(sys.argv) > 1 else '.'
    folder = os.path.abspath(folder)

    if not os.path.isdir(folder):
        print('文件夹不存在：', folder)
        sys.exit(1)

    # 1. 复制 js 到目标文件夹
    js_dst = os.path.join(folder, JS_NAME)
    if not os.path.exists(js_dst):
        shutil.copy2(JS_SRC, js_dst)
        print('✅ 已复制 hxbnx-handwrite.js 到', folder)
    else:
        print('ℹ️  hxbnx-handwrite.js 已存在，更新为新版')
        shutil.copy2(JS_SRC, js_dst)

    # 2. 处理所有 html（不递归子文件夹，避免误伤）
    added, exists, failed = [], [], []
    for name in sorted(os.listdir(folder)):
        if name.lower().endswith(('.html', '.htm')):
            path = os.path.join(folder, name)
            try:
                status, msg = process_html(path)
                if status == 'added':
                    added.append(name)
                else:
                    exists.append(name)
            except Exception as e:
                failed.append((name, str(e)))

    # 3. 报告
    print()
    print('=' * 50)
    print('📊 处理结果（文件夹：{}）'.format(folder))
    print('=' * 50)
    print('✅ 新插入 {} 个：'.format(len(added)))
    for n in added:
        print('   ', n)
    print('⏭  已有跳过 {} 个：'.format(len(exists)))
    for n in exists:
        print('   ', n)
    if failed:
        print('❌ 失败 {} 个：'.format(len(failed)))
        for n, err in failed:
            print('   ', n, '->', err)
    print()
    print('💡 上课使用：打开课件 → 点右上角 ✏️ 开启手写 → 手指写画')
    print('💡 快捷键：Ctrl+H 开关手写，Ctrl+Shift+C 清空')


if __name__ == '__main__':
    main()
