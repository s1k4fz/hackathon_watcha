#!/bin/sh
# ============================================
# Docker 启动脚本
# 功能：运行时环境变量注入到已构建的静态文件中
# ============================================

set -e

# 定义需要替换的环境变量
ENV_VARS='
VITE_OPENROUTER_API_KEY
VITE_AI_MODEL
VITE_AI_TEMPERATURE
VITE_FISH_AUDIO_API_KEY
VITE_TTS_MIN_CHARS
VITE_TTS_KIANA
'

# 遍历所有 JS 文件，替换占位符为实际环境变量值
echo "Starting environment variable injection..."

for file in /usr/share/nginx/html/assets/*.js; do
    if [ -f "$file" ]; then
        echo "Processing: $file"
        
        # 替换每个环境变量
        for var in $ENV_VARS; do
            # 获取环境变量的值
            value=$(printenv "$var" || echo "")
            placeholder="__${var}__"
            
            if [ -n "$value" ]; then
                # 转义特殊字符用于 sed
                escaped_value=$(printf '%s\n' "$value" | sed -e 's/[\/&]/\\&/g')
                sed -i "s|${placeholder}|${escaped_value}|g" "$file"
                echo "  - Replaced $placeholder"
            fi
        done
    fi
done

echo "Environment variable injection complete!"

# 执行传入的命令（通常是 nginx）
exec "$@"
