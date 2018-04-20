expression = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
regex = new RegExp(expression);
audio = new Audio('/static/new_message.mp3');

socket = io.connect(location.protocol + "//" + document.domain + ':' + location.port);
console.log(location.protocol + "//" + document.domain + ':' + location.port)

socket.on('connect', function() {
	socket.emit('send_username', localStorage.user);
	console.log('connect');
});

socket.on('log_message', function(logm) {
	logm.forEach(add_message);
});

socket.on('new_message', function (mes) {
	add_message(mes);
	if (mes.username != localStorage.user){
		audio.play();
	}
});

socket.on('new_user', function (data) {
	$("#mes_text div:last").after('<div class="text-muted bg-warning marginLeft5">'+data+' подключился</div>')
	scrollDown()
});

socket.on('disconnect_user', function (data) {
	$("#mes_text div:last").after('<div class="text-muted bg-warning marginLeft5">'+data+' отключился</div>')
	scrollDown()
});

socket.on('disconnect', function() {
	console.log('disconnect')
});

$(".message_i").keyup(function(event){
	if(event.keyCode == 13){
		send_message();
	}
});

function add_message(mes) {
	var text = mes.text;
	ree = text.match(regex);
	if (ree != null){
		ree.forEach(function (a) {
			if (a.startsWith('http') || a.startsWith('https')){
				text=text.replace(a, '<a target="_blank" href="'+a+'">'+a+'</a>');
			}
			else{
				text=text.replace(a, '<a target="_blank" href="//'+a+'">'+a+'</a>');
			}
		});
	};
	$("#mes_text div:last").after('<div><p class="text-success mes marginLeft5">'+mes.username+'</p><p class="mes">: '+text+'</p></div>');
	scrollDown();
	emojify.run(document.getElementById('mes_text'));
}

function send_message() {
	$("#message").each(function (a) {
		if ($("#message")[a].value != ""){
			var text = $("#message")[a].value;
			$("#message")[a].value = "";
			socket.emit('send_message', text);
		}
	});
}

function scrollDown() {
	$('#mes_text')[0].scrollTop = $('#mes_text')[0].scrollHeight;
}
