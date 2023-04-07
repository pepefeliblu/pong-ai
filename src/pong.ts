import {Ball} from "./components/ball";
import {PlayerPaddle} from "./components/player-paddle";
import {AIPaddle} from "./components/ai-paddle";

export class Pong {
    private readonly canvas: HTMLCanvasElement;
    private readonly context: CanvasRenderingContext2D;
    private readonly ball: Ball;
    private player: PlayerPaddle;
    private ai: AIPaddle;
    private playerScore: number;
    private aiScore: number;
    private gameState: GameState;
    private readonly winningScore: number;

    private gameOverUI: HTMLElement | null = null;


    constructor(canvas: HTMLCanvasElement) {
        this.gameState = GameState.Menu;
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d") as CanvasRenderingContext2D;
        this.ball = new Ball(this.canvas.width / 2, this.canvas.height / 2);
        this.player = new PlayerPaddle(20, this.canvas.height / 2 - 50, 10);
        this.ai = new AIPaddle(this.canvas.width - 40, this.canvas.height / 2 - 50, 'easy');
        this.setupInputListeners();
        this.setupMouseInput();
        this.playerScore = 0;
        this.aiScore = 0;
        this.winningScore = 1;

        // Create a container for UI elements

        const uiContainer = document.createElement("div");
        uiContainer.id = "ui-container";
        uiContainer.style.position = "absolute";
        uiContainer.style.top = "0";
        uiContainer.style.left = "0";
        uiContainer.style.width = `${this.canvas.width}px`;
        uiContainer.style.height = `${this.canvas.height}px`;
        uiContainer.style.pointerEvents = "none";
        uiContainer.style.display = "flex";
        uiContainer.style.justifyContent = "center";
        uiContainer.style.alignItems = "center";
        uiContainer.style.zIndex = "1000"; // Add a higher z-index value
        this.createGameOverUI(uiContainer);
        this.canvas.parentElement?.appendChild(uiContainer);

        if (this.gameState === GameState.Menu) {
            this.createMenuUI(uiContainer);
        }
    }

    start(uiContainer: HTMLElement) {
        this.update(uiContainer);
    }

    private update(uiContainer: HTMLElement) {
        if (this.gameState !== GameState.GameOver) {
            this.checkCollision(uiContainer);
            if (this.gameState === GameState.Playing) {
                this.ball.move(this.canvas);
                this.player.move(this.canvas, this.ball);
                this.ai.move(this.canvas, this.ball);
            }
            this.draw();
        }
        requestAnimationFrame(() => this.update(uiContainer));
    }


    private draw() {
        this.drawBackground();
        if (this.gameState === GameState.Playing) {
            this.ball.draw(this.context);
            this.player.draw(this.context);
            this.ai.draw(this.context);
            this.drawScoresAndDashedLine();
        }
    }

    private wallCollision() {
        if (this.ball.y <= 0 || this.ball.y + this.ball.height >= this.canvas.height) {
            this.ball.dy *= -1;
        }
    }

    private paddleCollision() {
        // Check collision with paddles
        if (
            (this.ball.x <= this.player.x + this.player.width && this.ball.y + this.ball.height >= this.player.y && this.ball.y <= this.player.y + this.player.height) ||
            (this.ball.x + this.ball.width >= this.ai.x && this.ball.y + this.ball.height >= this.ai.y && this.ball.y <= this.ai.y + this.ai.height)
        ) {
            this.ball.dx *= -1;
            this.ball.dy *= 1.05; // Increase the ball's speed by 5%
        }
    }

    private scoring(uiContainer: HTMLElement) {
        if (this.ball.x < 0) {
            // AI scores
            this.aiScore++;
            if (this.aiScore >= this.winningScore) {
                this.gameState = GameState.GameOver;
                this.toggleGameOverUI(true); // Show the Game Over UI
            } else {
                this.resetBall(false);
            }
        } else if (this.ball.x + this.ball.width > this.canvas.width) {
            // Player scores
            this.playerScore++;
            if (this.playerScore >= this.winningScore) {
                this.gameState = GameState.GameOver;
                this.createGameOverUI(uiContainer);
            } else {
                this.resetBall(true);
            }
        }
    }



    private checkCollision(uiContainer: HTMLElement) {
        this.wallCollision();
        this.paddleCollision();
        this.scoring(uiContainer);
    }
    private resetBall = (isPlayer: boolean): void  => {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx *= -1;
        this.ball.dy = isPlayer ? -Math.random() * 3 - 3 : Math.random() * 3 + 3;
    }


    arrowUpPressedCallback = () => {
        this.player.direction = -1;
    }

    arrowDownPressedCallback = () => {
        this.player.direction = 1;
    }

