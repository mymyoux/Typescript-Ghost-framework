
	var dispatcher;

	function Listener(name)
	{
		this.name = name;
		this.called = 0;
		this.params = null;
	}
	Listener.prototype.callback = function()
	{
		//console.log("callback listener = " + this.name);
		this.called++;
		this.params = Array.prototype.slice.call(arguments);
	//	console.log(this.name);
	};
	Listener.prototype.reset = function()
	{
		this.called = 0;
		this.params = null;
	};
	Listener.prototype.callbackKill = function()
	{
		//console.log("callback kill");
		dispatcher.dispose();
	};
	Listener.prototype.callbackOff = function()
	{
		//console.log("callback off");
		dispatcher.off("k1");
	};
	var listenerk1k2;
	var listenerk1;
	var listenerk2;
	var listenerall;
	var listenerk3k3;
	var listenerk3;
	var listenerkill;

	var eventk1 = "k1";
	var eventk2 = "k2";
	var eventk3 = "k3";
	var eventall = "all";


	function resetAllListeners()
	{
		listenerk1k2.reset();
		listenerk1.reset();
		listenerk2.reset();
		listenerk3k3.reset();
		listenerk3.reset();
		listenerall.reset();
	}
	function prepareListeners()
	{
		dispatcher.on(eventk1, listenerk1.callback,listenerk1);
		dispatcher.on("all:"+eventk2, listenerk2.callback, listenerk2);
		dispatcher.on(eventk1+":"+eventk2, listenerk1k2.callback, listenerk1k2);
		dispatcher.on("all", listenerall.callback, listenerall);
		dispatcher.on(eventk3+":"+eventk3, listenerk3k3.callback, listenerk3k3);
		dispatcher.on(eventk3, listenerk3.callback, listenerk3);
	}

	describe('Constructor', function() {
		it('should initiate without error', function() {
				dispatcher = new ghost.events.EventDispatcher();

				listenerk1k2 = new Listener("k1:k2");
				listenerk1 = new Listener("k1:any");
				listenerk2 = new Listener("any:k2");
				listenerall = new Listener("any:any");
				listenerk3k3 = new Listener("k3:k3");
				listenerk3 = new Listener("k3:any");
				listenerkill = new Listener("any:any");
		});
	});
	describe('On', function() {
		it('Empty on - all', function() {
			expect(function()
			{
				dispatcher.on();
			}).to.throw(Error);
		});
		it('Empty on - event', function() {
			expect(function()
			{
				dispatcher.on(eventk1);
			}).to.throw(Error);
		});
		it('On', function() {

			prepareListeners();
			expect(dispatcher._listeners.length).to.equal(6);
/*
			expect(dispatcher._eventsK1[eventk1].length).to.equal(2);
			expect(dispatcher._eventsK1["all"].length).to.equal(2);
			expect(dispatcher._eventsK1[eventk3].length).to.equal(2);

			expect(dispatcher._eventsK2[eventk2].length).to.equal(2);
			expect(dispatcher._eventsK2["all"].length).to.equal(3);
			expect(dispatcher._eventsK2[eventk3].length).to.equal(1);*/

		});
	});
	describe("Trigger", function(){
		it('Trigger k1:k2', function() {
			dispatcher.trigger(eventk1+":"+eventk2);
			expect(listenerk1k2.called).to.equal(1);
			expect(listenerk1.called).to.equal(1);
			expect(listenerk2.called).to.equal(1);
			expect(listenerall.called).to.equal(1);
			expect(listenerk3k3.called).to.equal(0);
			expect(listenerk3.called).to.equal(0);

			resetAllListeners();
		});

		

		it('Trigger k1', function() {
			dispatcher.trigger(eventk1);

			expect(listenerk1k2.called).to.equal(0);
			expect(listenerk1.called).to.equal(1);
			expect(listenerk2.called).to.equal(0);
			expect(listenerall.called).to.equal(1);
			expect(listenerk3k3.called).to.equal(0);
			expect(listenerk3.called).to.equal(0);

			resetAllListeners();
		});

		it('Trigger k1:all', function() {
			dispatcher.trigger(eventk1+":all");

			expect(listenerk1k2.called).to.equal(1);
			expect(listenerk1.called).to.equal(1);
			expect(listenerk2.called).to.equal(1);
			expect(listenerall.called).to.equal(1);
			expect(listenerk3k3.called).to.equal(0);
			expect(listenerk3.called).to.equal(0);

			resetAllListeners();
		});

		it('Trigger all:k2', function() {
			dispatcher.trigger("all:"+eventk2);

			expect(listenerk1k2.called).to.equal(1);
			expect(listenerk1.called).to.equal(1);
			expect(listenerk2.called).to.equal(1);
			expect(listenerall.called).to.equal(1);
			expect(listenerk3k3.called).to.equal(0);
			expect(listenerk3.called).to.equal(1);

			resetAllListeners();
		});

		it('Trigger all:all', function() {
			dispatcher.trigger("all:all");

			expect(listenerk1k2.called).to.equal(1);
			expect(listenerk1.called).to.equal(1);
			expect(listenerk2.called).to.equal(1);
			expect(listenerall.called).to.equal(1);
			expect(listenerk3k3.called).to.equal(1);
			expect(listenerk3.called).to.equal(1);

			resetAllListeners();
		});

		it('Trigger all', function() {
			dispatcher.trigger("all");

			expect(listenerk1k2.called).to.equal(0);
			expect(listenerk1.called).to.equal(1);
			expect(listenerk2.called).to.equal(0);
			expect(listenerall.called).to.equal(1);
			expect(listenerk3k3.called).to.equal(0);
			expect(listenerk3.called).to.equal(1);

			resetAllListeners();
		});
	});
	describe("Off", function(){
		it('Off all:all', function() {
			dispatcher.off();
			dispatcher.trigger("all:all");

			expect(listenerk1k2.called).to.equal(0);
			expect(listenerk1.called).to.equal(0);
			expect(listenerk2.called).to.equal(0);
			expect(listenerall.called).to.equal(0);
			expect(listenerk3k3.called).to.equal(0);
			expect(listenerk3.called).to.equal(0);

			expect(dispatcher._eventsK1).to.be.empty;
			expect(dispatcher._eventsK2).to.be.empty;

			resetAllListeners();

			prepareListeners();
		});

		it('Off k1', function() {
			dispatcher.off("k1");
			dispatcher.trigger("all:all");

			expect(listenerk1k2.called).to.equal(0);
			expect(listenerk1.called).to.equal(0);
			expect(listenerk2.called).to.equal(1);
			expect(listenerall.called).to.equal(1);
			expect(listenerk3k3.called).to.equal(1);
			expect(listenerk3.called).to.equal(1);
			/*
			expect(dispatcher._eventsK1).to.be.empty;
			expect(dispatcher._eventsK2).to.be.empty;*/


			dispatcher.off();
			resetAllListeners();
			prepareListeners();
		});


		it('Off k1k2', function() {
			dispatcher.off("k1k3");
			dispatcher.trigger("all:all");

			expect(listenerk1k2.called).to.equal(1);
			expect(listenerk1.called).to.equal(1);
			expect(listenerk2.called).to.equal(1);
			expect(listenerall.called).to.equal(1);
			expect(listenerk3k3.called).to.equal(1);
			expect(listenerk3.called).to.equal(1);
			/*
			expect(dispatcher._eventsK1).to.be.empty;
			expect(dispatcher._eventsK2).to.be.empty;*/


			dispatcher.off();
			resetAllListeners();
		//	prepareListeners();
		});
		//TODO:test le dispose/remove during a trigger
  });

	describe("Trigger / dispose", function(){
		it('trigger+dispose', function() {
			//dispatcher.off();
			dispatcher.on("all",listenerkill.callbackKill, listenerkill);
			prepareListeners();
			dispatcher.trigger("all:all");

			expect(listenerk1k2.called).to.equal(1);
			expect(listenerk1.called).to.equal(1);
			expect(listenerk2.called).to.equal(1);
			expect(listenerall.called).to.equal(1);
			expect(listenerk3k3.called).to.equal(1);
			expect(listenerk3.called).to.equal(1);

			//dispatcher is disposed
			dispatcher.trigger("all:all");
			expect(listenerk1k2.called).to.equal(1);
			expect(listenerk1.called).to.equal(1);
			expect(listenerk2.called).to.equal(1);
			expect(listenerall.called).to.equal(1);
			expect(listenerk3k3.called).to.equal(1);
			expect(listenerk3.called).to.equal(1);

			resetAllListeners();

		});

		it('trigger+off', function() {
			//dispatcher.off();
			dispatcher = new ghost.events.EventDispatcher();
			dispatcher.on("all",listenerkill.callbackOff, listenerkill);
			prepareListeners();
			dispatcher.trigger("all:all");

			expect(listenerk1k2.called).to.equal(1);
			expect(listenerk1.called).to.equal(1);
			expect(listenerk2.called).to.equal(1);
			expect(listenerall.called).to.equal(1);
			expect(listenerk3k3.called).to.equal(1);
			expect(listenerk3.called).to.equal(1);
			//dispatcher is disposed
			dispatcher.trigger("all:all");
			expect(listenerk1k2.called).to.equal(1);
			expect(listenerk1.called).to.equal(1);
			expect(listenerk2.called).to.equal(2);
			expect(listenerall.called).to.equal(2);
			expect(listenerk3k3.called).to.equal(2);
			expect(listenerk3.called).to.equal(2);

			resetAllListeners();

			prepareListeners();
		});
	});
