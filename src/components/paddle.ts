import {Ball} from "./ball";

export class Paddle {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    private type: string;
    public direction: number;
    private updateInterval: number;

    constructor(x: number, y: number, type: string) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 100;
        this.type = type;
        this.direction = 0;
        this.updateInterval = type === "AI" ? 255 : 0; // Update every 500ms for the AI paddle
    }

    move(canvas: HTMLCanvasElement, ball: Ball) {
        if (this.type === "AI") {
            // Simple AI behavior: follow the ball's vertical position
            const targetY = ball.y + (Math.random() * 40 - 20); // Add some randomness to the target position
            const speed = 3 + Math.random() * 3; // Randomize the speed between 3 and 6

            if (targetY < this.y + this.height / 2) {
                this.y -= speed;
            } else if (targetY > this.y + this.height / 2) {
                this.y += speed;
            }

            // Prevent the AI paddle from moving off the canvas
            this.y = Math.max(0, Math.min(this.y, canvas.height - this.height));
        } else if (this.type === "Player") {
            // Move the player paddle based on direction
            this.y += this.direction * 5;

            // Prevent the player paddle from moving off the canvas
            this.y = Math.max(0, Math.min(this.y, canvas.height - this.height));
        }
    }


    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = "white";
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}
