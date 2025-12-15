export const TeamInvitationEmailTemplateHtml = (
  invitedUserName: string,
  inviterName: string,
  teamName: string,
  hackathonTitle: string,
  hackathonId: string,
  teamInvitationId: string,
) => {
  const invitationLink = `${process.env.FRONTEND_URL || 'https://4hacks.io'}/hackathons/${hackathonId}/teams/invitations/${teamInvitationId}`;

  return `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
              You're Invited!
            </h1>
            <p style="color: #e0e7ff; margin: 12px 0 0 0; font-size: 16px;">
              Join a Team for ${hackathonTitle}
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${invitedUserName}</strong>,
            </p>

            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Great news! <strong>${inviterName}</strong> has invited you to join their team for the hackathon.
            </p>

            <!-- Invitation Details Card -->
            <div style="background-color: #f8fafc; border-left: 4px solid #667eea; padding: 24px; margin: 30px 0; border-radius: 8px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #667eea; font-weight: 600;">
                ${teamName}
              </h2>

              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">🏆 Hackathon:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${hackathonTitle}</span>
              </div>

              <div>
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">👤 Invited by:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${inviterName}</span>
              </div>
            </div>

            <!-- Action Required -->
            <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #92400e; font-weight: 600;">
                📋 Action Required
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #78350f; line-height: 1.8;">
                <li>Log in to your 4Hacks account</li>
                <li>Go to your notifications or the hackathon page</li>
                <li>Accept or decline the team invitation</li>
              </ul>
            </div>

            <p style="margin: 30px 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Click the button below to view the hackathon and respond to the invitation:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationLink}"
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
              color: #667eea;
              font-family: monospace;
            ">
              ${invitationLink}
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

export const TeamInvitationAcceptedEmailTemplateHtml = (
  teamLeaderName: string,
  acceptedUserName: string,
  teamName: string,
  hackathonTitle: string,
  hackathonId: string,
  teamId: string,
) => {
  const teamLink = `${process.env.FRONTEND_URL || 'https://4hacks.io'}/hackathons/${hackathonId}/teams/${teamId}`;

  return `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
              Invitation Accepted!
            </h1>
            <p style="color: #d1fae5; margin: 12px 0 0 0; font-size: 16px;">
              Your team just got stronger
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${teamLeaderName}</strong>,
            </p>

            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Great news! <strong>${acceptedUserName}</strong> has accepted your invitation and joined your team.
            </p>

            <!-- Team Details Card -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 24px; margin: 30px 0; border-radius: 8px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #10b981; font-weight: 600;">
                ${teamName}
              </h2>

              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">🏆 Hackathon:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${hackathonTitle}</span>
              </div>

              <div>
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">✅ New Member:</span>
                <span style="color: #10b981; font-size: 14px; font-weight: 700;">${acceptedUserName}</span>
              </div>
            </div>

            <p style="margin: 30px 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Click the button below to view your team and start collaborating:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${teamLink}"
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
                View Team
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
              ${teamLink}
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

export const TeamInvitationDeclinedEmailTemplateHtml = (
  teamLeaderName: string,
  declinedUserName: string,
  teamName: string,
  hackathonTitle: string,
  hackathonId: string,
  teamId: string,
) => {
  const teamLink = `${process.env.FRONTEND_URL || 'https://4hacks.io'}/hackathons/${hackathonId}/teams/${teamId}`;

  return `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #64748b 0%, #475569 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
              Invitation Declined
            </h1>
            <p style="color: #e2e8f0; margin: 12px 0 0 0; font-size: 16px;">
              Team invitation update
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${teamLeaderName}</strong>,
            </p>

            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              <strong>${declinedUserName}</strong> has declined your invitation to join the team.
            </p>

            <!-- Team Details Card -->
            <div style="background-color: #f8fafc; border-left: 4px solid #64748b; padding: 24px; margin: 30px 0; border-radius: 8px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #64748b; font-weight: 600;">
                ${teamName}
              </h2>

              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">🏆 Hackathon:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${hackathonTitle}</span>
              </div>

              <div>
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">❌ Declined by:</span>
                <span style="color: #64748b; font-size: 14px; font-weight: 500;">${declinedUserName}</span>
              </div>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #92400e; font-weight: 600;">
                💡 What's Next?
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #78350f; line-height: 1.8;">
                <li>You can invite other participants to join your team</li>
                <li>Browse registered participants for the hackathon</li>
                <li>Continue building with your current team members</li>
              </ul>
            </div>

            <p style="margin: 30px 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Click the button below to manage your team:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${teamLink}"
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
                Manage Team
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
              ${teamLink}
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

export const TeamPositionApplicationEmailTemplateHtml = (
  teamLeaderName: string,
  applicantName: string,
  positionTitle: string,
  teamName: string,
  hackathonTitle: string,
  hackathonId: string,
  teamId: string,
  applicationMessage: string,
) => {
  const teamLink = `${process.env.FRONTEND_URL || 'https://4hacks.io'}/hackathons/${hackathonId}/teams/${teamId}`;

  return `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
              New Position Application!
            </h1>
            <p style="color: #dbeafe; margin: 12px 0 0 0; font-size: 16px;">
              Someone wants to join your team
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${teamLeaderName}</strong>,
            </p>

            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Great news! <strong>${applicantName}</strong> has applied to join your team for the <strong>${positionTitle}</strong> position.
            </p>

            <!-- Application Details Card -->
            <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 24px; margin: 30px 0; border-radius: 8px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #3b82f6; font-weight: 600;">
                ${positionTitle}
              </h2>

              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">👥 Team:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${teamName}</span>
              </div>

              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">🏆 Hackathon:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${hackathonTitle}</span>
              </div>

              <div>
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">👤 Applicant:</span>
                <span style="color: #3b82f6; font-size: 14px; font-weight: 700;">${applicantName}</span>
              </div>
            </div>

            <!-- Application Message -->
            <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #1e293b; font-weight: 600;">
                📝 Application Message
              </h3>
              <p style="margin: 0; color: #475569; line-height: 1.8; font-size: 15px; white-space: pre-wrap;">
                ${applicationMessage}
              </p>
            </div>

            <!-- Action Required -->
            <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #92400e; font-weight: 600;">
                📋 Action Required
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #78350f; line-height: 1.8;">
                <li>Review the applicant's message and profile</li>
                <li>Accept or decline the application</li>
                <li>Communicate with the applicant if needed</li>
              </ul>
            </div>

            <p style="margin: 30px 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Click the button below to review the application and manage your team:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${teamLink}"
                 style="
                   background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                   color: #ffffff;
                   padding: 16px 40px;
                   text-decoration: none;
                   border-radius: 8px;
                   display: inline-block;
                   font-weight: 600;
                   font-size: 16px;
                   box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
                   transition: all 0.3s ease;
                 ">
                Review Application
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
              color: #3b82f6;
              font-family: monospace;
            ">
              ${teamLink}
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;">
              Need help? Contact us at <a href="mailto:support@4hacks.io" style="color: #3b82f6; text-decoration: none;">support@4hacks.io</a>
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

export const TeamPositionApplicationAcceptedEmailTemplateHtml = (
  applicantName: string,
  positionTitle: string,
  teamName: string,
  hackathonTitle: string,
  hackathonId: string,
  teamId: string,
) => {
  const teamLink = `${process.env.FRONTEND_URL || 'https://4hacks.io'}/hackathons/${hackathonId}/teams/${teamId}`;

  return `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
              🎉 Application Accepted!
            </h1>
            <p style="color: #d1fae5; margin: 12px 0 0 0; font-size: 16px;">
              Welcome to the team!
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${applicantName}</strong>,
            </p>

            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Congratulations! Your application for the <strong>${positionTitle}</strong> position has been accepted. You are now a member of <strong>${teamName}</strong>!
            </p>

            <!-- Team Details Card -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 24px; margin: 30px 0; border-radius: 8px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #10b981; font-weight: 600;">
                ${teamName}
              </h2>

              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">🏆 Hackathon:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${hackathonTitle}</span>
              </div>

              <div>
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">💼 Position:</span>
                <span style="color: #10b981; font-size: 14px; font-weight: 700;">${positionTitle}</span>
              </div>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #92400e; font-weight: 600;">
                📋 Next Steps
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #78350f; line-height: 1.8;">
                <li>Join your team's communication channels</li>
                <li>Coordinate with your team members</li>
                <li>Start working on your hackathon project</li>
              </ul>
            </div>

            <p style="margin: 30px 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Click the button below to view your team:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${teamLink}"
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
                View Team
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
              ${teamLink}
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

export const TeamPositionApplicationRejectedEmailTemplateHtml = (
  applicantName: string,
  positionTitle: string,
  teamName: string,
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
              Application Update
            </h1>
            <p style="color: #e2e8f0; margin: 12px 0 0 0; font-size: 16px;">
              Team position application
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${applicantName}</strong>,
            </p>

            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Thank you for your interest in joining <strong>${teamName}</strong>. After careful consideration, the team has decided not to move forward with your application for the <strong>${positionTitle}</strong> position at this time.
            </p>

            <!-- Application Details Card -->
            <div style="background-color: #f8fafc; border-left: 4px solid #64748b; padding: 24px; margin: 30px 0; border-radius: 8px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #64748b; font-weight: 600;">
                ${teamName}
              </h2>

              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">🏆 Hackathon:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${hackathonTitle}</span>
              </div>

              <div>
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">💼 Position:</span>
                <span style="color: #64748b; font-size: 14px; font-weight: 500;">${positionTitle}</span>
              </div>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #1e40af; font-weight: 600;">
                💡 What's Next?
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #1e3a8a; line-height: 1.8;">
                <li>Explore other open team positions for this hackathon</li>
                <li>Create your own team and invite others to join</li>
                <li>Continue participating in the hackathon</li>
              </ul>
            </div>

            <p style="margin: 30px 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Don't be discouraged! There are many opportunities to participate and contribute. Click the button below to explore more options:
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
                Explore Hackathon
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
