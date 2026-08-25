# MysticSage 上线就绪报告（2026-08-25）

> 站点：https://mysticsages.com ｜ 仓库：huajianlaojiu/mystic-sage ｜ Supabase：sqwexehmjejfyaknisen
> 目标用户：海外（非中国），文案全英文；Stripe 未启用，仅 PayPal 收款。

## 结论

**可直接上线运营。** 代码链路、支付、GA4、SEO、可访问性全部就绪。第一笔真实用户付款即最终验收。

---

## 一、已修复的 P0 前端 Bug（3 项，已部署）

| Bug | 根因 | 修复 | Commit |
|---|---|---|---|
| 分享卡片牌名重叠 | `shareCard.ts` 牌名固定 30px 不换行，长牌名（如 "Ace of Cups (Reversed)"）溢出 190px 卡片 | 新增 `drawCardName()`：`measureText` 自动换行 + 缩字号（28px 起、最小 14px、最多 2 行） | `2326f86` |
| 限额时 PayPal 按钮重复 | 初始表单块 `!result && !loading` 与错误块 `error` 非互斥，二者同时渲染各带一套按钮 | 初始块条件加 `&& !error` | `2326f86` |
| "Try Again" 无意义 | 限额错误重试仍失败 | 用 `isQuota`（匹配 `/free reading for today/i`）区分：配额错误隐藏 Try Again 并引导登录/升级；网络错误才保留 | `2326f86` |

## 二、PayPal 英文结账（lc=US，已部署）

- 两个 PayPal 按钮（\$4.99 报告 / \$19 订阅）均加 `<input name="lc" value="US">` → 海外用户跳英文结账页。`Commit 58dc3de`

## 三、支付链路代码侧核对（逐行确认正确）

```
付款 → PayPal IPN → 验真(cmd=_notify-validate) → receiver_email 校验
     → subscriptions(status=active) / orders(status=Completed) 落库
     → getMembership 读同字段 → member=true → 页面显示会员 + 触发 $4.99 报告邮件
```

- 表字段一一对应：`subscriptions(paypal_subscr_id/email/plan_name/amount/currency/status)`、`orders(paypal_txn_id/email/item_name/amount/currency/status)`（见 `supabase/migrations/002_create_subscriptions_orders.sql`）。
- RLS 已允 anon SELECT/INSERT；webhook 用 service_role 绕过，双保险。
- `member` 在「有效订阅」或「Completed 的 Detailed Report 订单」任一成立时翻转；查询已加 5s 超时降级。
- 线上探测 `GET /api/paypal-webhook` → `{"mode":"live","verify":"https://ipnpb.paypal.com/...","skipVerify":false}`：函数存活、生产模式、真实验签开启。

**变量一致性（关键）**：按钮 `NEXT_PUBLIC_PAYPAL_BUSINESS_EMAIL` 与 webhook `PAYPAL_BUSINESS_EMAIL` 必须填同一收款邮箱（均缺省 `mountain0342@gmail.com`）。已确认对齐无虞。

## 四、PayPal 账户侧状态（用户后台操作，非代码问题）

| 环节 | 状态 |
|---|---|
| Business / Live / 收款权限 | ✅ 已验证 |
| IPN 生产配置 | ✅ 已配（通知 URL = `https://mysticsages.com/api/paypal-webhook`，消息发送已启用；按钮 `notify_url` 为冗余双保险） |
| 真实扣款 | ⏳ 未验证（首笔真实订单验收） |
| 提现到工行 | ⏳ SWIFT 分支码补全（**不阻塞上线**：SWIFT 只影响"余额提现到银行"，不影响"收款进 PayPal 余额"） |

> 纠正记录：早期误判"SWIFT 阻塞收款""需去开启 IPN"均已纠正——IPN 已配、SWIFT 仅影响提现。勿重复。

## 五、上线前检查（4 项全绿）

| 检查项 | 结果 | 证据 |
|---|---|---|
| GA4 事件 | ✅ | 线上加载 `G-24XKR10DXE`；`begin_checkout`(\$4.99/\$19)、`reading_completed`、`sign_up` 已埋；`setConsent→gtagConsent` 同意流正确（GDPR 合规） |
| robots.txt | ✅ 200 | `Allow: /` + `Sitemap:` 指向 sitemap.xml |
| sitemap.xml | ✅ 200 | 列出 60+ 页面（首页/reading/pricing/about/blog×18/cards×22/contact/faq/help/safety/refund 等） |
| 页面可访问性 | ✅ | sitemap 全部路由 + `/auth/register` + `/auth/login` 均 200；无死链 |

## 六、/login 重定向（已部署）

- `next.config.ts` 加 `redirects()`：`/login` → `/auth/login`（`permanent: true`，线上 308）。
- 验证：`GET /login` → 308 `Location:/auth/login` → 跟随落地 `/auth/login` 200。`Commit a76f0c9`

## 七、待办（不阻塞上线）

1. **首笔真实付款验收**：自付 \$4.99 测 `web_accept` → orders 落库 + 收报告邮件；付 \$19 测 `subscr_signup/payment` → subscriptions 落库 + 页面显示 Mystic Plus active。
2. **工行提现 SWIFT 补全**（有空再做）：开户支行 11 位 SWIFT，工行柜台/App 可查；或改用 Payoneer/万里汇美区美元账户收款。
3. **上线后第一周盯指标**：GA4 实时确认 `begin_checkout` / `reading_completed` 事件真在进数据；首单转化漏斗。

## 八、本次涉及 Commit（已 push origin/main）

- `2326f86` fix(reading): resolve 3 P0 UI bugs on reading page
- `58dc3de` fix(reading): set PayPal checkout locale to US (lc=US)
- `a76f0c9` fix: add 301 redirect /login -> /auth/login
