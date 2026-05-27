"""修复6个使用旧toggle()调用的页面，转为新toggleCollapsible()模式"""
import re

BROKEN_FILES = [
    "topics/04.html",
    "topics/05.html", 
    "topics/06.html",
    "topics/nd-02.html",
    "topics/rd-01.html",
    "topics/rd-02.html",
]

def fix_page(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. 修复 answer 按钮: <button class="toggle-btn btn-answer" onclick="toggle(this,'ansX')">🔍 查看答案</button>
    #    → <span class="toggle-btn answer-btn" data-show-text="🔍 查看答案" data-hide-text="🔒 隐藏答案" onclick="toggleCollapsible(this, 'answer-content')">🔍 查看答案</span>
    content = re.sub(
        r'<button class="toggle-btn btn-answer" onclick="toggle\(this,\'ans\d+[a-z]?\'\)">([^<]*)</button>',
        r'<span class="toggle-btn answer-btn" data-show-text="\1" data-hide-text="🔒 隐藏答案" onclick="toggleCollapsible(this, \'answer-content\')">\1</span>',
        content
    )
    
    # 2. 修复 trap 按钮
    content = re.sub(
        r'<button class="toggle-btn btn-trap" onclick="toggle\(this,\'trap\d+[a-z]?\'\)">([^<]*)</button>',
        r'<span class="toggle-btn trap-btn" data-show-text="\1" data-hide-text="🔒 隐藏陷阱" onclick="toggleCollapsible(this, \'trap-content\')">\1</span>',
        content
    )
    
    # 3. 修复 tip 按钮
    content = re.sub(
        r'<button class="toggle-btn btn-tip" onclick="toggle\(this,\'tip\d+[a-z]?\'\)">([^<]*)</button>',
        r'<span class="toggle-btn tip-btn" data-show-text="\1" data-hide-text="🔒 隐藏指导" onclick="toggleCollapsible(this, \'tip-content\')">\1</span>',
        content
    )
    
    # 4. 修复 reveal div: <div class="reveal" id="ansX"> → <div class="collapsible answer-content">
    content = re.sub(
        r'<div class="reveal" id="ans\d+[a-z]?"',
        r'<div class="collapsible answer-content"',
        content
    )
    content = re.sub(
        r'<div class="reveal" id="trap\d+[a-z]?"',
        r'<div class="collapsible trap-content"',
        content
    )
    content = re.sub(
        r'<div class="reveal" id="tip\d+[a-z]?"',
        r'<div class="collapsible tip-content"',
        content
    )
    
    # 5. 修复按钮文本中可能出现的 data-show-text 匹配问题
    #    (上面已经用捕获组处理了)
    
    # 6. 确保 toggleCollapsible JS 函数正确（已有，但检查一下）
    #    同时需要确保 CSS 中 .collapsible 类的样式正确
    #    添加 reveal 类的回退 CSS（以防万一有遗漏）
    
    # 添加 .reveal 兼容CSS（在 .hidden-content, .collapsible 那行后面追加）
    content = content.replace(
        '.hidden-content.open, .collapsible.open { display: block; animation: fadeIn 0.25s; }',
        '.hidden-content.open, .collapsible.open, .reveal.open { display: block; animation: fadeIn 0.25s; }'
    )
    
    count = 0
    if content != original:
        # 统计修改数
        old_buttons = len(re.findall(r'onclick="toggle\(', original))
        new_buttons = len(re.findall(r'onclick="toggleCollapsible\(', content))
        old_reveals = len(re.findall(r'class="reveal"', original))
        new_reveals = len(re.findall(r'class="reveal"', content))
        count = new_buttons - (len(re.findall(r'onclick="toggleCollapsible\(', original)))
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ {filepath}: {old_buttons}个老按钮→新按钮, {old_reveals}→{new_reveals}个reveal残留")
    else:
        print(f"⏭️ {filepath}: 无需修改")
    
    return count

total = 0
for f in BROKEN_FILES:
    total += fix_page(f)

print(f"\n🎉 共修复 {total} 处变动")
