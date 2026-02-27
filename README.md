# 🐝 蜂神榜 Agent 視覺化 Dashboard

## 專案概述

將蜂神榜 AI Agent 系統打造成一個**封神榜主題的精緻 Chibi 互動場景**，
即時呈現每個 Agent 的運作狀態、對話活動、和系統健康度。

**不只是監控面板，是一個活的封神世界。**

> **美術風格：精緻可愛 Chibi（非像素風）**
> 參考 Pixel Agents 的「Agent 狀態即時視覺化」概念，
> 但用封神榜 × 蜜蜂主題的高品質 Chibi 插畫呈現。

---

## 🎮 核心概念

### 場景：蜂神殿（The Hive Temple）

一座結合古代封神台與未來科技蜂巢的殿堂。
三層結構對應三層 Agent 架構：

```
┌─────────────────────────────────────────┐
│            【封神台・主殿】              │
│         L1 姜子牙 — 坐鎮中央             │
│         統帥全局，調度指揮               │
├────────────┬────────────────────────────┤
│  【左殿】  │        【右殿】             │
│ L2 妲己    │      L2 紂王               │
│ 情報分析   │      執行管理               │
├────────────┴────────────────────────────┤
│           【蜂巢工坊・下層】             │
│  L3 十一門徒 — 各自工位                  │
│  千里眼 順風耳 小森 小美 小義 小影        │
│  小貓 小豪 小財 小律 小扒 小摳 小遊       │
│  小明                                    │
└─────────────────────────────────────────┘
```

### 角色狀態動畫

每個 Agent 是一個像素角色（Sprite），根據即時狀態播放不同動畫：

| 狀態 | 動畫 | 說明 |
|------|------|------|
| 💤 idle | 靜止站立，偶爾眨眼 | 無活躍 session |
| 💭 thinking | 頭上冒泡泡，身體微晃 | 正在處理請求 |
| 💬 replying | 雙手快速打字 / 嘴巴動 | 正在生成回覆 |
| ⚡ active | 發光 + 忙碌動畫 | 高頻活動中 |
| ❌ error | 紅色閃爍 + 冒煙 | 出錯 / 超時 |
| 🔇 offline | 灰色 + 半透明 | 未啟用 / 離線 |

### 互動功能

- **點擊角色** → 彈出資訊卡（最近對話、使用模型、token 用量）
- **懸停角色** → 顯示名稱 + 當前狀態
- **點擊建築** → 展開該層級的詳細面板
- **右上角** → 系統總覽（總 token、總請求、運行時間）

---

## 🏗 技術架構

### 前端（展示層）

```
Tech Stack:
├── Phaser.js 3 — 2D 遊戲引擎（場景、精靈、動畫、互動）
├── TypeScript — 型別安全
├── Vite — 開發伺服器 + 打包
└── React（可選）— 用於 UI Overlay（資訊卡、設定面板）
```

**為什麼用 Phaser.js？**
- 成熟的 2D 遊戲引擎，專門處理 Sprite 動畫
- 內建 Tilemap 支援（可做地圖編輯器）
- 效能好，Canvas/WebGL 自動切換
- 大量像素遊戲案例，生態成熟

### 後端（數據層）

```
Data Flow:
├── OpenClaw Gateway API → Agent Session 狀態
├── WebSocket / SSE → 即時狀態推送
├── Hono API (bot-gateway) → Bot 活動數據
└── 本地 JSON Config → 角色設定、場景佈局
```

### 資料夾結構

