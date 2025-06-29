// attach to initial iFrame load
var el = document.getElementsByClassName("gameframe")[0];
var muteAllToggle = false;
var autoJoinObserver;
var refreshCycle;
var myNick;

// for kick/ban buttons
var dblDiv = document.createElement('div');
var dblTxt = document.createTextNode('Double click!');
dblDiv.appendChild(dblTxt);
dblDiv.style = 'visibility: hidden; position: fixed; background-color: #0004';

// wait until the game in iFrame loads, then continue
function waitForElement(selector) {
  return new Promise(function(resolve, reject) {
    var element = document.getElementsByClassName("gameframe")[0].contentWindow.document.querySelector(selector);

    if(element) {
      resolve(element);
      return;
    }

    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        var nodes = Array.from(mutation.addedNodes);
        for(var node of nodes) {
          if(node.matches && node.matches(selector)) {
            resolve(node);
            return;
          }
        };
      });
    });

    observer.observe(document.getElementsByClassName("gameframe")[0].contentWindow.document, { childList: true, subtree: true });
  });
}

// chat observer for mute
muted = new Set();
function mutePlayer(name) {
	if (muted.has(name)) {
		muted.delete(name);
	}
	else {
		muted.add(name);
	}
}

// linkify from stackoverflow 1500260
function linkify(text) {
    var urlRegex =/(\b(https?:\/\/|ftp:\/\/|file:\/\/|www\.)[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
		if (url.startsWith('www.')) { url = 'http://' + url; }
        return '<a href="' + url + '" target="blank">' + url + '</a>';
    });
}

// clicking for zoom
function simulateClick(item) {
  item.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true}));
  item.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
  item.dispatchEvent(new PointerEvent('pointerup', {bubbles: true}));
  item.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
  item.dispatchEvent(new MouseEvent('mouseout', {bubbles: true}));
  item.dispatchEvent(new MouseEvent('click', {bubbles: true}));
  item.dispatchEvent(new Event('change', {bubbles: true}));
  return true;
}

function changeView(viewIndex) {
	if (5 <= viewIndex <= 8) {
		var gameframe = document.getElementsByClassName('gameframe')[0];
		gameframe.contentWindow.document.querySelector('[data-hook="settings"]').click();
		var viewModeToggle = waitForElement('[data-hook="viewmode"]')
		viewModeToggle.then(function (toggle) {
			toggle.selectedIndex = viewIndex;
			simulateClick(toggle);
			closeBtn = waitForElement('[data-hook="close"]');
			closeBtn.then(function (btn) { btn.click() })
		})
	}
}

function record(gameview = true) {
	var gameframe = document.getElementsByClassName('gameframe')[0];
	if (gameview) {
		gameframe.contentWindow.document.querySelector('[data-hook="menu"]').click();
		var recBtn = waitForElement('[data-hook="rec-btn"]');
		recBtn.then(function (btn) { btn.click() });
		gameframe.contentWindow.document.querySelector('[data-hook="menu"]').click();
	}
	else {
		gameframe.contentWindow.document.querySelector('[data-hook="rec-btn"]').click();
	}
}

