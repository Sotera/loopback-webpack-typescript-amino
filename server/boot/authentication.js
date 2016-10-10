var _ = require('lodash'),
  jwt = require('jsonwebtoken');

module.exports = function enableAuthentication(server) {
  // enable (loopback) authentication
  server.enableAuth();

  var AminoUser = server.models.AminoUser;

  function createToken(user) {
    try {
      var retVal = jwt.sign(_.omit(user, 'password'), 'my$ecret', {expiresIn: '1 days'});
      return retVal;
    } catch (e) {
      console.log(e);
    }
  }

  server.post('/auth/register', function (req, res) {
    var newUser = req.body;
    AminoUser.create(newUser, (err, models)=> {
      if (err) {
        return res.status(200).send({status: 'error', err});
      }
      res.status(200).send({status: 'OK', models});
    });
  });

  server.post('/auth/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if (!username || !password) {
      return res.status(200).send({status: 'error', error: new Error('Please provide username and password')});
    }

    AminoUser.login({username, password}, (err, loopbackToken)=> {
      if (err) {
        return res.status(200).send({status: 'error', err});
      }
      var userInfo = 'user stuff';
      res.status(201).send({
        status: 'OK',
        userInfo,
        jwtToken: createToken(userInfo),
        loopbackToken
      });
    });
  });
};

