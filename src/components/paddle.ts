import {Ball} from "./ball";

export abstract class Paddle {
    public x: number;
    public y: number;
    public width: number;
    public height: number;

    protected constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 100;
    }

    abstract move(canvas: HTMLCanvasElement, ball: Ball): void;

    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = "white";
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}
