export const latticePatches = {
	"3.3.3.3.3.3": {
		vertexFigure: [3, 3, 3, 3, 3, 3],
		i1: [0.0],
		i2: [1.0 / 3.0],
		polygons: [
			{
				n: 3,
				offset: [],
				rotation: 0.0
			},
			{
				n: 3,
				offset: [0.0],
				rotation: 1.0 / 3.0
			}
		]
	},
	"4.4.4.4": {
		vertexFigure: [4, 4, 4, 4],
		i1: [0.0],
		i2: [1.0 / 2.0],
		polygons: [
			{
				n: 4,
				offset: [],
				rotation: 0.0
			}
		]
	},
	"6.6.6": {
		vertexFigure: [6, 6, 6],
		i1: [0.0, 1.0 / 3.0],
		i2: [2.0 / 3.0, 1.0 / 3.0],
		polygons: [
			{
				n: 6,
				offset: [],
				rotation: 0.0
			}
		]
	},
	"3.3.3.3.6": {
		vertexFigure: [3, 3, 3, 3, 6],
		i1: [0.0, 0.0, 1.0 / 3.0],
		i2: [1.0 / 3.0, 2.0 / 3.0, 1.0 / 3.0],
		polygons: [
			{
				n: 3,
				offset: [],
				rotation: 0.0
			},
			{
				n: 3,
				offset: [0.0],
				rotation: 1.0 / 3.0,
			},
			{
				n: 3,
				offset: [0.0],
				rotation: 0.0
			},
			{
				n: 3,
				offset: [0.0, 0.0],
				rotation: 1.0 / 3.0
			},
			{
				n: 3,
				offset: [0.0, 1.0 / 3.0],
				rotation: 0.0
			},
			{
				n: 3,
				offset: [0.0, 1.0 / 3.0, 0.0],
				rotation: 1.0 / 3.0
			},
			{
				n: 3,
				offset: [0.0, 1.0 / 3.0, 1.0 / 3.0],
				rotation: 0.0
			},
			{
				n: 3,
				offset: [0.0, 1.0 / 3.0, 1.0 / 3.0],
				rotation: 1.0 / 3.0
			},
			{
				n: 6,
				offset: [1.0 / 3.0],
				rotation: 0.0
			},
		]
	}, 
	"3.3.3.3.6b": {
		vertexFigure: [3, 3, 3, 3, 6],
		i1: [0.0, -1.0 / 3.0, 0.0],
		i2: [2.0 / 3.0, 2.0 / 3.0, 1.0 / 3.0], 
		polygons: [
			{
				n: 3,
				offset: [],
				rotation: 2.0 / 3.0
			},
			{
				n: 3,
				offset: [],
				rotation: 1.0 / 3.0
			},
			{
				n: 3,
				offset: [],
				rotation: 0.0
			},
			{
				n: 3,
				offset: [0.0],
				rotation: 1.0 / 3.0
			},
			{
				n: 3,
				offset: [1.0 / 3.0],
				rotation: 0.0
			},
			{
				n: 3,
				offset: [0.0, 1.0 / 3.0],
				rotation: 1.0 / 3.0
			},
			{
				n: 3,
				offset: [1.0 / 3.0, 1.0 / 3.0],
				rotation: 0.0
			},
			{
				n: 3,
				offset: [1.0 / 3.0, 1.0 / 3.0],
				rotation: 1.0 / 3.0
			},
			{
				n: 6,
				offset: [2.0 / 3.0],
				rotation: 0.0
			}
		]
	},
	"3.3.3.4.4": {
		vertexFigure: [3, 3, 3, 4, 4],
		i1: [0.0],
		i2: [1.0 / 3.0, 1.0 / 2.0],
		polygons: [
			{
				n: 3,
				offset: [],
				rotation: 0.0
			},
			{
				n: 3,
				offset: [0.0],
				rotation: 1.0 / 3.0
			},
			{
				n: 4,
				offset: [1.0 / 3.0],
				rotation: 0.0
			}
		]
	},
	"3.3.4.3.4": {
		vertexFigure: [3, 3, 4, 3, 4],
		i1: [0.0, 1.0 / 6.0],
		i2: [2.0 / 3.0, 1.0 / 2.0],
		polygons: [
			{
				n: 3,
				offset: [],
				rotation: 0.0
			},
			{
				n: 4,
				offset: [0.0],
				rotation: 1.0 / 6.0
			},
			{
				n: 3,
				offset: [1.0 / 3.0],
				rotation: 1.0 / 6.0
			},
			{
				n: 3,
				offset: [1.0 / 3.0, 1.0 / 6.0],
				rotation: 2.0 / 4.0 // This was 1.0 / 4.0
			},
			{
				n: 4,
				offset: [2.0 / 3.0],
				rotation: 0.0
			},
			{
				n: 3,
				offset: [],
				rotation: 1.0 / 3.0
			}
		]
	},
	"3.4.6.4": {
		vertexFigure: [3, 4, 6, 4],
		i1: [0.0, 1.0 / 6.0, -1.0 / 6.0], 
		i2: [1.0 / 3.0, 1.0 / 6.0, 1.0 / 2.0],
		polygons: [
			{
				n: 4,
				offset: [],
				rotation: 0.0
			},
						{
				n: 3,
				offset: [-1.0 / 3.0],
				rotation: 1.0 / 3.0
			},
			{
				n: 4,
				offset: [-1.0 / 3.0],
				rotation: -1.0 / 6.0
			},
						{
				n: 3,
				offset: [-1.0 / 3.0, -1.0 / 6.0],
				rotation: 0.0
			},
						{
				n: 4,
				offset: [-1.0 / 3.0, -1.0 / 6.0, 0.0],
				rotation: 1.0 / 6.0
			},
						{
				n: 6,
				offset: [0.0],
				rotation: -1.0 / 6.0
			}
		]
	},
	"3.6.3.6": {
		vertexFigure: [3, 6, 3, 6],
		i1: [0.0, 0.0],
		i2: [1.0 / 3.0, 1.0 / 3.0],
		polygons: [
			{
				n: 3,
				offset: [],
				rotation: 0.0
			},
			{
				n: 6,
				offset: [0.0],
				rotation: 0.0
			},
			{
				n: 3,
				offset: [0.0, 0.0, 1.0 / 3.0],
				rotation: 1.0 / 3.0
			}
		]
	},
	"3.12.12": {
		vertexFigure: [3, 12, 12],
		i1: [0.0, -1.0 / 6.0, 0.0, 1.0 / 6.0],
		i2: [1.0 / 3.0, 1.0 / 2.0, 1.0 / 3.0, 1.0 / 6.0],
		polygons: [
			{
				n: 3,
				offset: [],
				rotation: 0.0
			},
			{
				n: 12,
				offset: [0.0, -1.0 / 6.0],
				rotation: 0.0
			},
			{
				n: 3,
				offset: [0.0, -1.0 / 6.0, 0.0, 1.0 / 6.0, 1.0 / 3.0, 1.0 / 2.0],
				rotation: 1.0 / 3.0
			}
		]
	},
	"4.6.12": {
		vertexFigure: [4, 6, 12],
		i1: [0.0, -1.0 / 6.0, 1.0 / 6.0, 1.0 / 2.0, 1.0 / 3.0, 1.0 / 6.0],
		i2: [1.0 / 6.0, 1.0 / 3.0, 1.0 / 2.0, 2.0 / 3.0, 5.0 / 6.0, 1.0/2.0],
		polygons: [
			{
				n: 4,
				offset: [],
				rotation: 0.0
			},
			{
				n: 6,
				offset: [0.0, -1.0 / 6.0],
				rotation: 1.0 / 6.0
			},
			{
				n: 4,
				offset: [0.0, -1.0 / 6.0, 1.0 / 6.0, 1.0 / 2.0],
				rotation: 1.0 / 3.0
			},
			{
				n: 6,
				offset: [0.0, -1.0 / 6.0, 1.0 / 6.0, 1.0 / 2.0, 1.0 / 3.0],
				rotation: 1.0 / 6.0
			},
			{
				n: 4,
				offset: [1.0 / 2.0, 0.0, 1.0 / 6.0, 1.0 / 3.0, 1.0 / 2.0],
				rotation: 1.0 / 6.0
			},
			{
				n: 6,
				offset: [1.0 / 2.0, 0.0, 1.0 / 6.0, 1.0 / 3.0, 1.0 / 2.0, 2.0 / 3.0],
				rotation: 1.0 /  6.0
			},
			{
				n: 12,
				offset: [1.0 / 2.0],
				rotation: 0.0
			}
		]
	},
	"4.8.8": {
		vertexFigure: [4, 8, 8],
		i1: [0.0, -1.0 / 4.0, 0.0, 1.0 / 4.0],
		i2: [0.0, 1.0 / 2.0, 1.0 / 4.0],
		polygons: [
			{
				n: 4,
				offset: [],
				rotation: 0.0
			},
			{
				n: 8,
				offset: [0.0, -1.0 / 4.0],
				rotation: 0.0
			}
		]
	}
};