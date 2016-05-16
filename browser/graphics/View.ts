///<lib="jquery"/>
///<module="framework/browser/events"/>
namespace ghost.graphics
{
	export class View
	{
		protected canvas: HTMLCanvasElement;
		public context: CanvasRenderingContext2D;
		protected width: number;
		protected height: number;
		public offsetX: number;
		public offsetY: number;
		public scale:number;
		public constructor(canvas:HTMLCanvasElement) 
		{
			this.addContainer(canvas);
			this.offsetX = this.offsetY = 0;
			this.scale = 1;
		}
		public addContainer(canvas: HTMLCanvasElement) {
			this.canvas = canvas;
			this.context = this.canvas.getContext("2d");
			
			this.calculateCanvasSize();
			$(window).resize(()=>
			{
				this.calculateCanvasSize();
			});
		}
		protected calculateCanvasSize():void
		{
			if ($(this.canvas).attr("data-width")) {
				var width: number = parseFloat($(this.canvas).attr("data-width"));
				if ($(this.canvas).attr("data-width").indexOf("%") != -1) {
					this.canvas.width = width / 100 * $(window).width();
				} else {
					this.canvas.width = width;
				}
			}
			if ($(this.canvas).attr("data-height")) {
				var height: number = parseFloat($(this.canvas).attr("data-height"));
				if ($(this.canvas).attr("data-height").indexOf("%") != -1) {
					this.canvas.height = height / 100 * $(window).height();
				} else {
					this.canvas.height = height;
				}
			}
			this.width = this.canvas.width;
			this.height = this.canvas.height;
		}
		public draw(scene:Scene):void
		{
			this.context.clearRect(0, 0, this.width, this.height);
			scene.draw(this);
			
		}
	}
}
