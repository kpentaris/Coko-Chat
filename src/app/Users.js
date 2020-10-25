import {useEffect, useState} from "react";

const allUsersApi = 'http://localhost:5000/users/';
const loggedUsersApi = 'http://localhost:5000/loggedUsers/';

/**
 * Handles fetching all available users.
 */
export const useFetchAllUsers = () => {
  const [allUsers, setAllUsers] = useState({});

  useEffect(() => {
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

/**
 * Handles fetching all logged users.
 */
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

/**
 * Handles filtering out all logged users, keeping the users that are available for login.
 */
export const useFetchAvailableUsers = (refresh) => {
  const allUsers = useFetchAllUsers();
  const [loggedUsers] = useFetchLoggedUsers(refresh);

  const availableUsers = {...allUsers};
  Object.keys(loggedUsers).forEach(key => delete availableUsers[key]);
  return availableUsers;
};
