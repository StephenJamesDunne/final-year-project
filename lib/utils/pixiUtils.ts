import * as PIXI from 'pixi.js';
import { Element } from '@/lib/types/game';

// Color conversion utilities
export function hexToNumber(hex: string): number {
    return parseInt(hex.replace('#', ''), 16);
}

export function rgbToNumber(r: number, g: number, b: number): number {
    return (r << 16) + (g << 8) + b;
}

// Element color mappings
export const ELEMENT_COLORS: Record<Element, number> = {
    fire: hexToNumber('#dc2626'),
    water: hexToNumber('#2563eb'),
    earth: hexToNumber('#16a34a'),
    air: hexToNumber('#9333ea'),
    spirit: hexToNumber('#4f46e5'),
    neutral: hexToNumber('#6b7280'),
};

export const ELEMENT_BORDER_COLORS: Record<Element, number> = {
    fire: hexToNumber('#ef4444'),
    water: hexToNumber('#3b82f6'),
    earth: hexToNumber('#22c55e'),
    air: hexToNumber('#a855f7'),
    spirit: hexToNumber('#6366f1'),
    neutral: hexToNumber('#9ca3af'),
};

// Animation utilities
export interface AnimationConfig {
    duration: number;
    easing?: (t: number) => number;
    onUpdate?: (progress: number) => void;
    onComplete?: () => void;
}

// Easing functions
export const Easing = {
    linear: (t: number) => t,
    easeInQuad: (t: number) => t * t,
    easeOutQuad: (t: number) => t * (2 - t),
    easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    easeInCubic: (t: number) => t * t * t,
    easeOutCubic: (t: number) => (--t) * t * t + 1,
    easeInOutCubic: (t: number) =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};

// Simple animation helper
export function animateSprite(
    sprite: PIXI.Container,
    from: Partial<{
        x: number;
        y: number;
        alpha: number;
        scaleX: number;
        scaleY: number;
    }>,
    to: Partial<{
        x: number;
        y: number;
        alpha: number;
        scaleX: number;
        scaleY: number;
    }>,
    config: AnimationConfig
): void {
    const startTime = Date.now();
    const easing = config.easing || Easing.easeOutQuad;

    const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / config.duration, 1);
        const easedProgress = easing(progress);

        // Interpolate properties
        if (from.x !== undefined && to.x !== undefined) {
            sprite.x = from.x + (to.x - from.x) * easedProgress;
        }
        if (from.y !== undefined && to.y !== undefined) {
            sprite.y = from.y + (to.y - from.y) * easedProgress;
        }
        if (from.alpha !== undefined && to.alpha !== undefined) {
            sprite.alpha = from.alpha + (to.alpha - from.alpha) * easedProgress;
        }

        // Fixed scale handling for PIXI v8
        if (from.scaleX !== undefined && to.scaleX !== undefined) {
            sprite.scale.x = from.scaleX + (to.scaleX - from.scaleX) * easedProgress;
        }
        if (from.scaleY !== undefined && to.scaleY !== undefined) {
            sprite.scale.y = from.scaleY + (to.scaleY - from.scaleY) * easedProgress;
        }
        // If only scaleX is provided, apply to both x and y for uniform scaling
        if (from.scaleX !== undefined && to.scaleX !== undefined && from.scaleY === undefined && to.scaleY === undefined) {
            const newScale = from.scaleX + (to.scaleX - from.scaleX) * easedProgress;
            sprite.scale.set(newScale);
        }

        if (config.onUpdate) {
            config.onUpdate(easedProgress);
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else if (config.onComplete) {
            config.onComplete();
        }
    };

    animate();
}

// Card draw animation
export function animateCardDraw(
    sprite: PIXI.Container,
    from: { x: number; y: number },
    to: { x: number; y: number },
    duration: number = 500
): Promise<void> {
    return new Promise((resolve) => {
        sprite.alpha = 0;
        sprite.position.set(from.x, from.y);

        animateSprite(
            sprite,
            { x: from.x, y: from.y, alpha: 0 },
            { x: to.x, y: to.y, alpha: 1 },
            {
                duration,
                easing: Easing.easeOutCubic,
                onComplete: resolve,
            }
        );
    });
}

