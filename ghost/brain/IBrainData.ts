///<file="INeuronData"/>
namespace ghost.brain
{
	export interface IBrainData
	{
		neurons: INeuronData[];
		inputs: number[];
		outputs: number[];
	}
}
