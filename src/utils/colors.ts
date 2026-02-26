/**
 * 蜂神榜品牌色彩系統
 */
export const COLORS = {
  // 主色
  HIVE_GOLD:     0xFFBF00,  // 蜂神金
  TECH_CYAN:     0x00D4FF,  // 科技藍
  DEEP_BLUE:     0x1E3A8A,  // 深邃藍
  BEE_BLACK:     0x1A1A1A,  // 蜜蜂黑

  // 背景
  NIGHT_SKY:     0x0F172A,  // 夜空藍（最深）
  TEMPLE_BLUE:   0x1E3A8A,  // 殿堂藍
  HIVE_GLOW:     0xFFBF00,  // 蜂巢光（20% opacity）

  // 角色專屬
  QIANLIYAN_GOLD: 0xFFD700, // 千里眼金
  SHUNFENGER_PINK: 0xFFB6C1, // 順風耳粉
  DAJI_PURPLE:   0x8B5CF6,  // 妲己紫
  ZHOUWANG_DARK_GOLD: 0xB8860B, // 紂王暗金

  // 狀態色
  STATUS_IDLE:    0x94A3B8,  // 灰藍（閒置）
  STATUS_THINKING: 0xFBBF24, // 琥珀（思考）
  STATUS_ACTIVE:  0x22C55E,  // 綠（活躍）
  STATUS_ERROR:   0xEF4444,  // 紅（錯誤）
  STATUS_OFFLINE: 0x475569,  // 暗灰（離線）

  // UI
  UI_BG:         0x0F172A,
  UI_BORDER:     0xFFBF00,
  UI_TEXT:        0xE2E8F0,
  UI_TEXT_DIM:    0x94A3B8,
} as const;

/** CSS hex 版本 */
export const CSS_COLORS = {
  HIVE_GOLD:     '#FFBF00',
  TECH_CYAN:     '#00D4FF',
  DEEP_BLUE:     '#1E3A8A',
  NIGHT_SKY:     '#0F172A',
  BEE_BLACK:     '#1A1A1A',
} as const;
