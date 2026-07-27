const { response, request } = require('express');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
// CONFIG
const { handlebarOptions } = require('../config/handlebar');
// HELPERS
const { formatKeyValue } = require('../helpers/formatKeyValue');
const { getRegionByState, OCCIDENTE } = require('../helpers/region');

const {
  NAME_FROM,
  SERVICE_EMAIL_FROM_ORIENTE, SERVICE_GSECRET_KEY_ORIENTE,
  SERVICE_EMAIL_FROM_OCCIDENTE, SERVICE_GSECRET_KEY_OCCIDENTE,
  CONTACT_EMAIL_FROM, CONTACT_GSECRET_KEY,
} = process.env;


const deliverEmail = async (req = request, res = response) => {

  const { formType } = req.params,
    { body } = req;

  const isContactForm = formType === 'contact';

  // La región se deriva del estado enviado en el formulario (nunca de un dato
  // que el cliente pudiera manipular directamente) para elegir la cuenta de
  // Gmail correcta con la que se autentica y envía el correo de cotización.
  const isOccidente = !isContactForm && getRegionByState(body.estado) === OCCIDENTE;

  const currEmailFrom = isContactForm
    ? CONTACT_EMAIL_FROM
    : isOccidente
      ? SERVICE_EMAIL_FROM_OCCIDENTE
      : SERVICE_EMAIL_FROM_ORIENTE;

  const currGsecretKey = isContactForm
    ? CONTACT_GSECRET_KEY
    : isOccidente
      ? SERVICE_GSECRET_KEY_OCCIDENTE
      : SERVICE_GSECRET_KEY_ORIENTE;

  let data = formatKeyValue(body);

  const nodemailerConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: currEmailFrom,
      pass: currGsecretKey,
    }
  }, quotationMsg = {
    from: `"${NAME_FROM}" <${currEmailFrom}>`,
    // El destino se resuelve siempre en el backend (currEmailFrom), nunca a partir de
    // un valor que llegue del cliente, para evitar que la ruta se use como relay abierto.
    to: currEmailFrom,
    subject: `Nueva cotización de ${body['tipo-de-producto']} de ${body.nombre} ${body.apellido}`,
    template: 'quotation',
    context: {
      data,
    },
  },
    contactMsg = {
      ...quotationMsg,
      subject: `Nuevo mensaje de contacto de ${body.nombre} ${body.apellido}`,
      template: 'contact',
      context: {
        name: `${body.nombre} ${body.apellido}`,
        message: body['mensaje-de-contacto'],
        email: body.correo,
        phone: body.telefono
      }
    },
    responseUser = {
      ...quotationMsg,
      to: body.correo,
      subject: isContactForm ? `Hemos recibido su mensaje, ${body.nombre}` : `¡Gracias por preferirnos, ${body.nombre}!`,
      template: 'responseUser',
      context: {
        message: isContactForm ? 'Muchas gracias por contactarnos.' : `Hemos recibido su solicitud de cotización de ${body['tipo-de-producto']}.`,
      }
    };


  const transport = nodemailer.createTransport(nodemailerConfig);

  transport.use('compile', hbs(handlebarOptions));

  try {
    // Receive website form
    await transport.sendMail(isContactForm ? contactMsg : quotationMsg);

    // Send automatic response to the user
    await transport.sendMail(responseUser);

    res.json({
      msg: 'El correo fue enviado correctamente'
    });

  } catch (error) {
    console.log('error:', error);
    console.log('body:', body);

    return res.status(500).json({
      err: 'Error interno del servidor. Si el error persiste, por favor contáctanos por otros medios disponibles'
    });
  }

};

module.exports = {
  deliverEmail,
};