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
	constructor(center, radius) {
		// The segment width ratio along each of the tile polygon's edges
		this._w = 0.25;

		// The tilt angle of the twist
		this._tau = 120.0 * (Math.PI / 180.0);

		// The number of sides on both the tile polygon and the central polygon
		this._n = 4;

		// The PIXI graphics container
		this._graphics = new PIXI.Graphics();

		// Where this tile will be centered within the app's canvas
		this._center = center;

		this._radius = radius;

		this._selected = false;

		this.buildVertices();
		this.buildEdgesAndAssignments();
		this.render();
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

	set selected(selected) {
		this._selected = selected;
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

	get selected() {
		return this._selected;
	}

	get bounds() {
		const flatPoints = this._tilePolygon.points.map(point => {
				return [point.x + this._center.x, point.y + this._center.y];
		}).flat();

		const poly = new PIXI.Polygon(...flatPoints);
		
		return poly;
	}

	get alphaSafe() {
		// return this._n <= 6
		// 	? this._tilePolygon.interiorAngle
		// 	: this._tilePolygon.exteriorAngle;
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

	buildVertices() {
		// First, create the tile polygon
		this._tilePolygon = Polygon.regular(this._radius, this._n);

		// Then, construct a rotation matrix to rotate each edge of the tile polygon
		// by tilt angle `tau`
		const transform = Matrix.rotationZ(this._tau);

		// The (infinite) lines that run along each of the pleats
		let pleatLines = [];
		for (let i = 0; i < this._tilePolygon.points.length; i++) {
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
		for (let i = 0; i < pleatLines.length; i += 2) {
			// Proceed in groups of 4 (i.e. 2 edges, each with a single pleat, which is
			// itself, 2 line segments)
			const a = pleatLines[(i + 0) % pleatLines.length];
			const b = pleatLines[(i + 1) % pleatLines.length];
			const c = pleatLines[(i + 2) % pleatLines.length];
			const d = pleatLines[(i + 3) % pleatLines.length];
			centralPolygonPoints.push(b.intersect(c));
		}
		this._centralPolygon = new Polygon(centralPolygonPoints);

		// Now, construct the vertices, edges, and assignments that will form this
		// tile's crease pattern
		this._vertices = [];


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

			// We do this so that vertices aren't added twice
			if (index % 2 === 0) {
				this._vertices.push(this._centralPolygon.points[edgeIndex], line.point);
			} else {
				this._vertices.push(line.point);
			}
		});
	}

	buildEdgesAndAssignments() {
		this._edges = [];
		this._assignments = [];	

		// Vertices are numbered around each pleat as follows:
		//
		//     -----------  
		//     | CENTRAL |
		//		 | POLYGON |
		//     3---------0
		//    /					/
		//   /				 /
		//  2         1
		// 
		for (let i = 0; i < this._n; i++) {
			// The first pleat crease
			this._edges.push([(i * 3) + 0, (i * 3) + 1]);
			this._assignments.push("M");

			// The second pleat crease
			this._edges.push([(i * 3) + 2, ((i * 3) + 3) % this._vertices.length]);
			this._assignments.push("V");

			// The crease along the central polygon
			this._edges.push([(i * 3) + 0, ((i * 3) + 3) % this._vertices.length]);
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

			function onDragStart(e) {
				this.data = e.data;
				this.alpha = 0.75;
				this.dragging = true;
			}

			function onDragEnd() {
				this.alpha = 1.0;
				this.dragging = false;
				this.data = null;
			}

			function onDragMove() {
				if (this.dragging) {
					const newPosition = this.data.getLocalPosition(this.parent.parent);
					this.parent.x = newPosition.x;
					this.parent.y = newPosition.y;
				}
			}
			tileGraphics.interactive = true;
			tileGraphics.buttonMode = true;
			tileGraphics
				.on('pointerdown', onDragStart)
	      .on('pointerup', onDragEnd)
	      .on('pointerupoutside', onDragEnd)
	      .on('pointermove', onDragMove);

			// Draw the tile polygon
			if (this._selected) {
				tileGraphics.lineStyle(3, tan);
			} else {
				tileGraphics.lineStyle(1, tan);
			}

			tileGraphics.beginFill(tan, 0.25);
			tileGraphics.drawPolygon(
				this._tilePolygon.points
					.map(point => {
						return [point.x, point.y];
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
						return [point.x, point.y];
					})
					.flat()
			);
			tileGraphics.endFill();

			this._graphics.addChild(tileGraphics);
		}

		// Draw the vertices of the crease pattern
		this._vertices.forEach((vertex, index) => {
			let vertexGraphics = new PIXI.Graphics();

			vertexGraphics.lineStyle(0);
			vertexGraphics.beginFill(red);
			vertexGraphics.drawCircle(
				vertex.x,
				vertex.y,
				3.0
			);
			vertexGraphics.endFill();

			const useText = false;
			if (useText) {
				// Add interactivity to this vertex: when the user mouses over it,
				// display some information
				vertexGraphics.hitArea = new PIXI.Circle(
					vertex.x + this._center.x,
					vertex.y + this._center.y,
					12.0
				);
				vertexGraphics.index = index;
				vertexGraphics.owner = this;
				vertexGraphics.interactive = true;
				vertexGraphics.buttonMode = true;
				vertexGraphics.zIndex = 1;

				vertexGraphics.mouseover = function() {
					this.children.forEach(child => (child.visible = true));
				};
				vertexGraphics.mouseout = function() {
					this.children.forEach(child => (child.visible = false));
				};

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
				labelGraphics.zIndex = 2;
				labelGraphics.addChild(text);

				vertexGraphics.addChild(labelGraphics);
			}

			this._graphics.addChild(vertexGraphics);
		});
	
		this._edges.forEach((edgeIndices, edgeIndex) => {
			const pleatLineStrokeSize = 2;
			let edgeGraphics = new PIXI.Graphics();

			const [a, b] = edgeIndices;

			edgeGraphics.moveTo(
				this._vertices[a].x,
				this._vertices[a].y
			);

			if (this._assignments[edgeIndex] === "M") {
				// Mountain fold
				edgeGraphics.lineStyle(pleatLineStrokeSize, mountain);
				edgeGraphics.lineTo(
					this._vertices[b].x,
					this._vertices[b].y
				);
			} else {
				// Valley fold
				edgeGraphics.lineStyle(pleatLineStrokeSize, valley);
				edgeGraphics.dashedLineTo(
					this._vertices[b].x,
					this._vertices[b].y,
					2.0, 2.0
				);
			}

			// A direction vector that runs parallel to this edge
			const direction = this._vertices[b].subtract(this._vertices[a]);

			let orthogonal = new Vector(-direction.y, direction.x, 0.0);
			orthogonal = orthogonal.normalize();

			const customBoundsWidth = 6.0;
			const customBounds = [
				// 1st point
				this._vertices[a].x + orthogonal.x * customBoundsWidth,
				this._vertices[a].y + orthogonal.y * customBoundsWidth,

				// 2nd point
				this._vertices[b].x + orthogonal.x * customBoundsWidth,
				this._vertices[b].y + orthogonal.y * customBoundsWidth,

				// 3rd point
				this._vertices[b].x - orthogonal.x * customBoundsWidth,
				this._vertices[b].y - orthogonal.y * customBoundsWidth,

				// 4th point
				this._vertices[a].x - orthogonal.x * customBoundsWidth,
				this._vertices[a].y - orthogonal.y * customBoundsWidth
			];

			edgeGraphics.hitArea = new PIXI.Polygon(customBounds);

			// Draw the hit area
			//edgeGraphics.drawPolygon(edgeGraphics.hitArea);

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

		// Center this graphics container
		this._graphics.x = this._center.x;
		this._graphics.y = this._center.y;

		window.app.stage.addChild(this._graphics);
	}

	validate() {}
}
