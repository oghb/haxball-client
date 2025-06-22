// search bar by Raamyy and xenon
function createSearch(){
	var gameframe = document.getElementsByClassName("gameframe")[0];
	var dialog = gameframe.contentDocument.getElementsByClassName("dialog")[0];
	var refreshButton = el.contentWindow.document.querySelector('button[data-hook="refresh"]');

	var joinButtonObserver = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (!refreshButton.disabled) {
					searchForRoom();
					updateAvailableCountries();
					}
			});
		});
	joinButtonObserver.observe(refreshButton, {attributes: true});

	var input = document.createElement('input'); 
	input.type = "search"; 
	input.id = "searchRoom";
	input.placeholder = "Term1 Term2+Term3/RoomMax - Search bar by Raamyy and xenon";
	input.autocomplete = "off";
	input.style.width = "75%";
	
	input.oninput = function(e) {
		if(e.keyCode === 27) { input.value = ''; }
		searchForRoom();
	};
	input.onkeyup = function(e) {
		if(e.keyCode === 27) { input.value = ''; }
		searchForRoom();
	};
	input.onchange = function(e) {
		if(e.keyCode === 27) { input.value = ''; }
		searchForRoom();
	};
	
	var searchExample = document.createElement('p');
	searchExample.innerText = 'Search example: Hax Ball+pro/14 finds rooms with Hax and Ball, OR pro (max players 14)';

	var button = document.createElement("BUTTON");
	button.innerHTML = "Select Country";
	button.id = "searchRoomByCountry"
	button.className = "dropbtn";
	button.className =  "dropdown";
	button.style.width = "25%";
	
	chrome.storage.local.get({'haxRoomSearchTerm': '', 'haxRoomCountrySearchTerm': 'All'}, function(result) {
		input.value = result.haxRoomSearchTerm;
		button.value = result.haxRoomCountrySearchTerm;
		refreshButton.click();
	});

	var style = document.createElement('link');
	style.rel = 'stylesheet';
	style.type = 'text/css';
	style.href = chrome.runtime.getURL("css/filter_button.css");
	gameframe.contentWindow.document.head.appendChild(style);

	var newDivWrapper = document.createElement('div');

	insertPos = dialog.querySelector('h1').nextElementSibling;
	insertPos.parentNode.insertBefore(newDivWrapper, insertPos.nextElementSibling);
	insertPos.parentNode.insertBefore(searchExample, insertPos.nextElementSibling);

	newDivWrapper.appendChild(input);
	newDivWrapper.appendChild(button);
}

// search bar by Raamyy and xenon
function searchForRoom() {
	var gameframe = document.getElementsByClassName("gameframe")[0];
	var dialog = gameframe.contentDocument.getElementsByClassName("dialog")[0];
	var input = gameframe.contentWindow.document.getElementById('searchRoom');

	if (gameframe.contentWindow.document.getElementById('searchRoomByCountry').value) {
		var requestedCountryCode = gameframe.contentWindow.document.getElementById('searchRoomByCountry').value
	}
	else {
		var requestedCountryCode = 'All';
	}
	
	var searchRoom = input.value.toLowerCase();
	chrome.storage.local.set({'haxRoomSearchTerm': input.value}, function (obj) { });

    var roomTable = dialog.querySelectorAll("[data-hook='list']")[0]
    var totalNumberOfPlayers = 0;
	var totalNumberOfRooms = 0;

    for(room of roomTable.rows) {
        var roomName = room.querySelectorAll("[data-hook='name']")[0].innerText;
        var roomNumPlayers = room.querySelectorAll("[data-hook='players']")[0].innerText.split('/')[0];
		var roomMaxPlayers = room.querySelectorAll("[data-hook='players']")[0].innerText.split('/')[1];
		var countryCode = room.querySelectorAll("[data-hook='flag']")[0].className.replace('flagico f-','');
		var countryCode = countryCode === '' ? 'eu' : countryCode;
        var roomName = roomName.toLowerCase();
		var rexp = /([^\/]+)?\/?(\d+)?/.exec(searchRoom)
		
		var playerTest = (typeof(rexp[2]) === 'undefined' || rexp[2] == roomMaxPlayers);
		var searchTerms = rexp[1] ? rexp[1].split('+').filter(x => x != '') : [];
		function myIncl(roomName, terms) {
			return terms.split(' ').every(x => roomName.includes(x));
		}

		if ((searchTerms.some(x => myIncl(roomName, x) || myIncl(roomName.replace(/\s/g,''), x)) || !searchTerms.length) && playerTest && (requestedCountryCode === countryCode || requestedCountryCode === 'All')) {
			room.hidden = false;
			totalNumberOfPlayers += parseInt(roomNumPlayers);
			totalNumberOfRooms++;
        }
    	else { 
			room.hidden = true; 
		}
    }
    var roomsStats = dialog.querySelectorAll("[data-hook='count']")[0];
    roomsStats.innerText = totalNumberOfPlayers + " players in "+totalNumberOfRooms+" filtered rooms";
    dialog.querySelector("[data-hook='listscroll']").scrollTo(0,0);
}


function updateAvailableCountries(){
	var gameframe = document.getElementsByClassName("gameframe")[0];
	var dialog = gameframe.contentDocument.getElementsByClassName("dialog")[0];
	var flags = dialog.querySelectorAll("[data-hook='flag']");
	var uniqueFlags = new Set();
	for (i = 0; i < flags.length; i++) {
		uniqueFlags.add(flags[i].getAttribute("class").replace('flagico f-',''));
	}
	countryCodes = Array.from(uniqueFlags).sort();
	var button = gameframe.contentWindow.document.getElementById("searchRoomByCountry");
	var dropDownDiv = document.createElement("div");
	dropDownDiv.id = "dropdown-content";

	var unorderedList = document.createElement("ul");

	var allCountriesList = document.createElement("li");
	var allCountriesAnchor = document.createElement("a");
	allCountriesAnchor.text = "All"
	allCountriesAnchor.onclick = selectedAnchorElement;
	allCountriesList.id = "searchListByCountry";
	allCountriesList.appendChild(allCountriesAnchor);
	unorderedList.appendChild(allCountriesList);

	for (var code of countryCodes) {
		if(code.length != 0){
			var list = document.createElement("li");
			var anchor = document.createElement("a");
			var icon = document.createElement("i");
			icon.className = "flagico f-" + code;
			list.id = "searchListByCountry";
			anchor.id = 'selectedCountry';
			anchor.text = code;
			anchor.onclick = selectedAnchorElement;
			anchor.dataset.target = code.charAt(0).toUpperCase() + code.slice(1);
			list.appendChild(icon);
			list.appendChild(anchor);
			unorderedList.appendChild(list);
		}
		
	}
	dropDownDiv.appendChild(unorderedList);
	button.appendChild(dropDownDiv);
}

function selectedAnchorElement() {
	var countryCode = this.text;
	// window.localStorage.setItem('haxRoomCountrySearchTerm', countryCode);
	chrome.storage.local.set({'haxRoomCountrySearchTerm': countryCode}, function (obj) { 
		var gameframe = document.getElementsByClassName("gameframe")[0];
		gameframe.contentWindow.document.getElementById("searchRoomByCountry").value = countryCode;
		searchForRoom();
	});
}


