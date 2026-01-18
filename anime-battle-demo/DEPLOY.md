# 魔搭创空间部署指南

本文档说明如何将 Anime Battle Demo 部署到魔搭（ModelScope）创空间。

## 部署架构

```
┌─────────────────────────────────────────────────────────┐
│                   魔搭创空间 Docker 容器                   │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                     Nginx (7860)                    │ │
│  │  ┌─────────────────┐  ┌───────────────────────────┐ │ │
│  │  │   静态文件服务    │  │  /api/fish/* 代理         │ │ │
│  │  │   (React App)   │  │  → api.fish.audio        │ │ │
│  │  └─────────────────┘  └───────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 部署文件说明

| 文件 | 用途 |
|------|------|
| `ms_deploy.json` | 魔搭创空间部署配置（必需） |
| `Dockerfile` | Docker 镜像构建文件 |
| `nginx.conf` | Nginx 配置（静态服务 + API 代理） |
| `docker-entrypoint.sh` | 启动脚本（运行时环境变量注入） |
| `.dockerignore` | Docker 构建忽略文件 |
| `env.example` | 环境变量示例 |

## 部署步骤

### 1. 准备工作

确保您拥有以下 API Key：
- **OpenRouter API Key**: [获取地址](https://openrouter.ai/keys)
- **Fish Audio API Key**: [获取地址](https://fish.audio/)

### 2. 配置环境变量

编辑 `ms_deploy.json` 文件，填入您的实际 API Key：

```json
{
  "environment_variables": [
    {
      "name": "VITE_OPENROUTER_API_KEY",
      "value": "sk-or-v1-xxxxxxxxxxxxxxxx"  // 替换为您的 OpenRouter API Key
    },
    {
      "name": "VITE_FISH_AUDIO_API_KEY", 
      "value": "xxxxxxxxxxxxxxxx"  // 替换为您的 Fish Audio API Key
    },
    {
      "name": "VITE_TTS_KIANA",
      "value": "xxxxxxxxxxxxxxxx"  // 替换为您的 TTS 音色 ID
    }
  ]
}
```

### 3. 上传到魔搭创空间

1. 登录 [魔搭创空间](https://modelscope.cn/studios)
2. 创建新的创空间或选择已有空间
3. 将项目文件上传到创空间仓库
4. 确保以下文件在仓库根目录：
   - `ms_deploy.json`
   - `Dockerfile`
   - `nginx.conf`
   - `docker-entrypoint.sh`
   - 所有项目源代码

### 4. 触发部署

在创空间控制台点击"部署"或等待自动部署。

### 5. 验证部署

部署成功后，访问创空间 URL：
- 主页面：`https://your-space.modelscope.cn/`
- 健康检查：`https://your-space.modelscope.cn/health`

## 环境变量说明

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `VITE_OPENROUTER_API_KEY` | 是 | OpenRouter API 密钥 |
| `VITE_AI_MODEL` | 否 | AI 模型名称，默认 `google/gemini-2.0-flash-lite-preview-02-05:free` |
| `VITE_AI_TEMPERATURE` | 否 | AI 温度参数，默认 `0.7` |
| `VITE_FISH_AUDIO_API_KEY` | 是 | Fish Audio TTS API 密钥 |
| `VITE_TTS_MIN_CHARS` | 否 | TTS 最小字符数，默认 `6` |
| `VITE_TTS_KIANA` | 否 | 用户创建角色的默认 TTS 音色 ID |

## 本地测试

在部署前，建议先在本地测试 Docker 镜像：

```bash
# 构建镜像
docker build -t anime-battle-demo .

# 运行容器（替换为实际的 API Key）
docker run -p 7860:7860 \
  -e VITE_OPENROUTER_API_KEY="your_key" \
  -e VITE_FISH_AUDIO_API_KEY="your_key" \
  anime-battle-demo

# 访问 http://localhost:7860
```

## 故障排查

### 1. 环境变量未生效

检查 `docker-entrypoint.sh` 是否有执行权限：
```bash
chmod +x docker-entrypoint.sh
```

### 2. TTS 语音不播放

- 检查 `VITE_FISH_AUDIO_API_KEY` 是否正确
- 检查浏览器控制台是否有 CORS 错误
- 确认 Fish Audio API 余额充足

### 3. AI 对话无响应

- 检查 `VITE_OPENROUTER_API_KEY` 是否正确
- 检查 OpenRouter 账户余额
- 查看浏览器控制台错误信息

### 4. 页面加载空白

- 检查 Nginx 配置是否正确
- 查看容器日志：`docker logs <container_id>`
- 确认 `dist` 目录正确生成

## 资源配置

当前配置使用 `platform/2v-cpu-16g-mem`（免费）：
- 2 vCPU
- 16GB 内存

如需更多资源，可修改 `ms_deploy.json` 中的 `resource_configuration`。

## 技术细节

### 多阶段构建

Dockerfile 使用多阶段构建：
1. **Builder 阶段**: 使用 Node.js 20 Alpine 镜像构建前端
2. **Production 阶段**: 使用 Nginx Alpine 镜像提供服务

### 环境变量注入机制

由于 Vite 在构建时静态替换 `import.meta.env.VITE_*`，我们采用以下策略：
1. 构建时使用占位符字符串（如 `__VITE_OPENROUTER_API_KEY__`）
2. 运行时 `docker-entrypoint.sh` 使用 `sed` 替换为实际环境变量值

### API 代理

Nginx 配置了 `/api/fish/*` 路径的反向代理：
- 请求 `/api/fish/v1/tts` → 转发到 `https://api.fish.audio/v1/tts`
- 自动处理 CORS 和 OPTIONS 预检请求
