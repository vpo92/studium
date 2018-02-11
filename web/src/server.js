const express = require('express');

const app = express();
const PORT = 3001;

app.use('/api/url', (req, res) => {
  res.send(process.env.API_URL);
});

app.use('/', express.static(__dirname));

app.listen(PORT, function() {
  console.log('Front app running on', PORT);
});
