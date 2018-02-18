const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');

const app = express();


app.set('port', (process.env.NODE_PORT || 8000));
app.use(serveStatic(path.join(__dirname, '/dist')));
app.listen(app.get('port'), (err) => {
  if (err) {
    console.log(err);
  }
  console.info('==> Listening on port %s.', app.get('port'));
});
