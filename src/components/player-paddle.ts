import { Ball } from "./ball";
import { Paddle } from "./paddle";

export class PlayerPaddle extends Paddle {
    public direction: number;
    private readonly speed: number;

    constructor(x: number, y: number, speed: number) {
        super(x, y);
        this.direction = 0;
        this.speed = speed;
    }

    move(canvas: HTMLCanvasElement, ball: Ball) {
        // Move the player paddle based on direction
        this.y += this.direction * this.speed;

        // Prevent the player paddle from moving off the canvas
        this.y = Math.max(0, Math.min(this.y, canvas.height - this.height));
    }
}
