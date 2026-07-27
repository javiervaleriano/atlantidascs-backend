const { Router } = require('express');
const { param, body } = require('express-validator');
// CONTROLLERS
const { deliverEmail } = require('../controllers/mail');
// HELPERS
const { VALID_STATES } = require('../helpers/region');
// MIDDLEWARES
const { validateFields } = require('../middlewares/validateFields');

const router = Router();

router.post('/:formType/:email', [
  param('formType', 'El parámetro del tipo de formulario es obligatorio').notEmpty(),
  param('email', 'El correo es obligatorio').notEmpty(),
  param('email', 'El correo no es válido').isEmail(),
  body('correo', 'El correo del formulario es obligatorio').notEmpty(),
  body('correo', 'El correo del formulario no es válido').isEmail(),
  // El estado solo aplica a cotizaciones de producto (no al formulario de contacto);
  // se exige y se limita a los 24 estados válidos para que el backend nunca tenga
  // que adivinar (ni asumir Oriente por defecto) la región de una cotización.
  body('estado')
    .if((value, { req }) => req.params.formType !== 'contact')
    .notEmpty().withMessage('El estado es obligatorio para cotizaciones')
    .bail()
    .isIn(VALID_STATES).withMessage('El estado no es válido'),
  validateFields
], deliverEmail);

module.exports = router;