import * as PIXI from "pixi.js";

import { Point } from "./src/point";
import { Tile } from "./tile";
import { Tiling, vertexFigures } from "./tiling";
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

let app = new PIXI.Application({
	width: 512,
	height: 512,
	antialias: true,
	resolution: 2
});
app.renderer.backgroundColor = 0xe6e0df;
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
	window.app.renderer.view.width * 0.25,
	window.app.renderer.view.height * 0.25,
	0.0);

const tiles = [];
//tiles.push(new Tile(windowCenter, 90.0));

const scale = (num, in_min, in_max, out_min, out_max) => {
  return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

const rows = 8;
const cols = 4;
const radius = 45.0;
for (let i = 0; i < rows; i++) {
	for (let j = 0; j < cols; j++) {

		const xOffset = radius * j * 2 - (radius * (cols - 0.5));
		const yOffset = radius * i * 1 - (radius * (rows - 0.5)) * 0.5;

		if (i % 2 === 0 && rows > 1) {
			xOffset += radius;
		}

		const center = windowCenter.addDisplacement(new Vector(xOffset, yOffset, 0.0))
		//tiles.push(new Tile(center, radius, i % 2 === 0));
	}
}
let shiftPressed = false;

window.addEventListener('keydown', e => shiftPressed = e.shiftKey);
window.addEventListener('keyup', e => shiftPressed = e.shiftKey);
app.renderer.view.addEventListener('mousedown', add)

function add(e) {
	const rect = app.renderer.view.getBoundingClientRect();
	const x = e.clientX - rect.left;
	const y = e.clientY - rect.top;

	if (shiftPressed) {
		let tile = new Tile(new Point(x, y, 0.0), 90.0);
		tiles.forEach(tile => tile.selected = false);
		tile.selected = true;
		tiles.push(tile);
	}
	else {
		tiles.forEach(tile => {
			if (tile.bounds.contains(x, y)) {
				tile.selected = true;
				inputW.value = tile.w;
				inputTau.value = tile.tau * (180.0 / Math.PI);
				inputN.value = tile.n;
			} else {
				tile.selected = false;
			}
		});
	}
}

let tilings = [
	new Tiling(0)
];

// for (let i = 0; i < 15; i++) {
// 	tilings.push(new Tiling(i));
// }

function update(e) {
	// tiles.forEach((tile, index) => {

	// 	if (true){//(tile.selected) {
	// 		const old = tile.n;

	// 		const percent = index / tiles.length;

	// 		// Set tile parameters
	// 		tile.w = parseFloat(inputW.value);
	// 		tile.tau = parseFloat(inputTau.value) * (Math.PI / 180.0);// * scale(percent, 0.0, 1.0, 0.5, 1.0);
	// 		tile.n = parseInt(inputN.value);

	// 		tile.buildVertices();

	// 		// We only need to rebuild the edges and crease assignments if the number of sides
	// 		// changes - we want to avoid this, since it erases all of the edits that the user
	// 		// has made to the tile 
	// 		if (old !== tile.n) {
	// 			tile.buildEdgesAndAssignments();
	// 		}
			
	// 		pCurrentTwistAngle.innerHTML = `Current twist angle: ${(tile.alpha * (180.0 / Math.PI)).toFixed(2)} Degrees`;
	// 		pSafeTwistAngle.innerHTML = `Safe twist angle: ${(tile.alphaSafe * (180.0 / Math.PI)).toFixed(2)} Degrees`;
	// 	}
	// 	tile.render();
	// });
	tilings.forEach((tile, index) => {

		tile.render(0, 0)
		// let x = (index % 4.0) - 1.5;
		// let y = Math.floor(index / 4.0) - 1.5;

		// tile.render(x * 100.0, y * 100.0);

	});
}

// Call this once to kick off the app
update();
