///<module="framework/ghost/brain"/>
///<lib="d3"/>
namespace ghost.browser.brain
{
	import Brain = ghost.brain.Brain;
	export class DisplayBrain
	{
		protected brain: Brain;
		public constructor()
		{
			this.initBrain();
			this.display();
		}
		protected initBrain():void
		{
			var brain: Brain = Brain.generate(5, 2, 4);
			brain.setInputLength(1);
			brain.setOutputLength(1);

			brain.prepare();
			this.brain = brain;
		}
		protected tick():void
		{
			this.brain.tick();
		}
		public display():void
		{
			var width = 960,
				height = 500

			var svg = d3.select("body").append("svg")
				.attr("width", width)
				.attr("height", height);

			var force = (<any>d3.layout.force())
				.gravity(.05)
				.distance(100)
				.charge(-100)
				.size([width, height]);

			(function(brain) {

				brain.links = [];
				for(var p in brain.neurons)
				{
					for(var q in brain.neurons[p].children)
					{
						brain.links.push({ source: brain.getNeuronIndex(brain.neurons[p]), target: brain.getNeuronIndex(brain.neurons[p].children[q]), weight: 4 });
					}

				}

				force
					.nodes(brain.neurons)
					.links(brain.links)
					.start();

				var link = svg.selectAll(".link")
					.data(brain.links)
					.enter().append("line")
					.attr("class", "link")
					.style("stroke-width", function(d) { return Math.sqrt(d.weight); });

				var node = svg.selectAll(".node")
					.data(brain.neurons)
					.enter().append("g")
					.attr("class", function(neuron) {
						return "node" + (neuron.isInput ? " input" : "") + (neuron.isOuptut ? " output" : "");
					})
					.attr("group", function(neuron)
					{
						return neuron.getID();
					})
					.call(force.drag);

				node.append("circle")
					.attr("r", "5");

				node.append("text")
					.attr("dx", 12)
					.attr("dy", ".35em")
					.text(function(neuron) { return "n " + neuron.getID();  });

				force.on("tick", function() {
					link.attr("x1", function(d) { return d.source.x; })
						.attr("y1", function(d) { return d.source.y; })
						.attr("x2", function(d) { return d.target.x; })
						.attr("y2", function(d) { return d.target.y; });

					node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
				});
			})(
				this.brain);/*
				{
					"nodes": [
						{ "name": "node1", "group": 1 },
						{ "name": "node2", "group": 2 },
						{ "name": "node3", "group": 2 },
						{ "name": "node4", "group": 3 }
					],
					"links": [
						{ "source": 2, "target": 1, "weight": 1 },
						{ "source": 0, "target": 2, "weight": 3 }
					]
				}
			);*/
		}
	}
	setTimeout(()=>
	{

	window["brain"] = new DisplayBrain();
	}, 1000);
}
