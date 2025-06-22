"use strict";

let save = document.getElementById("save");
let allConfigs = document.querySelectorAll('[id^=hax]');
let shortcutText = document.getElementById('haxShortcut');
let sliderInput = document.getElementById('haxAlpha');
let sliderOutput = document.getElementById('sliderAmt');
let version = document.getElementById('version');

version.innerText += "Haxball All-in-one Tool version " + chrome.runtime.getManifest().version;

const defaultSettings = {
	'haxSearchConfig': true,
	'haxAutoJoinConfig': true,
	'haxKickBanConfig': false,
	'haxMuteConfig': true,
	'haxNotifConfig': false,
	'haxTransChatConfig': false,
	'haxAlpha': 30,
	'haxViewModeConfig': false,
	'haxRecordHotkey': false,
	'haxShortcutConfig': false,
	'haxChatTranslation': false,
	'haxShortcut':`{
"/h1":"/handicap 100",
"/e1":"/extrapolation 10"
}`,
	'haxQuickLeaveConfig': false

}

const enableAllSettings = {
	'haxSearchConfig': true,
	'haxAutoJoinConfig': true,
	'haxKickBanConfig': true,
	'haxMuteConfig': true,
	'haxNotifConfig': true,
	'haxTransChatConfig': true,
	'haxViewModeConfig': true,
	'haxRecordHotkey': true,
	'haxShortcutConfig': true,
	'haxQuickLeaveConfig': true,
	'haxChatTranslation': true
}

const disableAllSettings = {
	'haxSearchConfig': false,
	'haxAutoJoinConfig': false,
	'haxKickBanConfig': false,
	'haxMuteConfig': false,
	'haxNotifConfig': false,
	'haxTransChatConfig': false,
	'haxViewModeConfig': false,
	'haxRecordHotkey': false,
	'haxShortcutConfig': false,
	'haxQuickLeaveConfig': false,
	'haxChatTranslation': false
}

chrome.storage.local.get(defaultSettings, function (items) {
	function retrieve(node, value) {
		if (node.tagName === 'INPUT') {
			if (node.type === 'checkbox') { 
				node.checked = value;
			}
			else if (node.type === 'range') {
				node.value = value;
				sliderOutput.value = value;
			}
			else {
				node.value = value;
			}
		}
		if (node.tagName === 'TEXTAREA') {
			node.value = value; 
		}
	}
	
	[...allConfigs].forEach(function(x) { 
		retrieve(x, items[x.id]);
		});
});

[...allConfigs].forEach(function(x) {
	if (x.tagName === 'INPUT') {
		if (x.type === 'checkbox') {
			x.onchange = function () { chrome.storage.local.set({[this.id]: this.checked}, function() { }) }
		}
		if (x.type === 'range') { 
			x.onchange = function () { chrome.storage.local.set({[this.id]: this.value}, function() { sliderOutput.value = sliderInput.value; }) }
		}
	}
});

enable.onclick = function() {
	[...document.querySelectorAll('input[type=checkbox]')].forEach(x => x.checked = true);
	chrome.storage.local.set(enableAllSettings, function () {});
}

disable.onclick = function() {
	[...document.querySelectorAll('input[type=checkbox]')].forEach(x => x.checked = false);
	chrome.storage.local.set(disableAllSettings, function () {});
}

restoreDef.onclick = function() {
	haxSearchConfig.checked = true;
	haxAutoJoinConfig.checked = true;
	haxKickBanConfig.checked = false;
	haxMuteConfig.checked = true,
	haxNotifConfig.checked = false,
	haxTransChatConfig.checked = false,
	haxAlpha.value = 30
	haxViewModeConfig.checked = false,
	haxRecordHotkey.checked = false,
	haxShortcutConfig.checked = false,
	haxChatTranslation.checked = false,
	haxShortcut.value = '{"/h1":"/handicap 100","/e1":"/extrapolation 10"}'
	chrome.storage.local.set(defaultSettings, function () {});
}

save.onclick = function() {
	try {
		var parsedShortcuts = JSON.parse(shortcutText.value);
	}
	catch(e) {
		alert('Invalid JSON format');
		return
	}
	var shortcutMsg = '';
	chrome.storage.local.set({'haxShortcut': shortcutText.value }, function() { });
	
	for (var sc in parsedShortcuts) {
		shortcutMsg += sc + ' translates to ' + parsedShortcuts[sc] + '\n';
	}
	alert("Shortcuts have been set to the following:\n" + shortcutMsg);
}
