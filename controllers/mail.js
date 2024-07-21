const { response, request } = require('express');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
// CONFIG
const { handlebarOptions } = require('../config/handlebar');
// HELPERS
const { formatKeyValue } = require('../helpers/formatKeyValue');

const { NAME_FROM, SERVICE_EMAIL_FROM, SERVICE_GSECRET_KEY, CONTACT_EMAIL_FROM, CONTACT_GSECRET_KEY } = process.env;


const deliverEmail = async (req = request, res = response) => {

  const { formType, email: emailToSend } = req.params,
    { body } = req;

  const isContactForm = formType === 'contact',
    currEmailFrom = isContactForm ? CONTACT_EMAIL_FROM : SERVICE_EMAIL_FROM;

  let data = formatKeyValue(body);

  const nodemailerConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: currEmailFrom,
      pass: isContactForm ? CONTACT_GSECRET_KEY : SERVICE_GSECRET_KEY,
    }
  }, quotationMsg = {
    from: `"${NAME_FROM}" <${currEmailFrom}>`,
    to: emailToSend,
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