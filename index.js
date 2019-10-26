import * as PIXI from "pixi.js";

import { Tile } from "./tile";

PIXI.Graphics.prototype.drawDashLine = function(toX, toY, dash = 16, gap = 8) {
	const lastPosition = this.currentPath.shape.points;

	const currentPosition = {
		x: lastPosition[lastPosition.length - 2] || 0,
		y: lastPosition[lastPosition.length - 1] || 0
	};

	const absValues = {
		toX: Math.abs(toX),
		toY: Math.abs(toY)
	};

	for (
		;
		Math.abs(currentPosition.x) < absValues.toX ||
		Math.abs(currentPosition.y) < absValues.toY;

	) {
		currentPosition.x =
			Math.abs(currentPosition.x + dash) < absValues.toX
				? currentPosition.x + dash
				: toX;
		currentPosition.y =
			Math.abs(currentPosition.y + dash) < absValues.toY
				? currentPosition.y + dash
				: toY;

		this.lineTo(currentPosition.x, currentPosition.y);

		currentPosition.x =
			Math.abs(currentPosition.x + gap) < absValues.toX
				? currentPosition.x + gap
				: toX;
		currentPosition.y =
			Math.abs(currentPosition.y + gap) < absValues.toY
				? currentPosition.y + gap
				: toY;

		this.moveTo(currentPosition.x, currentPosition.y);
	}
};

let app = new PIXI.Application({
	width: 512,
	height: 512,
	antialias: true
});
app.renderer.backgroundColor = 0xf2f0f0;

document.body.appendChild(app.view);
window.app = app;
window.addEventListener("mousemove", update);
window.addEventListener("mousedown", draw);

const inputW = document.getElementById("input_w");
const inputTau = document.getElementById("input_tau");
const inputN = document.getElementById("input_n");
inputW.addEventListener("input", draw);
inputTau.addEventListener("input", draw);
inputN.addEventListener("input", draw);

const tile = new Tile();

function update(e) {}

function draw(e) {
	tile.w = parseFloat(inputW.value);
	tile.tau = inputTau.value * (Math.PI / 180.0);
	tile.n = parseInt(inputN.value);
	tile.draw();
}

// Call this once to kick off the app
draw();
