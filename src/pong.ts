import {Ball} from "./components/ball";
import {Paddle} from "./components/paddle";

export class Pong {
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly ball: Ball;
    private player: Paddle;
    private ai: Paddle;
    private playerScore: number;
    private aiScore: number;
    private gameState: GameState;
    private winningScore: number;


    constructor(canvas: HTMLCanvasElement) {
        this.gameState = GameState.StartScreen;
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2);
        this.player = new Paddle(20, this.canvas.height / 2 - 50, "Player");
        this.ai = new Paddle(this.canvas.width - 40, this.canvas.height / 2 - 50, "AI");
        this.setupInputListeners();
        this.setupMouseInput();
        this.playerScore = 0;
        this.aiScore = 0;
        this.winningScore = 1;
    }

    start() {
        this.update();
    }

    private update() {
        this.checkCollision();
        if (this.gameState === GameState.Playing) {
            this.ball.move(this.canvas);
            this.player.move(this.canvas, this.ball);
            this.ai.move(this.canvas, this.ball);
        }
        this.draw();
        requestAnimationFrame(() => this.update());
    }


    private draw() {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.gameState === GameState.StartScreen) {
            this.drawStartScreen();
        } else if (this.gameState === GameState.GameOver) {
            this.drawGameOverScreen();
        } else {
            this.ball.draw(this.context);
            this.player.draw(this.context);
            this.ai.draw(this.context);
            this.drawScoresAndDashedLine();
        }
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
            this.aiScore++;
            if (this.aiScore >= this.winningScore) {
                this.gameState = GameState.GameOver;
            } else {
                this.resetBall(false);
            }
        } else if (this.ball.x + this.ball.width > this.canvas.width) {
            // Player scores
            this.playerScore++;
            if (this.playerScore >= this.winningScore) {
                this.gameState = GameState.GameOver;
            } else {
                this.resetBall(true);
            }
        }
    }
    private resetBall(isPlayer: boolean): void {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx *= -1;
        this.ball.dy = isPlayer ? -Math.random() * 3 - 3 : Math.random() * 3 + 3;
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

        window.addEventListener("keydown", (event) => {
            if (event.code === "Space") {
                if (this.gameState === GameState.StartScreen || this.gameState === GameState.GameOver) {
                    this.resetGame();
                    this.gameState = GameState.Playing;
                }
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

    private setupMouseInput(): void {
        let dragging = false;

        const isMouseOnPaddle = (event: MouseEvent): boolean => {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            return (
                mouseX >= this.player.x &&
                mouseX <= this.player.x + this.player.width &&
                mouseY >= this.player.y &&
                mouseY <= this.player.y + this.player.height
            );
        };

        this.canvas.addEventListener("mousedown", (event) => {
            if (isMouseOnPaddle(event)) {
                dragging = true;
            }
        });

        this.canvas.addEventListener("mouseup", () => {
            dragging = false;
        });

        this.canvas.addEventListener("mousemove", (event) => {
            if (dragging) {
                const rect = this.canvas.getBoundingClientRect();
                const mouseY = event.clientY - rect.top;
                this.player.y = mouseY - this.player.height / 2;

                // Prevent the player paddle from moving off the canvas
                this.player.y = Math.max(0, Math.min(this.player.y, this.canvas.height - this.player.height));
            }
        });
    }

    private drawStartScreen() {
        this.context.fillStyle = "white";
        this.context.font = "32px Arial";
        this.context.textAlign = "center";
        this.context.fillText("Press SPACE to start", this.canvas.width / 2, this.canvas.height / 2);
    }

    private drawGameOverScreen() {
        this.context.fillStyle = "white";
        this.context.font = "32px Arial";
        this.context.textAlign = "center";
        const winner = this.playerScore >= this.winningScore ? "You" : "AI";
        this.context.fillText(`${winner} won!`, this.canvas.width / 2, this.canvas.height / 2 - 40);
        this.context.fillText("Press SPACE to restart", this.canvas.width / 2, this.canvas.height / 2 + 40);
    }


    private resetScores() {
        this.playerScore = 0;
        this.aiScore = 0;
    }

    private resetGame() {
        this.resetBall(this.playerScore >= this.winningScore);
        this.resetPaddles();
        this.resetScores();
    }

    private resetPaddles() {
        this.player.x = 20;
        this.player.y = this.canvas.height / 2 - 50;
        this.ai.x = this.canvas.width - 40;
        this.ai.y = this.canvas.height / 2 - 50;
    }

}

enum GameState {
    StartScreen,
    Playing,
    GameOver,
}

