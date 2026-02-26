import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { HiveTemple } from './scenes/HiveTemple';
import { SCENE_CONFIG } from './config/scene';

/**
 * 蜂神殿 — HiveMind Agent Visualizer
 * 
 * 蜂神榜 AI Agent 系統的即時視覺化監控面板
 * 封神榜主題 × 像素風 × 蜂巢設計
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: SCENE_CONFIG.width,
  height: SCENE_CONFIG.height,
  backgroundColor: `#${SCENE_CONFIG.bgColor.toString(16).padStart(6, '0')}`,
  scene: [BootScene, HiveTemple],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: false, // Phase 1 用平滑渲染；之後改 true 做像素風
    antialias: true,
  },
};

// 啟動遊戲
new Phaser.Game(config);

console.log('🐝 蜂神殿啟動！');
