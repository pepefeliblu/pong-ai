import {Ball} from "./components/ball";
import {Paddle} from "./components/paddle";

export class Pong {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private ball: Ball;
    private player: Paddle;
    private ai: Paddle;

    private playerScore: number;
    private aiScore: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2);
        this.player = new Paddle(20, this.canvas.height / 2 - 50, "Player");
        this.ai = new Paddle(this.canvas.width - 40, this.canvas.height / 2 - 50, "AI");
        this.setupInputListeners();
        this.playerScore = 0;
        this.aiScore = 0;
    }

    start() {
        this.update();
    }

    private update() {
        this.ball.move(this.canvas);
        this.player.move(this.canvas, this.ball);
        this.ai.move(this.canvas, this.ball);
        this.checkCollision();
        this.draw();
        requestAnimationFrame(() => this.update());
    }

    private draw() {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ball.draw(this.context);
        this.player.draw(this.context);
        this.ai.draw(this.context);
        this.drawScoresAndDashedLine();
    }

    private checkCollision() {
        // Check collision with top and bottom walls
        if (this.ball.y <= 0 || this.ball.y + this.ball.height >= this.canvas.height) {
            this.ball.dy *= -1;
        }

        // Check collision with paddles
        if (
            (this.ball.x <= this.player.x + this.player.width && this.ball.y + this.ball.height >= this.player.y && this.ball.y <= this.player.y + this.player.height) ||
            (this.ball.x + this.ball.width >= this.ai.x && this.ball.y + this.ball.height >= this.ai.y && this.ball.y <= this.ai.y + this.ai.height)
        ) {
            this.ball.dx *= -1;
            this.ball.dy *= 1.05; // Increase the ball's speed by 5%
        }

        // Check if a player scores
        if (this.ball.x < 0) {
            // AI scores
            this.resetBall(false, 3);
        } else if (this.ball.x + this.ball.width > this.canvas.width) {
            // Player scores
            this.resetBall(true, 3);
        }
    }
    private resetBall(isPlayer: boolean, initialSpeed?: number) {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx *= -1;
        if (initialSpeed) {
            this.ball.dy = isPlayer ? -initialSpeed : initialSpeed;
        }

        if (isPlayer) {
            this.playerScore += 1;
        } else {
            this.aiScore += 1;
        }
    }


    private setupInputListeners(): void {
        window.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'ArrowUp':
                    this.player.direction = -1;
                    break;
                case 'ArrowDown':
                    this.player.direction = 1;
                    break;
            }
        });

        window.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'ArrowUp':
                case 'ArrowDown':
                    this.player.direction = 0;
                    break;
            }
        });
    }

    private drawScoresAndDashedLine() {
        this.context.fillStyle = "white";
        this.context.font = "24px Arial";
        this.context.fillText(this.playerScore.toString(), this.canvas.width / 4, 30);
        this.context.fillText(this.aiScore.toString(), (this.canvas.width / 4) * 3, 30);

        // Draw dashed line
        for (let i = 0; i < this.canvas.height; i += 40) {
            this.context.fillRect(this.canvas.width / 2 - 1, i, 2, 20);
        }
    }

}
