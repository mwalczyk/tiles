import * as PIXI from "pixi.js";

import { Vector } from "./math/vector";

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