```
hivemind-visualizer/
├── README.md              ← 你正在看的
├── ROADMAP.md             ← 開發路線圖
├── DESIGN.md              ← 詳細設計文件
│
├── src/
│   ├── main.ts            ← 入口
│   ├── config/
│   │   ├── agents.ts      ← Agent 定義（名稱、角色、位置）
│   │   └── scene.ts       ← 場景配置
│   │
│   ├── scenes/
│   │   ├── BootScene.ts   ← 載入資源
│   │   ├── HiveTemple.ts  ← 主場景
│   │   └── AgentDetail.ts ← Agent 詳情畫面
│   │
│   ├── sprites/
│   │   ├── AgentSprite.ts ← Agent 角色精靈類
│   │   └── effects/       ← 粒子效果（蜂巢光、科技線）
│   │
│   ├── ui/
│   │   ├── InfoCard.ts    ← 角色資訊卡
│   │   ├── StatusBar.ts   ← 頂部狀態列
│   │   └── MiniMap.ts     ← 小地圖
│   │
│   ├── data/
│   │   ├── AgentDataSource.ts  ← 數據接口
│   │   └── MockData.ts         ← 開發用假數據
│   │
│   └── utils/
│       ├── colors.ts      ← 蜂神榜品牌色
│       └── animations.ts  ← 動畫定義
│
├── assets/
│   ├── sprites/           ← 角色 Sprite Sheets
│   │   ├── jiangziya/     ← 姜子牙各狀態
│   │   ├── daji/          ← 妲己各狀態
│   │   ├── zhouwang/      ← 紂王各狀態
│   │   ├── qianliyan/     ← 千里眼各狀態
│   │   ├── shunfenger/    ← 順風耳各狀態
│   │   └── disciples/     ← 十一門徒共用模板 + 個別特徵
│   │
│   ├── tiles/             ← 場景 Tileset
│   │   ├── hive-temple.png    ← 蜂巢宮殿磚塊
│   │   └── hive-temple.json   ← Tiled 地圖檔
│   │
│   ├── effects/           ← 粒子特效
│   │   ├── honeycomb-glow.png
│   │   └── tech-circuit.png
│   │
│   └── audio/             ← 音效（可選）
│       ├── notification.mp3
│       └── ambient-hive.mp3
│
├── public/
│   └── index.html
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🐝 角色清單

### L1 — 統帥

| Agent ID | 角色名 | 定位 | 視覺風格 |
|----------|--------|------|----------|
| jiangziya | 姜子牙 | L1 總管 | 沉穩智者，金色道袍，蜂紋戰甲 |

### L2 — 護法

| Agent ID | 角色名 | 定位 | 視覺風格 |
|----------|--------|------|----------|
| daji | 妲己 | 情報分析 | 狐媚但機敏，紫紅色系 |
| zhouwang | 紂王 | 執行管理 | 威嚴霸氣，暗金色系 |

### L3 — 門徒

| Agent ID | 角色名 | 定位 | 視覺風格 |
|----------|--------|------|----------|
| qianliyan (千里眼) | 千里眼 | Telegram 行政 Bot | 金袍，第三隻眼，智慧型 |
| shunfenger (順風耳) | 順風耳 | Telegram 客服 Bot | 粉袍，大耳朵，親切型 |
| xiaosen | 小森 | 客服 Agent | 綠色系，自然風 |
| xiaomei | 小美 | 客服 Agent | 粉色系，甜美風 |
| xiaoyi | 小義 | 客服 Agent | 紅色系，正義風 |
| xiaoying | 小影 | 客服 Agent | 紫色系，神秘風 |
| xiaomao | 小貓 | 客服 Agent | 橘色系，活潑風 |
| xiaohao | 小豪 | 客服 Agent | 藍色系，豪邁風 |
| xiaocai | 小財 | 客服 Agent | 金色系，財運風 |
| xiaolv | 小律 | 客服 Agent | 深藍系，嚴謹風 |
| xiaoba | 小扒 | 客服 Agent | 棕色系，探索風 |
| xiaokou | 小摳 | 客服 Agent | 灰色系，精打細算 |
| xiaoyou | 小遊 | 體驗精算師 | 彩色系，玩樂風 |
| xiaoming | 小明 | 客服 Agent | 淡藍系，清新風 |

### 特殊

| Agent ID | 角色名 | 定位 | 視覺風格 |
|----------|--------|------|----------|
| yuanshi | 元始天尊 | 系統監控? | 白色系，超然脫俗 |
| imstudy | 讀書系統 | 學習模組 | 書卷風 |

---

## 🎨 美術風格指南

### 像素規格
- **角色尺寸**：32×32px（場景用）/ 64×64px（特寫用）
- **場景 Tile**：16×16px
- **調色盤**：限定 32 色（復古像素風）
- **動畫幀數**：每狀態 4-8 幀

### 品牌色（繼承蜂神榜設計）

```
主色：
  蜂神金  #FFBF00  — 主角色、重要元素
  科技藍  #00D4FF  — 科技效果、天眼光
  深邃藍  #1E3A8A  — 背景主色
  蜜蜂黑  #1A1A1A  — 條紋、輪廓

輔助色：
  千里眼金  #FFD700  — 千里眼專屬
  順風耳粉  #FFB6C1  — 順風耳專屬
  妲己紫    #8B5CF6  — 妲己專屬
  紂王暗金  #B8860B  — 紂王專屬
  
背景色：
  夜空藍    #0F172A  — 最深背景
  殿堂藍    #1E3A8A  — 建築主色
  蜂巢金    #FFBF00  — 蜂巢紋路（透明度 20%）
```

### Sprite Sheet 規格

每個角色一張 Sprite Sheet，包含：
```
Row 0: idle      (8 frames) — 站立、眨眼
Row 1: thinking  (8 frames) — 冒泡泡、搖晃
Row 2: typing    (6 frames) — 打字動畫
Row 3: active    (6 frames) — 發光、忙碌
Row 4: error     (4 frames) — 紅色閃爍
Row 5: offline   (2 frames) — 灰色靜止
Row 6: walk      (8 frames) — 走路（可選）
Row 7: special   (8 frames) — 特殊動畫（角色專屬）
```

---

## 📡 數據接口

### OpenClaw Session API

```typescript
interface AgentStatus {
  agentId: string;
  state: 'idle' | 'thinking' | 'replying' | 'active' | 'error' | 'offline';
  currentModel: string;
  lastActivity: number;  // timestamp
  sessionCount: number;
  todayTokens: number;
  todayRequests: number;
  currentTask?: string;  // 正在做什麼
}
```

### 數據來源規劃

**Phase 1 — Mock Data**
- 靜態 JSON 模擬所有 Agent 狀態
- 隨機切換狀態做動畫展示

**Phase 2 — OpenClaw API**
- 讀取 session list / session status
- 解析 transcript JSONL 取得活動資訊

**Phase 3 — Real-time**
- WebSocket / SSE 即時推送
- OpenClaw heartbeat 集成
- Bot-gateway webhook 事件流

---

## 🗺 部署方案

### 選項 A：94Manage 子頁面
- 作為 W8 Dashboard 的一個頁面 (`/hive-monitor`)
- 共用登入認證
- 整合到現有系統

### 選項 B：獨立靜態站
- GitHub Pages / Cloudflare Pages
- 零成本部署
- 純前端，透過 API 取數據

### 選項 C：OpenClaw Canvas
- 利用 OpenClaw 的 Canvas 功能
- 直接在 Telegram 內展示
- 適合快速預覽

**建議：Phase 1 用 B（獨立靜態站），成熟後整合到 A**

---

## 📋 版本記錄

- **v0.1** (2026-02-26) — 專案規劃，架構設計
- 設計者：姜子牙 (OpenClaw Agent)
- 委託者：陳大利 (老闆)
