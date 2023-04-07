export class Ball {
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    public dx: number;
    public dy: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.dx = Math.random() < 0.5 ? -3 : 3;
        this.dy = Math.random() * 4 - 2;
    }


    move(canvas: HTMLCanvasElement) {
        this.x += this.dx;
        this.y += this.dy;

        // Check for collisions with canvas walls and reverse the direction if necessary
        if (this.y <= 0 || this.y + this.height >= canvas.height) {
            this.dy *= -1;
            this.y += this.dy;
        }
    }

    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = "white";
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}
