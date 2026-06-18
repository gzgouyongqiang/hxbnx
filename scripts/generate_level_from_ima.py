#!/usr/bin/env python3
"""
炼金试炼 · 化学不难学 —— IMA知识库微卡点 → 网站关卡JSON 自动生成脚本

用法:
    python3 scripts/generate_level_from_ima.py <course_number>

示例:
    python3 scripts/generate_level_from_ima.py 15

说明:
    1. 从IMA知识库读取指定课时的微卡点内容
    2. 自动生成铜牌/银牌/金牌三个关卡JSON文件
    3. 自动更新 quests.json 注册新关卡
    4. 自动推送到GitHub

环境要求:
    - Python 3.8+
    - 已配置 ~/.config/ima/client_id 和 api_key
    - 已配置 GitHub Token 在环境变量 GITHUB_TOKEN 中
"""

import json
import os
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

# ============ 配置区域 ============

# IMA API 凭证（优先从配置文件读取）
IMA_CLIENT_ID = ""
IMA_API_KEY = ""

# IMA 知识库ID
KB_ID = "HW2chaKdf-EzcQJpjrEJMFiQJExWkY-g52cyzPsc42o="

# GitHub 仓库信息
GITHUB_OWNER = "gzgouyongqiang"
GITHUB_REPO = "hxbnx"
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")

# 项目路径
REPO_DIR = Path(__file__).parent.parent
DATA_DIR = REPO_DIR / "data"
LEVELS_DIR = DATA_DIR / "levels"
QUESTS_FILE = DATA_DIR / "quests.json"

# IMA API 基础URL
IMA_BASE_URL = "https://ima.qq.com"

# ============ 工具函数 ============

def load_ima_credentials():
    """加载IMA凭证（配置文件 > 环境变量）"""
    global IMA_CLIENT_ID, IMA_API_KEY

    config_dir = Path.home() / ".config" / "ima"
    client_id_file = config_dir / "client_id"
    api_key_file = config_dir / "api_key"

    if client_id_file.exists():
        IMA_CLIENT_ID = client_id_file.read_text().strip()
    if api_key_file.exists():
        IMA_API_KEY = api_key_file.read_text().strip()

    # 环境变量覆盖
    IMA_CLIENT_ID = os.environ.get("IMA_OPENAPI_CLIENTID", IMA_CLIENT_ID)
    IMA_API_KEY = os.environ.get("IMA_OPENAPI_APIKEY", IMA_API_KEY)

    if not IMA_CLIENT_ID or not IMA_API_KEY:
        print("❌ 错误：未找到IMA凭证。请配置 ~/.config/ima/client_id 和 api_key")
        sys.exit(1)

def ima_api_call(path, body):
    """调用IMA API"""
    req = urllib.request.Request(
        f"{IMA_BASE_URL}/{path}",
        data=json.dumps(body).encode(),
        headers={
            "ima-openapi-clientid": IMA_CLIENT_ID,
            "ima-openapi-apikey": IMA_API_KEY,
            "Content-Type": "application/json"
        },
        method="POST"
    )
    resp = urllib.request.urlopen(req)
    return json.loads(resp.read().decode())

def search_kb_lesson(course_num):
    """搜索知识库中指定课时的微卡点"""
    print(f"🔍 正在搜索第{course_num}课时的微卡点...")

    result = ima_api_call("openapi/wiki/v1/search_knowledge", {
        "knowledge_base_id": KB_ID,
        "query": f"第{course_num}课时",
        "cursor": "",
        "limit": 20
    })

    if result.get("code") != 0:
        print(f"❌ 搜索失败: {result.get('msg')}")
        sys.exit(1)

    items = result.get("data", {}).get("info_list", [])

    # 过滤出微卡点（排除索引页）
    microcards = []
    for item in items:
        title = item.get("title", "")
        if f"第{course_num}课时" in title and "微卡点" in title:
            microcards.append(item)

    # 按微卡点编号排序
    def sort_key(item):
        match = re.search(r'微卡点(\d+)', item.get("title", ""))
        return int(match.group(1)) if match else 999

    microcards.sort(key=sort_key)

    print(f"✅ 找到 {len(microcards)} 个微卡点")
    for mc in microcards:
        print(f"   - {mc['title']}")

    return microcards

