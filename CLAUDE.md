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

# 运行单个测试文件
node --test tests/skill-visibility.test.js

# 运行 CLI 相关测试（ESM，.mjs 后缀）
node --test tests/cli/skb-cli.test.mjs

# E2E 测试（需要先启动服务）
cd e2e-tests && npx playwright test

# 安装依赖
npm install            # 后端
cd web && pnpm install # 前端
cd cli && pnpm install # CLI（独立 npm 包）
```

**注意：** Vite dev 模式下 `basePath.ts` 读取 `document.baseURI` 会导致路由异常。涉及 `APP_BASE_PATH`（部署前缀）的前端改动，请用生产构建 + 后端验证。

## 架构

项目由三个独立的 npm 包组成，共享一个 git 仓库：

### 后端 (`src/`) — Node.js + Fastify，CommonJS 模块

- `src/index.js` — 服务入口，注册 Fastify 插件、中间件、路由，SPA fallback，body 上限 100MB
- `src/database.js` — SQLite 初始化、Schema 管理、迁移（使用 node-sqlite3-wasm，非 better-sqlite3）
- `src/middleware/` — auth（Cookie session + PAT）、admin、error 处理
- `src/routes/` — API 路由，前缀 `/api/v1/`：auth、skills、publish、import-github、collaborators、tags、users、init
- `src/models/` — 数据模型：skill、version、user、favorite、tag
- `src/utils/model-cache.js` — 进程内 LRU 只读缓存，写路径必须显式调用 invalidate 失效
- `src/utils/lru-cache.js` — 自定义 LRU 缓存实现（基于条目大小淘汰）
- `src/utils/permission.js` — 权限检查函数（`canManageSkill`、`canViewSkill` 等）
- `src/utils/skill-webhook.js` — Webhook 异步通知（Skill 元数据变更时 POST）
- `src/utils/publish-skill.js` — Skill 发布核心逻辑
- `src/cappy.js` — 终端 ASCII 水豚吉祥物

API 认证方式：Web 使用 Cookie (`session_id`)；CLI 使用 `Authorization: Bearer` PAT。

### 前端 (`web/`) — Vue 3 + TypeScript + Tailwind CSS + Vite

- 构建产物输出到 `static/`，由后端 `@fastify/static` 托管
- `web/src/services/api.ts` — 统一 API 调用层（含 TypeScript 接口定义）
- `web/src/stores/auth.ts` — Pinia 认证状态管理
- `web/src/composables/` — 组合式函数（useI18n 国际化支持 `{key}` 模板参数、useTheme 主题、useToast 通知）
- `web/src/views/` — 页面组件（HomeView、SkillDetailView、PublishView、DiffView 等）
- **大量处理在客户端完成**：JSZip 解压浏览文件、jsdiff/diff2html 生成版本差异、marked 渲染 Markdown、highlight.js 代码高亮

### CLI (`cli/`) — 独立 ESM 包 `skill-base-cli`

- `cli/bin/skb.js` — CLI 入口
- `cli/lib/commands/` — 命令实现（search、install、update、publish、login、import-github 等）
- `cli/lib/ide.js` — 多 IDE 目录检测与解析（Cursor、Claude Code、Copilot、Windsurf、Qoder、OpenCode）

## 测试

使用 Node.js 内置 test runner（`node:test`），测试文件位于 `tests/`。

- **测试辅助**：`tests/helpers/build-app.js` 提供 `buildTestApp()` 函数，创建临时数据库和 Fastify 实例，通过 `app.inject()` 发起请求
- **模式**：每个测试文件独立创建应用实例，使用临时目录（`os.tmpdir()`），测试结束后自动清理
- **缓存隔离**：`buildTestApp()` 通过 `delete require.cache` 清除模块缓存，确保测试间隔离
- **CLI 测试**：使用 `.mjs` 后缀（ESM 格式），位于 `tests/cli/`

## 数据存储

- **数据库**: SQLite (`data/skills.db`)，通过 `DATABASE_PATH` 环境变量可配置
- **文件**: Skill 版本以 ZIP 形式存储在 `data/skills/<skill-id>/<version>.zip`
- **迁移**: `src/migrations/` 下按版本号管理，通过 `schema_migrations` 表追踪
- **缓存**: 进程内 LRU（`src/utils/lru-cache.js` 提供基于大小的淘汰，`model-cache.js` 封装模型级缓存）。所有写路径必须在 DB 写入后显式失效缓存，**不要尝试做"通用 SQL 缓存"**

## 关键约定

- 后端使用 CommonJS (`require`/`module.exports`)，前端使用 ESM，CLI 使用 ESM
- 版本号格式 `vYYYYMMDD.HHmmss`，不是 semver；同秒内重复发布会被拒绝
- Skill 是一个包含 `SKILL.md` 的文件夹，name/description 从 frontmatter 或第一个 `#` 标题解析
- 权限模型：owner > collaborator > user（只读）；super_admin 角色可管理标签和用户
- Skill 可设为 `private`（仅 owner/collaborator/admin 可见），默认 `public`
- 前端使用 Vue 3 Composition API + `<script setup lang="ts">`
- 异步函数使用 async/await，错误处理通过 Fastify error handler
- 日志系统：`infoLog`/`debugLog`/`errorLog` 支持中英文双语消息对象（`{zh: '...', en: '...'}`）

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
| `GITHUB_TOKEN` | GitHub API 令牌（提升导入速率限制） | — |
| `SKILL_BASE_GITHUB_IMPORT_MAX_ZIP_MB` | GitHub 导入 ZIP 体积上限 | `50` |
| `SKILL_BASE_WEBHOOK_TIMEOUT_MS` | Webhook 投递超时 | — |
| `ENABLE_CAPPY` | `true` 启用终端吉祥物 | off |

## 文档维护

完成功能开发或修改后，检查并更新以下文档：
- `README.md` — 项目主文档
- `docs/api.md` — API 参考
- `docs/cli.md` — CLI 命令参考
- `AGENTS.md` — AI Agent 开发规范
