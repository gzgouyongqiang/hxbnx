#!/bin/bash
# 炼金试炼 · GitHub 推送脚本 (Mac/Linux)

echo "=========================================="
echo "  炼金试炼 · GitHub 推送脚本"
echo "=========================================="
echo ""

# 检查 git
if ! command -v git &> /dev/null; then
    echo "[错误] 未检测到 Git，请先安装 Git"
    echo "Mac: brew install git"
    echo "Linux: sudo apt-get install git"
    exit 1
fi

# 设置仓库路径
REPO_PATH="$HOME/hxbnx-repo"

# 如果目录不存在，先克隆
if [ ! -d "$REPO_PATH/.git" ]; then
    echo "[信息] 本地仓库不存在，正在克隆..."
    git clone https://github.com/gzgouyongqiang/hxbnx.git "$REPO_PATH"
    if [ $? -ne 0 ]; then
        echo "[错误] 克隆失败，请检查网络或凭据"
        exit 1
    fi
fi

cd "$REPO_PATH"

# 拉取最新代码
echo "[信息] 正在同步远程代码..."
git pull origin main

# 检查是否有本地提交需要推送
COMMITS=$(git log origin/main..HEAD --oneline 2>/dev/null)
if [ -z "$COMMITS" ]; then
    echo "[信息] 没有需要推送的本地提交"
else
    echo "[信息] 正在推送到 GitHub..."
    git push origin main
    if [ $? -ne 0 ]; then
        echo "[错误] 推送失败，请检查 GitHub 凭据"
        echo "提示: 如果提示输入密码，请使用你的 Personal Access Token"
        exit 1
    fi
    echo "[成功] 推送完成！"
fi

echo ""
echo "=========================================="
echo "  部署状态检查: https://github.com/gzgouyongqiang/hxbnx/actions"
echo "  网站地址: https://hxbnx.bbroot.com"
echo "=========================================="
