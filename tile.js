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

		// The (infinite) lines that run along each of the pleats
		let pleatLines = [];
		for (let i = 0; i <= this._tilePolygon.points.length; i++) {
			// When we reach the last edge of the tile polygon, we need to wrap
			// the vertex indices around to form a closed loop
			const iModA = (i + 0) % this._tilePolygon.points.length;
			const iModB = (i + 1) % this._tilePolygon.points.length;
			const pointA = this._tilePolygon.points[iModA];
			const pointB = this._tilePolygon.points[iModB];

			const direction = pointB.subtract(pointA);
			const edgeLength = direction.length();
			direction = direction.normalize();
			const distanceC = ((1.0 - this._w) / 2.0) * edgeLength;
			const distanceD = ((1.0 + this._w) / 2.0) * edgeLength;

			// The two points that divide this edge
			const pointC = pointA.addDisplacement(
				direction.multiplyScalar(distanceC)
			);
			const pointD = pointA.addDisplacement(
				direction.multiplyScalar(distanceD)
			);

			// The direction of the new pleats (unit vector)
			const pleatDirection = transform.multiply(direction);

			// Both of the lines that form this pleat go in the same direction,
			// but they start at different points
			pleatLines.push(new Line(pointC, pleatDirection));
			pleatLines.push(new Line(pointD, pleatDirection));
		}

		// Calculate the points along the tile polygon's edges from which each
		// of the inner pleats will emanate
		let centralPolygonPoints = [];
		for (let i = 0; i < pleatLines.length - 2; i += 2) {
			// Proceed in groups of 4 (i.e. 2 edges, each with 2 pleats)
			const a = pleatLines[i + 0];
			const b = pleatLines[i + 1];
			const c = pleatLines[i + 2];
			const d = pleatLines[i + 3];
			centralPolygonPoints.push(b.intersect(c));
		}

		// Remove the last two lines, as they are duplicates of the first two
		pleatLines.pop();
		pleatLines.pop();
		this._centralPolygon = new Polygon(centralPolygonPoints);

		// Now, construct the vertices, edges, and assignments that will form this
		// tile's crease pattern
		this._vertices = [];
		this._edges = [];
		this._assignments = [];

		// Add creases from the pleats
		pleatLines.forEach((line, index) => {
			// The index of the edge of the tile polygon from which this pleat emanates
			let edgeIndex = Math.floor(index / 2);

			if (index % 2 === 0) {
				// The first crease of each pleat actually connects to the previous vertex -
				// we also want to make sure that the first time this happens, we wrap around
				// to what actually corresponds to the *last* vertex of the central polygon
				edgeIndex -= 1;
				if (edgeIndex < 0) {
					edgeIndex = this._centralPolygon.points.length - 1;
				}
			}

			this._vertices.push(line.point, this._centralPolygon.points[edgeIndex]);
			this._edges.push([index * 2 + 0, index * 2 + 1]);
			this._assignments.push(index % 2 === 0 ? "M" : "V");
		});

		// Add creases around the central polygon
		for (let i = 0; i < this._centralPolygon.points.length; i++) {
			const iModA = (i + 0) % this._centralPolygon.points.length;
			const iModB = (i + 1) % this._centralPolygon.points.length;
			const pointA = this._centralPolygon.points[iModA];
			const pointB = this._centralPolygon.points[iModB];

			this._edges.push([this._vertices.length + 0, this._vertices.length + 1]);
			this._vertices.push(pointA, pointB);
			this._assignments.push("M");
		}
	}

	render() {
		const tan = 0xb5a6a5;
		const red = 0xbf3054;
		const mountain = 0xbd5e51;
		const valley = 0x3259a8;

		this._graphics.removeChildren();
		this._graphics.clear();
		this._graphics.sortableChildren = true;

		{
			let tileGraphics = new PIXI.Graphics();

			// Draw the tile polygon
			tileGraphics.lineStyle(4, tan);
			tileGraphics.beginFill(tan, 0.25);
			tileGraphics.drawPolygon(
				this._tilePolygon.points
					.map(point => {
						return [point.x + this._center.x, point.y + this._center.y];
					})
					.flat()
			);
			tileGraphics.endFill();

			// Draw the central polygon - do not draw stroked, as the creases
			// will be drawn separately below
			tileGraphics.lineStyle(0);
			tileGraphics.beginFill(tan, 0.25);
			tileGraphics.drawPolygon(
				this._centralPolygon.points
					.map(point => {
						return [point.x + this._center.x, point.y + this._center.y];
					})
					.flat()
			);
			tileGraphics.endFill();

			this._graphics.addChild(tileGraphics);
		}
		{
			// Draw the vertices of the crease pattern
			this._vertices.forEach((vertex, index) => {
				let vertexGraphics = new PIXI.Graphics();

				vertexGraphics.lineStyle(0);
				vertexGraphics.beginFill(red);
				vertexGraphics.drawCircle(
					vertex.x + this._center.x,
					vertex.y + this._center.y,
					3.0
				);
				vertexGraphics.endFill();

				// Add interactivity to this vertex: when the user mouses over it, 
				// display some information 
				vertexGraphics.hitArea = new PIXI.Circle(vertex.x + this._center.x, vertex.y + this._center.y, 6.0);
				vertexGraphics.index = index;
				vertexGraphics.owner = this;
				vertexGraphics.interactive = true;
				vertexGraphics.buttonMode = true;
				vertexGraphics.zIndex = 1;

				vertexGraphics.mouseover = function() {
				  //this.alpha = 0.25;
					this.children.forEach(child => (child.visible = true));
				}
				vertexGraphics.mouseout = function() {
				  this.alpha = 1.0;
					this.children.forEach(child => (child.visible = false));
				}

				const style = new PIXI.TextStyle({
					fontFamily: "Arial",
					fontSize: 10,
					fill: 0xd7dcde
				});

				const textSpacing = 10.0;
				const text = new PIXI.Text(`Vertex ID: ${index}`, style);
				let labelGraphics = new PIXI.Graphics();
				labelGraphics.beginFill(valley);
				labelGraphics.drawRect(0.0, 0.0, text.width, text.height);
				labelGraphics.x = vertex.x + this._center.x + textSpacing;
				labelGraphics.y = vertex.y + this._center.y - textSpacing;
				labelGraphics.endFill();
				labelGraphics.visible = false;
				labelGraphics.addChild(text);

				vertexGraphics.addChild(labelGraphics);

				this._graphics.addChild(vertexGraphics);
			});
		}

		this._edges.forEach((edgeIndices, edgeIndex) => {
			const pleatLineStrokeSize = 2;
			let edgeGraphics = new PIXI.Graphics();

			const [a, b] = edgeIndices;

			edgeGraphics.moveTo(
				this._vertices[a].x + this._center.x,
				this._vertices[a].y + this._center.y
			);

			if (this._assignments[edgeIndex] === "M") {
				// Mountain fold
				edgeGraphics.lineStyle(pleatLineStrokeSize, mountain);
				edgeGraphics.lineTo(
					this._vertices[b].x + this._center.x,
					this._vertices[b].y + this._center.y
				);
			} else {
				// Valley fold
				edgeGraphics.lineStyle(pleatLineStrokeSize, valley);
				edgeGraphics.dashedLineTo(
					this._vertices[b].x + this._center.x,
					this._vertices[b].y + this._center.y
				);
			}

			// A direction vector that runs parallel to this edge
			const direction = this._vertices[b].subtract(this._vertices[a]);

			let orthogonal = new Vector(-direction.y, direction.x, 0.0);
			orthogonal = orthogonal.normalize();

			const customBoundsWidth = 10.0;
			const customBounds = [
				// 1st point
				this._vertices[a].x + this._center.x + orthogonal.x * customBoundsWidth,
				this._vertices[a].y + this._center.y + orthogonal.y * customBoundsWidth,

				// 2nd point
				this._vertices[b].x + this._center.x + orthogonal.x * customBoundsWidth,
				this._vertices[b].y + this._center.y + orthogonal.y * customBoundsWidth,

				// 3rd point
				this._vertices[b].x + this._center.x - orthogonal.x * customBoundsWidth,
				this._vertices[b].y + this._center.y - orthogonal.y * customBoundsWidth,

				// 4th point
				this._vertices[a].x + this._center.x - orthogonal.x * customBoundsWidth,
				this._vertices[a].y + this._center.y - orthogonal.y * customBoundsWidth
			];

			//this.svg.mousedown(this.onMouseDown.bind(this));

			edgeGraphics.hitArea = new PIXI.Polygon(customBounds);

			function onDragStart(event) {
				this.alpha = 0.25;

				// Draw the bounds of this line
				this.drawPolygon(this.hitArea);

				// Reverse the crease assignment
				this.owner._assignments[this.index] =
					this.owner._assignments[this.index] === "M" ? "V" : "M";
			}

			function onDragEnd() {
				// Trigger a re-draw call
				this.alpha = 1.0;
				this.owner.render();
			}

			// Assign custom properties - we need to be able to trigger a re-draw if one
			// of the pleats is clicked
			edgeGraphics.index = edgeIndex;
			edgeGraphics.owner = this;

			// Make this pleat interactive
			edgeGraphics.interactive = true;
			edgeGraphics.buttonMode = true;
			edgeGraphics
				.on("pointerdown", onDragStart)
				.on("pointerup", onDragEnd)
				.on("pointerupoutside", onDragEnd);

			this._graphics.addChild(edgeGraphics);
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

	validate() {}
}
