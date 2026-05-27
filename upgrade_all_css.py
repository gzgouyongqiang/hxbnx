# -*- coding: utf-8 -*-
"""
将 zt-01.html 的专业排版 CSS 整合到 unify_pages_v2.py 的 make_css()，
然后重跑全量生成脚本。

思路：
  1. 定义升级版 make_css()（来自 zt-01.html 示范，加入类型配色变量）
  2. 对所有已完成的 18 个页面：提取内容 → 用新 CSS + 新模板重新生成
  3. 占位页也一并用新 CSS 重建
"""
import os, re

TOPICS = r'C:\Users\Administrator\hxbnx_repo\topics'

PAGES = [
    ("01.html",    "第1讲 物质的组成、性质和转化",                                           "lesson", "第1讲"),
    ("02.html",    "第2讲 离子反应 离子方程式",                                               "lesson", "第2讲"),
    ("zt-01.html", "专项突破1 六角度判断离子方程式正误",                                       "zt",     "专项突破1"),
    ("nd-01.html", "难点突破1 与量有关的离子方程式书写技巧",                                   "nd",     "难点突破1"),
    ("03.html",    "第3讲 氧化还原反应的概念和规律",                                           "lesson", "第3讲"),
    ("04.html",    "第4讲 氧化还原反应方程式的配平与书写",                                     "lesson", "第4讲"),
    ("rd-01.html", "热点强化1 陌生情境下氧化还原方程式的书写",                                 "rd",     "热点强化1"),
    ("05.html",    "第5讲 物质的量 气体摩尔体积",                                             "lesson", "第5讲"),
    ("06.html",    "第6讲 物质的量浓度及溶液配制",                                             "lesson", "第6讲"),
    ("rd-02.html", "热点强化2 阿伏加德罗常数(NA)应用判断",                                     "rd",     "热点强化2"),
    ("nd-02.html", "难点突破2 化学计算的常用方法",                                             "nd",     "难点突破2"),
    ("07.html",    "第7讲 化学实验基础知识与技能",                                             "lesson", "第7讲"),
    ("df-01.html", "答题规范1 装置的气密性检验",                                               "df",     "答题规范1"),
    ("08.html",    "第8讲 仪器的组合与气体体积的测定",                                         "lesson", "第8讲"),
    ("09.html",    "第9讲 物质的分离与提纯",                                                   "lesson", "第9讲"),
    ("df-02.html", "答题规范2 物质的分离提纯操作规范",                                         "df",     "答题规范2"),
    ("10.html",    "第10讲 钠及其重要化合物",                                                   "lesson", "第10讲"),
    ("11.html",    "第11讲 碱金属 钠及其重要化合物的转化",                                     "lesson", "第11讲"),
    ("rd-03.html", "热点强化3 Na2CO3、NaHCO3含量测定的思维方法",                               "rd",     "热点强化3"),
    ("12.html",    "第12讲 铁及其重要化合物",                                                   "lesson", "第12讲"),
    ("13.html",    "第13讲 铁及其化合物转化关系",                                               "lesson", "第13讲"),
    ("14.html",    "第14讲 铝、镁及其化合物",                                                   "lesson", "第14讲"),
    ("15.html",    "第15讲 金属材料与金属冶炼 铜",                                             "lesson", "第15讲"),
    ("16.html",    "第16讲 氯及其重要化合物",                                                   "lesson", "第16讲"),
    ("17.html",    "第17讲 卤素 氯及其化合物的转化关系",                                       "lesson", "第17讲"),
    ("rd-04.html", "热点强化4 海洋资源的综合利用——氯、溴、碘的提取",                           "rd",     "热点强化4"),
    ("18.html",    "第18讲 硫及其化合物",                                                       "lesson", "第18讲"),
    ("rd-05.html", "热点强化5 SO2的测定及治理",                                                 "rd",     "热点强化5"),
    ("19.html",    "第19讲 硫及其化合物的相互转化",                                             "lesson", "第19讲"),
    ("rd-06.html", "热点强化6 陌生含硫化合物的制备",                                           "rd",     "热点强化6"),
    ("20.html",    "第20讲 氮及其氧化物 硝酸",                                                 "lesson", "第20讲"),
    ("21.html",    "第21讲 氨 铵盐",                                                           "lesson", "第21讲"),
    ("rd-07.html", "热点强化7 氮及其化合物转化关系的应用",                                     "rd",     "热点强化7"),
    ("22.html",    "第22讲 碳、硅 无机非金属材料",                                             "lesson", "第22讲"),
    ("23.html",    "第23讲 化学与STSE 化学与中华文明",                                         "lesson", "第23讲"),
    ("24.html",    "第24讲 常见气体的实验室制备",                                               "lesson", "第24讲"),
    ("jc-01.html", "教材延伸1 Be、Sn、Pb、Cr、V等金属元素及其化合物",                         "jc",     "教材延伸1"),
    ("jc-02.html", "教材延伸2 Sc、Ti、Pd、As、B等非金属元素及其化合物",                       "jc",     "教材延伸2"),
    ("zt-02.html", "专项突破2 常见无机物的转化关系及应用",                                     "zt",     "专项突破2"),
    ("zt-03.html", "专项突破3 劳动项目与化学知识",                                             "zt",     "专项突破3"),
    ("zt-04.html", "专项突破4 陈述I和陈述II因果关系判断",                                     "zt",     "专项突破4"),
    ("25.html",    "第25讲 原子结构 核外电子排布规律",                                         "lesson", "第25讲"),
    ("26.html",    "第26讲 元素周期表 元素的性质",                                             "lesson", "第26讲"),
    ("df-03.html", "答题规范3 电离能大小比较",                                                 "df",     "答题规范3"),
    ("zt-05.html", "专项突破5 元素综合推断",                                                   "zt",     "专项突破5"),
    ("27.html",    "第27讲 化学键及分类",                                                       "lesson", "第27讲"),
    ("28.html",    "第28讲 价层电子对互斥模型 杂化轨道理论",                                   "lesson", "第28讲"),
    ("rd-08.html", "热点强化8 键角大小比较的两种模型",                                         "rd",     "热点强化8"),
    ("tz-01.html", "拓展延伸1 等电子原理 大π键",                                               "tz",     "拓展延伸1"),
    ("29.html",    "第29讲 分子的性质 配位键与超分子",                                         "lesson", "第29讲"),
    ("zt-06.html", "专项突破6 元素综合推断选择排除",                                           "zt",     "专项突破6"),
    ("30.html",    "第30讲 晶体的聚集状态 常见晶体类型",                                       "lesson", "第30讲"),
    ("df-04.html", "答题规范4 晶体熔、沸点比较及归因分析",                                     "df",     "答题规范4"),
    ("31.html",    "第31讲 晶胞中粒子数及晶胞参数计算",                                       "lesson", "第31讲"),
    ("zt-07.html", "专项突破7 物质结构与性质原理填空词",                                       "zt",     "专项突破7"),
    ("32.html",    "第32讲 反应热 热化学方程式",                                               "lesson", "第32讲"),
    ("33.html",    "第33讲 盖斯定律及应用",                                                     "lesson", "第33讲"),
    ("34.html",    "第34讲 原电池 常见化学电源",                                               "lesson", "第34讲"),
    ("rd-09.html", "热点强化9 新型化学电源变式实验",                                           "rd",     "热点强化9"),
    ("35.html",    "第35讲 电解原理及其应用",                                                   "lesson", "第35讲"),
    ("rd-10.html", "热点强化10 电解原理的创新应用",                                             "rd",     "热点强化10"),
    ("36.html",    "第36讲 多池、多室电化学装置",                                               "lesson", "第36讲"),
    ("37.html",    "第37讲 金属的腐蚀与防护",                                                   "lesson", "第37讲"),
    ("38.html",    "第38讲 化学反应速率及影响因素",                                             "lesson", "第38讲"),
    ("39.html",    "第39讲 外因对化学反应速率影响的理论解释",                                   "lesson", "第39讲"),
    ("40.html",    "第40讲 化学平衡状态与化学平衡常数",                                         "lesson", "第40讲"),
    ("41.html",    "第41讲 化学平衡常数与平衡转化率的相关计算",                                 "lesson", "第41讲"),
    ("nd-03.html", "难点突破3 多平衡体系中平衡常数的计算",                                     "nd",     "难点突破3"),
    ("42.html",    "第42讲 影响化学平衡的因素",                                                 "lesson", "第42讲"),
    ("nd-04.html", "难点突破4 化学反应速率和化学平衡常规图像",                                 "nd",     "难点突破4"),
    ("43.html",    "第43讲 化学反应的方向与调控",                                               "lesson", "第43讲"),
    ("44.html",    "第44讲 弱电解质的电离平衡",                                                 "lesson", "第44讲"),
    ("45.html",    "第45讲 水的电离和溶液的pH",                                                 "lesson", "第45讲"),
    ("nd-05.html", "难点突破5 强酸(碱)与弱酸(碱)比较问题",                                     "nd",     "难点突破5"),
    ("46.html",    "第46讲 酸碱中和滴定拓展应用",                                               "lesson", "第46讲"),
    ("df-05.html", "答题规范5 滴定终点判断",                                                   "df",     "答题规范5"),
    ("47.html",    "第47讲 盐类的水解及影响因素",                                               "lesson", "第47讲"),
    ("48.html",    "第48讲 溶液中三大守恒 水解常数及应用",                                     "lesson", "第48讲"),
    ("49.html",    "第49讲 沉淀溶解平衡及应用",                                                 "lesson", "第49讲"),
    ("nd-06.html", "难点突破6 溶液中粒子平衡的常见类型及应用",                                 "nd",     "难点突破6"),
    ("50.html",    "第50讲 液相平衡体系的综合分析",                                             "lesson", "第50讲"),
    ("51.html",    "第51讲 无机化工流程题的解题策略(一)",                                       "lesson", "第51讲"),
    ("52.html",    "第52讲 无机化工流程题的解题策略(二)",                                       "lesson", "第52讲"),
    ("53.html",    "第53讲 有机化合物的分类、命名及研究方法",                                   "lesson", "第53讲"),
    ("54.html",    "第54讲 有机化合物的空间结构 同系物 同分异构体",                             "lesson", "第54讲"),
    ("55.html",    "第55讲 烃 化石燃料",                                                       "lesson", "第55讲"),
    ("56.html",    "第56讲 卤代烃 醇 酚",                                                     "lesson", "第56讲"),
    ("57.html",    "第57讲 醛 酮",                                                             "lesson", "第57讲"),
    ("58.html",    "第58讲 羧酸 酯 酰胺",                                                     "lesson", "第58讲"),
    ("59.html",    "第59讲 生物大分子 合成高分子",                                             "lesson", "第59讲"),
    ("60.html",    "第60讲 官能团与有机物的性质 有机反应类型",                                 "lesson", "第60讲"),
    ("61.html",    "第61讲 限定条件下有机物的同分异构体",                                       "lesson", "第61讲"),
    ("62.html",    "第62讲 有机合成与有机合成路线的设计",                                       "lesson", "第62讲"),
    ("63.html",    "第63讲 有机化学综合大题突破",                                               "lesson", "第63讲"),
    ("64.html",    "第64讲 简单实验方案的设计与评价",                                           "lesson", "第64讲"),
    ("rd-11.html", "热点强化11 创新型微探究实验",                                               "rd",     "热点强化11"),
    ("65.html",    "第65讲 以定量测定为主的综合实验",                                           "lesson", "第65讲"),
    ("66.html",    "第66讲 以反应原理、物质性质探究为主的综合实验",                             "lesson", "第66讲"),
    ("67.html",    "第67讲 以物质制备为主的综合实验",                                           "lesson", "第67讲"),
]