    private setupInputListeners(): void {

        window.addEventListener("keydown", (event) => {
            if (event.code === "ArrowUp") {
                this.arrowUpPressedCallback();
            } else if (event.code === "ArrowDown") {
                this.arrowDownPressedCallback();
            }
        });

        window.addEventListener("keyup", (event) => {
            if (event.code === "ArrowUp" || event.code === "ArrowDown") {
                this.player.direction = 0;
            }
        });


        window.addEventListener("keyup", (event) => {
            if (event.code === "Space") {
                if (this.gameState === GameState.Menu) {
                    this.startBtnCallback();
                } else if (this.gameState === GameState.GameOver) {
                    this.resetGame();
                    this.gameState = GameState.Playing;
                }
            }
        });


        window.addEventListener("keydown", (event) => {
            if (event.code === "Escape") {
                if (this.gameState === GameState.GameOver || this.gameState === GameState.Playing) {
                    this.gameState = GameState.Menu;
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

    private createMenuUI(uiContainer: HTMLElement) {
        const menuContainer = document.createElement("div");
        menuContainer.style.pointerEvents = "all";
        menuContainer.appendChild(this.createTitle());
        menuContainer.appendChild(this.createStartButton());
        uiContainer.appendChild(menuContainer);
    }

    startBtnCallback = () => {
        const uiContainer = document.getElementById("ui-container");
        if (!uiContainer) return;
        uiContainer.remove();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear the canvas
        this.gameState = GameState.Playing;
    };

    private createGameOverUI(uiContainer: HTMLElement) {
        // Create a container for Game Over UI elements
        const gameOverContainer = document.createElement("div");
        gameOverContainer.style.display = "flex";
        gameOverContainer.style.flexDirection = "column";
        gameOverContainer.style.justifyContent = "center";
        gameOverContainer.style.alignItems = "center";
        gameOverContainer.style.pointerEvents = "auto";

        // Display the winner
        const winnerText = document.createElement("h1");
        winnerText.innerText = this.playerScore >= this.winningScore ? "You Won!" : "AI Won!";
        gameOverContainer.appendChild(winnerText);

        // Display the total scores
        const scoreText = document.createElement("h2");
        scoreText.innerText = `Player: ${this.playerScore} - AI: ${this.aiScore}`;
        gameOverContainer.appendChild(scoreText);

        // Create 'Play Again' button
        const playAgainButton = document.createElement("button");
        playAgainButton.innerText = "Play Again";
        playAgainButton.onclick = () => {
            this.toggleGameOverUI(false);
            this.resetGame();
            this.gameState = GameState.Playing;
        };
        gameOverContainer.appendChild(playAgainButton);

        // Create 'Main Menu' button
        const mainMenuButton = document.createElement("button");
        mainMenuButton.innerText = "Main Menu";
        mainMenuButton.onclick = () => {
            this.toggleGameOverUI(false);
            this.gameState = GameState.Menu;
            this.createMenuUI(uiContainer);
        };
        gameOverContainer.appendChild(mainMenuButton);

        // Append the Game Over UI elements to the UI container
        uiContainer.appendChild(gameOverContainer);

        this.gameOverUI = gameOverContainer;
    }


    private toggleGameOverUI(show: boolean) {
        if (this.gameOverUI) {
            this.gameOverUI.style.display = show ? "block" : "none";
            this.gameOverUI.style.pointerEvents = show ? "auto" : "none";
        }
    }

    private createTitle(): HTMLElement {
        const title = document.createElement("h1");
        title.textContent = "PONG";
        return title;
    }

    private createStartButton(): HTMLElement {
        const startButton = document.createElement("button");
        startButton.textContent = "Start Game";
        startButton.onclick = this.startBtnCallback;
        return startButton;
    }

    restartBtnCallback = () => {
        this.resetGame();
        this.gameState = GameState.Playing;
        document.getElementById("game-over-container")?.remove();
    };
    private createRestartButton(): HTMLElement {
        const restartButton = document.createElement("button");
        restartButton.textContent = "Restart Game";
        restartButton.onclick = this.restartBtnCallback;
        return restartButton;
    }
    private createGameOverTitle(winner: string): HTMLElement {
        const title = document.createElement("h1");
        title.textContent = `${winner} won!`;
        return title;
    }

    menuBtnCallback = () => {
        this.gameState = GameState.Menu;
        document.getElementById("game-over-container")?.remove();
    };

    private createMenuButton(): HTMLElement {
        const menuButton = document.createElement("button");
        menuButton.textContent = "Main Menu";
        menuButton.onclick = this.menuBtnCallback;
        return menuButton;
    }

    private drawBackground() {
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

enum GameState {
    Menu,
    Playing,
    GameOver,
}

