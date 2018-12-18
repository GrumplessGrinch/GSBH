var app = new Vue({
	el: '#app',
	data: {
		EPSILON: 0.00001,
		TICKSPEED: 100, // Milliseconds
		SIG_DIGITS: 2,
		eventLog: [],
		
		orcs: {
			id: "orcs", name: 'Orcs', current: 0, total: 0, price: 5, priceBase: 5, priceGrowth: 1.15,
			producing: false, productionTime: 10 //Seconds
		},
		resources: {
			meat: {id: "resource1", name: "Meat", current: 5, productionRate: 0, discovered: true},
			wood: {id: "resource2", name: "Wood", current: 20, max: 100, productionRate: 0, discovered: true},
			stone: {id: "resource3", name: "Stone", current: 0, max: 100, productionRate: 0, discovered: false},
			furs: {id: "resource4", name: "Furs", current: 0, max: 100, productionRate: 0, discovered: false}
		},
		buildings: {
			hunter: {
				id: "building1", name: "Hunter's Lean-To", 
				flavor: "Shelter for orcish hunters.",
				unlocked: true,
				current: 0,
				orcPrice: 1,
				buildingUnlocked: null, //Woodcutter
				price: {
					wood: {price: 10, base: 10, growth: 1.1, type: null}
				},
				production: {
					meat: {base: 1, increased: 1, more: 1, type: null, unlocked: true},
					furs: {base: 0.1, increased: 1, more: 1, type: null, unlocked: false}
				}
			},
			woodcutter: {
				id: "building2", name: "Scavenger's Lean-To",
				flavor: "The orcs inside will scavenge pieces of wood.",
				unlocked: false,
				current: 0,
				orcPrice: 1, 
				price: {
					wood: {price: 10, base: 10, growth: 1.1, type: null}
				},
				production: {
					wood: {base: 1, increased: 1, more: 1, type: null, unlocked: true}
				}
			},
			stonecutter: {
				id: "building3", name: "Stone Gatherer's Lean-To",
				flavor: "They find rocks.",
				unlocked: false,
				current: 0,
				orcPrice: 1, 
				price: {
					wood: {price: 10, base: 10, growth: 1.1, type: null}
				},
				production: {
					stone: {base: 1, increased: 1, more: 1, type: null, unlocked: true}
				}
			}
		},
		upgrades: {
			skinning: {
				id: "upgrade1", name: "Skinning",
				flavor: "With wooden tools and some experimentation, your hunters will also gather furs from their kills.",
				unlocked: true, purchased: false,
				price: {
					wood: {price: 50, type: null}
				},
				resourceDiscovered: null, //Furs
				productionUnlocked: null, //Hunter furs
				upgrade1Unlocked: null, //Fur clothes
			},
			furClothes: {
				id: "upgrade2", name: "Fur Clothes",
				flavor: "Warmer hunters are more effective.",
				unlocked: false, purchased: false,
				price: {
					furs: {price: 25, type: null}
				},
				baseProductionIncreased: {
					hunterMeat: {amount: 0.5, target: null},
					hunterFurs: {amount: 0.05, target: null}
				}
			},
			scouts1: {
				id: "upgrade3", name: "Scouting Party",
				flavor: "Send a few orcs to look around. May discover new resources.",
				unlocked: true, purchased: false,
				orcPrice: 5,
				resourceDiscovered: null, //Stone
				buildingUnlocked: null, //Stonecutters
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
		this.buildings.hunter.price.wood.type = this.resources.wood;
		this.buildings.hunter.production.meat.type = this.resources.meat;
		this.buildings.hunter.production.furs.type = this.resources.furs;
		this.buildings.hunter.buildingUnlocked = this.buildings.woodcutter;
		
		this.buildings.woodcutter.price.wood.type = this.resources.wood;
		this.buildings.woodcutter.production.wood.type = this.resources.wood;
		
		this.buildings.stonecutter.price.wood.type = this.resources.wood;
		this.buildings.stonecutter.production.stone.type = this.resources.stone;
		
		this.upgrades.skinning.price.wood.type = this.resources.wood;
		this.upgrades.skinning.resourceDiscovered = this.resources.furs;
		this.upgrades.skinning.productionUnlocked = this.buildings.hunter.production.furs;
		this.upgrades.skinning.upgrade1Unlocked = this.upgrades.furClothes;
		
		this.upgrades.furClothes.price.furs.type = this.resources.furs;
		this.upgrades.furClothes.baseProductionIncreased.hunterMeat.target = this.buildings.hunter.production.meat;
		this.upgrades.furClothes.baseProductionIncreased.hunterFurs.target = this.buildings.hunter.production.furs;
		
		this.upgrades.scouts1.resourceDiscovered = this.resources.stone;
		this.upgrades.scouts1.buildingUnlocked = this.buildings.stonecutter;
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
			this.eventLog.push(text);
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
			this.cleanUpResources();
		},
		
		buyUpgrade: function (upgrade) {
			if (upgrade.orcPrice != undefined)
				orcs.current -= upgrade.orcPrice;
			if (upgrade.price != undefined) {
				for (let priceType in upgrade.price) {
					upgrade.price[priceType].type.current -= upgrade.price[priceType].price;
				}
			}
			upgrade.purchased = true;
			
			if (upgrade.resourceDiscovered != undefined)
				upgrade.resourceDiscovered.discovered = true;
			if (upgrade.productionUnlocked != undefined)
				upgrade.productionUnlocked.unlocked = true;
			if (upgrade.buildingUnlocked != undefined)
				upgrade.buildingUnlocked.unlocked = true;
			if (upgrade.upgrade1Unlocked != undefined)
				upgrade.upgrade1Unlocked.unlocked = true;
			
			if (upgrade.baseProductionIncreased != undefined) {
				for (let production in upgrade.baseProductionIncreased) {
					upgrade.baseProductionIncreased[production].target.base += upgrade.baseProductionIncreased[production].amount;
				}
			}
			
			//Hide the button
			var idString = "#" + upgrade.id;
			var element = $(idString);
			element.addClass("purchasedUpgrade");
			
			this.updateProduction();
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
			this.resources.furs.productionRate = fursProd;
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
			}
			
			this.cleanUpResources();
		},
		
		produceOrc: function () {
			this.resources.meat.current -= this.orcs.price;
			this.orcs.producing = true;
			this.updateOrcCost();
			var width = 0;
			var barElement = $("#orcBar");
			var barTimer = setInterval(moveOrcProgressBar, (this.orcs.productionTime / 1000) * 1000);
			
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
			//Total + 1 because the orc hasn't been added yet.
			this.orcs.price = this.orcs.priceBase * Math.pow(this.orcs.priceGrowth, this.orcs.total + 1);
			this.orcs.price = parseFloat(this.orcs.price.toFixed(this.SIG_DIGITS));
		},
		
		isPurchaseDisabled: function (obj) {
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

