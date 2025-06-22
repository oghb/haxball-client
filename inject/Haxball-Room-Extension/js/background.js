chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(sender.tab.windowId);
	console.log(sender.tab.id);
	if(request.type === "highlight"){
		chrome.notifications.clear('highlight', function () {});
		chrome.notifications.create('highlight', request.opt, function(){})
	}
	if(request.type === "team"){
		chrome.notifications.clear('team', function () {});
		chrome.notifications.create('team', request.opt, function(){})
	}
	if(request.type === "popup"){
		chrome.runtime.openOptionsPage();
	}
	if(request.type === "emoji") {
		chrome.windows.create({url: chrome.runtime.getURL("emoji_lookup.html"),
							width: 250,
							height: 400,
							top: 0,
							left: 0,
							type: 'popup'});
	}
	chrome.notifications.onClicked.addListener(function (notifId) {
			chrome.windows.update(sender.tab.windowId, {"focused": true}, function(window){ });
			chrome.tabs.update(sender.tab.id, {"active": true}, function(tab){ });
		});
});