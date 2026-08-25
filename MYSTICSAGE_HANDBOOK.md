# MysticSage 项目手册（综合记忆）

> 维护说明：本文件汇总 WorkBuddy 跨会话记忆中所有 mysticsage 相关资料，便于在仓库内直接查阅。
> 生成日期：2026-08-25。最后核对：2026-08-25。
> ⚠️ **仓库 `huajianlaojiu/mystic-sage` 为 PUBLIC**，任何真实密钥/令牌都只在 Vercel/Supabase/PayPal 后台，绝不写入本仓库。

---

## 1. 项目概况

| 项 | 值 |
|---|---|
| 生产域名 | https://mysticsages.com |
| 仓库 | huajianlaojiu/mystic-sage（public） |
| 技术栈 | Next.js 16 (App Router) + Vercel + Supabase + OpenAI + PayPal |
| 目标用户 | **海外（非中国）**，全站英文文案 |
| 变现 | PayPal 收款（无 Stripe）：单次报告 $4.99 + 会员订阅 $19/mo（Mystic Plus） |
| Supabase 项目 ref | `sqwexehmjejfyaknisen`（已升 Pro，关自动暂停） |
| Vercel 项目 | projectId `prj_UZUsWxpPbJSckcpCwH2GyidwIFvi`（已绑 GitHub，push main 自动部署） |
| 本地路径 | `D:/AI应用/占卜算命网站/mysticsage` |

---

## 2. 关键账号 / 服务（脱敏）

- **域名 DNS**：Cloudflare 托管（macy/bowen.ns.cloudflare.com），A 记录 `76.76.21.21` 指 Vercel。
- **GA4**：`G-24XKR10DXE`（NEXT_PUBLIC_GA_ID）。
- **PayPal Business**：登录邮箱 `mountain0342@gmail.com`，商户号 `VT35822NBS3Y8`。后台法定公司信息 = **叶刚**（"Mystic Sage" 仅为品牌展示名）。Live 模式已启用：PayPal 付款 + 订阅收款权限。
  - 已绑工行储蓄卡（尾号 2714，北京）作收款/提现账户；建行银联卡（尾号 1402）仅消费/认证。
  - **IPN 已配**：Notification URL = `https://mysticsages.com/api/paypal-webhook`，消息发送已启用。（按钮内 `notify_url` 为冗余双保险。）
- **Resend**：域名 `mysticsages.com` 已验证，发信 `noreply@mysticsages.com`。

---

## 3. 支付链路（已逐行核对 + Sandbox 实测通过）

```
付款 → PayPal IPN → 验真(cmd=_notify-validate) → receiver_email === PAYPAL_BUSINESS_EMAIL
     → subscriptions(status=active) / orders(status=Completed) 落库
     → getMembership 读同字段 → member=true → 页面解锁 + 触发 $4.99 报告邮件
```

- **$4.99 单次报告**：`cmd=_xclick`、`item_name="Detailed Report"`、`custom=JSON{e,q}`（登录邮箱+问题）、`notify_url`、`<input name="lc" value="US">`（英文结账页）。
- **$19 订阅（Mystic Plus）**：`cmd=_xclick-subscriptions`、`item_name="Mystic Plus - Monthly"`、`custom=userEmail`。
- **两按钮收款账户**均取自 `NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL`。
- **webhook**（`src/app/api/paypal-webhook/route.ts`）：验签 → receiver 校验 → `web_accept+Completed+/detailed report/i` 落 `orders` 并发报告邮件；`subscr_*` 落 `subscriptions(active)`。用 `SUPABASE_SERVICE_ROLE_KEY` 写库（绕过 RLS）。
- **会员判定**（`src/lib/membership.ts`）：读 `subscriptions(status=active)` 或 `orders(status=Completed, /detailed report/i)` → `member=true`；查询已加 5s 超时降级。
- **关键环境变量一致性**：`NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL` 与 `PAYPAL_BUSINESS_EMAIL` **必须填同一个邮箱**，否则 webhook 因 receiver 不匹配 400 拒收。
- **线上探测**：`GET /api/paypal-webhook` → `{"mode":"live","verify":"https://ipnpb.paypal.com/...","skipVerify":false}`：函数存活、真实验签开启。
- **Sandbox 端到端**（2026-08-15）：用沙盒买家付 $4.99，Supabase `orders` 正确落库并绑定登录邮箱 ✅。
- **首笔真实 live 付款**：⏳ 未亲验（用户无国际卡；2026-08-23 决策：Sandbox 已验证 + 配置确认即可上线，等真实客户首单验收）。

