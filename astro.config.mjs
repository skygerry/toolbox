// @ts-check
import { defineConfig } from 'astro/config';

// 纯静态输出：产物 dist/ 可直接托管到 Cloudflare Pages
// 不使用 adapter，因为 Pages 的静态资源分发比 Workers 更合适且免费额度更高
export default defineConfig({
  output: 'static',
  site: 'https://toolbox.pages.dev',
  build: {
    // 'file' 而非 'directory'：产物为 /tools/json.html 而非 /tools/json/index.html。
    // 目录索引在不同静态托管上的行为不一致（Cloudflare Pages 对无扩展名目录不保证
    // 补 index.html），扁平化成单文件可彻底避开这个问题。
    format: 'file',
  },
});