def get_note_content(notebook_id):
    """通过notebook_id获取笔记内容"""
    result = ima_api_call("openapi/note/v1/get_doc_content", {
        "note_id": notebook_id,
        "target_content_format": 0  # PLAINTEXT
    })

    if result.get("code") != 0:
        print(f"⚠️  读取笔记失败: {result.get('msg')}")
        return ""

    return result.get("data", {}).get("content", "")

def parse_microcard(content, card_num):
    """解析微卡点内容，提取结构化数据（支持有换行和无换行两种格式）"""
    data = {
        "title": "",
        "secret": "",
        "symptom": "",
        "symptom_student": "",
        "symptom_error": "",
        "path_steps": [],
        "path_table": None,
        "analogy": "",
        "quiz_question": "",
        "quiz_options": [],
        "quiz_explanation": "",
        "source": ""
    }

    # 检测内容格式：如果【】标记之间几乎没有换行，说明是无换行格式
    # 先用正则按【】章节标记分割，再处理
    section_markers = ['一句话本质', '典型症状', '认知路径', '类比记忆', '同类自测', '本题出处']

    # 提取标题
    title_match = re.search(rf'微卡点{card_num:02d}[：:](.+?)(?=【|$)', content)
    if title_match:
        data["title"] = title_match.group(1).strip()
    else:
        # 兜底：取第一行作为标题
        data["title"] = content.split('\n')[0].strip()[:50]

    # 按【】标记分割各章节内容
    sections = {}
    for i, marker in enumerate(section_markers):
        pattern = rf'【{marker}】(.+?)(?=【{"|".join(section_markers[i+1:])}】|$)'
        match = re.search(pattern, content, re.DOTALL)
        if match:
            sections[marker] = match.group(1).strip()

    # 填充数据
    if '一句话本质' in sections:
        data["secret"] = sections['一句话本质']

    if '典型症状' in sections:
        text = sections['典型症状']
        # 解析症状诊断
        student_match = re.search(r'(.+?)[：:]\s*["""](.+?)["""]', text)
        if student_match:
            data["symptom_student"] = student_match.group(1).strip()
            data["symptom_error"] = student_match.group(2).strip()
        data["symptom"] = text

    if '认知路径' in sections:
        text = sections['认知路径']
        # 解析步骤（支持无换行格式：第一步：...第二步：...第三步：...）
        steps = []
        for step_match in re.finditer(r'(第[一二三]步[：:].+?)(?=第[一二三]步[：:]|$)', text):
            steps.append(step_match.group(1).strip())
        # 兜底：如果正则没匹配到，尝试按关键词分割
        if not steps:
            for keyword in ['第一步：', '第二步：', '第三步：']:
                idx = text.find(keyword)
                if idx != -1:
                    # 找到这一步开始到下一步或结束
                    end_idx = len(text)
                    for next_kw in ['第一步：', '第二步：', '第三步：']:
                        if next_kw != keyword:
                            ni = text.find(next_kw, idx + len(keyword))
                            if ni != -1 and ni < end_idx:
                                end_idx = ni
                    steps.append(text[idx:end_idx].strip())
        data["path_steps"] = steps if steps else [text[:200]]

    if '类比记忆' in sections:
        data["analogy"] = sections['类比记忆']

    if '同类自测' in sections:
        _parse_quiz_from_text(data, sections['同类自测'])

    if '本题出处' in sections:
        data["source"] = sections['本题出处']

    return data

def _parse_quiz_from_text(data, text):
    """从纯文本解析选择题（支持无换行格式）"""
    # 提取题目（到第一个A.或A、或(A)之前）
    q_match = re.search(r'(.+?)(?=[A-D][.．、]|\([A-D]\)|答案[：:]|$)', text)
    if q_match:
        data["quiz_question"] = q_match.group(1).strip()

    # 提取选项 A/B/C/D
    options = []
    for match in re.finditer(r'([A-D])[.．、]\s*(.+?)(?=(?:[A-D][.．、])|答案[：:]|【|$)', text):
        label = match.group(1)
        text_opt = match.group(2).strip()
        # 清理标记
        text_opt = re.sub(r'[✅❌]', '', text_opt).strip()
        options.append({
            "label": label,
            "text": text_opt,
            "correct": False
        })

    # 如果没有匹配到，尝试更宽松的模式
    if not options:
        for match in re.finditer(r'([A-D])[.．、]\s*([^A-D\n]+)', text):
            label = match.group(1)
            text_opt = match.group(2).strip()
            text_opt = re.sub(r'[✅❌]', '', text_opt).strip()
            options.append({
                "label": label,
                "text": text_opt,
                "correct": False
            })

    # 提取正确答案
    exp_match = re.search(r'答案[：:]\s*([A-D])', text)
    if exp_match:
        correct_label = exp_match.group(1)
        for opt in options:
            opt["correct"] = (opt["label"] == correct_label)

    data["quiz_options"] = options

    # 提取解析文本（答案之后的内容）
    exp_text = ""
    if '答案：' in text:
        exp_text = text.split('答案：', 1)[-1].strip()
        # 去掉答案字母本身
        exp_text = re.sub(r'^[A-D]\s*', '', exp_text)
    data["quiz_explanation"] = exp_text

