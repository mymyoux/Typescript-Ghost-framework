namespace ghost.utils
{
	export class Arrays
	{
		public static isArray(obj:any):boolean
		{
			return Array.isArray(obj);
		}
		public static binaryFind(array:any[], searchElement:any, property?:string):IBinaryResult
		{
			var minIndex = 0;
			var maxIndex = array.length - 1;
			var currentIndex;
			var currentElement;

				searchElement = property?searchElement[property]:searchElement;

			while (minIndex <= maxIndex) {
				currentIndex = (minIndex + maxIndex) / 2 | 0;
				currentElement = property?(array[currentIndex]?array[currentIndex][property]:null):array[currentIndex];

				if (currentElement < searchElement) {
					minIndex = currentIndex + 1;
				}
				else if (currentElement > searchElement) {
					maxIndex = currentIndex - 1;
				}
				else {
					return {
						found: true,
						index: currentIndex
					};
				}
			}

			currentIndex = currentElement < searchElement ? currentIndex + 1 : currentIndex;
			return {
				found: false,
				index: currentIndex
			};
		}
	}

	export interface IBinaryResult
	{
		found:boolean;
		index:number;
	}
}