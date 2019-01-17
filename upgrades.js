export var upgradeMixin = {
	data: {
		upgrades: {
			stoneScout: {
				id: "upgrade0010", name: "Explore Nearby",
				flavor: "Send a few orcs to look around. May discover new resources.",
				unlockReq: 0, unlockPoints: 0, purchased: false, type: "expedition", expeditionTime: 10, //Seconds
				expeditionFlavor: "Your orcs have returned. They discovered a strange hole which leads to a network of tunnels under the swamp. " +
					"They didn't go very far inside, but they report the presence of stone, which may be useful.",
				orcPrice: 5,
				resourceDiscovered: null, //Stone
				buildingUnlocked: null, //Stonecutters
				upgradesUnlocked: [] //Stone Weapons, Clay Scout, Stone Axes
			},
			clayScout: {
				id: "upgrade0020", name: "Send More Scouts",
				flavor: "Send a few more orcs to look around. May discover new resources.",
				unlockReq: 1, unlockPoints: 0, purchased: false, type: "expedition", expeditionTime: 10, //Seconds
				expeditionFlavor: "Your orcs have returned. They discovered deposits of rich clay in the swamp nearby.",
				orcPrice: 10,
				resourceDiscovered: null, //Clay
				buildingUnlocked: null, //Claypit
				upgradesUnlocked: [] //Brickmaking
			},
			fire: {
				id: "upgrade0025", name: "Fire",
				flavor: "Fire pleases the Orcmother. Orcs will cost 10% less meat.",
				unlockReq: 0, unlockPoints: 0, purchased: false, type: "upgrade",
				price: {
					wood: {price: 25, type: null}
				},
				orcPriceReduction: 0.1,
				upgradesUnlocked: [] //Brickmaking
			},
			stoneWeapons: {
				id: "upgrade0030", name: "Stone Weapons",
				flavor: "With stone spears and knives, your hunters will have 100% increased effectiveness.",
				unlockReq: 1, unlockPoints: 0, purchased: false, type: "upgrade",
				price: {
					wood: {price: 25, type: null},
					stone: {price: 25, type: null}
				},
				productionIncreased: {
					amount: 1, target: null //Hunter
				},
				upgradesUnlocked: [] //Skinning
			},
			stoneAxes: {
				id: "upgrade0032", name: "Stone Axes",
				flavor: "Start chopping down trees instead of just gathering fallen branches. 50% increased effectiveness.",
				unlockReq: 1, unlockPoints: 0, purchased: false, type: "upgrade",
				price: {
					wood: {price: 25, type: null},
					stone: {price: 50, type: null}
				},
				productionIncreased: {
					amount: 0.5, target: null //Woodcutter
				}
			},
			brickmaking: {
				id: "upgrade0035", name: "Brickmaking",
				flavor: "Learn how to bake clay into sturdy building materials.",
				unlockReq: 2, unlockPoints: 0, purchased: false, type: "upgrade",
				price: {
					wood: {price: 150, type: null},
					clay: {price: 50, type: null}
				},
				resourceDiscovered: null, //Bricks
				buildingUnlocked: null, //Brickmaker
				upgradesUnlocked: [] //Brick hunters
			},
			brickHunters: {
				id: "upgrade0040", name: "Sturdy Hunter's Shacks",
				flavor: "Unlock the ability to upgrade your Hunter's Lean-Tos, improving their production.",
				unlockReq: 1, unlockPoints: 0, purchased: false, type: "upgrade",
				price: {
					wood: {price: 100, type: null},
					stone: {price: 75, type: null},
					bricks: {price: 200, type: null}
				},
				buildingUpgradeUnlocked: null, //Hunter
				buildingUpgradePrice: {
					wood: {price: 10, target: null},
					stone: {price: 5, target: null},
					bricks: {price: 10, target: null}
				},
				tierProductionMore: {
					amount: 2, target: null //Hunter
				}
			},
			skinning: {
				id: "upgrade0050", name: "Skinning",
				flavor: "With stone tools and some experimentation, your hunters will also gather furs from their kills.",
				unlockReq: 1, unlockPoints: 0, purchased: false, type: "upgrade",
				price: {
					wood: {price: 50, type: null},
					stone: {price: 50, type: null}
				},
				resourceDiscovered: null, //Furs
				productionUnlocked: null, //Hunter furs
				upgradesUnlocked: [] //Fur clothes
			},
			furClothes: {
				id: "upgrade0060", name: "Fur Clothes",
				flavor: "Warmer hunters are more effective.",
				unlockReq: 1, unlockPoints: 0, purchased: false, type: "upgrade",
				price: {
					furs: {price: 25, type: null}
				},
				productionMore: {
					amount: 1.5, target: null //Hunter
				}
			}
		}
	},
	
	methods: {
		
	}
}