def _save_section(data, section, buffer):
    """保存解析的章节内容"""
    text = '\n'.join(buffer).strip()

    if section == "secret":
        data["secret"] = text
    elif section == "symptom":
        # 解析症状诊断
        student_match = re.search(r'(.+?)[：:]\s*["""](.+?)["""]', text)
        if student_match:
            data["symptom_student"] = student_match.group(1).strip()
            data["symptom_error"] = student_match.group(2).strip()
        data["symptom"] = text
    elif section == "path":
        # 解析步骤和表格
        steps = []
        in_table = False
        table_lines = []

        for line in buffer:
            if line.startswith('第一步：') or line.startswith('第二步：') or line.startswith('第三步：'):
                steps.append(line)
            elif '|' in line or '—' in line:
                in_table = True
                table_lines.append(line)

        data["path_steps"] = steps
        # 简化处理：不解析复杂表格，后续手动补充
    elif section == "analogy":
        data["analogy"] = text
    elif section == "quiz":
        # 解析选择题
        _parse_quiz(data, buffer)

def _parse_quiz(data, buffer):
    """解析选择题"""
    text = '\n'.join(buffer)

    # 提取题目
    q_match = re.search(r'(.+?)[（(]', text)
    if q_match:
        data["quiz_question"] = q_match.group(1).strip()

    # 提取选项
    options = []
    for match in re.finditer(r'([A-D])[.．、]\s*(.+?)(?=\s+[A-D][.．、]|\s+答案|\s*$)', text):
        label = match.group(1)
        text_opt = match.group(2).strip()
        # 判断是否正确
        is_correct = '✅' in text_opt or '正确' in text_opt
        # 清理标记
        text_opt = re.sub(r'[✅❌]', '', text_opt).strip()
        options.append({
            "label": label,
            "text": text_opt,
            "correct": is_correct
        })

    data["quiz_options"] = options

    # 提取解析
    exp_match = re.search(r'答案[：:]\s*([A-D])', text)
    if exp_match:
        correct_label = exp_match.group(1)
        for opt in options:
            opt["correct"] = (opt["label"] == correct_label)

    # 提取解析文本
    exp_text = text.split('答案：', 1)[-1] if '答案：' in text else ""
    data["quiz_explanation"] = exp_text.strip()

