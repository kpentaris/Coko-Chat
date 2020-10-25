import React, {useEffect, useState} from 'react';
import '../styles/chatroom.css';
import Login from "./Login";
import Chatroom from "./Chatroom";

/**
 * Base app component. Begins by mounting the Login component.
 * Provides handles to its children to allow for removing the
 * login component and showing the chatroom component.
 * The logged user object is provided from the login to the chatroom
 * component via the base app component.
 */
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
