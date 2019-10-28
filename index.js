import * as PIXI from "pixi.js";

import { Tile } from "./tile";
import { Vector } from "./src/vector";

PIXI.Graphics.prototype.dashedLineTo = function(toX, toY, dash = 2, gap = 2) {
	const lastPosition = this.currentPath.points;

	let to = new Vector(toX, toY, 0.0);
	let from = new Vector(
		lastPosition[lastPosition.length - 2],
		lastPosition[lastPosition.length - 1],
		0.0
	);

	let current = from;

	let direction = to.subtract(from);
	let pathLength = direction.length();
	direction = direction.normalize();

	let traversed = 0.0;

	while (traversed < pathLength) {
		current = current.add(direction.multiplyScalar(dash));
		this.lineTo(current.x, current.y);
		current = current.add(direction.multiplyScalar(gap));
		this.moveTo(current.x, current.y);
		traversed += dash + gap;
	}
};

const lightBlue = 0xd7dcde;
let app = new PIXI.Application({
	width: 512,
	height: 512,
	antialias: true,
	resolution: 2
});
app.renderer.backgroundColor = lightBlue;

document.body.appendChild(app.view);
window.app = app;
//window.addEventListener("mousemove", update);
//window.addEventListener("mousedown", redraw);

const inputW = document.getElementById("input_w");
const inputTau = document.getElementById("input_tau");
const inputN = document.getElementById("input_n");
const pCurrentTwistAngle = document.getElementById("p_current_twist_angle");
const pSafeTwistAngle = document.getElementById("p_safe_twist_angle");
inputW.addEventListener("input", redraw);
inputTau.addEventListener("input", redraw);
inputN.addEventListener("input", redraw);

const tile = new Tile();

function redraw(e) {
	// Set tile parameters
	tile.w = parseFloat(inputW.value);
	tile.tau = parseFloat(inputTau.value) * (Math.PI / 180.0);
	tile.n = parseInt(inputN.value);

	pCurrentTwistAngle.innerHTML = `Current twist angle: ${(tile.alpha * (180.0 / Math.PI)).toFixed(2)} Degrees`;
	pSafeTwistAngle.innerHTML = `Safe twist angle: ${(tile.alphaSafe * (180.0 / Math.PI)).toFixed(2)} Degrees`;

	// Rebuild tile geometry and graphics objects
	tile.update();
}

// Call this once to kick off the app
redraw();
