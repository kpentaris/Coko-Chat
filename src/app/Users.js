import {useEffect, useState} from "react";

const allUsersApi = 'http://localhost:5000/users/';
const loggedUsersApi = 'http://localhost:5000/loggedUsers/';

export const useFetchAllUsers = () => {
  const [allUsers, setAllUsers] = useState({});

  useEffect(() => { // load all available users on first component add
    fetch(allUsersApi)
      .then(response => response.json())
      .then(json => {
        const usersMap = json.reduce((map, user) => {
          return {...map, [user.id]: user};
        }, {});
        setAllUsers(usersMap);
      })
  }, []);

  return allUsers;
};

export const useFetchLoggedUsers = (refresh) => {
  const [loggedUsers, setLoggedUsers] = useState({});

  useEffect(() => {
    if(refresh) {
      fetch(loggedUsersApi)
        .then(response => response.json())
        .then(json => {
          const usersMap = json.reduce((map, user) => {
            return {...map, [user.id]: user};
          }, {});
          setLoggedUsers(usersMap);
        });
    }
  }, [refresh]);

  return [loggedUsers, setLoggedUsers];
};

export const useFetchAvailableUsers = (refresh) => {
  const allUsers = useFetchAllUsers();
  const [loggedUsers] = useFetchLoggedUsers(refresh);

  const availableUsers = {...allUsers};
  Object.keys(loggedUsers).forEach(key => delete availableUsers[key]);
  return availableUsers;
};
