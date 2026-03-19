# AI 塔罗/星座网站 MVP 需求文档

> 版本：v1.0 | 日期：2026-03-19 | 作者：陈照明 | 状态：待开发

---

## 一、项目概述

### 1.1 产品名称
暂定：**AstraTarot**（或 Astro-Tarot-Realm）

### 1.2 产品定位
面向欧美个人用户的 AI 驱动塔罗牌解读 + 星座运势网站。
核心价值主张：**免费、即时、个性化的 AI 占卜体验**，无需注册即可使用，订阅解锁深度功能。

### 1.3 目标用户
- 年龄：18-35 岁
- 性别：以女性为主（占 70%+）
- 地区：美国、英国、澳大利亚、加拿大
- 特征：对占星/塔罗感兴趣，习惯使用手机，有一定付费意愿

### 1.4 核心需求词（SEO 定位）

| 类型 | 关键词 | 月搜索量 |
|---|---|---|
| 主词 | free tarot reading | 450K |
| 主词 | daily horoscope | 1M+ |
| 主词 | free birth chart | 300K |
| 蓝海词 | ai tarot reading | 40K |
| 蓝海词 | ai astrology | 35K |
| 功能词 | yes or no tarot | 110K |
| 功能词 | zodiac compatibility | 200K |

### 1.5 商业模式
- 免费功能：每日限次使用（引流）
- 付费订阅：$6.99/月，解锁无限次 + 高级功能
- 目标：上线 3 个月内达到 100 个付费用户（月收入约 $700）

---

## 二、竞品参考

| 竞品 | 优点 | 缺点 | 我们的差异化 |
|---|---|---|---|
| Co-Star | 月活 1500 万，品牌强 | 纯 App，不做塔罗，无网页工具 | 网页优先 + 塔罗×星座融合 |
| Tarotoo.com | 免费 AI 塔罗，有动画 | 无星盘，变现弱，无对话功能 | 订阅制 + AI 对话追问 |
| Mysticsense | 真人灵媒，信任度高 | 贵（$1-10/分钟），非 AI | AI 替代，成本低 100 倍 |

---

## 三、功能规划

### 3.1 MVP 功能范围（Phase 1，目标 2 周上线）

#### F1：每日塔罗（Daily Tarot）
- 页面展示一组背面朝上的牌（3张可选位置）
- 用户点击任意一张，触发翻牌动画
- AI 生成今日解读（200字以内，英文）
- 未登录用户每天 3 次，Pro 用户无限次

#### F2：Yes/No 塔罗（Yes or No Tarot）
- 用户输入问题（最多 100 字）
- 随机抽 1 张牌，正位=Yes，逆位=No
- 独立落地页 `/yes-no-tarot`（SEO专页）
- 结果页有"分享到 Twitter"按钮

#### F3：星座日运（Daily Horoscope）
- 12 个星座图标选择器
- AI 生成三维度运势：💕 Love / 💼 Career / 💰 Money
- 同一星座同一天缓存，节省 API 成本

#### F4：用户注册/登录
- 邮箱 Magic Link 登录（无需密码）
- Supabase Auth 接入

### 3.2 Phase 2 功能（上线后 2-4 周）
- F5：三牌阵解读（Past/Present/Future）— 付费转化核心钩子
- F6：出生星盘（Birth Chart）— 订阅核心高价值功能
- F7：星座配对（Zodiac Compatibility）— 高病毒传播
- F8：Stripe 订阅付费（$6.99/月）

### 3.3 Phase 3 功能（第 5-8 周）
- F9：AI 对话追问 — 与 Tarotoo 最大差异化
- F10：每日邮件推送（Resend，免费 3000 封/月）

---

## 四、页面结构

```
/                    首页
/tarot               每日塔罗
/yes-no-tarot        Yes/No 塔罗（SEO专页）
/horoscope           星座日运
/horoscope/[sign]    各星座独立页（12个）
/birth-chart         出生星盘（Phase 2）
/compatibility       星座配对（Phase 2）
/pricing             订阅定价页
/login               登录/注册
/dashboard           用户中心
/blog                SEO 博客
/privacy             隐私政策（必须）
/terms               服务条款（必须）
```

---

## 五、技术选型

| 模块 | 技术方案 | 费用 |
|---|---|---|
| 前端框架 | Next.js 14（App Router） | 免费 |
| 样式 | Tailwind CSS | 免费 |
| AI 接口 | 冷启动：Gemini 2.0 Flash → 成长期：DeepSeek V3 | $0 → ~$15/月 |
| 数据库 | Supabase（PostgreSQL） | 免费额度够用 |
| 用户系统 | Supabase Auth | 免费 |
| 支付 | Stripe Checkout | 2.9%+$0.30/笔 |
| 部署 | Vercel | 免费 |
| 邮件 | Resend | 免费 3000 封/月 |
| 域名 | Namecheap | $12/年 |
| 塔罗牌图片 | Rider-Waite 开源牌组 | 免费 |

**总启动成本：约 $32**

---

## 六、AI Prompt 设计