### ⚠️ 用户已明确的两处纠正（勿重复）
1. **IPN 已配过，不要再提示"去开启 IPN"**。
2. **SWIFT 分支码只影响"提现到工行"，不影响"收款"**（收款进 PayPal 余额）。SWIFT 未配不阻塞上线，有空再补（工行柜台/App 查开户支行 11 位码，或改绑 Payoneer/万里汇美区美元账户）。

---

## 4. 环境变量清单（仅列名 + 状态，值在 Vercel Dashboard）

| 变量 | 状态 |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | ✓ |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✓ |
| SUPABASE_SERVICE_ROLE_KEY | ✓（webhook 写库依赖；曾因 Vercel 空白导致假部署，已修复） |
| OPENAI_API_KEY / OPENAI_BASE_URL | ✓ |
| PAYPAL_MODE | ✓ = live |
| NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL / PAYPAL_BUSINESS_EMAIL | ✓（须一致） |
| RESEND_API_KEY / EMAIL_FROM | ✓（EMAIL_FROM=noreply@mysticsages.com） |
| NEXT_PUBLIC_GA_ID | ✓ = G-24XKR10DXE |

> 历史坑：2026-08-06 曾发现 Vercel 6 个 env 全为空字符串，线上是"假部署"。改值对 sensitive 类型不可 PATCH，须 DELETE+POST 重建。

---

## 5. 重大修复 / 演进时间线（摘要）

- **2026-08-06**：初始化；会员解锁解读页；博客搜索+相关推荐；GitHub→Vercel 自动部署恢复；修复 Vercel env 全空；PayPal IPN 加验签+receiver 守卫（此前任何人可伪造 IPN 白嫖会员）。
- **2026-08-13**：根因 = `NEXT_PUBLIC_SUPABASE_URL` 的 ref 拼错（j/f 错位）→ NXDOMAIN，全链路断。修正 ref + service_role 授权（42501）。
- **2026-08-14**：`@supabase/ssr` 登录态校验、堵会员邮箱伪造（只信 session）；Supabase 升 Pro 根治免费版自动暂停导致的已登录请求卡顿；注册 autoconfirm（免邮件）+ 密码找回 SMTP 折中方案落地；Header/Footer 乱码修复。
- **2026-08-15**：Sandbox 端到端支付验证通过；补 `/refund` 页；PayPal 升级 Business（进入审核期）→ 审核通过 → 绑工行卡成功。
- **2026-08-19**：PayPal 后台偶发「系统无响应」排查（代理/网络/账户限制）。
- **2026-08-23**：Business 审核通过 + Live 收款权限确认；Payoneer 注册（自测路线后因门槛堵死）；上线条件系统核查；**方案 A**（$4.99 解锁 premium 5 张牌，`commit 9041a51`）；**方案 B**（付款后自动邮件发 Detailed Report，`commit 6976ccf`）；Resend 验证 + 欢迎信实测通过；**决策：上线，等真实客户首单验收**。
- **2026-08-24**：全面代码复核（P1 修 layout em-dash 乱码）；内容吸引力/付费意愿分析；`readings` 表迁移 003 + GRANT（42501 修复）；修复线上登录用户 500（membership 无超时，加 5s 超时）；PayPal 按钮抽组件三处显示；转化文案（海外视角，`commit 68a62cd`）。
- **2026-08-25**：修 3 个 P0（`shareCard` 牌名重叠 / 限额按钮重复 / Try Again 无意义，`commit 2326f86`）；`lc=US` 英文结账（`58dc3de`）；支付链路复核 + 上线前检查（GA4/robots/sitemap/可访问性全绿）；`/login`→`/auth/login` 301 重定向（`a76f0c9`）。

