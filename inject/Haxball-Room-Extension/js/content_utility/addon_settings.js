function addonSettingsPopup(currentView) {
	var addonSettings = document.createElement('div');
	addonSettings.className = 'dialog settings-view';
	addonSettings.style.display = 'none';
	addonSettings.style.maxHeight = '580px';

	var addonSettingsHeader = document.createElement('h1');
	addonSettingsHeader.innerText = 'Add-on Settings';
	addonSettings.appendChild(addonSettingsHeader);

	var addonSettingsClose = document.createElement('button')
	addonSettingsClose.innerText = 'Close';
	addonSettings.appendChild(addonSettingsClose);
	
	var addonSettingsOpen = document.createElement('button');
	addonSettingsOpen.innerText = 'Add-on';
	addonSettingsOpen.setAttribute('data-hook','add-on');
	
	// thing for transparency selection
	// var sliderDiv = document.createElement('div');
	// sliderDiv.align = 'center';
	
	// var sliderOutput = document.createElement('output');
	// sliderOutput.id = 'sliderAmt';
	
	// var sliderInput = document.createElement('input');
	// sliderInput.type = 'range';
	// sliderInput.id = 'myTrans';
	// sliderInput.min = 10;
	// sliderInput.max = 90;
	// sliderInput.step = 10;
	
	// chrome.storage.local.get({'haxAlpha' : 10},
	// 	function (items) { sliderInput.value = items.haxAlpha; });
	
	// sliderOutput.value = sliderInput.value + '%';
	// sliderInput.oninput = function () { 
	// 	sliderOutput.value = sliderInput.value + "%";
	// 	chrome.storage.local.set({'haxAlpha': sliderInput.value}, function (obj) { })
	// 	try {
	// 		var gameframe = document.getElementsByClassName('gameframe')[0];
	// 		var bottomSec = gameframe.contentWindow.document.getElementsByClassName('bottom-section')[0];
	// 		var statSec = gameframe.contentWindow.document.getElementsByClassName('stats-view')[0];
	// 		var chatInput = gameframe.contentWindow.document.querySelector('[data-hook="input"]');
	// 	chrome.storage.local.get({'haxTransChatConfig' : false},
	// 		function (items) {
	// 			if (items.haxTransChatConfig) { 
	// 				chatFormat(bottomSec,statSec,chatInput,'absolute');
	// 			}
	// 		});
	// 	}
	// 	catch(e) { }
	// 	};
	
	// sliderDiv.append(sliderInput);
	// sliderDiv.append(sliderOutput);
	
	// var shortcutDiv = document.createElement('div');
	// shortcutDiv.align = 'center';
	
	// var shortcutPopup = document.createElement('a');
	// shortcutPopup.onclick = function () { chrome.runtime.sendMessage({type: 'popup'}); };
	// shortcutPopup.innerText = 'Configure shortcuts';
	// shortcutDiv.append(shortcutPopup);
	
	var addonSection = document.createElement('div');
	addonSettings.appendChild(addonSection);
	addonSettings.appendChild(copyright());
	addonSection.className = 'section selected';
	addonSection.appendChild(configElem('haxSearchConfig',true,'Search bar (Raamyy)'));
	addonSection.appendChild(configElem('haxAutoJoinConfig',true,'Room AutoJoin'));
	addonSection.appendChild(configElem('haxKickBanConfig',false,'Room Kick/Ban shortcuts (double click)'));
	// addonSection.appendChild(configElem('haxHideNavConfig',false,'Hide NavBar by default'));
	addonSection.appendChild(configElem('haxMuteConfig',true,'Local mute'));
	addonSection.appendChild(configElem('haxNotifConfig',false,'Game notifications'));
	// addonSection.appendChild(configElem('haxTransChatConfig',false,'Transparent chat (Pacific)'));
	// addonSection.appendChild(configElem('haxChatTranslation',false,'Chat translation (Raamyy)'));
	// addonSection.appendChild(sliderDiv);
	addonSection.appendChild(configElem('haxViewModeConfig',false,'View-mode hotkeys'));
	addonSection.appendChild(configElem('haxRecordHotkey',false,'Record hotkey R'));
	// addonSection.appendChild(configElem('haxShortcutConfig',false,'Chat text expansion and 😃 shortcuts'));
	// addonSection.appendChild(shortcutDiv);
	addonSection.appendChild(configElem('haxQuickLeaveConfig',false,'One click to leave room'));
	
	
	if (currentView == 'choose-nickname-view') {
		var nicknameView = el.contentWindow.document.getElementsByClassName('choose-nickname-view')[0];
		
		addonSettingsClose.onclick = function () {
			addonSettings.style.display = 'none';
			nicknameView.childNodes[1].style.display = 'flex';
		};
		
		addonSettingsOpen.onclick = function () { 
			addonSettings.style.display = 'flex';
			nicknameView.childNodes[1].style.display = 'none';
		}
		
		nicknameView.appendChild(addonSettings);

		var okButton = el.contentWindow.document.querySelector('[data-hook="ok"]');
		var buttonDiv = document.createElement('div');
		buttonDiv.align = 'center';
		
		var dividerDiv = document.createElement('div');
		dividerDiv.style = 'width:5px; display:inline-block';
		
		okButton.parentNode.insertBefore(buttonDiv, okButton);
		buttonDiv.appendChild(okButton);
		buttonDiv.appendChild(dividerDiv);
		buttonDiv.appendChild(addonSettingsOpen);
	}
	
	else { 
		var gameframe = document.getElementsByClassName('gameframe')[0];
		var settingButton = gameframe.contentWindow.document.querySelector('[data-hook="settings"]');
		var topSec = gameframe.contentWindow.document.getElementsByClassName('top-section')[0];
		addonSettings.style.position = 'absolute';
		addonSettings.style.left = 0;
		addonSettings.style.right = 0;
		addonSettings.style.top = '15%';
		addonSettings.style.marginLeft = 'auto';
		addonSettings.style.marginRight = 'auto';
		topSec.parentNode.appendChild(addonSettings);
		
		// addonSettingsClose.append(' - press ESC twice to apply');
		
		addonSettingsClose.onclick = function () {
			addonSettings.style.display = 'none';
		}
		
		addonSettingsOpen.onclick = function () { 
			addonSettings.style.display = 'flex';
		}
		
		settingButton.parentNode.appendChild(addonSettingsOpen);
	}
}

