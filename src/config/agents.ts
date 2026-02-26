/**
 * Agent 定義與層級架構
 */

export type AgentTier = 'L1' | 'L2' | 'L3' | 'special';
export type AgentState = 'idle' | 'thinking' | 'replying' | 'active' | 'error' | 'offline';

export interface AgentDef {
  id: string;
  name: string;         // 中文名
  nameEn: string;       // 英文名（顯示用）
  tier: AgentTier;
  role: string;         // 職責描述
  color: number;        // 專屬色（hex）
  emoji: string;        // 代表 emoji
  position?: { x: number; y: number }; // 場景位置（tile 座標）
}

export const AGENTS: AgentDef[] = [
  // L1 — 統帥
  {
    id: 'jiangziya',
    name: '姜子牙',
    nameEn: 'Jiang Ziya',
    tier: 'L1',
    role: '蜂神榜 L1 總管',
    color: 0xFFBF00,
    emoji: '🕯️',
  },

  // L2 — 護法
  {
    id: 'daji',
    name: '妲己',
    nameEn: 'Daji',
    tier: 'L2',
    role: '情報分析',
    color: 0x8B5CF6,
    emoji: '🦊',
  },
  {
    id: 'zhouwang',
    name: '紂王',
    nameEn: 'Zhou Wang',
    tier: 'L2',
    role: '執行管理',
    color: 0xB8860B,
    emoji: '👑',
  },

  // L3 — 門徒（Telegram Bots）
  {
    id: 'qianliyan',
    name: '千里眼',
    nameEn: 'Qianliyan',
    tier: 'L3',
    role: 'Telegram 行政 Bot (@cram94_bot)',
    color: 0xFFD700,
    emoji: '👁️',
  },
  {
    id: 'shunfenger',
    name: '順風耳',
    nameEn: "Shunfeng'er",
    tier: 'L3',
    role: 'Telegram 客服 Bot (@Cram94_VIP_bot)',
    color: 0xFFB6C1,
    emoji: '👂',
  },

  // L3 — 門徒（客服 Agents）
  {
    id: 'xiaosen',
    name: '小森',
    nameEn: 'Xiaosen',
    tier: 'L3',
    role: '客服 Agent',
    color: 0x22C55E,
    emoji: '🌲',
  },
  {
    id: 'xiaomei',
    name: '小美',
    nameEn: 'Xiaomei',
    tier: 'L3',
    role: '客服 Agent',
    color: 0xEC4899,
    emoji: '🌸',
  },
  {
    id: 'xiaoyi',
    name: '小義',
    nameEn: 'Xiaoyi',
    tier: 'L3',
    role: '客服 Agent',
    color: 0xDC2626,
    emoji: '⚔️',
  },
  {
    id: 'xiaoying',
    name: '小影',
    nameEn: 'Xiaoying',
    tier: 'L3',
    role: '客服 Agent',
    color: 0x7C3AED,
    emoji: '🌙',
  },
  {
    id: 'xiaomao',
    name: '小貓',
    nameEn: 'Xiaomao',
    tier: 'L3',
    role: '客服 Agent',
    color: 0xF97316,
    emoji: '🐱',
  },
  {
    id: 'xiaohao',
    name: '小豪',
    nameEn: 'Xiaohao',
    tier: 'L3',
    role: '客服 Agent',
    color: 0x3B82F6,
    emoji: '💪',
  },
  {
    id: 'xiaocai',
    name: '小財',
    nameEn: 'Xiaocai',
    tier: 'L3',
    role: '客服 Agent',
    color: 0xEAB308,
    emoji: '💰',
  },
  {
    id: 'xiaolv',
    name: '小律',
    nameEn: 'Xiaolv',
    tier: 'L3',
    role: '客服 Agent',
    color: 0x1E40AF,
    emoji: '⚖️',
  },
  {
    id: 'xiaoba',
    name: '小扒',
    nameEn: 'Xiaoba',
    tier: 'L3',
    role: '客服 Agent',
    color: 0x92400E,
    emoji: '🔍',
  },
  {
    id: 'xiaokou',
    name: '小摳',
    nameEn: 'Xiaokou',
    tier: 'L3',
    role: '客服 Agent',
    color: 0x6B7280,
    emoji: '🧮',
  },
  {
    id: 'xiaoyou',
    name: '小遊',
    nameEn: 'Xiaoyou',
    tier: 'L3',
    role: '體驗精算師',
    color: 0x06B6D4,
    emoji: '🎮',
  },
  {
    id: 'xiaoming',
    name: '小明',
    nameEn: 'Xiaoming',
    tier: 'L3',
    role: '客服 Agent',
    color: 0x38BDF8,
    emoji: '💡',
  },

  // Special
  {
    id: 'yuanshi',
    name: '元始天尊',
    nameEn: 'Yuanshi Tianzun',
    tier: 'special',
    role: '系統監控',
    color: 0xF8FAFC,
    emoji: '☁️',
  },
];

/** 依 tier 分組 */
export const AGENTS_BY_TIER = {
  L1: AGENTS.filter(a => a.tier === 'L1'),
  L2: AGENTS.filter(a => a.tier === 'L2'),
  L3: AGENTS.filter(a => a.tier === 'L3'),
  special: AGENTS.filter(a => a.tier === 'special'),
};

/** 依 ID 索引 */
export const AGENT_MAP = new Map(AGENTS.map(a => [a.id, a]));
