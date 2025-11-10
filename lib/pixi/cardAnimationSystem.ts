import * as PIXI from 'pixi.js';

/**
 * Animation system for card effects in Hearthstone style
 */
export class CardAnimations {
  /**
   * Hover animation - card lifts and glows
   */
  static animateHover(card: PIXI.Container, isHovering: boolean): void {
    const targetY = isHovering ? card.y - 20 : card.y + 20;
    const targetScale = isHovering ? 1.1 : 1.0;
    const duration = 200;

    this.smoothTransition(card, {
      y: targetY,
      scaleX: targetScale,
      scaleY: targetScale,
    }, duration);
  }

  /**
   * Card play animation - card flies to board
   */
  static async animateCardPlay(
    card: PIXI.Container,
    startPos: { x: number; y: number },
    endPos: { x: number; y: number }
  ): Promise<void> {
    return new Promise((resolve) => {
      card.position.set(startPos.x, startPos.y);
      card.alpha = 1;
      card.scale.set(1);

      // Arc motion
      const duration = 600;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = this.easeOutCubic(progress);

        // Position with arc
        card.x = startPos.x + (endPos.x - startPos.x) * eased;
        const arc = Math.sin(progress * Math.PI) * 50;
        card.y = startPos.y + (endPos.y - startPos.y) * eased - arc;

        // Rotation
        card.rotation = Math.sin(progress * Math.PI) * 0.3;

        // Scale pulse
        const scale = 1 + Math.sin(progress * Math.PI) * 0.2;
        card.scale.set(scale);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          card.rotation = 0;
          card.scale.set(1);
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * Attack animation - minion lunges forward
   */
  static async animateAttack(
    attacker: PIXI.Container,
    target: PIXI.Container
  ): Promise<void> {
    return new Promise((resolve) => {
      const startX = attacker.x;
      const startY = attacker.y;
      const targetX = target.x;
      const targetY = target.y;
      const midX = (startX + targetX) / 2;
      const midY = (startY + targetY) / 2;

      const duration = 400;
      let phase = 0; // 0 = lunge forward, 1 = return

      const animate = () => {
        if (phase === 0) {
          // Lunge towards target
          this.smoothTransition(attacker, {
            x: midX,
            y: midY,
            scaleX: 1.2,
            scaleY: 1.2,
          }, duration / 2).then(() => {
            // Impact effect
            this.createImpactEffect(target);
            this.shakeSprite(target, 100);
            phase = 1;
            animate();
          });
        } else {
          // Return to original position
          this.smoothTransition(attacker, {
            x: startX,
            y: startY,
            scaleX: 1,
            scaleY: 1,
          }, duration / 2).then(resolve);
        }
      };

      animate();
    });
  }

  /**
   * Death animation - card fades and shrinks
   */
  static async animateDeath(card: PIXI.Container): Promise<void> {
    return new Promise((resolve) => {
      const duration = 500;

      this.smoothTransition(card, {
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        rotation: Math.PI * 2,
      }, duration).then(resolve);
    });
  }

  /**
   * Damage number popup
   */
  static showDamageNumber(
    parent: PIXI.Container,
    x: number,
    y: number,
    damage: number
  ): void {
    const text = new PIXI.Text({
      text: `-${damage}`,
      style: {
        fontSize: 32,
        fontWeight: 'bold',
        fill: 0xff0000,
        stroke: { color: 0x000000, width: 4 },
      }
    });
    text.x = x;
    text.y = y;
    text.anchor.set(0.5);
    parent.addChild(text);

    // Float up and fade
    const duration = 1000;
    this.smoothTransition(text, {
      y: y - 50,
      alpha: 0,
    }, duration).then(() => {
      parent.removeChild(text);
    });
  }

  /**
   * Heal number popup
   */
  static showHealNumber(
    parent: PIXI.Container,
    x: number,
    y: number,
    heal: number
  ): void {
    const text = new PIXI.Text({
      text: `+${heal}`,
      style: {
        fontSize: 32,
        fontWeight: 'bold',
        fill: 0x00ff00,
        stroke: { color: 0x000000, width: 4 },
      }
    });
    text.x = x;
    text.y = y;
    text.anchor.set(0.5);
    parent.addChild(text);

    const duration = 1000;
    this.smoothTransition(text, {
      y: y - 50,
      alpha: 0,
    }, duration).then(() => {
      parent.removeChild(text);
    });
  }

  /**
   * Glow effect for selectable cards
   */
  static createGlow(card: PIXI.Container, color: number = 0x22c55e): PIXI.Graphics {
    const glow = new PIXI.Graphics();
    
    // Get card bounds
    const bounds = card.getBounds();
    const padding = 10;
    
    glow.roundRect(
      -padding,
      -padding,
      bounds.width + padding * 2,
      bounds.height + padding * 2,
      10
    );
    glow.fill({ color, alpha: 0 });
    
    // Pulse animation
    let time = 0;
    const pulse = () => {
      time += 0.05;
      glow.alpha = 0.3 + Math.sin(time) * 0.2;
      requestAnimationFrame(pulse);
    };
    pulse();
    
    return glow;
  }

  /**
   * Impact effect on hit
   */
  private static createImpactEffect(target: PIXI.Container): void {
    const flash = new PIXI.Graphics();
    flash.circle(0, 0, 50);
    flash.fill({ color: 0xffffff, alpha: 0.8 });
    
    const bounds = target.getBounds();
    flash.x = bounds.width / 2;
    flash.y = bounds.height / 2;
    
    target.addChild(flash);

    this.smoothTransition(flash, {
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
    }, 200).then(() => {
      target.removeChild(flash);
    });
  }

  /**
   * Shake sprite effect
   */
  private static shakeSprite(sprite: PIXI.Container, duration: number): void {
    const originalX = sprite.x;
    const startTime = Date.now();
    const intensity = 10;

    const shake = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        sprite.x = originalX + (Math.random() - 0.5) * intensity;
        requestAnimationFrame(shake);
      } else {
        sprite.x = originalX;
      }
    };

    shake();
  }

  /**
   * Smooth property transition
   */
  private static smoothTransition(
    sprite: PIXI.Container,
    target: Partial<{
      x: number;
      y: number;
      alpha: number;
      scaleX: number;
      scaleY: number;
      rotation: number;
    }>,
    duration: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const start: any = {
        x: sprite.x,
        y: sprite.y,
        alpha: sprite.alpha,
        scaleX: sprite.scale.x,
        scaleY: sprite.scale.y,
        rotation: sprite.rotation,
      };

      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = this.easeOutCubic(progress);

        // Interpolate each property
        Object.keys(target).forEach((key) => {
          const targetValue = (target as any)[key];
          const startValue = start[key];

          if (targetValue !== undefined) {
            const current = startValue + (targetValue - startValue) * eased;
            
            if (key === 'scaleX') {
              sprite.scale.x = current;
            } else if (key === 'scaleY') {
              sprite.scale.y = current;
            } else {
              (sprite as any)[key] = current;
            }
          }
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      animate();
    });
  }

  // Easing functions
  private static easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  private static easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
}