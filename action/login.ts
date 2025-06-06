"use server";

import * as z from "zod";
import { LoginSchema } from "@/schema";
import { signIn } from "@/auth";
import {
  DEFAULT_LOGIN_REDIRECT,
  DEFAULT_ADMINLOGIN_REDIRECT,
  DEFAULT_STAFFLOGIN_REDIRECT,
  DEFAULT_SUPERADMINLOGIN_REDIRECT,
} from "@/routes";
import { AuthError } from "next-auth";
import { getUserEmail } from "@/data/user"; // Ensure this fetches the user with necessary relations
import { generateTwoFactorToken, generateVerificationToken } from "@/lib/token";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "@/lib/mail";
import { getTwoFactorTokenEmail } from "@/data/two-factor-token";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { db } from "@/lib/db";
import { compare } from "bcryptjs"; // For manual password check

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Invalid credentials!" }; // Generic message to avoid user enumeration
  }

  if (existingUser.userStatus !== "active") {
    return { error: "Account inactive. Contact support." };
  }

  // Step 1: Verify Password First
  const isValidPassword = await compare(password, existingUser.password);
  if (!isValidPassword) {
    return { error: "Invalid credentials!" };
  }

  // Step 2: Handle Email Verification
  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(existingUser.email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);
    return { success: "Confirmation email sent!" };
  }

  // Step 3: Handle 2FA (Only if password is valid)
  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenEmail(existingUser.email);
      if (!twoFactorToken || twoFactorToken.token !== code) {
        return { error: "Invalid code!" };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) return { error: "Code expired!" };

      // Delete token and existing confirmation
      await db.$transaction([
        db.twoFactorToken.delete({ where: { id: twoFactorToken.id } }),
        db.twoFactorConfirmation.deleteMany({ where: { userId: existingUser.id } }),
      ]);

      await db.twoFactorConfirmation.create({
        data: { userId: existingUser.id },
      });
    } else {
      // Generate and send new 2FA code
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);
      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);
      return { twoFactor: true };
    }
  }

  // Step 4: Proceed to sign in (credentials are valid and 2FA handled)
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    // Determine redirect based on role
    const roleRedirects = {
      admin: DEFAULT_ADMINLOGIN_REDIRECT,
      staff: DEFAULT_STAFFLOGIN_REDIRECT,
      superadmin: DEFAULT_SUPERADMINLOGIN_REDIRECT,
      default: DEFAULT_LOGIN_REDIRECT,
    };

    const redirectUrl =
      roleRedirects[existingUser.role as keyof typeof roleRedirects] ||
      roleRedirects.default;

    return { success: "Login successful!", redirectUrl };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Authentication failed!" };
      }
    }
    throw error; // Propagate unexpected errors
  }
};