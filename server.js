const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json())

const database = {
  users: [
    {
      id: '123',
      fullName: 'Fernando Cavenaghi',
      username: 'fc9',
      password: 'tecogimoeneuropa',
      mail: 'fcavegol@carp.com.ar',
      entries: 0,
      joined: new Date()
    },
    {
      id: '124',
      fullName: 'uRi',
      username: 'uRi',
      password: '123',
      mail: 'theuri@lalala.com',
      entries: 0,
      joined: new Date()
    }
  ]
}

app.get('/', (req, res) => {
  res.json('This is working')
});

app.post('/signin', (req, res) => {
  console.log(req.body)
  const { username, password } = req.body;
  const foundUser = database.users.find(user => {
    return user.username === username 
      && user.password === password
  });
  foundUser ? res.json(foundUser) : res.json('User not found');
})

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