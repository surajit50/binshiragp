"use server";

import * as z from "zod";
import { auth } from "@/auth";
import { getUserById } from "@/data/user";
import { changePasswordSchema } from "@/schema";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signOut } from "@/auth";

export const updateUserPasword = async (
  values: z.infer<typeof changePasswordSchema>
) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized access" };
    }

    const userId = session.user.id;

    // Validate input
    const validatedFields = changePasswordSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid input values" };
    }

    const { password, newpassword } = validatedFields.data;

    // Get user and verify current password
    const user = await getUserById(userId);
    if (!user?.password) {
      return { error: "User not found" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { error: "Current password is incorrect" };
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newpassword, 10);

    await db.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
      },
    });

    // Sign out user after password change
    await signOut();

    return { success: "Password changed successfully. Please login again." };
  } catch (error) {
    console.error("[PASSWORD_CHANGE_ERROR]", error);
    return { error: "Something went wrong. Please try again." };
  }
};