def generate_level_json(course_num, tier, card_indices, cards_data, all_cards):
    """生成关卡JSON文件"""
    tier_config = {
        "bronze": {"label": "铜牌关卡", "emoji": "🥉", "baseScore": 10},
        "silver": {"label": "银牌关卡", "emoji": "🥈", "baseScore": 50},
        "gold": {"label": "金牌关卡", "emoji": "🥇", "baseScore": 100}
    }

    config = tier_config[tier]
    quest_id = f"main-{course_num}-{tier}"

    # 获取课时标题
    course_title = _get_course_title(course_num)

    # 构建stages
    stages = []
    cert_quiz = []

    for i, card_idx in enumerate(card_indices, 1):
        card = cards_data[card_idx]
        stage_num = card_idx + 1

        stage = {
            "stageId": f"card-{stage_num}",
            "type": "microcard",
            "num": stage_num,
            "icon": "🧩",
            "title": card["title"],
            "defaultOpen": (i == 1),
            "blocks": [
                {
                    "blockId": f"card-{stage_num}-secret",
                    "type": "secret",
                    "tag": "📜 通关秘籍",
                    "html": f"<p>{card['secret']}</p>"
                },
                {
                    "blockId": f"card-{stage_num}-symptom",
                    "type": "symptom",
                    "tag": "🩺 症状诊断",
                    "html": _build_symptom_html(card)
                },
                {
                    "blockId": f"card-{stage_num}-path",
                    "type": "path",
                    "tag": "🗺️ 修炼路径",
                    "steps": card["path_steps"] if card["path_steps"] else ["详见知识点解析"],
                    "table": _build_path_table(card)
                },
                {
                    "blockId": f"card-{stage_num}-analogy",
                    "type": "analogy",
                    "tag": "💡 仙人指路",
                    "html": f"<p>{card['analogy']}</p>"
                },
                {
                    "blockId": f"card-{stage_num}-quiz",
                    "type": "quiz",
                    "tag": "📝 同类自测",
                    "question": card["quiz_question"],
                    "options": card["quiz_options"],
                    "explanation": _build_explanation(card)
                }
            ]
        }
        stages.append(stage)

        # 通关考题
        if card["quiz_question"] and card["quiz_options"]:
            cert_options = [opt for opt in card["quiz_options"]][:3]  # 最多3个选项
            cert_quiz.append({
                "stageId": f"cert-{stage_num}",
                "type": "cert",
                "tag": "🏆 通关考题",
                "question": card["quiz_question"],
                "options": cert_options
            })

    # 构建完整JSON
    level_json = {
        "meta": {
            "questId": quest_id,
            "title": course_title,
            "subtitle": f"{config['emoji']} {config['label']} · {len(card_indices)}个微卡点 · 通关积分 {config['baseScore']}分",
            "course": course_num,
            "tier": tier,
            "tierLabel": config["label"],
            "tierEmoji": config["emoji"],
            "knowledgeTags": _extract_tags(all_cards),
            "totalStages": 6,
            "activeStages": len(card_indices)
        },
        "stages": stages,
        "certQuiz": cert_quiz
    }

    return level_json

def _get_course_title(course_num):
    """获取课时标题"""
    try:
        quests = json.loads(QUESTS_FILE.read_text())
        return quests.get("courses", {}).get(str(course_num), {}).get("title", f"第{course_num}课时")
    except:
        return f"第{course_num}课时"

def _build_symptom_html(card):
    """构建症状诊断HTML"""
    if card["symptom_student"] and card["symptom_error"]:
        return f"""<p><strong>{card['symptom_student']}：</strong>「{card['symptom_error']}」</p>
        <p style="margin-top:8px;color:var(--red);font-size:13.5px">❌ 详见认知路径分析</p>"""
    return f"<p>{card['symptom']}</p>"

def _build_path_table(card):
    """构建认知路径表格（简化版）"""
    # 这里可以根据具体微卡点内容定制表格
    # 简化处理：返回None，由前端默认展示
    return None

def _build_explanation(card):
    """构建解析文本"""
    exp = card["quiz_explanation"]
    if card["source"]:
        exp += f'<br><span style="color:var(--ink-light);font-size:12px">【出处】{card["source"]}</span>'
    return exp

def _extract_tags(all_cards):
    """提取知识标签"""
    tags = set()
    for card in all_cards:
        title = card.get("title", "")
        # 提取化学式作为标签
        formulas = re.findall(r'[A-Z][a-z]?\d*[₂₃₄₅]?[A-Z]?[a-z]?\d*', title)
        tags.update(formulas)
    return list(tags)[:8]

