# Toolbox 开发者工具站

纯前端的开发者小工具集合，零依赖、零后端。部署在 Cloudflare Pages。

## 工具

| 路径 | 工具 | 说明 |
|---|---|---|
| `/tools/json.html` | JSON 格式化 | 美化 / 压缩 / 键名排序 / 语法校验（精确到行列） |
| `/tools/timestamp.html` | 时间戳转换 | Unix 秒级/毫秒级与日期互转，支持本地时区 / UTC / ISO 8601 |
| `/tools/base64.html` | Base64 编解码 | UTF-8 中文安全，支持 URL-safe，二进制自动降级为 hex |
| `/tools/url.html` | URL 编解码 | 编解码 + 查询参数逐项列出 |
| `/tools/hash.html` | 哈希摘要 | MD5 / SHA-1 / SHA-256 / SHA-384 / SHA-512 |
| `/tools/jwt.html` | JWT 解析 | 拆解 header/payload，校验 exp 过期时间（不验签） |

所有计算在浏览器本地完成，输入内容不会发往任何服务器，断网可用。

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
```

> 若 `127.0.0.1` 访问不通，显式绑定 IPv4：`npm run dev -- --host 127.0.0.1`。
> 默认可能只监听 IPv6 的 `::1`。

## 构建

```bash
npm run build    # 产物输出到 dist/，共 7 个 HTML
npm run preview  # 本地预览构建产物
```

## 路由设计说明

路由采用**扁平化单文件**（`/tools/json.html`）而非目录索引（`/tools/json/`）。

Cloudflare Pages 对无扩展名的目录路径不保证自动补 `index.html`，目录式路由上线后会 404。
单文件路径在任何静态托管上都能正确解析。

因此新增页面时，首页链接必须写成 `/tools/<name>.html`（带 `tools/` 前缀），
写成 `/<name>.html` 会 404 —— 因为产物实际位于 `dist/tools/` 下。

## 部署到 Cloudflare Pages

构建参数在 **Cloudflare Dashboard** 里设置，不放在 `wrangler.toml` ——
Pages 项目不识别 `wrangler.toml` 的 `[build]` 段，写了反而会触发
`Unexpected fields found in build field` 警告。

### Git 集成（当前采用）

远端仓库：<https://github.com/skygerry/toolbox>

远端地址使用 SSH：`git@github.com:skygerry/toolbox.git`
（依赖 `~/.ssh/config` 中为 github.com 指定的 `github_id_rsa`，该公钥需已加入 GitHub 账号）

Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git，
选中 `skygerry/toolbox`，构建配置：

| 配置项 | 值 |
|---|---|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| **Deploy command** | **留空**（见下方说明） |
| Node.js version | 20（环境变量加 `NODE_VERSION=20`） |

首次部署完成后会分配 `https://toolbox.pages.dev`，之后每次 `git push` 自动重建部署。

> ⚠️ **Deploy command 必须留空。**
> Pages 项目自带产物发布能力，填了反而会出错。若误填成 `npx wrangler deploy`，
> 构建能成功但部署会失败并报：
>
> ```
> ✘ [ERROR] Missing entry-point to Worker script or to assets directory
> ```
>
> 因为 `wrangler deploy` 是给 **Worker 项目**用的，它需要一个 Worker 入口或 assets 目录；
> 纯静态站点两者都没有。Pages 项目要用的是 `wrangler pages deploy`（见下方命令行方式）。

### 命令行直传

```bash
npm run build
npx wrangler pages deploy dist
```

首次会引导登录；需先在 Dashboard 创建一次同名 project。

> `pages deploy` 不支持 `--dry-run`（它需要真实认证），但 `wrangler deploy --dry-run`
> 可以用来检查配置是否被正确解析。

### 自定义域名

Dashboard → Pages → 项目 → Custom domains → 添加域名，
然后在域名 DNS 加一条 CNAME 指向 `<项目名>.pages.dev`。

## 加一个新工具

1. 新建 `src/pages/tools/<name>.astro`
2. 复制任意已有工具文件，保留 frontmatter 里的 `import Base from '../../layouts/Base.astro'`
3. 在 `src/pages/index.astro` 的 `tools` 数组里加一项，`href` 必须是 `/tools/<name>.html`
4. 构建产物自动带上新路由，无需改配置

## 实现细节

- **MD5** 手写实现，遵循 RFC 1321 —— A/B/C/D 四个 32 位字须按**小端字节序**追加输出。
  若按大端十六进制打印，结果会整体字节反转。
- **JSON 错误定位**兼容新旧 V8。新版 Chrome 已不再输出 `position N`，
  改为在报错消息里内嵌出错片段，因此采用三级策略：
  老版 `position` → 新版片段反查原文 → 二分查找最小不可解析前缀。
- 样式集中在 `src/layouts/Base.astro` 的 `is:global` 块内，浅色主题。

## 环境备注

若安装依赖时卡住，检查 npm registry 指向。已废弃的 `registry.npm.taobao.org`
会导致长时间无响应，改用官方源或镜像：

```bash
npm install --registry=https://registry.npmmirror.com --no-audit --no-fund
```
