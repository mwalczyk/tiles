import * as PIXI from "pixi.js";

import { Line } from "./src/line";
import { Matrix } from "./src/matrix";
import { Point } from "./src/point";
import { Polygon } from "./src/polygon";
import { Vector } from "./src/vector";

/*
 *
 * A class representing a single, centered twist tile.
 *
 */
export class Tile {
	constructor(w, tau) {
		// The segment width ratio along each of the tile polygon's edges
		this._w = 0.25;

		// The tilt angle of the twist
		this._tau = tau;

		// The number of sides on both the tile polygon and the central polygon
		this._n = 6;

		// The PIXI graphics container
		this._graphics = new PIXI.Graphics();

		// Where this tile will be centered within the app's canvas
		this._center = new Point(
			window.app.renderer.view.width * 0.25,
			window.app.renderer.view.height * 0.25,
			0.0
		);

		this.update();
	}

	set w(w) {
		if (w <= 0.0 || w >= 1.0) {
			throw new Error("Invalid value for tile parameter `w`");
		}
		this._w = w;
	}

	set tau(tau) {
		this._tau = tau;
	}

	set n(n) {
		if (n < 3) {
			throw new Error("Tile cannot have less than 3 sides");
		}
		this._n = n;
	}

	get w() {
		return this._w;
	}

	get tau() {
		return this._tau;
	}

	get n() {
		return this._n;
	}

	get alphaSafe() {
		return this._n <= 6
			? this._tilePolygon.interiorAngle
			: this._tilePolygon.exteriorAngle;
	}

	get alpha() {
		// TODO: why is this negative?
		return Math.abs(Math.atan(this.w * Math.tan(this.tau)));
	}

	get species() {
		return [this._w, this._tau];
	}

	get genus() {
		// Returns `true` if this is a centered twist tile, and `false` otherwise
		return true;
	}

