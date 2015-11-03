///<lib="jquery"/>
module ghost.debug
{
	/**
	 * List of all scrolled elements
	 */
	export function getAllScroll()
	{
		return $("*").filter(function() { if ($(this).scrollTop() != 0) { return true; } return false }).map(function(index, item) { return { html: this, scroll: $(this).scrollTop() } });
	}
}