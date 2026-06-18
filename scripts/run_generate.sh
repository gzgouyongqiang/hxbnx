#!/bin/bash
# 炼金试炼 · 化学不难学 —— IMA微卡点自动生成关卡 一键调用脚本
# 用法: ./scripts/run_generate.sh <课时编号>
# 示例: ./scripts/run_generate.sh 16

# 设置GitHub Token（请从环境变量或手动设置）
# 方式1: 导出环境变量 export GITHUB_TOKEN=your_token
# 方式2: 直接修改下面这行（不推荐，有安全风险）
# GITHUB_TOKEN="your_token_here"

# 检查GitHub Token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ 错误：未设置 GITHUB_TOKEN 环境变量"
    echo "请执行: export GITHUB_TOKEN=your_github_token"
    echo "或者编辑本脚本，在顶部设置 GITHUB_TOKEN 变量"
    exit 1
fi

# 设置IMA凭证（从配置文件读取）
# 确保 ~/.config/ima/client_id 和 ~/.config/ima/api_key 已配置

# 检查参数
if [ -z "$1" ]; then
    echo "❌ 错误：请提供课时编号"
    echo "用法: ./scripts/run_generate.sh <课时编号>"
    echo "示例: ./scripts/run_generate.sh 16"
    exit 1
fi

COURSE_NUM=$1

echo "🎯 开始生成第${COURSE_NUM}课时关卡数据..."
echo "=========================================="

# 进入项目目录
cd "$(dirname "$0")/.."

# 运行生成脚本
python3 scripts/generate_level_from_ima.py "$COURSE_NUM"

# 检查执行结果
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 第${COURSE_NUM}课时关卡生成完成！"
else
    echo ""
    echo "❌ 生成失败，请检查错误信息"
    exit 1
fi
