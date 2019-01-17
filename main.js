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
		
		orcs: {
			id: "orcs", name: 'Orcs', current: 0, total: 0, price: 5, priceBase: 5, priceGrowth: 1.25, priceReduction: 1,
			producing: false, productionTime: 10 //Seconds
		},
		tabs: {
			buildings: {id: "tab1", tabID: "buildingTab", name: "Buildings"},
			upgrades: {id: "tab2", tabID: "upgradeTab", name: "Upgrades"}
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

