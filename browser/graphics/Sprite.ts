///<file="ISprite"/>
///<module="framework/ghost/utils"/>
namespace ghost.graphics
{
	import Maths = ghost.utils.Maths;
	export class Sprite implements ISprite
	{
		public x: number;
		public y: number;
		public z: number;
		public width: number;
		public height: number;
		protected children: ISprite[];
		public parent: ISprite;
		public constructor() 
		{
			this.x = this.y = this.z = 0;
			this.width = this.height = 10;
			this.children = [];
		}
		public addChild(sprite: ISprite) {
			this.children.push(sprite);
			sprite.parent = this;
		}
		public removeChild(sprite) {
			var index: number = this.children.indexOf(sprite);
			if (index !== -1) {
				this.children.splice(index, 1);
				sprite.dispose();
			}
		}
		public draw(view:View):void
		{
			view.context.save();
				view.context.translate(this.x, this.y);
				view.context.fillStyle = "#FF0000";
				view.context.fillRect(0, 0, this.width, this.height); 
				var len: number = this.children.length;
				for (var i = 0; i < len; i++)
				{
					this.children[i].draw(view);
				}
			view.context.restore();
		}
		public _tick(): void {
			this.tick();
			var len: number = this.children.length;
			for (var i = 0; i < len; i++) {
				this.children[i]._tick();
			}
		}
		public tick():void
		{
			this.x += Maths.randBetween(-10, 10);
			if (this.x < 0) {
				this.x = 0;
			}
			this.y += Maths.randBetween(-10, 10);
			if (this.y < 0) {
				this.y = 0;
			} 
		}
		public getGlobalX(): number
		{
			return this.x + (this.parent ? this.parent.getGlobalX():0);
		}
		public getGlobalY(): number
		{
			return this.y + (this.parent ? this.parent.getGlobalY():0);
		}
		public getGlobalZ(): number
		{
			return this.z + (this.parent ? this.parent.getGlobalZ():0);
		}
		public dispose(): void
		{
			while(this.children.length)
			{
				this.children.shift().dispose();
			}
			this.parent = null;
		}
	}
}
