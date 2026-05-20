# Electron Desktop — Legacy

`desktop/`（Electron）仍为可用客户端，但 **新开发与发布优先使用 [`../desktop-tauri/`](../desktop-tauri/)**。

## 为何迁移到 Tauri

| | Electron | Tauri |
|---|----------|-------|
| 安装包体积 | 较大（Chromium 运行时） | 较小（系统 WebView + sidecar Node） |
| 业务逻辑 | `cli/lib` 直接 import | 同逻辑，经 Node bridge HTTP |
| UI | `desktop/src` Vue | **共用** `desktop/src` |
| Release | electron-builder | portable Node 20 + esbuild bridge |

## 当前状态

- **并行维护**：Electron CI / `pnpm run dist` 仍可构建，未删除。
- **功能对齐**：21 个 IPC channel 与 Tauri 共用 `cli/lib/desktop-ipc-channels.mjs` 与 `desktop-handlers.mjs`。
- **验收**：Tauri 侧见 [desktop-tauri/ACCEPTANCE.md](../desktop-tauri/ACCEPTANCE.md)。

## 开发命令（Legacy）

```bash
cd desktop
pnpm install
pnpm dev          # 开发
pnpm run dist     # 打包
```

## 推荐命令（Tauri）

```bash
cd desktop-tauri
pnpm install
pnpm dev
pnpm build
```

## 何时可移除 Electron

在以下条件满足后，可在单独 PR 中删除 `desktop/electron/` 与 electron-builder CI（**勿在本阶段删除**）：

1. Tauri release 已在目标平台稳定分发（macOS / Windows / Linux）
2. [ACCEPTANCE.md](../desktop-tauri/ACCEPTANCE.md) 手动清单已完成至少一轮
3. 团队确认无 Electron-only 部署依赖
