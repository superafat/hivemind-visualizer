import Phaser from 'phaser';
import { COLORS } from '../utils/colors';
import { SCENE_CONFIG, ZONES } from '../config/scene';
import { AGENTS, AGENTS_BY_TIER, type AgentDef, type AgentState } from '../config/agents';

/**
 * Agent 場景精靈 — 帶狀態動畫與互動
 */
interface AgentSprite {
  def: AgentDef;
  container: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Graphics;
  bodyImage?: Phaser.GameObjects.Image; // Chibi 圖片
  nameText: Phaser.GameObjects.Text;
  statusBubble: Phaser.GameObjects.Graphics;
  statusIcon: Phaser.GameObjects.Text;
  state: AgentState;
  animTimer: number;
  // 走動系統相關屬性
  startX: number;
  startY: number;
  targetX?: number;
  targetY?: number;
  isMoving: boolean;
  moveSpeed: number; // 像素/秒
  moveTween?: Phaser.Tweens.Tween;
  walkTween?: Phaser.Tweens.Tween;
  moveTimer?: Phaser.Time.TimerEvent;
}

// 根據 tier 設定速度（像素/秒）
const TIER_SPEEDS: Record<string, number> = {
  'L1': 80,   // L1 走得慢，穩重
  'L2': 100,  // L2 中等速度
  'L3': 120,  // L3 走得快，勤勞
  'special': 60, // 元始天尊最慢，漂浮感
};

// 移動間隔時間（毫秒）
const MOVE_INTERVAL_MIN = 5000;
const MOVE_INTERVAL_MAX = 12000;

/**
 * HiveTemple — 蜂神殿主場景
 */
export class HiveTemple extends Phaser.Scene {
  private agentSprites: Map<string, AgentSprite> = new Map();
  private agentImages: Map<string, Phaser.GameObjects.Image> = new Map();
  private infoPanel?: Phaser.GameObjects.Container;
  private titleText!: Phaser.GameObjects.Text;
  private statusBarBg!: Phaser.GameObjects.Graphics;

  preload(): void {
    // 載入 Chibi 角色圖片
    this.load.image('jiangziya', 'src/assets/sprites/jiangziya.png');
    this.load.image('daji', 'src/assets/sprites/daji.png');
    this.load.image('kingzhou', 'src/assets/sprites/kingzhou.png');
    this.load.image('qianliyan', 'src/assets/sprites/qianliyan.png');
    this.load.image('shunfenger', 'src/assets/sprites/shunfenger.png');
  }

  constructor() {
    super({ key: 'HiveTemple' });
  }