// pretty settings
function configElem(id, def = false, desc) {
	var newConfig = document.createElement('div');
	newConfig.className = 'toggle';
	newConfig.id = id;
	var obj = {[id] : def};
	
	var icon = document.createElement('i');
	chrome.storage.local.get(obj, function(items) {
		icon.className = (items[id] ? 'icon-ok' : 'icon-cancel');
	});
	
	newConfig.onclick = function() {
		var setStatus = !(icon.className == 'icon-ok');
		var obj = {[id] : setStatus};
		chrome.storage.local.set(obj, function (result) {} );
		icon.className = setStatus ? 'icon-ok' : 'icon-cancel';
		// if (id === 'haxTransChatConfig') {
		// 	var gameframe = document.getElementsByClassName('gameframe')[0];
		// 	var bottomSec = gameframe.contentWindow.document.getElementsByClassName('bottom-section')[0];
		// 	var statSec = gameframe.contentWindow.document.getElementsByClassName('stats-view')[0];
		// 	var chatInput = gameframe.contentWindow.document.querySelector('[data-hook="input"]');
		// 	try {
		// 		if (setStatus) { 
		// 			chatFormat(bottomSec,statSec,chatInput,'absolute');
		// 		}
		// 		else {
		// 			bottomSec.removeAttribute('style');
		// 		}
		// 	}
		// 	catch(e) { }
		// }
		// if (id === 'haxShortcutConfig') {
		// 	var gameframe = document.getElementsByClassName('gameframe')[0];
		// 	var chatInput = gameframe.contentWindow.document.querySelector('[data-hook="input"]');
		// 	try {
		// 		if (setStatus) {
		// 			chatInput.addEventListener("keypress", chatListener);
		// 		}
		// 		else {
		// 			chatInput.removeEventListener("keypress", chatListener);
		// 		}
		// 	}
		// 	catch(e) { }
		// }
		if (id === 'haxKickBanConfig') {
			var gameframe = document.getElementsByClassName('gameframe')[0];
			try {
				var players = gameframe.contentWindow.document.querySelectorAll('[class^=player-list-item]');
				var adminStatus = (gameframe.contentWindow.document.querySelector("[class$='view admin']") !== null);
				if (setStatus) {
					players.forEach(x => checkForButtons(x, adminStatus));
				}
				else {
					players.forEach(x => checkForButtons(x, false));
				}
			}
			catch(e) { }
		}
	}
	
	newConfig.appendChild(icon);
	newConfig.append(desc);
	return newConfig
}