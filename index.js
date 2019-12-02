import * as PIXI from "pixi.js";

import * as _ from "./src/dashed_line";
import * as lattice from "./src/lattice";
import { Point } from "./src/math/point";
import { Tiling } from "./src/tiling";
import { TwistTile } from "./src/twist_tile";
import { Vector } from "./src/math/vector";

let app = new PIXI.Application({
	width: 512,
	height: 720,
	antialias: true,
	resolution: 2
});
const divRender = document.getElementById("render");
app.renderer.backgroundColor = 0xe6e0df;
app.view.width = divRender.clientWidth;

document.body.appendChild(app.view);

//divRender.appendChild(app.view);


//app.renderer.width = divRender.clientWidth;
//document.documentElement.clientWidth
window.app = app;

const inputW = document.getElementById("input_w");
const inputTau = document.getElementById("input_tau");
const divDropdown = document.getElementById("div_dropdown");
const pCurrentTwistAngle = document.getElementById("p_current_twist_angle");
const pSafeTwistAngle = document.getElementById("p_safe_twist_angle");
inputW.addEventListener("input", update);
inputTau.addEventListener("input", update);

let windowCenter = new Point(
	(app.renderer.view.width * 0.5) / app.renderer.resolution,
	(app.renderer.view.height * 0.5) / app.renderer.resolution,
	0.0
);

let currentTiling = "4.6.12";
let tiling = new Tiling(currentTiling);
let twistTiles = [];
build();

function build() {
	// Clear all graphics objects from the stage
	app.stage.removeChildren();

	// Build the tiling (lattice patch, etc.)
	tiling = new Tiling(currentTiling);

	// From the polygons of the tiling, build twist tiles
	twistTiles = tiling.polygons.map((polygon, index) => {
		return new TwistTile(polygon);
	});
}

// Whenever one of the drop-down menu items is clicked, we need to rebuild
// the tiling and draw it
[...document.getElementsByClassName("tiling")].forEach(tilingOption => {
	tilingOption.addEventListener("click", event => {
		currentTiling = event.target.innerHTML;
		build();
		update();
	});
});

function update() {
	twistTiles.forEach((tile, index) => {
		// Set tile parameters
		tile.w = parseFloat(inputW.value);
		tile.tau = parseFloat(inputTau.value) * (Math.PI / 180.0);
		tile.buildVertices();

		pCurrentTwistAngle.innerHTML = `Current twist angle: ${(
			tile.alpha *
			(180.0 / Math.PI)
		).toFixed(2)} Degrees`;
		pSafeTwistAngle.innerHTML = `Safe twist angle: ${(
			tile.alphaSafe *
			(180.0 / Math.PI)
		).toFixed(2)} Degrees`;

		tile.render();
	});

	tiling.render(windowCenter.x - 200.0, windowCenter.y);
}

// Call this once to kick off the app
update();
