const {fromDTO, toDTO} = require('../common/message');
const express = require('express');
const cors = require('cors');
const ws = require('ws');
const {getAllUsers, insertMessage, getMessages} = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

const server = app.listen(5000, () => {
  console.log('server started in 5000');
});

// Accept websocket connections
const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
  socket.on('message', message => {
  });
});

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});

// *** API ROUTES *** //

// Keep a cache of the logged users. Normally this mechanism is handled at the DB level or an intermediate cache layer.
// We only keep the user id in the cache.
const loggedUsersCache = [];

// User login route. Adds the user into the logged users cache.
app.post('/user/login', async (req, res, next) => {
  try {
    const loginUser = req.body;
    if(loggedUsersCache.indexOf(loginUser.id) > -1) {
      next('Error: User already logged in');
    } else {
      // If the user is logged in successfully, notify all clients.
      loggedUsersCache.push(loginUser.id);
      wsServer.clients.forEach((client => {
        if(client.readyState === ws.OPEN) {
          client.send(JSON.stringify(loginUser));
        }
      }));
      res.send();
    }
  } catch (err) {
    next(getError(err));
  }
});

// User logout. Remove from cache and notify clients
app.post('/user/logout/:id', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const idx = loggedUsersCache.indexOf(userId);
    if(idx >= 0) {
      loggedUsersCache.splice(idx, 1);
      wsServer.clients.forEach((client => {
        if(client.readyState === ws.OPEN) {
          client.send(userId);
        }
      }));
    }
  } catch (err) {
    next(getError(err));
  }
});

// Retrieve all logged users
app.get('/loggedUsers', async (req, res, next) => {
  try {
    const allUsers = await getAllUsers();
    const loggedUsers = allUsers.filter(user => loggedUsersCache.indexOf(user.id) > -1);
    res.json(loggedUsers);
  } catch(err) {
    next(getError(err));
  }
});

// Get all available users in the database
app.get('/users', async (req, res, next) => {
  try {
    const allUsers = await getAllUsers();
    res.json(allUsers);
  } catch(err) {
    next(getError(err));
  }
});

// Post a new message. Also notifies all users
app.post('/message', async (req, res, next) => {
  try {
    const msg = req.body;
    const dto = fromDTO(msg);
    dto.id = (await insertMessage(dto))[0].id;

    // notify in realtime
    wsServer.clients.forEach((client => {
      if(client.readyState === ws.OPEN) {
        client.send(JSON.stringify(toDTO(dto)));
      }
    }));
    // return the new message DB generated id to the message sender
    res.json(dto.id);
  } catch (err) {
    next(getError(err));
  }
});

// Get all past messages
app.get('/messages', async (req, res, next) => {
  try {
    const allMessages = await getMessages();
    res.json(allMessages.map(toDTO));
  } catch(err) {
    next(getError(err));
  }
});

// *** UTILITIES *** //

// Generic error handling method
function getError(err) {
  if(!!err.message)
    return err.message;
  else
    return err;
}
