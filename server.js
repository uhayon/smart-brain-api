const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require ('cors');

const app = express();
app.use(bodyParser.json());

app.use(cors());
// app.use(cors({
//   origin: (origin, callback) => {
//     if (origin === 'http://localhost:3001') {
//       callback(null, true);
//     } else {
//       callback('Not allowed by CORS')
//     }
//   }
// }))

const database = {
  currentUserId: 124,
  users: [
    {
      id: '123',
      fullName: 'Fernando Cavenaghi',
      username: 'fc9',
      entries: 0,
      joined: new Date()
    },
    {
      id: '124',
      fullName: 'uRi',
      username: 'uRi',
      entries: 0,
      joined: new Date()
    }
  ],
  login: [
    {
      id: '123',
      hash: '$2a$10$7lLx5lhjB30EQR759VbB/OtWTS2hWYtSp4mjoxfA26fWWKCwkns2a',
      username: 'fc9'
    },
    {
      id: '124',
      hash: '$2a$10$7lLx5lhjB30EQR759VbB/OtWTS2hWYtSp4mjoxfA26fWWKCwkns2a',
      username: 'uRi'
    }
  ]
}

const findUser = userId => {
  return database.users.find(user => user.id === userId);
}

app.get('/', (req, res) => {
  res.json(database.users);
});

app.post('/signin', (req, res) => {
  const { username, password } = req.body;
  let foundUser = database.users.find(user => user.username === username);
  const foundLogin = database.login.find(user => user.username === username);

  if (foundUser && foundLogin) {
    foundUser = bcrypt.compareSync(password, foundLogin.hash) ? foundUser : false;
  }

  foundUser ? res.json(foundUser) : res.status(404).json('User not found'); 
})

app.post('/signup', (req, res) => {
  const { fullName, username, password } = req.body;
  const existingUser = database.users.find(user => user.username === username);

  if (!existingUser) {
    bcrypt.hash(password, null, null, (err, hash) => {
      const id = (++database.currentUserId).toString();
      database.users.push({
        id,
        fullName,
        username,
        entries: 0,
        joined: new Date()
      });
  
      database.login.push({
        id,
        hash,
        username
      });
      res.json(database.users[database.users.length - 1]);
    });
  } else {
    res.status(400).send('The username is already taken');
  }

});

app.get('/profile/:id', (req, res) => {
  const { id } = req.params;
  const user = findUser(id);
  user ? res.json(user) : res.status(404).json('User not found');
});

app.put('/image', (req, res) => {
  const { id } = req.body;
  const user = findUser(id);

  if (user) {
    ++user.entries;
    res.json(user)
  } else {
    res.status(404).json('User not found')
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is running on port ${port}`)
});