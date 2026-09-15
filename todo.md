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

- [x] **开启 Supabase 邮箱验证（2026-09-15 完成）**
      通过 Management API 把 `mailer_autoconfirm` 改为 `false`，并修复了 SMTP 配置。
      实测：注册返回 200、`confirmation_sent_at` 有值、`email_confirmed_at` 为 null、
      **不发放会话** —— 攻击链已断。
- [ ] **确认验证邮件真的收到了**（最后一步，只有你能做）
      你的邮箱 `huajianjiu12345@163.com` 应收到 3 封主题为
      "Confirm your email address" 的邮件（北京时间 14:32 / 14:36 / 14:38）。

      **重点看发件人地址**：
      - `noreply@mysticsages.com` → 走的是 Resend，配置正确 ✅
      - `...@mail.app.supabase.io` → 掉回了 Supabase 自带服务，需要再查

      顺手可点一次登录页的 "Forgot password?" 确认密码重置邮件也能到
      （那条路径此前一直是坏的，本次一并修复）。
- [ ] **删除 codex-temp 令牌**：https://supabase.com/dashboard/account/tokens
      权限很大（能改整个项目配置），已用完，请删掉。

### ⚠️ 修复过程中踩到的坑（记录下来避免重蹈）

**1. Management API 的 PATCH 是整体覆盖，不是局部更新。**
只传一个字段（例如只有 `smtp_pass`），**其余 SMTP 字段会被重置为 null**。
要保留的字段必须一次性全部传进去。我中途正是这样把 SMTP 配置清空的，
导致那段时间注册走回了 Supabase 自带邮件服务（每小时仅 2-4 封）。

**2. 两个字段有坑：**

```
smtp_max_frequency  与其它字段一起传 -> HTTP 400
                    单独传 -> 200，但会清空其它字段
                    结论：干脆不传，默认就是 60
smtp_port           必须传字符串 "587"；传数字 587 会 400
smtp_sender_name    首次传 401，重试后 200（疑似瞬时问题）
```

**3. Management API 读回的 `smtp_pass` 是哈希值，不是明文（64 位十六进制）。**
我一开始拿这个值去测 Resend SMTP，得到 535 "credentials invalid"，
差点误判成"密码存错了"。**教训：API 读回的值不能用来验证发信，
只能端到端实测。**

**4. 「忘记密码」此前一直是坏的。**
`resetPasswordForEmail()` 走 Supabase 发信，而 SMTP 密码是错值，
用户点 "Forgot password?" 会看到"Check your email"，但邮件永远不来。
本次一并修好。
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

- [x] **审计报告问题修复（2026-09-15 完成，提交 `8042573`）**
      - 定价页两个表单补 `custom` 字段（此前只能用 PayPal 邮箱兜底，
        两个邮箱不一致时会员开不到登录账号上）
      - 定价页报告表单补「你的问题」输入框（此前页面写着 "written for your question"
        却不传问题，只能生成默认问题）
      - 定价页移除 `target="_blank"`，与 /reading 页保持一致
      - webhook 接受 `subscr_failed` / `recurring_payment_suspended` /
        `recurring_payment_skipped` 并标记 `past_due`；扣款未 Completed 不再写成 active
        （此前信用卡过期后会员永久有效，一分钱收不到）
      - 取消订阅改为跳转 PayPal 自己的管理页（经典订阅 ID 无法用 REST API 取消；
        同时满足 FTC/欧盟"在线退订"合规要求）
      - 会员加 50 次/天 fair-use 配额（此前会员可无限刷，能被打穿毛利）
      - `/api/subscribe` 加限流（3 次/天/指纹），在写库和发信之前拦截
      - 权益发放要求邮箱已验证（配合上面的 Supabase 开关生效）
      - 删除 Lemon Squeezy 死代码（含一个无 secret 时 fail-open 的 webhook）及其依赖
      - 重写 `.env.example`，按代码实际读取的变量补齐（此前缺 service_role、
        PayPal 凭据、RATE_LIMIT_SALT、MODEL_* 等）
      - `/signup`、`/sign-up`、`/register` 重定向到 `/auth/register`
- [x] **X Day 22-28 素材已生成（2026-09-15）**：210 条文案 + 210 张配图，
      独立质检 0 问题（无占位符、无重复选项、无重复行、图片齐全）
- [x] 新增素材生成脚本 `scripts/generate-x-pack.mjs`，含内置质检；
      下次生成 Day 29+ 只需补 `DAYS` 数组数据后执行
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
