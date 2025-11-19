export const VerificationEmailTemplateHtml = (code: number, email: string) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
        <div style="max-width: 480px; margin: auto;">
          <h2 style="color: #3b82f6; margin-bottom: 16px;">
            4Hacks Email Verification
          </h2>

          <p style="margin: 0 0 12px 0;">
            Hey ${email},
          </p>

          <p style="margin: 0 0 12px 0;">
            Here is your verification code:
          </p>

          <div style="
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 4px;
            padding: 12px 0;
          ">
            ${code}
          </div>

          <p style="margin: 16px 0;">
            Enter this code in the app to verify your email.
          </p>

          <p style="margin: 24px 0 0 0; font-size: 14px; color: #666;">
            If you didn’t ask for this, just ignore the message.
          </p>

        </div>
      </body>
    </html>
  `;
};
