import nodemailer from 'nodemailer';
import exphbs from 'express-handlebars';
import nodemailerhbs from 'nodemailer-express-handlebars';
import { resolve } from 'path';
import mailconfig from '../config/mail';

class Mail {
  constructor() {
    const { host, port, secure, auth } = mailconfig;

    // Criando a conexão do servidor de email para o nodemailer
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      // Verificando se há a necessidade de autenticação para o envio do email
      auth: auth.user ? auth : null,
    });

    this.configureTemplates();
  }

  configureTemplates() {
    const viewPath = resolve(__dirname, '..', 'app', 'views', 'emails');

    this.transporter.use(
      'compile',
      nodemailerhbs({
        viewEngine: exphbs.create({
          layoutsDir: resolve(viewPath, 'layouts'),
          partialsDir: resolve(viewPath, 'partials'),
          defaultLayout: 'default',
          extname: '.hbs',
        }),
        viewPath,
        extName: '.hbs',
      })
    );
  }

  sendMail(message) {
    return this.transporter.sendMail({
      // Definindo o remetente
      ...mailconfig.default,
      // Definindo a mensagem
      ...message,
    });
  }
}

export default new Mail();
