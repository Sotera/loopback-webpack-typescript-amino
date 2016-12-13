var _ = require('lodash'), jwt = require('jsonwebtoken');
module.exports = function enableAuthentication(server) {
    server.enableAuth();
    var AminoUser = server.models.AminoUser;
    function createToken(user) {
        try {
            var retVal = jwt.sign(_.omit(user, 'password'), 'my$ecret', { expiresIn: '15 minutes' });
            return retVal;
        }
        catch (e) {
            console.log(e);
        }
    }
    server.post('/auth/update-user-info', function (req, res) {
        var userInfo = req.body;
        AminoUser.findById(userInfo.id, (err, aminoUser) => {
            if (err) {
                return res.status(200).send({ status: 'error', error: err });
            }
            delete userInfo.id;
            aminoUser.updateAttributes(userInfo, (err, aminoUser) => {
                if (err) {
                    return res.status(200).send({ status: 'error', error: err });
                }
                return res.status(200).send({ status: 'OK', userInfo: aminoUser });
            });
        });
    });
    server.post('/auth/register', function (req, res) {
        var newUser = req.body;
        delete newUser.id;
        AminoUser.create(newUser, (err, models) => {
            if (err) {
                return res.status(200).send({ status: 'error', error: err });
            }
            return res.status(200).send({ status: 'OK', newUser: JSON.parse(models.json) });
        });
    });
    server.post('/auth/login', function (req, res) {
        var username = req.body.username;
        var password = req.body.password;
        if (!username || !password) {
            return res.status(200).send({ status: 'error', error: { message: 'Please provide username and password' } });
        }
        AminoUser.login({ username, password }, (err, loopbackToken) => {
            if (err) {
                return res.status(200).send({ status: 'error', error: err });
            }
            AminoUser.findById(loopbackToken.userId, (err, aminoUser) => {
                delete aminoUser.password;
                return res.status(201).send({
                    status: 'OK',
                    userInfo: aminoUser,
                    jwtToken: createToken({ username: aminoUser.username }),
                    loopbackToken
                });
            });
        });
    });
};
//# sourceMappingURL=authentication.js.map