def update_quests_json(course_num):
    """更新quests.json注册新关卡"""
    print(f"📝 正在更新 quests.json...")

    quests = json.loads(QUESTS_FILE.read_text())

    # 确定关卡链关系
    prev_course = _find_prev_course(course_num)
    next_course = _find_next_course(course_num)

    tiers = ["bronze", "silver", "gold"]
    tier_scores = {"bronze": 10, "silver": 50, "gold": 100}

    for i, tier in enumerate(tiers):
        quest_id = f"main-{course_num}-{tier}"

        # 确定前后关卡
        if i == 0:
            prev = f"main-{prev_course}-gold" if prev_course else "main-9-gold"
            next_q = f"main-{course_num}-silver"
        elif i == 1:
            prev = f"main-{course_num}-bronze"
            next_q = f"main-{course_num}-gold"
        else:
            prev = f"main-{course_num}-silver"
            next_q = f"main-{next_course}-bronze" if next_course else None

        quests["quests"][quest_id] = {
            "type": "main",
            "course": course_num,
            "tier": tier,
            "title": str(course_num),
            "subtitle": "",
            "prevQuest": prev,
            "nextQuest": next_q,
            "baseScore": tier_scores[tier],
            "badgeTriggers": [],
            "contentFile": f"data/levels/main-{course_num}-{tier}.json"
        }

        # 更新前一关的nextQuest
        if i == 0 and prev in quests["quests"]:
            quests["quests"][prev]["nextQuest"] = quest_id

    # 修复关卡链：确保nextQuest指向的关卡真实存在
    print("🔍 正在检查关卡链完整性...")
    broken_links = 0
    for qid, qdata in quests["quests"].items():
        next_qid = qdata.get("nextQuest")
        if next_qid and next_qid not in quests["quests"]:
            print(f"   ⚠️  修复断裂链: {qid}.nextQuest = {next_qid} → null")
            qdata["nextQuest"] = None
            broken_links += 1
    if broken_links == 0:
        print("   ✅ 关卡链完整")
    else:
        print(f"   ✅ 已修复 {broken_links} 处断裂链")

    QUESTS_FILE.write_text(json.dumps(quests, ensure_ascii=False, indent=2))
    print("✅ quests.json 更新完成")

def _find_prev_course(course_num):
    """找到前一个有效课时"""
    # 简化的课时序列（跳过测试/讲评课时）
    valid_courses = [1,2,3,4,5,6,7,8,9,15,16,17,18,19,20,21,22,23,24,25,
                     31,32,33,34,35,36,37,38,39,43,44,45,46,47,48,49,50,51,
                     53,54,55,56,57,58,59,60,61,62,63,67,68,69,70,71,72,73,
                     74,75,76,77,78,83,84,85,86,87,88,89]
    idx = valid_courses.index(course_num)
    return valid_courses[idx - 1] if idx > 0 else None

def _find_next_course(course_num):
    """找到后一个有效课时"""
    valid_courses = [1,2,3,4,5,6,7,8,9,15,16,17,18,19,20,21,22,23,24,25,
                     31,32,33,34,35,36,37,38,39,43,44,45,46,47,48,49,50,51,
                     53,54,55,56,57,58,59,60,61,62,63,67,68,69,70,71,72,73,
                     74,75,76,77,78,83,84,85,86,87,88,89]
    idx = valid_courses.index(course_num)
    return valid_courses[idx + 1] if idx < len(valid_courses) - 1 else None

def save_level_files(course_num, bronze_json, silver_json, gold_json):
    """保存关卡文件"""
    LEVELS_DIR.mkdir(parents=True, exist_ok=True)

    files = {
        f"main-{course_num}-bronze.json": bronze_json,
        f"main-{course_num}-silver.json": silver_json,
        f"main-{course_num}-gold.json": gold_json
    }

    for filename, data in files.items():
        filepath = LEVELS_DIR / filename
        filepath.write_text(json.dumps(data, ensure_ascii=False, indent=2))
        print(f"✅ 已保存: {filepath}")

def git_push(course_num):
    """推送到GitHub"""
    print("🚀 正在推送到GitHub...")

    if not GITHUB_TOKEN:
        print("⚠️  未设置 GITHUB_TOKEN 环境变量，跳过推送")
        print("    请设置: export GITHUB_TOKEN=your_token")
        return False

    # 配置远程URL（带Token）
    remote_url = f"https://{GITHUB_OWNER}:{GITHUB_TOKEN}@github.com/{GITHUB_OWNER}/{GITHUB_REPO}.git"

    try:
        # 设置git用户信息
        subprocess.run(["git", "config", "user.email", "hxbnx@bbroot.com"], cwd=REPO_DIR, check=True)
        subprocess.run(["git", "config", "user.name", "小红"], cwd=REPO_DIR, check=True)

        # 设置远程URL
        subprocess.run(["git", "remote", "set-url", "origin", remote_url], cwd=REPO_DIR, check=True)

        # 拉取最新代码
        subprocess.run(["git", "config", "pull.rebase", "false"], cwd=REPO_DIR, check=True)
        result = subprocess.run(["git", "pull", "origin", "main", "--no-edit"], cwd=REPO_DIR, capture_output=True, text=True)

        # 添加文件
        subprocess.run(["git", "add", "-A"], cwd=REPO_DIR, check=True)

        # 提交
        subprocess.run([
            "git", "commit", "-m",
            f"feat: 添加第{course_num}课时关卡数据\n\n- 从ima知识库导入第{course_num}课时微卡点\n- 自动生成铜牌/银牌/金牌关卡JSON"
        ], cwd=REPO_DIR, check=True)

        # 推送
        subprocess.run(["git", "push", "origin", "main"], cwd=REPO_DIR, check=True)

        print("✅ 推送成功！")
        return True

    except subprocess.CalledProcessError as e:
        print(f"❌ Git操作失败: {e}")
        print(f"   stdout: {e.stdout if hasattr(e, 'stdout') else 'N/A'}")
        print(f"   stderr: {e.stderr if hasattr(e, 'stderr') else 'N/A'}")
        return False

