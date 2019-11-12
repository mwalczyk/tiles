import * as PIXI from "pixi.js";

import * as lattice from "./lattice";
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
	height: 720,
	antialias: true,
	resolution: 2
});
app.renderer.backgroundColor = 0xe6e0df;
document.body.appendChild(app.view);
window.app = app;

const inputW = document.getElementById("input_w");
const inputTau = document.getElementById("input_tau");
const pCurrentTwistAngle = document.getElementById("p_current_twist_angle");
const pSafeTwistAngle = document.getElementById("p_safe_twist_angle");
inputW.addEventListener("input", update);
inputTau.addEventListener("input", update);

let windowCenter = new Point(
	window.app.renderer.view.width * 0.25,
	window.app.renderer.view.height * 0.25,
	0.0);

// Create all lattice patches
// let tilings = []
// for (let patch in lattice.latticePatches) {
// 	tilings.push(new Tiling(patch));
// }
let tilings = [new Tiling("4.6.12")];

let twistTiles = tilings[0].polygons.map((polygon, index) => {
	return new Tile(polygon, true);
})

function update(e) {
	twistTiles.forEach((tile, index) => {

		if (true){
			const percent = index / twistTiles.length;

			// Set tile parameters
			tile.w = parseFloat(inputW.value);
			tile.tau = parseFloat(inputTau.value) * (Math.PI / 180.0);
			tile.buildVertices();
			
			pCurrentTwistAngle.innerHTML = `Current twist angle: ${(tile.alpha * (180.0 / Math.PI)).toFixed(2)} Degrees`;
			pSafeTwistAngle.innerHTML = `Safe twist angle: ${(tile.alphaSafe * (180.0 / Math.PI)).toFixed(2)} Degrees`;
		}
		tile.render();
	});

	tilings.forEach((tile, index) => {
		// let x = (index % 4.0) - 1.5;
		// let y = Math.floor(index / 4.0) - 1.25;
		// tile.render(x * 120.0, y * 220.0);
		tile.render(-200.0, 0.0);
	});
}

// Call this once to kick off the app
update();