COLOR_SCHEMES = {
    "lesson": {
        "header_bg":       "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
        "badge_bg":        "#3b82f6",
        "accent":          "#3b82f6",
        "accent_light":    "#eff6ff",
        "accent_border":   "#bfdbfe",
        "accent_dark":     "#1d4ed8",
        "block_head_bg":   "#eff6ff",
    },
    "zt": {
        "header_bg":       "linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)",
        "badge_bg":        "#8b5cf6",
        "accent":          "#7c3aed",
        "accent_light":    "#f5f3ff",
        "accent_border":   "#ddd6fe",
        "accent_dark":     "#5b21b6",
        "block_head_bg":   "#f5f3ff",
    },
    "nd": {
        "header_bg":       "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
        "badge_bg":        "#ef4444",
        "accent":          "#dc2626",
        "accent_light":    "#fef2f2",
        "accent_border":   "#fecaca",
        "accent_dark":     "#991b1b",
        "block_head_bg":   "#fef2f2",
    },
    "rd": {
        "header_bg":       "linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)",
        "badge_bg":        "#f97316",
        "accent":          "#f97316",
        "accent_light":    "#fff7ed",
        "accent_border":   "#fed7aa",
        "accent_dark":     "#c2410c",
        "block_head_bg":   "#fff7ed",
    },
    "df": {
        "header_bg":       "linear-gradient(135deg, #064e3b 0%, #065f46 100%)",
        "badge_bg":        "#10b981",
        "accent":          "#059669",
        "accent_light":    "#ecfdf5",
        "accent_border":   "#a7f3d0",
        "accent_dark":     "#047857",
        "block_head_bg":   "#ecfdf5",
    },
    "jc": {
        "header_bg":       "linear-gradient(135deg, #134e4a 0%, #0f766e 100%)",
        "badge_bg":        "#14b8a6",
        "accent":          "#0d9488",
        "accent_light":    "#f0fdfa",
        "accent_border":   "#99f6e4",
        "accent_dark":     "#0f766e",
        "block_head_bg":   "#f0fdfa",
    },
    "tz": {
        "header_bg":       "linear-gradient(135deg, #312e81 0%, #4338ca 100%)",
        "badge_bg":        "#6366f1",
        "accent":          "#4f46e5",
        "accent_light":    "#eef2ff",
        "accent_border":   "#c7d2fe",
        "accent_dark":     "#4338ca",
        "block_head_bg":   "#eef2ff",
    },
}