def main():
    if len(sys.argv) < 2:
        print("用法: python3 generate_level_from_ima.py <course_number>")
        print("示例: python3 generate_level_from_ima.py 15")
        sys.exit(1)

    course_num = int(sys.argv[1])

    print(f"🎯 开始生成第{course_num}课时关卡数据...")
    print("=" * 50)

    # 1. 加载凭证
    load_ima_credentials()

    # 2. 搜索微卡点
    microcards = search_kb_lesson(course_num)

    if len(microcards) < 6:
        print(f"⚠️  警告：只找到 {len(microcards)} 个微卡点，预期6个")

    # 3. 读取每个微卡点的内容
    print("\n📖 正在读取微卡点内容...")
    cards_data = []

    for i, mc in enumerate(microcards[:6], 1):
        # 获取media_info找到notebook_id
        media_result = ima_api_call("openapi/wiki/v1/get_media_info", {
            "media_id": mc["media_id"]
        })

        notebook_id = media_result.get("data", {}).get("notebook_ext_info", {}).get("notebook_id", "")

        if notebook_id:
            content = get_note_content(notebook_id)
            if content:
                parsed = parse_microcard(content, i)
                cards_data.append(parsed)
                print(f"   ✅ 微卡点{i:02d}: {parsed['title'][:30]}...")
            else:
                print(f"   ⚠️  微卡点{i:02d}: 内容为空")
                cards_data.append({"title": mc.get("title", ""), "secret": "", "symptom": "", "path_steps": [], "analogy": "", "quiz_question": "", "quiz_options": [], "quiz_explanation": "", "source": ""})
        else:
            print(f"   ❌ 微卡点{i:02d}: 无法获取notebook_id")
            cards_data.append({"title": mc.get("title", ""), "secret": "", "symptom": "", "path_steps": [], "analogy": "", "quiz_question": "", "quiz_options": [], "quiz_explanation": "", "source": ""})

    # 4. 生成关卡JSON
    print("\n🏗️  正在生成关卡JSON...")

    # 分配微卡点到三个关卡（2+2+2），不足时剩余全部放入金牌
    total = len(cards_data)
    if total >= 6:
        bronze_indices = [0, 1]
        silver_indices = [2, 3]
        gold_indices = [4, 5]
    elif total == 5:
        bronze_indices = [0, 1]
        silver_indices = [2]
        gold_indices = [3, 4]
    elif total == 4:
        bronze_indices = [0, 1]
        silver_indices = [2]
        gold_indices = [3]
    elif total == 3:
        bronze_indices = [0]
        silver_indices = [1]
        gold_indices = [2]
    elif total == 2:
        bronze_indices = [0]
        silver_indices = []
        gold_indices = [1]
    elif total == 1:
        bronze_indices = []
        silver_indices = []
        gold_indices = [0]
    else:
        bronze_indices = []
        silver_indices = []
        gold_indices = []

    bronze_json = generate_level_json(course_num, "bronze", bronze_indices, cards_data, cards_data)
    silver_json = generate_level_json(course_num, "silver", silver_indices, cards_data, cards_data)
    gold_json = generate_level_json(course_num, "gold", gold_indices, cards_data, cards_data)

    # 5. 保存文件
    print("\n💾 正在保存文件...")
    save_level_files(course_num, bronze_json, silver_json, gold_json)

    # 6. 更新quests.json
    update_quests_json(course_num)

    # 7. 推送到GitHub
    print("\n" + "=" * 50)
    git_push(course_num)

    print("\n🎉 全部完成！")
    print(f"   关卡文件: data/levels/main-{course_num}-*.json")
    print(f"   注册文件: data/quests.json")

if __name__ == "__main__":
    main()
