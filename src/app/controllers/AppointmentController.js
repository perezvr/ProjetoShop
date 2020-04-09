import * as Yup from 'yup';
// Funções de manipulação de data
import { startOfHour, parseISO, isBefore } from 'date-fns';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

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

    return res.json(appointment);
  }
}

export default new AppointmentController();
