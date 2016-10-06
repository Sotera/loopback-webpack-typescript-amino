var _ = require('lodash'),
  jwt = require('jsonwebtoken');

module.exports = function enableAuthentication(server) {
  // enable (loopback) authentication
  server.enableAuth();

  var users = [{
    id: 1,
    username: 'bob',
    password: 'bob-password'
  }];

  function createToken(user) {
    try{
      var retVal = jwt.sign(_.omit(user, 'password'), 'my$ecret', {expiresIn: '1 days'});
      return retVal;
    }catch(e){
      console.log(e);
    }
  }

  server.post('/users', function (req, res) {
    if (!req.body.username || !req.body.password) {
      return res.status(400).send("You must send the username and the password");
    }
    if (_.find(users, {username: req.body.username})) {
      return res.status(400).send("A user with that username already exists");
    }

    var profile = _.pick(req.body, 'username', 'password', 'extra');
    profile.id = _.max(users, 'id').id + 1;

    users.push(profile);

    res.status(201).send({
      id_token: createToken(profile)
    });
  });

  server.post('/sessions/create', function (req, res) {
    if (!req.body.username || !req.body.password) {
      return res.status(400).send("You must send the username and the password");
    }

    var user = _.find(users, {username: req.body.username});
    if (!user) {
      return res.status(401).send("The username or password don't match");
    }

    if (!(user.password === req.body.password)) {
      return res.status(401).send("The username or password don't match");
    }

    res.status(201).send({
      id_token: createToken(user)
    });
  });
};

