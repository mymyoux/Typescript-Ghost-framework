//convert
 /*	ghost.browser.io.ajax(*/
import {API2} from "browser/api/API2";
//convert
 /* ghost.browser.data.Warehouse;*/
//convert
 /* ghost.utils.Strings.*/
import {Strings} from "ghost/utils/Strings";
import {Warehouse} from "browser/data/Storage";
//convert
 /* ghost.events.EventDispatcher
*/
import {EventDispatcher} from "ghost/events/EventDispatcher";
//convert
 /*!ghost.utils.Arrays.*/
import {Arrays} from "ghost/utils/Arrays";
import {Auth} from "browser/mvc2/Auth";
///<module="framework/ghost/events"/>
///<module="io"/>
///<module="data"/>

	export interface IPolyglotOptions
	{
		currentLocale?:string;
		allowMissing?:boolean;
		phrases?:any;
		warn?:(message:string)=>void;
		locale?:string;
	}

	export interface ITranslation {
		action: string;
		controller: string;
		key: string;
		name: string;
		plurial: string;
		singular: string;
		shortname?: string;
		type: string;
		updated_time: string;
	}
	export interface IKey {
		controller?: string;
		key?: string;
		type?: string;
	}
	export class Polyglot2 extends EventDispatcher
	{
		/**
		 * Polyglot instance
		 * @type {Polyglot}
		 */
		private static _instance: Polyglot2;

		public static instance(): Polyglot2 {
			if (!this._instance) {
				this._instance = new this();
			}
			return this._instance;
		}
		protected static clone(source: any): any {
			var ret: any = {};
			for (var prop in source) {
				ret[prop] = source[prop];
			}
			return ret;
		}
		/**
		 * Warn to the console
		 * @param {string} message [description]
		 */
		private static warn(message: string): void {
			if (!window.console)
				return;
			if (console.warn) {
				console.warn('warn: ' + message);
			} else {
				console.log('warn: ' + message);
			}
		}
		protected static regexpKey:RegExp =  new RegExp('\\{\\{([^\\} ]+)\\}\\}', 'g');
		/**
		 * replace data inside phrases
		 */
		protected static interpolate(phrase: string, options: any): string {
			//TODO:maybe remove this first part ?
			for (var arg in options) {
				if (arg !== '_' && options.hasOwnProperty(arg)) {
					// We create a new `RegExp` each time instead of using a more-efficient
					// string replace so that the same argument can be replaced multiple times
					// in the same phrase.
					phrase = phrase.replace(new RegExp('\\{(\\{)?' + arg + '(\\})?\\}', 'g'), options[arg]);
				}
			}
			if (options && options.hasOwnProperty("smart_count")) {
				phrase = phrase.replace(/{{count}}/g, options.smart_count);
			}


			//replace complex keys
			//TODO:maybe replace all remaining keys by '' to avoid visual effect
			if(options && this.regexpKey.test(phrase))
			{
				var results:string[] = phrase.match(this.regexpKey);
				for(var key of results)
				{
					var keys:string[] = key.substring(2, key.length-2).split(".");
					var value:any = options[keys[0]];
					for(var i:number=1; i<keys.length; i++)
					{
						if(value == undefined)
							continue;
						value = value[keys[i]];
					}
					if(value != undefined)
					{
						phrase = phrase.replace(new RegExp(key,'g'), value);
					}
				}
			}
			return phrase;
		}
		/**
		 * Current's locale
		 * @type {string}
		 */
		protected currentLocale: string;
		/**
		 * Phrases
		 * @type {any}
		*/
		protected phrases: any;
		/**
		 * Warn method
		 * @type {[type]}
 		*/
		protected warn: (message: string) => void;
		/**
		/**
		 * Controller's has already been retrieved during this session - no luck to have new data
		 * @type {string[]}
		 */
		protected retrieved: string[];
		/**
		 * Last update date for each controllers. Useful for updates
		 * @type {object}
		 */
		protected last_updated: any;
		/**
		 * Local cache
		 * @type {ghost.data.Warehouse}
		 */
		protected _cache: Warehouse;
		/**
		 * Translations have been loaded from cache (or tried to)
		 * @type {boolean}
		 */
		protected _retrievedFromCache: boolean = false;
		/**
		 * Plurial type of the current locale.
		 * @type {string}
		 */
		protected plurialForm: string;
		protected plurialFormServer: string;
		/**
		 * List of controllers up to date
		 * @type {string[]}
		 */
		protected _updated: any;

		/**
		 * If server doesn't support locale
		 * @type {string}
		 */
		protected _serverLocale: string;
		/**
		 * Constructor
		 * @param {IPolyglotOptions} options Polyglot options
		 */
		constructor(options?: IPolyglotOptions) {
			super();
			options = options || {};
			this.phrases = {};
			if (options.phrases)
				this.extend(options.phrases);
			var locale: string;
			if (!options.locale) {
				//prefered language
				if (window.navigator["languages"] && window.navigator["languages"].length > 0) {
					locale = window.navigator["languages"][0];
				} else {
					locale = (window.navigator.language || (<any>window.navigator).userLanguage ? window.navigator.language || (<any>window.navigator).userLanguage : "en");
				}
			} else {
				locale = options.locale;
			}
			this.locale(locale);
			//this.allowMissing = !!options.allowMissing;
			this.warn = options.warn || Polyglot2.warn;
			if (!Polyglot2._instance) {
				Polyglot2._instance = this;
			} else {
				console.warn("Polyglot instance already exists");
			}
			this.retrieved = [];
			this.last_updated = {};
			this._updated = {};
			
		}

		protected cache(): Warehouse {
			if (!this._cache) {
				this._cache = Warehouse.instance().warehouse('polyglot2');
			}
			return this._cache;
		}
		public parseKey(key: string): IKey {
			key = Strings.trim(key.toLowerCase());
			var controller: string = key.split(".")[0]+".";
			var type:string = null;
			var index:number;
			if ((index = key.lastIndexOf("-")) > -1) {
				type = key.substring(index + 1);
				key = key.substring(0, index);
			}
			return {
				controller: controller,
				key: key,
				type:type
			}; 
		}
		public init(useCache:boolean):void
		{
			this.retrieveFromCache(useCache);
		}
		private retrieveFromCache(useCache): void {
 
			if (!this._retrievedFromCache) {
				if (!useCache)
				{
					this._retrievedFromCache = true;
					this.retrieveUpdate();
					return;
				}
				this._retrievedFromCache = true;
				if (this.cache().has("locale")) {
					if (this.cache().get("locale") != this.locale()) {
						this.clearCache();
						console.log("cache clear due to a language change");
						return;
					}
				}
				if (this.cache().has("phrases")) {
					//TODO:maybe we can merge, and don't call this function at launch but on demand
					this.phrases = this.cache().get("phrases");
				}
				if (this.cache().has("last_updated")) {
					//TODO:maybe we can merge, and don't call this function at launch but on demand
					this.last_updated = this.cache().get("last_updated");
				}
				if (this.cache().has("updated")) {
					this._updated = this.cache().get("updated");
				}
				if (this.cache().has("serverlocale")) {
					this.serverLocale(this.cache().get("serverlocale"));
				}
				this.retrieveUpdate();
			}
		}
		public retrieveUpdate(): void {
			if (this._updated) {
				var needsUpdate: any = {};
				var found: boolean = false;
				for (var p in this._updated) {
					//not updated since 24h
					if (this._updated[p] < Date.now() /*- 3600 * 1000 - 24*/) {
						needsUpdate[p] = this.last_updated[p];//.push(p);
						found = true;
					}
				}
				if (found) {
					API2.instance().request().path('translate/update').param('keys',needsUpdate).param('locale', this.locale())
					.then((result: any) => {
							if (!result || result.length == 0) {
								return;
							}

							this.extend(result);

							result.forEach(function(item: ITranslation): void {
								if (!this.last_updated[item.controller]) {
									this.last_updated[item.controller] = item.updated_time;
								} else {
									if (this.last_updated[item.controller] < item.updated_time) {
										this.last_updated[item.controller] = item.updated_time;
									}
								}
							}, this);

							for (var p in needsUpdate) {
								this._updated[p] = Date.now();
							}

							this.cache().set("last_updated", this.last_updated);
							this.cache().set("updated", this._updated);

						}, (error) => {
							console.warn("Failed to update translations");
						}
						);
				}
			}
		}
		public retrieveTranslationFromServer(key: string): void {
			var short: string = this.parseKey(key).controller;//key.split(".").slice(0, 1).join(".")+".";
			if (this.retrieved.indexOf(key) != - 1) {
				//already retrieved we do nothing
				return;
			} else {
				this.retrieved.push(key);
			}
			if (this.retrieved.indexOf(short) != -1) {
				return;
			} else {
				this.retrieved.push(short);
			}
			API2.instance().request().path('translate/resolve').param('key',key).param("all",true).param('locale', this.locale())
				.then((result: any) => {
					if ( !result.translations || result.translations.length == 0) {
						console.warn("Failed to retrieved translation for ", key);
						return;
					}
					if (result && result.locale && result.locale) {
						this.serverLocale(result.locale);
					}
					this.extend(result.translations);


					var date: string = result.translations.reduce(function(previous: string, item: ITranslation) {
						if (!previous) {
							return item.updated_time;
						}
						if (previous < item.updated_time) {
							return item.updated_time;
						}
						return previous;
					}, null);

					if (date) {
						var controller: string = short;
						if (!this.last_updated[controller]  || this.last_updated[controller] < date) {
							this.last_updated[controller] = date;
							this.cache().set("last_updated", this.last_updated);
						}
						this._updated[controller] = Date.now();
						this.cache().set("updated", this._updated);
					}
					if (result.translations) {
						this.trigger("resolved:" + short);
					}

				}, (error) => {
					debugger;
					console.warn("Failed to retrieved translation for ", key);
					//this.retrieved.push(key);
				}
				);

		}
		/**
		 * Adds new translations to the polyglot. will replace existing ones
		 * @param {ITranslation[]} morePhrases Array of new translations
		 */
		public extend(morePhrases: ITranslation[]): void
		/**
		 * Adds a new translation to the polyglot. will replace existing ones
		 * @param {ITranslation} morePhrases A new Translation
		 */
		public extend(morePhrases: ITranslation): void
		public extend(morePhrases: any): void {
			if (!morePhrases) {
				return;
			}
			if (!Arrays.isArray(morePhrases)) {
				this.addPhrase(morePhrases);
				return;
			}
			morePhrases.forEach(this.addPhrase, this);

			this.cache().set("phrases", this.phrases);
		}
		private addPhrase(phrase: ITranslation): void {
			this.phrases[phrase.key] = phrase;

			/*if(!this.last_updated[phrase.controller] || this.last_updated[phrase.controller]<phrase.updated_time)
			{
				this.last_updated[phrase.controller] = phrase.updated_time;
			}*/

		}

		public t(key: string, options: any = null): string {
			if (key === undefined ||  key === null || key == "" || key.substring(key.lastIndexOf(".") + 1) == "undefined" || key.substring(key.lastIndexOf(".") + 1) == "null") {
				return "";
			}
		
			var result: string;
			options = options == null ? {} : options;
			if (typeof options === 'number') {
				options = { smart_count: options };
			}
			if (options.hasOwnProperty("smart_count")) {
				if (typeof options.smart_count != "number") {
					if (options.smart_count === undefined || options.smart_count === null) {
						options.smart_count = 0;
					} else {
						options.smart_count = parseFloat(options.smart_count);
						if (isNaN(options.smart_count)) {
							options.smart_count = 0;
						}
					} 
				}
			}

			var plurial: string = this.getPluralForm(this.serverLocale(), options.smart_count);

			var phrase: ITranslation = this.phrases[key + "-" + Auth.type()] || this.phrases[key] || options._;
			if (!phrase) {
				if(key.indexOf(".")==-1)
				{
					key = "app."+key;
					phrase =  this.phrases[key + "-" + Auth.type()] || this.phrases[key] || options._;
				}
				if (!phrase) {
					this.retrieveTranslationFromServer(key);
					phrase = this.phrases[key + "-" +Auth.type()] || this.phrases[key];
				}
			}
			if (!phrase) {
				this.warn('Missing translation for key: "' + key + '"');
				return (options.hasOwnProperty("smart_count") ? options.smart_count + " " : "") + key;
			}
			if (!phrase[plurial]) {
				//TODO: Flag missing form
				this.warn("Missing plurial form[" + plurial + "] for key " + key);
				return (options.hasOwnProperty("smart_count") ? options.smart_count + " " : "") + key;
			}

			return Polyglot2.interpolate(phrase[plurial], options);
		}
		/**
		 * Mapping from pluralization group to individual locales.
		 * @type {any}
		 */
		private static pluralTypeToLocales: any = {
			chinese: ['fa', 'id', 'ja', 'ko', 'lo', 'ms', 'th', 'tr', 'zh'],
			german: ['da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv'],
			french: ['fr', 'tl', 'pt-br'],
			russian: ['hr', 'ru'],
			czech: ['cs'],
			polish: ['pl'],
			icelandic: ['is']
		};
		/**
  		 * @param {string} newLocale New Locale name
  		 */
		public locale(newLocale?: string): string {
			if (newLocale) {
				var last: string = this.currentLocale;
				this.currentLocale = this._convertLocale(newLocale);
				this.plurialForm = this._getPlurialForm(this.currentLocale);
				if (last && last != this.currentLocale) {
					this.clear();
				}
				if (this.cache().has("locale") && this.cache().get("locale") != this.currentLocale) {
					this.clearCache();
				}
				this.cache().set("locale", this.currentLocale);
			}
			return this.currentLocale;
		}
		public getUsedPluralForm(): string {
			return this.plurialFormServer ? this.plurialFormServer : this.plurialForm;
		}
		public serverLocale(newLocale?: string): string {
			if (newLocale) {
				this.cache().set("serverlocale", newLocale);
				this._serverLocale = newLocale;
				this.plurialFormServer = this._getPlurialForm(newLocale);
			}
			return this._serverLocale ? this._serverLocale : this.locale();
		}
		public clear(): void {
			console.log("CLEANING");
			this.phrases = {};
			this.retrieved = [];
			this.last_updated = {};

			this._updated = {};
			this.clearCache();

		}
		private clearCache(): void {
			this._retrievedFromCache = false;
			console.warn("CLEAR CACHE");
			this.cache().clear();
		}
		//simplication
		private _getPlurialForm(locale: string): string {
			for (var p in Polyglot2.pluralTypeToLocales) {
				if (Polyglot2.pluralTypeToLocales[p].indexOf(locale) != -1) {
					return p;
				}
			}
			return this._getPlurialForm("en");
		}
		//simplication
		private _convertLocale(locale: string): string {
			return locale.split("-")[0];
		}
		/**
		 * Mapping from pluralization group plural logic.
		 * @type {any}
		 */
		private static plurals: any = {
			chinese: function(n) { return 0; },
			german: function(n) { return n !== 1 ? 1 : 0; },
			french: function(n) { return n > 1 ? 1 : 0; },
			russian: function(n) { return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2; },
			czech: function(n) { return (n === 1) ? 0 : (n >= 2 && n <= 4) ? 1 : 2; },
			polish: function(n) { return (n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2); },
			icelandic: function(n) { return (n % 10 !== 1 || n % 100 === 11) ? 1 : 0; }
		};

		private getPluralForm(locale: string, quantity: number): string {
			if (quantity === undefined ||  quantity === null) {
				return "singular";
			}
			var plurialForm: any = this.getUsedPluralForm();
			if (!plurialForm) {
				return "singular";
			}
			if (typeof quantity != "number") {
				quantity = parseFloat(<any>quantity);
			}
			var index: number = Polyglot2.plurals[plurialForm](quantity);
			if (index == 0) {
				return "singular";
			}
			return "plurial";
		}

	}
