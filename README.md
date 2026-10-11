# Toolbox

一组纯前端的开发者小工具，静态托管在 Cloudflare Pages。

## 工具列表

路由为扁平化单文件形式（`/tools/json.html`），不使用目录索引 —— Cloudflare Pages
对无扩展名的目录不保证补 `index.html`，目录式路径（`/tools/json/`）在其上会 404。

| 路径 | 工具 | 说明 |
|---|---|---|
| `/tools/json.html` | JSON 格式化 | 美化 / 压缩 / 键名排序 / 语法校验（标出行列） |
| `/tools/timestamp.html` | 时间戳转换 | Unix 秒级/毫秒级与日期互转，支持本地时区 / UTC / ISO 8601 |
| `/tools/base64.html` | Base64 编解码 | UTF-8 中文安全，支持 URL-safe，二进制自动降级为 hex |
| `/tools/url.html` | URL 编解码 | 编解码 + 查询参数逐项列出 |
| `/tools/hash.html` | 哈希摘要 | MD5 / SHA-1 / SHA-256 / SHA-384 / SHA-512 |
| `/tools/jwt.html` | JWT 解析 | 拆解 header/payload，校验 exp 过期时间（不验签） |

## 本地开发

```bash
npm install
npm run dev      # http://localhost:4321
```

> 若 `127.0.0.1` 访问不通，用 `--host 127.0.0.1` 显式绑定 IPv4；
> 默认可能只监听 IPv6 的 `::1`。

## 构建

```bash
npm run build    # 产物输出到 dist/
npm run preview  # 本地预览构建产物
```

## 部署到 Cloudflare Pages

### 方式一：Git 集成（推荐）

1. 在 GitHub / GitLab 新建仓库并推送本目录
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
3. 选择仓库，构建配置填：

   | 配置项 | 值 |
   |---|---|
   | Framework preset | Astro |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Node.js version | 18 或更高（环境变量 `NODE_VERSION=20`） |

4. Deploy。构建通过后会分配 `https://<项目名>.pages.dev`

### 方式二：直接上传

```bash
npm run build
npx wrangler pages deploy dist --project-name toolbox
```

首次会引导登录。需要先在 Dashboard 创建一次同名 project。

### 自定义域名

Dashboard → Pages → 项目 → Custom domains → 添加域名，然后在域名 DNS 里加一条 CNAME 指向 `<项目名>.pages.dev`。

## 加一个新工具

1. 新建 `src/pages/tools/<name>.astro`
2. 复制任意已有工具文件，保留 frontmatter 里的 `import Base from '../../layouts/Base.astro'`
3. 在 `src/pages/index.astro` 的 `tools` 数组里加一项，`href` 写成 `/tools/<name>.html`
   （注意带 `tools/` 前缀，写成 `/<name>.html` 会 404）
4. 构建产物自动带上新路由，无需改配置

## 设计约束

- 所有计算在浏览器本地完成，不发任何请求，因此不需要后端、密钥或环境变量
- 不引入运行时依赖（MD5 是手写实现），构建产物只有 HTML + 原生 JS
- 浅色主题，样式集中在 `src/layouts/Base.astro` 的 `is:global` 块内
