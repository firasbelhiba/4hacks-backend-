export const JudgeInvitationEmailTemplateHtml = (
  judgeName: string,
  inviterName: string,
  hackathonTitle: string,
  hackathonId: string,
  invitationId: string,
) => {
  const invitationLink = `${process.env.FRONTEND_URL || 'https://4hacks.io'}/hackathons/${hackathonId}/judge-invitations/${invitationId}`;

  return `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
              You're Invited to Judge!
            </h1>
            <p style="color: #fef3c7; margin: 12px 0 0 0; font-size: 16px;">
              ${hackathonTitle}
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${judgeName}</strong>,
            </p>

            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Great news! <strong>${inviterName}</strong> has invited you to be a judge for their hackathon.
            </p>

            <!-- Invitation Details Card -->
            <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 24px; margin: 30px 0; border-radius: 8px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #d97706; font-weight: 600;">
                Judge Invitation
              </h2>

              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;"><Æ Hackathon:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${hackathonTitle}</span>
              </div>

              <div>
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">=d Invited by:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${inviterName}</span>
              </div>
            </div>

            <!-- Action Required -->
            <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #92400e; font-weight: 600;">
                – What You'll Do as a Judge
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #78350f; line-height: 1.8;">
                <li>Review and evaluate project submissions</li>
                <li>Provide feedback to participants</li>
                <li>Help select the winning projects</li>
              </ul>
            </div>

            <p style="margin: 30px 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Click the button below to respond to this invitation:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationLink}"
                 style="
                   background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                   color: #ffffff;
                   padding: 16px 40px;
                   text-decoration: none;
                   border-radius: 8px;
                   display: inline-block;
                   font-weight: 600;
                   font-size: 16px;
                   box-shadow: 0 4px 6px rgba(245, 158, 11, 0.3);
                   transition: all 0.3s ease;
                 ">
                View Invitation
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
              color: #d97706;
              font-family: monospace;
            ">
              ${invitationLink}
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">
              Need help? Contact us at <a href="mailto:support@4hacks.io" style="color: #f59e0b; text-decoration: none;">support@4hacks.io</a>
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

export const JudgeInvitationAcceptedEmailTemplateHtml = (
  organizerName: string,
  judgeName: string,
  hackathonTitle: string,
  hackathonId: string,
) => {
  const hackathonLink = `${process.env.FRONTEND_URL || 'https://4hacks.io'}/hackathons/${hackathonId}`;

  return `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
              Judge Invitation Accepted!
            </h1>
            <p style="color: #d1fae5; margin: 12px 0 0 0; font-size: 16px;">
              Your judging panel is growing
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${organizerName}</strong>,
            </p>

            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Great news! <strong>${judgeName}</strong> has accepted your invitation to judge the hackathon.
            </p>

            <!-- Details Card -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 24px; margin: 30px 0; border-radius: 8px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #10b981; font-weight: 600;">
                ${hackathonTitle}
              </h2>

              <div>
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;"> New Judge:</span>
                <span style="color: #10b981; font-size: 14px; font-weight: 700;">${judgeName}</span>
              </div>
            </div>

            <p style="margin: 30px 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Click the button below to view your hackathon and manage your judging panel:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${hackathonLink}"
                 style="
                   background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                   color: #ffffff;
                   padding: 16px 40px;
                   text-decoration: none;
                   border-radius: 8px;
                   display: inline-block;
                   font-weight: 600;
                   font-size: 16px;
                   box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
                   transition: all 0.3s ease;
                 ">
                View Hackathon
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
              color: #10b981;
              font-family: monospace;
            ">
              ${hackathonLink}
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">
              Need help? Contact us at <a href="mailto:support@4hacks.io" style="color: #10b981; text-decoration: none;">support@4hacks.io</a>
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

export const JudgeInvitationDeclinedEmailTemplateHtml = (
  organizerName: string,
  judgeName: string,
  hackathonTitle: string,
  hackathonId: string,
) => {
  const hackathonLink = `${process.env.FRONTEND_URL || 'https://4hacks.io'}/hackathons/${hackathonId}`;

  return `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
              Judge Invitation Declined
            </h1>
            <p style="color: #e2e8f0; margin: 12px 0 0 0; font-size: 16px;">
              Invitation update
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${organizerName}</strong>,
            </p>

            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              <strong>${judgeName}</strong> has declined your invitation to judge the hackathon.
            </p>

            <!-- Details Card -->
            <div style="background-color: #f8fafc; border-left: 4px solid #64748b; padding: 24px; margin: 30px 0; border-radius: 8px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #64748b; font-weight: 600;">
                ${hackathonTitle}
              </h2>

              <div>
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">L Declined by:</span>
                <span style="color: #64748b; font-size: 14px; font-weight: 500;">${judgeName}</span>
              </div>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #92400e; font-weight: 600;">
                =¡ What's Next?
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #78350f; line-height: 1.8;">
                <li>Invite other qualified judges to your hackathon</li>
                <li>Browse the platform for potential judges</li>
                <li>Continue preparing your hackathon</li>
              </ul>
            </div>

            <p style="margin: 30px 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Click the button below to manage your hackathon:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${hackathonLink}"
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
                Manage Hackathon
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
              ${hackathonLink}
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
