import * as PIXI from "pixi.js";

import { Line } from "./src/line";
import { Matrix } from "./src/matrix";
import { Point } from "./src/point";
import { Polygon } from "./src/polygon";

export class Tile {
	constructor(w = 0.25, tau = 1.25) {
		if (w < 0.0 || w > 1.0) {
			throw new Error("Invalid value for tile parameter `w`");
		}

		this._w = 0.25;
		this._tau = tau;
		this._n = 5;
		this._graphics = new PIXI.Graphics();

		this._center = new Point(
			window.app.renderer.view.width * 0.5,
			window.app.renderer.view.height * 0.5,
			0.0
		);

		this._dirty = true;
	}

	set w(w) {
		if (w < 0.0 || w > 1.0) {
			throw new Error("Invalid value for tile parameter `w`");
		}
		this._w = w;
		this._dirty = true;
	}

	set tau(tau) {
		this._tau = tau;
		this._dirty = true;
	}

	set n(n) {
		this._n = n;
		this._dirty = true;
	}

	get species() {
		return [this._w, this._tau];
	}

	get genus() {
		// Returns `true` if this is a centered twist tile, and `false` otherwise
		return true;
	}

	update() {
		this._tilePolygon = Polygon.regular(200.0, this._n);

		// A rotation matrix to rotate each edge of the tile polygon by `tau`
		let transform = Matrix.rotationZ(this._tau);

		this._edgePoints = []; // The points along the edges of the tile polygon from which the pleats will emanate
		this._pleatLines = []; // The (infinite) lines that run along each of the pleats

		for (let i = 0; i <= this._tilePolygon.points.length; i++) {
			let iModA = (i + 0) % this._tilePolygon.points.length;
			let iModB = (i + 1) % this._tilePolygon.points.length;

			const pointA = this._tilePolygon.points[iModA];
			const pointB = this._tilePolygon.points[iModB];

			const direction = pointB.subtract(pointA);
			const edgeLength = direction.length();
			direction = direction.normalize();

			let distanceC = ((1.0 - this._w) / 2.0) * edgeLength;
			let distanceD = ((1.0 + this._w) / 2.0) * edgeLength;

			let pointC = pointA.addDisplacement(direction.multiplyScalar(distanceC));
			let pointD = pointA.addDisplacement(direction.multiplyScalar(distanceD));
			this._edgePoints.push(pointC, pointD);

			let pleatDirection = transform.multiply(direction);
			this._pleatLines.push(new Line(pointC, pleatDirection));
			this._pleatLines.push(new Line(pointD, pleatDirection));
		}

		let centralPolygonPoints = [];
		for (let i = 0; i < this._pleatLines.length - 2; i += 2) {
			const a = this._pleatLines[i + 0];
			const b = this._pleatLines[i + 1];
			const c = this._pleatLines[i + 2];
			const d = this._pleatLines[i + 3];
			centralPolygonPoints.push(b.intersect(c));
		}

		// Remove the last two lines, as they are duplicates of the first two
		this._pleatLines.pop();
		this._pleatLines.pop();
		this._centralPolygon = new Polygon(centralPolygonPoints);

		// Draw all graphics
		this._graphics.clear();

		// Draw the outer tile polygon
		this._graphics.lineStyle(4, 0xb5a6a5, 1);
		this._graphics.beginFill(0xb5a6a5, 0.125);
		this._graphics.drawPolygon(
			this._tilePolygon.points
				.map(point => {
					return [point.x + this._center.x, point.y + this._center.y];
				})
				.flat()
		);

		// Draw the inner central polygon
		this._graphics.lineStyle(3, 0xb5a6a5, 1);
		this._graphics.beginFill(0xb5a6a5, 0.25);
		this._graphics.drawPolygon(
			this._centralPolygon.points
				.map(point => {
					return [point.x + this._center.x, point.y + this._center.y];
				})
				.flat()
		);
		this._graphics.endFill();

		// Draw the pleats
		this._pleatLines.forEach((line, index) => {
			this._graphics.moveTo(
				line.point.x + this._center.x,
				line.point.y + this._center.y
			);

			let edgeIndex = Math.floor(index / 2);

			if (index % 2 === 0) { // Mountain
				this._graphics.lineStyle(3, 0xb5a6a5, 1);
				edgeIndex -= 1;

				if (edgeIndex < 0) edgeIndex = this._centralPolygon.points.length - 1;

			} else { // Valley			
				this._graphics.lineStyle(2, 0xd96448, 1);
			}

			this._graphics.lineTo(
				this._centralPolygon.points[edgeIndex].x + this._center.x,
				this._centralPolygon.points[edgeIndex].y + this._center.y
			);

			// Can also draw an infinite segment:
			// const direction = line.point.addDisplacement(
			// 	line.direction.multiplyScalar(150.0)
			// );
			// this._graphics.lineTo(
			// 	direction.x + this._center.x,
			// 	direction.y + this._center.y
			// );
		});

		this._graphics.lineStyle(0);

		this._graphics.beginFill(0xbf3054);
		this._edgePoints.forEach(point =>
			this._graphics.drawCircle(
				point.x + this._center.x,
				point.y + this._center.y,
				5.0
			)
		);
		this._graphics.endFill();

		// Scale up everything and draw it at the center of the canvas
		//const drawScale = 200.0;
		//this._graphics.x = this._center.x;
		//this._graphics.y = this._center.y;
		//this._graphics.scale.set(drawScale);

		window.app.stage.addChild(this._graphics);
	}

	moveTo(x, y) {
		this._center.x = x;
		this._center.y = y;
		this._dirty = true;
	}

	draw() {
		if (this._dirty) {
			this.update();
			this._dirty = false;
		}
	}
}
