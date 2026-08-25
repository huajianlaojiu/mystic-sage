# MysticSage 代码与运转复核报告
复核时间：2026-08-24 ｜ 项目：`D:/AI应用/占卜算命网站/mysticsage` ｜ 部署：Vercel / mysticsages.com

## 一、技术栈与架构概况
- **框架**：Next.js 16.2.9（App Router）+ React 19 + TypeScript
- **数据/AI**：Supabase（auth + Postgres）、OpenAI `gpt-4o-mini`
- **支付**：PayPal IPN（主，live 模式）+ Lemon Squeezy（备选，checkout 已接、webhook 仅占位）
- **邮件**：Resend（欢迎信 + 方案 B 报告邮件）
- **入口**：`src/proxy.ts`（Next 16 中间件，负责 session 刷新）
- **核心逻辑文件**：`lib/membership.ts`、`lib/reading.ts`、`lib/email.ts`、`lib/tarot.ts`、`lib/supabase/server.ts`、`app/api/*`

## 二、线上运转状态（实测）
| 检查项 | 结果 | 说明 |
|---|---|---|
| 主要页面（/、/reading、/pricing、/about、/blog、/cards、/services、/contact、/privacy、/terms、/refund、/success） | **全部 200** | 正常 |
| /help、/safety | **404** | 页脚死链（见问题 2） |
| /robots.txt、/sitemap.xml | **200** | SEO 基础正常 |
| GET /api/paypal-webhook | **200** | `mode=live`、`verify=ipnpb.paypal.com` ✓ |
| POST /api/subscribe（非法邮箱） | **400** | 输入校验生效 |
| GET /api/membership（未登录） | **401** | 鉴权与防枚举生效 |
| POST /api/reading（空 body） | **200** | 匿名免费 3 张正常 |

## 三、代码质量与安全（亮点）
- **会员判定防伪造**：`reading/route.ts`、`membership/route.ts` 只信任已验证 session 的邮箱，绝不信任请求体里的 email，避免任意人伪造会员身份抽 premium。
- **PayPal webhook 先验证再处理**：`verifyIpn()` 先向 PayPal 回传校验，INVALID 直接丢弃；`EXPECTED_RECEIVER` 校验收款方；`PAYPAL_IPN_SKIP_VERIFY` 仅本地可用。
- **DB 写入用 service_role**：`paypal-webhook` 用 SERVICE_ROLE_KEY 绕过 RLS 写订单/订阅；anon key 只读，安全。
- **Session 校验稳健**：`getSessionUser()` 用 `getUser()` 向 Supabase 验 JWT（非信任 cookie），并带 5s 超时降级为匿名，避免冷启动卡死。
- **方案 A/B 逻辑闭环**：已购 Detailed Report（Completed）即解锁 premium 5 张牌；webhook 收到 Completed 时调用 `generateReading` 并通过 Resend 发报告，失败不影响订单入库。

## 四、发现的问题（按优先级）
| # | 级别 | 问题 | 位置 | 影响 |
|---|---|---|---|---|
| 1 | ✅已修复 | SEO 标题 em dash 乱码（`â€"` mojibake） | `src/app/layout.tsx` 三处 `title` | 搜索结果/浏览器标签显示乱码，损害品牌。已改为正确 `—` |
| 2 | P1 | 页脚死链 `/help`、`/safety` 返回 404 | `src/components/Footer.tsx` | 用户体验 + SEO 死链 |
| 3 | P2 | Lemon Squeezy webhook 只 log 不写库 | `src/app/api/webhook/route.ts` | 若用户走 Lemon 付款，会员状态不会落地解锁 |
| 4 | P2 | 重复订阅邮箱时返回 500 而非友好提示 | `src/app/api/subscribe/route.ts` | 已订阅用户再次提交会看到"Could not save"错误 |
| 5 | P2 | 邮件 HTML 未转义用户输入 | `src/lib/email.ts` | question/email 直插 HTML，存在注入风险（邮件场景危害有限） |
| 6 | P3 | 页脚订阅表单整页跳转 JSON | `src/components/Footer.tsx` | `<form action=...POST>` 提交后落到原始 JSON 响应页 |
| 7 | P3 | success 页文案与实际不符 | `src/app/success/page.tsx` | 文案称报告"48 小时内发到邮箱"，但方案 B 为即时发送（且若 Resend 未配则只入库不发信，承诺无法兑现） |

## 五、建议执行顺序
1. **立即**：修复页脚死链（移除或建 `/help`、`/safety` 页面）—— 5 分钟。
2. **近期**：`subscribe` 对唯一约束冲突返回 200/已订阅；`email.ts` 对 question 做 HTML 转义。
3. **按需**：Lemon Squeezy 若正式启用，补齐 webhook 写 `subscriptions/orders`；统一 success 文案与发信实际行为。
4. **已修复**：layout 乱码（待 commit 推送生效）。

## 六、结论
整体工程质量**良好**，安全设计（会员防伪造、webhook 验证、session 验签、超时降级）到位，线上主要页面与核心 API 均正常运转。发现的均是**小缺陷**，无阻断性 bug；除已修复的乱码外，优先处理页脚死链即可。
