import { Pong } from "./pong";

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const uiContainer = document.createElement("div");
uiContainer.style.position = "absolute";
uiContainer.style.top = "0";
uiContainer.style.left = "0";
uiContainer.style.width = `${canvas.width}px`;
uiContainer.style.height = `${canvas.height}px`;
uiContainer.style.pointerEvents = "none";
canvas.parentElement?.appendChild(uiContainer);
const pong = new Pong(canvas);
pong.start(uiContainer);