# ============================================================
# 升级版 CSS（来自 zt-01 示范页面，加入 format 占位符）
# 注意：所有 { } 都需要写成 {{ }} 供 .format() 使用，
#       但占位符 {xxx} 只写单括号。
# ============================================================
def make_css(scheme):
    tmpl = """        :root {{
            --accent: {accent};
            --accent-light: {accent_light};
            --accent-border: {accent_border};
            --accent-dark: {accent_dark};
            --badge-bg: {badge_bg};
            --navy-dark: #0f172a;
            --navy-mid: #1e3a5f;
            --gold: #fbbf24;
            --bg: #f1f5f9;
            --text: #0f172a;
            --text-light: #64748b;
            --text-muted: #94a3b8;
            --white: #ffffff;
            --border: #e2e8f0;
            --border-light: #f1f5f9;
            --shadow: 0 1px 3px rgba(0,0,0,0.08);
            --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
            --red-bg: #fef2f2; --red-border: #fecaca; --red-text: #991b1b;
            --green-bg: #ecfdf5; --green-border: #a7f3d0; --green-text: #065f46;
            --blue-bg: #eff6ff; --blue-border: #bfdbfe; --blue-text: #1e40af;
            --amber-bg: #fffbeb; --amber-border: #fde68a; --amber-text: #92400e;
        }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: "PingFang SC", "Microsoft YaHei", -apple-system, sans-serif;
            background: var(--bg); color: var(--text); line-height: 1.65;
        }}

        /* ===== 导航栏 ===== */
        .navbar {{
            background: linear-gradient(135deg, var(--navy-dark) 0%, var(--navy-mid) 100%);
            padding: 0 24px; height: 56px;
            display: flex; align-items: center; justify-content: space-between;
            position: sticky; top: 0; z-index: 100;
            box-shadow: 0 1px 6px rgba(0,0,0,0.18);
        }}
        .navbar-brand {{
            color: var(--gold); font-size: 17px; font-weight: 700;
            text-decoration: none; letter-spacing: 1.5px;
        }}
        .navbar-links {{ display: flex; gap: 18px; }}
        .navbar-links a {{
            color: #e2e8f0; text-decoration: none; font-size: 13px;
            display: flex; align-items: center; gap: 4px; transition: color 0.2s;
        }}
        .navbar-links a:hover {{ color: var(--gold); }}

        /* ===== 页头 ===== */
        .page-header {{
            background: {header_bg};
            color: #fff; padding: 32px 32px 28px; text-align: center;
        }}
        .header-badge {{
            display: inline-block; background: rgba(255,255,255,0.2); color: #fff;
            font-size: 12px; font-weight: 700; padding: 3px 14px;
            border-radius: 20px; margin-bottom: 10px; letter-spacing: 1px;
            border: 1px solid rgba(255,255,255,0.25);
        }}
        .page-header h1 {{ font-size: 24px; font-weight: 800; }}
        .page-header h1 em {{ font-style: normal; color: var(--gold); }}
        .page-header p {{ font-size: 12px; opacity: 0.6; margin-top: 5px; }}

        /* ===== 主内容区 ===== */
        .content {{ max-width: 820px; margin: 0 auto; padding: 24px 18px 50px; }}

        /* --- 考点块 --- */
        .block {{
            margin-bottom: 24px;
            border: 1px solid var(--border);
            border-left: 4px solid var(--accent);
            border-radius: 0 10px 10px 0;
            background: var(--white);
            box-shadow: var(--shadow);
            overflow: hidden;
        }}
        .block-head {{
            padding: 13px 20px;
            background: {block_head_bg};
            border-bottom: 1px solid var(--accent-border);
            display: flex; align-items: center; gap: 10px;
        }}
        .block-num {{
            background: var(--accent); color: #fff;
            border-radius: 4px; padding: 2px 9px;
            font-size: 11px; font-weight: 700; white-space: nowrap;
        }}
        .block-head h2 {{ font-size: 16px; font-weight: 700; color: var(--text); flex: 1; }}
        .must {{ font-size: 11px; color: var(--accent); font-weight: 600; background: #fff; padding: 2px 8px; border-radius: 10px; white-space: nowrap; border: 1px solid var(--accent-border); }}
        .often {{ font-size: 11px; color: #d97706; font-weight: 600; background: var(--amber-bg); padding: 2px 8px; border-radius: 10px; white-space: nowrap; border: 1px solid var(--amber-border); }}

        /* --- 子区域 --- */
        .sub {{ padding: 14px 20px; border-bottom: 1px solid var(--border-light); }}
        .sub:last-child {{ border-bottom: none; }}
        .sub-title {{
            font-size: 14px; font-weight: 700; margin-bottom: 10px;
            display: flex; align-items: center; gap: 6px;
        }}
        .sub-title.exam {{ color: #1e40af; }}
        .sub-title.trap {{ color: var(--red-text); }}
        .sub-title.tip  {{ color: var(--green-text); }}
        .sub p, .sub li {{ font-size: 14px; color: #334155; line-height: 1.75; }}
        .sub ul, .sub ol {{ padding-left: 20px; }}
        .sub li {{ margin-bottom: 3px; }}

        /* --- 前测区域 --- */
        .pretest-box {{
            background: #faf5ff; border: 1px solid var(--accent-border);
            border-radius: 10px; padding: 18px 20px; margin-bottom: 28px;
        }}
        .pt-title {{ font-size: 15px; font-weight: 700; color: var(--accent-dark); margin-bottom: 4px; }}
        .pt-sub   {{ font-size: 12px; color: var(--text-light); margin-bottom: 14px; }}
        .pt-q {{
            background: #fff; border: 1px solid var(--accent-border);
            border-radius: 8px; padding: 12px 14px; margin-bottom: 10px;
        }}
        .pt-q .q-label {{ font-size: 13px; font-weight: 700; color: var(--accent-dark); display: block; margin-bottom: 4px; }}
        .pt-q .q-opts {{ font-size: 13px; color: #334155; line-height: 1.9; }}

        /* --- 角度总览 --- */
        .angle-overview {{
            display: grid; grid-template-columns: repeat(6, 1fr);
            gap: 8px; margin-bottom: 28px;
        }}
        .angle-card {{
            background: var(--white); border: 1px solid var(--border);
            border-radius: 8px; padding: 12px 6px; text-align: center;
            cursor: pointer; transition: all 0.2s;
            box-shadow: var(--shadow);
        }}
        .angle-card:hover {{
            border-color: var(--accent);
            box-shadow: var(--shadow-md);
            transform: translateY(-2px);
        }}
        .ac-num {{
            display: block; font-size: 18px; font-weight: 800; color: var(--accent);
            margin-bottom: 2px;
        }}
        .ac-title {{ font-size: 11px; color: var(--text-light); line-height: 1.4; }}

        /* --- 题目框 --- */
        .q-box {{
            background: var(--white); border: 1px solid var(--border);
            border-radius: 8px; padding: 14px 16px; margin-bottom: 10px;
            box-shadow: var(--shadow);
        }}
        .q-source {{
            font-size: 13px; color: #1e40af; font-weight: 700; margin-bottom: 8px;
            display: flex; align-items: center; gap: 6px;
            padding-bottom: 8px; border-bottom: 1px dashed var(--border);
        }}
        .q-source .dot {{
            width: 6px; height: 6px; background: #1e40af; border-radius: 50%;
            display: inline-block; flex-shrink: 0;
        }}
        .q-text {{ font-size: 14px; color: var(--text); line-height: 1.75; }}

        /* --- 选项网格（2列） --- */
        .q-options-grid {{
            display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0;
        }}
        .opt-card {{
            background: #f8fafc; border: 1px solid var(--border);
            border-radius: 6px; padding: 9px 12px;
            font-size: 13px; color: #334155; line-height: 1.6;
            transition: all 0.15s;
            display: flex; align-items: flex-start; gap: 8px;
        }}
        .opt-card:hover {{ border-color: var(--accent); background: var(--accent-light); }}
        .opt-label {{
            font-weight: 700; color: var(--accent); min-width: 20px;
        }}

        /* --- 旧版选项兼容（普通p/div排列） --- */
        .q-options {{ margin: 10px 0; }}
        .q-options p {{ font-size: 14px; color: #334155; line-height: 1.9; }}

        /* --- 表格 --- */
        .q-table {{ width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12.5px; }}
        .q-table thead th {{
            background: var(--navy-dark); color: #fff; padding: 8px 11px;
            font-size: 12px; font-weight: 600; text-align: left; letter-spacing: 0.5px;
        }}
        .q-table tbody td {{
            padding: 7px 11px; border-bottom: 1px solid var(--border-light);
            line-height: 1.55;
        }}
        .q-table tbody tr:nth-child(even) {{ background: #f8fafc; }}
        .q-table tbody tr:hover {{ background: var(--accent-light); }}
        .q-table tbody tr.row-highlight td {{ background: #fff8e1; font-weight: 600; }}
        /* 兼容旧版表格写法 */
        .q-table th {{ background: var(--navy-dark); color: #fff; padding: 8px 11px; font-size: 12px; font-weight: 600; text-align: left; }}
        .q-table td {{ padding: 7px 11px; border-bottom: 1px solid var(--border-light); }}

        /* --- 图片 --- */
        .q-img {{ max-width: 100%; height: auto; border-radius: 6px; margin: 8px 0; border: 1px solid var(--border); }}

        /* --- 步骤 --- */
        .steps-box {{
            background: #f8fafc; border-radius: 8px; padding: 12px 16px;
            border: 1px solid var(--border); margin: 8px 0;
        }}
        .step-item {{
            display: flex; align-items: flex-start; gap: 10px; margin-bottom: 6px;
            position: relative;
        }}
        .step-item:last-child {{ margin-bottom: 0; }}
        .step-num {{
            background: var(--navy-dark); color: #fff;
            width: 20px; height: 20px; border-radius: 4px;
            font-size: 11px; font-weight: 700;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0; margin-top: 2px;
        }}
        .step-text {{ font-size: 13px; color: #475569; line-height: 1.7; }}
        .step-text strong {{ color: var(--navy-dark); }}

        /* --- 陷阱/避坑/答案展开框 --- */
        .trap-box, .tip-box, .q-answer-inner {{
            padding: 12px 14px; border-radius: 6px; font-size: 13px; line-height: 1.7;
            margin-top: 6px;
        }}
        .trap-box {{
            background: var(--red-bg); border-left: 3px solid #ef4444;
        }}
        .trap-box p {{ margin-bottom: 4px; color: var(--red-text); }}
        .tip-box {{
            background: var(--green-bg); border-left: 3px solid #10b981;
        }}
        .tip-box p, .tip-box li {{ color: var(--green-text); }}
        .q-answer-inner {{
            background: var(--blue-bg); border-left: 3px solid #3b82f6;
        }}

        /* --- 结论框 --- */
        .conclusion-box {{
            background: var(--blue-bg); border: 1px solid var(--blue-border);
            border-radius: 8px; padding: 12px 16px; font-size: 14px;
            color: var(--blue-text); font-weight: 600; line-height: 1.7;
            margin: 10px 0;
        }}

        /* --- 分隔线 --- */
        .divider {{
            text-align: center; color: var(--text-muted);
            font-size: 13px; letter-spacing: 2px; margin: 10px 0;
        }}

        /* --- 可展开按钮 --- */
        .toggle-btn {{
            background: #fff; border: 1px solid #cbd5e1;
            padding: 5px 12px; border-radius: 14px;
            font-size: 11px; color: #64748b; cursor: pointer;
            transition: all 0.15s; margin-top: 6px;
        }}
        .toggle-btn:hover {{ border-color: var(--accent); color: var(--accent); background: var(--accent-light); }}
        .hidden-content, .collapsible {{ display: none; padding: 10px 0 0; }}
        .hidden-content.open, .collapsible.open {{ display: block; animation: fadeIn 0.25s; }}
        @keyframes fadeIn {{ from {{ opacity: 0; transform: translateY(-4px); }} to {{ opacity: 1; transform: translateY(0); }} }}

        /* ===== 底部导航 ===== */
        .nav-footer {{
            max-width: 820px; margin: 0 auto; padding: 20px 18px;
            display: flex; justify-content: space-between; align-items: center; gap: 12px;
        }}
        .nav-footer a {{
            text-decoration: none; padding: 9px 18px;
            border-radius: 20px; font-size: 13px; font-weight: 600;
            transition: all 0.2s; display: flex; align-items: center; gap: 6px;
        }}
        .nav-prev {{ background: #f1f5f9; color: var(--text); border: 1px solid #cbd5e1; }}
        .nav-prev:hover {{ background: #e2e8f0; }}
        .nav-prev.disabled {{ opacity: 0.35; pointer-events: none; cursor: default; }}
        .nav-next {{ background: var(--accent); color: #fff; }}
        .nav-next:hover {{ filter: brightness(1.15); }}
        .site-footer {{
            text-align: center; padding: 20px 16px 28px;
            color: var(--text-light); font-size: 12px;
        }}

        /* ===== 响应式 ===== */
        @media (max-width: 640px) {{
            .page-header {{ padding: 24px 18px 20px; }}
            .page-header h1 {{ font-size: 20px; }}
            .content {{ padding: 18px 10px 36px; }}
            .navbar {{ padding: 0 12px; }}
            .navbar-links {{ gap: 10px; }}
            .angle-overview {{ grid-template-columns: repeat(3, 1fr); }}
            .q-options-grid {{ grid-template-columns: 1fr; }}
            .block-head {{ flex-wrap: wrap; }}
            .nav-footer {{ flex-direction: column; gap: 8px; }}
            .nav-footer a {{ width: 100%; justify-content: center; }}
            .q-table {{ font-size: 11px; }}
            .q-table thead th, .q-table tbody td {{ padding: 5px 7px; }}
        }}"""
    return tmpl.format(
        accent=scheme['accent'],
        accent_light=scheme['accent_light'],
        accent_border=scheme['accent_border'],
        accent_dark=scheme['accent_dark'],
        badge_bg=scheme['badge_bg'],
        header_bg=scheme['header_bg'],
        block_head_bg=scheme['block_head_bg'],
    )


