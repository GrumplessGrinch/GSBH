export var resourceMixin = {
	data: {
		resources: {
			meat: {id: "resource1", name: "Meat", current: 5, productionRate: 0, discovered: true},
			wood: {id: "resource2", name: "Wood", current: 20, max: 100, baseMax: 100, productionRate: 0, discovered: true},
			stone: {id: "resource3", name: "Stone", current: 0, max: 100, baseMax: 100, productionRate: 0, discovered: false},
			clay: {id: "resource4", name: "Clay", current: 0, max: 100, baseMax: 100, productionRate: 0, discovered: false, consumers: []},
			bricks: {id: "resource5", name: "Bricks", current: 0, max: 500, baseMax: 500, productionRate: 0, discovered: false},
			furs: {id: "resource6", name: "Furs", current: 0, max: 50, baseMax: 50, productionRate: 0, discovered: false}
		}
	}
}