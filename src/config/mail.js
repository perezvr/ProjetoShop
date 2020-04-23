/**
 * Definindo as propriedades do servidor SMTP para o envio de emails
 */
export default {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  default: {
    from: 'Equipe Gobarber <perez.vr@gmail.com>',
  },
};