JS_FUNCTION = (
    '    <script>\n'
    'function toggleCollapsible(btn, targetClass) {\n'
    '  var content = null;\n'
    '  var el = btn.nextElementSibling;\n'
    '  while (el) {\n'
    '    if (el.classList) {\n'
    '      if (el.classList.contains(targetClass.replace(/^\\./, ""))) { content = el; break; }\n'
    '      if (el.classList.contains("answer-content") || el.classList.contains("trap-content") || el.classList.contains("tip-content")) { content = el; break; }\n'
    '    }\n'
    '    el = el.nextElementSibling;\n'
    '  }\n'
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


def make_page(filename, title, page_type, badge_text, prev_info, next_info, body_content=""):
    scheme = COLOR_SCHEMES[page_type]
    css = make_css(scheme)

    header_html = (
        '    <header class="page-header">\n'
        '        <div class="header-badge">' + badge_text + '</div>\n'
        '        <h1>' + title + '</h1>\n'
        '        <p>步步高大一轮复习讲义 · 以考定教</p>\n'
        '    </header>'
    )

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
        '        <a href="../index.html" class="navbar-brand">🧪 化学不难学</a>\n'
        '        <div class="navbar-links">\n'
        '            <a href="../index.html">📚 全部专题</a>\n'
        '            <a href="../exams/2025-gd-01.html">📝 试题选讲</a>\n'
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
        '        <p>化学不难学 · 高三第一轮复习 · 以考定教</p>\n'
        '    </footer>\n'
        '\n'
        + JS_FUNCTION + '\n'
        '</body>\n'
        '</html>'
    )
    return page


