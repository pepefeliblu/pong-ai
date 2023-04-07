import { Ball } from "./ball";
import { Paddle } from "./paddle";

export class AIPaddle extends Paddle {
    private readonly acceleration: number;
    private targetY: number;
    private readonly difficulty: 'easy' | 'normal' | 'expert';

    constructor(x: number, y: number, difficulty: 'easy' | 'normal' | 'expert' = 'normal') {
        super(x, y);
        this.targetY = y;
        this.difficulty = difficulty;

        // Set acceleration based on difficulty
        switch (difficulty) {
            case 'easy':
                this.acceleration = 0.1;
                break;
            case 'expert':
                this.acceleration = 0.4;
                break;
            case 'normal':
            default:
                this.acceleration = 0.2;
                break;
        }
    }

    move(canvas: HTMLCanvasElement, ball: Ball) {
        if (ball.dx > 0 && (this.difficulty === 'expert' || Math.random() > 0.4)) {
            this.targetY = ball.y - this.height / 2;

            // Limit the targetY within the canvas
            this.targetY = Math.max(0, Math.min(this.targetY, canvas.height - this.height));
        }

        const distanceToTarget = this.targetY - this.y;
        const acceleration = distanceToTarget * this.acceleration;

        this.y += acceleration;
    }
}
