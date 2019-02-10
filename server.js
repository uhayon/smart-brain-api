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
      mail: 'fcavegol@carp.com.ar',
      entries: 0,
      joined: new Date()
    },
    {
      id: '124',
      fullName: 'uRi',
      username: 'uRi',
      mail: 'theuri@lalala.com',
      entries: 0,
      joined: new Date()
    }
  ],
  login: [
    {
      id: '123',
      hash: '$2a$10$7lLx5lhjB30EQR759VbB/OtWTS2hWYtSp4mjoxfA26fWWKCwkns2a',
      mail: 'fcavegol@carp.com.ar'
    },
    {
      id: '124',
      hash: '$2a$10$7lLx5lhjB30EQR759VbB/OtWTS2hWYtSp4mjoxfA26fWWKCwkns2a',
      mail: 'theuri@lalala.com'
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
  if (foundUser) {
    const userLoginData = database.login.find(userLoginData => userLoginData.mail === foundUser.mail);
    foundUser = bcrypt.compareSync(password, userLoginData.hash) ? foundUser : false;
  }

  // const foundUser = database.users.find(user => {
  //   return user.username === username 
  //     && user.password === password
  // });
  foundUser ? res.json(foundUser) : res.status(400).json('User not found'); 
})

app.post('/register', (req, res) => {
  const { fullName, username, mail, password } = req.body;
  bcrypt.hash(password, null, null, (err, hash) => {
    const id = (++database.currentUserId).toString();
    database.users.push({
      id,
      fullName,
      username,
      mail,
      entries: 0,
      joined: new Date(),
      ...req.body
    });

    database.login.push({
      id,
      hash,
      mail
    })
  });

  res.json(database.users[database.users.length - 1]);
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

/*

/ --> res = this is working
/signin --> POST = success/fail
/signup --> POST = user
/profile/:userId --> GET = user
/image --> PUT = user


*/