def extract_content(html):
    """从现有HTML中提取主体内容"""
    patterns = [
        r'<main class="content">(.*?)</main>',
        r'<div class="main">(.*?)</div>\s*(?:<!--\s*翻页导航|<!--\s*底部导航|<div class="nav-footer|<nav class="nav-footer)',
        r'<main class="wrap">(.*?)</main>',
        r'<div class="wrap">(.*?)</div>\s*(?:<!--\s*底部导航|<div class="page-footer|<div class="nav-footer)',
    ]
    for pattern in patterns:
        m = re.search(pattern, html, re.DOTALL)
        if m:
            content = m.group(1).strip()
            content = re.sub(r'\s*(?:<!--\s*翻页导航|<!--\s*底部导航).*', '', content, flags=re.DOTALL)
            content = re.sub(r'\s*<div class="(?:nav-footer|page-footer)".*', '', content, flags=re.DOTALL)
            content = re.sub(r'\s*<footer class="(?:footer|site-footer)".*', '', content, flags=re.DOTALL)
            content = re.sub(r'\s*<nav class="nav-footer".*', '', content, flags=re.DOTALL)
            if content:
                return content
    return None


def make_placeholder_body(title):
    return (
        '        <div style="text-align:center; padding: 80px 20px;">\n'
        '            <div style="font-size:60px; margin-bottom:20px;">🚧</div>\n'
        '            <h2 style="font-size:20px; color:#1a1a2e; margin-bottom:10px;">' + title + '</h2>\n'
        '            <p style="font-size:14px; color:#64748b;">内容正在制作中，敬请期待...</p>\n'
        '        </div>'
    )


