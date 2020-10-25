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

const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', socket => {
  socket.on('message', message => {
    // do nothing on incoming websocket message
  });
});

server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});

// *** API ROUTES *** //

const loggedUsersCache = [];
// User login
app.post('/user/login', async (req, res, next) => {
  try {
    const loginUser = req.body;
    if(loggedUsersCache.indexOf(loginUser.id) > -1) {
      next('Error: User already logged in');
    } else {
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

app.get('/loggedUsers', async (req, res, next) => {
  try {
    const allUsers = await getAllUsers();
    const loggedUsers = allUsers.filter(user => loggedUsersCache.indexOf(user.id) > -1);
    res.json(loggedUsers);
  } catch(err) {
    next(getError(err));
  }
});

// Get all users
app.get('/users', async (req, res, next) => {
  try {
    const allUsers = await getAllUsers();
    res.json(allUsers);
  } catch(err) {
    next(getError(err));
  }
});

// Post message
app.post('/message', async (req, res, next) => {
  try {
    const msg = req.body;
    const dto = fromDTO(msg);
    dto.id = (await insertMessage(dto))[0].id;
    wsServer.clients.forEach((client => {
      if(client.readyState === ws.OPEN) {
        client.send(JSON.stringify(toDTO(dto)));
      }
    }));
    res.json(dto.id);
  } catch (err) {
    next(getError(err));
  }
});

// Get all messages
app.get('/messages', async (req, res, next) => {
  try {
    const allMessages = await getMessages();
    res.json(allMessages.map(toDTO));
  } catch(err) {
    next(getError(err));
  }
});

// *** UTILITIES *** //

function getError(err) {
  if(!!err.message)
    return err.message;
  else
    return err;
}
