import { Matrix } from "./matrix";
import { Point } from "./point";

export class Polygon {
	constructor(points) {
		// Clone the points
		this._points = [...points];
	}

	static regular(radius, numberOfSides) {
		// Calculate points in CCW order
		let points = [];
		const sectorAngle = (2.0 * Math.PI) / numberOfSides;
		for (let i = 0; i < numberOfSides; i++) {
			const theta = sectorAngle * i;

			points.push(
				new Point(
					radius * Math.cos(theta),
					radius * Math.sin(theta),
					0.0
				)
			);
		}

		return new Polygon(points);
	}

	get points() {
		return this._points;
	}

	get n() {
		return this._points.length;
	}

	// See: https://www.calculatorsoup.com/calculators/geometry-plane/polygon.php

	get inradius() {
		
	}

	get sideLength() {

	}

	get circumRadius() {

	}

	get area() {

	}

	get perimeter() {

	}

	get interiorAngle() {
		return (90.0 - 180.0 / this.n) * (Math.PI / 180.0);
	}

	get exteriorAngle() {
		return (360 / this.n) * (Math.PI / 180.0);
	}

	get centroid() {

	}

	get perpendicularBisector() {

	}

	isDegenerate() {
		return this._points.length < 3;
	}

	rotate(theta) {
		let transform = Matrix.rotationZ(theta);
		for (let i = 0; i < this._points.length; i++) {
			this._points[i] = transform.multiply(this._points[i]);
		}
	}
}
