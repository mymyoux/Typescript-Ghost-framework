module ghost.browser.i18n
{
//  Work based on : 
//     (c) 2012 Airbnb, Inc.
//
//     polyglot.js may be freely distributed under the terms of the BSD
//     license. For all licensing information, details, and documention:
//     http://airbnb.github.com/polyglot.js
//
//
// Polyglot.js is an I18n helper library written in JavaScript, made to
// work both in the browser and in Node. It provides a simple solution for
// interpolation and pluralization, based off of Airbnb's
// experience adding I18n functionality to its Backbone.js and Node apps.
//
// Polylglot is agnostic to your translation backend. It doesn't perform any
// translation; it simply gives you a way to manage translated phrases from
// your client- or server-side JavaScript application.
//
	export interface IPolyglotOptions
	{
		currentLocale?:string;
		allowMissing?:boolean;
		phrases?:any;
		warn?:(message:string)=>void;
		locale?:string;
	}


//TODO:LOAD TRANSLATE A LA VOLEE + CACHE

	export class Polyglot
	{
		/**
		 * The string that separates the different phrase possibilities.
		 * @type {String}
		 */
		private static delimeter:string = '||||';
		/**
		 * Polyglot instance
		 * @type {Polyglot}
		 */
		private static _instance:Polyglot;
		/**
		 * Mapping from pluralization group plural logic.
		 * @type {any}
		 */
		private static pluralTypes:any = {
			chinese:   function(n) { return 0; },
			german:    function(n) { return n !== 1 ? 1 : 0; },
			french:    function(n) { return n > 1 ? 1 : 0; },
			russian:   function(n) { return n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2; },
			czech:     function(n) { return (n === 1) ? 0 : (n >= 2 && n <= 4) ? 1 : 2; },
			polish:    function(n) { return (n === 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2); },
			icelandic: function(n) { return (n % 10 !== 1 || n % 100 === 11) ? 1 : 0; }
		};
		/**
		 * Mapping from pluralization group to individual locales.
		 * @type {any}
		 */
		private static pluralTypeToLanguages:any = {
			chinese:   ['fa', 'id', 'ja', 'ko', 'lo', 'ms', 'th', 'tr', 'zh'],
			german:    ['da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv'],
			french:    ['fr', 'tl', 'pt-br'],
			russian:   ['hr', 'ru'],
			czech:     ['cs'],
			polish:    ['pl'],
			icelandic: ['is']
		};

		private static langToTypeMap(mapping):any 
		{
		    var type, langs, l, ret = {};
		    for (type in mapping) {
		      if (mapping.hasOwnProperty(type)) {
		        langs = mapping[type];
		        for (l in langs) {
		          ret[langs[l]] = type;
		        }
		      }
		    }
		    return ret;
	  	}

		/**
		 * Trim a string
		 * @param  {string} str [description]
		 * @return {string}     [description]
		 */
		private static trim(str:string):string
		{
			var trimRe:RegExp = /^\s+|\s+$/g;
			return str.replace(trimRe, '');
		}


		// Based on a phrase text that contains `n` plural forms separated
		// by `delimeter`, a `locale`, and a `count`, choose the correct
		// plural form, or none if `count` is `null`.
		protected static choosePluralForm(text:string, locale:string, count:number):string{
			var ret, texts, chosenText;
			if (count != null && text) {
			  texts = text.split(Polyglot.delimeter);
			  chosenText = texts[Polyglot.pluralTypeIndex(locale, count)] || texts[0];
			  ret = Polyglot.trim(chosenText);
			} else {
			  ret = text;
			}
			return ret;
		}

		private static pluralTypeName(locale:string):any {
			var langToPluralType = Polyglot.langToTypeMap(Polyglot.pluralTypeToLanguages);
			return langToPluralType[locale] || langToPluralType.en;
		}

		private static pluralTypeIndex(locale:string, count:number):any {
			return Polyglot.pluralTypes[Polyglot.pluralTypeName(locale)](count);
		}

		// ### interpolate
		//
		// Does the dirty work. Creates a `RegExp` object for each
		// interpolation placeholder.
		protected static interpolate(phrase:string, options:any):string {
			for (var arg in options) {
			  if (arg !== '_' && options.hasOwnProperty(arg)) {
			    // We create a new `RegExp` each time instead of using a more-efficient
			    // string replace so that the same argument can be replaced multiple times
			    // in the same phrase.
			    phrase = phrase.replace(new RegExp('\\{(\\{)?'+arg+'(\\})?\\}', 'g'), options[arg]);
			  }
			}
			return phrase;
		}

		// ### warn
		//
		// Provides a warning in the console if a phrase key is missing.
		private static warn(message:string):void {
			window.console && window.console.warn && window.console.warn('WARNING: ' + message);
		}

		// ### clone
		//
		// Clone an object.
		protected static clone(source:any):any {
			var ret:any = {};
			for (var prop in source) {
			  ret[prop] = source[prop];
			}
			return ret;
		}
		public static instance():Polyglot
		{
			if(!Polyglot._instance)
			{
				Polyglot._instance = new Polyglot();	
			}
			return Polyglot._instance;
		}

		/**
		 * Phrases
		 * @type {any}
		 */
		protected phrases:any;
		/**
		 * Current's locale
		 * @type {string}
		 */
		protected currentLocale:string;
		/**
		 * Allow missing translation
		 * @type {boolean}
		 */
		protected allowMissing:boolean;
		/**
		 * Warn method
		 * @type {[type]}
		 */
		protected warn:(message:string)=>void;

		/**
		 * Constructor
		 * @param {IPolyglotOptions} options Polyglot options
		 */
		constructor(options?:IPolyglotOptions)
		{
			options = options || {};
		    this.phrases = {};
		    if(options.phrases)
		    	this.extend(options.phrases);
		    var locale:string;
		    if(!options.locale)
		    {
		    	//prefered language
		    	if(window.navigator["languages"] && window.navigator["languages"].length>0)
		    	{
		    		locale= window.navigator["languages"][0];
		    	}else
		    	{
		    		//browser interface language (often not as precise as prefered one. ie en-US instead of en-GB)
		    		locale= (window.navigator.language || window.navigator.userLanguage ? window.navigator.language || window.navigator.userLanguage:"en") ;
		    	}
		    }else
		    {
		    	locale = options.locale;
		    }
		    locale= "fr";
		    this.locale(locale);
		    this.allowMissing = !!options.allowMissing;
		    this.warn = options.warn || Polyglot.warn;	
		    if(!Polyglot._instance)
		    {
		    	Polyglot._instance = this;
		    }else
		    {
		    	console.warn("Polyglot instance already exists");
		    }
		}
  		/**
  		 * @param {string} newLocale New Locale name
  		 */
		public locale(newLocale?:string):string
		{
			if(newLocale)
			{
				this.currentLocale = newLocale;
			}
			return this.currentLocale;
		}
		// ### polyglot.extend(phrases)
		//
		// Use `extend` to tell Polyglot how to translate a given key.
		//
		//     polyglot.extend({
		//       "hello": "Hello",
		//       "hello_name": "Hello, %{name}"
		//     });
		//
		// The key can be any string.  Feel free to call `extend` multiple times;
		// it will override any phrases with the same key, but leave existing phrases
		// untouched.
		//
		// It is also possible to pass nested phrase objects, which get flattened
		// into an object with the nested keys concatenated using dot notation.
		//
		//     polyglot.extend({
		//       "nav": {
		//         "hello": "Hello",
		//         "hello_name": "Hello, %{name}",
		//         "sidebar": {
		//           "welcome": "Welcome"
		//         }
		//       }
		//     });
		//
		//     console.log(polyglot.phrases);
		//     // {
		//     //   'nav.hello': 'Hello',
		//     //   'nav.hello_name': 'Hello, %{name}',
		//     //   'nav.sidebar.welcome': 'Welcome'
		//     // }
		//
		// `extend` accepts an optional second argument, `prefix`, which can be used
		// to prefix every key in the phrases object with some string, using dot
		// notation.
		//
		//     polyglot.extend({
		//       "hello": "Hello",
		//       "hello_name": "Hello, %{name}"
		//     }, "nav");
		//
		//     console.log(polyglot.phrases);
		//     // {
		//     //   'nav.hello': 'Hello',
		//     //   'nav.hello_name': 'Hello, %{name}'
		//     // }
		//
		// This feature is used internally to support nested phrase objects.
		public extend(morePhrases:any, prefix?:string):void
		{
			var phrase:string;
		    for (var key in morePhrases) {
		      if (morePhrases.hasOwnProperty(key)) {
		        phrase = morePhrases[key];
		        if (prefix) key = prefix + '.' + key;
		        if (typeof phrase === 'object') {
		          this.extend(phrase, key);
		        } else {
		          this.phrases[key] = phrase;
		        }
		      }
		    }
		}
		// Clears all phrases. Useful for special cases, such as freeing
		// up memory if you have lots of phrases but no longer need to
		// perform any translation. Also used internally by `replace`.
		public clear():void
		{
			this.phrases = {};
		}
		// Completely replace the existing phrases with a new set of phrases.
	  	// Normally, just use `extend` to add more phrases, but under certain
  		// circumstances, you may want to make sure no old phrases are lying around.
		public replace(newPhrases:any):void
		{
			this.clear();
			this.extend(newPhrases);
		}
		// The most-used method. Provide a key, and `t` will return the
		// phrase.
		//
		//     polyglot.t("hello");
		//     => "Hello"
		//
		// The phrase value is provided first by a call to `polyglot.extend()` or
		// `polyglot.replace()`.
		//
		// Pass in an object as the second argument to perform interpolation.
		//
		//     polyglot.t("hello_name", {name: "Spike"});
		//     => "Hello, Spike"
		//
		// If you like, you can provide a default value in case the phrase is missing.
		// Use the special option key "_" to specify a default.
		//
		//     polyglot.t("i_like_to_write_in_language", {
		//       _: "I like to write in %{language}.",
		//       language: "JavaScript"
		//     });
		//     => "I like to write in JavaScript."
		public t(key:string, options:any):string
		{
			
			debugger;
			if(key === undefined || key === null)
			{
				return "";
			}
			console.log("call trad ",key, options, this);
			var result:string;
			options = options == null ? {} : options;
			if (typeof options === 'number') {
		      options = {smart_count: options};
		    }
		    var phrase:string = this.phrases[key] || options._ || (this.allowMissing ? key : '');
		    if (phrase === '') {
		      this.warn('Missing translation for key: "'+key+'"');

		      //try to retrieve from Server
		      this.retrieveTranslationFromServer(key);
		      phrase = this.phrases[key] || options._ || (this.allowMissing ? key : '');

		      //if not translation=> key is return otherwise we continue
		      if(phrase === '')
		      {
		      	return key;
		      	
		      }
		     }
		      options = Polyglot.clone(options);
		      result = Polyglot.choosePluralForm(phrase, this.currentLocale, options.smart_count);
	    	  result = Polyglot.interpolate(result, options);
	    
		    return result;
		}
		public retrieveTranslationFromServer(key:string):void
		{

		}

	}
}