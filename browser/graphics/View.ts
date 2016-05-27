///<lib="jquery"/>
///<module="framework/browser/events"/>
namespace ghost.graphics
{
	export class View extends ghost.events.EventDispatcher
	{
		public static EVENT_SIZE_CHANGE:string = "size_changed";
		public static EVENT_CHANGE:string = "change";
		protected canvas: HTMLCanvasElement;
		public context: CanvasRenderingContext2D;
		protected width: number;
		protected height: number;
		public offsetX: number;
		public offsetY: number;
		public scale:number;
		public caseWidth: number;
		public caseHeight: number;
		public constructor(canvas:HTMLCanvasElement) 
		{
			super();
			this.addContainer(canvas);
			this.offsetX = this.offsetY = 0;
			this.scale = 1;
		} 
		public addContainer(canvas: HTMLCanvasElement) {
			this.canvas = canvas;
			this.context = (<any>this.canvas).getContext("2d", {alpha:false});
			
			this.calculateCanvasSize();
			$(window).resize(()=>
			{
				this.calculateCanvasSize();
				this.trigger(View.EVENT_SIZE_CHANGE);
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
