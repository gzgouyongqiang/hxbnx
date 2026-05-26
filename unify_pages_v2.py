#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
hxbnx网站页面统一规范化脚本（修复版）
- 统一导航栏、页头、底部导航
- 7种页面类型各有独立配色
- 导航统一为"← 上一讲 | 完整标题"+"下一讲 | 完整标题 →"
- 修复：CSS使用 .format() 避免f-string大括号转义问题
- 修复：JS函数使用纯字符串拼接，不涉及f-string
"""
import re, os

BASE = os.path.dirname(os.path.abspath(__file__))
TOPICS = os.path.join(BASE, 'topics')

# ============================================================
# 完整的99页顺序映射（严格按USER.md步步高目录顺序）
# ============================================================
PAGES = [
    ("01.html", "第1讲 物质的组成、性质和转化", "lesson", "第1讲"),
    ("02.html", "第2讲 离子反应 离子方程式", "lesson", "第2讲"),
    ("zt-01.html", "专项突破1 六角度判断离子方程式正误", "zt", "专项突破1"),
    ("nd-01.html", "难点突破1 与量有关的离子方程式书写技巧", "nd", "难点突破1"),
    ("03.html", "第3讲 氧化还原反应的概念和规律", "lesson", "第3讲"),
    ("04.html", "第4讲 氧化还原反应方程式的配平与书写", "lesson", "第4讲"),
    ("rd-01.html", "热点强化1 陌生情境下氧化还原方程式的书写", "rd", "热点强化1"),
    ("05.html", "第5讲 物质的量 气体摩尔体积", "lesson", "第5讲"),
    ("06.html", "第6讲 物质的量浓度及溶液配制", "lesson", "第6讲"),
    ("rd-02.html", "热点强化2 阿伏加德罗常数(NA)应用判断", "rd", "热点强化2"),
    ("nd-02.html", "难点突破2 化学计算的常用方法", "nd", "难点突破2"),
    ("07.html", "第7讲 化学实验基础知识与技能", "lesson", "第7讲"),
    ("df-01.html", "答题规范1 装置的气密性检验", "df", "答题规范1"),
    ("08.html", "第8讲 仪器的组合与气体体积的测定", "lesson", "第8讲"),
    ("09.html", "第9讲 物质的分离与提纯", "lesson", "第9讲"),
    ("df-02.html", "答题规范2 物质的分离提纯操作规范", "df", "答题规范2"),
    ("10.html", "第10讲 钠及其重要化合物", "lesson", "第10讲"),
    ("11.html", "第11讲 碱金属 钠及其重要化合物的转化", "lesson", "第11讲"),
    ("rd-03.html", "热点强化3 Na2CO3、NaHCO3含量测定的思维方法", "rd", "热点强化3"),
    ("12.html", "第12讲 铁及其重要化合物", "lesson", "第12讲"),
    ("13.html", "第13讲 铁及其化合物转化关系", "lesson", "第13讲"),
    ("14.html", "第14讲 铝、镁及其化合物", "lesson", "第14讲"),
    ("15.html", "第15讲 金属材料与金属冶炼 铜", "lesson", "第15讲"),
    ("16.html", "第16讲 氯及其重要化合物", "lesson", "第16讲"),
    ("17.html", "第17讲 卤素 氯及其化合物的转化关系", "lesson", "第17讲"),
    ("rd-04.html", "热点强化4 海洋资源的综合利用——氯、溴、碘的提取", "rd", "热点强化4"),
    ("18.html", "第18讲 硫及其化合物", "lesson", "第18讲"),
    ("rd-05.html", "热点强化5 SO2的测定及治理", "rd", "热点强化5"),
    ("19.html", "第19讲 硫及其化合物的相互转化", "lesson", "第19讲"),
    ("rd-06.html", "热点强化6 陌生含硫化合物的制备", "rd", "热点强化6"),
    ("20.html", "第20讲 氮及其氧化物 硝酸", "lesson", "第20讲"),
    ("21.html", "第21讲 氨 铵盐", "lesson", "第21讲"),
    ("rd-07.html", "热点强化7 氮及其化合物转化关系的应用", "rd", "热点强化7"),
    ("22.html", "第22讲 碳、硅 无机非金属材料", "lesson", "第22讲"),
    ("23.html", "第23讲 化学与STSE 化学与中华文明", "lesson", "第23讲"),
    ("24.html", "第24讲 常见气体的实验室制备", "lesson", "第24讲"),
    ("jc-01.html", "教材延伸1 Be、Sn、Pb、Cr、V等金属元素及其化合物", "jc", "教材延伸1"),
    ("jc-02.html", "教材延伸2 Sc、Ti、Pd、As、B等非金属元素及其化合物", "jc", "教材延伸2"),
    ("zt-02.html", "专项突破2 常见无机物的转化关系及应用", "zt", "专项突破2"),
    ("zt-03.html", "专项突破3 劳动项目与化学知识", "zt", "专项突破3"),
    ("zt-04.html", "专项突破4 陈述I和陈述II因果关系判断", "zt", "专项突破4"),
    ("25.html", "第25讲 原子结构 核外电子排布规律", "lesson", "第25讲"),
    ("26.html", "第26讲 元素周期表 元素的性质", "lesson", "第26讲"),
    ("df-03.html", "答题规范3 电离能大小比较", "df", "答题规范3"),
    ("zt-05.html", "专项突破5 元素综合推断", "zt", "专项突破5"),
    ("27.html", "第27讲 化学键及分类", "lesson", "第27讲"),
    ("28.html", "第28讲 价层电子对互斥模型 杂化轨道理论", "lesson", "第28讲"),
    ("rd-08.html", "热点强化8 键角大小比较的两种模型", "rd", "热点强化8"),
    ("tz-01.html", "拓展延伸9 等电子原理 大π键", "tz", "拓展延伸9"),
    ("29.html", "第29讲 分子的性质 配位键与超分子", "lesson", "第29讲"),
    ("zt-06.html", "专项突破6 元素综合推断选择排除", "zt", "专项突破6"),
    ("30.html", "第30讲 晶体的聚集状态 常见晶体类型", "lesson", "第30讲"),
    ("df-04.html", "答题规范4 晶体熔、沸点比较及归因分析", "df", "答题规范4"),
    ("31.html", "第31讲 晶胞中粒子数及晶胞参数计算", "lesson", "第31讲"),
    ("zt-07.html", "专项突破7 物质结构与性质原理填空词", "zt", "专项突破7"),
    ("32.html", "第32讲 反应热 热化学方程式", "lesson", "第32讲"),
    ("33.html", "第33讲 盖斯定律及应用", "lesson", "第33讲"),
    ("34.html", "第34讲 原电池 常见化学电源", "lesson", "第34讲"),
    ("rd-09.html", "热点强化9 新型化学电源变式实验", "rd", "热点强化9"),
    ("35.html", "第35讲 电解原理及其应用", "lesson", "第35讲"),
    ("rd-10.html", "热点强化10 电解原理的创新应用", "rd", "热点强化10"),
    ("36.html", "第36讲 多池、多室电化学装置", "lesson", "第36讲"),
    ("37.html", "第37讲 金属的腐蚀与防护", "lesson", "第37讲"),
    ("38.html", "第38讲 化学反应速率及影响因素", "lesson", "第38讲"),
    ("39.html", "第39讲 外因对化学反应速率影响的理论解释", "lesson", "第39讲"),
    ("40.html", "第40讲 化学平衡状态与化学平衡常数", "lesson", "第40讲"),
    ("41.html", "第41讲 化学平衡常数与平衡转化率的相关计算", "lesson", "第41讲"),
    ("nd-03.html", "难点突破3 多平衡体系中平衡常数的计算", "nd", "难点突破3"),
    ("42.html", "第42讲 影响化学平衡的因素", "lesson", "第42讲"),
    ("nd-04.html", "难点突破4 化学反应速率和化学平衡常规图像", "nd", "难点突破4"),
    ("43.html", "第43讲 化学反应的方向与调控", "lesson", "第43讲"),
    ("44.html", "第44讲 弱电解质的电离平衡", "lesson", "第44讲"),
    ("45.html", "第45讲 水的电离和溶液的pH", "lesson", "第45讲"),
    ("nd-05.html", "难点突破5 强酸(碱)与弱酸(碱)比较问题", "nd", "难点突破5"),
    ("46.html", "第46讲 酸碱中和滴定拓展应用", "lesson", "第46讲"),
    ("df-05.html", "答题规范5 滴定终点判断", "df", "答题规范5"),
    ("47.html", "第47讲 盐类的水解及影响因素", "lesson", "第47讲"),
    ("48.html", "第48讲 溶液中三大守恒 水解常数及应用", "lesson", "第48讲"),
    ("49.html", "第49讲 沉淀溶解平衡及应用", "lesson", "第49讲"),
    ("nd-06.html", "难点突破6 溶液中粒子平衡的常见类型及应用", "nd", "难点突破6"),
    ("50.html", "第50讲 液相平衡体系的综合分析", "lesson", "第50讲"),
    ("51.html", "第51讲 无机化工流程题的解题策略(一)", "lesson", "第51讲"),
    ("52.html", "第52讲 无机化工流程题的解题策略(二)", "lesson", "第52讲"),
    ("53.html", "第53讲 有机化合物的分类、命名及研究方法", "lesson", "第53讲"),
    ("54.html", "第54讲 有机化合物的空间结构 同系物 同分异构体", "lesson", "第54讲"),
    ("55.html", "第55讲 烃 化石燃料", "lesson", "第55讲"),
    ("56.html", "第56讲 卤代烃 醇 酚", "lesson", "第56讲"),
    ("57.html", "第57讲 醛 酮", "lesson", "第57讲"),
    ("58.html", "第58讲 羧酸 酯 酰胺", "lesson", "第58讲"),
    ("59.html", "第59讲 生物大分子 合成高分子", "lesson", "第59讲"),
    ("60.html", "第60讲 官能团与有机物的性质 有机反应类型", "lesson", "第60讲"),
    ("61.html", "第61讲 限定条件下有机物的同分异构体", "lesson", "第61讲"),
    ("62.html", "第62讲 有机合成与有机合成路线的设计", "lesson", "第62讲"),
    ("63.html", "第63讲 有机化学综合大题突破", "lesson", "第63讲"),
    ("64.html", "第64讲 简单实验方案的设计与评价", "lesson", "第64讲"),
    ("rd-11.html", "热点强化11 创新型微探究实验", "rd", "热点强化11"),
    ("65.html", "第65讲 以定量测定为主的综合实验", "lesson", "第65讲"),
    ("66.html", "第66讲 以反应原理、物质性质探究为主的综合实验", "lesson", "第66讲"),
    ("67.html", "第67讲 以物质制备为主的综合实验", "lesson", "第67讲"),
]

# ============================================================
# 分类型配色方案
# ============================================================
COLOR_SCHEMES = {
    "lesson": {
        "header_bg": "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
        "badge_bg": "#3b82f6",
        "accent": "#3b82f6",
        "accent_light": "#eff6ff",
        "accent_border": "#bfdbfe",
        "block_head_bg": "linear-gradient(90deg, #eff6ff, #fff)",
        "block_head_border": "#bfdbfe",
    },
    "zt": {
        "header_bg": "linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)",
        "badge_bg": "#8b5cf6",
        "accent": "#7c3aed",
        "accent_light": "#f5f3ff",
        "accent_border": "#ddd6fe",
        "block_head_bg": "linear-gradient(90deg, #f5f3ff, #fff)",
        "block_head_border": "#ddd6fe",
    },
    "nd": {
        "header_bg": "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
        "badge_bg": "#ef4444",
        "accent": "#dc2626",
        "accent_light": "#fef2f2",
        "accent_border": "#fecaca",
        "block_head_bg": "linear-gradient(90deg, #fef2f2, #fff)",
        "block_head_border": "#fecaca",
    },
    "rd": {
        "header_bg": "linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)",
        "badge_bg": "#f97316",
        "accent": "#f97316",
        "accent_light": "#fff7ed",
        "accent_border": "#fed7aa",
        "block_head_bg": "linear-gradient(90deg, #fff7ed, #fff)",
        "block_head_border": "#fed7aa",
    },
    "df": {
        "header_bg": "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
        "badge_bg": "#10b981",
        "accent": "#059669",
        "accent_light": "#ecfdf5",
        "accent_border": "#a7f3d0",
        "block_head_bg": "linear-gradient(90deg, #ecfdf5, #fff)",
        "block_head_border": "#a7f3d0",
    },
    "jc": {
        "header_bg": "linear-gradient(135deg, #134e4a 0%, #0f766e 100%)",
        "badge_bg": "#14b8a6",
        "accent": "#0d9488",
        "accent_light": "#f0fdfa",
        "accent_border": "#99f6e4",
        "block_head_bg": "linear-gradient(90deg, #f0fdfa, #fff)",
        "block_head_border": "#99f6e4",
    },
    "tz": {
        "header_bg": "linear-gradient(135deg, #312e81 0%, #4338ca 100%)",
        "badge_bg": "#6366f1",
        "accent": "#4f46e5",
        "accent_light": "#eef2ff",
        "accent_border": "#c7d2fe",
        "block_head_bg": "linear-gradient(90deg, #eef2ff, #fff)",
        "block_head_border": "#c7d2fe",
    },
}

# ============================================================
# 生成CSS（使用 .format() 避免f-string大括号问题）
# ============================================================
def make_css(scheme):
    """生成CSS字符串，使用format()替代f-string，避免大括号转义混乱"""
    css = """        :root {{
            --accent: {accent};
            --accent-light: {accent_light};
            --accent-border: {accent_border};
            --badge-bg: {badge_bg};
            --navy-dark: #0f172a;
            --navy-mid: #1e3a5f;
            --gold: #fbbf24;
            --bg: #f0f4f8;
            --text: #1a1a2e;
            --text-light: #64748b;
            --white: #ffffff;
            --border: #e2e8f0;
            --shadow: 0 2px 8px rgba(0,0,0,0.08);
        }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: -apple-system, "Microsoft YaHei", "PingFang SC", sans-serif;
            background: var(--bg);
            color: var(--text);
            line-height: 1.75;
        }}

        /* ===== 导航栏 ===== */
        .navbar {{
            background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-mid) 100%);
            padding: 0 24px; height: 56px;
            display: flex; align-items: center; justify-content: space-between;
            position: sticky; top: 0; z-index: 100;
            box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        }}
        .navbar-brand {{
            color: var(--gold); font-size: 18px; font-weight: 700;
            text-decoration: none; letter-spacing: 2px;
        }}
        .navbar-links {{ display: flex; gap: 20px; }}
        .navbar-links a {{
            color: #e2e8f0; text-decoration: none; font-size: 14px;
            display: flex; align-items: center; gap: 4px; transition: color 0.2s;
        }}
        .navbar-links a:hover {{ color: var(--gold); }}

        /* ===== 页头（分类型配色） ===== */
        .page-header {{
            background: {header_bg};
            color: #fff; padding: 40px 32px 32px; text-align: center;
        }}
        .header-badge {{
            display: inline-block; background: var(--badge-bg); color: #fff;
            font-size: 12px; font-weight: 700; padding: 4px 14px;
            border-radius: 20px; margin-bottom: 12px; letter-spacing: 1px;
        }}
        .page-header h1 {{
            font-size: 26px; font-weight: 800;
        }}
        .page-header h1 em {{
            font-style: normal; color: var(--gold);
        }}
        .page-header p {{
            font-size: 13px; opacity: 0.65; margin-top: 6px;
        }}

        /* ===== 主内容区 ===== */
        .content {{
            max-width: 820px; margin: 0 auto; padding: 28px 20px 60px;
        }}
        .block {{
            margin-bottom: 36px;
            border-left: 4px solid var(--accent);
            border-radius: 0 12px 12px 0;
            background: var(--white);
            box-shadow: var(--shadow);
            overflow: hidden;
        }}
        .block-head {{
            padding: 16px 22px;
            background: {block_head_bg};
            border-bottom: 1px solid var(--accent-border);
            display: flex; align-items: center; gap: 10px;
        }}
        .block-num {{
            background: var(--accent); color: #fff;
            border-radius: 6px; padding: 2px 10px;
            font-size: 12px; font-weight: 700; white-space: nowrap;
        }}
        .block-head h2 {{ font-size: 17px; font-weight: 700; color: var(--text); flex: 1; }}
        .must {{ font-size: 12px; color: var(--accent); font-weight: 600; background: var(--accent-light); padding: 2px 8px; border-radius: 10px; white-space: nowrap; }}
        .often {{ font-size: 12px; color: #f59e0b; font-weight: 600; background: #fffbeb; padding: 2px 8px; border-radius: 10px; white-space: nowrap; }}

        .sub {{
            padding: 18px 22px; border-bottom: 1px solid #f0f1f3;
        }}
        .sub:last-child {{ border-bottom: none; }}
        .sub-title {{
            font-size: 13px; font-weight: 700; margin-bottom: 12px;
            display: flex; align-items: center; gap: 6px;
        }}
        .sub-title.exam {{ color: #0f3460; }}
        .sub-title.trap {{ color: var(--accent); }}
        .sub-title.tip  {{ color: #059669; }}
        .sub p, .sub li {{ font-size: 14px; color: #333; line-height: 1.9; }}
        .sub ul, .sub ol {{ padding-left: 22px; }}
        .sub li {{ margin-bottom: 4px; }}

        .q-box {{
            background: #f6f8fb; border-radius: 8px; padding: 14px 16px;
            border: 1px solid #e0e6ed; margin-bottom: 12px;
        }}
        .q-source {{
            font-size: 12px; color: #0f3460; font-weight: 700; margin-bottom: 6px;
            display: flex; align-items: center; gap: 6px;
        }}
        .q-source .dot {{
            width: 6px; height: 6px; background: #0f3460; border-radius: 50%; display: inline-block;
        }}
        .q-text {{ font-size: 14px; color: var(--text); line-height: 1.8; }}
        .q-options {{ margin: 10px 0; }}
        .q-options p {{ font-size: 14px; color: #333; line-height: 2; }}
        .q-img {{ max-width: 100%; height: auto; border-radius: 6px; margin: 8px 0; }}
        .q-table {{ width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }}
        .q-table th, .q-table td {{ border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }}
        .q-table th {{ background: #f3f4f6; font-weight: 600; }}

        .steps-box {{
            background: #fafafa; border-radius: 8px; padding: 14px 16px;
            border: 1px solid #e5e7eb; margin: 10px 0;
        }}
        .step-item {{
            display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px;
        }}
        .step-item:last-child {{ margin-bottom: 0; }}
        .step-num {{
            background: var(--navy-dark); color: #fff;
            width: 22px; height: 22px; border-radius: 50%;
            font-size: 12px; font-weight: 700;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0; margin-top: 2px;
        }}
        .step-text {{ font-size: 13px; color: #374151; line-height: 1.8; }}
        .step-text strong {{ color: var(--navy-dark); }}

        /* 可展开按钮 */
        .toggle-btn {{
            background: none; border: 1px solid #d1d5db;
            padding: 6px 14px; border-radius: 16px;
            font-size: 12px; color: #6b7280; cursor: pointer;
            transition: all 0.2s; margin-top: 8px;
        }}
        .toggle-btn:hover {{ border-color: var(--accent); color: var(--accent); }}

        /* 修复：同时匹配 .hidden-content 和 .collapsible 两种类名 */
        .hidden-content, .collapsible {{ display: none; padding: 12px 0 0; }}
        .hidden-content.open, .collapsible.open {{ display: block; }}

        /* ===== 底部导航 ===== */
        .nav-footer {{
            max-width: 820px; margin: 0 auto 0;
            padding: 20px 20px;
            display: flex; justify-content: space-between; align-items: center;
            gap: 12px;
        }}
        .nav-footer a {{
            text-decoration: none; padding: 10px 20px;
            border-radius: 24px; font-size: 14px; font-weight: 600;
            transition: all 0.2s;
            display: flex; align-items: center; gap: 6px;
        }}
        .nav-prev {{
            background: #e2e8f0; color: var(--text);
            border: 1px solid #cbd5e1;
        }}
        .nav-prev:hover {{ background: #cbd5e1; }}
        .nav-prev.disabled {{
            opacity: 0.35; pointer-events: none; cursor: default;
        }}
        .nav-next {{
            background: var(--accent); color: #fff;
        }}
        .nav-next:hover {{ filter: brightness(1.15); }}

        /* ===== 底部信息 ===== */
        .site-footer {{
            text-align: center; padding: 24px 16px 32px;
            color: var(--text-light); font-size: 13px;
        }}

        /* ===== 响应式 ===== */
        @media (max-width: 640px) {{
            .page-header {{ padding: 28px 20px 24px; }}
            .page-header h1 {{ font-size: 21px; }}
            .content {{ padding: 20px 12px 40px; }}
            .navbar {{ padding: 0 14px; }}
            .navbar-links {{ gap: 12px; }}
            .nav-footer {{ flex-direction: column; gap: 10px; }}
            .nav-footer a {{ width: 100%; justify-content: center; }}
        }}"""
    return css.format(
        accent=scheme['accent'],
        accent_light=scheme['accent_light'],
        accent_border=scheme['accent_border'],
        badge_bg=scheme['badge_bg'],
        header_bg=scheme['header_bg'],
        block_head_bg=scheme['block_head_bg'],
        block_head_border=scheme['block_head_border'],
    )

# ============================================================
# JS函数（纯字符串，不涉及任何f-string）
# ============================================================
JS_FUNCTION = (
    '    <script>\n'
    'function toggleCollapsible(btn, targetClass) {\n'
    '  var content = null;\n'
    '  /* 方法1: 紧跟在按钮后面的兄弟节点 */\n'
    '  var el = btn.nextElementSibling;\n'
    '  while (el) {\n'
    '    if (el.classList) {\n'
    '      if (el.classList.contains(targetClass.replace(/^\\./, ""))) { content = el; break; }\n'
    '      if (el.classList.contains("answer-content") || el.classList.contains("trap-content") || el.classList.contains("tip-content")) { content = el; break; }\n'
    '    }\n'
    '    el = el.nextElementSibling;\n'
    '  }\n'
    '  /* 方法2: querySelector */\n'
    '  if (!content) {\n'
    '    var parent = btn.parentElement;\n'
    '    content = parent.querySelector(".answer-content, .trap-content, .tip-content, .hidden-content, .collapsible");\n'
    '  }\n'
    '  if (!content) return;\n'
    '  var isOpen = content.classList.contains("open");\n'
    '  content.classList.toggle("open");\n'
    '  if (btn.dataset.showText && btn.dataset.hideText) {\n'
    '    btn.textContent = isOpen ? btn.dataset.showText : btn.dataset.hideText;\n'
    '  }\n'
    '}\n'
    '    </script>'
)

# ============================================================
# HTML模板函数
# ============================================================
def make_page(filename, title, page_type, badge_text, prev_info, next_info, body_content=""):
    """生成统一格式的完整页面"""
    scheme = COLOR_SCHEMES[page_type]
    css = make_css(scheme)

    # 构建页头
    header_html = (
        '    <header class="page-header">\n'
        '        <div class="header-badge">' + badge_text + '</div>\n'
        '        <h1>' + title + '</h1>\n'
        '        <p>步步高大一轮复习讲义 · 以考定教</p>\n'
        '    </header>'
    )

    # 构建底部导航
    if prev_info:
        prev_file, prev_title = prev_info
        prev_html = '        <a href="./' + prev_file + '" class="nav-prev">← 上一讲 | ' + prev_title + '</a>'
    else:
        prev_html = '        <a class="nav-prev disabled">← 已是第一讲</a>'

    if next_info:
        next_file, next_title = next_info
        next_html = '        <a href="./' + next_file + '" class="nav-next">下一讲 | ' + next_title + ' →</a>'
    else:
        next_html = '        <a class="nav-next disabled">已是最后一讲 →</a>'

    nav_footer_html = (
        '    <nav class="nav-footer">\n'
        + prev_html + '\n'
        + next_html + '\n'
        '    </nav>'
    )

    # 组装完整页面（使用 .format() 而非f-string，避免大括号问题）
    page = (
        '<!DOCTYPE html>\n'
        '<html lang="zh-CN">\n'
        '<head>\n'
        '    <meta charset="UTF-8">\n'
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
        '    <link rel="icon" type="image/svg+xml" href="../favicon.svg">\n'
        '    <title>' + title + ' | 化学不难学</title>\n'
        '    <style>\n'
        + css + '\n'
        '    </style>\n'
        '</head>\n'
        '<body>\n'
        '    <nav class="navbar">\n'
        '        <a href="../index.html" class="navbar-brand">\xe2\x9e\xaa \xe5\x8c\x96\xe5\xad\xa6\xe4\xb8\x8d\xe9\x9a\xbe\xe5\xad\xa6</a>\n'
        '        <div class="navbar-links">\n'
        '            <a href="../index.html">\xf0\x9f\x93\x9a \xe5\x85\xa8\xe9\x83\xa8\xe4\xb8\x93\xe9\xa2\x98</a>\n'
        '            <a href="../exams/2025-gd-01.html">\xf0\x9f\x93\x9d \xe8\xaf\x95\xe9\xa2\x98\xe9\x80\x89\xe8\xae\xb2</a>\n'
        '        </div>\n'
        '    </nav>\n'
        '\n'
        + header_html + '\n'
        '\n'
        '    <main class="content">\n'
        + body_content + '\n'
        '    </main>\n'
        '\n'
        + nav_footer_html + '\n'
        '\n'
        '    <footer class="site-footer">\n'
        '        <p>\xe5\x8c\x96\xe5\xad\xa6\xe4\xb8\x8d\xe9\x9a\xbe\xe5\xad\xa6 \xc2\xb7 \xe9\xab\x98\xe4\xb8\x89\xe7\xac\xac\xe4\xb8\x80\xe8\xbd\xae\xe5\xa4\x8d\xe4\xb9\xa0 \xc2\xb7 \xe4\xbb\xa5\xe8\x80\x83\xe5\xae\x9a\xe6\x95\x99</p>\n'
        '    </footer>\n'
        '\n'
        + JS_FUNCTION + '\n'
        '</body>\n'
        '</html>'
    )
    return page

# ===========================================================
# 从现有HTML中提取主体内容（去除旧版header/nav/footer）
# ===========================================================
def extract_content(html):
    """从现有HTML中提取主体内容"""
    patterns = [
        r'<main class="content">(.*?)</main>',
        r'<div class="main">(.*?)</div>\s*(?:<!-- 翻页导航|<!-- 底部导航|<div class="nav-footer|<nav class="nav-footer)',
        r'<main class="wrap">(.*?)</main>',
        r'<div class="wrap">(.*?)</div>\s*(?:<!-- 底部导航|<div class="page-footer|<div class="nav-footer)',
    ]
    for pattern in patterns:
        m = re.search(pattern, html, re.DOTALL)
        if m:
            content = m.group(1).strip()
            # 清理可能残留的旧导航
            content = re.sub(r'\s*(?:<!--\s*翻页导航|<!--\s*底部导航).*', '', content, flags=re.DOTALL)
            content = re.sub(r'\s*<div class="(?:nav-footer|page-footer)".*', '', content, flags=re.DOTALL)
            content = re.sub(r'\s*<footer class="(?:footer|site-footer)".*', '', content, flags=re.DOTALL)
            content = re.sub(r'\s*<nav class="nav-footer".*', '', content, flags=re.DOTALL)
            if content:
                return content
    return None

# ===========================================================
# 构建占位页主体内容
# ===========================================================
def make_placeholder_body(title):
    return (
        '        <div style="text-align:center; padding: 80px 20px;">\n'
        '            <div style="font-size:60px; margin-bottom:20px;">🚧</div>\n'
        '            <h2 style="font-size:20px; color:#1a1a2e; margin-bottom:10px;">' + title + '</h2>\n'
        '            <p style="font-size:14px; color:#64748b;">内容正在制作中，敬请期待...</p>\n'
        '        </div>'
    )

# ===========================================================
# 主处理逻辑
# ===========================================================
def process_all():
    # 构建prev/next映射
    prev_next = {}
    for i, (filename, title, _, _) in enumerate(PAGES):
        prev_info = None
        next_info = None
        if i > 0:
            prev_file, prev_title, _, _ = PAGES[i-1]
            prev_info = (prev_file, prev_title)
        if i < len(PAGES) - 1:
            next_file, next_title, _, _ = PAGES[i+1]
            next_info = (next_file, next_title)
        prev_next[filename] = (prev_info, next_info)

    completed = {
        "01.html", "02.html", "03.html", "04.html", "05.html",
        "06.html", "07.html", "08.html", "09.html", "10.html", "11.html",
        "zt-01.html", "nd-01.html", "nd-02.html",
        "rd-01.html", "rd-02.html",
        "df-01.html", "df-02.html",
    }

    processed = 0
    skipped = 0

    for filename, title, page_type, badge_text in PAGES:
        fpath = os.path.join(TOPICS, filename)
        if not os.path.exists(fpath):
            print(f"  ⚠️ 文件不存在: {filename}，跳过")
            skipped += 1
            continue

        prev_info, next_info = prev_next[filename]

        if filename in completed:
            with open(fpath, 'r', encoding='utf-8') as f:
                old_html = f.read()
            content = extract_content(old_html)
            if content:
                new_html = make_page(filename, title, page_type, badge_text, prev_info, next_info, content)
                with open(fpath, 'w', encoding='utf-8') as f:
                    f.write(new_html)
                print(f"  ✅ {filename} —— 已更新（保留内容）")
                processed += 1
            else:
                print(f"  ⚠️ {filename} —— 无法提取内容，跳过")
                skipped += 1
        else:
            body = make_placeholder_body(title)
            new_html = make_page(filename, title, page_type, badge_text, prev_info, next_info, body)
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(new_html)
            print(f"  📄 {filename} —— 已生成占位页")
            processed += 1

    print(f"\n总计: {processed} 个页面已处理, {skipped} 个跳过")

if __name__ == '__main__':
    process_all()