// Card play animation
export function animateCardPlay(
    sprite: PIXI.Container,
    targetY: number,
    duration: number = 400
): Promise<void> {
    return new Promise((resolve) => {
        const startY = sprite.y;

        animateSprite(
            sprite,
            { y: startY, scaleX: 1 },
            { y: targetY, scaleX: 1.2 },
            {
                duration: duration / 2,
                easing: Easing.easeOutQuad,
                onComplete: () => {
                    animateSprite(
                        sprite,
                        { y: targetY, scaleX: 1.2 },
                        { y: targetY, scaleX: 1 },
                        {
                            duration: duration / 2,
                            easing: Easing.easeInQuad,
                            onComplete: resolve,
                        }
                    );
                },
            }
        );
    });
}

// Attack animation
export function animateAttack(
    attacker: PIXI.Container,
    target: PIXI.Container,
    duration: number = 600
): Promise<void> {
    return new Promise((resolve) => {
        const startX = attacker.x;
        const startY = attacker.y;
        const midX = (attacker.x + target.x) / 2;
        const midY = (attacker.y + target.y) / 2;

        // Move towards target
        animateSprite(
            attacker,
            { x: startX, y: startY },
            { x: midX, y: midY },
            {
                duration: duration / 2,
                easing: Easing.easeOutQuad,
                onComplete: () => {
                    // Shake target
                    const originalX = target.x;
                    let shakeCount = 0;
                    const shakeInterval = setInterval(() => {
                        target.x = originalX + (Math.random() - 0.5) * 10;
                        shakeCount++;
                        if (shakeCount > 5) {
                            clearInterval(shakeInterval);
                            target.x = originalX;
                        }
                    }, 50);

                    // Return to start
                    animateSprite(
                        attacker,
                        { x: midX, y: midY },
                        { x: startX, y: startY },
                        {
                            duration: duration / 2,
                            easing: Easing.easeInQuad,
                            onComplete: resolve,
                        }
                    );
                },
            }
        );
    });
}

// Destroy/death animation
export function animateDeath(
    sprite: PIXI.Container,
    duration: number = 400
): Promise<void> {
    return new Promise((resolve) => {
        animateSprite(
            sprite,
            { alpha: 1, scaleX: 1 },
            { alpha: 0, scaleX: 0.5 },
            {
                duration,
                easing: Easing.easeInQuad,
                onComplete: resolve,
            }
        );
    });
}

// Layout utilities
export function calculateCardPositions(
    cardCount: number,
    containerWidth: number,
    cardWidth: number,
    cardSpacing: number
): number[] {
    const totalWidth = cardCount * cardWidth + (cardCount - 1) * cardSpacing;
    const startX = (containerWidth - totalWidth) / 2;

    return Array.from({ length: cardCount }, (_, i) =>
        startX + i * (cardWidth + cardSpacing)
    );
}

// Text utilities - FIXED for PIXI v8
export function createCardText(
    text: string,
    style: Partial<PIXI.TextStyle>
): PIXI.Text {
    return new PIXI.Text({
        text,
        style: {
            fontSize: 14,
            fill: 0xffffff,
            fontWeight: 'bold',
            ...style,
        }
    });
}

// Graphics utilities - FIXED for PIXI v8
export function createRoundedRect(
    width: number,
    height: number,
    radius: number,
    fillColor: number,
    borderColor?: number,
    borderWidth: number = 2
): PIXI.Graphics {
    const graphics = new PIXI.Graphics();

    graphics.roundRect(0, 0, width, height, radius);
    graphics.fill(fillColor);

    if (borderColor !== undefined) {
        graphics.stroke({ width: borderWidth, color: borderColor });
    }

    return graphics;
}

export function createCircle(
    radius: number,
    fillColor: number,
    borderColor?: number,
    borderWidth: number = 2
): PIXI.Graphics {
    const graphics = new PIXI.Graphics();

    graphics.circle(0, 0, radius);
    graphics.fill(fillColor);

    if (borderColor !== undefined) {
        graphics.stroke({ width: borderWidth, color: borderColor });
    }

    return graphics;
}