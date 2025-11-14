import * as PIXI from 'pixi.js';

export class GraphicsHelpers {
    static createShadow(width: number, height: number, radius: number): PIXI.Graphics {
        const shadow = new PIXI.Graphics();
        shadow.roundRect(2, 2, width, height, radius);
        shadow.fill({ color: 0x000000, alpha: 0.4 });
        return shadow;
    }

    static createCircleBadge(
        value: string | number,
        color: number,
        radius: number = 16
    ): PIXI.Container {
        const badge = new PIXI.Container();

        const bg = new PIXI.Graphics();
        bg.circle(radius, radius, radius);
        bg.fill({ color, alpha: 0.95 });
        bg.stroke({ width: 2, color: 0xfbbf24 });
        badge.addChild(bg);

        const text = new PIXI.Text({
            text: value.toString(),
            style: {
                fontSize: 16,
                fontWeight: 'bold',
                fill: 0xffffff,
                stroke: { color: 0x000000, width: 3 },
            },
        });
        text.x = radius;
        text.y = radius;
        text.anchor.set(0.5);
        badge.addChild(text);

        return badge;
    }

    static createHexagon(size: number, color: number, text?: string | number): PIXI.Container {
        const container = new PIXI.Container();

        const hexagon = new PIXI.Graphics();
        const points = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            points.push(size + size * Math.cos(angle), size + size * Math.sin(angle));
        }
        hexagon.poly(points);
        hexagon.fill({ color, alpha: 0.95 });
        hexagon.stroke({ width: 2, color: 0x1e40af });
        container.addChild(hexagon);

        // Add text if provided
        if (text !== undefined) {
            const label = new PIXI.Text({
                text: text.toString(),
                style: {
                    fontSize: 16,
                    fontWeight: 'bold',
                    fill: 0xffffff,
                    stroke: { color: 0x000000, width: 3 },
                },
            });
            label.x = size;
            label.y = size;
            label.anchor.set(0.5);
            container.addChild(label);
        }

        return container;
    }
}