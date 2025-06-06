import { Resend } from "resend";

import { VerificationEmail } from "@/components/emails/verification-email";
import AuthenticatedTemp from "@/components/emails/user-authenticate";
const resend = new Resend(process.env.RESEND_API_KEY);
const ROOT_URL = process.env.HOST_NAME_ROOT;

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLinkAddress = `${ROOT_URL}/auth/new-verify?token=${token}`;

  await resend.emails.send({
    from: "dhalparagp <noreply@dhalparagp.in>",
    to: email,
    subject: "Confirm your email address",
    react: VerificationEmail({ confirmLink: confirmLinkAddress }),
  });
};

export const sendResetPasswordEmail = async (email: string, token: string) => {
  try {
    if (!ROOT_URL) {
      throw new Error("ROOT_URL environment variable is not defined");
    }

    const resetLink = `${ROOT_URL}/auth/new-password?token=${encodeURIComponent(
      token
    )}`;
    const expirationTime = "1 hour";

    const emailData = {
      from: "dhalparagp<noreply@dhalparagp.in>",
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>We received a password reset request for your account.</p>
        <p>This link will expire in ${expirationTime}:</p>
        <p><a href="${resetLink}" style="font-weight: bold;">Reset Password</a></p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      text: `Password Reset Link (valid for ${expirationTime}):\n${resetLink}`,
    };

    console.log("Attempting to send password reset email to:", email);
    const response = await resend.emails.send(emailData);
    console.log("Password reset email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to send password reset email: ${error.message}`);
    }
    throw new Error("Failed to send password reset email");
  }
};

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  await resend.emails.send({
    from: "dhalparagp<noreply@dhalparagp.in>",
    to: email,
    subject: "2FA Code",
    react: <AuthenticatedTemp validationCode={token} />,
  });
};
