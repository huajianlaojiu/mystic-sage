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

## 待用户处理（只有你能做的）

- [ ] **Google Search Console 验证**（最重要）：加 `google-site-verification` 后提交 sitemap
- [ ] 修正 Pinterest 简介里的错域名：`mysticsages.co` -> `mysticsages.com`（.co 不存在）
- [ ] Pinterest 恢复期维护：连续 7-10 天每天 10 分钟，只保存/互动，不发新 Pin
- [ ] X：Day 13 之后的日常发布（素材已备到 Day 21）
- [ ] 首笔真实 live 收款验证（Payoneer 卡下卡后走一次 $4.99）

## 待开发（可排期）

- [ ] 12 篇偏短的博客扩写（thin content 风险）
- [ ] 博客正文内链到对应卡片页
- [ ] 支付链路的自动化测试
- [ ] X / Pinterest 图片素材离线备份（目前只在本地磁盘，未入 git）
