namespace ghost.brain
{
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
				links = ghost.utils.Maths.randBetween(minLink, maxLink);
				for (var j: number = 0; j < links; j++)
				{
					brain.getNeuronAt(i).addChild(brain.getNeuronAt(ghost.utils.Maths.randBetween(0, brain.size() - 1)));
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
	export interface IBrainData
	{
		neurons: INeuronData[];
		inputs: number[];
		outputs: number[];
	}
}
