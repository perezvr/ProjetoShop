import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    const isProvider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    // Validando se o userId é realmente de um prestador de serviço
    if (!isProvider)
      return res
        .status(401)
        .json({ error: 'Only providers can load notifications' });

    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        read: true,
      },
      /**
       * Necessário informar o new: true para devolver o registro já atualizado
      para o notifications
       */
      { new: true }
    );

    return res.json(notification);
  }
}

export default new NotificationController();