	recalculate() {
		const radius =
			Math.min(
				window.app.renderer.view.width,
				window.app.renderer.view.height
			) * 0.2;

		// First, create the tile polygon
		this._tilePolygon = Polygon.regular(radius, this._n);

		// Then, construct a rotation matrix to rotate each edge of the tile polygon 
		// by tilt angle `tau`
		const transform = Matrix.rotationZ(this._tau);

		this._edgePoints = []; // The points along the edges of the tile polygon from which the pleats will emanate
		this._pleatLines = []; // The (infinite) lines that run along each of the pleats
		this._pleatAssignments = [];

		for (let i = 0; i <= this._tilePolygon.points.length; i++) {
			const iModA = (i + 0) % this._tilePolygon.points.length;
			const iModB = (i + 1) % this._tilePolygon.points.length;

			const pointA = this._tilePolygon.points[iModA];
			const pointB = this._tilePolygon.points[iModB];

			const direction = pointB.subtract(pointA);
			const edgeLength = direction.length();
			direction = direction.normalize();

			const distanceC = ((1.0 - this._w) / 2.0) * edgeLength;
			const distanceD = ((1.0 + this._w) / 2.0) * edgeLength;

			// The two points that divide up this edge
			const pointC = pointA.addDisplacement(
				direction.multiplyScalar(distanceC)
			);
			const pointD = pointA.addDisplacement(
				direction.multiplyScalar(distanceD)
			);
			this._edgePoints.push(pointC, pointD);

			// The direction of this edge's pleats (unit vector)
			const pleatDirection = transform.multiply(direction);

			// Both of the lines that form this pleat go in the same direction,
			// but they start at different points
			this._pleatLines.push(new Line(pointC, pleatDirection));
			this._pleatLines.push(new Line(pointD, pleatDirection));
			this._pleatAssignments.push("M", "V");
		}






		// Calculate the points along the tile polygon's edges from which each
		// of the inner pleats will emanate
		let centralPolygonPoints = [];
		for (let i = 0; i < this._pleatLines.length - 2; i += 2) {
			// Proceed in groups of 4 (i.e. 2 edges, each with 2 pleats)
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


		this._pleatLines.forEach((line, index) => {
			// Construct edge indices
			let edgeIndex = Math.floor(index / 2);

			if (index % 2 === 0) {
				edgeIndex -= 1;

				// Wrap around
				if (edgeIndex < 0) {
					edgeIndex = this._centralPolygon.points.length - 1;
				}
			}

			// This pleat connects to:
			this._centralPolygon.points[edgeIndex];

			// Alternate M and V assignments

		});

	}

	render() {
		const tan = 0xb5a6a5;
		const red = 0xbf3054;
		const mountain = 0xbd5e51;
		const valley = 0x3259a8;

		this._graphics.removeChildren();
		this._graphics.clear();

		{
			// Draw the tile polygon
			this._graphics.lineStyle(4, tan);
			this._graphics.beginFill(tan, 0.25);
			this._graphics.drawPolygon(
				this._tilePolygon.points
					.map(point => {
						return [point.x + this._center.x, point.y + this._center.y];
					})
					.flat()
			);
			this._graphics.endFill();

			// Draw the vertices of the tile polygon
			this._graphics.lineStyle(0);
			this._graphics.beginFill(red, 0.25);
			this._tilePolygon.points.forEach(point =>
				this._graphics.drawCircle(
					point.x + this._center.x,
					point.y + this._center.y,
					3.0
				)
			);
			this._graphics.endFill();

			// Draw the central polygon
			this._graphics.lineStyle(2, mountain);
			this._graphics.beginFill(tan, 0.25);
			this._graphics.drawPolygon(
				this._centralPolygon.points
					.map(point => {
						return [point.x + this._center.x, point.y + this._center.y];
					})
					.flat()
			);
			this._graphics.endFill();

			// Draw the points along tile polygon edge's where the pleats intersect
			this._graphics.lineStyle(0);
			this._graphics.beginFill(red);
			this._edgePoints.forEach(point =>
				this._graphics.drawCircle(
					point.x + this._center.x,
					point.y + this._center.y,
					3.0
				)
			);
			this._graphics.endFill();
		}

		// Draw the pleats
		this._pleatLines.forEach((line, index) => {
			// The index of the edge of the tile polygon that this pleat emanates from
			let edgeIndex = Math.floor(index / 2);
			const pleatLineStrokeSize = 2;

			let pleatGraphics = new PIXI.Graphics();

			pleatGraphics.moveTo(
				line.point.x + this._center.x,
				line.point.y + this._center.y
			);

			if (index % 2 === 0) {
				edgeIndex -= 1;

				// Wrap around
				if (edgeIndex < 0) {
					edgeIndex = this._centralPolygon.points.length - 1;
				}
			}

			if (this._pleatAssignments[index] === "M") {
				// Mountain fold
				pleatGraphics.lineStyle(pleatLineStrokeSize, mountain);
				pleatGraphics.lineTo(
					this._centralPolygon.points[edgeIndex].x + this._center.x,
					this._centralPolygon.points[edgeIndex].y + this._center.y
				);
			} else {
				// Valley fold
				pleatGraphics.lineStyle(pleatLineStrokeSize, valley);
				pleatGraphics.dashedLineTo(
					this._centralPolygon.points[edgeIndex].x + this._center.x,
					this._centralPolygon.points[edgeIndex].y + this._center.y
				);
			}

			let orthogonal = new Vector(-line.direction.y, line.direction.x, 0.0);
			orthogonal = orthogonal.normalize();

			const customBoundsWidth = 10.0;
			const customBounds = [
				// 1st point
				line.point.x + this._center.x + orthogonal.x * customBoundsWidth,
				line.point.y + this._center.y + orthogonal.y * customBoundsWidth,

				// 2nd point
				this._centralPolygon.points[edgeIndex].x +
					this._center.x +
					orthogonal.x * customBoundsWidth,
				this._centralPolygon.points[edgeIndex].y +
					this._center.y +
					orthogonal.y * customBoundsWidth,

				// 3rd point
				this._centralPolygon.points[edgeIndex].x +
					this._center.x -
					orthogonal.x * customBoundsWidth,
				this._centralPolygon.points[edgeIndex].y +
					this._center.y -
					orthogonal.y * customBoundsWidth,

				// 4th point
				line.point.x + this._center.x - orthogonal.x * customBoundsWidth,
				line.point.y + this._center.y - orthogonal.y * customBoundsWidth
			];

			//this.svg.mousedown(this.onMouseDown.bind(this));

			pleatGraphics.hitArea = new PIXI.Polygon(customBounds);

			function onDragStart(event) {
				this.alpha = 0.25;

				// Draw the bounds of this line
				this.drawPolygon(this.hitArea);

				// Reverse the crease assignment
				this.owner._pleatAssignments[this.index] =
					this.owner._pleatAssignments[this.index] === "M" ? "V" : "M";
			}

			function onDragEnd() {
				this.alpha = 1.0;
				this.owner.render();
			}

			// Assign custom properties - we need to be able to trigger a re-draw if one 
			// of the pleats is clicked
			pleatGraphics.index = index;
			pleatGraphics.owner = this;

			// Make this pleat interactive
			pleatGraphics.interactive = true;
			pleatGraphics.buttonMode = true;
			pleatGraphics
				.on("pointerdown", onDragStart)
				.on("pointerup", onDragEnd)
				.on("pointerupoutside", onDragEnd);

			this._graphics.addChild(pleatGraphics);
		});

		// Scale up everything and draw it at the center of the canvas
		//const drawScale = 200.0;
		//this._graphics.x = this._center.x;
		//this._graphics.y = this._center.y;
		//this._graphics.scale.set(drawScale);

		window.app.stage.addChild(this._graphics);
	}

	update() {
		this.recalculate();
		this.render();
	}

	validate() {
		
	}
}
