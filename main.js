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
			meat: {id: "resource1", name: 'Meat', current: 5, productionRate: 0, discovered: true},
			wood: {id: "resource2", name: 'Wood', current: 20, max: 100, productionRate: 0, discovered: true},
			furs: {id: "resource3", name: 'Furs', current: 0, max: 100, productionRate: 0, discovered: false}
		},
		buildings: {
			hunter: {
				id: "building1", name: "Hunter's Lean-To", 
				flavor: "Shelter for orcish hunters.",
				unlocked: true,
				current: 0,
				orcPrice: 1,
				price1: 10, price1Base: 10, price1Growth: 1.1, priceType1: null, //Wood
				buildingUnlocked: null, //Woodcutter
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
				price1: 10, price1Base: 10, price1Growth: 1.1, priceType1: null, //Wood
				production: {
					wood: {base: 1, increased: 1, more: 1, type: null, unlocked: true}
				}
			}
		},
		upgrades: {
			skinning: {
				id: "upgrade1", name: "Skinning",
				flavor: "With wooden tools and some experimentation, your hunters will also gather furs from their kills.",
				unlocked: true, purchased: false,
				price1: 50, priceType1: null, //Wood
				resourceDiscovered: null, //Furs
				productionUnlocked: null, //Hunter furs
				upgrade1Unlocked: null, //Fur clothes
			},
			furClothes: {
				id: "upgrade2", name: "Fur Clothes",
				flavor: "Warmer hunters are more effective.",
				unlocked: false, purchased: false,
				price1: 25, priceType1: null, //Furs
				baseProductionIncreased: {
					hunterMeat: {amount: 0.5, target: null},
					hunterFurs: {amount: 0.05, target: null}
				}
			},
			scouts1: {
				id: "upgrade3", name: "Scouting Expedition",
				flavor: "Send scouts to look for new resources.",
				unlocked: true, purchased: false,
				orcPrice: 5
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
		this.buildings.hunter.priceType1 = this.resources.wood;
		this.buildings.hunter.production.meat.type = this.resources.meat;
		this.buildings.hunter.production.furs.type = this.resources.furs;
		this.buildings.hunter.buildingUnlocked = this.buildings.woodcutter;
		
		this.buildings.woodcutter.priceType1 = this.resources.wood;
		this.buildings.woodcutter.production.wood.type = this.resources.wood;
		
		this.upgrades.skinning.priceType1 = this.resources.wood;
		this.upgrades.skinning.resourceDiscovered = this.resources.furs;
		this.upgrades.skinning.productionUnlocked = this.buildings.hunter.production.furs;
		this.upgrades.skinning.upgrade1Unlocked = this.upgrades.furClothes;
		
		this.upgrades.furClothes.priceType1 = this.resources.furs;
		this.upgrades.furClothes.baseProductionIncreased.hunterMeat = this.buildings.hunter.production.meat;
		this.upgrades.furClothes.baseProductionIncreased.hunterFurs = this.buildings.hunter.production.furs;
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
			if (building.price1 != undefined)
				building.priceType1.current -= building.price1;
			if (building.price2 != undefined)
				building.priceType2.current -= building.price2;
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
			if (upgrade.price1 != undefined)
				upgrade.priceType1.current -= upgrade.price1;
			if (upgrade.price2 != undefined)
				upgrade.priceType2.current -= upgrade.price2;
			upgrade.purchased = true;
			
			if (upgrade.resourceDiscovered != undefined)
				upgrade.resourceDiscovered.discovered = true;
			if (upgrade.productionUnlocked != undefined)
				upgrade.productionUnlocked.unlocked = true;
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
			if (building.price1 != undefined) {
				building.price1 = building.price1Base * Math.pow(building.price1Growth, building.current);
				building.price1 = parseFloat(building.price1.toFixed(2));
			}
			if (building.price2 != undefined) {
				building.price2 = building.price2Base * Math.pow(building.price2Growth, building.current);
				building.price2 = parseFloat(building.price2.toFixed(2));
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
			if ((obj.orcPrice == undefined || this.floatGTE(this.orcs.current, obj.orcPrice)) &&
				(obj.priceType1 == undefined || this.floatGTE(obj.priceType1.current, obj.price1)) &&
				(obj.priceType2 == undefined || this.floatGTE(obj.priceType2.current, obj.price2)))
			{
				return false;
			} else {
				return true;
			}
		},
		
		//Clean up floating point nonsense
		cleanUpResources: function () {
			for (let resource in this.resources) {
				this.resources[resource].current = parseFloat(this.resources[resource].current.toFixed(this.SIG_DIGITS));
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

