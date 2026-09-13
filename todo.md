# MysticSage 待办清单

最后更新：2026-09-13

## 已完成（网站侧）

- [x] 统一商品：$4.99 单次深度报告（10 张凯尔特十字）+ $19/月 Mystic Plus
- [x] 移除全站虚构数据（评分、评价、读者数量、未实现服务）
- [x] 安全头（CSP / X-Frame-Options / nosniff / Referrer-Policy / HSTS）
- [x] Supabase 权限加固（migration 004 已在 SQL Editor 执行成功）
- [x] 匿名日限额（服务端 + 数据库指纹）
- [x] PayPal live 链路（按钮 -> IPN -> 落库 -> 会员解锁 -> 邮件）
- [x] 欢迎邮件（Resend / noreply@mysticsages.com）实测可送达
- [x] 会员读取加 5s 超时降级，修复登录用户 500
- [x] SEO：卡片页 metadata、面包屑、Article schema、sitemap lastmod
- [x] `await params` 修复：22 个卡片页 + 17 篇博客文章的线上 404 修复
- [x] 未知 URL 返回真 404 + 品牌化 not-found 页面

## Google Search Console（2026-09-13 完成）

- [x] 添加属性 `https://mysticsages.com/`
- [x] 所有权验证通过（HTML file + HTML tag 两种方法都被 Google 自动识别）
- [x] 提交 sitemap：状态 **Success**，已发现 **54 个页面**
- [x] `sitemap.xml` / `robots.txt` 已从中间件排除（此前冷启动 2.8s，导致 Google 报
      "Couldn't fetch"；现在稳定 0.2-0.7s）
- [ ] 在「网址检查」里对重点页面点一次 REQUEST INDEXING
      （/reading、/cards/the-fool、/blog/free-tarot-reading-online 等；
      sitemap 已被抓取，这一步只是加速，不做也会自然收录）

## 待用户处理（只有你能做的）

- [ ] **修 www 的 SSL 证书**（真问题，见下）
- [ ] 修正 Pinterest 简介里的错域名：`mysticsages.co` -> `mysticsages.com`（.co 不存在）
- [ ] Pinterest 恢复期维护：每天 10 分钟保存/关注/评论，落地页修好后每天 3 张恢复发布
- [ ] X：Day 13 之后的日常发布（素材已备到 Day 21）
- [ ] 首笔真实 live 收款验证（Payoneer 卡下卡后走一次 $4.99）

### ⚠️ www.mysticsages.com 证书对不上（2026-09-13 实测）

```
mysticsages.com      证书 SAN = DNS:mysticsages.com        authorized: true
www.mysticsages.com  同一张证书，SAN 不含 www              ERR_TLS_CERT_ALTNAME_INVALID
```

Vercel 确实会给 www 发 307 跳转到主域，但**跳转发生在 TLS 握手之后**。
握手失败 → 浏览器先弹「你的连接不是私密连接」，跳转永远走不到。
任何人输入 `www.mysticsages.com` 都会看到安全警告。

**修复（在 Vercel 后台，2 分钟）：**
1. 打开 Vercel → 项目 `mysticsage` → Settings → Domains
2. 看 `www.mysticsages.com` 是否在列表里
3. 如果不在：Add Domain → 填 `www.mysticsages.com` → 选 **Redirect to mysticsages.com**
4. 如果在：看它的 Certificate 状态，必要时点 **Refresh** 或删掉重新添加，触发证书重签
5. 修好后用 `curl -I https://www.mysticsages.com/` 验证：应返回 307 且**无证书错误**

## 待开发（可排期）

- [ ] 12 篇偏短的博客扩写（thin content 风险）
- [ ] 博客正文内链到对应卡片页
- [ ] 支付链路的自动化测试
- [ ] X / Pinterest 图片素材离线备份（目前只在本地磁盘，未入 git）
