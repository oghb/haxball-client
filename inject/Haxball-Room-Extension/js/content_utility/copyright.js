function copyright() {
	var copyright = document.createElement('p');
	var gitLink = document.createElement('a');
	gitLink.href = 'https://github.com/xenonsb/Haxball-Room-Extension/';
	gitLink.target = 'blank';
	gitLink.innerText = 'Haxball All-in-one Tool version ' + chrome.runtime.getManifest().version;
	copyright.append(gitLink);
	copyright.append(document.createElement('br'), 'Press the Add-on button for options', document.createElement('br'), 'By xenon, Raamyy, Pacific and Mirage');
	return copyright
}