///<module="framework/ghost/events"/>
///<module="io"/>
///<module="data"/>
namespace ghost.browser.i18n
{
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
		action?: string;
		controller?: string;
		key?: string;
		name?: string;
		type?: string;
		error?: string;
		original?: string;
	}
	export class Polyglot extends ghost.events.EventDispatcher
	{
		/**
		 * Polyglot instance
		 * @type {Polyglot}
		 */
		private static _instance: Polyglot;

		public static instance(): Polyglot {
			if (!Polyglot._instance) {
				Polyglot._instance = new Polyglot();
			}
			return Polyglot._instance;
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
		/**
		 * replace data inside phrases
		 */
		protected static interpolate(phrase: string, options: any): string {
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
		protected _cache: ghost.browser.data.Warehouse;
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
		constructor(options?: ghost.browser.i18n.IPolyglotOptions) {
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
			this.warn = options.warn || Polyglot.warn;
			if (!Polyglot._instance) {
				Polyglot._instance = this;
			} else {
				console.warn("Polyglot instance already exists");
			}
			this.retrieved = [];
			this.last_updated = {};
			this._updated = {};
			this.retrieveFromCache();
		}

		protected cache(): ghost.browser.data.Warehouse {
			if (!this._cache) {
				this._cache = ghost.cache.warehouse("polyglot");
			}
			return this._cache;
		}
		public getPartsFromKey(key: string): IKey {
			key = ghost.utils.Strings.trim(key.toLowerCase());
			var parts: string[] = key.split(".");
			var index: number;
			var type: string = null;
			if (parts.length > 2) {
				if ((index = parts[parts.length - 1].indexOf("-")) > -1) {
					type = parts[parts.length - 1].substring(index + 1);
					parts[parts.length - 1] = parts[parts.length - 1].substring(0, index);
				}
			}

			return {
				controller: parts[0],
				action: parts[1],
				key: parts.slice(2).join("."),
				type: type,
				name: key
			};
		}
		private retrieveFromCache(): void {

			if (!this._retrievedFromCache) {
				if (false && window.location.href.indexOf(".local") != -1) {
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
		protected getRootURL(): string {
			if (ghost["mvc"])
				return ghost["mvc"].Application.getRootURL();
			return "/";
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
					ghost.io.ajax(this.getRootURL() + "translate/update", <any>
						{
							data: { controllers: needsUpdate, locale: this.locale() },
							method: "POST"
						}).then((result: any) => {
							if (!result.success || !result.translations || result.translations.length == 0) {
								if (!result.success) {
									console.warn("Failed to update translations");
								}
								return;
							}

							this.extend(result.translations);

							result.translations.forEach(function(item: ITranslation): void {
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
			var short: string = key.split(".").slice(0, 1).join(".");
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

			ghost.io.ajax(this.getRootURL() + "translate/resolve", <any>
				{
					data: { key: key, locale: this.locale() },
					method: "POST",
					async: true
				}).then((result: any) => {
					if (!result.success || !result.translations || result.translations.length == 0) {
						if (!result.success) {
							console.warn("Failed to retrieved translation for ", key);
						}
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
						var controller: string = this.getPartsFromKey(key).controller;
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
			if (!ghost.utils.Arrays.isArray(morePhrases)) {
				this.addPhrase(morePhrases);
				return;
			}
			morePhrases.forEach(this.addPhrase, this);

			this.cache().set("phrases", this.phrases);
		}
		private addPhrase(phrase: ITranslation): void {
			this.phrases[phrase.name] = phrase;

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

			var phrase: ITranslation = this.phrases[key + "-" + ghost["mvc"].Application.instance().user.type] || this.phrases[key] || options._;
			if (!phrase) {
				this.retrieveTranslationFromServer(key);
				phrase = this.phrases[key + "-" + ghost["mvc"].Application.instance().user.type] || this.phrases[key];
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

			return Polyglot.interpolate(phrase[plurial], options);
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
			for (var p in Polyglot.pluralTypeToLocales) {
				if (Polyglot.pluralTypeToLocales[p].indexOf(locale) != -1) {
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
			var index: number = Polyglot.plurals[plurialForm](quantity);
			if (index == 0) {
				return "singular";
			}
			return "plurial";
		}

	}
}
