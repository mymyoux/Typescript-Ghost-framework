

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


});
