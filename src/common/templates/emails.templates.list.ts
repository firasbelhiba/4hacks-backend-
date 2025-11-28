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
  action: 'enable' | 'disable' | 'login' | 'change-email',
) => {
  const actionText =
    action === 'login'
      ? 'complete your login'
      : action === 'enable'
        ? 'enable two-factor authentication'
        : action === 'disable'
          ? 'disable two-factor authentication'
          : 'change your email address';

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

export const HackathonRequestApprovedEmailTemplateHtml = (
  ownerName: string,
  hackathonTitle: string,
  hackathonSlug: string,
  organizationName: string,
  startDate: string,
  endDate: string,
  prizePool: number,
  prizeToken: string,
) => {
  const dashboardLink = `${process.env.FRONTEND_URL || 'https://4hacks.io'}/dashboard/hackathons/${hackathonSlug}`;
  const formattedPrizePool = new Intl.NumberFormat('en-US').format(prizePool);

  return `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
              🎉 Congratulations!
            </h1>
            <p style="color: #e0e7ff; margin: 12px 0 0 0; font-size: 16px;">
              Your Hackathon Request Has Been Approved
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${ownerName}</strong>,
            </p>

            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Great news! Your hackathon request for <strong>${organizationName}</strong> has been approved by the 4Hacks team. 🚀
            </p>

            <!-- Hackathon Details Card -->
            <div style="background-color: #f8fafc; border-left: 4px solid #667eea; padding: 24px; margin: 30px 0; border-radius: 8px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #667eea; font-weight: 600;">
                ${hackathonTitle}
              </h2>
              
              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 120px;">📅 Start Date:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${startDate}</span>
              </div>
              
              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 120px;">🏁 End Date:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${endDate}</span>
              </div>
              
              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 120px;">💰 Prize Pool:</span>
                <span style="color: #10b981; font-size: 16px; font-weight: 700;">${formattedPrizePool} ${prizeToken}</span>
              </div>
              
              <div>
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 120px;">🏢 Organization:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${organizationName}</span>
              </div>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #92400e; font-weight: 600;">
                📋 Next Steps
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #78350f; line-height: 1.8;">
                <li>Your hackathon is currently in <strong>DRAFT</strong> status</li>
                <li>Access your dashboard to complete the setup</li>
                <li>Add tracks, prizes, and detailed descriptions</li>
                <li>Configure judging criteria and team settings</li>
                <li>Publish when ready to start accepting registrations</li>
              </ul>
            </div>

            <p style="margin: 30px 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Click the button below to access your hackathon dashboard and complete the setup:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${dashboardLink}" 
                 style="
                   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                   color: #ffffff;
                   padding: 16px 40px;
                   text-decoration: none;
                   border-radius: 8px;
                   display: inline-block;
                   font-weight: 600;
                   font-size: 16px;
                   box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
                   transition: all 0.3s ease;
                 ">
                Go to Dashboard
              </a>
            </div>

            <p style="margin: 30px 0 0 0; font-size: 14px; color: #64748b; line-height: 1.6;">
              Or copy and paste this link into your browser:
            </p>
            
            <p style="
              margin: 8px 0 0 0;
              padding: 12px;
              background-color: #f8fafc;
              border-radius: 6px;
              word-break: break-all;
              font-size: 13px;
              color: #667eea;
              font-family: monospace;
            ">
              ${dashboardLink}
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">
              Need help? Contact us at <a href="mailto:support@4hacks.io" style="color: #667eea; text-decoration: none;">support@4hacks.io</a>
            </p>
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
              © 2025 4Hacks. All rights reserved.
            </p>
          </div>

        </div>
      </body>
    </html>
  `;
};

export const HackathonRequestRejectedEmailTemplateHtml = (
  ownerName: string,
  hackathonTitle: string,
  organizationName: string,
  rejectionReason: string,
  startDate: string,
  endDate: string,
) => {
  const contactLink = `${process.env.FRONTEND_URL || 'https://4hacks.io'}/contact`;
  const newRequestLink = `${process.env.FRONTEND_URL || 'https://4hacks.io'}/dashboard/hackathons/new`;

  return `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
              Hackathon Request Update
            </h1>
            <p style="color: #fecaca; margin: 12px 0 0 0; font-size: 16px;">
              Your Request Requires Additional Attention
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${ownerName}</strong>,
            </p>

            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Thank you for submitting your hackathon request for <strong>${organizationName}</strong>. After careful review, we're unable to approve your request at this time.
            </p>

            <!-- Hackathon Details Card -->
            <div style="background-color: #f8fafc; border-left: 4px solid #64748b; padding: 24px; margin: 30px 0; border-radius: 8px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #64748b; font-weight: 600;">
                ${hackathonTitle}
              </h2>
              
              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 120px;">📅 Start Date:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${startDate}</span>
              </div>
              
              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 120px;">🏁 End Date:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${endDate}</span>
              </div>
              
              <div>
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 120px;">🏢 Organization:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${organizationName}</span>
              </div>
            </div>

            <!-- Rejection Reason -->
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #991b1b; font-weight: 600;">
                📝 Feedback from Our Team
              </h3>
              <p style="margin: 0; color: #7f1d1d; line-height: 1.8; font-size: 15px;">
                ${rejectionReason}
              </p>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #065f46; font-weight: 600;">
                💡 What You Can Do Next
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #047857; line-height: 1.8;">
                <li>Review the feedback carefully</li>
                <li>Address the concerns mentioned above</li>
                <li>Submit a new request with the improvements</li>
                <li>Contact our support team if you need clarification</li>
              </ul>
            </div>

            <p style="margin: 30px 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              We're here to help you succeed! Don't hesitate to reach out if you have questions or need guidance.
            </p>

            <!-- CTA Buttons -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${newRequestLink}" 
                 style="
                   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                   color: #ffffff;
                   padding: 14px 32px;
                   text-decoration: none;
                   border-radius: 8px;
                   display: inline-block;
                   font-weight: 600;
                   font-size: 15px;
                   box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
                   margin: 0 8px 12px 8px;
                 ">
                Submit New Request
              </a>
              
              <a href="${contactLink}" 
                 style="
                   background-color: #f1f5f9;
                   color: #475569;
                   padding: 14px 32px;
                   text-decoration: none;
                   border-radius: 8px;
                   display: inline-block;
                   font-weight: 600;
                   font-size: 15px;
                   border: 2px solid #e2e8f0;
                   margin: 0 8px 12px 8px;
                 ">
                Contact Support
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">
              Questions? Reach out at <a href="mailto:support@4hacks.io" style="color: #667eea; text-decoration: none;">support@4hacks.io</a>
            </p>
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
              © 2025 4Hacks. All rights reserved.
            </p>
          </div>

        </div>
      </body>
    </html>
  `;
};
