import * as PIXI from 'pixi.js';
import { BoardLayout } from '../layout/BoardLayout';

export class BoardRenderer {
    constructor(private layout: BoardLayout) { }

    createBackground(): PIXI.Graphics {
        return this.layout.createBackground();
    }
}