import { Matrix } from "./matrix";
import { Point } from "./point";

export class Polygon {
	constructor(points) {
		this._points = [...points];
		this._center = new Point.origin();
	}

	/*
	 *
	 * @private
	 *
	 * Calculates an array of points that form a regular polygon with `n` 
	 * sides and unit circumradius.
	 *
	 */
	static _calculate(n) {
		// Calculate the polygon's points in CCW order
		let points = [];
		const sectorAngle = (2.0 * Math.PI) / n;

		for (let i = 0; i < n; i++) {
			const theta = sectorAngle * i;

			points.push(
				new Point(
					Math.cos(theta),
					Math.sin(theta),
					0.0
				)
			);
		}

		return points;
	}

	static withCircumradius(circumradius, numberOfSides) {
		let points = Polygon._calculate(numberOfSides);

		points.forEach((point, index) => {
			points[index] = point.scale(circumradius);
		});

		return new Polygon(points);
	}

	static withSideLength(sideLength, numberOfSides) {
		const circumradius = sideLength / (2.0 * Math.sin(Math.PI / numberOfSides));
		return Polygon.withCircumradius(circumradius, numberOfSides);
	}

	get points() {
		return this._points;
	}

	get center() {
		return this._center;
	}

	get n() {
		return this._points.length;
	}

	// See: https://www.calculatorsoup.com/calculators/geometry-plane/polygon.php

	get inradius() {
		return this._circumradius * Math.cos(Math.PI / this.n);
	}

	get sideLength() {
		return 2.0 * this._circumradius * Math.sin(Math.PI / this.n);
	}

	get circumradius() {

	}

	get area() {

	}

	get perimeter() {

	}

	get interiorAngle() {
		return (90.0 - 180.0 / this.n) * (Math.PI / 180.0);
	}

	get exteriorAngle() {
		return (360.0 / this.n) * (Math.PI / 180.0);
	}

	midpoingAlongEdge(index) {
		if (index < 0 || index >= this.n) {
			throw new Error("Edge index out of range");
		}

		const pointA = this.points[index + 0];
		const pointB = this.points[index + 1];

		const midpoint = new Point(
			(pointA.x + pointB.x) * 0.5,
			(pointA.y + pointB.y) * 0.5,
			(pointA.z + pointB.z) * 0.5);

		return midpoint;
	}

	perpendicularBisector(index) {
		if (index < 0 || index >= this.n) {
			throw new Error("Edge index out of range");
		}

		const midpoint = this.midpoingAlongEdge(index);

		return midpoint.subtract(this.center);
	}

	isDegenerate() {
		return this._points.length < 3;
	}

	scale(amount) {
		this._points.forEach((point, index) => {
			this._points[index] = this._points[index].scale(amount); 
		});
	}

	rotate(theta) {
		let transform = Matrix.rotationZ(theta);
		this._points.forEach((point, index) => {
			const rotated = transform.multiply(this._points[index]);

			// We have to do this since the rotation function above actually returns a `Vector`
			this._points[index] = new Point(rotated.x, rotated.y, rotated.z);
		});

		// Note that rotation does not change the center of this polygon
	}

	move(displacement) {
		this._points.forEach((point, index) => {
			this._points[index] = this._points[index].addDisplacement(displacement); 
		});

		this._center = this._center.addDisplacement(displacement);
	}
}
