

describe("Objects", function(){

	it('mergeObjects Empty', function() {
		expect(
			ghost.utils.Objects.merge(
			{

			},
			{

			})
		)
		.to.deep.equal({});
	});

	it('merge Simple', function() {
		expect(
			ghost.utils.Objects.merge(
			{
				a:"a",
				c:"c"
			},
			{	
				a:"a2",
				b:"b"
			})
		)
		.to.deep.equal({a:"a2",b:"b",c:"c"});
	});

	it('mergeObjects date 1', function() {
		var date = new Date();
		expect(
			ghost.utils.Objects.merge({
				a:"a",
				c:"c"
			},
			{	
				a:date,
				b:"b"
			})
		)
		.to.deep.equal({a:date, b:"b",c:"c"});
	});


	it('mergeObjects object', function() {
		var date = new Date();
		expect(
			ghost.utils.Objects.merge({
				a:"a",
				c:"c"
			},
			{	
				a:{d:"d"},
				b:"b"
			})
		)
		.to.deep.equal({a:{d:"d"}, b:"b",c:"c"});
	});

	it('mergeObjects date object', function() {
		var date = new Date();
		expect(
			ghost.utils.Objects.merge({
				a:date,
				c:"c"
			},
			{	
				a:{d:"d"},
				b:"b"
			})
		)
		.to.deep.equal({a:{d:"d"}, b:"b",c:"c"});
	});


	it('mergeObjects object date', function() {
		var date = new Date();
		expect(
			ghost.utils.Objects.merge({
				a:{d:"d"},
				c:"c"
			},
			{	
				a:date,
				b:"b"
			})
		)
		.to.deep.equal({a:date, b:"b",c:"c"});
	});


	it('deepEquals Empty', function() {

		expect(ghost.utils.Objects.deepEquals({}, {}))
		.to.be.true;
	});

	it('deepEquals Simple', function() {

		expect(ghost.utils.Objects.deepEquals(ghost.utils.Objects.merge(
			{
				a:"a",
				c:"c"
			},
			{	
				a:"a2",
				b:"b"
			}), {a:"a2",b:"b",c:"c"}))
		.to.be.true;
	});

	it('deepEquals date 1', function() {
		var date = new Date();
		expect(ghost.utils.Objects.deepEquals(ghost.utils.Objects.merge({
				a:"a",
				c:"c"
			},
			{	
				a:date,
				b:"b"
			}), {a:date, b:"b",c:"c"}))
		.to.be.true;
	});


	it('deepEquals object', function() {
		var date = new Date();
		expect(ghost.utils.Objects.deepEquals(ghost.utils.Objects.merge({
				a:"a",
				c:"c"
			},
			{	
				a:{d:"d"},
				b:"b"
			}), {a:{d:"d"}, b:"b",c:"c"}))
		.to.be.true;

	
	});

	it('deepEquals date object', function() {
		var date = new Date();
		expect(ghost.utils.Objects.deepEquals(ghost.utils.Objects.merge({
				a:date,
				c:"c"
			},
			{	
				a:{d:"d"},
				b:"b"
			}), {a:{d:"d"}, b:"b",c:"c"}))
		.to.be.true;
	
	});


	it('deepEquals object date', function() {
		var date = new Date();

			expect(ghost.utils.Objects.deepEquals(ghost.utils.Objects.merge({
				a:{d:"d"},
				c:"c"
			},
			{	
				a:date,
				b:"b"
			}), {a:date, b:"b",c:"c"}))
		.to.be.true;
	});

	it('NotdeepEquals object date', function() {
		var date = new Date();

			expect(ghost.utils.Objects.deepEquals(ghost.utils.Objects.merge({
				a:{d:"d"},
				c:"c"
			},
			{	
				a:date,
				b:"b"
			}), {a:date, b:"b",c:"c",d:"1"}))
		.to.be.false;
	});

	it('NotdeepEquals2 object date', function() {
		var date = new Date();

			expect(ghost.utils.Objects.deepEquals(ghost.utils.Objects.merge({
				a:{d:"d"},
				c:"c",
				d:"1"
			},
			{	
				a:date,
				b:"b"
			}), {a:date, b:"b",c:"c"}))
		.to.be.false;
	});
	it('NotdeepEquals2 object date', function() {
		var date = new Date();

			expect(ghost.utils.Objects.deepEquals(ghost.utils.Objects.merge({
				a:{d:"d"},
				c:"c",
				d:"1"
			},
			{	
				a:date,
				b:"b"
			}), {a:date, b:"b",c:"c", d:"2"}))
		.to.be.false;
	});

	it('NotdeepEquals3 object date', function() {
		var date = new Date();
		date.setHours(date.getHours()+1);
		var date2 = new Date();

			expect(ghost.utils.Objects.deepEquals(ghost.utils.Objects.merge({
				a:{d:"d"},
				c:"c",
				d:"1"
			},
			{	
				a:date,
				b:"b"
			}), {a:date2, b:"b",c:"c", d:"1"}))

		.to.be.false;
	});

});
