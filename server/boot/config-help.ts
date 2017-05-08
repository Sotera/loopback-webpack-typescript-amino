module.exports = function (server) {
  server.get('/config', function (req, res) {
    return res.status(200).send('How Now Brown Cow');
  });
};
