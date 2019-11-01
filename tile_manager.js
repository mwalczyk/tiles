import { Tile } from "./tile";

export class TileManager {
	constructor() {
		this._tiles = [];
	}

	add(center, radius) {
		this._tiles.push(new Tile(center, radius));
	}

	checkSelection(x, y) {
		this._tiles.forEach((tile, index) => {
			if (tile.bounds.contains(x, y)) {
				tile.selected = true;
				
			}
		}
	}

	update() {

	}
}