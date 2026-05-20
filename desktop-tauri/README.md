# Skill Base Desktop (Tauri)

与 `../desktop`（Electron）并行，共用 `../desktop/src` Vue UI 与 `../cli/lib` 业务逻辑。

## 开发

```bash
# 首次：安装依赖（会自动安装 ../cli 依赖）
pnpm install

# 启动 Tauri 开发模式（Vite :5174 + Node bridge + 原生窗口）
pnpm dev

# 仅前端
pnpm dev:vite

# 仅 Node bridge（调试 HTTP /invoke）
pnpm dev:bridge

# Bridge 冒烟测试
pnpm smoke:bridge
pnpm smoke:bridge -- --bundled   # 测 esbuild 产物
```

**开发要求**：系统 PATH 中可用 `node`（≥18），Rust/Cargo，macOS 上 Xcode CLT。

## 生产构建

Release 不依赖系统 PATH 中的 `node`，会打包：

| 资源 | 路径（bundle 内） | 说明 |
|------|-------------------|------|
| Portable Node 20 LTS | `resources/node/` | 按目标平台下载官方二进制 |
| Bridge | `resources/bridge/server.mjs` | esbuild 单文件 bundle |
| CLI fallback | `resources/cli-lib/` | 仅 `SKB_SKIP_BUNDLE=1` 时生成 |

```bash
# 完整 release（自动 prepare-resources + vite build + tauri build）
pnpm build

# 仅准备 sidecar 资源（下载 Node + bundle bridge）
pnpm prepare:resources

# 交叉指定 Node 平台（CI / 本地预下载）
SKB_NODE_TARGET=darwin-arm64 pnpm prepare:resources   # darwin-arm64 | darwin-x64 | linux-x64 | win-x64
```

### 本地构建产物

构建完成后安装包位于 `src-tauri/target/release/bundle/`：

| 平台 | 产物 |
|------|------|
| macOS | `dmg/*.dmg` |
| Windows | `nsis/*.exe`、`msi/*.msi` |
| Linux | `appimage/*.AppImage`、`deb/*.deb` |

### 环境变量

| 变量 | 作用 |
|------|------|
| `SKB_NODE_TARGET` | 指定下载的 Node 平台三元组 |
| `SKB_SKIP_NODE` | `1` = 跳过 Node 下载（复用已有 `src-tauri/resources/node`） |
| `SKB_SKIP_BUNDLE` | `1` = 不 esbuild，复制源码 bridge + 安装 cli-lib prod deps（需手动在 `tauri.conf.json` 添加 `resources/cli-lib/**` glob） |
| `SKB_CLI_LIB_ROOT` | Bridge 运行时 cli/lib 路径（Rust 在 fallback 模式自动注入） |

## Electron（对照）

```bash
cd ../desktop
pnpm install
pnpm dev
```

## 架构

见 [IPC.md](./IPC.md)。

- 前端：`window.skb.invoke(channel, ...args)` → Tauri `skb_invoke`
- Rust：5 个原生 channel（dialog/opener）+ 其余转发 Node bridge
- Bridge：`bridge/server.mjs` → `cli/lib/desktop-handlers.mjs`
- **Dev**：Rust 用 PATH `node` + 源码 `bridge/server.mjs`
- **Release**：Rust 用 `resource_dir/node` + bundled `resource_dir/bridge/server.mjs`

## CI

`.github/workflows/desktop-tauri-release.yml` — push 到 `main` 且 desktop-tauri 相关路径变更时，在 macOS / Windows / Linux 矩阵上执行 `pnpm build` 并上传产物。

## 许可与待办

- **Node.js 二进制**：来自 [nodejs.org](https://nodejs.org/) 官方发行版，遵循 [Node.js 许可](https://github.com/nodejs/node/blob/main/LICENSE)；分发时需保留其 LICENSE（当前未自动打包，后续可加）。
- **代码签名**：CI 未配置 Apple / Windows 签名证书（`CSC_IDENTITY_AUTO_DISCOVERY=false` 等价行为）。
- **macOS x64**：CI 仅在 `macos-latest`（arm64）构建；需 Intel 包时加 `darwin-x64` job 或本地 `SKB_NODE_TARGET=darwin-x64 pnpm build`。