### 每日塔罗解读
```
You are a wise and mystical tarot reader with decades of experience.
A user has drawn the [CARD_NAME] card ([UPRIGHT/REVERSED]) for their daily reading.
Provide: 1) Overall energy (2-3 sentences) 2) Key message (1-2 sentences) 3) One-line affirmation
Tone: warm, mystical, empowering. Under 200 words. Do NOT mention you are an AI.
```

### Yes/No 塔罗
```
You are a tarot reader. The user asked: "[USER_QUESTION]"
They drew [CARD_NAME] ([UPRIGHT/REVERSED]). Answer = [Yes/No]
1. Start with clear Yes/No 2. 2-sentence explanation 3. Gentle advice
Under 80 words. Tone: direct but compassionate.
```

### 星座日运
```
You are an expert astrologer. Generate today's horoscope for [ZODIAC_SIGN].
Return JSON: { love: {text, stars}, career: {text, stars}, money: {text, stars} }
Each 50 words, stars 1-5. Date: [TODAY_DATE]. Be specific, not generic.
```

---

## 七、UI 设计规范

| 用途 | 颜色 |
|---|---|
| 主背景 | #0D0D1A（深夜蓝黑） |
| 卡片背景 | #1A1A2E（深紫蓝） |
| 主色调 | #9B59B6（神秘紫） |
| 强调色 | #F39C12（金色） |
| 文字主色 | #E8E8F0（浅白） |
| 文字次色 | #A0A0C0（灰紫） |

- 标题字体：Cinzel（衬线，神秘感）
- 正文字体：Inter（清晰易读）
- 翻牌动画：CSS 3D flip，0.6s 过渡
- 背景：星空粒子效果（tsParticles）

---

## 八、SEO 策略

### 核心页面 Meta
- 首页 Title: `Free AI Tarot Reading & Astrology | AstraTarot`
- Yes/No 页 Title: `Yes or No Tarot - Free Instant Answer | AstraTarot`
- 星座页 Title: `[Sign] Daily Horoscope Today | AstraTarot`

### 博客内容计划（每周 2 篇）

| 文章标题 | 目标关键词 | 月搜索量 |
|---|---|---|
| What Does the Death Tarot Card Really Mean? | death tarot card meaning | 50K |
| Mercury Retrograde 2026: Dates and What to Expect | mercury retrograde 2026 | 季节性暴涨 |
| The Most Compatible Zodiac Signs | zodiac compatibility chart | 80K |
| How to Read Your Birth Chart for Beginners | how to read birth chart | 40K |
| What Is My Rising Sign? | what is my rising sign | 90K |
| Aries Daily Horoscope: What the Stars Say Today | aries daily horoscope | 200K |

---

## 九、上线推广计划

### 上线第一天
- Product Hunt 发布（美东时间 00:01，周二/三）
- 提交 20+ AI 工具导航站（There's An AI For That / Futurepedia / TopAI.tools）
- Reddit 发帖：r/tarot（200万）/ r/astrology（150万）/ r/SideProject

### 持续增长
- TikTok/Instagram：每天发"今日塔罗解读"短视频
- 邮件列表：每个注册用户发每日运势
- SEO 博客：每周 2 篇长尾词文章

---

## 十、成功指标（KPI）

| 阶段 | 时间 | 目标 |
|---|---|---|
| MVP 上线 | 第 2 周 | 网站可访问，3 个核心功能可用 |
| 早期验证 | 第 4 周 | 1000 个注册用户，次日留存 > 30% |
| 首次变现 | 第 6 周 | 第一个付费用户 |
| 初步盈利 | 第 8 周 | 100 个付费用户，月收入 $700 |
| 稳定增长 | 第 3 个月 | 500 个付费用户，月收入 $3500 |
| SEO 红利 | 第 6 个月 | 自然流量 > 50%，月收入 $8000+ |

---

## 十一、风险与应对

| 风险 | 概率 | 应对方案 |
|---|---|---|
| API 成本超预期 | 中 | 对同一星座/牌的解读做缓存 |
| 用户不付费 | 高 | 强化付费功能价值，优化 Paywall |
| SEO 排名慢 | 高 | 同步做 TikTok 内容引流 |
| Stripe 收款被拒 | 中 | 提前准备护照、境外银行卡、隐私政策 |

---

## 十二、开发里程碑

```
Day 1      注册账号（Vercel/Supabase/OpenAI/Stripe/GitHub）+ 买域名
Day 2-3    搭建基础页面框架（Next.js + Tailwind）
Day 4-5    实现 F1：每日塔罗
Day 6      实现 F2：Yes/No 塔罗
Day 7-8    实现 F3：星座日运
Day 9-10   实现 F4：用户注册/登录（Supabase Auth）
Day 11-12  接入 Stripe 订阅支付
Day 13     SEO Meta 标签、隐私政策、服务条款页面
Day 14     全面测试（手机端、支付流程、API 限流）
Day 15     🚀 上线 + Product Hunt 发布
Day 16+    收集反馈，开始 Phase 2 开发
```

---

*文档持续更新，以实际开发进展为准。*
*飞书原文档：https://feishu.cn/docx/D0GKdJIlQobkvMx3fmGc4iwEn9d*
