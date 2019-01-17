export var buildingMixin = {
	data: {
		buildings: {
			hunter: {
				id: "building0010", name: "Hunter's Lean-To", 
				flavor: "Shelter for orcish hunters.",
				unlocked: true, active: true, consumer: false,
				tier: 1,
				current: 0,
				orcPrice: 1,
				buildingUnlocked: null, //Woodcutter
				price: {
					wood: {price: 10, base: 10, growth: 1.1, type: null},
					stone: {price: 0, base: 0, growth: 1.1, type: null},
					bricks: {price: 0, base: 0, growth: 1.1, type: null}
				},
				production: {
					meat: {base: 1, increased: 1, more: 1, type: null, unlocked: true},
					furs: {base: 0.1, increased: 1, more: 1, type: null, unlocked: false}
				},
				oldTier: {
					current: 0,
					production: {},
					price: {}
				}
			},
			woodcutter: {
				id: "building0020", name: "Scavenger's Lean-To",
				flavor: "The orcs inside will scavenge pieces of wood.",
				unlocked: false, active: true, consumer: false,
				tier: 1,
				current: 0,
				orcPrice: 1, 
				price: {
					wood: {price: 10, base: 10, growth: 1.15, type: null}
				},
				production: {
					wood: {base: 1, increased: 1, more: 1, type: null, unlocked: true}
				}
			},
			stonecutter: {
				id: "building0030", name: "Stone Gatherer's Lean-To",
				flavor: "They find rocks.",
				unlocked: false, active: true, consumer: false,
				tier: 1,
				current: 0,
				orcPrice: 1, 
				buildingUnlocked: null, //Shed
				price: {
					wood: {price: 10, base: 10, growth: 1.2, type: null}
				},
				production: {
					stone: {base: 1, increased: 1, more: 1, type: null, unlocked: true}
				}
			},
			clayPit: {
				id: "building0040", name: "Clay Pit",
				flavor: "Dig for clay.",
				unlocked: false, active: true, consumer: false,
				tier: 1,
				current: 0,
				orcPrice: 1,
				price: {
					wood: {price: 10, base: 10, growth: 1.2, type: null},
					stone: {price: 5, base: 5, growth: 1.2, type: null}
				},
				production: {
					clay: {base: 1, increased: 1, more: 1, type: null, unlocked: true}
				}
			},
			brickmaker: {
				id: "building0050", name: "Brickmaker",
				flavor: "Turns clay into bricks.",
				unlocked: false, active: true, consumer: true,
				tier: 1,
				current: 0,
				orcPrice: 2,
				price: {
					wood: {price: 15, base: 15, growth: 1.2, type: null},
					stone: {price: 10, base: 10, growth: 1.2, type: null}
				},
				production: {
					bricks: {
						base: 2, increased: 1, more: 1, type: null, unlocked: true,
						consumedBase: 1, consumedType: null
					}
				}
			},
			shed: {
				id: "building0060", name: "Storage Shed",
				flavor: "Keep your stuff safe and dry.",
				unlocked: false, active: true, consumer: false,
				tier: 1,
				current: 0,
				price: {
					wood: {price: 25, base: 25, growth: 1.25, type: null},
					stone: {price: 25, base: 25, growth: 1.25, type: null}
				},
				storage: {
					wood: {base: 100, increased: 1, more: 1, type: null},
					stone: {base: 100, increased: 1, more: 1, type: null},
					furs: {base: 50, increased: 1, more: 1, type: null},
				}
			}
		}
	},
	
	methods: {
		addBuilding: function (building) {
			if (building.orcPrice != undefined)
				this.orcs.current -= building.orcPrice;
			
			for (let priceType in building.price) {
				building.price[priceType].type.current -= building.price[priceType].price;
			}
			
			building.current += 1;
			
			if (building.buildingUnlocked != undefined)
				building.buildingUnlocked.unlocked = true;
			
			this.updateCost(building);
			this.updateProduction();
			this.updateStorage();
			this.cleanUpResources();
		},
		
		upgradeBuilding: function (building) {
			for (let priceType in building.oldTier.price) {
				building.oldTier.price[priceType].type.current -= building.oldTier.price[priceType].price;
			}
			
			building.current += 1;
			building.oldTier.current -= 1;
			
			this.updateCost(building);
			this.updateProduction();
			this.updateStorage();
			this.cleanUpResources();
		},
		
		updateCost: function (building) {
			for (let priceType in building.price) {
				building.price[priceType].price = building.price[priceType].base * Math.pow(building.price[priceType].growth, building.current);
				building.price[priceType].price = parseFloat(building.price[priceType].price.toFixed(2));
			}
			if (building.tier > 1)
			{
				for (let priceType in building.oldTier.price) {
					building.oldTier.price[priceType].price = building.price[priceType].base * Math.pow(building.price[priceType].growth, building.current) * this.BUILDING_UPGRADE_PRICE_MOD;
					building.oldTier.price[priceType].price = parseFloat(building.oldTier.price[priceType].price.toFixed(2));
				}
			}
		},
		
		toggleBuilding: function (building) {
			building.active = !building.active;
			this.updateProduction();
		},
		
		isUpgradeDisabled: function (building) {
			for (let priceType in building.oldTier.price) {
				if (!this.floatGTE(building.oldTier.price[priceType].type.current, building.oldTier.price[priceType].price))
					return true;
			}
			return false;
		}
	}
}