import formData from 'form-data';
import Mailgun from 'mailgun.js';

class EmailService {
  constructor() {
    this.isConfigured = false;
    this.mailgun = null;
    this.domain = null;
    this.from = null;

    // Solo inicializar si están configuradas las variables de entorno
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      const mailgun = new Mailgun(formData);
      this.mailgun = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
      });
      this.domain = process.env.MAILGUN_DOMAIN;
      this.from = process.env.MAILGUN_FROM_EMAIL || `noreply@${process.env.MAILGUN_DOMAIN}`;
      this.isConfigured = true;
      console.log('✉️  Mailgun configurado correctamente');
    } else {
      console.log('⚠️  Mailgun no configurado - las notificaciones por email están deshabilitadas');
    }
  }

  async sendEmail({ to, subject, text, html }) {
    if (!this.isConfigured) {
      console.log('📧 Email no enviado (Mailgun no configurado):', { to, subject });
      return { success: false, reason: 'not_configured' };
    }

    try {
      const messageData = {
        from: this.from,
        to,
        subject,
        text,
        html: html || text,
      };

      const response = await this.mailgun.messages.create(this.domain, messageData);
      console.log('✅ Email enviado a:', to, '- ID:', response.id);
      return { success: true, messageId: response.id };
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendVerificationEmail({ to, name, token }) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

    const subject = '¡Bienvenido! Verifica tu correo electrónico';

    const text = `
Hola ${name},

¡Bienvenido a Regalo Anónimo Familiar!

Para poder agregar regalos a tu lista de deseos, necesitas verificar tu correo electrónico.

Haz clic en el siguiente enlace para verificar tu cuenta:
${verificationUrl}

Este enlace expirará en 24 horas.

Si no creaste esta cuenta, puedes ignorar este correo.

¡Gracias!
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎁 Regalo Anónimo Familiar</h1>
    </div>
    <div class="content">
      <h2>¡Hola ${name}!</h2>
      <p>¡Bienvenido a Regalo Anónimo Familiar! Estamos emocionados de tenerte con nosotros.</p>
      <p>Para poder agregar regalos a tu lista de deseos, necesitas verificar tu correo electrónico.</p>
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">Verificar mi correo</a>
      </div>
      <p style="font-size: 12px; color: #666;">
        O copia y pega este enlace en tu navegador:<br>
        <a href="${verificationUrl}">${verificationUrl}</a>
      </p>
      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
        Este enlace expirará en 24 horas. Si no creaste esta cuenta, puedes ignorar este correo.
      </p>
    </div>
    <div class="footer">
      <p>Regalo Anónimo Familiar - Comparte la magia de dar</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return await this.sendEmail({ to, subject, text, html });
  }

  async sendGiftChangeNotification({ to, name, giftName, action, groupName }) {
    const actionText = action === 'updated' ? 'MODIFICADO' : 'ELIMINADO';
    const emoji = action === 'updated' ? '✏️' : '🗑️';

    const subject = `¡Atención! Un regalo que compraste fue ${actionText.toLowerCase()}`;

    const text = `
Hola ${name},

${emoji} El regalo "${giftName}" del grupo "${groupName}" que habías comprado ha sido ${actionText} por el solicitante.

Te recomendamos revisar la lista de deseos para ver si hay cambios importantes.

Saludos,
Regalo Anónimo Familiar
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${action === 'updated' ? '#f59e0b' : '#ef4444'}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    .gift-name { font-weight: bold; color: #667eea; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${emoji} ¡Atención!</h1>
    </div>
    <div class="content">
      <h2>Hola ${name},</h2>
      <div class="alert">
        <p>El regalo <span class="gift-name">"${giftName}"</span> del grupo <strong>"${groupName}"</strong> que habías comprado ha sido <strong>${actionText}</strong> por el solicitante.</p>
      </div>
      <p>Te recomendamos revisar la lista de deseos para ver si hay cambios importantes.</p>
      <p style="margin-top: 30px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/groups" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
          Ver mis grupos
        </a>
      </p>
    </div>
    <div class="footer">
      <p>Regalo Anónimo Familiar - Comparte la magia de dar</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return await this.sendEmail({ to, subject, text, html });
  }

  async sendEventDateNotification({ to, name, groupName, eventDate, eventType }) {
    const subject = `🎉 ¡Ha llegado el día! ${groupName}`;

    const text = `
Hola ${name},

🎉 ¡Ha llegado la fecha del evento "${groupName}"!

Tipo de celebración: ${eventType}
Fecha: ${new Date(eventDate).toLocaleDateString('es-ES')}

Ya puedes ver la lista de deseos completa y los regalos que otros miembros están pidiendo.

¡Esperamos que disfrutes de esta celebración!

Saludos,
Regalo Anónimo Familiar
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .celebration { background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; margin: 20px 0; text-align: center; }
    .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ¡Ha llegado el día!</h1>
    </div>
    <div class="content">
      <h2>Hola ${name},</h2>
      <p>¡Ha llegado la fecha del evento <strong>"${groupName}"</strong>!</p>
      <div class="celebration">
        <h3 style="color: #667eea; margin: 0;">📅 ${eventType}</h3>
        <p style="font-size: 18px; margin: 10px 0;">${new Date(eventDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <p>Ya puedes ver la lista de deseos completa y los regalos que otros miembros están pidiendo.</p>
      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/groups" class="button">Ver lista de deseos</a>
      </div>
      <p style="margin-top: 30px; text-align: center;">¡Esperamos que disfrutes de esta celebración! 🎁</p>
    </div>
    <div class="footer">
      <p>Regalo Anónimo Familiar - Comparte la magia de dar</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return await this.sendEmail({ to, subject, text, html });
  }
}

// Singleton instance
const emailService = new EmailService();
export default emailService;
