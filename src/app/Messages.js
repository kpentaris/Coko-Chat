import {useEffect, useState} from "react";
import {fromDTO, toDTO} from "../common/Message";

const allMessagesApi = 'http://localhost:5000/messages';
const sendMessageApi = 'http://localhost:5000/message';

export const useFetchMessages = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => { // load all available users on first component add
    fetch(allMessagesApi)
      .then(response => response.json())
      .then(messagesJson => {
        setMessages(messagesJson
          .map(msg => fromDTO(msg))
          .sort((a, b) => a.created_on > b.created_on ? -1 : 1));
      });
  }, []);

  function sendMessage(newMessage) {
    fetch(sendMessageApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(toDTO(newMessage))
    })
    .then(async function(response) {
      newMessage['id'] = await response.json();
      setMessages([newMessage, ...messages]);
    });
  }

  function receiveMessage(newMessage) {
    const msg = fromDTO(newMessage);
    setMessages(existing => [msg, ...existing]);
  }

  return [messages, sendMessage, receiveMessage];
};
