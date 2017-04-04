//missing
import {View} from "browser/graphics/View";
//convert
 /* ghost.events.EventDispatcher */
import {EventDispatcher} from "ghost/events/EventDispatcher";
//convert-files
import {ISprite} from "./ISprite";
///<module="framework/ghost/utils"/>
///<module="framework/ghost/events"/>

	//convert-import
import {Maths} from "ghost/utils/Maths";
	export class Sprite extends EventDispatcher implements ISprite
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
			super();
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
				view.context.fillStyle = "#0000FF";
				view.context.fillRect(0, 0, this.width, this.height); 
				var len: number = this.children.length;
				for (var i = 0; i < len; i++)
				{
					this.children[i].draw(view);
				}
			view.context.restore(); 
		}
		public _tick(round:number): void {
			this.tick(round);
			var len: number = this.children.length;
			for (var i = 0; i < len; i++) {
				this.children[i]._tick(round);
			}
		}
		public tick(round:number):void
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
