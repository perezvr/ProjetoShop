import * as Yup from 'yup';
// Funções de manipulação de data
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';

class AppointmentController {
  async index(req, res) {
    // Definindo a paginação da query => 1 é o valor default quando o 'page' não
    // é informado
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      // Ordenação da query
      order: ['date'],
      // Selecionando somente os atributos necessários
      attributes: ['id', 'date'],
      // Limite por página
      limit: 20,
      // Definindo o skip para paginação
      offset: (page - 1) * 20,
      // Join com provider
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          // Join com File (avatar)
          include: [
            {
              model: File,
              as: 'avatar',
              // O campo virtual 'url', necessita do 'path' para, no seu método
              // de get, conseguir montar a rota necessária para carregar o
              // arquivo
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    // Definindo o schema de validação do appointment
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    // Validando o shcema
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { provider_id, date } = req.body;

    if (provider_id === req.userId)
      return res
        .status(400)
        .json({ error: 'You cannot create an appointment to yourself' });

    // Buscando um provider
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    // Validando se o provider_id é realmente de um prestador de serviço
    if (!isProvider)
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });

    // Manipula o date. => startOfHour pega a data com somente a hora, deixando
    // de lado minutos e segundos
    const hourStart = startOfHour(parseISO(date));

    // New Date() => Retorna a data/hora atual
    // Validação não permite que sejam criados appointments com datas já
    // passadas
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    // Só é permitido um agendamento por hora.
    // Caso exista um appointment para o provider, não cancelado e na hora
    // solicitada, o appointment não é permitido
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    // Validando appointment marcado na mesma data
    if (checkAvailability)
      return res
        .status(400)
        .json({ error: 'Appointment date is not avaliable' });

    // Gravando o appointment no db
    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    // Crindo notificação para prestador de serviço

    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.canceled_at)
      return res
        .status(400)
        .json({ error: 'This appointment is already cancelled' });

    if (appointment.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'You dont have permission to cancel this appointment' });
    }

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel appointments with 2 hours in advance',
      });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await Mail.sendMail({
      to: `${appointment.provider.name} ${appointment.provider.email}`,
      subject: 'Agendamento cancelado',
      template: 'cancellation',
      context: {
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(appointment.date, "'dia' dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
      },
    });

    return res.json(appointment);
  }
}

export default new AppointmentController();
