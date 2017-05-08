module.exports = function (server) {
  server.get('/auth/update-user-info', function (req, res) {
    return res.status(200).send('How Now Brown Cow');
  });
};
