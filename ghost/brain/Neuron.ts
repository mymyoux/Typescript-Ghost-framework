///<module="framework/ghost/events"/>
namespace ghost.brain
{
	export class Neuron extends ghost.events.EventDispatcher
	{
		protected _id: number;
		public isInput: boolean = false;
		public isOutput: boolean = false;
		protected children: Neuron[];
		protected parents: Neuron[];
		protected weights: number[];
		protected brain: Brain;
		public inputs: number[];
		public output: number;
		public threshold: number;
		public constructor()
		{
			super();
			this.output = -1;
			this.children = [];
			this.parents = [];
			this.inputs = [];
			this.weights = [Math.random()];
			this.threshold = Math.random();
		}
		public setBrain(brain:Brain):void
		{
			this.brain = brain;
		}
		public removeBrain():void
		{
			this.brain = null;
		}
		public getID():number
		{
			return this._id;
		}
		public setID(value:number):void
		{
			this._id = value;
		}
		public addChild(neuron:Neuron):void
		{
			if(neuron === this)
			{
				return;
			}
			if(this.children.indexOf(neuron) == -1)
			{
				this.children.push(neuron);
				neuron.addParent(this);
			}
		}
		public setInput(neuron:Neuron, value:number):void
		{
			var index: number = this.parents.indexOf(neuron);
			if(index != -1)
			{
				this.inputs[index] = value;
			}
		}
		public tick():void
		{
			var len: number = this.inputs.length;
			var sum: number = 0;
			for (var i: number = 0; i < len; i++)
			{
				//maybe -1 ?
				if (this.inputs[sum] == 0)
				{
					return;
				}
				sum += this.inputs[sum];
			}
			if(sum>this.threshold)
			{
				this.execute();
			}
		}
		public emit(output:number = -1):void
		{
			if(output!=-1)
			{
				this.output = output;
			}
			if(this.output != -1)
			{
				var len: number = this.children.length;
				for (var i: number = 0; i < len; i++) 
				{
					this.children[i].setInput(this, this.output);
				}
				if(this.isOutput)
				{
					this.brain.setOutputValue(this, this.output);	
				}
				this.output = -1;
			}
		}
		protected execute():void
		{
			var sum: number = 1 * this.weights[0];
			for (var i: number = 0; i < len; i++) {
				sum += this.inputs[sum]*this.weights[i+1];
			}

			var output:number = this.getCalculFunction()(sum);
			this.output = output;

			//reset inputs
			var len: number = this.inputs.length;
			for (var i: number = 0; i < len; i++) {
				this.inputs[i] = 0;
			}
		}
		protected getCalculFunction():any
		{
			return function(sum: number): number {
				return 1 / (1 + Math.exp(-sum));
			};
		}
		public addParent(neuron:Neuron):void
		{
			if (neuron === this) {
				return;
			}
			if(this.parents.indexOf(neuron) == -1)
			{
				this.parents.push(neuron);
				this.inputs.push(0);
				this.weights.push(Math.random());
				neuron.addChild(this);
			}
		}
		public removeChild(neuron:Neuron):void
		{
			var index: number = this.children.indexOf(neuron);
			if (index != -1) {
				var neuron: Neuron = this.children[index];
				this.children.splice(index, 1);
				neuron.removeParent(this);
			}
		}
		public removeParent(neuron:Neuron):void
		{
			var index: number = this.parents.indexOf(neuron);
			if(index != -1)
			{
				var neuron: Neuron = this.parents[index];
				this.parents.splice(index, 1);
				this.inputs.splice(index, 1);
				this.weights.splice(index+1, 1);
				neuron.removeChild(this);
			}
		}
		public readExternal(data: INeuronData): void 
		{
			var len: number = data.weights.length;
			for (var i: number = 0; i < len; i++) {
				this.setWeight(i, data.weights[i]);
			}
			this._id = data.id;
			this.threshold = data.threshold;
			//links ??
		}
		protected setWeight(index:number, value:number):void
		{
			while (this.weights.length<=index)
			{
				this.weights.push(0);
			}
			this.weights[index] = value;
		}
		public writeExternal(): INeuronData {
			var neuron: INeuronData = { weights: [], links: [], id: 0, threshold:0 };
			neuron.weights = this.weights.slice();
			var len: number = this.children.length;
			for (var i: number = 0; i < len; i++)
			{
				neuron.links.push(this.children[i].getID());
			}
			neuron.id = this._id;
			neuron.threshold = this.threshold;
			return neuron;
		}
	}
	export interface INeuronData
	{
		weights: number[];
		links: number[];
		id: number;
		threshold: number;

	}
}
