export {
  sendMessage, initWebsocketConnection, getAllMessages,
  getAllAvailableUsers, getAllLoggedUsers, userLogin,
  userLogout
}

async function userLogin(user) {
  const response = await fetch(`http://localhost:5000/user/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  });
  if(!response.ok) {
    throw response.statusText;
  }
  return response;
}

async function userLogout(user) {
  navigator.sendBeacon('http://localhost:5000/user/logout/' + user.id);
}

async function getAllLoggedUsers() {
  return (await fetch(`http://localhost:5000/loggedUsers/`, {
    method: 'GET'
  })).json();
}

async function getAllAvailableUsers() {
  return (await fetch(`http://localhost:5000/users/`, {
    method: 'GET'
  })).json();
}

async function getAllMessages() {
  return (await fetch(`http://localhost:5000/messages`, {
    method: 'GET'
  })).json();
}

async function sendMessage(msgObj) {
  return (await fetch('http://localhost:5000/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(msgObj)
  }));
}

async function initWebsocketConnection(msgCb) {
  return new Promise(function(resolve, reject) {
    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    let connection = new WebSocket('ws://localhost:5000');

    connection.onopen = function () {
      console.log('Successfully opened websocket connection with chatroom server');
      resolve();
    };

    connection.onerror = function (error) {
      alert("WebSocket error: Can't establish connection");
      reject();
    };

    connection.onmessage = function (wsMessage) {
      let chatMessage;
      try {
        chatMessage = JSON.parse(wsMessage.data);
        msgCb(chatMessage);
      } catch (e) {
        console.log('This doesn\'t look like a valid JSON: ', wsMessage.data);
      }
    };
  });
}
