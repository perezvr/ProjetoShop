import { startOfDay, endOfDay, parseISO } from 'date-fns';
// Importando os operadores do Sequelize
import { Op } from 'sequelize';

import Appointment from '../models/Appointment';
import User from '../models/User';

class ScheduleController {
  async index(req, res) {
    // Buscando se o usuário logado é realmente um provider
    const checkUserProvidr = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkUserProvidr) {
      return res.status(401).json({ error: 'User is not a provider' });
    }

    // Pegando a data para filtro do Schedule
    const { date } = req.query;
    // parse do date para formato Date do js
    const parsedDate = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        // Usuário logado
        provider_id: req.userId,
        // Não cancelados
        canceled_at: null,
        // Operação de 'between' para os appointments do dia
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
        },
      },
      order: ['date'],
    });

    return res.json(appointments);
  }
}

export default new ScheduleController();
