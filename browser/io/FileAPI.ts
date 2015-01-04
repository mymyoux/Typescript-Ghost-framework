///<lib="es6-promise"/>
module ghost.browser.io
{
	export class FileAPI
	{
		public static loadFile(input:HTMLInputElement)
		{
			var promise:Promise<ProgressEvent> = new Promise<ProgressEvent>((resolve:(value:ProgressEvent)=>void, reject:(error:ErrorEvent|Error)=>void)=>
			{

				var file = input.files[0];
				if(!file)
				{
					input.addEventListener("change", ()=>
					{

						this.loadFile(input).then(resolve, reject);
					});
					return;
				}
				var textType = /text.*/;

				if (file.type.match(textType)) {
					var reader = new FileReader();

					reader.onload = function(e) {
						resolve(<ProgressEvent>e);
					//	fileDisplayArea.innerText = reader.result;  
					}
					reader.onerror = function(e)
					{
						reject(e);
					}
					reader.readAsText(file);	
				} else {
					reject(new Error( "format not readable"));
					//fileDisplayArea.innerText = "File not supported!"
				}



			});

			return promise;
		}
	}
}