# Skill Base 新手使用指南

## 你需要先知道的

Skill Base 是你们团队的**AI 规则库**。你的 AI 助手（Cursor、Claude Code 等）装上这些规则后，写代码、写文档就会自动遵守团队规范。

你有两种方式来安装和使用，选你顺手的：

---

## 方式一：让 AI 助手帮你装

适合：已经在用 Cursor、Claude Code、ChatGPT 等工具的人

不用开终端，直接把下面的话**一句一句发给你的 AI 助手**，它帮你搞定。

### 第 1 步：让助手安装工具

复制下面这句话，发给你的 AI 助手：

> 从 https://cdn.chaoxi.live/deploy/skills/skillbase/SKILL.md 拉取 skb 并安装到你的 skills 目录。

等它装完再进行下一步。

### 第 2 步：让助手连接你们的服务器

把下面这句话发给助手（把地址换成你们团队的）：

> 帮我配置 Skill Base，服务器地址是 https://skill.your-team.com。

> 不知道地址？问你的同事要。本地测试的话地址是 http://localhost:8000

### 第 3 步：搜索你想要的规则

> 用 skb 搜索 vue。

把 "vue" 换成你想搜的关键词，比如 "接口规范"、"git"、"测试" 等。

### 第 4 步：安装到你项目里

> 用 skb 安装 vue-best-practices。

把名字换成上一步搜索到的 Skill 名称。

### 第 5 步：以后有更新了

团队更新了规范后，再跟助手说一句：

> 用 skb 更新 vue-best-practices。

就完事了。

---

## 方式二：我自己来

适合：习惯用终端的人，或者不用 AI 助手的人

### 先确认环境

打开终端，输入：

```bash
node -v
```

能看到版本号（v18 或更高）就行。看不到的话，去 [nodejs.org](https://nodejs.org/) 下载安装。

### 1. 安装命令行工具

```bash
npm install -g skill-base-cli
```

### 2. 连接服务器

把地址换成你们团队的：

```bash
skb init -s https://skill.your-team.com
```

### 3. 搜索

```bash
skb search vue
```

### 4. 安装

```bash
# 普通安装
skb install vue-best-practices

# 自动装到 Cursor 的规则目录
skb install vue-best-practices --ide cursor

# 自动装到 Claude Code 的规则目录
skb install vue-best-practices --ide claude-code

# 装到 Copilot 的规则目录
skb install vue-best-practices --ide copilot
```

支持的 IDE 一览：`cursor`、`claude-code`、`copilot`、`windsurf`、`qoder`、`opencode`

### 5. 更新

```bash
skb update vue-best-practices
```

### 6. 登录（仅发布时需要）

```bash
skb login
```

会打开浏览器，登录后页面上显示验证码，回终端输入就行。

### 常用命令

| 命令 | 干什么 |
|------|--------|
| `skb init -s <地址>` | 连接服务器 |
| `skb search <关键词>` | 搜索 |
| `skb install <名称>` | 安装 |
| `skb update <名称>` | 更新 |
| `skb list` | 看我装了哪些 |
| `skb login` | 登录 |
| `skb whoami` | 检查登录状态 |

---

## 常见问题

**`skb` 命令找不到**
→ 关闭终端重新打开，或者确认 Node.js 装好了。

**搜索不到东西**
→ 确认 `skb init -s` 里的服务器地址是对的。问同事要正确的地址。

**安装提示没权限**
→ 有些 Skill 是私有的。先 `skb login` 登录，再安装。

**更新提示找不到记录**
→ 之前如果是手动复制文件的，CLI 不认识。用 `skb install` 重新装一次就好了。

**验证码过期了**
→ 5 分钟有效，重新 `skb login` 拿新的。

**IDE 没加载规则**
→ 安装时加 `--ide cursor`（或你的 IDE 名），装完重启 IDE。
