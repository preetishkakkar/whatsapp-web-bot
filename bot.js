(() => {
	//
	// GLOBAL VARS AND CONFIGS
	//
	//const whitelist = ['Fotos salvass', 'Teste ignore']
	var lastMessageOnChat = false;
	var ignoreLastMsg = {};

	const jokeList = [
		`
		Husband and Wife had a Fight.
		Wife called Mom : He fought with me again,
		I am coming to you.
		Mom : No beta, he must pay for his mistake,
		I am comming to stay with U!`,

		`
		Husband: Darling, years ago u had a figure like Coke bottle.
		Wife: Yes darling I still do, only difference is earlier it was 300ml now it's 1.5 ltr.`,

		`
		God created the earth, 
		God created the woods, 
		God created you too, 
		But then, even God makes mistakes sometimes!`,

		`
		What is a difference between a Kiss, a Car and a Monkey? 
		A kiss is so dear, a car is too dear and a monkey is U dear.`
	]


	//
	// FUNCTIONS
	//

	// Get random value between a range
	function rand(high, low = 0) {
		return Math.floor(Math.random() * (high - low + 1) + low);
	}
    
	function getSelectedTitle(){
		var chats = document.querySelectorAll('.CxUIE');
		var selectedTitle;
		for (var i = 0; i < chats.length; i++){
			if (chats[i]){
				if (chats[i].querySelector('.active')){
					selectedTitle = chats[i].querySelector('._1wjpf').title;
				}
			}
		}
		return selectedTitle;
	}
	
	function getLastMsg(){
		var messages = document.querySelectorAll('.msg');
		var pos = messages.length-1;
		
		while (messages[pos] && (messages[pos].classList.contains('msg-system') || messages[pos].querySelector('.message-out'))){
			pos--;
			if (pos <= -1){
				return false;
			}
		}
		if (messages[pos] && messages[pos].querySelector('.selectable-text')){
			return messages[pos].querySelector('.selectable-text').innerText;
		} else {
			return false;
		}
	}
	
	function didYouSendLastMsg(){
		var messages = document.querySelectorAll('.msg');
		if (messages.length <= 0){
			return false;
		}
		var pos = messages.length-1;
		
		while (messages[pos] && messages[pos].classList.contains('msg-system')){
			pos--;
			if (pos <= -1){
				return -1;
			}
		}
		if (messages[pos].querySelector('.message-out')){
			return true;
		}
		return false;
	}

	// Call the main function again
	const goAgain = (fn, sec) => {
		// const chat = document.querySelector('div.chat:not(.unread)')
		// selectChat(chat)
		setTimeout(fn, sec * 1000)
	}

	// Dispath an event (of click, por instance)
	const eventFire = (el, etype) => {
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent(etype, true, true, window,0, 0, 0, 0, 0, false, false, false, false, 0, null);
		el.dispatchEvent(evt);
	}

	// Select a chat to show the main box
	const selectChat = (chat, cb) => {
		//const title = chat.querySelector('._1wjpf').title;
		eventFire(chat, 'mousedown');

		if (!cb) return;

		const loopFewTimes = () => {
			setTimeout(() => {
				//const titleMain = getSelectedTitle();

				/*if (titleMain != title){
					console.log('not yet');
					return loopFewTimes();
				}*/

				return cb();
			}, 300);
		}

		loopFewTimes();
	}

	// Send a message
	const sendMessage = (chat, message, cb) => {
		//avoid duplicate sending
		var title;

		if (chat){
			title = chat.querySelector('._1wjpf').title;
		} else {
			title = getSelectedTitle();
		}
		ignoreLastMsg[title] = message;

		//add text into input field
		document.querySelector('.pluggable-input-body').innerHTML = message.replace(/  /gm,'');

		//Force refresh
		event = document.createEvent("UIEvents");
		event.initUIEvent("input", true, true, window, 1);
		document.querySelector('.pluggable-input-body').dispatchEvent(event);

		//Click at Send Button
		eventFire(document.querySelector('#main span[data-icon="send"]'), 'click');

		cb();
	}

	//
	// MAIN LOGIC
	//
	const start = (_chats, cnt = 0) => {
		// get next unread chat
		const chats = _chats || document.querySelectorAll('._15G96');
		const chat = chats[cnt];

		var processLastMsgOnChat = false;
		var lastMsg;
		
		if (!lastMessageOnChat){
			if (false === (lastMessageOnChat = getLastMsg())){
				lastMessageOnChat = true; //to prevent the first "if" to go true everytime
			} else {
				lastMsg = lastMessageOnChat;
			}
		} else if (lastMessageOnChat != getLastMsg() && getLastMsg() !== false && !didYouSendLastMsg()){
			lastMessageOnChat = lastMsg = getLastMsg();
			processLastMsgOnChat = true;
		}
		
		if (!processLastMsgOnChat && (chats.length == 0 || !chat)) {
			console.log(new Date(), 'nothing to do now... (1)', chats.length, chat);
			return goAgain(start, 3);
		}

		// get infos
		var title;
		if (!processLastMsgOnChat){
			title = chat.parentElement.parentElement.parentElement.parentElement.querySelector('._1wjpf').title + '';
			lastMsg = (chat.parentElement.parentElement.parentElement.parentElement.querySelectorAll('._1wjpf._3NFp9')[0] || { innerText: '' }).innerText; //.last-msg returns null when some user is typing a message to me
		} else {
			title = getSelectedTitle();
		}
		// avoid sending duplicate messaegs
		if (ignoreLastMsg[title] && (ignoreLastMsg[title]) == lastMsg) {
			console.log(new Date(), 'nothing to do now... (2)', title, lastMsg);
			return goAgain(() => { start(chats, cnt + 1) }, 0.1);
		}

		// what to answer back?
		let sendText

		if (lastMsg.toUpperCase().indexOf('@HELP') > -1){
			sendText = `
				Cool ${title}! Some commands that you can send me:

				1. *@TIME*
				2. *@JOKE*`
		}

		if (lastMsg.toUpperCase().indexOf('@TIME') > -1){
			sendText = `
				Don't you have a clock, dude?

				*${new Date()}*`
		}

		if (lastMsg.toUpperCase().indexOf('@JOKE') > -1){
			sendText = jokeList[rand(jokeList.length - 1)];
		}
		
		// that's sad, there's not to send back...
		if (!sendText) {
			ignoreLastMsg[title] = lastMsg;
			console.log(new Date(), 'new message ignored -> ', title, lastMsg);
			return goAgain(() => { start(chats, cnt + 1) }, 0.1);
		}

		console.log(new Date(), 'new message to process, uhull -> ', title, lastMsg);

		// select chat and send message
		if (!processLastMsgOnChat){
			selectChat(chat.parentElement.parentElement.parentElement.parentElement, () => {
				sendMessage(chat.parentElement.parentElement.parentElement.parentElement, sendText.trim(), () => {
					goAgain(() => { start(chats, cnt + 1) }, 0.1);
				});
			})
		} else {
			sendMessage(null, sendText.trim(), () => {
				goAgain(() => { start(chats, cnt + 1) }, 0.1);
			});
		}
	}
	start();
})()