"use server";

import * as z from "zod";
import { RegisterSchema } from "@/schema";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getUserEmail } from "@/data/user";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail } from "@/lib/mail";
import { emailServiceStatus } from "@/lib/emailservide";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const validateField = RegisterSchema.safeParse(values);

  if (!validateField.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, name } = validateField.data;

  try {
    const normalizedEmail = email.toLowerCase();
    const existingUser = await getUserEmail(normalizedEmail);

    if (existingUser) {
      return { error: "Email is already in use!" };
    }

    const status = await emailServiceStatus();

    if (!status) {
      return {
        error:
          "Registration is currently disabled. Please try again later or contact support.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
      },
    });

    // Explicit null check
    if (!user.email) {
      await db.user.delete({ where: { id: user.id } });
      return { error: "Registration failed - email not set" };
    }

    const verificationToken = await generateVerificationToken(user.email);

    try {
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      );
      return { success: "Confirmation email sent" };
    } catch (emailError) {
      // If email sending fails, delete the user and return error
      await db.user.delete({ where: { id: user.id } });
      console.error("Error sending verification email:", emailError);
      return {
        error:
          "Failed to send verification email. Please try again later or contact support.",
      };
    }
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
};
