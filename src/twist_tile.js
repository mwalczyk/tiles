import * as PIXI from "pixi.js";

import { Line } from "./math/line";
import { Matrix } from "./math/matrix";
import { Point } from "./math/point";
import { Polygon } from "./math/polygon";
import { Vector } from "./math/vector";

/*
 *
 * A class representing a single, centered twist tile.
 *
 */
export class TwistTile {
	constructor(polygon, reversed=false) {
		// The segment width ratio along each of the tile polygon's edges
		this._w = 0.25;

		// The tilt angle of the twist
		this._tau = 120.0 * (Math.PI / 180.0);

		// The polygon that forms the bounds of this twist
		this._tilePolygon = polygon.copy();
		this._tilePolygon.scale(3.0);

		// The PIXI graphics container
		this._graphics = new PIXI.Graphics();

		this._reversed = reversed;

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

	get w() {
		return this._w;
	}

	get tau() {
		return this._tau;
	}

	get n() {
		return this._tilePolygon.n;
	}

	get alphaSafe() {
		return this._tilePolygon.n <= 6
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

	buildVertices() {
		// Construct a rotation matrix to rotate each edge of the tile polygon
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
		for (let i = 0; i < this._tilePolygon.n; i++) {
			// The first pleat crease
			this._edges.push([(i * 3) + 0, (i * 3) + 1]);
			this._assignments.push(this._reversed ? "V" : "M");

			// The second pleat crease
			this._edges.push([(i * 3) + 2, ((i * 3) + 3) % this._vertices.length]);
			this._assignments.push(this._reversed ? "M" : "V");

			// The crease along the central polygon
			this._edges.push([(i * 3) + 0, ((i * 3) + 3) % this._vertices.length]);
			this._assignments.push(this._reversed ? "M" : "V");
		}
	}

	invertPleat(edgeIndex) {
		// Reverse the crease assignment as well as the other 2 creases that form this pleat:
		// the code below works because pleat crease are added in groups of 3
		this._assignments[edgeIndex] = this._assignments[edgeIndex] === "M" ? "V" : "M";

		switch (edgeIndex % 3) {
			case 0:
				// This is the first pleat crease
				this._assignments[edgeIndex + 1] = this._assignments[edgeIndex + 1] === "M" ? "V" : "M";
				this._assignments[edgeIndex + 2] = this._assignments[edgeIndex + 2] === "M" ? "V" : "M";
				break;
			case 1:
				// This is the crease along the central polygon
				this._assignments[edgeIndex + 1] = this._assignments[edgeIndex + 1] === "M" ? "V" : "M";
				this._assignments[edgeIndex - 1] = this._assignments[edgeIndex - 1] === "M" ? "V" : "M";
				break;
			case 2:
				// This is the second pleat crease
				this._assignments[edgeIndex - 1] = this._assignments[edgeIndex - 1] === "M" ? "V" : "M";
				this._assignments[edgeIndex - 2] = this._assignments[edgeIndex - 2] === "M" ? "V" : "M";
				break;
		}
	}

	render() {
		const green = 0xc9ece4;
		const orange = 0xfe8102;
		const mountain = 0x11147a;
		const valley = 0xee4bf6;

		this._graphics.removeChildren();
		this._graphics.clear();
		this._graphics.sortableChildren = true;

		{
			let tileGraphics = new PIXI.Graphics();

			// Draw the tile polygon
			tileGraphics.lineStyle(0.5, orange);
			tileGraphics.beginFill(green);
			tileGraphics.drawPolygon(
				this._tilePolygon.points
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
			vertexGraphics.beginFill(orange);
			vertexGraphics.drawCircle(
				vertex.x,
				vertex.y,
				1.0
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
			const pleatLineStrokeSize = 0.5;
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
					1.0, 1.0
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

			function onDragStart(event) {
				this.alpha = 0.25;

				// Draw the bounds of this line
				this.drawPolygon(this.hitArea);

				// Switch crease assignments along this pleat
				this.owner.invertPleat(this.index);
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
		let windowCenter = new Point(
			window.app.renderer.view.width * 0.25,
			window.app.renderer.view.height * 0.25,
			0.0
		);
		this._graphics.x = windowCenter.x;
		this._graphics.y = windowCenter.y;
		//this._graphics.scale.set(0.5);

		window.app.stage.addChild(this._graphics);
	}

	validate() {}
}
