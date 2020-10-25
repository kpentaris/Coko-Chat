### Coko dev chat

#### TL;DR
The application depends on Docker which must be installed and running on the local workstation.<br>
The application commands need to run in a bash console. For Windows machines Git Bash can be used.

Steps to run the application right after git clone:
 - Execute `npm i`
 - After successful installation of dependencies execute the command `docker-compose up -d && node ./src/backend/api.js & npm run start`<br>
 This will setup a PostgreSQL database (port:5432), run the init.sql script which creates 5 users, start the NodeJS + Express backend (port:5000) and
  serve a React-App for the client (port:3000)
 - Open a browser window to `http://localhost:3000`
 - In order to remove the Docker container (if only one image is running), run the following command: `docker rm -f $(docker ps -q)`
 - In order to remove the Docker image that was installed (if only one image exists in the machine), run the following command: `docker rmi $(docker images -q)`
 
#### Chatroom App

The chat application was built using:
 - ReactJS
 - NodeJS
 - Express framework
 - PostgreSQL Docker image

It was scaffolded using the create-react-app npx command.

The NodeJS backend communicates with the database using the `pg` driver package.

The client application was built using React <a href="https://reactjs.org/docs/hooks-intro.html">Hooks</a>.

Realtime communication is based on websockets. The NodeJS backend uses the `ws` package.

##### App overview
The application contains 2 views:
 - Login view: The available users are served from the database and selecting one will login into the chatroom
 - Chatroom view: Once a user is selected the application redirects into the chatroom
 
##### App features
The following features have been implemented:
 - Logging in with a user will not allow same user login from another tab
 - Realtime user login update
 - Realtime user logout update
 - Realtime messaging
 - Mentions either via @ + username or by clicking on the user in the *Online Users* list
 - If allowed, native browser notification on mention (should work on localhost, might need manual permission)

##### Notes
 - Developed on Brave browser
 - Tested browsers: Chromium based & Firefox
 - Firefox seems to have some issues with WebSocket connections some times.
 - Firefox might not popup prompt for allowing notifications, it might have to be manually selected (button left of the url input)
