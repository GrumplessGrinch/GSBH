var app = new Vue({
	el: '#app',
	data: {
		EPSILON: 0.00001,
		TICKSPEED: 100, // Milliseconds
		SIG_DIGITS: 2,
		eventLog: [],
		
		orcs: {
			id: "orcs", name: 'Orcs', current: 0, total: 0, price: 5, priceBase: 5, priceGrowth: 1.25, priceReduction: 1,
			producing: false, productionTime: 10 //Seconds
		},
		resources: {
			meat: {id: "resource1", name: "Meat", current: 5, productionRate: 0, discovered: true},
			wood: {id: "resource2", name: "Wood", current: 20, max: 100, baseMax: 100, productionRate: 0, discovered: true},
			stone: {id: "resource3", name: "Stone", current: 0, max: 100, baseMax: 100, productionRate: 0, discovered: false},
			clay: {id: "resource4", name: "Clay", current: 0, max: 100, baseMax: 100, productionRate: 0, discovered: false, consumers: []},
			bricks: {id: "resource5", name: "Bricks", current: 0, max: 500, baseMax: 500, productionRate: 0, discovered: false},
			furs: {id: "resource6", name: "Furs", current: 0, max: 50, baseMax: 50, productionRate: 0, discovered: false}
		},
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
					production: {}
				}
			},
			woodcutter: {
				id: "building0020", name: "Scavenger's Lean-To",
				flavor: "The orcs inside will scavenge pieces of wood.",
				unlocked: false, active: true, consumer: false,
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
		},
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
				buildingUpgradeUnlocked: null,
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
		},
		tabs: {
			buildings: {id: "tab1", tabID: "buildingTab", name: "Buildings"},
			upgrades: {id: "tab2", tabID: "upgradeTab", name: "Upgrades"}
		}
	},
	
	// This runs after the data object is created
	// Adds data with dependencies
	created: function () {
		for (let building in this.buildings) {
			if (this.buildings[building].price.wood != undefined)
				this.buildings[building].price.wood.type = this.resources.wood;
			if (this.buildings[building].price.stone != undefined)
				this.buildings[building].price.stone.type = this.resources.stone;
			if (this.buildings[building].price.bricks != undefined)
				this.buildings[building].price.bricks.type = this.resources.bricks;
		}
		
		for (let upgrade in this.upgrades) {
			if (this.upgrades[upgrade].price != undefined) {
				if (this.upgrades[upgrade].price.wood != undefined)
					this.upgrades[upgrade].price.wood.type = this.resources.wood;
				if (this.upgrades[upgrade].price.stone != undefined)
					this.upgrades[upgrade].price.stone.type = this.resources.stone;
				if (this.upgrades[upgrade].price.clay != undefined)
					this.upgrades[upgrade].price.clay.type = this.resources.clay;
				if (this.upgrades[upgrade].price.furs != undefined)
					this.upgrades[upgrade].price.furs.type = this.resources.furs;
				if (this.upgrades[upgrade].price.bricks != undefined)
					this.upgrades[upgrade].price.bricks.type = this.resources.bricks;
			}
		}

		this.buildings.hunter.production.meat.type = this.resources.meat;
		this.buildings.hunter.production.furs.type = this.resources.furs;
		this.buildings.hunter.buildingUnlocked = this.buildings.woodcutter;
		
		this.buildings.woodcutter.production.wood.type = this.resources.wood;
		
		this.buildings.stonecutter.production.stone.type = this.resources.stone;
		this.buildings.stonecutter.buildingUnlocked = this.buildings.shed;
		
		this.buildings.clayPit.production.clay.type = this.resources.clay;
		
		this.buildings.brickmaker.production.bricks.type = this.resources.bricks;
		this.buildings.brickmaker.production.bricks.consumedType = this.resources.clay;
		this.resources.clay.consumers.push(this.buildings.brickmaker);
		
		this.buildings.shed.storage.wood.type = this.resources.wood;
		this.buildings.shed.storage.stone.type = this.resources.stone;
		this.buildings.shed.storage.furs.type = this.resources.furs;
		
		this.upgrades.stoneScout.resourceDiscovered = this.resources.stone;
		this.upgrades.stoneScout.buildingUnlocked = this.buildings.stonecutter;
		this.upgrades.stoneScout.upgradesUnlocked.push(this.upgrades.stoneWeapons);
		this.upgrades.stoneScout.upgradesUnlocked.push(this.upgrades.stoneAxes);
		this.upgrades.stoneScout.upgradesUnlocked.push(this.upgrades.clayScout);
		
		this.upgrades.clayScout.resourceDiscovered = this.resources.clay;
		this.upgrades.clayScout.buildingUnlocked = this.buildings.clayPit;
		this.upgrades.clayScout.upgradesUnlocked.push(this.upgrades.brickmaking);
		
		this.upgrades.fire.upgradesUnlocked.push(this.upgrades.brickmaking);
		
		this.upgrades.stoneWeapons.upgradesUnlocked.push(this.upgrades.skinning);
		this.upgrades.stoneWeapons.productionIncreased.target = this.buildings.hunter;
		
		this.upgrades.stoneAxes.productionIncreased.target = this.buildings.woodcutter;
		
		this.upgrades.brickmaking.resourceDiscovered = this.resources.bricks;
		this.upgrades.brickmaking.buildingUnlocked = this.buildings.brickmaker;
		this.upgrades.brickmaking.upgradesUnlocked.push(this.upgrades.brickHunters);
		
		this.upgrades.brickHunters.buildingUpgradeUnlocked = this.buildings.hunter;
		this.upgrades.brickHunters.buildingUpgradePrice.wood.target = this.buildings.hunter.price.wood;
		this.upgrades.brickHunters.buildingUpgradePrice.stone.target = this.buildings.hunter.price.stone;
		this.upgrades.brickHunters.buildingUpgradePrice.bricks.target = this.buildings.hunter.price.bricks;
		this.upgrades.brickHunters.tierProductionMore.target = this.buildings.hunter;
		
		this.upgrades.skinning.resourceDiscovered = this.resources.furs;
		this.upgrades.skinning.productionUnlocked = this.buildings.hunter.production.furs;
		this.upgrades.skinning.upgradesUnlocked.push(this.upgrades.furClothes);
		
		this.upgrades.furClothes.productionMore.target = this.buildings.hunter;
	},
	
	computed: {
		meatForNextOrc: function () {
			var remaining = parseFloat((this.orcs.price - this.resources.meat.current).toFixed(2));
			if (remaining < 0)
				return 0;
			else return remaining;
		}
	},
	
	methods: {
		// Less awful floating point comparison functions.
		floatLTE: function (a, b) {
			return (a - this.EPSILON <= b);
		},
		
		floatGTE: function (a, b) {
			return (a + this.EPSILON >= b);
		},
		
		tick: function () {
			this.produceResources();
			
			if (this.floatGTE(this.resources.meat.current, this.orcs.price) && !this.orcs.producing)
				this.produceOrc();
		},
		
		logEvent: function (text) {
			this.eventLog.push("- " + text);
		},
		
		selectTab: function (tab) {
			var idString;
			var tabElement;
			for (let eachTab in this.tabs) {
				idString = "#" + this.tabs[eachTab].tabID;
				tabElement = $(idString);
				tabElement.addClass("inactiveTab");
				
				idString = "#" + this.tabs[eachTab].id;
				tabElement = $(idString);
				tabElement.removeClass("highlighted");
			}
			idString = "#" + tab.tabID;
			tabElement = $(idString);
			tabElement.removeClass("inactiveTab");
			
			idString = "#" + tab.id;
			tabElement = $(idString);
			tabElement.addClass("highlighted");
		},
	
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
					
					// "Deep" object copy
					upgrade.buildingUpgradeUnlocked.oldTier.production = $.extend(true, {}, upgrade.buildingUpgradeUnlocked.production);
					
					for (let prod in upgrade.tierProductionMore.target.production) {
						upgrade.tierProductionMore.target.production[prod].more *= upgrade.tierProductionMore.amount;
					}
					
					for (let resource in upgrade.buildingUpgradePrice) {
						upgrade.buildingUpgradePrice[resource].target.price = upgrade.buildingUpgradePrice[resource].price;
						upgrade.buildingUpgradePrice[resource].target.base = upgrade.buildingUpgradePrice[resource].price;
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
		},
		
		updateCost: function (building) {
			for (let priceType in building.price) {
				building.price[priceType].price = building.price[priceType].base * Math.pow(building.price[priceType].growth, building.current);
				building.price[priceType].price = parseFloat(building.price[priceType].price.toFixed(2));
			}
		},
		
		updateProduction: function () {
			var meatProd = 0;
			meatProd += this.buildings.hunter.production.meat.base * this.buildings.hunter.current *
				this.buildings.hunter.production.meat.increased * this.buildings.hunter.production.meat.more;
			if (this.buildings.hunter.tier > 1)
				meatProd += this.buildings.hunter.oldTier.production.meat.base * this.buildings.hunter.oldTier.current *
					this.buildings.hunter.oldTier.production.meat.increased * this.buildings.hunter.oldTier.production.meat.more;
			this.resources.meat.productionRate = meatProd;
			
			var woodProd = 0;
			woodProd += this.buildings.woodcutter.production.wood.base * this.buildings.woodcutter.current *
				this.buildings.woodcutter.production.wood.increased * this.buildings.woodcutter.production.wood.more;
			this.resources.wood.productionRate = woodProd;
			
			var stoneProd = 0;
			stoneProd += this.buildings.stonecutter.production.stone.base * this.buildings.stonecutter.current * 
				this.buildings.stonecutter.production.stone.increased * this.buildings.stonecutter.production.stone.more;
			this.resources.stone.productionRate = stoneProd;
			
			var fursProd = 0;
			if (this.buildings.hunter.production.furs.unlocked)
				fursProd += this.buildings.hunter.production.furs.base * this.buildings.hunter.current * 
					this.buildings.hunter.production.furs.increased * this.buildings.hunter.production.furs.more;
				if (this.buildings.hunter.tier > 1)
					fursProd += this.buildings.hunter.oldTier.production.furs.base * this.buildings.hunter.oldTier.current * 
						this.buildings.hunter.oldTier.production.furs.increased * this.buildings.hunter.oldTier.production.furs.more;
			this.resources.furs.productionRate = fursProd;
			
			var clayProd = 0;
			var bricksProd = 0;
			clayProd += this.buildings.clayPit.production.clay.base * this.buildings.clayPit.current * 
				this.buildings.clayPit.production.clay.increased * this.buildings.clayPit.production.clay.more;
			
			if (this.buildings.brickmaker.active) {
				bricksProd += this.buildings.brickmaker.production.bricks.base * this.buildings.brickmaker.current *
					this.buildings.brickmaker.production.bricks.increased * this.buildings.brickmaker.production.bricks.more;
				clayProd -= this.buildings.brickmaker.production.bricks.consumedBase * this.buildings.brickmaker.current;
			}
				
			this.resources.clay.productionRate = clayProd;
			this.resources.bricks.productionRate = bricksProd;
		},
		
		updateStorage: function () {
			var woodStorage = 0;
			woodStorage += this.resources.wood.baseMax + 
				(this.buildings.shed.storage.wood.base * this.buildings.shed.current *
				this.buildings.shed.storage.wood.increased * this.buildings.shed.storage.wood.more);
			this.resources.wood.max = woodStorage;
			
			var stoneStorage = 0;
			stoneStorage += this.resources.stone.baseMax + 
				(this.buildings.shed.storage.stone.base * this.buildings.shed.current *
				this.buildings.shed.storage.stone.increased * this.buildings.shed.storage.stone.more);
			this.resources.stone.max = stoneStorage;
			
			var fursStorage = 0;
			fursStorage += this.resources.furs.baseMax + 
				(this.buildings.shed.storage.furs.base * this.buildings.shed.current *
				this.buildings.shed.storage.furs.increased * this.buildings.shed.storage.furs.more);
			this.resources.furs.max = fursStorage;
		},
		
		produceResources: function () {
			for (let resource in this.resources) {
				this.resources[resource].current += (this.resources[resource].productionRate * (this.TICKSPEED / 1000));
			
				if (this.resources[resource].max != undefined) {
					this.resources[resource].current =
						(this.resources[resource].current < this.resources[resource].max) ?
						this.resources[resource].current :
						this.resources[resource].max;
				}
				
				// Turn off consumer buildings if the resource is exhausted
				if (this.resources[resource].current < 0) {
					this.resources[resource].current = 0;
					for (let i = 0; i < this.resources[resource].consumers.length; i++) {
						this.toggleBuilding(this.resources[resource].consumers[i]);
					}
				}
			}
			
			this.cleanUpResources();
		},
		
		produceOrc: function () {
			this.resources.meat.current -= this.orcs.price;
			this.orcs.producing = true;
			this.updateOrcCost();
			var width = 0;
			var barElement = $("#orcBar");
			var barTimer = setInterval(moveOrcProgressBar, this.orcs.productionTime);
			
			function moveOrcProgressBar() {
				if (width >= 1000) {
					barElement.width('0%');
					app.orcs.current++;
					app.orcs.total++;
					app.orcs.producing = false;
					clearInterval(barTimer);
				} else {
					width++;
					barElement.width(width/10 + '%');
				}
			}
			
			this.cleanUpResources();
		},
		
		updateOrcCost: function () {
			// Add 1 to orc total to include the one in production
			if (orcs.producing)
				this.orcs.price = this.orcs.priceBase * Math.pow(this.orcs.priceGrowth, this.orcs.total + 1) * this.orcs.priceReduction;
			else
				this.orcs.price = this.orcs.priceBase * Math.pow(this.orcs.priceGrowth, this.orcs.total) * this.orcs.priceReduction;
			
			this.orcs.price = parseFloat(this.orcs.price.toFixed(this.SIG_DIGITS));
		},
		
		toggleBuilding: function (building) {
			building.active = !building.active;
			this.updateProduction();
		},
		
		isPurchaseDisabled: function (obj) {
			if (obj.oldTier != undefined && obj.oldTier.current > 0)
				return true;
			
			if (!(obj.orcPrice == undefined || this.floatGTE(this.orcs.current, obj.orcPrice)))
				return true;
			
			for (let priceType in obj.price) {
				if (!this.floatGTE(obj.price[priceType].type.current, obj.price[priceType].price))
					return true;
			}
			return false;
		},
		
		//Clean up floating point nonsense
		cleanUpResources: function () {
			for (let resource in this.resources) {
				this.resources[resource].current = parseFloat(this.resources[resource].current.toFixed(this.SIG_DIGITS));
				this.resources[resource].productionRate = parseFloat(this.resources[resource].productionRate.toFixed(this.SIG_DIGITS));
			}
		},
		
		cheatResources: function () {
			this.orcs.current +=5;
			this.orcs.total +=5;
			this.resources.wood.current += 50;
			this.resources.meat.current += 50;
		}
	}
})

var timer;

$(document).ready(function() {
	timer = setInterval(app.tick, app.TICKSPEED);
	app.selectTab(app.tabs.buildings);
});

