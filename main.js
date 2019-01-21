import {resourceMixin} from "/resources.js";
import {buildingMixin} from "/buildings.js";
import {upgradeMixin} from "/upgrades.js";

var app = new Vue({
	el: '#app',
	mixins: [resourceMixin, buildingMixin, upgradeMixin],
	data: {
		EPSILON: 0.00001,
		TICKSPEED: 100, // Milliseconds
		SIG_DIGITS: 2,
		BUILDING_UPGRADE_PRICE_MOD: 0.75, 
		eventLog: [],
		
		currentObjective: null,
		objectives: {
			intro1: {
				description: "Wait for an orc to spawn.",
				completionLog: "Another orc has emerged from the Orcmother's pool, ready to serve.",
				target: null, // orcs
				targetGoal: 1,
				nextObjective: null //intro2
			},
			allComplete: {
				description: "You have completed all objectives."
			}
		},
		
		orcs: {
			id: "orcs", name: 'Orcs', current: 0, total: 0, price: 5, priceBase: 5, priceGrowth: 1.25, priceReduction: 1,
			producing: false, productionTime: 10 //Seconds
		},
		tabs: {
			buildings: {id: "tab1", tabID: "buildingTab", name: "Buildings", active: true},
			upgrades: {id: "tab2", tabID: "upgradeTab", name: "Upgrades", active: false}
		}
	},
	
	// This runs after the data object is created
	// Adds data with dependencies
	created: function () {
		this.setResourcePointers();

		this.buildings.hunter.buildingUnlocked = this.buildings.woodcutter;
		
		this.buildings.stonecutter.buildingUnlocked = this.buildings.shed;
		
		this.resources.clay.consumers.push(this.buildings.brickmaker);
		
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
		
		this.currentObjective = this.objectives.intro1;
		
		this.objectives.intro1.target = this.orcs;
		this.objectives.intro1.nextObjective = this.objectives.allComplete;
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
			this.checkObjective(); // Maybe call this less often.
			
			if (this.floatGTE(this.resources.meat.current, this.orcs.price) && !this.orcs.producing)
				this.produceOrc();
		},
		
		logEvent: function (text) {
			this.eventLog.push("- " + text);
		},
		
		selectTab: function (tab) {
			for (let eachTab in this.tabs) {
				this.tabs[eachTab].active = false;
			}
			tab.active = true;
		},
		
		setResourcePointers: function () {
			for (let building in this.buildings) {
				if (this.buildings[building].price.wood != undefined)
					this.buildings[building].price.wood.type = this.resources.wood;
				if (this.buildings[building].price.stone != undefined)
					this.buildings[building].price.stone.type = this.resources.stone;
				if (this.buildings[building].price.bricks != undefined)
					this.buildings[building].price.bricks.type = this.resources.bricks;
				
				if (this.buildings[building].production != undefined) {
					if (this.buildings[building].production.meat != undefined)
						this.buildings[building].production.meat.type = this.resources.meat;
					if (this.buildings[building].production.wood != undefined)
						this.buildings[building].production.wood.type = this.resources.wood;
					if (this.buildings[building].production.stone != undefined)
						this.buildings[building].production.stone.type = this.resources.stone;
					if (this.buildings[building].production.clay != undefined)
						this.buildings[building].production.clay.type = this.resources.clay;
					if (this.buildings[building].production.furs != undefined)
						this.buildings[building].production.furs.type = this.resources.furs;
					if (this.buildings[building].production.bricks != undefined)
						this.buildings[building].production.bricks.type = this.resources.bricks;
				}
				
				if (this.buildings[building].tier > 1) {
					if (this.buildings[building].oldTier.price.wood != undefined)
						this.buildings[building].oldTier.price.wood.type = this.resources.wood;
					if (this.buildings[building].oldTier.price.stone != undefined)
						this.buildings[building].oldTier.price.stone.type = this.resources.stone;
					if (this.buildings[building].oldTier.price.bricks != undefined)
						this.buildings[building].oldTier.price.bricks.type = this.resources.bricks;
					
					if (this.buildings[building].oldTier.production.meat != undefined)
						this.buildings[building].oldTier.production.meat.type = this.resources.meat;
					if (this.buildings[building].oldTier.production.wood != undefined)
						this.buildings[building].oldTier.production.wood.type = this.resources.wood;
					if (this.buildings[building].oldTier.production.stone != undefined)
						this.buildings[building].oldTier.production.stone.type = this.resources.stone;
					if (this.buildings[building].oldTier.production.clay != undefined)
						this.buildings[building].oldTier.production.clay.type = this.resources.clay;
					if (this.buildings[building].oldTier.production.furs != undefined)
						this.buildings[building].oldTier.production.furs.type = this.resources.furs;
					if (this.buildings[building].oldTier.production.bricks != undefined)
						this.buildings[building].oldTier.production.bricks.type = this.resources.bricks;
				}
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
		
			this.buildings.brickmaker.production.bricks.consumedType = this.resources.clay;
			
			this.buildings.shed.storage.wood.type = this.resources.wood;
			this.buildings.shed.storage.stone.type = this.resources.stone;
			this.buildings.shed.storage.furs.type = this.resources.furs;
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
		
		checkObjective: function () {
			if (this.currentObjective != this.objectives.allComplete) {
				if (this.currentObjective.target == this.orcs) {
					if (this.floatGTE(this.orcs.current, this.currentObjective.targetGoal)) {
						this.logEvent(this.currentObjective.completionLog);
						this.currentObjective = this.currentObjective.nextObjective;
					}
				}
				// More cases for objectives that target resources, buildings, and upgrades
			}
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
			
			this.updateProduction();
			this.updateStorage();
			this.updateOrcCost();
			this.cleanUpResources();
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
		
		cheatResources: function () {
			this.orcs.current +=5;
			this.orcs.total +=5;
			for (let resource in this.resources) {
				this.resources[resource].current += 100;
			}
		}
	}
})

var timer;

$(document).ready(function() {
	timer = setInterval(app.tick, app.TICKSPEED);
	
	// Event handler for cheating
	$(document).on('keyup', function (event) {
		if (event.which == 67) { //67 = 'c'
			app.cheatResources();
		}
	});
});
