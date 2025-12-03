export const SubmissionAcceptedEmailTemplateHtml = (
  creatorName: string,
  submissionTitle: string,
  hackathonTitle: string,
  hackathonId: string,
  submissionId: string,
  reviewReason?: string,
) => {
  const submissionLink = `${process.env.FRONTEND_URL || 'https://4hacks.io'}/hackathons/${hackathonId}/submissions/${submissionId}`;

  return `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
              🎉 Congratulations!
            </h1>
            <p style="color: #d1fae5; margin: 12px 0 0 0; font-size: 16px;">
              Your Submission Has Been Accepted
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${creatorName}</strong>,
            </p>

            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Great news! Your submission has been reviewed and <strong>accepted</strong> for the hackathon. 🚀
            </p>

            <!-- Submission Details Card -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 24px; margin: 30px 0; border-radius: 8px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #10b981; font-weight: 600;">
                ${submissionTitle}
              </h2>
              
              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">🏆 Hackathon:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${hackathonTitle}</span>
              </div>
              
              <div>
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">✅ Status:</span>
                <span style="color: #10b981; font-size: 14px; font-weight: 700;">ACCEPTED</span>
              </div>
            </div>

            ${
              reviewReason
                ? `
            <!-- Review Feedback -->
            <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #065f46; font-weight: 600;">
                💬 Feedback from Organizers
              </h3>
              <p style="margin: 0; color: #047857; line-height: 1.8; font-size: 15px;">
                ${reviewReason}
              </p>
            </div>
            `
                : ''
            }

            <!-- Next Steps -->
            <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #92400e; font-weight: 600;">
                📋 What's Next?
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #78350f; line-height: 1.8;">
                <li>Your submission is now live and visible to judges</li>
                <li>Continue to refine your project if the hackathon is still ongoing</li>
                <li>Prepare for the judging phase</li>
                <li>Stay tuned for updates on winners and prizes</li>
              </ul>
            </div>

            <p style="margin: 30px 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Click the button below to view your submission:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${submissionLink}" 
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
                View Submission
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
              ${submissionLink}
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

export const SubmissionRejectedEmailTemplateHtml = (
  creatorName: string,
  submissionTitle: string,
  hackathonTitle: string,
  hackathonId: string,
  reviewReason: string,
) => {
  const hackathonLink = `${process.env.FRONTEND_URL || 'https://4hacks.io'}/hackathons/${hackathonId}`;
  const contactLink = `${process.env.FRONTEND_URL || 'https://4hacks.io'}/contact`;

  return `
    <html>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
              Submission Review Update
            </h1>
            <p style="color: #fecaca; margin: 12px 0 0 0; font-size: 16px;">
              Your Submission Requires Attention
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Hello <strong>${creatorName}</strong>,
            </p>

            <p style="margin: 0 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Thank you for your submission to <strong>${hackathonTitle}</strong>. After careful review by the organizers, we regret to inform you that your submission has not been accepted at this time.
            </p>

            <!-- Submission Details Card -->
            <div style="background-color: #f8fafc; border-left: 4px solid #64748b; padding: 24px; margin: 30px 0; border-radius: 8px;">
              <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #64748b; font-weight: 600;">
                ${submissionTitle}
              </h2>
              
              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">🏆 Hackathon:</span>
                <span style="color: #1e293b; font-size: 14px; font-weight: 500;">${hackathonTitle}</span>
              </div>
              
              <div>
                <span style="display: inline-block; color: #64748b; font-size: 14px; font-weight: 600; width: 140px;">❌ Status:</span>
                <span style="color: #ef4444; font-size: 14px; font-weight: 700;">REJECTED</span>
              </div>
            </div>

            <!-- Rejection Reason -->
            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #991b1b; font-weight: 600;">
                📝 Feedback from Organizers
              </h3>
              <p style="margin: 0; color: #7f1d1d; line-height: 1.8; font-size: 15px;">
                ${reviewReason}
              </p>
            </div>

            <!-- Next Steps -->
            <div style="background-color: #ecfdf5; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #065f46; font-weight: 600;">
                💡 What You Can Do Next
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #047857; line-height: 1.8;">
                <li>Review the feedback carefully</li>
                <li>Address the concerns mentioned by the organizers</li>
                <li>If the hackathon is still ongoing, consider resubmitting with improvements</li>
                <li>Contact the organizers if you need clarification</li>
                <li>Keep building and participate in future hackathons</li>
              </ul>
            </div>

            <p style="margin: 30px 0 20px 0; font-size: 16px; color: #333; line-height: 1.6;">
              Don't be discouraged! Every submission is a learning opportunity. We encourage you to keep building and participating in future events.
            </p>

            <!-- CTA Buttons -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${hackathonLink}" 
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
                View Hackathon
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
