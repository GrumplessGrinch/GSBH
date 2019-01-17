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
	},
	
	methods: {
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
		
		//Clean up floating point nonsense
		cleanUpResources: function () {
			for (let resource in this.resources) {
				this.resources[resource].current = parseFloat(this.resources[resource].current.toFixed(this.SIG_DIGITS));
				this.resources[resource].productionRate = parseFloat(this.resources[resource].productionRate.toFixed(this.SIG_DIGITS));
			}
		}
	}
}