///<file="View"/>
///<file="Sprite"/>
namespace ghost.graphics
{
	export class Scene extends Sprite
	{
		protected static STATE_PLAY: string = "play";
		protected static STATE_STOP: string = "stop";
		public views: View[];
		protected viewsLength: number;
		public children: ISprite[];
		protected state_running: string;
		public constructor()
		{
			super();
			this.views = [];
			this.viewsLength = 0;
			this.state_running = Scene.STATE_STOP;
		}
		public addView(view:View)
		{
			this.views.push(view);
			this.viewsLength++;
		}
		public play():void
		{
			if(this.state_running !== Scene.STATE_PLAY)
			{
				this.state_running = Scene.STATE_PLAY;
				this.render();
			}
		}
		public draw(view: View): void {
			var len: number = this.children.length;
			for (var i: number = 0; i < len; i++) {
				this.children[i].draw(view);
			}
		}
		public pause():void
		{
			this.state_running = Scene.STATE_STOP;
		}
		protected render():void
		{
			for (var i: number = 0; i < this.viewsLength; i++) 
			{
				this.views[i].draw(this);
			}
			if (this.state_running == Scene.STATE_PLAY)
			{
				requestAnimationFrame(this.render.bind(this));
			}
		}
	}
}
