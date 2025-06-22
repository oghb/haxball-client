// admin kick/ban shortcuts by xenon
function createKickBanButtons(x, admin) {
	var displayCheck = (admin ? 'inline' : 'none');
	
	kickBtn = document.createElement('button');
	kickBtn.style = 'padding: 2px 3px';
	kickBtn.style.display = displayCheck;
	kickBtn.className = 'kb';
	kickBtn.onclick = function (event) { 
		dblDiv.style.top = (event.clientY + 20) + 'px';
		dblDiv.style.left = (event.clientX + 20) + 'px';
		dblDiv.style.visibility = 'visible'; 
		window.setTimeout(function () { dblDiv.style.visibility = 'hidden'; }, 500) }
	kickBtn.ondblclick = function() { kickPlayer(this.parentNode, false); };
	kickBtn.innerText = 'K';

	banBtn = document.createElement('button');
	banBtn.style = 'padding: 2px 3px';
	banBtn.style.display = displayCheck;
	banBtn.style.backgroundColor = '#c13535';
	banBtn.className = 'kb';
	banBtn.onclick = function (event) { 
		dblDiv.style.top = (event.clientY + 20) + 'px';
		dblDiv.style.left = (event.clientX + 20) + 'px';
		dblDiv.style.visibility = 'visible'; 
		window.setTimeout(function () { dblDiv.style.visibility = 'hidden'; }, 500) }
	banBtn.ondblclick = function() { kickPlayer(this.parentNode, true); };
	banBtn.innerText = 'B';
	x.appendChild(kickBtn);
	x.appendChild(banBtn);
}

// admin kick/ban shortcuts by xenon
function kickPlayer(x, ban) {
	var gameframe = document.getElementsByClassName('gameframe')[0];
	var ev3 = new MouseEvent("contextmenu", {
		bubbles: true,
		cancelable: false,
		view: window,
		button: 2,
		buttons: 0
	});
	
	x.dispatchEvent(ev3);
	gameframe.contentWindow.document.querySelector('[data-hook="kick"]').click();
	if(ban) {
		gameframe.contentWindow.document.querySelector('[data-hook="ban-btn"]').click();
	}
	gameframe.contentWindow.document.querySelector('[data-hook="kick"]').click();
}

// admin kick/ban shortcuts by xenon
function checkForButtons(x, admin) {
	var displayCheck = (admin ? 'inline' : 'none');
	if(x.childNodes.length == 3) {
		createKickBanButtons(x, admin);
	}
	if(x.childNodes.length == 5) {
		kickBanButtons = x.querySelectorAll('[class="kb"]');
		kickBanButtons.forEach(y => y.style.display = displayCheck);
	}
}