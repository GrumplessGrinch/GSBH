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
		buyUpgrade: function (upgrade) {
			if (upgrade.orcPrice != undefined)
				this.orcs.current -= upgrade.orcPrice;
			if (upgrade.price != undefined) {
				for (let priceType in upgrade.price) {
					upgrade.price[priceType].type.current -= upgrade.price[priceType].price;
				}
			}
			upgrade.purchased = true;
				
			if (upgrade.type == "upgrade") {
				if (upgrade.resourceDiscovered != undefined)
					upgrade.resourceDiscovered.discovered = true;
				if (upgrade.productionUnlocked != undefined)
					upgrade.productionUnlocked.unlocked = true;
				if (upgrade.buildingUnlocked != undefined)
					upgrade.buildingUnlocked.unlocked = true;
				if (upgrade.orcPriceReduction != undefined)
					this.orcs.priceReduction = this.orcs.priceReduction * (1 - upgrade.orcPriceReduction); // Reduce by a percentage
				
				if (upgrade.buildingUpgradeUnlocked != undefined) {
					upgrade.buildingUpgradeUnlocked.tier++
					upgrade.buildingUpgradeUnlocked.oldTier.current = upgrade.buildingUpgradeUnlocked.current;
					upgrade.buildingUpgradeUnlocked.current = 0;
					
					for (let resource in upgrade.buildingUpgradePrice) {
						upgrade.buildingUpgradePrice[resource].target.price = upgrade.buildingUpgradePrice[resource].price;
						upgrade.buildingUpgradePrice[resource].target.base = upgrade.buildingUpgradePrice[resource].price;
					}
					
					// "Deep" object copy
					upgrade.buildingUpgradeUnlocked.oldTier.price = $.extend(true, {}, upgrade.buildingUpgradeUnlocked.price);
					upgrade.buildingUpgradeUnlocked.oldTier.production = $.extend(true, {}, upgrade.buildingUpgradeUnlocked.production);
					
					this.setResourcePointers();
					this.updateCost(upgrade.buildingUpgradeUnlocked);
					
					for (let prod in upgrade.tierProductionMore.target.production) {
						upgrade.tierProductionMore.target.production[prod].more *= upgrade.tierProductionMore.amount;
					}
				}
				
				if (upgrade.upgradesUnlocked != undefined) {
					for (let i = 0; i < upgrade.upgradesUnlocked.length; i++) {
						upgrade.upgradesUnlocked[i].unlockPoints++;
					}
				}
				
				if (upgrade.productionMore != undefined) {
					for (let prod in upgrade.productionMore.target.production) {
						upgrade.productionMore.target.production[prod].more *= upgrade.productionMore.amount;
					}
					if (upgrade.productionMore.target.oldTier != undefined && upgrade.productionMore.target.oldTier.current > 0) {
						for (let prod in upgrade.productionMore.target.oldTier.production) {
							upgrade.productionMore.target.oldTier.production[prod].more *= upgrade.productionMore.amount;
						}
					}
				}
				
				if (upgrade.productionIncreased != undefined) {
					for (let prod in upgrade.productionIncreased.target.production) {
						upgrade.productionIncreased.target.production[prod].increased += upgrade.productionIncreased.amount;
					}
					if (upgrade.productionIncreased.target.oldTier != undefined && upgrade.productionIncreased.target.oldTier.current > 0) {
						for (let prod in upgrade.productionIncreased.target.oldTier.production) {
							upgrade.productionIncreased.target.oldTier.production[prod].increased += upgrade.productionIncreased.amount;
						}
					}
				}
			}
			
			if (upgrade.type == "expedition") {
				this.logEvent("Your orcs will return soon.");
				var expeditionTimer = setTimeout(expeditionComplete, (upgrade.expeditionTime * 1000));
			
				function expeditionComplete() {
					if (upgrade.resourceDiscovered != undefined)
						upgrade.resourceDiscovered.discovered = true;
					if (upgrade.productionUnlocked != undefined)
						upgrade.productionUnlocked.unlocked = true;
					if (upgrade.buildingUnlocked != undefined)
						upgrade.buildingUnlocked.unlocked = true;
					if (upgrade.upgradesUnlocked != undefined) {
						for (let i = 0; i < upgrade.upgradesUnlocked.length; i++) {
							upgrade.upgradesUnlocked[i].unlockPoints++;
						}
					}
					
					app.orcs.current += upgrade.orcPrice;
					app.logEvent(upgrade.expeditionFlavor);
				}
			}
			
			//Hide the button
			var idString = "#" + upgrade.id;
			var elem = $(idString);
			elem.addClass("purchasedUpgrade");
			
			this.updateProduction();
			this.updateStorage();
			this.updateOrcCost();
			this.cleanUpResources();
		}
	}
}