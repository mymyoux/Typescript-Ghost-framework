namespace ghost.graphics
{
	export class View
	{
		protected canvas: HTMLCanvasElement;
		public context: CanvasRenderingContext2D;
		protected width: number;
		protected height: number;
		public constructor(canvas:HTMLCanvasElement)
		{
			this.addContainer(canvas);
		}
		public addContainer(canvas: HTMLCanvasElement) {
			this.canvas = canvas;
			this.context = this.canvas.getContext("2d");
			this.width = this.canvas.width;
			this.height = this.canvas.height;
		}
		public draw(scene:Scene):void
		{
			this.context.clearRect(0, 0, this.width, this.height);
			var len: number = scene.children.length;
			for (var i: number = 0; i < len; i++)
			{
				scene.children[i].draw(this);
			}
		}
	}
}