chatObserver = new MutationObserver( function(mutations) {
	var candidates = mutations.flatMap(x => Array.from(x.addedNodes)).filter(x => x.tagName == 'P');
	var gameframe = document.documentElement.getElementsByClassName("gameframe")[0];
	var bottomSec = gameframe.contentWindow.document.getElementsByClassName('bottom-section')[0];
	var statSec = gameframe.contentWindow.document.getElementsByClassName('stats-view')[0];
	var chatInput = gameframe.contentWindow.document.querySelector('[data-hook="input"]');
	var chatLog = gameframe.contentWindow.document.querySelector('[data-hook="log"]');
	
	// i did in fact lag
	statSec.ondblclick = function () {
		var gameframe = document.documentElement.getElementsByClassName("gameframe")[0];
		var c = gameframe.contentWindow.document.getElementsByClassName('graph')[0].firstChild;
		var ctx = c.getContext("2d");
		var imgData = ctx.getImageData(0, 63, 31, 1);
		var hexString = Array.prototype.map.call(new Uint8Array(imgData.data), x => ('00' + x.toString(16)).slice(-2)).join('');

		var chatInput = gameframe.contentWindow.document.querySelector('[data-hook="input"]');
		chatInput.value = statSec.innerText.replace(/\n/g, ' ') + ' Red bars: ' + (hexString.match(/c13535ff/g) ? hexString.match(/c13535ff/g).length : 0);
		gameframe.contentWindow.document.querySelector('[data-hook="send"]').click()
	}
	
	chatCheck = function(chatLine) {
		if ([...muted].filter(x => chatLine.innerText.startsWith(x + ': ')).length > 0) {
			chatLine.hidden = true;
		}
		else if (muteAllToggle && muteExceptions.filter(x => chatLine.innerText.startsWith(x + ': ')) == 0 && chatLine.className != 'notice') {
			chatLine.hidden = true;
		}
		
		if (chatLine.innerText.startsWith('Game start')) {
			toggleChatOpt();
			toggleChatKb();
		}
		
		chrome.storage.local.get({'haxTransChatConfig' : false},
			function (items) {
				if (items.haxTransChatConfig) { 
					if (chatLine.innerText.startsWith('Game start')) {	
						chatFormat(bottomSec,statSec,chatInput,'absolute');
					}
					else if (chatLine.innerText.startsWith('Game stop')) {	
						bottomSec.removeAttribute('style');
					}
				}
		});
		
		if (!chatLine.processed) {
			chatLine.innerHTML = linkify(chatLine.innerHTML);
		}
		
		// chrome.storage.local.get("haxChatTranslation", (items) => {
		// 	if (items.haxChatTranslation) {
		// 		// translation
		// 		if (!chatLine.processed) {
		// 			let chatRowDiv = document.createElement('div');
		// 			chatRowDiv.className = 'chat-row';
		// 			chatLine.parentNode.appendChild(chatRowDiv);
		// 			chatLine.processed = true;
		// 			chatRowDiv.appendChild(chatLine);
		// 			chatLine.style.display = 'inline-block';
		// 			chatLine.style.width = '75%';

		// 			let translateBtn = document.createElement('button');
		// 			translateBtn.innerText = 'Translate';
		// 			translateBtn.className = 'translate-btn';

		// 			// style translate btn
		// 			translateBtn.style.backgroundColor = "#244967";
		// 			translateBtn.style.color = "#fff";
		// 			translateBtn.style.padding = "2px 15px";
		// 			translateBtn.style.margin = "1px";
		// 			translateBtn.style.border = "0";
		// 			translateBtn.style.borderRadius = "5px";
		// 			translateBtn.style.fontFamily = `"Open Sans",sans-serif`;
		// 			translateBtn.style.fontWeight = `700`;
		// 			translateBtn.style.fontSize = `15px`;

		// 			chatLine.originalChatLine = chatLine.innerText;
		// 			chatLine.state = 'original';
		// 			translateBtn.addEventListener('click', function (e) {
		// 				if (chatLine.state == 'translated') {
		// 					chatLine.innerText = chatLine.originalChatLine;
		// 					chatLine.state = 'original';
		// 					translateBtn.innerText = 'Translate';
		// 				}
		// 				else if (chatLine.state == 'original') {
		// 					if (chatLine.translation) chatLine.innerText = chatLine.translation;
		// 					else {
		// 						let senderName;
		// 						let toBeTranslatedText;
		// 						if (chatLine.originalChatLine.indexOf(':') > -1) {
		// 							// player message
		// 							senderName = chatLine.innerText.split(":")[0];
		// 							toBeTranslatedText = chatLine.innerText.split(': ').slice(1).join('');
		// 						} else {
		// 							// bot message (no sender)
		// 							senderName = "";
		// 							toBeTranslatedText = chatLine.innerText;
		// 						}
		// 						translate(toBeTranslatedText).then(translationResult => {
		// 							if (translationResult) {
		// 								chatLine.innerText = senderName + ': ' + translationResult.translation + ' (translated from: ' + translationResult.lang + ')';
		// 								chatLine.translation = chatLine.innerText;
		// 							}
		// 						});
		// 					}
		// 					chatLine.state = 'translated';
		// 					translateBtn.innerText = 'Show Original';
		// 				}
		// 			});
		// 			chatRowDiv.appendChild(translateBtn);
		// 		}

		// 	}
		// });
		
		
		// right click to tag
		chatLine.oncontextmenu = function () {
			if (chatLine.innerText.includes(':')) {
				var chatAuthor = chatLine.innerText.split(':')[0].replace(' ', '_');
				if (chatInput.value !== null) {
					chatInput.value += ' @' + chatAuthor + ' ';
				}
				else {
					chatInput.value = '@' + chatAuthor + ' ';
				}
				chatInput.focus();
				return false;
			}
			else if (chatLine.className === 'notice' && chatLine.innerText.match(noticeRe)) {
				var chatAuthor = chatLine.innerText.match(noticeRe)[0].replace(' ', '_');
				if (chatInput.value !== null) {
					chatInput.value += ' @' + chatAuthor + ' ';
				}
				else {
					chatInput.value = '@' + chatAuthor + ' ';
				}
				chatInput.focus();
				return false;
			}
		}
	}
	candidates.forEach(x => chatCheck(x));
})

