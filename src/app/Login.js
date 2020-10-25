import React, {useState} from 'react';
import {userLogin} from "./chatroomApi";
import {useFetchAvailableUsers} from "./Users";

function Login(props) {
  const [refresh, setRefresh] = useState(true);
  const users = useFetchAvailableUsers(refresh);

  async function login(user) {
    try {
      await userLogin(user);
      props.showLogin(false); // remove login component from parent
      props.setLoggedUser(user);
    } catch(err) {
      alert('Selected user already logged in!');
      setRefresh(false);
      setRefresh(true);
    }
  }

  let userValues = !!users && Object.values(users);
  return (
    !!userValues && userValues.length > 0 && <div id="user-login">
      <h1>Select User</h1>
      {userValues.map(user => (
        <div className="user-login"
             data-userid={user.id}
             key={user.id}
             onClick={login.bind(undefined, user)}>
          <img src={user.profileimg} alt={user.alt}/>
          <div>{user.username}</div>
        </div>
      ))}
    </div>
  );
}

export default Login;
