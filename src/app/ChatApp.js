import React, {useEffect, useState} from 'react';
import '../styles/chatroom.css';
import Login from "./Login";
import Chatroom from "./Chatroom";


function ChatApp() {
  const [showLogin, setShowLogin] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [loggedUser, setLoggedUser] = useState(undefined);

  useEffect(() => {
    setShowChat(!!loggedUser);
  }, [loggedUser]);

  return (
    <div className="chat-app">
      {showLogin && <Login showLogin={setShowLogin} setLoggedUser={setLoggedUser}/>}
      {showChat && <Chatroom showChat={setShowChat} loggedUser={loggedUser}/>}
    </div>
  );
}

export default ChatApp;
