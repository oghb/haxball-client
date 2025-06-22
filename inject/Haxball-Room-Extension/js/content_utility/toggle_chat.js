// toggle chat button
function toggleChatOpt() {
	var gameframe = document.documentElement.getElementsByClassName("gameframe")[0];
	if (gameframe.contentWindow.document.getElementById('toggleChat')) {
		return;
	}
	
	var bottomSec = gameframe.contentWindow.document.getElementsByClassName('bottom-section')[0];
	var statSec = gameframe.contentWindow.document.getElementsByClassName('stats-view')[0];
	var chatInput = gameframe.contentWindow.document.querySelector('[data-hook="input"]');
	var toggleChatMsg = document.createElement('div');
	toggleChatMsg.id = 'toggleChat';
	toggleChatMsg.align = 'center';
	toggleChatMsg.style = 'position: absolute; top: 10px;';

	var toggleChatBtn = document.createElement('button');
	toggleChatBtn.style = 'position: relative; padding: 2px 2px; border: 0px; border-radius: 5px; color: white; font-family: "Open Sans", sans-serif; font-weight: 700; font-size: 15px; line-height: 100%; background-color: #244967;';
	toggleChatBtn.onmouseover = function () {this.style.backgroundColor = '#2f5e85'};
	toggleChatBtn.onmouseout = function () {this.style.backgroundColor = '#244967'};

	toggleChatBtn.innerText = 'Toggle Chat';
	toggleChatMsg.appendChild(toggleChatBtn);
	toggleChatMsg.onclick = function () { 
		if (bottomSec.style.display != 'none') { 
			bottomSec.style.display = 'none'; 
			}
		else { 
			bottomSec.removeAttribute('style');
			chrome.storage.local.get({'haxTransChatConfig' : false, 'haxAlpha' : 10},
			function (items) {
				if (items.haxTransChatConfig) { 
					bottomSec.style.position = 'absolute';
					bottomSec.style.left = '0px';
					bottomSec.style.right = '0px';
					bottomSec.style.bottom = '0px';
					bottomSec.style.background = '#1A2125' + items.haxAlpha;
					statSec.style.background = 'unset';
					chatInput.style.background = '#1A2125' + items.haxAlpha;
				}
			})
		}
	}

	var toggleChatMsgPos = waitForElement('.bar-container');
	toggleChatMsgPos.then(function (pos) {
		pos.insertBefore(toggleChatMsg, pos.firstChild);
	});
}

// toggle chat kb
function toggleChatKb() {
	var gameframe = document.documentElement.getElementsByClassName("gameframe")[0];
	var bottomSec = gameframe.contentWindow.document.getElementsByClassName('bottom-section')[0];
	var statSec = gameframe.contentWindow.document.getElementsByClassName('stats-view')[0];
	var chatInput = gameframe.contentWindow.document.querySelector('[data-hook="input"]');
	var chatLog = gameframe.contentWindow.document.querySelector('[data-hook="log"]');
	gameframe.contentWindow.document.onkeydown = function (f) {
		if (f.code == 'Backquote') {
			if (bottomSec.style.display == 'none') { 
				bottomSec.removeAttribute('style');
				chrome.storage.local.get({'haxTransChatConfig' : false, 'haxAlpha' : 10},
				function (items) {
					if (items.haxTransChatConfig) { 
						bottomSec.style.position = 'absolute';
						bottomSec.style.left = '0px';
						bottomSec.style.right = '0px';
						bottomSec.style.bottom = '0px';
						bottomSec.style.background = '#1A2125' + items.haxAlpha;
						statSec.style.background = 'unset';
						chatInput.style.background = '#1A2125' + items.haxAlpha;
					}
				})
				chatLog.scrollTo(0, chatLog.scrollHeight);
			}
			else { bottomSec.style.display = 'none'; }
		}
		if (f.code == 'Tab' || f.code == 'Enter') { 
			bottomSec.removeAttribute('style');
			chrome.storage.local.get({'haxTransChatConfig' : false, 'haxAlpha' : 10},
			function (items) {
				if (items.haxTransChatConfig) { 
				bottomSec.style.position = 'absolute';
				bottomSec.style.left = '0px';
				bottomSec.style.right = '0px';
				bottomSec.style.bottom = '0px';
				bottomSec.style.background = '#1A2125' + items.haxAlpha;
				statSec.style.background = 'unset';
				chatInput.style.background = '#1A2125' + items.haxAlpha;
				}
			})
			chatLog.scrollTo(0, chatLog.scrollHeight);
			chatInput.focus(); }
		chrome.storage.local.get({'haxViewModeConfig' : false},
			function (items) {
				if (items.haxViewModeConfig) {
					if (f.key >= 5 && f.key <= 8) { changeView(f.key); }
					}
			})
		if (f.code == 'KeyR') {
			chrome.storage.local.get({'haxRecordHotkey' : false},
				function (items) { if (items.haxRecordHotkey) { record(true) }})
		}
	}
}