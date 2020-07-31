/* Connecting on client side. */
const socket = io.connect("http://localhost:4000");

/* Selecting various HTML elements to be used later. */
const numberForm = document.forms['input-box'];
const nameForm = document.forms['name-input'];
const currStreak = document.querySelector('.current-streak');
const chats = document.querySelector('.chat-entries');
const namePrompt = document.querySelector('.name-prompt');
const errorBox = document.querySelector('.error-box');
const dropdownBar = document.querySelector('.dropdown-bar');
const chevron = document.querySelector('.chevron');
const info = document.querySelector('.info');

/* Requests the current counter value to start*/
socket.emit('getCounter');

/* Upon submission of the number form, default behavior is prevented, the number
input by the user is selected, and that number is sent as data with a 
'numberSubmit' event that's emitted by the socket. The number input box is then
set to be empty. */
numberForm.addEventListener('submit', event => {
  event.preventDefault();
  const numberField = numberForm.querySelector('input[type="number"]');
  socket.emit('numberSubmit', parseInt(numberField.value, 10));
  numberField.value = '';
});

/* Upon submission of the name form, default behavior is prevented and a 
'nameSubmit' event is emitted by the socket with attached data of the name the 
user input. */
nameForm.addEventListener('submit', event => {
  event.preventDefault();
  socket.emit('nameSubmit', nameForm.querySelector('input[type="text"]').value);
});

/* On a 'nameSuccess' event, a message is logged to the console and the 'active'
status of the name prompt overlay is removed. */
socket.on('nameSuccess', () => {
  console.log("You've successfully joined!!!");
  namePrompt.classList.remove('active');
});

/* On a 'nameFailure' event, an error message with [data] is added to the error
box. */
socket.on('nameFailure', data => {
  errorBox.innerHTML = `<div class="error-message">${data}</div>`
});

/* On a 'numberSubmit' event, the counter is updated based on the value passed
through by [data]'s counter property. A chat entry is added to let the user 
know what has happened, and the color of that entry is determined by 
[data]'s success property. */
socket.on('numberSubmit', data => {
  currStreak.innerText = data.counter;
  if (data.success) {
    chats.innerHTML = `<div class="chat-entry" chat-color="${data.color}">${data.name}: ${data.number}</div>` + chats.innerHTML;
  } else {
    chats.innerHTML = `<div class="chat-entry failure">${data.name}: ${data.number}</div>` + chats.innerHTML;
  }
});

/* On a 'consecutiveSubmission' event, a chat message is added letting the user
know that they cannot submit a number on consecutive turns. */
socket.on('consecutiveSubmission', () => {
  chats.innerHTML = '<div class="chat-entry failure">Going twice in a row is disallowed.</div>' + chats.innerHTML;
})

/* On a 'nonNumberSubmission', a chat message is added letting the user know 
that they must enter a number into the number input box. */
socket.on('nonNumberSubmission', () => {
  chats.innerHTML = `<div class="chat-entry failure">Please enter a number.</div>` + chats.innerHTML;
})

/* On a 'getCounter' event, the counter is updated to be [data]'s counter
property. */
socket.on('getCounter', data => {
  currStreak.innerText = data.counter;
});

/* On a 'userJoined' event, a chat message is added alerting the user of this
user's joining. */
socket.on('userJoined', data => {
  chats.innerHTML = `<div class="chat-entry" chat-color=${data.color}>${data.name} has joined!</div>` + chats.innerHTML;
});

/* On a 'userLeft' event, a chat message is added alerting the user of this
event. */
socket.on('userLeft', data => {
  chats.innerHTML = `<div class="chat-entry" chat-color=${data.color}>${data.name} has left :(</div>` + chats.innerHTML;
});

/* Upon clicking the dropdown button, the class 'active' is toggled for certain
elements. */
dropdownBar.addEventListener('click', () => {
  info.classList.toggle('active');
  chevron.classList.toggle('active');
});

