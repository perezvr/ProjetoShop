import mongoose from 'mongoose';

/**
 * Criando schema para as notificações da aplicacao
 */
const NotificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: Number,
      required: true,
    },
    read: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    /**
     * Cria os campos created_at e updated_at automaticamente
     */
    timestamps: true,
  }
);

export default mongoose.model('Notification', NotificationSchema);
