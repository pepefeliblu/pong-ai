import { Pong } from "./pong";

const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const pong = new Pong(canvas);

pong.start();
