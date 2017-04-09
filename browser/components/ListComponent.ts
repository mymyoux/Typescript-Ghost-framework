///<module="framework/browser/mvc"/>
///<module="framework/ghost/utils"/>
///<module="mobiskill/main/models"/>
///<module="services"/>

//tsc:uncomment
//import * as indexCollection from "mobiskill/main/collections/index";
//tsc:uncomment
//import * as indexAdminCollection from "mobiskill/admin/collections/index";
import {Component} from "browser/mvc/Component";
import {Model} from "browser/mvc/Model";
import {API2} from "browser/api/API2";
import {Buffer} from "ghost/utils/Buffer";
import {Strings} from "ghost/utils/Strings";


export class ListComponent extends Component {
    protected model: any;
    private scrollLoading: boolean = false;
    private _scroll:any;
    private listenScroll: boolean;
    private triggerSubmit:any;
    protected previousSearch: string;
    protected bind: any;

    protected getRequiredData(): string[] {
        return ["list"];
    }
    protected init(): void {
        super.init(); 
    }
    protected bindEvents(): void {
        this.triggerSubmit = Buffer.throttle(this.submit.bind(this), 300);

        $(this.instance.find('.menu-actions')).on("change", "select", (event) => {
            var type : string = Strings.trim($(event.target).val());

            if (type.length === 0) type = null;

            this.filterAction(this.instance.get('list'), type);
        });

        $(this.instance.find('.custom-select ul')).on("clickoutside", (event, currentEvent) => {

            var list = this.instance.get('list');
            this.scrollLoading = true;
            list.setLoading(true);

            list.filterData( this.getParams(list) ).then(() => {
                this.scrollLoading = false;
                list.setLoading(false);
            }, () => {
                this.scrollLoading = false;
                list.setLoading(false);
            }).done();
        });

        this.listenScroll = this.instance.get("scroll") !== false;
        if (!this.listenScroll)
        {
            return;
        }
        $(this.getContainer()).closest('.scroll-list-users,[data-scope]').get(0).addEventListener("scroll", this._scroll = (event) =>
        {
            if(!event.originalEvent)
            {
                event.originalEvent = event;
            }
            var list : any = this.instance.get('list');

            if(true === this.scrollLoading || true === list.isFullyLoad())
            {
                return;
            }
            var $ul = $(event.currentTarget).closest('[data-scope]');

            var scroll : number = $ul.get(0).scrollHeight - $ul.outerHeight(true) - $ul.scrollTop();

            if (scroll <= ($(document).height() / 3) && (event.originalEvent["wheelDelta"] < 0 || event.originalEvent["wheelDelta"] === undefined))
            {
                this.loadMore( list );
            }
        }, <any>{ passive: true });
        $(this.getContainer()).closest('.scroll-list-users,[data-scope]').get(0).addEventListener("mousewheel", this._scroll,<any>{ passive: true });
        $(this.getContainer()).closest('.scroll-list-users,[data-scope]').get(0).addEventListener("DOMMouseScroll", this._scroll, <any>{ passive: true });
    }
    protected activate():void
    {
        super.activate();

        var list : any = this.instance.get('list');
        this.set("search", list.current_search ? list.current_search:"");
            var collections:any;
//        this.instance.set('list_id_name', collections[list.getClassName()].getIDName());
    }

    protected unbindEvents(): void {

        if (!this._scroll)
        {
            return;
        }
        $(this.getContainer()).closest('.scroll-list-users,[data-scope]').get(0).addEventListener("scroll", this._scroll);
        $(this.getContainer()).closest('.scroll-list-users,[data-scope]').get(0).addEventListener("mousewheel", this._scroll);
        $(this.getContainer()).closest('.scroll-list-users,[data-scope]').get(0).addEventListener("DOMMouseScroll", this._scroll);
    }
    protected getInitialData(): any {
        return [
        {
            search:"",
            loading: false
        }];
    }
    protected getBindedFunctions(): any {
        return {
            action 			: this.action.bind(this),
            loadMore 		: this.loadMore.bind(this),
            sorting         : this.sorting.bind(this),
            exportData: this.exportData.bind(this),
            onKeyUp         : this.onKeyUp.bind(this),
            onBlur          : this.onBlur.bind(this),
            openSearch      : this.openSearch.bind(this),
            showData        : this.showData.bind(this),
            addFilterMultiSelect: this.addFilterMultiSelect.bind(this)
        }
    }
    protected exportData(): void
    {
        window.open(this.instance.get("list").filterData(this.getParams(this.instance.get("list"))).export().toURL());
        this.filterAction(this.instance.get("list"), null).done();
    }
    protected showData(data:any, type: string = null): void {
       

    }
    public openSearch( event ) : void
    {
        var $searchbox : JQuery = $(this.instance.find('.searchbox'));

        if ($searchbox.hasClass('open'))
        {
            if(Strings.trim(this.instance.get("search")))
            {
                return;
            }
            if (true === $(event.original.toElement).hasClass('icon-search'))
                $searchbox.removeClass('open');
        }
        else
        {
            $searchbox.addClass('open');
            $searchbox.find('input').focus();
        }
    }

