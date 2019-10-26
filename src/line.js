import { Point } from "./point";
import { Vector } from "./vector";

export class LineSegment {
	constructor(pointA, pointB) {
		if (!(pointA instanceof Point) || !(pointB instanceof Point)) {
			throw new Error(
				"Attempting to construct `Line` from object(s) that are not of type `Point`"
			);
		}
		this.pointA = pointA.copy();
		this.pointB = pointB.copy();
	}

	pointAt(percent) {
		// Make sure `percent` is between 0 and 1
		percent = Math.min(Math.max(percent, 0.0), 1.0);

		const direct = pointB.subtract(pointA).normalize();
		return this.pointA + direct.multiplyScalar(percent);
	}

	midpoint() {
		return new Point(
			(this.pointA.x + this.pointB.x) * 0.5,
			(this.pointA.y + this.pointB.y) * 0.5,
			(this.pointA.z + this.pointB.z) * 0.5
		);
	}

	perpendicular() {
		// Note that this only works in 2-dimensional space
		const direct = this.pointB.subtract(pointA).normalize();
		let orthogonal = new Vector(direct.y, -direct.x, 0.0);

		// Keep the "handedness" of the line: `orthogonal` will always
		// be pointing "left" from `direct`
		if (direct.cross(orthogonal).z < 0.0) {
			orthogonal = orthogonal.reverse();
		}
		return orthogonal;
	}
}

/*
 *
 * A class representing an infinite line in 3-space, represented in parametric form.
 *
 */
export class Line {
	constructor(point, direction) {
		if (!(point instanceof Point) || !(direction instanceof Vector)) {
			throw new Error(
				"Attempting to construct `Line` from object(s) that are not the correct types"
			);
		}
		this._point = point.copy();
		this._direction = direction.copy();
	}

	get point() {
		return this._point;
	}

	get direction() {
		return this._direction;
	}

	intersect(other) {
		// Reference: http://www.songho.ca/math/line/line.html#intersect_lineline
		const p = this.point; // P1
		const v = this.direction; // v
		const q = other.point; // Q1
		const u = other.direction; // u

		// find a = v x u
		const a = v.cross(u); // cross product

		// if v and u are parallel, then no intersection, return NaN point
		if (a.x == 0 && a.y == 0 && a.z == 0) return new Vector(NAN, NAN, NAN);

		// find b = (Q1-P1) x u
		const b = q.subtract(p).cross(u); // cross product

		// find t = b/a = (Q1-P1) x u / (v x u)
		let t = 0;
		if (a.x != 0) t = b.x / a.x;
		else if (a.y != 0) t = b.y / a.y;
		else if (a.z != 0) t = b.z / a.z;

		// find intersection point
		const point = p.addDisplacement(v.multiplyScalar(t)); // substitute t to line1
		return point;
	}
}