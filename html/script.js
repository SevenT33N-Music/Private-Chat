var socket;
var chatIDInput;
var messageInput = document.getElementById('messageInput');
var chatRoom;
var dingSound;
var messages = [];
var delay = true;
var windowFocus = true;
var messageNum = 0;
var connectionSuccess = true;
var connectionMessageCreated = false;
var joined = false;
var notificationPermission = false;

let notisOn = localStorage.getItem('notiOn');

// DOM CONTENT
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const loadingContainer = document.getElementById('loadingContainer');
const mainContainer = document.getElementById('mainContainer');
const loginContainer = document.getElementById('loginContainer');
const messageContainer = document.getElementById('messageContainer');
const sendBtn = document.getElementById('sendBtn');
const timeElaspedLoading = document.getElementById('timeElaspedLoading');

var typingPing = false;
var userName;
var passWord;
var roomName = 'test';
var usersTyping = [];
var testAlert = 'none';
var alertId = 0;
var debugMode = true;

function getOnlineUsers() {
  socket.emit('getUsers', roomName);
}
function logout() {
  let text = "Are you sure you want to logout?";
  if (confirm(text) == true) {
    localStorage.setItem('loggedIn', 'false');
    window.location.reload();
  } else {
    alert('Logout canceled.');
  }
}
function checkTypers() {
  if (usersTyping.length > 0) {
    var typingString;
    if (usersTyping.length > 2) {
      if (usersTyping.includes(localStorage.getItem('username'))) {
        typingString = "You & Several Others Are Typing";
      }
      else {
        typingString = "Several Users Are Typing";
      }
    }
    else {
      if (usersTyping.length == 1) {
        if (usersTyping[0] == localStorage.getItem('username')) {
          typingString = `You Are Typing`;
        }
        else {
          typingString = `${usersTyping[0]} is Typing`;
        }
      }
      else if (usersTyping.length == 2) {
        if (usersTyping[0] == localStorage.getItem('username')) {
          typingString = `You & ${usersTyping[1]} Are Typing`;
        }
        else if (usersTyping[1] == localStorage.getItem('username')) {
          typingString = `You & ${usersTyping[0]} Are Typing`;
        }
        else {
          typingString = `${usersTyping[0]} & ${usersTyping[1]} Are Typing`;
        }
      }
    }
    document.getElementById('typingText').innerHTML = typingString;
    document.getElementById('typingContainer').classList.remove('noTyping');
  }
  else {
    document.getElementById('typingContainer').classList.add('noTyping');
  }
}
function removeItemAll(arr, value) {
  var i = 0;
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}
function checkTyping(value) {
  if (value == "" || value.length < 1) {
    if (typingPing == true) {
      typingPing = false;
      socket.emit("typing", "no", localStorage.getItem('username'));
    }
  }
  else if (value != "" || value.length > 0) {
    if (typingPing == false) {
      typingPing = true;
      socket.emit("typing", "yes", localStorage.getItem('username'));
    }
  }
}
function createMessage(sender, message) {
  if (sender.toLowerCase() == "server") {
    let messageItem = document.createElement('div');
    let senderItem = document.createElement('div');
    let msg = document.createElement('div');
    messageItem.classList.add('message');
    if (sender.toLowerCase() == userName.toLowerCase()) {
      messageItem.classList.add('sent');
    }
    else {
      messageItem.classList.add('recieved');
    }
    let senderNameItem = document.createElement('div');
    let senderProfileItem = document.createElement('div');
    let senderProfileImg = document.createElement('img');
    senderProfileImg.src = `profilePictures/${sender}/pfp.png`;
    senderProfileImg.classList.add(sender);
    senderProfileItem.classList.add('senderPFP');
    senderNameItem.innerHTML = sender;
    senderNameItem.style.color = "red";
    senderNameItem.classList.add('senderName');
    msg.innerHTML = message;
    msg.classList.add('messageTxt');
    senderItem.appendChild(senderProfileItem);
    senderItem.appendChild(senderNameItem);
    messageItem.appendChild(senderItem);
    messageItem.appendChild(msg);
    messageItem.id = `message${messageNum}`;
    messageContainer.appendChild(messageItem);
    try {
      messageContainer.style.scrollBehavior = "smooth";
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
    catch (err) {
      console.log(err);
    }
    messageNum += 1;
  }
  else {
    let messageItem = document.createElement('div');
    let senderItem = document.createElement('div');
    let msg = document.createElement('div');
    messageItem.classList.add('message');
    if (sender.toLowerCase() == userName.toLowerCase()) {
      messageItem.classList.add('sent');
    }
    else {
      messageItem.classList.add('recieved');
    }
    let senderNameItem = document.createElement('div');
    let senderProfileItem = document.createElement('div');
    let senderProfileImg = document.createElement('img');
    senderProfileImg.src = `profilePictures/${sender}/pfp.png`;
    senderProfileItem.classList.add('senderPFP');
    senderNameItem.innerHTML = sender;
    senderNameItem.classList.add('senderName');
    senderNameItem.onclick = function() {
      let originalValue = messageInput.value;
      messageInput.value = `@${sender}: ${originalValue}`;
    }
    if (message.includes('@') == true && message.includes(':') == true) {
      let messageSplit = message.split(':');
      let messageSplit2 = messageSplit[0].split('@');
      let replyTo = messageSplit2[1];
      let replyMessage = messageSplit[1];
      let messageBefore = messageSplit2[0];
      messageBefore = messageBefore.trim();
      if (messageBefore != "") {
        msg.innerHTML = `<p>${messageBefore} <i class="reply-text">@${replyTo}</i> ${replyMessage}</p>`;
      }
      else {
        msg.innerHTML = `<p><i class="reply-text">@${replyTo}</i>: ${replyMessage}</p>`;
      }
    }
    else {
      msg.innerHTML = message;
    }
    msg.classList.add('messageTxt');
    senderItem.classList.add('senderInfo');
    senderProfileItem.appendChild(senderProfileImg);
    senderItem.appendChild(senderProfileItem);
    senderItem.appendChild(senderNameItem);
    messageItem.appendChild(senderItem);
    messageItem.appendChild(msg);
    messageItem.id = `message${messageNum}`;
    messageContainer.appendChild(messageItem);
    try {
      messageContainer.style.scrollBehavior = "smooth";
      messageContainer.scrollTop = messageContainer.scrollHeight;
      //document.getElementById(`message${messageNum - 1}`).scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
    }
    catch (err) {
      alert(`Couldnt Scroll into view. Error: ${err}`);
    }
    messageNum += 1;
  }
}
function onload() {
  socket = io();
  socket.on("join", function(room) {
    joined = true;
    console.log('joined ' + room);
    if (debugMode == true) {
      createActionMessage('info', 'joined ' + room, true);
    }
  })
  socket.on("recieve", function(message) {
    console.log(message);
    let messageSplit = message.split('|');
    let sender = messageSplit[0];
    let msg = messageSplit[1];
    createMessage(sender, msg);
    if (windowFocus == false) {
      if (Notification.permission === "granted") {
        const notification = new Notification(`Message from "${sender}"`, {
          body: msg
        });
      }
    }
  })
  socket.on('loginSuccess', function(username) {
    try {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('username', username);
    }
    catch (err) {
      alert(`Error: ${err}. Login status will not be saved.`);
    }
    loginContainer.style.display = "none";
    mainContainer.style.display = "flex";
    socket.emit("join", 'room', username);
  })
  socket.on('loginFail', function() {
    alert('Incorrect username or password');
  })
  socket.on('invalidUsername', function() {
    alert('Sorry, Your username is not a valid username.');
    mainContainer.style.display = "none";
    loginContainer.style.display = "flex";
    localStorage.clear();
  })
  socket.on('typing', function(username) {
    usersTyping.push(username);
    checkTypers();
  })
  socket.on('notTyping', function(username) {
    usersTyping = removeItemAll(usersTyping, username);
    checkTypers();
  })
  socket.on('sendUsers', function(data) {
    alert(data);
  })
  socket.on('disconnect', function () {
    joined = false;
    document.getElementById('onlineUsersBtn').style.display = "none";
    createMessage('Server', 'Uh oh, you have been disconnected. Attempting to reconnect...');
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectInterval = 2500;
    function attemptReconnect() {
      reconnectAttempts++;
      if (reconnectAttempts <= maxReconnectAttempts) {
        socket.connect();
        if (joined == false) {
          socket.emit('join', 'room', userName);
          setTimeout(attemptReconnect, reconnectInterval);
        } 
      }
      else {
        createMessage("Server", "Failed to reconnect after " + maxReconnectAttempts + " attempts.")
      }
    }
    attemptReconnect();
  })
  socket.on('userExists', function() {
    sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
    sendValidUserReply();
  })
  socket.on('userDoesntExist', function() {
    sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
    alert('sorry, that username does not exist. Check spelling and make sure the user actually exists :D');
  })
  socket.on('serverUp', function() {
    clearInterval(timeElaspedInterval);
    loadingContainer.style.display = "none";
    let loggedIn = localStorage.getItem('loggedIn');
    if (loggedIn == true || loggedIn == 'true') {
      try {
        console.log('logged in');
        userName = localStorage.getItem('username');
        socket.emit("join", 'room', userName);
        mainContainer.style.display = "flex";
        mainContainer.style.opacity = "1";
      }
      catch (err) {
        if (debugMode == true) {
          createActionMessage('error', `Error: ${err}. Login status will not be saved.`);
        }
      }
    }
    else {
      console.log('not logged in');
      loginContainer.style.display = 'flex';
    }
  })
  loadingInfo.innerHTML = "Waiting for Server... (This could take a minute)";
  let timeElapsed = 0;
  let timeElaspedInterval = setInterval(function() {
    timeElapsed += 1;
    timeElaspedLoading.innerHTML = `Time Elasped: ${timeElapsed}s`;
  }, 1000);
  socket.emit('serverWaiting');
}
function attemptLogin() {
  let username = usernameInput.value;
  let password = passwordInput.value;
  userName = username;
  passWord = password;
  socket.emit("attemptLogin", username, password);
}
function Connect() {
  socket.emit("join", chatIDInput.value, usernameInput.value);
}
function Send() {
  if (delay && messageInput.value.replace(/\s/g, "") != "") {
    if (messageInput.value.includes("|")) {
      alert('Sorry, you cannot use the "|" character, as it is reserved for the server.');
    }
    else if (messageInput.value.includes('@') == true && messageInput.value.includes(':') == true) {
      let messageSplit = messageInput.value.split(':');
      let messageSplit2 = messageSplit[0].split('@');
      let replyTo = messageSplit2[1];
      sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      socket.emit('checkForUserExistance', replyTo);
      }
    else {
      delay = false;
      setTimeout(delayReset, 1000);
      socket.emit("send", messageInput.value);
      messageInput.value = "";
      checkTyping(messageInput.value);
    }
  }
}
function sendValidUserReply() {
  if (delay && messageInput.value.replace(/\s/g, "") != "") {
    if (messageInput.value.includes("|")) {
      alert('Sorry, you cannot use the "|" character, as it is reserved for the server.');
    }
    else {
      delay = false;
      setTimeout(delayReset, 1000);
      socket.emit("send", messageInput.value);
      messageInput.value = "";
      checkTyping(messageInput.value);
    }
  }
}
function delayReset() {
  delay = true;
}
function checkLogin() {
  socket.emit('checkLogin', userName);
}
function checkConnection() {
  var button;
  var buttonSet = false;
  try {
    button = document.getElementById('checkConnectionBtn')
    button.innerHTML = "Checking connection...";
    buttonSet = true;
  }
  catch (err) {
    alert('Error Changing Button Text: ' + err);
  }
  finally {
    connectionSuccess = false;
    connectionMessageCreated = false;
    if (buttonSet == true) {
      button.innerHTML = 'Checking... (10s Left)';
      for (i = 0; i < 10; i++) {
        if (i == 9) {
          setTimeout(function() {
            if (connectionSuccess == true && connectionMessageCreated == false) {
              connectionMessageCreated = true;
              createMessage('Server', 'You are connected to the server');
            }
            else {
              button.innerHTML = `No Connection.`;
            }
          }, 10000);
        }
        else {
          let timeoutTime = 1000 * i;
          setTimeout(function() {
            if (connectionSuccess == true && connectionMessageCreated == false) {
              connectionMessageCreated = true;
              createMessage('Server', 'You are connected to the server');
            }
            else {
              button.innerHTML = `Checking... (${10 - i}s Left)`;
            }
          }, timeoutTime);
        }
      }
    }
    else {
      for (i = 0; i < 10; i++) {
        setTimeout(function() {
          if (connectionSuccess == true && connectionMessageCreated == false) {
            connectionMessageCreated = true;
            createMessage('Server', 'You are connected to the server');
          }
        }, 1000 * i);
      }
    }
    socket.emit('checkConnection', userName);
  }
}
function attemptReconnect() {
  socket.connect();
}
function help() {
  alert('HELP\nReplying: Click on the username of the person you want to reply to, than type your message\nMENTION: type "@", followed by the username of the person you want to mention, then type ":" (The ":" will be removed automatically once you send the message)');
}
function createActionMessage(type = 'error', data = 'TEST', autoRemove = false) {
  let container = document.getElementById('alertContainer');
  let item = document.createElement('div');
  let itemId = `alert${alertId}`;
  alertId += 1;
  item.classList.add('action-alert-item');
  if (autoRemove == true) {
    item.classList.add('auto-remove');
  }
  else {
    item.classList.add('keep-alert');
  }
  if (type == "alert") {
    item.classList.add('error');
    item.innerHTML = `<span style="font-weight: 800;">${String.fromCharCode(0x26A0)}</span><br>${data}`;
  }
  else if (type == "info") {
    item.classList.add('info');
    item.innerHTML = `<span style="font-weight: 800;">${String.fromCharCode(0x24D8)}</span><br>${data}`;
  }
  else {
    item.innerHTML = data;
    item.classList.add(type);
  }
  item.transition = "all 0.5s ease";
  item.id = itemId;
  let closeBtn = document.createElement('div');
  closeBtn.classList.add('action-alert-btn');
  closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
  <path d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/>
  </svg>`;
  closeBtn.onclick = function() {
    item.style.animation = "fadeOut 0.5s ease-out";
  }
  let copyBtn = document.createElement('div');
  copyBtn.classList.add('action-alert-btn');
  copyBtn.classList.add('copy');
  copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
  <path d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16l140.1 0L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/>
  </svg>`;
  copyBtn.onclick = function() {
    navigator.clipboard.writeText(data);
  }
  if (autoRemove == false) {
    item.appendChild(closeBtn);
    item.appendChild(copyBtn);
  }
  container.appendChild(item);
  item.addEventListener('animationend', (event) => {
    if (event.animationName == 'fadeOut') {
      item.style.opacity = 0;
      item.style.overflowY = "clip";
      item.style.padding = "0 2.5vw";
      if (testAlert == 'none') {
        testAlert = 'done';
        //createActionMessage('info', 'Testing. eget magna fermentum iaculis eu non diam phasellus vestibulum lorem sed risus ultricies tristique nulla aliquet enim tortor at auctor urna nunc id cursus metus...');
        //createActionMessage('info', 'Testing. eget magna fermentum iaculis eu non diam phasellus vestibulum lorem sed risus ultricies tristique nulla aliquet enim tortor at auctor urna nunc id cursus metus...');
      }
      let itemHeight = item.offsetHeight;
      let changeHeight = itemHeight / 25;
      let start = null;
      let itemStyling = getComputedStyle(item);
      let itemMargin = parseFloat(itemStyling.getPropertyValue('margin-bottom').replace('px', ''))
      let marginRemoveAmt = itemMargin / 2.5;
      function changeHeightAnimation(timeStamp) {
        itemMargin = parseFloat(itemStyling.getPropertyValue('margin-bottom').replace('px', ''))
        let newMargin = itemMargin - marginRemoveAmt;
        if (newMargin < 0) {
          newMargin = 0;
        }
        let newChangeHeight;
        itemHeight = item.offsetHeight;
        if (start == null) {
          //console.log(`Item Margin: ${itemMargin} | Item New Margin: ${newMargin} | Calculated Margin Remove Amount: ${marginRemoveAmt}`);
          start = timeStamp;
          newChangeHeight = changeHeight;
          item.style.marginBottom = `${itemMargin}px`;
        }
        else {
          item.style.marginBottom = `${newMargin}px`;
          newChangeHeight = itemHeight - changeHeight;
        }
        const elapsedTime = timeStamp - start;
        item.style.height = `${itemHeight - newChangeHeight}px`;
        changeHeight = itemHeight / 10;
        if (item.offsetHeight <= 0.01) {
          item.remove();
          //console.log(`Item Margin: ${itemMargin} | Item New Margin: ${newMargin} | Calculated Margin Remove Amount: ${marginRemoveAmt}`);
          //console.log('Alert Removed.');
        }
        else {
          requestAnimationFrame(changeHeightAnimation);
        }
      }
      requestAnimationFrame(changeHeightAnimation);
    }
  });
}

// SERVICE WORKER FUNCTIONS AND NOTIFICATION FUNCTIONS
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    console.log("Noti Permission Was Granted");
  }
}
async function checkNotificationPermission(toggle = false) {
  const permissionStatus = await navigator
    .permissions
    .query({ name: 'notifications' });
  switch (permissionStatus.state) {
    case 'granted':
      if (debugMode == true) {
        createActionMessage('info', 'Notifications Enabled', true);
      }
      console.log('User Granted Notification Permission');
      if (toggle) {
        navigator.setAppBadge(unread).catch((error) => {
          console.log(`Error: ${error}`);
        });
      }
      break;
    case 'denied':
      if (debugMode == true) {
        createActionMessage('info', 'Notifications Disabled', true);
      }
      console.log('User Denied Notification Permission');
      break;
    default:
      await requestNotificationPermission();
      break;
  }
}
function registerWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async function() {
      /*
      if (doDataCache == true) {
        try {
          navigator.serviceWorker.register('/sw.js').then(onRegistration);
        }
        catch (err) {
          if (debugMode == true) {
            createActionMessage('error', `Failed to register service worker. Error: ${err}`);
          }
        }
        function onRegistration(registration) {
          if (registration.waiting) {
            console.log('waiting', registration.waiting);
            registration.waiting.addEventListener('statechange', onStateChange('waiting'));
          }
          if (registration.installing) {
            console.log('installing', registration.installing);
            registration.installing.addEventListener('statechange', onStateChange('installing'));
          }
          if (registration.active) {
            console.log('active', registration.active);
            registration.active.addEventListener('statechange', onStateChange('active'));
            return new Promise(function(resolve, reject) {
              var messageChannel = new MessageChannel();
              messageChannel.port1.onmessage = function(event) {
                if (event.data.error) {
                  if (debugMode == true) {
                    createActionMessage('error', `Couldnt Set Future Notification. Error: ${event.data.error}`);
                  }
                  reject(event.data.error);
                }
                else {
                  let response = event.data.response;
                  if (response == 'success') {
                    if (debugMode == true) {
                      createActionMessage('success', 'Successfully Set Future Notification.', true);
                    }
                    resolve(response);
                  }
                  else {
                    if (debugMode == true) {
                      createActionMessage('error', `Failed to set future notification. Worker Response: ${response}`);
                    }
                    reject(event.data.response);
                  }
                }
              }
              try {
                registration.active.postMessage({ message: "CreateNoti", title: 'Unread Messages', notis: unread }, [messageChannel.port2]);
              }
              catch (err) {
                if (debugMode == true) {
                  createActionMessage('error', `Couldnt Set Future Notification. Error: ${err}`);
                  reject(err);
                }
              }
            });
          }
        }
        function onStateChange(from) {
          return function(e) {
            console.log('statechange initial state ', from, 'changed to', e.target.state);
          }
        }
      }
      else {
        try {
          navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for (const registration of registrations) {
                registration.unregister();
            } 
          }, function(err) {
          if (debugMode == true) {
            createActionMessage('error', `Failed to Unregister Service Workers. Err: ${err}`);
          }
          });
        }
        catch (err) {
          if (debugMode == true) {
            createActionMessage('error', `Failed to Unregister Service Workers. Err: ${err}`);
          }
        }
      }
      */
      try {
        navigator.serviceWorker.register('/sw.js').then(onRegistration);
      }
      catch (err) {
        if (debugMode == true) {
          createActionMessage('error', `Failed to register service worker. Error: ${err}`);
        }
      }
      function onRegistration(registration) {
        if (registration.waiting) {
          console.log('waiting', registration.waiting);
          registration.waiting.addEventListener('statechange', onStateChange('waiting'));
        }
        if (registration.installing) {
          console.log('installing', registration.installing);
          registration.installing.addEventListener('statechange', onStateChange('installing'));
        }
        if (registration.active) {
          console.log('active', registration.active);
          registration.active.addEventListener('statechange', onStateChange('active'));
        }
      }
      function onStateChange(from) {
        return function(e) {
          console.log('statechange initial state ', from, 'changed to', e.target.state);
        }
      }
    });
  }
}
function sendMessageToWorker(sender, msg) {
  return new Promise(function(resolve, reject) {
    var messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = function(event) {
      if (event.data.error) {
        if (debugMode == true) {
          createActionMessage('error', `Couldnt Set Future Notification. Error: ${event.data.error}`);
        }
        reject(event.data.error);
      }
      else {
        let response = event.data.response;
        if (response == 'success') {
          if (debugMode == true) {
            createActionMessage('success', 'Successfully Set Future Notification.', true);
          }
          resolve(response);
        }
        else {
          if (debugMode == true) {
            createActionMessage('error', `Failed to set future notification. Worker Response: ${response}`);
          }
        }
      }
    }
    try {
      navigator.serviceWorker.controller.postMessage({ message: "CreateNoti", sender: sender, msg: msg }, [messageChannel.port2]);
    }
    catch (err) {
      if (debugMode == true) {
        createActionMessage('error', `Couldnt Set Future Notification. Error: ${err}`);
        reject(err);
      }
    }
  });
}

document.getElementById('messageInput').addEventListener('focusout', function() {
  try {
    mainContainer.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
  }
  catch (err) {
    console.log(err);
  }
});
document.addEventListener('visibilitychange', function(event) {
  if (document.visibilityState === 'hidden') {
    windowFocus = false;
    console.log('window is no longer focused. Window Focus Variable Value: ' + windowFocus);
  }
  else {
    windowFocus = true;
    console.log('window is focused. Window Focus Variable Value: ' + windowFocus);
  }
});
document.addEventListener('keypress', function(event) {
  if (event.key === "Enter") {
    Send();
  }
});
document.addEventListener('readystatechange', function() {
  if (document.readyState == "complete") {
    //registerWorker();
    if (debugMode == true) {
      createActionMessage('info', 'Debug Mode Enabled', true);
    }
    onload();
  }
});