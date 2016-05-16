namespace ghost.graphics
{
	export interface ISprite
	{
		parent: ISprite;
		dispose():void; 
		draw(view:View):void;
		getGlobalX(): number;
		getGlobalY(): number;
		getGlobalZ(): number;
		_tick(): void;
	}
}
