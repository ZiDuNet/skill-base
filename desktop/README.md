# Skill Base Desktop (Electron — Legacy)

> **Deprecation notice**：Electron 客户端进入维护模式。新功能与 release 请使用 **[desktop-tauri](../desktop-tauri/)**（Tauri 2 + bundled Node bridge）。详见 [DEPRECATED.md](./DEPRECATED.md)。

本地 Agent Skill 管理桌面客户端，复用 `skill-base-cli` 的安装/更新/认证逻辑，UI 参考 demo 暗色极客风。

## 技术选型（历史）

选用 **Electron**（早期版本）：

- 直接 `import` `cli/lib/*` 模块，与 `skb ui` 行为一致
- 原生目录选择对话框（项目根路径、安装目标）
- 与 CLI 共用 `~/.skill-base/config.json` 与安装记录

Tauri 版本通过 Node bridge 复用同一套 `desktop-handlers.mjs`，UI 共用 `desktop/src`。

## 开发

```bash
cd desktop
pnpm install
pnpm dev
```

## 功能

- **本地资产**：扫描 CLI 安装记录，对比远端最新版本，批量/单个更新
- **技能市场**：搜索并安装 Skill
- **安装目录选择**：全局 Agent 目录（如 `~/.cursor/skills`）或当前项目的 Agent 目录（如 `.cursor/skills`），逻辑与 `cli/lib/ide.js` 一致
- **连接设置**：配置 Server 地址、CLI 验证码换 PAT（与 `skb login` 相同）

## 项目目录

顶部工具栏可点击路径切换「当前项目根目录」，用于解析各 Agent 的项目级安装路径。

## 迁移到 Tauri

```bash
cd ../desktop-tauri
pnpm install
pnpm dev
```

验收清单：[desktop-tauri/ACCEPTANCE.md](../desktop-tauri/ACCEPTANCE.md)
