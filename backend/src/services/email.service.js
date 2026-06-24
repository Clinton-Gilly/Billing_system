const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'Xuremi Net <noreply@xureminet.com>';

class EmailService {
  async sendReceiptEmail(to, { username, password, packageName, expiresAt }) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background-color: #0A1628; color: #06B6D4; padding: 16px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Xuremi Net</h1>
        </div>
        <div style="padding: 24px 0;">
          <h2 style="color: #0A1628; font-size: 20px; margin-top: 0;">🎉 Your Internet is Active!</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Here are your connection details for the <strong>${packageName}</strong> package:</p>
          
          <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
            <tbody>
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold; width: 40%; color: #374151;">Username</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827;">${username}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold; width: 40%; color: #374151;">Password</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827;">${password}</td>
              </tr>
              <tr>
                <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #f9fafb; font-weight: bold; width: 40%; color: #374151;">Expires At</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827;">${new Date(expiresAt).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Connect to the hotspot Wi-Fi network and enter these credentials to start browsing.</p>
          
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; text-align: center;">
            Need help? Contact our support team at <a href="mailto:support@xuremi.net" style="color: #06B6D4; text-decoration: none;">support@xuremi.net</a>
          </div>
        </div>
      </div>
    `;

    return resend.emails.send({
      from: FROM,
      to,
      subject: 'Your Xuremi Net Internet is Active',
      html,
    });
  }

  async sendExpiryWarningEmail(to, { username, expiresAt }) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background-color: #0A1628; color: #06B6D4; padding: 16px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Xuremi Net</h1>
        </div>
        <div style="padding: 24px 0;">
          <h2 style="color: #0A1628; font-size: 20px; margin-top: 0;">⏳ Your session expires soon</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Hello,</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">Your current internet session for user <strong>${username}</strong> is set to expire at <strong>${new Date(expiresAt).toLocaleString()}</strong>.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal" style="background-color: #06B6D4; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Renew Now</a>
          </div>
          
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; text-align: center;">
            Need help? Contact our support team at <a href="mailto:support@xuremi.net" style="color: #06B6D4; text-decoration: none;">support@xuremi.net</a>
          </div>
        </div>
      </div>
    `;

    return resend.emails.send({
      from: FROM,
      to,
      subject: 'Your session expires soon',
      html,
    });
  }

  async sendWelcomeEmail(to, { name }) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <div style="background-color: #0A1628; color: #06B6D4; padding: 16px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Xuremi Net</h1>
        </div>
        <div style="padding: 24px 0;">
          <h2 style="color: #0A1628; font-size: 20px; margin-top: 0;">👋 Welcome to Xuremi Net, ${name}!</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">We're thrilled to have you on board.</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.5;">With Xuremi Net, you can easily purchase fast and reliable hotspot packages to stay connected when you need it most.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal" style="background-color: #06B6D4; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Access Your Portal</a>
          </div>
          
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; text-align: center;">
            Need help? Contact our support team at <a href="mailto:support@xuremi.net" style="color: #06B6D4; text-decoration: none;">support@xuremi.net</a>
          </div>
        </div>
      </div>
    `;

    return resend.emails.send({
      from: FROM,
      to,
      subject: 'Welcome to Xuremi Net!',
      html,
    });
  }
}

module.exports = new EmailService();