  create(): void {
    const { width, height } = SCENE_CONFIG;

    // === 背景 ===
    this.drawBackground(width, height);

    // === 區域標示 ===
    this.drawZones();

    // === 連接線（L1 → L2 → L3） ===
    this.drawConnectionLines();

    // === 放置 Agent 角色 ===
    this.placeAgents();

    // === 頂部狀態列 ===
    this.createStatusBar(width);

    // === 滑鼠滾輪縮放 ===
    this.input.on("pointerwheel", (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) => {
      const zoomChange = deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Phaser.Math.Clamp(this.cameras.main.zoom + zoomChange, SCENE_CONFIG.camera.minZoom, SCENE_CONFIG.camera.maxZoom);
      this.cameras.main.setZoom(newZoom);
    });

    // === 拖曳移動 (右鍵拖曳) ===
    let dragStart: Phaser.Math.Vector2 | null = null;
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        dragStart = new Phaser.Math.Vector2(pointer.x, pointer.y);
      }
    });
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (dragStart && pointer.rightButtonDown()) {
        const cam = this.cameras.main;
        cam.scrollX -= (pointer.x - dragStart.x) / cam.zoom;
        cam.scrollY -= (pointer.y - dragStart.y) / cam.zoom;
        dragStart.set(pointer.x, pointer.y);
      }
    });
    this.input.on("pointerup", () => { dragStart = null; });

    // === 定時更新模擬狀態 ===
    this.time.addEvent({
      delay: 3000,
      callback: this.randomizeStates,
      callbackScope: this,
      loop: true,
    });

    // === 漂浮粒子 ===
    this.createFloatingParticles(width, height);

    // === 啟動走動系統 ===
    this.startMovementSystem();
  }

  // ─── 背景 ───

  private drawBackground(w: number, h: number): void {
    // 漸變背景
    const bg = this.add.graphics();
    bg.fillGradientStyle(
      COLORS.NIGHT_SKY, COLORS.NIGHT_SKY,
      COLORS.DEEP_BLUE, COLORS.DEEP_BLUE,
      1
    );
    bg.fillRect(0, 0, w, h);

    // 蜂巢網格
    const grid = this.add.graphics();
    grid.lineStyle(0.5, COLORS.HIVE_GOLD, 0.08);

    const hexR = 24;
    const hexW = hexR * Math.sqrt(3);
    const hexH = hexR * 2;

    for (let row = -1; row < h / (hexH * 0.75) + 1; row++) {
      for (let col = -1; col < w / hexW + 1; col++) {
        const cx = col * hexW + (row % 2 ? hexW / 2 : 0);
        const cy = row * hexH * 0.75;
        this.drawHexagon(grid, cx, cy, hexR);
      }
    }
  }

  private drawHexagon(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number): void {
    g.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.strokePath();
  }

  // ─── 區域 ───

  private drawZones(): void {
    Object.values(ZONES).forEach(zone => {
      const g = this.add.graphics();
      // 區域背景
      g.fillStyle(COLORS.DEEP_BLUE, 0.3);
      g.fillRoundedRect(zone.x, zone.y, zone.width, zone.height, 8);
      // 邊框
      g.lineStyle(1, COLORS.HIVE_GOLD, 0.4);
      g.strokeRoundedRect(zone.x, zone.y, zone.width, zone.height, 8);

      // 標籤
      this.add.text(zone.x + zone.width / 2, zone.y + 12, zone.label, {
        fontFamily: '"Noto Sans TC", sans-serif',
        fontSize: '11px',
        color: '#FFBF00',
      }).setOrigin(0.5).setAlpha(0.7);
    });
  }

  // ─── 連接線 ───

  private drawConnectionLines(): void {
    const lines = this.add.graphics();
    lines.lineStyle(1.5, COLORS.TECH_CYAN, 0.25);

    // L1 → L2 左
    lines.lineBetween(
      ZONES.throne.x + ZONES.throne.width / 2,
      ZONES.throne.y + ZONES.throne.height,
      ZONES.leftHall.x + ZONES.leftHall.width / 2,
      ZONES.leftHall.y
    );

    // L1 → L2 右
    lines.lineBetween(
      ZONES.throne.x + ZONES.throne.width / 2,
      ZONES.throne.y + ZONES.throne.height,
      ZONES.rightHall.x + ZONES.rightHall.width / 2,
      ZONES.rightHall.y
    );

    // L2 → L3
    lines.lineBetween(
      ZONES.leftHall.x + ZONES.leftHall.width / 2,
      ZONES.leftHall.y + ZONES.leftHall.height,
      ZONES.hiveWorkshop.x + ZONES.hiveWorkshop.width * 0.3,
      ZONES.hiveWorkshop.y
    );
    lines.lineBetween(
      ZONES.rightHall.x + ZONES.rightHall.width / 2,
      ZONES.rightHall.y + ZONES.rightHall.height,
      ZONES.hiveWorkshop.x + ZONES.hiveWorkshop.width * 0.7,
      ZONES.hiveWorkshop.y
    );
  }

  // ─── Agent 放置 ───

  private placeAgents(): void {
    // L1
    this.createAgent(AGENTS_BY_TIER.L1[0], ZONES.throne.x + ZONES.throne.width / 2, ZONES.throne.y + 70);

    // L2
    if (AGENTS_BY_TIER.L2[0]) {
      this.createAgent(AGENTS_BY_TIER.L2[0], ZONES.leftHall.x + ZONES.leftHall.width / 2, ZONES.leftHall.y + 70);
    }
    if (AGENTS_BY_TIER.L2[1]) {
      this.createAgent(AGENTS_BY_TIER.L2[1], ZONES.rightHall.x + ZONES.rightHall.width / 2, ZONES.rightHall.y + 70);
    }

    // L3
    const l3Agents = AGENTS_BY_TIER.L3;
    const workshopZone = ZONES.hiveWorkshop;
    const cols = Math.min(7, l3Agents.length);
    const rows = Math.ceil(l3Agents.length / cols);
    const spacingX = workshopZone.width / (cols + 1);
    const spacingY = workshopZone.height / (rows + 1);

    l3Agents.forEach((agent, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = workshopZone.x + spacingX * (col + 1);
      const y = workshopZone.y + spacingY * (row + 1);
      this.createAgent(agent, x, y);
    });

    // Special (元始天尊 — 右上角浮空)
    AGENTS_BY_TIER.special.forEach((agent, i) => {
      this.createAgent(agent, SCENE_CONFIG.width - 80, 60 + i * 60);
    });
  }

  private createAgent(def: AgentDef, x: number, y: number): void {
    const container = this.add.container(x, y);

    // Agent ID 到 Chibi 圖片鍵名的映射
    const spriteKeyMap: Record<string, string> = {
      'jiangziya': 'jiangziya',
      'daji': 'daji',
      'zhouwang': 'kingzhou',
      'qianliyan': 'qianliyan',
      'shunfenger': 'shunfenger',
    };

    // 角色本體：優先使用 Chibi 圖片，否則用程式繪製
    let bodyImage: Phaser.GameObjects.Image | undefined;
    let body: Phaser.GameObjects.Graphics;
    const spriteKey = spriteKeyMap[def.id];
    
    if (spriteKey && this.textures.exists(spriteKey)) {
      // 使用 Chibi 圖片
      bodyImage = this.add.image(0, 0, spriteKey);
      bodyImage.setScale(0.35);
      body = this.add.graphics(); // 建立一個空的 graphics 作為 body 介面
    } else {
      // 回退到程式繪製
      body = this.add.graphics();
      this.drawAgentBody(body, def, 'idle');
    }

    // 名稱
    const nameText = this.add.text(0, 22, def.emoji + ' ' + def.name, {
      fontFamily: '"Noto Sans TC", sans-serif',
      fontSize: '10px',
      color: '#E2E8F0',
      stroke: '#0F172A',
      strokeThickness: 2,
    }).setOrigin(0.5);

    // 狀態氣泡
    const statusBubble = this.add.graphics();
    const statusIcon = this.add.text(0, -26, '', {
      fontSize: '12px',
    }).setOrigin(0.5);

    // 將所有元素加入 container
    if (bodyImage) {
      container.add([bodyImage, body, nameText, statusBubble, statusIcon]);
    } else {
      container.add([body, nameText, statusBubble, statusIcon]);
    }

    // 互動
    const hitArea = new Phaser.Geom.Circle(0, 0, 20);
    container.setInteractive(hitArea, Phaser.Geom.Circle.Contains);

    container.on('pointerover', () => {
      if (bodyImage) {
        bodyImage.setScale(0.42);
      } else {
        body.setScale(1.15);
      }
      this.showTooltip(def, x, y);
    });

    container.on('pointerout', () => {
      if (bodyImage) {
        bodyImage.setScale(0.35);
      } else {
        body.setScale(1.0);
      }
      this.hideTooltip();
    });

    container.on('pointerdown', () => {
      this.showInfoPanel(def);
    });

    const sprite: AgentSprite = {
      def,
      container,
      body,
      bodyImage,
      nameText,
      statusBubble,
      statusIcon,
      state: 'idle',
      animTimer: 0,
      startX: x,
      startY: y,
      isMoving: false,
      moveSpeed: TIER_SPEEDS[def.tier] || 100,
    };

    this.agentSprites.set(def.id, sprite);
    this.updateAgentVisual(sprite);
  }

  // ─── Agent 繪製 ───

  private drawAgentBody(g: Phaser.GameObjects.Graphics, def: AgentDef, _state: AgentState): void {
    g.clear();

    const color = def.color;
    const tierScale = def.tier === 'L1' ? 1.3 : def.tier === 'L2' ? 1.15 : 1.0;

    // 身體光暈
    g.fillStyle(color, 0.15);
    g.fillCircle(0, 0, 18 * tierScale);

    // 身體
    g.fillStyle(color, 0.9);
    g.fillRoundedRect(-10 * tierScale, -4 * tierScale, 20 * tierScale, 18 * tierScale, 4);

    // 頭
    g.fillStyle(0xFDE68A, 1);
    g.fillCircle(0, -8 * tierScale, 9 * tierScale);

    // 眼睛
    g.fillStyle(0x1A1A1A, 1);
    g.fillCircle(-3 * tierScale, -9 * tierScale, 1.5);
    g.fillCircle(3 * tierScale, -9 * tierScale, 1.5);

    // L1 特殊：皇冠
    if (def.tier === 'L1') {
      g.fillStyle(COLORS.HIVE_GOLD, 1);
      g.fillTriangle(-6, -18, 0, -24, 6, -18);
      g.fillRect(-6, -18, 12, 3);
    }

    // L2 特殊：標記
    if (def.tier === 'L2') {
      g.fillStyle(color, 1);
      g.fillCircle(0, -18, 3);
    }
  }

  private updateAgentVisual(sprite: AgentSprite): void {
    const { statusBubble, statusIcon, state, isMoving } = sprite;

    statusBubble.clear();

    // 移動中顯示特別的走路狀態 icon
    const stateConfig: Record<AgentState, { icon: string; color: number }> = {
      idle:     { icon: isMoving ? '🚶' : '💤', color: COLORS.STATUS_IDLE },
      thinking: { icon: '💭', color: COLORS.STATUS_THINKING },
      replying: { icon: '💬', color: COLORS.STATUS_ACTIVE },
      active:   { icon: '⚡', color: COLORS.STATUS_ACTIVE },
      error:    { icon: '❌', color: COLORS.STATUS_ERROR },
      offline:  { icon: '🔇', color: COLORS.STATUS_OFFLINE },
    };

    const config = stateConfig[state];

    // 氣泡背景
    statusBubble.fillStyle(config.color, 0.2);
    statusBubble.fillRoundedRect(-10, -36, 20, 16, 4);
    statusBubble.lineStyle(1, config.color, 0.5);
    statusBubble.strokeRoundedRect(-10, -36, 20, 16, 4);

    statusIcon.setText(config.icon);
    statusIcon.setPosition(0, -28);

    // Offline 半透明
    sprite.container.setAlpha(state === 'offline' ? 0.4 : 1.0);

    // Error 紅色閃爍
    if (state === 'error') {
      this.tweens.add({
        targets: sprite.body,
        alpha: { from: 1, to: 0.3 },
        duration: 400,
        yoyo: true,
        repeat: -1,
      });
    }

    // Active / Thinking 呼吸效果（不走動時）
    if (!isMoving && (state === 'thinking' || state === 'replying')) {
      this.tweens.add({
        targets: sprite.container,
        scaleX: { from: 1.0, to: 1.05 },
        scaleY: { from: 1.0, to: 1.05 },
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 走動系統
  // ═══════════════════════════════════════════════════════════════

  /**
   * 啟動走動系統 — 為每個 Agent 設定隨機移動計時器
   */
  private startMovementSystem(): void {
    this.agentSprites.forEach((sprite) => {
      this.scheduleRandomMove(sprite);
    });
  }

  /**
   * 安排下一次隨機移動
   */
  private scheduleRandomMove(sprite: AgentSprite): void {
    const delay = Phaser.Math.Between(MOVE_INTERVAL_MIN, MOVE_INTERVAL_MAX);
    
    sprite.moveTimer = this.time.delayedCall(delay, () => {
      this.startRandomMove(sprite);
      // 移動完成後安排下一次
      this.scheduleRandomMove(sprite);
    });
  }

  /**
   * 開始隨機移動
   */
  private startRandomMove(sprite: AgentSprite): void {
    // 已在移動中則跳過
    if (sprite.isMoving) return;
    
    // 離線狀態不移動
    if (sprite.state === 'offline') return;

    // 決定目標位置：Zone 內移動 or Zone 間移動（70% Zone 內，30% Zone 間）
    const zoneMove = Math.random() < 0.7;
    const target = zoneMove 
      ? this.getRandomPositionInCurrentZone(sprite)
      : this.getRandomPositionInRandomZone(sprite);

    if (!target) return;

    sprite.targetX = target.x;
    sprite.targetY = target.y;
    sprite.isMoving = true;
    sprite.startX = sprite.container.x;
    sprite.startY = sprite.container.y;

    // 計算移動距離和時間
    const dx = target.x - sprite.startX;
    const dy = target.y - sprite.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const duration = (distance / sprite.moveSpeed) * 1000; // 毫秒

    // 更新視覺效果（走路狀態）
    this.updateAgentVisual(sprite);

    // 開始走路動畫（搖晃效果）
    this.startWalkAnimation(sprite);

    // 執行移動 Tween
    sprite.moveTween = this.tweens.add({
      targets: sprite.container,
      x: target.x,
      y: target.y,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        this.onMoveComplete(sprite);
      },
    });
  }

  /**
   * 取得目標 Zone 的邊界
   */
  private getZoneBounds(sprite: AgentSprite): { x: number; y: number; width: number; height: number } | null {
    // 根據目前位置判斷在哪個 Zone
    const { x, y } = sprite.container;
    
    for (const zone of Object.values(ZONES)) {
      if (x >= zone.x && x <= zone.x + zone.width &&
          y >= zone.y && y <= zone.y + zone.height) {
        return zone;
      }
    }
    
    // 預設返回 workshop Zone
    return ZONES.hiveWorkshop;
  }

  /**
   * 取得 Zone 內的隨機位置
   */
  private getRandomPositionInCurrentZone(sprite: AgentSprite): { x: number; y: number } | null {
    const zone = this.getZoneBounds(sprite);
    if (!zone) return null;

    // Zone 內隨機位置（留邊距）
    const padding = 30;
    const x = Phaser.Math.Between(zone.x + padding, zone.x + zone.width - padding);
    const y = Phaser.Math.Between(zone.y + padding, zone.y + zone.height - padding);

    return { x, y };
  }

  /**
   * 取得隨機 Zone 的隨機位置
   */
  private getRandomPositionInRandomZone(sprite: AgentSprite): { x: number; y: number } | null {
    const zones = Object.values(ZONES);
    const zone = zones[Phaser.Math.Between(0, zones.length - 1)];

    const padding = 30;
    const x = Phaser.Math.Between(zone.x + padding, zone.x + zone.width - padding);
    const y = Phaser.Math.Between(zone.y + padding, zone.y + zone.height - padding);

    return { x, y };
  }

  /**
   * 開始走路動畫
   */
  private startWalkAnimation(sprite: AgentSprite): void {
    // 走路時的搖晃/彈跳效果
    sprite.walkTween = this.tweens.add({
      targets: sprite.container,
      scaleX: { from: 1.0, to: 1.08 },
      scaleY: { from: 1.0, to: 0.92 },
      duration: 150,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // 如果有 bodyImage，也讓它稍微旋轉（腳步效果）
    if (sprite.bodyImage) {
      this.tweens.add({
        targets: sprite.bodyImage,
        angle: { from: -3, to: 3 },
        duration: 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  /**
   * 移動完成
   */
  private onMoveComplete(sprite: AgentSprite): void {
    sprite.isMoving = false;
    sprite.targetX = undefined;
    sprite.targetY = undefined;

    // 停止走路動畫
    if (sprite.walkTween) {
      sprite.walkTween.stop();
      sprite.walkTween = undefined;
    }

    // 重置 scale
    sprite.container.setScale(1);
    if (sprite.bodyImage) {
      sprite.bodyImage.setAngle(0);
    }

    // 恢復原本狀態的視覺效果
    this.updateAgentVisual(sprite);

    // 短暫停留後可能改變狀態
    this.time.delayedCall(1000, () => {
      if (!sprite.isMoving && sprite.state !== 'offline' && sprite.state !== 'error') {
        // 30% 機率變為 active
        if (Math.random() < 0.3) {
          sprite.state = 'active';
          this.updateAgentVisual(sprite);
        }
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════

  // ─── UI ───

  private tooltipContainer?: Phaser.GameObjects.Container;

  private showTooltip(def: AgentDef, x: number, y: number): void {
    this.hideTooltip();

    const bg = this.add.graphics();
    bg.fillStyle(0x0F172A, 0.9);
    bg.fillRoundedRect(-60, -20, 120, 40, 6);
    bg.lineStyle(1, def.color, 0.6);
    bg.strokeRoundedRect(-60, -20, 120, 40, 6);

    const text = this.add.text(0, -8, def.name + ' (' + def.tier + ')', {
      fontFamily: '"Noto Sans TC", sans-serif',
      fontSize: '11px',
      color: '#FFBF00',
    }).setOrigin(0.5);

    const role = this.add.text(0, 6, def.role, {
      fontFamily: '"Noto Sans TC", sans-serif',
      fontSize: '9px',
      color: '#94A3B8',
    }).setOrigin(0.5);

    this.tooltipContainer = this.add.container(x, y - 45, [bg, text, role]);
  }

  private hideTooltip(): void {
    this.tooltipContainer?.destroy();
    this.tooltipContainer = undefined;
  }

  private showInfoPanel(def: AgentDef): void {
    this.infoPanel?.destroy();

    const sprite = this.agentSprites.get(def.id);
    const state = sprite?.state ?? 'offline';
    const isMoving = sprite?.isMoving ?? false;

    const w = 280, h = 200;
    const x = SCENE_CONFIG.width / 2 - w / 2;
    const y = SCENE_CONFIG.height / 2 - h / 2;

    const panel = this.add.container(x, y);

    // 背景
    const bg = this.add.graphics();
    bg.fillStyle(0x0F172A, 0.95);
    bg.fillRoundedRect(0, 0, w, h, 10);
    bg.lineStyle(2, def.color, 0.8);
    bg.strokeRoundedRect(0, 0, w, h, 10);

    // 頂部色條
    bg.fillStyle(def.color, 0.3);
    bg.fillRoundedRect(0, 0, w, 40, { tl: 10, tr: 10, bl: 0, br: 0 });

    // 標題
    const title = this.add.text(w / 2, 20, def.emoji + ' ' + def.name, {
      fontFamily: '"Noto Sans TC", sans-serif',
      fontSize: '16px',
      color: '#FFBF00',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 資訊
    const infoLines = [
      '角色：' + def.nameEn,
      '層級：' + def.tier,
      '職責：' + def.role,
      '狀態：' + state + (isMoving ? ' (走路中)' : ''),
      '模型：MiniMax-M2.5',
    ];

    const infoText = this.add.text(20, 52, infoLines.join('\n'), {
      fontFamily: '"Noto Sans TC", sans-serif',
      fontSize: '12px',
      color: '#E2E8F0',
      lineSpacing: 8,
    });

    // 關閉按鈕
    const closeBtn = this.add.text(w - 16, 8, '✕', {
      fontSize: '18px',
      color: '#94A3B8',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      panel.destroy();
      this.infoPanel = undefined;
    });

    closeBtn.on('pointerover', () => closeBtn.setColor('#FFFFFF'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#94A3B8'));

    panel.add([bg, title, infoText, closeBtn]);
    this.infoPanel = panel;
  }

  // ─── 狀態列 ───

  private createStatusBar(width: number): void {
    this.statusBarBg = this.add.graphics();
    this.statusBarBg.fillStyle(0x0F172A, 0.8);
    this.statusBarBg.fillRect(0, 0, width, 28);
    this.statusBarBg.lineStyle(1, COLORS.HIVE_GOLD, 0.3);
    this.statusBarBg.lineBetween(0, 28, width, 28);

    this.titleText = this.add.text(12, 6, '🐝 蜂神殿 — Agent Monitor', {
      fontFamily: '"Noto Sans TC", sans-serif',
      fontSize: '12px',
      color: '#FFBF00',
      fontStyle: 'bold',
    });

    // 右側統計
    const totalAgents = AGENTS.length;
    this.add.text(width - 12, 6, 'Agents: ' + totalAgents + ' | 🟢 Online', {
      fontFamily: '"Noto Sans TC", sans-serif',
      fontSize: '11px',
      color: '#94A3B8',
    }).setOrigin(1, 0);
  }

  // ─── 模擬狀態變化 ───

  private randomizeStates(): void {
    const states: AgentState[] = ['idle', 'thinking', 'replying', 'active', 'idle', 'idle', 'idle'];

    this.agentSprites.forEach(sprite => {
      // 移動中不變更狀態
      if (sprite.isMoving) return;

      // 停止舊的 tween
      this.tweens.killTweensOf(sprite.container);
      this.tweens.killTweensOf(sprite.body);
      if (sprite.bodyImage) this.tweens.killTweensOf(sprite.bodyImage);
      sprite.container.setScale(1);
      if (sprite.body) sprite.body.setAlpha(1);
      if (sprite.bodyImage) sprite.bodyImage.setAlpha(1);

      const newState = states[Math.floor(Math.random() * states.length)];
      sprite.state = newState;
      this.updateAgentVisual(sprite);
    });
  }

  // ─── 漂浮粒子 ───

  private createFloatingParticles(w: number, h: number): void {
    for (let i = 0; i < 15; i++) {
      const dot = this.add.graphics();
      const color = Math.random() > 0.5 ? COLORS.HIVE_GOLD : COLORS.TECH_CYAN;
      dot.fillStyle(color, 0.15 + Math.random() * 0.15);
      dot.fillCircle(0, 0, 1 + Math.random() * 2);

      const startX = Math.random() * w;
      const startY = Math.random() * h;
      dot.setPosition(startX, startY);

      this.tweens.add({
        targets: dot,
        x: startX + (Math.random() - 0.5) * 100,
        y: startY - 50 - Math.random() * 100,
        alpha: { from: 0.3, to: 0 },
        duration: 4000 + Math.random() * 6000,
        repeat: -1,
        yoyo: true,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 3000,
      });
    }
  }
}
