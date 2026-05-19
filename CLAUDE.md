# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Skill Base 是一个轻量级、可私有部署的 AI Agent Skill 管理平台。核心功能：Skill 的存储、版本管理（时间戳版本号 `vYYYYMMDD.HHmmss`）、分发，以及 CLI/Web 两种交互方式。

## 开发命令

```bash
# 后端开发模式（nodemon 热重载）
npm run dev

# 后端生产模式
npm start

# 构建前端（输出到 static/）
npm run build          # 等同于 cd web && pnpm build

# 前端开发服务器（Vite，代理 API 到 localhost:8000）
npm run web:dev        # 等同于 cd web && pnpm dev

# 后端单元测试（Node.js 内置 test runner）
npm test

# E2E 测试（需要先启动服务）
cd e2e-tests && npx playwright test

# 安装依赖
npm install            # 后端
cd web && pnpm install # 前端
cd cli && pnpm install # CLI（独立 npm 包）
```

## 架构

项目由三个独立的 npm 包组成，共享一个 git 仓库：

### 后端 (`src/`) — Node.js + Fastify，CommonJS 模块

- `src/index.js` — 服务入口，注册 Fastify 插件、中间件、路由，SPA fallback
- `src/database.js` — SQLite 初始化、Schema 管理、迁移（使用 node-sqlite3-wasm，非 better-sqlite3）
- `src/middleware/` — auth（Cookie session + PAT）、admin、error 处理
- `src/routes/` — API 路由，前缀 `/api/v1/`：auth、skills、publish、import-github、collaborators、tags、users、init
- `src/models/` — 数据模型：skill、version、user、favorite、tag
- `src/utils/model-cache.js` — 进程内 LRU 只读缓存，写路径必须显式调用 invalidate 失效

API 认证方式：Web 使用 Cookie (`session_token`)；CLI 使用 `Authorization: Bearer` PAT。

### 前端 (`web/`) — Vue 3 + TypeScript + Tailwind CSS + Vite

- 构建产物输出到 `static/`，由后端 `@fastify/static` 托管
- `web/src/services/api.ts` — 统一 API 调用层
- `web/src/stores/` — Pinia 状态管理（auth、skills）
- `web/src/composables/` — 组合式函数（useI18n 国际化、useTheme 主题、useToast 通知）
- `web/src/views/` — 页面组件
- Vite 开发模式通过 proxy 将 `/api` 请求代理到 `localhost:8000`

### CLI (`cli/`) — 独立 ESM 包 `skill-base-cli`

- `cli/bin/skb.js` — CLI 入口
- `cli/lib/` — 命令实现（search、install、update、publish、login 等）

## 数据存储

- **数据库**: SQLite (`data/skills.db`)，通过 `DATABASE_PATH` 环境变量可配置
- **文件**: Skill 版本以 ZIP 形式存储在 `data/skills/<skill-id>/<version>.zip`
- **迁移**: `src/migrations/` 下按版本号管理，通过 `schema_migrations` 表追踪
- **缓存**: 进程内 LRU，容量由 `CACHE_MAX_MB` 控制（默认 50MB）。所有写路径必须在 DB 写入后显式失效缓存

## 关键约定

- 后端使用 CommonJS (`require`/`module.exports`)，前端使用 ESM，CLI 使用 ESM
- 版本号格式 `vYYYYMMDD.HHmmss`，不是 semver
- Skill 是一个包含 `SKILL.md` 的文件夹，name/description 从中解析
- 权限模型：owner > collaborator > user（只读）
- Skill 可设为 `private`（仅 owner/collaborator/admin 可见），默认 `public`
- 支持可选的 `webhook_url`（Skill 元数据变更时异步 POST 通知）
- 支持从公开 GitHub 仓库导入 Skill（需 `GITHUB_TOKEN` 环境变量提升速率限制）

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务端口 | `8000` |
| `HOST` | 绑定地址 | `0.0.0.0` |
| `DATA_DIR` / `-d` | 数据目录 | `data/` |
| `DATABASE_PATH` | SQLite 文件路径 | `<DATA_DIR>/skills.db` |
| `APP_BASE_PATH` | URL 前缀 | `/` |
| `CACHE_MAX_MB` | LRU 缓存上限 | `50` |
| `SESSION_STORE` | `memory` 或 `sqlite` | `memory` |
| `DEBUG` | `true` 启用详细日志 | off |
| `ENABLE_CAPPY` | `true` 启用终端吉祥物 | off |

## 文档维护

完成功能开发或修改后，检查并更新以下文档：
- `README.md` — 项目主文档
- `docs/api.md` — API 参考
- `docs/cli.md` — CLI 命令参考
- `AGENTS.md` — 开发规范
