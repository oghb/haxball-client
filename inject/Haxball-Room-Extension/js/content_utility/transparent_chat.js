// transparent chat by P a c i f i c and xenon
function chatFormat(btm, stats, ipt, posn) {
	chrome.storage.local.get({'haxAlpha' : 10},
	function (items) {
		btm.style.position = posn;
		btm.style.left = '0px';
		btm.style.right = '0px';
		btm.style.bottom = '0px';
		btm.style.background = '#1A2125' + items.haxAlpha;
		stats.style.background = 'unset';
		ipt.style.background = '#1A2125' + items.haxAlpha;
	});
}