function showTranslateDisclaimer() {
	let gameframe = document.documentElement.getElementsByClassName("gameframe")[0];

	// already exists
	if (gameframe.contentWindow.document.getElementById('translateDisclaimer')) {
		return;
	}

	chrome.storage.local.get("acceptTranslate", (items) => {

		// player already accepted disclaimer
		if (items.acceptTranslate) return;

		let chatBoxDiv = gameframe.contentWindow.document.getElementsByClassName('chatbox-view-contents');
		if (!chatBoxDiv || chatBoxDiv.length == 0) return;
		chatBoxDiv = chatBoxDiv[0];


		let msgDiv = document.createElement('div');
		msgDiv.id = 'translateDisclaimer';
		msgDiv.style = 'text-align: center';

		let closeBtn = document.createElement('b');
		closeBtn.innerHTML = "×";
		closeBtn.style.cursor = 'pointer'
		closeBtn.style.marginRight = '5px'
		closeBtn.onclick = () => {
			gameframe.contentWindow.document.getElementById('translateDisclaimer')?.remove();
			// mark as accepted
			chrome.storage.local.set({ acceptTranslate: true }, () => { });
		}
		msgDiv.appendChild(closeBtn);

		let disclaimer = document.createTextNode("You can translate up to 10 messages per hour.");
		msgDiv.appendChild(disclaimer);

		chatBoxDiv.appendChild(msgDiv);
	});
}