COMPLETED = {
    "01.html", "02.html", "03.html", "04.html", "05.html",
    "06.html", "07.html", "08.html", "09.html", "10.html", "11.html",
    "zt-01.html", "nd-01.html", "nd-02.html",
    "rd-01.html", "rd-02.html",
    "df-01.html", "df-02.html",
}


def process_all():
    # 构建 prev/next 映射
    prev_next = {}
    for i, (filename, title, _, _) in enumerate(PAGES):
        prev_info = None
        next_info = None
        if i > 0:
            prev_file, prev_title, _, _ = PAGES[i - 1]
            prev_info = (prev_file, prev_title)
        if i < len(PAGES) - 1:
            next_file, next_title, _, _ = PAGES[i + 1]
            next_info = (next_file, next_title)
        prev_next[filename] = (prev_info, next_info)

    processed = 0
    skipped = 0

    for filename, title, page_type, badge_text in PAGES:
        fpath = os.path.join(TOPICS, filename)
        if not os.path.exists(fpath):
            print('  MISSING: ' + filename)
            skipped += 1
            continue

        prev_info, next_info = prev_next[filename]

        if filename in COMPLETED:
            with open(fpath, 'r', encoding='utf-8') as f:
                old_html = f.read()
            content = extract_content(old_html)
            if content:
                new_html = make_page(filename, title, page_type, badge_text, prev_info, next_info, content)
                with open(fpath, 'w', encoding='utf-8') as f:
                    f.write(new_html)
                print('  OK (content preserved): ' + filename)
                processed += 1
            else:
                print('  SKIP (no content extracted): ' + filename)
                skipped += 1
        else:
            body = make_placeholder_body(title)
            new_html = make_page(filename, title, page_type, badge_text, prev_info, next_info, body)
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(new_html)
            print('  PLACEHOLDER: ' + filename)
            processed += 1

    print('\nDone: ' + str(processed) + ' processed, ' + str(skipped) + ' skipped')


if __name__ == '__main__':
    process_all()
