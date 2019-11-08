import * as PIXI from "pixi.js";

import { Point } from "./src/point";
import { Polygon } from "./src/polygon";

export class Tiling {
	/*
	 *
	 * Construct a tiling from a valid vertex figure.
	 *
	 * Note that `vertexFigure` should correspond to one of
	 * the 11 known Archimedean tilings:
	 *
	 * 3.3.3.3.3.3
	 * 3.3.3.3.6
	 * 3.3.3.4.4
	 * 3.3.4.3.4
	 * 3.3.4.12
	 * 3.4.3.12
	 * 3.3.6.6
	 * 3.6.3.6
	 * 3.4.4.6
	 * 3.4.6.4
	 * 3.12.12
	 * 4.4.4.4
	 * 4.6.12
	 * 4.8.8
	 * 6.6.6
	 *
	 */
	constructor(vertexFigure = [6, 6, 6, 6, 6, 6]) {
		this._vertexFigure = [4, 6, 12];
		this._polygons = this._vertexFigure.map(vertex =>
			Polygon.withSideLength(1.0, vertex)
		);

		this._polygons.forEach(polygon => polygon.scale(20.0));


		console.log(this._polygons);
		this.assemble();
	}

	assemble() {
		console.log('Constructing lattice patch...');

		let latticePatch = [];

		for (let i = 1; i < this._polygons.length; i++) {

			const perpBisectA = this._polygons[0].perpendicularBisector(i);
			const perpBisectB = this._polygons[i].perpendicularBisector(i);

			const theta = perpBisectA.angle(perpBisectB);
			this._polygons[i].rotate(theta);

			// Recalculate this polygon's bisector (since it has been rotated)
		  perpBisectB = this._polygons[i].perpendicularBisector(i);

		  // Calculate a displacement amount
		  const amount = Math.abs(perpBisectA.length() + perpBisectB.length());
		  
		  perpBisectA = perpBisectA.normalize();

			this._polygons[i].move(perpBisectA.multiplyScalar(amount));
		}
	}

	render(scale) {
		console.log('rendering with ', scale);

		let windowCenter = new Point(
			window.app.renderer.view.width * 0.25,
			window.app.renderer.view.height * 0.25,
			0.0
		);

		this._graphics = new PIXI.Graphics();

		//this._graphics.beginFill(0xff0000);
		this._graphics.lineStyle(1, 0x00ff00);
		this._polygons.forEach(polygon => {
			const flatPoints = polygon.points
				.map(point => {
					return [point.x + windowCenter.x, point.y + windowCenter.y];
				})
				.flat();
			this._graphics.drawPolygon(flatPoints);
		});
		//this._graphics.endFill();

		window.app.stage.addChild(this._graphics);
	}
}
