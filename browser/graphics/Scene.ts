///<file="View"/>
///<file="Sprite"/>
namespace ghost.graphics
{
	export class Scene extends Sprite
	{
		protected static STATE_PLAY: string = "play";
		protected static STATE_STOP: string = "stop";
		protected views: View[];
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
		public draw():void
		{
			
			for (var i: number = 0; i < this.viewsLength; i++)
			{
				this.views[i].draw(this);
			}
		}
		public play():void
		{
			if(this.state_running !== Scene.STATE_PLAY)
			{
				this.state_running = Scene.STATE_PLAY;
				this.render();
			}
		}
		public pause():void
		{
			this.state_running = Scene.STATE_STOP;
		}
		protected render():void
		{
			this.draw();
			if (this.state_running == Scene.STATE_PLAY)
			{
				requestAnimationFrame(this.render.bind(this));
			}
		}
	}
}
