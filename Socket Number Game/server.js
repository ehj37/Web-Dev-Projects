/*********************************SERVER SETUP*********************************/
const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

server.listen(4000 || process.env.PORT, () => {
  console.log('Server listening.');
});

app.use(express.static('public'));
/****************************DONE WITH SERVER SETUP****************************/

// The counter for the game; starts at 0
let counter = 0;

// The ID of the last user to successfully increment the counter.
let lastSubmitter = null;

// Colors that chat messages can appear as
let colors = ['orange', 'yellow', 'green', 'blue', 'violet'];

// The array of registered users in the game
let userArray = [];


/* [removeUser userId] is the user object corresponding to [userId] after it
has been removed from the list of active users.
Requires: [userId] corresponds to an active user. */
function removeUser(userId) {
  for (let i = 0; i < userArray.length; i++) {
    if (userArray[i]['userId'] === userId) {
      return userArray.splice(i, 1);
    }
  }
}

/* [addUser userId name] returns the new user that is appended to the list of 
active users with [userId], [name] (with leading and trailing whitespace 
removed), and a randomly selected color (from the list of valid colors). */
function addUser(userId, name) {
  const randomIndex = Math.floor(colors.length * Math.random());
  let randomColor = colors[randomIndex];
  userArray.push({ 'userId': userId, 'name': name.trim(), 'color': randomColor });
  return userArray[userArray.length - 1];
}

/* [isUser userId] is true if there exists an active user with ID [userId] and 
is false otherwise. */
function isUser(userId) {
  for (let i = 0; i < userArray.length; i++) {
    if (userArray[i]['userId'] === userId) {
      return true;
    }
  }
  return false;
}

/* [nameAnalysis name] returns an object with two properties: valid and reason. 
The former designates whether or not the name is valid (i.e. nobody else has 
the same non-case-sensitive, trimmed name, and [name] has a nonzero length) and 
the latter designates the reason for [name] being valid or invalid. */
function nameAnalysis(name) {
  const nameEdited = name.toLowerCase().trim();
  if (nameEdited.length === 0) {
    return { valid: false, reason: 'No valid characters entered.' };
  }
  for (let i = 0; i < userArray.length; i++) {
    if (userArray[i]['name'].toLowerCase() === nameEdited) {
      return { valid: false, reason: "Name already taken." };
    }
  }
  return { valid: true, reason: "Valid name, not currently in use." };
}

/* [getUserFromId userId] returns the active user object that has user ID 
[userId]. Returns null if no such user exists. */
function getuserFromId(userId) {
  for (let i = 0; i < userArray.length; i++) {
    if (userArray[i]['userId'] === userId) {
      return userArray[i];
    }
  }
  return null;
}

/* [postRegistration socket] allows the user corresponding to [socket] to 
execute new events.

On the disconnect of [socket] (the 'disconnect' event), the user will be removed 
from the array of users and a message announcing this disconnect will be emitted 
to all other sockets.

On [socket] submitting a number (the 'numberSubmit' event), there are three 
possibilities. If the user was the last to submit a number, the counter will 
remain at its current value and a 'consecutiveSubmission' event will be emit by 
[socket]. If the user doesn't submit a number, then a 'nonNumberSubmission' 
event will be emit by [socket]. If the user submits a number then a 
'numberSubmit' event will be emit by all sockets with data containing the 
updated counter, number that [socket] submit originally, whether or not the 
counter was succcessfully incremented, the name of the user corresponding to 
[socket], and that user's chat color. When a number is submitted, the counter 
will be incremented if the submitted number is 1 larger than the counter. 
Otherwise, the counter is set to 0. */
function postRegistration(socket) {
  const user = getuserFromId(socket.id);
  const name = user['name'];
  const color = user['color'];

  socket.on('disconnect', () => {
    removeUser(socket.id);
    io.sockets.emit('userLeft', { name: name, color: color });
  });

  socket.on('numberSubmit', data => {
    if (socket.id === lastSubmitter) {
      socket.emit('consecutiveSubmission');
    } else if (typeof data !== "number") {
      socket.emit('nonNumberSubmission');
    } else {
      let successfulInc = true; // "The user successfully incremented the #"
      if (data === counter + 1) {
        counter++;
        lastSubmitter = socket.id;
      } else {
        counter = 0;
        successfulInc = false;
        lastSubmitter = '';
      }
      io.sockets.emit('numberSubmit', {
        counter: counter,
        number: data,
        success: successfulInc,
        name: name,
        color: color
      });
    }
  });
}

/* On socket connection, adds event listeners to [socket] that are meant to be 
active pre-registration. 

On a request for the counter (a 'getCounter' event), 
[socket] emits a 'getCounter' event with data containing the counter's current
value.

On submission of a name (a 'nameSubmit' event), the name is analyzed, and, if 
the name is valid, that user is added and post-registration event listeners are
added to [socket]. If the name is invalid because the user has already 
registered, the name is already taken, or the name contains no valid characters, 
then a 'nameFailure' event is emit by [socket] with an appropriate explanation 
attached as data. */
io.on('connection', socket => {
  console.log('A user has connected!!!');
  socket.on('disconnect', () => {
    console.log('A user has disconnected :(');
  });

  socket.on('getCounter', data => {
    socket.emit('getCounter', { counter: counter });
  });

  socket.on('nameSubmit', data => {
    const analyzedName = nameAnalysis(data);
    if (isUser(socket.id)) {
      socket.emit('nameFailure', "Stop trying to break my application! You already entered a name!");
    } else if (!analyzedName.valid) {
      socket.emit('nameFailure', analyzedName.reason);
    } else {
      addUser(socket.id, data);
      socket.emit('nameSuccess');
      const user = getuserFromId(socket.id);
      io.sockets.emit('userJoined', { name: user.name, color: user.color });
      postRegistration(socket);
    }
  });
});

