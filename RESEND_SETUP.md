# Mystic Sage — Resend 邮件服务配置清单

> 用途：让「订阅欢迎信」与「方案 B 付费报告邮件」在生产环境真正发出。
> 代码（`src/lib/email.ts`、`/api/subscribe`、`/api/paypal-webhook`）已就绪，缺的是 Resend 配置。

## 前置确认（已查证）
- 域名 `mysticsages.com` 的 **DNS 托管在 Cloudflare**（`macy.ns.cloudflare.com` / `bowen.ns.cloudflare.com`）
- 网站本身托管在 **Vercel**（A 记录指向 `76.76.21.21`）
- 因此：DNS 记录加在 **Cloudflare**，环境变量加在 **Vercel**
- 生产读的是 Vercel 环境变量，**本地 `.env.local` 不影响线上**

## 步骤 1：Resend 后台生成验证记录
1. 登录 [resend.com](https://resend.com) → 左侧 **Domains** → **Add Domain**
2. 输入 `mysticsages.com` → 下一步
3. 页面会列出 2–3 条 DNS 记录，**具体值以页面显示为准**（每次不同，勿照抄）：
   - SPF（`TXT`）
   - DKIM（`CNAME` → `resend._domainkey.resend.com`）
   - 域名所有权验证（`TXT`）

## 步骤 2：在 Cloudflare 添加这些记录
1. 登录 Cloudflare → 选 `mysticsages.com` → **DNS → Records**
2. 按 Resend 给的值逐条添加
3. ⚠️ **DKIM 的 CNAME 必须设为「DNS only」（灰色云 ☁️）**
   - 默认 Cloudflare 会给 CNAME 开橙色代理（Proxied），会隐藏目标域名，导致 Resend 验证**永远失败**
   - TXT 记录 Cloudflare 不支持代理，会自动 DNS-only，无需处理
4. ⚠️ **若已有 SPF 记录，必须合并，不能直接覆盖**
   - 例：已有 `v=spf1 ...`，改为 `v=spf1 include:amazonses.com include:原有内容 ~all`
   - 两条 SPF 并存会导致校验失败

## 步骤 3：回到 Resend 点 Verify
1. Resend Domains 页点 **Verify**
2. 等待 5–30 分钟（DNS 全球生效）
3. 状态变为 **Verified** 即成功

## 步骤 4：Vercel 加环境变量并重新部署
1. Vercel 项目 → `Settings → Environment Variables`，新增：
   - `RESEND_API_KEY` = `re_...`（建议用 revoke 旧 key 后新生成的）
   - `EMAIL_FROM` = `MysticSage <noreply@mysticsages.com>`
   - Target 至少勾选 **Production**
2. 加完 env 后，对最新 commit **Redeploy** 一次（加变量不会自动重 build）

## 步骤 5：真实闭环验证
- 用 Payoneer 虚拟卡（或国际卡）付一笔 **$4.99**
- 预期：
  - 买家邮箱收到 **Detailed Report 邮件**（方案 B）
  - 订阅框填邮箱收到 **欢迎信**
  - Supabase `orders` / `memberships` 写入正确记录

## 安全提醒
- `RESEND_API_KEY` 曾在对话中明文出现，建议到 Resend 后台 **revoke 旧 key 并重新生成**，用新 key 填 Vercel
- 切勿将 key 写入代码、`.env` 文件或提交到 git

## 排查要点
- 发信失败但订阅/订单正常：检查 `RESEND_API_KEY` / `EMAIL_FROM` 是否填对且已 redeploy
- 域名一直 Verify 失败：99% 是 Cloudflare 的 DKIM CNAME 仍是橙色代理，关掉即可
- 邮件进垃圾箱：确认 SPF/DKIM 通过，且 `EMAIL_FROM` 用的是已验证域名地址（非 `onboarding@resend.dev`）
