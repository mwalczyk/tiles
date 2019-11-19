import * as PIXI from "pixi.js";

import { Point } from "./src/point";
import { Polygon } from "./src/polygon";
import { Vector } from "./src/vector";
import * as utils from "./src/utils";
import * as lattice from "./lattice";

const scale = 10.0;

export class Tiling {
	/*
	 *
	 * Construct a tiling from a valid vertex figure.
	 *
	 * Note that `vertexFigure` should correspond to one of
	 * the 11 known Archimedean tilings above
	 *
	 */
	constructor(patch, rows=2, columns=3) {
		this._rows = rows;
		this._columns = columns;

		// One tile-able patch of the tiling
		this._latticePatch = lattice.latticePatches[patch];

		// Get the vertex figure that corresponds to this tiling
		this._vertexFigure = this._latticePatch.vertexFigure;

		this.assemble();
	}

	assemble() {
		let sum = 0.0;

		this._vertexFigurePolygons = this._vertexFigure.map((vertex, index) => {
			let base = Polygon.withSideLength(1.0, vertex);
			
			// First translate so that one of the corners of this polygon is coincident 
			// with the origin then rotate around the origin
			let circumradius = 0.5 / Math.sin(Math.PI / vertex);
			let interiorAngle = ((vertex - 2) * Math.PI) / vertex;

			base.move(new Vector(-circumradius, 0.0, 0.0));
			base.rotate(sum + interiorAngle * 0.5);
			sum += interiorAngle;

			return base;
		});
		this._vertexFigurePolygons.forEach(polygon => polygon.scale(scale));

		// Compute lattice vectors, which tell us how to translate copies of the 
		// lattice patch across the plane in order to build a complete tiling
		this._latticeVector1 = new Vector(0.0, 0.0, 0.0);
		this._latticeVector2 = new Vector(0.0, 0.0, 0.0);

		this._latticePatch.i1.forEach(entry => {
			this._latticeVector1.x += Math.cos(entry * Math.PI);
			this._latticeVector1.y += Math.sin(entry * Math.PI);
		});
		this._latticePatch.i2.forEach(entry => {
			this._latticeVector2.x += Math.cos(entry * Math.PI);
			this._latticeVector2.y += Math.sin(entry * Math.PI);
		});	

		// Compute polygons that form a single lattice patch
		this._latticePolygons = this._latticePatch.polygons.map((polygon, index) => {
			let base = Polygon.withSideLength(1.0, polygon.n);

			// Calculate the circumradius and interior angle of this polygon
			let circumradius = 0.5 / Math.sin(Math.PI / polygon.n);
			let interiorAngle = ((polygon.n - 2) * Math.PI) / polygon.n;

			// Translate the polygon so that its first vertex coincides with the origin
			base.move(new Vector(-circumradius, 0.0, 0.0));
			base.rotate(interiorAngle * 0.5); 
			base.rotate(polygon.rotation * Math.PI);

			polygon.offset.forEach(entry => {
				base.move(new Vector(-Math.cos(entry * Math.PI), -Math.sin(entry * Math.PI), 0.0));
			});
			base.scale(scale);

			return base;
		});

		// Generate the full tiling (or at least, a couple rows and columns)
		this._polygons = [];
		for (let i = 0; i < this._rows; i++) {
			for (let j = 0; j < this._columns; j++) {
			
				let iCentered = i - this._rows / 2;
				let jCentered = j - this._columns / 2;
				let offset = this._latticeVector1.multiplyScalar(iCentered).add(this._latticeVector2.multiplyScalar(jCentered));
				offset = offset.multiplyScalar(-scale);

				this._latticePolygons.forEach((polygon, index) => {
					let tilePolygon = polygon.copy();
					tilePolygon.move(new Vector(offset.x, offset.y - 6, 0.0));
					this._polygons.push(tilePolygon);
				});
			}
		}
	}

	get vertexFigurePolygons() {
		return this._vertexFigurePolygons;
	}

	get latticePolygons() {
		return this._latticePolygons;
	}

	get polygons() {
		return this._polygons;
	}

	get latticeVectors() {
		return [this._latticeVector1, this._latticeVector2];
	}

	render(x, y) {
		const background = 0xd1cac9;
		const orange = 0xfe8102;

		this._graphics = new PIXI.Graphics();
		this._graphics.lineStyle(0.25, 0xffffff);

		const showVertexFigure = true;

		if (showVertexFigure) {
			this._vertexFigurePolygons.forEach((polygon, index) => {
				const flatPoints = polygon.points
					.map(point => {
						const yOffset = 120.0;
						return [point.x, point.y + yOffset];
					})
					.flat();
				const percent = 1.0 / (index + 1.0);
				//this._graphics.beginFill(utils.lerpColor(0x3e9ec7, 0x37ccbb, percent));
				this._graphics.beginFill(background);
				this._graphics.drawPolygon(flatPoints);
				this._graphics.endFill();
			});
		}

		// Draw the tiling
		this._polygons.forEach((polygon, index) => {
			const flatPoints = polygon.points
				.map(point => {
					return [point.x, point.y];
				})
				.flat();

			let percent = (index) / (this._rows * this._columns * this._latticePolygons.length);
			//this._graphics.beginFill(utils.lerpColor(0xeb5036, 0xede240, percent));
			this._graphics.beginFill(background);
			this._graphics.drawPolygon(flatPoints);
			this._graphics.endFill();

		});

		// Position this graphics container
		this._graphics.x = x;
		this._graphics.y = y;

		window.app.stage.addChild(this._graphics);
	}

	createPrimalGraph() {

	}

	createDualGraph() {

	}
}
