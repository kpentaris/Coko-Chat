import React, {useRef} from 'react';
import {useFetchAllUsers, useFetchLoggedUsers} from "./Users";
import {useFetchMessages} from "./Messages";
import {Message} from "../common/Message";
import {initWebsocketConnection, userLogout} from "./chatroomApi";

function Chatroom(props) {
  // refs
  const initialized = useRef(false);
  const chatText = useRef(null);
  const allUsersRef = useRef({});

  // chatroom state
  const allUsers = useFetchAllUsers();
  const [loggedUsers, setLoggedUsers] = useFetchLoggedUsers(true);
  const [messages, sendMessage, receiveMessage] = useFetchMessages();

  allUsersRef.current = allUsers; // reference for socket callbacks

  if(!initialized.current) {
    window.addEventListener("unload", () => {
      userLogout(props.loggedUser);
    });

    initWebsocketConnection(socketCB);
    initialized.current = true;
  }

  function receiveMessageCB(msg) {
    if(msg.from_user === props.loggedUser.id) {
      return; // no need to handle own messages received from socket. Server side needs to filter out sending them to their creator
    }
    const isMention = msg.mention_user_id === props.loggedUser.id;
    if(isMention) { // message is mention to user. Requires https or localhost
      const fromUser = allUsersRef.current[msg.from_user];
      notifyOnMention(fromUser.username, fromUser.profileimg, msg.message_text.substring(msg.message_text.indexOf(' ') + 1)); // don't display the
      // mention part in the notif
    }
    receiveMessage(msg);
  }

  // callbacks
  function socketCB(sockMsg) {
    // we check the message type based on the object form but should have better method
    if(!!sockMsg.username) { // is user login message
      setLoggedUsers(logged => {
        const users = {...logged, [sockMsg.id]: sockMsg};
        return users;
      });
    } else if(!!sockMsg.message_text) { // is incoming text msg
      receiveMessageCB(sockMsg);
    } else {
      setLoggedUsers(logged => {
        delete logged[sockMsg];
        const users = {...logged};
        return users;
      });
    }
  }
  function mentionOnClick(mentionUser) {
    if(chatText.current.value.startsWith(`@${mentionUser.username} `)) {
      return;
    } else if(chatText.current.value.startsWith('@')) {
      chatText.current.value = chatText.current.value.substring(chatText.current.value.indexOf(' ') + 1);
    }
    chatText.current.value = `@${mentionUser.username} ${chatText.current.value}`;
  }

  // functions
  function getUserByUsername(username) {
    const user = Object.values(allUsers).filter(user => user.username === username);
    if(!!user) {
      return user[0];
    }
    return undefined;
  }

  function postMessage(msgText) {
    if(!msgText) {
      return;
    }
    let mentionUsername = undefined;
    if(msgText.startsWith('@')) {
      mentionUsername = msgText.substring(1, msgText.indexOf(' ')); // start after the '@' sign
      if(`@${mentionUsername} ` === msgText) { // if there is only the mention do nothing but don't remove the mention
        return;
      }
    }
    if(mentionUsername === props.loggedUser.username) {
      // can't mention self
      mentionUsername = undefined; // reset mention
    }

    chatText.current.value = ''; // reset message box

    const msgObj = new Message(
      props.loggedUser.id, // user id must not be determined from client but from server session instead
      msgText,
      new Date(), // date must not be determined from client but from server instead
      !!mentionUsername ? getUserByUsername(mentionUsername).id : undefined
    );
    sendMessage(msgObj);
  }

  return (
    <div id="chat-container">
      <div id="users-list-title">
        <div>Online Users</div>
      </div>
      <div id="users-list">
        {Object.keys(loggedUsers).length > 0 &&
        Object.values(loggedUsers).map(user => {
          if(user.id === props.loggedUser.id) {
            return;
          }
          return (
            <div className="conversation" key={user.id} onClick={mentionOnClick.bind(undefined, user)}>
              <img src={user.profileimg} alt={user.alt}/>
              <div className="title-text">{user.username}</div>
            </div>
          );
        })
        }
      </div>
      <div id="chat-title">
        <span>Coko Devs</span>
      </div>
      <div id="chat-messages-form">
        <div id="chat-message-list">
          {Object.values(allUsers).length > 0 && messages.map(message => {
            if(message.from_user === props.loggedUser.id) {
              return (
                <div key={message.id} className="message-row you-message">
                  <div className="message-content">
                    <div className={`message-text ${!!message.mention_user_id ? ' mention-text' : ''}`}>{message.message_text}</div>
                    <div className="message-time">{message.created_on.toLocaleString()}</div>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={message.id} className="message-row other-message">
                  <div className="message-content">
                    <img src={allUsers[message.from_user].profileimg} alt={props.loggedUser.alt}/>
                    <div className={`message-text ${!!message.mention_user_id ? ' mention-text' : ''}`}>{message.message_text}</div>
                    <div className="message-time">{message.created_on.toLocaleString()}</div>
                  </div>
                </div>
              );
            }
          })}
        </div>
        <div id="chat-form">
          <input
            ref={chatText}
            type="text"
            placeholder="Type a message"
            onKeyPress={e => {
              if(e.key === 'Enter') {
                postMessage(e.target.value);
              }
            }}
          />
          <button
            onClick={e => {
              postMessage(chatText.current.value);
            }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function notifyOnMention(fromUsername, profileImg, notificationText) {
  // check support
  if(!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Check whether notification permissions have already been granted
  else if(Notification.permission === "granted") {
    new Notification(fromUsername, {
      icon: profileImg,
      body: notificationText
    });
  }

  // If no denied, ask
  else if(Notification.permission !== "denied") {
    Notification.requestPermission().then(function(permission) {
      // If the user accepts, let's create a notification
      if(permission === "granted") {
        new Notification(fromUsername, {
          icon: profileImg,
          body: notificationText
        });
      }
    });
  }
}

export default Chatroom;
