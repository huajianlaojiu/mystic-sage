# MysticSage 待办清单

最后更新：2026-09-15

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

- [x] 修正 Pinterest 简介里的错域名（2026-09-14 完成，已改为 mysticsages.com）
- [ ] **Pinterest 每日维护（进行中）**：每天 10 分钟关注 6-10 个 + 保存 20-30 张
      （截至 9/15：关注 18，已保存 18 张；粉丝仍为 0，属正常，需 2-4 周）
- [ ] **X 每日发布（进行中）**：Day 14 已于 9/15 发布，接下来 Day 15-21，
      素材已备且已校对；建议把三条拆成"两条一批 + 一条隔开"
- [ ] 首笔真实 live 收款验证（Payoneer 卡下卡后走一次 $4.99）

### ✅ www SSL 证书（2026-09-14 已修复）

**根因**：`www.mysticsages.com` **根本没有添加到 Vercel 项目里**，
所以 Vercel 只能拿主域的证书去应答 www，浏览器报
`ERR_TLS_CERT_ALTNAME_INVALID`。

注意当时 www 确实会返回 308/307 跳转——但**跳转发生在 TLS 握手之后**，
握手失败时浏览器连跳转都走不到，只会先弹安全警告。

**修复**：Vercel → 项目 `mysticsage` → Settings → Domains → Add Domain →
填 `www.mysticsages.com` → **不要勾** "Include apex and www variants"
（否则主域会被设成重定向到自己，形成无限循环）→
Redirect to Another Domain → `mysticsages.com`。

**验证结果**：

```
证书 SAN = DNS:www.mysticsages.com          authorized: true
https://www.mysticsages.com → 308 → https://mysticsages.com → 200
ssl_verify_result = 0（通过）
www 与 apex 的 DNS 记录均与 Vercel 官方要求完全一致
```

后台两行域名仍显示 "DNS Change Recommended"，属建议性提示：
实测 apex 为 `A 76.76.21.21`、www 为 `CNAME cname.vercel-dns.com`，
正是 Vercel 文档要求的值，证书与访问均正常，无需处理。

## 待开发（可排期）

- [ ] **X Day 22 起的新素材（时间敏感）**：Day 21 对应 9/22，之后将断供，
      需要提前生成，否则连续性会中断
- [ ] Pinterest pins10 新素材（恢复每日 3 张发布时备用；pins8 / pins9 各 20 张尚未使用）
- [x] **博客扩写（2026-09-13 完成）**：11 篇正文只有 19-61 词、却标着 5-8 分钟阅读，
      而这些页面承接了约 91% 的 Pinterest 点击。现已全部重写为 588-837 词的实质内容，
      全站博客总字数 2,086 -> 9,526，每篇"阅读时长"都按真实字数重算
- [x] 顺带修正 `free-birth-chart-reading-online`：网站只提供塔罗，没有星盘工具，
      原标题承诺了不存在的功能，已改名并重写为诚实的知识指南
- [x] **3 篇偏短文章已扩写（2026-09-14 完成）**：
      what-is-numerology 248 -> 974 词、zodiac-signs-compatibility 272 -> 888 词、
      tarot-cards-for-beginners 285 -> 1094 词
      扩写内容刻意避开已发表的主题（数字学讲全套数字而非只讲生命灵数；
      配对讲相位与运作原理而非再列一遍配对表；塔罗讲牌组结构与花色而非再讲读牌技巧）
- [x] **全站博客达标**：17 篇全部 >= 300 词，总计 11,677 词，平均 687 词；
      2,086 -> 11,677（5.6 倍）。所有"阅读时长"按真实字数重算，校验 0 处不符
- [ ] 博客正文内链到对应卡片页（当前渲染是纯文本，需要先给渲染器加链接支持）
- [ ] 支付链路的自动化测试
- [x] **素材备份（2026-09-14 完成）**：X/Pinterest 的 803 个文件（720 张图 +
      65 个文案文档）打包为 38.4 MB，哈希校验一致后复制到 Google 云端硬盘
      `G:\我的云端硬盘\MysticSage-backup\`
- [x] 新增可复用脚本 `scripts/backup-marketing-assets.ps1`：自动打包、逐文件比对、
      计算 SHA256、复制到云端并二次校验。有新素材时跑一次即可
