function chatExpand() {
	var gameframe = document.documentElement.getElementsByClassName("gameframe")[0];
	var chatInput = gameframe.contentWindow.document.querySelector('[data-hook="input"]');
	chrome.storage.local.get({'haxShortcut': '{"/h1":"/handicap 100","/e1":"/extrapolation 10"}'}, function (items) {
		chatShortcuts = JSON.parse(items.haxShortcut);
		expandRe = new RegExp("^(" + RegExp.escape(Object.keys(chatShortcuts).join("|")) + ")$", "g");
	});
	
	chrome.storage.local.get({'haxShortcutConfig': false}, function (items) {
		if (items.haxShortcutConfig) {
			chatInput.value = chatInput.value.replace(expandRe, function($0, $1) {
				return chatShortcuts[$1.replace('\\','').toLowerCase()]; } )
			chatInput.value = chatInput.value.replace(emojiRe, function($0, $1) {
				return emojiShortcuts[$1.replace('\\','').toLowerCase()]; } )
		}});
}

function chatListener() {
	clearTimeout(chatTimer);
	chatTimer = setTimeout(chatExpand, 100);
}