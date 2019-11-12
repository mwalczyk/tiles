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

export class Tiling {
	/*
	 *
	 * Construct a tiling from a valid vertex figure.
	 *
	 * Note that `vertexFigure` should correspond to one of
	 * the 11 known Archimedean tilings above
	 *
	 */
	constructor(figureIndex) {
		this._latticePatch = lattice.latticePatches["4.8.8"];
		this._vertexFigure = this._latticePatch.vertexFigure;

		this.assemble();
	}

	assemble() {
		let sum = 0.0;
		this._polygons = this._vertexFigure.map((vertex, index) => {
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

		this._polygons.forEach(polygon => polygon.scale(20.0));

		let latticeVector1 = new Vector(0.0, 0.0, 0.0);
		let latticeVector2 = new Vector(0.0, 0.0, 0.0);
		this._latticePatch.i1.forEach(entry => {
			latticeVector1.x += Math.cos(entry);
			latticeVector1.y += Math.sin(entry);
		});
		this._latticePatch.i2.forEach(entry => {
			latticeVector2.x += Math.cos(entry);
			latticeVector2.y += Math.sin(entry);
		});

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
	}

	render(x, y) {
		let windowCenter = new Point(
			window.app.renderer.view.width * 0.25,
			window.app.renderer.view.height * 0.25,
			0.0
		);

		this._graphics = new PIXI.Graphics();

		this._graphics.lineStyle(0.25, 0xffffff);
		// this._polygons.forEach((polygon, index) => {
		// 	const flatPoints = polygon.points
		// 		.map(point => {
		// 			return [point.x, point.y];
		// 		})
		// 		.flat();
		// 		console.log(flatPoints);
		// 	const percent = 1.0 / (index + 1.0);
		// 	this._graphics.beginFill(utils.lerpColor(0xeb5036, 0xed8345, percent));
		// 	this._graphics.drawPolygon(flatPoints);
		// 	this._graphics.endFill();
		// });

		this._latticePolygons.forEach((polygon, index) => {
			const flatPoints = polygon.points
				.map(point => {
					return [point.x * 20.0, point.y * 20.0];
				})
				.flat();
			console.log(flatPoints);

			const percent = 1.0 / (index + 1.0);
			this._graphics.beginFill(utils.lerpColor(0xeb5036, 0xed8345, percent));
			this._graphics.drawPolygon(flatPoints);
			this._graphics.endFill();
		});
		
		this._graphics.beginFill(0xed8345);
		this._graphics.drawCircle(0.0, 0.0, 1.0);
		this._graphics.endFill();

		this._graphics.x = windowCenter.x + x;
		this._graphics.y = windowCenter.y + y;
		this._graphics.scale.set(0.75);

		window.app.stage.addChild(this._graphics);
	}
}
