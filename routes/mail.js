const { Router } = require('express');
const { param, body } = require('express-validator');
// CONTROLLERS
const { deliverEmail } = require('../controllers/mail');
// MIDDLEWARES
const { validateFields } = require('../middlewares/validateFields');

const router = Router();

router.post('/:formType/:email', [
  param('formType', 'El parámetro del tipo de formulario es obligatorio').notEmpty(),
  param('email', 'El correo es obligatorio').notEmpty(),
  param('email', 'El correo no es válido').isEmail(),
  body('correo', 'El correo del formulario es obligatorio').notEmpty(),
  body('correo', 'El correo del formulario no es válido').isEmail(),
  validateFields
], deliverEmail);

module.exports = router;