/**
 * 場景配置
 */

export const SCENE_CONFIG = {
  /** 場景寬高（像素） */
  width: 1280,
  height: 720,

  /** Tile 大小 */
  tileSize: 16,

  /** 相機設定 */
  camera: {
    zoom: 2,
    minZoom: 1,
    maxZoom: 4,
  },

  /** 背景色 */
  bgColor: 0x0F172A,
} as const;

/** 場景區域定義 */
export const ZONES = {
  /** L1 主殿（頂部中央） */
  throne: {
    x: 560, y: 80,
    width: 160, height: 120,
    label: '封神台・主殿',
  },

  /** L2 左殿（妲己） */
  leftHall: {
    x: 240, y: 200,
    width: 160, height: 120,
    label: '情報殿',
  },

  /** L2 右殿（紂王） */
  rightHall: {
    x: 880, y: 200,
    width: 160, height: 120,
    label: '執行殿',
  },

  /** L3 蜂巢工坊（底部大區） */
  hiveWorkshop: {
    x: 80, y: 400,
    width: 1120, height: 280,
    label: '蜂巢工坊',
  },
} as const;
