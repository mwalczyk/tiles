import * as PIXI from "pixi.js";

import { Point } from "./src/point";
import { Polygon } from "./src/polygon";
import { Vector } from "./src/vector";
import * as utils from "./src/utils";
import * as lattice from "./lattice";

export const vertexFigures = [
	 [3, 3, 3, 3, 3, 3],
	 [3, 3, 3, 3, 6],
	 [3, 3, 3, 4, 4],
	 [3, 3, 4, 3, 4],
	 [3, 3, 4, 12],
	 [3, 4, 3, 12],
	 [3, 3, 6, 6],
	 [3, 6, 3, 6],
	 [3, 4, 4, 6],
	 [3, 4, 6, 4],
	 [3, 12, 12],
	 [4, 4, 4, 4],
	 [4, 6, 12],
	 [4, 8, 8],
	 [6, 6, 6]
];

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
	constructor(patch) {
		this._latticePatch = lattice.latticePatches[patch];
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

		// Compute lattice vectors
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

			let circumradius = 0.5 / Math.sin(Math.PI / polygon.n);
			let interiorAngle = ((polygon.n - 2) * Math.PI) / polygon.n;

			// Pin the rotation pivot
			base.move(new Vector(-circumradius, 0.0, 0.0));
			base.rotate(interiorAngle * 0.5);
			base.rotate(polygon.rotation * Math.PI);

			polygon.offset.forEach(entry => {
				base.move(new Vector(-Math.cos(entry * Math.PI), -Math.sin(entry * Math.PI), 0.0));
			});

			return base;
		});
		this._latticePolygons.forEach(polygon => polygon.scale(scale));


		// Generate the full tiling (or at least, a couple rows and columns)
		this._polygons = [];
		const rows = 2;
		const cols = 3;
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < cols; j++) {
			
				let iCentered = i - rows/2;
				let jCentered = j - cols/2;
				let offset = this._latticeVector1.multiplyScalar(iCentered).add(this._latticeVector2.multiplyScalar(jCentered));
				offset = offset.multiplyScalar(-scale);

				this._latticePolygons.forEach((polygon, index) => {
					let poly = polygon.copy();
					poly.move(new Vector(offset.x, offset.y, 0.0));
					this._polygons.push(poly);

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

	render(x, y) {
		let windowCenter = new Point(
			window.app.renderer.view.width * 0.25,
			window.app.renderer.view.height * 0.25,
			0.0
		);
		const background = 0xd1cac9;
		const orange = 0xfe8102;

		this._graphics = new PIXI.Graphics();

		this._graphics.lineStyle(0.25, 0xffffff);
		//this._graphics.lineStyle(1.0, orange);

		this._vertexFigurePolygons.forEach((polygon, index) => {
			const flatPoints = polygon.points
				.map(point => {
					const yOffset = 120.0;//y < 100 ? 80.0 : 120.0;
					return [point.x - 0.0, point.y + yOffset];
				})
				.flat();
			const percent = 1.0 / (index + 1.0);
			//this._graphics.beginFill(utils.lerpColor(0x3e9ec7, 0x37ccbb, percent));
			this._graphics.beginFill(background);
			this._graphics.drawPolygon(flatPoints);
			this._graphics.endFill();
		});

		const rows = 2;
		const cols = 3;

		this._polygons.forEach((polygon, index) => {
			const flatPoints = polygon.points
				.map(point => {
					return [point.x, point.y];
				})
				.flat();

			let percent = (index) / (rows * cols * this._latticePolygons.length);
			//this._graphics.beginFill(utils.lerpColor(0xeb5036, 0xede240, percent));
			this._graphics.beginFill(background);
			this._graphics.drawPolygon(flatPoints);
			this._graphics.endFill();

		});

		// Draw the origin
		// this._graphics.lineStyle(0, 0xffffff);
		// this._graphics.beginFill(0x0000000);
		// this._graphics.drawCircle(0.0, 0.0, 2.0);
		// this._graphics.endFill();
		
		this._graphics.x = windowCenter.x + x;
		this._graphics.y = windowCenter.y + y;
		this._graphics.scale.set(1.0);

		window.app.stage.addChild(this._graphics);
	}
}
