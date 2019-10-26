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

	rotate(theta) {
		let transform = Matrix.rotationZ(theta);
		for (let i = 0; i < this._points.length; i++) {
			this._points[i] = transform.multiply(this._points[i]);
		}
	}

	area() {}

	perimeter() {}

	centroid() {}

	perpendicularBisector(index) {}
}