// text expansion stuffs
RegExp.escape = function(s) {
    return s.replace(/[-\/\\^$*+!?.()[\]{}]/g, '\\$&');
};

var chatShortcuts;
var chatTimer;
var expandRe;
const emojiRe = new RegExp("(" + RegExp.escape(Object.keys(emojiShortcuts).join("|")) + ")", "g");
const noticeRe = RegExp('.*(?= (has joined|was moved))', 'g');

// main observer to detect changes to views
moduleObserver = new MutationObserver(function(mutations) {
	candidates = mutations.flatMap(x => Array.from(x.addedNodes)).filter(x => x.className);
	if (candidates.length == 1) {
		var tempView = candidates[0].className;
		console.log(tempView);
		if(tempView == 'chat-row') return;
		switch(true) {
			case tempView == "choose-nickname-view":
				nickWait = waitForElement('[data-hook="input"]');
				nickWait.then(function(nicknameInput) { 
					myNick = nicknameInput.value;
					muteExceptions = ['humpyhost','Hostinho',myNick];
					})
				
				// addon settings
				addonSettingsPopup('choose-nickname-view');
				el.contentWindow.document.querySelector('h1').parentNode.appendChild(copyright());
				break;
				
			case tempView == "roomlist-view":
				// early exit
				chrome.storage.local.get({'haxSearchConfig' : true, 'haxAutoJoinConfig' : true},
				function (items) {
					if (items.haxSearchConfig) { createSearch(); }
					if (items.haxAutoJoinConfig) { createButton(); }
				});
				
				var gameframe = document.getElementsByClassName('gameframe')[0];
				var changeNickBtn = gameframe.contentWindow.document.querySelector('[data-hook="changenick"]');
				var addonSettingsBtn = document.createElement('button');
				var addonSettingsDiv = document.createElement('div');
				var addonSettingsIcon = document.createElement('i');
				
				addonSettingsIcon.className = 'icon-cog';
				addonSettingsBtn.appendChild(addonSettingsIcon);
				addonSettingsDiv.append('Add-on');
				addonSettingsBtn.appendChild(addonSettingsDiv);
				
				addonSettingsBtn.onclick = function () {
					changeNickBtn.click();
					var addonSettingsOpen = waitForElement('[data-hook="add-on"]');
					addonSettingsOpen.then(function (btn) { btn.click() });
				}
				
				changeNickBtn.parentNode.insertBefore(addonSettingsBtn,changeNickBtn);
				
				break;
				
			case tempView.includes("game-view"):
				muted = new Set();
				muteAllToggle = false;
				chatWait = waitForElement('[data-hook="log"]');
				chatWait.then(function (chatArea) {
					chatObserver.observe(chatArea, {childList: true, subtree: true});
				});
				
				var gameframe = document.documentElement.getElementsByClassName("gameframe")[0];
				var bottomSec = gameframe.contentWindow.document.getElementsByClassName('bottom-section')[0];
				var statSec = gameframe.contentWindow.document.getElementsByClassName('stats-view')[0];
				var chatInput = gameframe.contentWindow.document.querySelector('[data-hook="input"]');
				chatInput.placeholder = 'Press key below ESC to toggle chat hide';
				
				chatInput.addEventListener("keypress", chatListener);
				
				chrome.storage.local.get({'haxTransChatConfig' : false},
					function (items) {
						if (items.haxTransChatConfig) { 
							bottomSec.removeAttribute('style');
						}
				});
				
				inGame = waitForElement('.bar-container');
				inGame.then(function () {
					toggleChatOpt();
					toggleChatKb();
					showTranslateDisclaimer();
					chrome.storage.local.get({'haxTransChatConfig' : false},
					function (items) {
						if (items.haxTransChatConfig) { 
							chatFormat(bottomSec,statSec,chatInput,'absolute');
						}
					});
				});
				
				settingsWait = waitForElement('[data-hook="settings"]');
				settingsWait.then(function (settingButton) {
					// navBar = document.getElementsByClassName('header')[0];
					// navBar.style.transition = 'height 0.3s';
					// hideNavBar = document.createElement('button');

					// // HIDE HIDENAVBAR FEATURE FROM ALL-IN-ONE
					// // by defaulting to false no matter what
					// chrome.storage.local.get({'haxHideNavConfig' : false}, function (items) {
					// 	items.haxHideNavConfig = false;
						
					// 	if (items.haxHideNavConfig) {
					// 		hideNavBar.innerText = 'Show Navbar';
					// 		navBar.style.height = '0px';
					// 	}
					// 	else {
					// 		navBar.setAttribute('id','nothidden'); 
					// 		hideNavBar.innerText = 'Hide Navbar';
					// 		navBar.style.height = '35px';
					// 	}
					// });
					
					// hideNavBar.onclick = function () {
					// 	if (navBar.hasAttribute('id')) { 
					// 		navBar.removeAttribute('id','nothidden');
					// 		navBar.style.height = '0px';
					// 		hideNavBar.innerText = 'Show NavBar';
					// 		}
					// 	else { 
					// 		navBar.style.height = '35px';
					// 		navBar.setAttribute('id','nothidden'); 
					// 		hideNavBar.innerText = 'Hide NavBar';
					// 		}
					// }
					
					addonSettingsPopup('game-view');
					// settingButton.parentNode.appendChild(hideNavBar);
				})
				
				// chrome.storage.local.get({'haxMuteConfig' : true}, function (items) {
				// 	if (items.haxMuteConfig) {
				// 		muteAll = document.createElement('button');
				// 		muteAll.style.padding = '5px 10px';
				// 		muteAll.style.width = '80px';
				// 		muteAll.innerText = 'Mute';
				// 		muteAll.onclick = function () { 
				// 			if (muteAllToggle) {
				// 				muteAllToggle = false;
				// 				var chats = gameframe.contentWindow.document.querySelector('[data-hook="log"]').getElementsByTagName('p');
				// 				for (i = 0; i < chats.length; i++) { chats[i].removeAttribute('hidden'); }
				// 				muteAll.innerText = 'Mute';
				// 			}
				// 			else {
				// 				muteAllToggle = true;
				// 				muteAll.innerText = 'Unmute';
				// 			}
				// 		}
				// 	var dividerDiv = document.createElement('div');
				// 	dividerDiv.style = 'width: 5px';
				// 	chatInput.parentNode.appendChild(dividerDiv);
				// 	chatInput.parentNode.insertBefore(muteAll,chatInput);
				// 	}
				// });
				
				chrome.storage.local.get({'haxShortcutConfig' : false}, function (items) {
					if (items.haxShortcutConfig) {
						var emojiDoc = document.createElement('button');
						emojiDoc.style.padding = '5px 10px';
						emojiDoc.innerText = '😊';
						emojiDoc.onclick = function () { chrome.runtime.sendMessage({'type': 'emoji'}) };
						
						chatInput.parentNode.insertBefore(emojiDoc, chatInput.parentNode.lastChild.previousSibling);
					}
				});
				
			case tempView == "dialog":
				chrome.storage.local.get({'haxMuteConfig' : true}, function (items) {
					if (items.haxMuteConfig) {
						var popupWait = waitForElement('div.dialog');
						popupWait.then(function (popup) {
							var name = popup.firstChild.innerText;
							if (name === 'Add-on Settings') {
								return
							}
							var muteBtn = document.createElement('button');
							muteBtn.className = 'mb';
							popup.insertBefore(muteBtn, popup.lastChild);
							if (muted.has(name)) {
								muteBtn.innerText = 'Unmute';
							}
							else {
								muteBtn.innerText = 'Mute';
							}
							muteBtn.onclick = function () { 
								if (muted.has(name)) {
									muted.delete(name);
									muteBtn.innerText = 'Mute';
									}
								else {
									muted.add(name);
									muteBtn.innerText = 'Unmute';
									}
							}

							// tag stuff start here
							var tagBtn = document.createElement('button');
							tagBtn.className = 'tag';
							tagBtn.innerText = '@Mention'
							popup.insertBefore(tagBtn, popup.lastChild);
							tagBtn.onclick = function() {
								var gameframe = document.getElementsByClassName('gameframe')[0];
								var chatInput = gameframe.contentWindow.document.querySelector('[data-hook="input"]');
								var tagName = name.replace(' ', '_');
								if (chatInput.value !== null) {
									chatInput.value += ' @' + tagName + ' ';
									popup.lastChild.click();
									chatInput.focus();
								}
								else {
									chatInput.value = '@' + tagName + ' ';
									popup.lastChild.click();
									chatInput.focus();
								}
							}
						});}})
				break;
			case Boolean(tempView.match(/^(room-view|player-list-item|notice)/)):				
				// early exit
				var gameframe = document.documentElement.getElementsByClassName("gameframe")[0];
				
				if (tempView.startsWith('room-view')) {
					var bottomSec = gameframe.contentWindow.document.getElementsByClassName('bottom-section')[0];
					var statSec = gameframe.contentWindow.document.getElementsByClassName('stats-view')[0];
					var chatInput = gameframe.contentWindow.document.querySelector('[data-hook="input"]');
					bottomSec.removeAttribute('style');
					gameframe.contentWindow.document.onkeydown = function (f) {
						if (f.code == 'KeyR') {
							chrome.storage.local.get({'haxRecordHotkey' : false},
								function (items) { if (items.haxRecordHotkey) { record(false) }})
						}
					}
				}
				
				chrome.storage.local.get({'haxKickBanConfig' : false}, function (items) {
					if (items.haxKickBanConfig) {
						var players = gameframe.contentWindow.document.querySelectorAll('[class^=player-list-item]');
						var adminStatus = (gameframe.contentWindow.document.querySelector("[class$='view admin']") !== null);
						players.forEach(x => checkForButtons(x, adminStatus));
						gameframe.contentWindow.document.getElementsByTagName('body')[0].appendChild(dblDiv);
					}
				});
				
				// notification funstuff begins!	
				chrome.storage.local.get({'haxNotifConfig' : false}, function (items) {
					if (items.haxNotifConfig) {
						var notifOpt = {type: 'basic', title: 'Haxball All-in-one Tool', 
										message: 'You were moved into a team', iconUrl: 'icon.png'};
						if (tempView.match(/^(player-list-item)/)) {
							playersMoved = mutations.filter(x => x.addedNodes.length > 0 && x.target.parentNode.className.match(/[blue|red]$/));
							if (playersMoved.flatMap(x => Array.from(x.addedNodes)).map(x => x.childNodes[1].innerText).includes(myNick)) {
								chrome.runtime.sendMessage({type: 'team', opt: notifOpt});
								}
							}
						if (tempView == 'notice') {
							var noticeMsgs = mutations.flatMap(x => Array.from(x.addedNodes)).map(x => x.innerText);
							if (noticeMsgs.filter(x => x.startsWith(myNick + ' was moved')).length > 0) {
								chrome.runtime.sendMessage({type: 'team', opt: notifOpt});
							}
						}
				}});
				break;
			case tempView == 'highlight':
				chrome.storage.local.get({'haxNotifConfig' : false}, function (items) {
					if (items.haxNotifConfig) {
						var highlightMsg = candidates[0].innerText;
						var notifOpt = {type: 'basic', title: 'Haxball All-in-one Tool', 
										message: highlightMsg, iconUrl: 'icon.png'};
						chrome.runtime.sendMessage({type: 'highlight', opt: notifOpt});
				}});
				break;
			case tempView == 'game-state-view':
				var gameframe = document.documentElement.getElementsByClassName("gameframe")[0];
				var bottomSec = gameframe.contentWindow.document.getElementsByClassName('bottom-section')[0];
				var statSec = gameframe.contentWindow.document.getElementsByClassName('stats-view')[0];
				var chatInput = gameframe.contentWindow.document.querySelector('[data-hook="input"]');
				
				chrome.storage.local.get({'haxTransChatConfig' : false},
					function (items) {
						if (items.haxTransChatConfig) { 
							chatFormat(bottomSec,statSec,chatInput,'absolute');
						}
				});
				
				// toggle chat visibility
				toggleChatOpt();
				toggleChatKb();
				break;
			
			case tempView == 'dialog basic-dialog leave-room-view':
				chrome.storage.local.get({'haxQuickLeaveConfig' : false}, function (items) {
					if (items.haxQuickLeaveConfig) {
						var gameframe = document.documentElement.getElementsByClassName("gameframe")[0];
						gameframe.contentWindow.document.querySelector('[data-hook="leave"]').click()
					}
				});
				break;
			}	
		}
});

// where it all begins for view detection
init = waitForElement("div[class$='view']");
init.then(function(value) {
	currentView = value.parentNode;
	moduleObserver.observe(currentView, {childList: true, subtree: true});
});


const TRANSLATE_API = "https://private-api-mkab.onrender.com/haxball/translate";
function translate(text){
	try {
		var transalte_result = postData(TRANSLATE_API, {text: text});
		return transalte_result;
	}
	catch(error) {
		console.log(error);
		return null;
	}
}

async function postData(url = '', data = {}) {
	// Default options are marked with *
	const response = await fetch(url, {
	  method: 'POST',
	  cache: 'no-cache', 
	  cors: 'no-cors',
	  headers: {
		'Content-Type': 'application/json'
	  },
	  body: JSON.stringify(data) 
	});
	return response.json(); 
  }
