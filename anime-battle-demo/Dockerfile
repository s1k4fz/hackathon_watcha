# ============================================
# 魔搭创空间部署 Dockerfile
# 多阶段构建：Node.js 构建 + Nginx 服务
# ============================================

# Stage 1: 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 写入 .env 文件用于构建
# 使用占位符字符串，运行时会被 docker-entrypoint.sh 替换为实际环境变量值
RUN echo "VITE_OPENROUTER_API_KEY=__VITE_OPENROUTER_API_KEY__" > .env && \
    echo "VITE_AI_MODEL=__VITE_AI_MODEL__" >> .env && \
    echo "VITE_AI_TEMPERATURE=__VITE_AI_TEMPERATURE__" >> .env && \
    echo "VITE_FISH_AUDIO_API_KEY=__VITE_FISH_AUDIO_API_KEY__" >> .env && \
    echo "VITE_TTS_MIN_CHARS=__VITE_TTS_MIN_CHARS__" >> .env && \
    echo "VITE_TTS_KIANA=__VITE_TTS_KIANA__" >> .env

# 构建生产版本
RUN npm run build

# Stage 2: 生产运行阶段
FROM nginx:alpine

# 安装 envsubst 工具（用于运行时环境变量替换）
RUN apk add --no-cache gettext

# 复制构建产物到 nginx 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

# 复制启动脚本
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 暴露端口（魔搭创空间要求 7860）
EXPOSE 7860

# 使用启动脚本（处理环境变量替换）
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx"]
