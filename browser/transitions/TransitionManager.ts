///<module="debug"/>
///<module="framework/ghost/events"/>
///<file="Transition"/>
namespace ghost.transitions {
    /**
 * Manages transition view based
 * @type {*}
 */
    export class TransitionManager extends ghost.events.EventDispatcher {
        /**
        * Event triggered when a view is pushed
        * @type {string}
        */
        public static VIEW_PUSHED = "view_pushed";
        /**
         * Event triggered when a view is changing
         * @type {string}
         */
        public static VIEW_CHANGING = "view_changing";
        /**
         * Event triggered when a view is changed
         * @type {string}
         */
        public static VIEW_CHANGED = "view_changed";



        private _currentView: any;
        private _defaultTransition: ghost.transitions.ViewTransition;
        private _noTransition: ghost.transitions.ViewTransition;
        private _$root: JQuery;
        /**
         * Constructor
         * @param root root object
         * @private
         */
        constructor(root) {
            super();
            log.hide();
            this._currentView = null;
            this._defaultTransition = new ghost.transitions.SlideViewTransition();
            this._defaultTransition.setOptions({ duration: 200 });
            this._noTransition = new ghost.transitions.NoViewTransition();
            this._noTransition.setOptions({ duration: 0 });
            this._link(root);


        }
        /**
         * Gets root object
         * @returns {JqueryObject}
         */
        public $getRoot() {
            return this._$root;
        }
        /**
         * Sets Default transition used when no transition is specified
         * @param transition {ViewTransition}
         */
        public setDefaultTransition(transition) {
            this._defaultTransition = transition;
        }
        /**
         * Sets Default transition used when no transition is specified
         * @param transition {ViewTransition}
         */
        public setNoTransition() {
            this._defaultTransition = this._noTransition;
        }
        /**
         * Gets default transition used when no transition is specified
         * @returns {ViewTransition}
         */
        public getDefaultTransition() {
            return this._defaultTransition;
        }
        /**
         * Links the root to the transition manager
         * @param $root
         * @private
         */
        private _link($root: JQuery);
        private _link($root: string);
        private _link($root?: any) {
            if (typeof $root == "string") {
                $root = $($root);
                this._$root = $root;
            }
            if ($root) {
                var name = $root.attr("name");
                if (!name) {
                    name = $root.attr("id");
                }
                if (name)
                    ghost.events.Eventer.on(ghost.events.Eventer.PAGE_CHANGED + ":" + name, this._onPageChanged, this);
                //$root.children().height($root.height());
                //$root.children().height("100%");
                if (ghost.hasClass("ghost.browser.navigation.Navigation")) {
                    var childname = null;
                    var $first;
                    if ($root.attr("first")) {
                        var first = $root.attr("first");
                        $first = $("#" + first, $root);
                        if ($first.get(0) == null) {
                            $first = $("[name='" + first + "']", this._$root);
                        }

                        if ($first.get(0) != null) {
                            childname = first;
                        }
                    } else {
                        $first = $root.find(">:first-child");
                        if ($first.get(0)) {
                            childname = $first.attr("id");
                            if (!childname) {
                                childname = $first.attr("name");
                            }
                        }

                    }
                    $root.children().hide();
                    if ($first) {
                        $first.show();
                    }
                    if (childname) {
                        ghost.getClassByName("ghost.browser.navigation.Navigation").pushPage(name, childname);
                    }
                }

            }
        }
        /**
         * Called when a page has changed
         * @param type type of change
         * @param previous previous page
         * @param next next page
         * @private
         */
        private _onPageChanged(scope: string, type, previous, next) {
            log.info("PAGE CHANGED " + scope + ":" + type + ": " + previous + "=>" + next);
            this.pushView(next);
        }
        private pages: string[] = ["board", "resume", "check", "integration"];
        protected getTransition(current: string, next: string): ghost.transitions.ViewTransition {
            log.info("current:" + current + " => " + "next:" + next);
            var transition: ghost.transitions.ViewTransition = this._defaultTransition.clone();
            if (this.pages.indexOf(current) > this.pages.indexOf(next)) {
                transition.reverse(true);
            }

            return transition;
        }
        /**
         * Pushes view
         * @param view new view
         * @param transition transition. Default #getDefaultTransition()
         */
        public pushView(view: string, transition?: ghost.transitions.ViewTransition): void {
            if (this._currentView != view) {
                if (!transition) {
                    transition = this.getTransition(this._currentView, view);
                    if (!transition) {
                        transition = this._defaultTransition.clone();
                        transition.reverse(false);
                    }
                }
                var old = this._currentView;
                this._currentView = view;
                this.trigger(TransitionManager.VIEW_PUSHED);
                // alert("options:"+JSON.stringify(transition._options));
                // alert(old);
                this._startTransition(transition, this._currentView, old);
            }
        }
        /**
         * Starts transition
         * @param transition
         * @param from element to transition
         * @param to element to reach
         * @private
         */
        private _startTransition(transition, from, to) {

            this.trigger(TransitionManager.VIEW_CHANGING);
            var _this = this;


            if (typeof from == "string") {
                from = this._$root.find("[data-container='" + from + "']");
            }
            if (typeof to == "string") {
                to = this._$root.find("[data-container='" + to + "']");
                //to = $(to);
            }

            if (!to) {
                transition = this._noTransition;
            }
            transition.link(from, to);

            transition.start(function() {
                _this.trigger(TransitionManager.VIEW_CHANGED);
            });
        }

        /**
         * Gets current visible view
         * @returns {*}
         */
        public getCurrentView() {
            return this._currentView;
        }
    }
}
