# Skill Base - AI Agent Guidelines

## Project Overview

Skill Base 是一个轻量级 AI Agent Skill 管理平台，用于存储、版本管理和分发 AI Agent Skills。

## Architecture

```
skill-base/
├── bin/          # CLI 入口脚本 (npx skill-base)
├── cli/          # CLI 命令行工具 (skill-base-cli)
├── src/          # 服务端源码 (Fastify)
│   ├── middleware/   # 中间件 (auth, admin, error)
│   ├── models/       # 数据模型 (skill, user, version, tag)
│   ├── routes/       # API 路由
│   └── utils/        # 工具函数
├── web/          # 前端源码 (Vue 3 + TypeScript + Tailwind CSS + Vite)
│   ├── src/
│   │   ├── views/        # 页面组件
│   │   ├── components/   # 公共组件（导航栏 SkillBaseNav 等）
│   │   ├── composables/  # 组合式函数（useI18n、useTheme、useToast）
│   │   ├── stores/       # Pinia 状态管理（auth、skills）
│   │   ├── services/     # API 调用层
│   │   └── router/       # 路由配置
│   └── vite.config.ts    # 构建输出到 ../static/
├── static/       # 前端构建产物，由后端 @fastify/static 托管
├── data/         # 数据存储 (SQLite + ZIP files)
└── docs/         # API 文档
```

## Tech Stack

- **Backend**: Node.js + Fastify (CommonJS)
- **Database**: SQLite (node-sqlite3-wasm)
- **Frontend**: Vue 3 + TypeScript + Tailwind CSS + Vite
- **CLI**: ESM 独立包 (skill-base-cli)
- **Storage**: Local filesystem (ZIP archives)

## Key Concepts

### Skill
一个 Skill 是一个包含 `SKILL.md` 的文件夹，平台会自动解析：
- **name**: 第一个 `#` 标题
- **description**: 标题后的第一段文本

### Version
版本号格式: `vYYYYMMDD.HHmmss`（时间戳版本）

### Permission Model
- **owner**: 完全控制权限
- **collaborator**: 可发布新版本
- **user**: 只读权限

## API Patterns

所有 API 路由前缀: `/api/v1/`

认证方式: Cookie-based session (`session_token`)；CLI 使用 `Authorization: Bearer` PAT。

公开 GitHub 仓库导入（登录后）：`GET /skills/import/github/connectivity`、`POST /skills/import/github/preview`、`POST /skills/import/github`（JSON）。可选环境变量 `GITHUB_TOKEN` / `SKILL_BASE_GITHUB_TOKEN`、`SKILL_BASE_GITHUB_IMPORT_MAX_ZIP_MB`、`SKILL_BASE_GITHUB_CONNECTIVITY_TIMEOUT_MS`。

每个 Skill 可选配置 `webhook_url`（**PUT** `/skills/:skill_id` 的 JSON 字段；仅管理者在 GET 中可见）。在元数据变更、发布新版本、修改 Head、PATCH 版本说明、删除 Skill 等时机向该 URL **异步 POST** JSON，详见 `docs/api.md`。可选 `SKILL_BASE_WEBHOOK_TIMEOUT_MS` 控制投递超时。

## Development Commands

```bash
# 后端开发模式（nodemon 热重载）
npm run dev

# 后端生产模式
npm start

# 构建前端（输出到 static/）
npm run build          # 等同于 cd web && pnpm build

# 前端开发服务器（Vite，代理 API 到 localhost:8000）
npm run web:dev        # 等同于 cd web && pnpm dev

# 后端单元测试
npm test

# 安装依赖
npm install            # 后端
cd web && pnpm install # 前端
cd cli && pnpm install # CLI
```

## Runtime Notes

- 进程内提供基于 LRU 的只读模型缓存，用于 `skill`、`version` 和 `user` 基础信息读取。
- 缓存总容量通过环境变量 `CACHE_MAX_MB` 控制，默认 `50`（MB）。
- 服务健康检查 `GET /api/v1/health` 会返回简化缓存统计，可用于部署后观察缓存是否生效。
- 任何涉及 Skill/Version/User 的写路径都应在数据库写入成功后显式失效相关缓存，不要尝试做“通用 SQL 缓存”。

## Code Style

- 后端使用 CommonJS (`require`/`module.exports`)，前端使用 ESM，CLI 使用 ESM
- 异步函数使用 async/await
- 错误处理通过 Fastify error handler
- 前端使用 Vue 3 Composition API + `<script setup lang="ts">`
- 前端国际化通过 `web/src/composables/useI18n.ts`，支持 `{key}` 模板参数
- 前端构建产物输出到 `static/`，由后端托管
- Vite 开发模式通过 proxy 将 `/api` 请求代理到 `localhost:8000`
- 注意：Vite dev 模式下 `basePath.ts` 读取 `document.baseURI` 会导致路由异常，前端开发请用生产构建 + 后端验证

## Documentation Checklist

完成任何功能开发或修改后，必须检查并更新以下文档：

- [ ] **README.md** - 项目主文档，检查功能说明、使用示例是否需要更新
- [ ] **skill-base-cli** - CLI Skill 包，检查命令参数、使用流程是否变化
- [ ] **skill-base-web-deploy** - Web 部署 Skill 包，检查部署步骤、配置说明是否变化
- [ ] **docs/cli.md** - CLI 详细文档，检查命令参考、示例是否需要同步
- [ ] **AGENTS.md** - 本文件，检查开发规范、注意事项是否需要补充

> 💡 **文档优先原则**：代码改动完成后，应当立即更新相关文档，确保文档与代码保持同步。
