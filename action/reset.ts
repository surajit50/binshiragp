"use server";

import { getUserEmail } from "@/data/user";
import { sendResetPasswordEmail } from "@/lib/mail";
import { generatePasswordToken } from "@/lib/token";
import { ResetSchema } from "@/schema";
import * as z from "zod";

export const reset = async (values: z.infer<typeof ResetSchema>) => {
  const validateField = ResetSchema.safeParse(values);

  if (!validateField.success) {
    return { error: "Invalid Email" };
  }

  const { email } = validateField.data;

  const exitignUser = await getUserEmail(email);

  if (!exitignUser) {
    return { error: "Email not found" };
  }

  const passwordResetToken = await generatePasswordToken(email);

  try {
    await sendResetPasswordEmail(
      passwordResetToken.email,
      passwordResetToken.token
    );

    return { success: "Reset email sent successfully" };
  } catch (error) {
    console.error("Error sending reset email:", error);
    return { error: "Failed to send reset email. Please try again later." };
  }
};
