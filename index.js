import * as PIXI from "pixi.js";

import { Point } from "./src/point";
import { Tile } from "./tile";
import { Vector } from "./src/vector";

PIXI.Graphics.prototype.dashedLineTo = function(toX, toY, dash=2, gap=2) {
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
	height: 720,
	antialias: true,
	resolution: 1
});
app.renderer.backgroundColor = lightBlue;
app.renderer.view.width = 512;
app.renderer.view.width = 720;

document.body.appendChild(app.view);
window.app = app;

const inputW = document.getElementById("input_w");
const inputTau = document.getElementById("input_tau");
const inputN = document.getElementById("input_n");
const pCurrentTwistAngle = document.getElementById("p_current_twist_angle");
const pSafeTwistAngle = document.getElementById("p_safe_twist_angle");
inputW.addEventListener("input", update);
inputTau.addEventListener("input", update);
inputN.addEventListener("input", update);

let windowCenter = new Point(
	window.app.renderer.view.width * 0.5,
	window.app.renderer.view.height * 0.5,
	0.0);

const tiles = [];
// tiles.push(new Tile(center, 70.0));

const rows = 8;
const cols = 4;
const radius = 70.0;
for (let i = 0; i < rows; i++) {
	for (let j = 0; j < cols; j++) {

		const xOffset = radius * j * 2 - (radius * (cols - 0.5));
		const yOffset = radius * i * 1 - (radius * (rows - 0.5)) * 0.5;

		if (i % 2 === 0 && rows > 1) {
			xOffset += radius;
		}

		const center = windowCenter.addDisplacement(new Vector(xOffset, yOffset, 0.0))
		tiles.push(new Tile(center, radius));

	}
}
function update(e) {
	tiles.forEach((tile, index) => {
		const old = tile.n;

		const percent = index / tiles.length;
		console.log(percent);

		// Set tile parameters
		tile.w = parseFloat(inputW.value);
		tile.tau = parseFloat(inputTau.value)  * percent * (Math.PI / 180.0);
		tile.n = parseInt(inputN.value);

		tile.buildVertices();

		// We only need to rebuild the edges and crease assignments if the number of sides
		// changes - we want to avoid this, since it erases all of the edits that the user
		// has made to the tile 
		if (old !== tile.n) {
			tile.buildEdgesAndAssignments();
		}
		
		pCurrentTwistAngle.innerHTML = `Current twist angle: ${(tile.alpha * (180.0 / Math.PI)).toFixed(2)} Degrees`;
		pSafeTwistAngle.innerHTML = `Safe twist angle: ${(tile.alphaSafe * (180.0 / Math.PI)).toFixed(2)} Degrees`;

		tile.render();
	});

}

// Call this once to kick off the app
update();
