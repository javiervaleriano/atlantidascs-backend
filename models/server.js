const express = require('express');
const cors = require('cors');

class Server {

  constructor() {
    this.app = express();
    this.port = process.env.PORT;

    this.whiteListCors = [
      'http://www.atlantidascs.com',
      'https://www.atlantidascs.com',
      'http://atlantidascs.com'
    ];

    this.paths = {
      mail: '/api/mail'
    };

    this.middlewares();

    this.routes();
  }

  routes() {
    this.app.use(this.paths.mail, require('../routes/mail'));
  }

  middlewares() {

    // CORS
    this.app.use(cors({
      origin: this.whiteListCors
    }));

    // Parse body JSON
    this.app.use(express.json());

    // Public directory
    this.app.use(express.static('public'));

  }

  listen() {
    this.app.listen(this.port, () => console.log(`Servidor corriendo en el puerto ${this.port}`));
  }

}

module.exports = Server;