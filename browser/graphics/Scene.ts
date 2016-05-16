///<file="View"/>
///<module="framework/ghost/events"/>
///<file="Sprite"/>
namespace ghost.graphics
{
	export class Scene extends Sprite
	{
		public static EVENT_CHANGE:string = "change";
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
			view.on(View.EVENT_SIZE_CHANGE, this.viewChanged, this, view);
			view.on(View.EVENT_CHANGE, this.viewChanged, this, view);
		}
		public play():void
		{
			if(this.state_running !== Scene.STATE_PLAY)
			{
				this.state_running = Scene.STATE_PLAY;
				this.render();
			}
		}
		protected viewChanged(view:View)
		{
			view.draw(this);
			this.trigger(Scene.EVENT_CHANGE);
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
