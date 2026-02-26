import Phaser from 'phaser';
import { COLORS } from '../utils/colors';
import { SCENE_CONFIG } from '../config/scene';

/**
 * BootScene — 載入資源 + 顯示 Loading 畫面
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x1E3A8A, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 15, 320, 30, 6);

    const loadingText = this.add.text(width / 2, height / 2 - 40, '蜂神殿載入中...', {
      fontFamily: '"Noto Sans TC", sans-serif',
      fontSize: '16px',
      color: '#FFBF00',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(COLORS.HIVE_GOLD, 1);
      progressBar.fillRoundedRect(width / 2 - 155, height / 2 - 10, 310 * value, 20, 4);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // 在這裡載入素材（Phase 1 先用程式生成的佔位圖）
    this.generatePlaceholderAssets();
  }

  create(): void {
    this.scene.start('HiveTemple');
  }

  /**
   * 程式生成佔位用 Sprite（不需要外部圖檔）
   */
  private generatePlaceholderAssets(): void {
    // 生成 Agent 佔位精靈（32x32 色塊 + 表情）
    this.createAgentPlaceholder('agent-placeholder', COLORS.HIVE_GOLD);

    // 生成蜂巢 tile
    this.createHoneycombTile();
  }

  private createAgentPlaceholder(key: string, color: number): void {
    const size = 32;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // 身體（圓角矩形）
    ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
    ctx.beginPath();
    ctx.roundRect(4, 8, 24, 20, 4);
    ctx.fill();

    // 頭
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath();
    ctx.arc(16, 10, 8, 0, Math.PI * 2);
    ctx.fill();

    // 眼睛
    ctx.fillStyle = '#1A1A1A';
    ctx.beginPath();
    ctx.arc(13, 9, 2, 0, Math.PI * 2);
    ctx.arc(19, 9, 2, 0, Math.PI * 2);
    ctx.fill();

    this.textures.addCanvas(key, canvas);
  }

  private createHoneycombTile(): void {
    const size = 16;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // 深藍背景
    ctx.fillStyle = '#1E3A8A';
    ctx.fillRect(0, 0, size, size);

    // 蜂巢六角形線條
    ctx.strokeStyle = 'rgba(255, 191, 0, 0.15)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    const cx = size / 2, cy = size / 2, r = 7;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    this.textures.addCanvas('tile-honeycomb', canvas);
  }
}
