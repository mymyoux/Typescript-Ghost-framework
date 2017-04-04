//convert
 /* ghost.utils.Maths.*/
import {Maths} from "ghost/utils/Maths";
//convert
 /* ghost.events.EventDispatcher
*/
import {EventDispatcher} from "ghost/events/EventDispatcher";
//convert-files
import {IBrainData} from "./IBrainData";
//convert-files
import {INeuronData} from "./INeuronData";

	export class Brain
	{
		protected neuronsID: number[];
		protected neurons: Neuron[];
		protected inputs: Neuron[];
		protected outputs: Neuron[];
		protected outputsValue: number[];
		protected nextId: number;
		public constructor()
		{
			this.nextId = 0;
			this.neurons = [];
			this.neuronsID = [];
			this.inputs = [];
			this.outputs = [];
			this.outputsValue = [];
		}
		public readExternal(data:IBrainData): void
		{
			var len: number = data.neurons.length;
			var neuron: Neuron;
			for (var i: number = 0; i < len; i++)
			{	
				neuron = new Neuron();
				neuron.readExternal(data.neurons[i]);
				this.addNeuron(neuron);
			}
			var j: number, links:number, index:number, neuron:Neuron;
			for (i = 0; i < len; i++) {
				links = data.neurons[i].links.length;
				for (j = 0; j < links; j++)
				{
					neuron = this.getNeuronByID(data.neurons[i].links[j]);
					if (neuron)
					{
						this.neurons[i].addChild(neuron);
					}
				}
			}
			len = data.inputs.length;
			for (i = 0; i < len; i++)
			{
				neuron = this.getNeuronByID(data.inputs[i]);
				if(neuron)
				{
					this.setInput(neuron);
				}
			}
			len = data.outputs.length;
			for (i = 0; i < len; i++)
			{
				neuron = this.getNeuronByID(data.outputs[i]);
				if(neuron)
				{
					this.setOutput(neuron);
				}
			}
		}
		public getNeuronIndex(neuron:Neuron):number
		{
			return this.neurons.indexOf(neuron);
		}
		public getNeuronAt(id: number): Neuron {
			return this.neurons[id];
		}
		public getNeuronByID(id:number):Neuron
		{
			var index:number = this.neuronsID.indexOf(id);
			if (index != -1) {
				return this.neurons[index];
			}
			return null;
		}
		public writeExternal():IBrainData
		{
			var brain: IBrainData = {neurons:[], inputs:[], outputs:[]};

			var len: number = this.neurons.length;
			for (var i: number = 0; i < len; i++) {
				brain.neurons.push(this.neurons[i].writeExternal());
			}
			len = this.inputs.length;
			for (i = 0; i < len; i++)
			{
				brain.inputs.push(this.inputs[i].getID());
			}
			len = this.outputs.length;
			for (i = 0; i < len; i++)
			{
				brain.outputs.push(this.outputs[i].getID());
			}
			return brain;
		}
		public static generate(size:number, minLink:number= 2, maxLink:number = 10):Brain
		{
			var brain: Brain = new Brain();

			var neuron: Neuron;
			for (var i: number = 0; i < size; i++)
			{
				neuron = brain.createNeuron(); 
				brain.addNeuron(neuron);
			}	
			var links: number;
			for (var i: number = 0; i < size; i++) 
			{	
				links = Maths.randBetween(minLink, maxLink);
				for (var j: number = 0; j < links; j++)
				{
					brain.getNeuronAt(i).addChild(brain.getNeuronAt(Maths.randBetween(0, brain.size() - 1)));
				}
			}	
			return brain;
		}
		public setInputLength(length:number):void
		{
			if (length > this.neurons.length) {
				throw new Error("You can't set more inputs than neurons");
			}
			for (var i: number = 0; i < length; i++)
			{
				this.setInput(this.neurons[i]);
			}
		}
		public setOutputLength(length:number):void
		{
			if(length>this.neurons.length)
			{
				throw new Error("You can't set more outputs than neurons");
			}
			for (var i: number = this.neurons.length-1; i > this.neurons.length-length-1; i--)
			{
				debugger;
				this.setOutput(this.neurons[i]);
			}
		}
		public prepare():void
		{
			//prepare the brain to be fully working
			
			//remove input neurons children's parents
			
		}
		public createNeuron():Neuron
		{
			var neuron: Neuron = new Neuron();
			neuron.setID(this.nextId++);
			return neuron;
		}
		protected addNeuron(neuron:Neuron):void
		{
			this.neurons.push(neuron);
			this.neuronsID.push(neuron.getID());
			neuron.setBrain(this);
			if(neuron.getID()>=this.nextId)
			{
				this.nextId = neuron.getID() + 1;
			}
		}
		protected setInput(neuron:Neuron):void
		{
			this.inputs.push(neuron);
			neuron.isInput = true;
		}
		protected setOutput(neuron:Neuron):void
		{
			this.outputs.push(neuron);
			this.outputsValue.push(-1);
			neuron.isOutput = true;
		}
		protected removeNeuron(neuron:Neuron):void
		{
			var index: number = this.neurons.indexOf(neuron);
			if(index != -1)
			{
				this.neurons.splice(index, 1);
				this.neuronsID.splice(index, 1);
			}
			if(neuron.isInput)
			{
				index = this.inputs.indexOf(neuron);
				if (index != -1) 
				{
					this.inputs.splice(index, 1);
				}
			}
			if(neuron.isOutput)
			{
				index = this.outputs.indexOf(neuron);
				if (index != -1) 
				{
					this.outputs.splice(index, 1);
					this.outputsValue.splice(index, 1);
				}
			}
			neuron.removeBrain();
		}
		public tick():void
		{
			var len: number = this.neurons.length;
			for (var i: number = 0; i < len; i++)
			{
				this.neurons[i].tick();
			}
			for (i = 0; i < len; i++) {
				this.neurons[i].emit();
			}
		}
		public size():number
		{
			return this.neurons.length;
		}
		public setInputs(inputs:number[]):void
		{
			var len: number = this.inputs.length;
			if (inputs.length != this.inputs.length)
			{
				throw new Error("bad input length");
			}
			for (var i: number = 0; i < len; i++)
			{
				this.inputs[i].emit(inputs[i]);
			}
		}
		public setOutputValue(neuron:Neuron, output:number):void
		{
			var index: number = this.outputs.indexOf(neuron);
			if(index != -1)
			{
				this.outputsValue[index] = output;
				var len: number = this.outputsValue.length;
				for (var i: number = 0; i < len; i++)
				{
					if (this.outputsValue[i] == -1)
					{
						continue;
					}
				}
				this.emit();
				for (var i: number = 0; i < len; i++) {
					this.outputsValue[i] = -1;
				}
			}
		}
		protected emit():void
		{
			console.log("output", this.outputsValue);
		}
	}
	export class Neuron extends EventDispatcher
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
