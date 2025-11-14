import * as PIXI from 'pixi.js';

export class TextureLoader {
  private static instance: TextureLoader;
  private textures: Map<string, PIXI.Texture> = new Map();
  private loadingPromises: Map<string, Promise<PIXI.Texture>> = new Map();

  private constructor() {}

  static getInstance(): TextureLoader {
    if (!TextureLoader.instance) {
      TextureLoader.instance = new TextureLoader();
    }
    return TextureLoader.instance;
  }

  async loadTexture(key: string, path: string): Promise<PIXI.Texture> {
    if (this.textures.has(key)) {
      return this.textures.get(key)!;
    }

    if (this.loadingPromises.has(key)) {
      return this.loadingPromises.get(key)!;
    }

    const loadPromise = PIXI.Assets.load(path)
      .then((texture: PIXI.Texture) => {
        this.textures.set(key, texture);
        this.loadingPromises.delete(key);
        return texture;
      })
      .catch((error) => {
        console.warn(`Failed to load texture: ${path}`, error);
        this.loadingPromises.delete(key);
        return this.createPlaceholderTexture();
      });

    this.loadingPromises.set(key, loadPromise);
    return loadPromise;
  }

  getTexture(key: string): PIXI.Texture | undefined {
    return this.textures.get(key);
  }

  hasTexture(key: string): boolean {
    return this.textures.has(key);
  }

  private createPlaceholderTexture(): PIXI.Texture {
    const graphics = new PIXI.Graphics();
    graphics.rect(0, 0, 100, 100);
    graphics.fill(0x333333);
    return PIXI.RenderTexture.create({ width: 100, height: 100 });
  }
}