---

## 6. 上线前检查结论（2026-08-25，全部通过）

| 检查项 | 结果 |
|---|---|
| GA4 事件 | ✅ 线上 `G-24XKR10DXE`；`begin_checkout` / `reading_completed` / `sign_up` 已埋；Cookie 同意流正确（GDPR 合规） |
| robots.txt | ✅ 200 |
| sitemap.xml | ✅ 200，60+ 页面 |
| 页面可访问性 | ✅ sitemap 全部路由 + `/auth/register` + `/auth/login` 均 200；无死链 |
| SEO/元数据 | ✅ metadata / OG / Twitter / JSON-LD(Organization+WebSite) 齐备 |
| /login 重定向 | ✅ 308 → /auth/login |

---

## 7. 待办（不阻塞上线）

1. **首笔真实 live $4.99 付款验收**：验证 orders(Completed) + 报告邮件 + 会员解锁。
2. **SWIFT 提现补全**（有空再做）：工行开户支行 11 位码，或改用 Payoneer/万里汇美区美元账户。
3. **RESEND_API_KEY 轮换**（安全）：该 key 曾多次在对话明文暴露，建议 revoke→重生成→更新 Vercel→redeploy。
4. **方案 A 隐患**：$4.99 买家当前可无限次抽 premium 5 张牌，后续可加「已用额度」限制。
5. **Vercel 调试 token**：用完即删（1 天期）。

---

## 8. 关键坑 / 可复用经验

- **Vercel 部署**：git push main 已自动部署（因已绑 GitHub）。手动部署用 `vercel deploy --prod --token <vcp_...>`。
- **Clash 代理 TLS 抖动**：`vercel deploy` 偶因 Node 不走代理、上传阶段 TLS 握手断开失败 → 重试即过。
- **Supabase SQL Editor 建表不自动 GRANT**：CREATE TABLE 后须手动 `GRANT ... TO service_role/postgres/authenticated`，否则 API 查询 42501。
- **Next build**：本机全局 `NODE_OPTIONS=--use-system-ca` 会阻塞 Turbopack worker，build 前 `NODE_OPTIONS=""`。
- **并行会话(Codex)会直接 push origin/main**：操作前先 `git fetch` 再判断本地 vs 远程，勿假设本地即最新。
- **会员邮箱匹配**：付款时 `custom` 字段优先带登录邮箱，webhook 优先用其写库，解决"PayPal 付款邮箱 ≠ 登录邮箱"导致会员不显示。
- **公开仓库铁律**：绝不 `git commit` 任何真实密钥/令牌；需变更仅在对应后台 Dashboard 操作。

---

## 9. 仓库内相关文档索引

| 文件 | 内容 |
|---|---|
| `LAUNCH_READINESS_2026-08-25.md` | 上线就绪报告（本次 P0/支付链路/检查/重定向汇总） |
| `mysticsage_review_2026-08-24.md` | 8-24 全面代码与运转复核报告 |
| `mysticsage_content_analysis_2026-08-24.md` | 塔罗报告内容吸引力/情绪价值/付费意愿分析 |
| `RESEND_SETUP.md` | Resend 接入 + Cloudflare DNS 验证清单 |
| `X-daily-content.md` / `X-pinterest-strategy.md` | 海外社媒（X/Twitter、Pinterest）运营内容计划 |
| `supabase/migrations/002_*` / `003_*` | subscriptions/orders 表 + readings 表（含 RLS/GRANT） |
