from flask import Flask, request, render_template, url_for
from flask_socketio import SocketIO, emit

import copy
import re

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secretKey'
socketio = SocketIO(app)
users = {}
log_message = []

@app.route("/", methods=['GET'])
def hello():
	
	return render_template("index.html")

@socketio.on('connect')
def connect():
	users.update({request.sid:None})
	print ('connect: '+str(request.sid))
	emit('log_message', log_message)

@socketio.on('send_username')
def send_username(username):
	if username is None:
		username = 'Гость'
	username = cleanhtml(username)
	users[request.sid] = {'username': username}
	for user in copy.deepcopy(list(users)):
		emit('new_user', username, room=user)
	print (request.sid+' set username - '+str(username))

@socketio.on('send_new_username')
def send_new_username(username):
	if username is None:
		username = 'Гость'
	username = cleanhtml(username)
	users[request.sid] = {'username': username}

@socketio.on('disconnect')
def disconnect():
	print ('disconnect: '+str(request.sid))
	try:
		if request.sid in list(users):
			username = users[request.sid]['username']
			users.pop(request.sid, None)
			for user in copy.deepcopy(list(users)):
					emit('disconnect_user', username, room=user)
	except:
		pass

@socketio.on('send_message')
def handle_my_custom_event(msg):
	msg = cleanhtml(msg)
	if msg != "":
		print (users[request.sid]['username'] +': '+msg)
		if len(log_message) > 49:
			log_message.pop(0)
		log_message.append({'username':users[request.sid]['username'], 'text':msg})
		emit('new_message', {'username':users[request.sid]['username'], 'text':msg}, broadcast=True)

def cleanhtml(raw_html):
	cleanr = re.compile('<.*?>')
	cleantext = re.sub(cleanr, '', raw_html)
	return cleantext

if __name__ == '__main__':
	socketio.run(app, host="0.0.0.0", port=5002, use_reloader=True)