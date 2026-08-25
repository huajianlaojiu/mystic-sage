# MysticSage 上线缺陷修复清单

- [x] 已核验仓库说明、当前迁移状态和商品配置；未扩展修复范围。
- [ ] 已新增 `004_harden_access_and_rate_limits.sql`；仍需在 Supabase SQL Editor 执行后，权限和匿名日限额才会实际生效。
- [x] 已移除首页、About、服务页和帮助页中不可证实的解读量、评分、读者、满意度、评价及未实现服务承诺。
- [x] 已统一为 $4.99 单次 10 卡报告与 $19/月 Mystic Plus；已删除未实现商品、权益及冲突文案。
- [ ] 已实现请求格式/500 字符上限和服务端匿名日额度代码；仍需执行 `004` 迁移以启用数据库额度函数。
- [x] 已添加 CSP、X-Frame-Options、X-Content-Type-Options、Referrer-Policy、Permissions-Policy 和 HSTS，并以本地生产服务验证响应头。
- [ ] 生产构建已通过，超长问题返回 HTTP 400；全量 lint 仍有 26 errors / 5 warnings（均未纳入本轮 P0/P1 范围），数据库迁移与 PayPal 沙箱端到端测试仍待完成。
- [x] 已整理变更、验证证据和待执行的后台步骤。
