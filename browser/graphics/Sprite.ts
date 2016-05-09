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
		public constructor()
		{
			this.x = this.y = this.z = 0;
			this.width = this.height = 10;
			this.children = [];
		}
		public addChild(sprite: ISprite) {
			this.children.push(sprite);
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
			view.context.fillStyle = "#FF0000";
			view.context.fillRect(this.x, this.y, this.width, this.height); 
			this.x += Maths.randBetween(-10, 10);
			if(this.x<0)
			{
				this.x = 0;
			}
			this.y+= Maths.randBetween(-10, 10);
			if(this.y<0)
			{
				this.y = 0;
			}
		}
		public dispose(): void
		{
			while(this.children.length)
			{
				this.children.shift().dispose();
			}
		}
	}
}
