const { response, request } = require('express');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
// CONFIG
const { handlebarOptions } = require('../config/handlebar');
// HELPERS
const { destructureKeyValue } = require('../helpers/destructureKeyValue');

const { NAME_FROM, SERVICE_EMAIL_FROM, SERVICE_GSECRET_KEY, CONTACT_EMAIL_FROM, CONTACT_GSECRET_KEY } = process.env;


const deliverEmail = async (req = request, res = response) => {

  const { formType, email: emailToSend } = req.params,
    { body } = req,
    isProductForm = formType === 'product',
    currEmailFrom = isProductForm ? SERVICE_EMAIL_FROM : CONTACT_EMAIL_FROM;

  let subjectMail = '',
    responseUserSubject = '',
    messageRespUser = '',
    mssgMail2 = 'Le contactaremos a la mayor brevedad posible.',
    [headersTable, cellsTable] = destructureKeyValue(body);

  headersTable = headersTable.map((prop) => prop.replaceAll('-', ' ').toUpperCase());

  switch (formType) {
    case 'contact':
      subjectMail = `Nuevo mensaje de contacto de ${body.nombre} ${body.apellido}`;

      responseUserSubject = `Hemos recibido su mensaje, ${body.nombre}`;
      messageRespUser = 'Muchas gracias por contactarnos.';
      mssgMail2 = 'Le daremos respuesta a la mayor brevedad posible.';
      break;

    case 'join':
      subjectMail = `ENTRENAMIENTO: ${body.nombre} ${body.apellido} está interesado(a) en el curso de asesores`;

      responseUserSubject = `Gracias por interesarte en nuestro entrenamiento de asesores, ${body.nombre}`;
      messageRespUser = 'Vemos que le interesa nuestro entrenamiento de asesores de Seguros. Estarás adentrándote en una carrera que genera un equilibrio social.';
      break;

    case 'product':
      subjectMail = `Nueva cotización de ${body['tipo-de-producto']} de ${body.nombre} ${body.apellido}`;

      responseUserSubject = `¡Gracias por preferirnos, ${body.nombre}!`;
      messageRespUser = `Hemos recibido su solicitud de cotización de ${body['tipo-de-producto']}.`;
      break;

    default:
      break;
  }

  const nodemailerConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: currEmailFrom,
      pass: isProductForm ? SERVICE_GSECRET_KEY : CONTACT_GSECRET_KEY,
    }
  }, quotationMsg = {
    from: `"${NAME_FROM}" <${currEmailFrom}>`,
    to: emailToSend,
    subject: subjectMail,
    template: 'quotation',
    context: {
      headersTable,
      cellsTable,
    },
  },
    contactMsg = {
      ...quotationMsg,
      subject: subjectMail,
      template: 'contact',
      context: {
        name: `${body.nombre} ${body.apellido}`,
        message: body['mensaje-de-contacto'],
        email: body.correo,
        phone: body.telefono,
      }
    },
    joinMsg = {
      ...quotationMsg,
      subject: subjectMail,
      template: 'joinTraining',
      context: {
        name: `${body.nombre} ${body.apellido}`,
        city: body.ciudad,
        email: body.correo,
      }
    },
    responseUser = {
      ...quotationMsg,
      to: body.correo,
      subject: responseUserSubject,
      template: 'responseUser',
      context: {
        message: messageRespUser,
        message2: mssgMail2,
      },
    };


  const transport = nodemailer.createTransport(nodemailerConfig),
    msgToSendObj = formType === 'product' ? quotationMsg :
      formType === 'join' ? joinMsg : contactMsg;

  transport.use('compile', hbs(handlebarOptions));

  try {
    // Receive website form
    await transport.sendMail(msgToSendObj);

    // Send automatic response to the user
    await transport.sendMail(responseUser);

    res.json({
      msg: 'El correo fue enviado correctamente.'
    });

  } catch (error) {
    console.log('error: ', error);
    console.log('body: ', body);

    return res.status(500).json({
      err: 'Error interno del servidor. Si el error persiste, por favor contáctanos por otros medios disponibles.'
    });
  };

};

module.exports = {
  deliverEmail,
};