    protected onKeyUp( event ) : void
    {
        if (event.original.keyCode == 13)
        {
            this.submitSearch();
        }
    }
    protected onBlur(event:any):boolean
    {
        var $searchbox: JQuery = $(this.instance.find('.searchbox'));
        if ($searchbox.hasClass('open')) {
            if (!Strings.trim(this.instance.get("search"))) {
                setTimeout(() => {
                    if (!$(document.activeElement).closest(".searchbox.btn").length)
                    {
                        $searchbox.removeClass('open');
                    }
                }, 100);
            }
            this.submitSearch();
        }
        event.original.preventDefault();
        event.original.stopPropagation();
        event.original.stopImmediatePropagation();
        return false;

    }

    public submit():void
    {
        this.previousSearch = this.instance.get("search");
        this.SearchAction(this.instance.get('list'), this.instance.get('search'));
    }
    protected submitSearch():void
    {
        if (this.previousSearch != this.instance.get("search"))
            this.triggerSubmit();
    }
    protected onSearch(list:any, search:string):void{
        this.SearchAction(list, search).done();
    }
    public SearchAction( list : any, search : string ) : API2
    {
        list.current_search = search;

        //this.instance.set('loading', true);
        this.scrollLoading = true;
        list.setLoading(true);

        return list.filterData( this.getParams(list) ).then(() => {
            // this.instance.set('loading', false);
            this.scrollLoading = false;
            list.setLoading(false);
        }, () => {
            //this.instance.set('loading', false);
            this.scrollLoading = false;
            list.setLoading(false);
        });
    }

    public addFilterMultiSelect( list : any, type : string ) : void
    {
        var pos = list.current_filters.indexOf(type);

        if (pos == -1)
            list.current_filters.push(type);
        else
            list.current_filters.splice(pos, 1);
    }

    public filterAction( list : any, type : string ) : API2
    {
        list.current_filter = type;

        list.setLoading(true);
        this.scrollLoading = true;

        return list.filterData( this.getParams(list) ).then(() => {
            list.setLoading(false);
            this.scrollLoading = false;
        }, () => {
            list.setLoading(false);
            this.scrollLoading = false;
        });
    }

    private getParams( list ) : any
    {
        var params : any = {};

        if (list.current_search)
            params.search = list.current_search;

        if (!list.multiFilters()) {
            if (list.current_filter)
                params.types = [list.current_filter];
        }
        else
        {
            if (list.current_filters)
                params.types = list.current_filters;
        }

        return params;
    }

    public sorting( list : any, column : any ) : any
    {
        if(!column.column)
        {
            return;
        }
        if (typeof column.order === 'undefined')
        {
            column.order = [-1];
            while(column.column.length>column.order.length)
            {
                column.order.push(-1);
            }
        }

        column.order[0] = (-1 === column.order[0] ? 1 : -1);

        column.selected = true;
        for (var i in list.columns)
        {
            if (list.columns[i].name !== column.name)
            {
                list.columns[i].selected = false;
                if (list.columns[i].order)
                    list.columns[i].order[0] = -1;
            }
        }
        list.order_name = column.column;
        list.order_direction = column.order;

        list.setLoading(true);
        this.scrollLoading = true;

        list.filterData( this.getParams(list) ).order(column.column, column.order).then(() => {
            list.setLoading(false);
            this.scrollLoading = false;
        }, () => {
            list.setLoading(false);
            this.scrollLoading = false;
        });
    }

    public loadMore( list : any ) : any
    {
        list.loadMore(this);
        // this.scrollLoading = true;

        // list.setLoading(true);

        // var next : any = list.nextAll();

        // if (list.current_search != null)
        //     next.param('search', list.current_search);

        // if (list.current_filter != null)
        //     next.param('types', [list.current_filter]);
        // debugger;

        // next.then((data:any)=>
        // {
        //     list.setLoading(false);
        //     this.scrollLoading = false;
        //     if(data && !data.length)
        //     {
        //         list.trigger(ghost.browser.mvc.Collection.EVENT_CHANGE);
        //     }
        // }, ()=>
        // {
        //     list.setLoading(false);
        //     this.scrollLoading = false;
        // });
    }

    protected action(type:string, data:any):void
    {
        console.log("proxy:" + type);
        this.fire.apply(this, Array.prototype.slice.call(arguments));
    }
}
