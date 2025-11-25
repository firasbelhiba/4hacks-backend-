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
            If you didn't ask for this, just ignore the message.
          </p>

        </div>
      </body>
    </html>
  `;
};

export const PasswordResetEmailTemplateHtml = (
  resetLink: string,
  email: string,
  expirationMinutes = 15,
) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
        <div style="max-width: 600px; margin: auto; background-color: #f9fafb; padding: 24px; border-radius: 8px;">
          <h2 style="color: #3b82f6; margin-bottom: 16px;">
            Password Reset Request
          </h2>

          <p style="margin: 0 0 16px 0;">
            Hey ${email},
          </p>

          <p style="margin: 0 0 16px 0;">
            We received a request to reset your password. Click the button below to reset it:
          </p>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetLink}" 
               style="
                 background-color: #3b82f6;
                 color: white;
                 padding: 12px 32px;
                 text-decoration: none;
                 border-radius: 6px;
                 display: inline-block;
                 font-weight: bold;
               ">
              Reset Password
            </a>
          </div>

          <p style="margin: 16px 0; font-size: 14px; color: #666;">
            Or copy and paste this link into your browser:
          </p>
          
          <p style="
            margin: 0 0 24px 0;
            padding: 12px;
            background-color: #fff;
            border-radius: 4px;
            word-break: break-all;
            font-size: 13px;
            color: #3b82f6;
          ">
            ${resetLink}
          </p>

          <p style="margin: 24px 0 8px 0; font-size: 14px; color: #666;">
            This link will expire in ${expirationMinutes} minutes.
          </p>

          <p style="margin: 0; font-size: 14px; color: #666;">
            If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </p>

        </div>
      </body>
    </html>
  `;
};

export const PasswordChangedEmailTemplateHtml = (email: string) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
        <div style="max-width: 600px; margin: auto; background-color: #f9fafb; padding: 24px; border-radius: 8px;">
          <h2 style="color: #10b981; margin-bottom: 16px;">
            Password Changed Successfully
          </h2>

          <p style="margin: 0 0 16px 0;">
            Hey ${email},
          </p>

          <p style="margin: 0 0 16px 0;">
            Your password has been successfully changed. You can now log in with your new password.
          </p>

          <p style="margin: 16px 0; font-size: 14px; color: #666;">
            For your security, all active sessions have been logged out. Please log in again with your new password.
          </p>

          <p style="margin: 24px 0 0 0; font-size: 14px; color: #666;">
            If you didn't make this change, please contact our support team immediately.
          </p>

        </div>
      </body>
    </html>
  `;
};

export const TwoFactorEmailCodeTemplateHtml = (
  code: string,
  action: 'enable' | 'disable' | 'login',
) => {
  const actionText =
    action === 'login'
      ? 'complete your login'
      : action === 'enable'
        ? 'enable two-factor authentication'
        : 'disable two-factor authentication';

  return `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
        <div style="max-width: 480px; margin: auto;">
          <h2 style="color: #3b82f6; margin-bottom: 16px;">
            2FA Verification Code
          </h2>

          <p style="margin: 0 0 12px 0;">
            Use the following code to ${actionText} on 4Hacks:
          </p>

          <div style="
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 6px;
            padding: 12px 0;
          ">
            ${code}
          </div>

          <p style="margin: 0 0 12px 0;">
            This code expires in 5 minutes.
          </p>

          <p style="margin: 24px 0 0 0; font-size: 14px; color: #666;">
            If you did not request this code, you can safely ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;
};

export const AccountDisableVerificationEmailTemplateHtml = (
  code: string,
) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
        <div style="max-width: 480px; margin: auto;">
          <h2 style="color: #ef4444; margin-bottom: 16px;">
            Confirm Account Disable
          </h2>

          <p style="margin: 0 0 12px 0;">
            Use the following code to confirm you want to disable your 4Hacks account:
          </p>

          <div style="
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 6px;
            padding: 12px 0;
          ">
            ${code}
          </div>

          <p style="margin: 0 0 12px 0;">
            This code expires in 5 minutes. Once confirmed, your account will be disabled and you will be logged out of all sessions.
          </p>

          <p style="margin: 24px 0 0 0; font-size: 14px; color: #666;">
            If you did not request to disable your account, you can safely ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;
};

export const AccountDisabledEmailTemplateHtml = (
  email: string,
  reason?: string,
) => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; color: #222;">
        <div style="max-width: 600px; margin: auto; background-color: #f9fafb; padding: 24px; border-radius: 8px;">
          <h2 style="color: #ef4444; margin-bottom: 16px;">
            Account Disabled
          </h2>

          <p style="margin: 0 0 16px 0;">
            Hey ${email},
          </p>

          <p style="margin: 0 0 16px 0;">
            Your 4Hacks account has been successfully disabled. You will no longer be able to log in or access your account.
          </p>

          ${reason ? `
          <p style="margin: 0 0 16px 0; padding: 12px; background-color: #fff; border-radius: 4px;">
            <strong>Reason provided:</strong> ${reason}
          </p>
          ` : ''}

          <p style="margin: 16px 0; font-size: 14px; color: #666;">
            For your security, all active sessions have been logged out. If you did not disable your account, please contact our support team immediately.
          </p>

          <p style="margin: 24px 0 0 0; font-size: 14px; color: #666;">
            If you change your mind and want to reactivate your account, please contact our support team.
          </p>

        </div>
      </body>
    </html>
  `;
};
