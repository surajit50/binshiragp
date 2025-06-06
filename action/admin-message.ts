'use server'

import { revalidatePath } from 'next/cache'
import { db } from "@/lib/db"
import { z } from "zod"

// Validation schema for message creation
const MessageSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters")
    .transform(val => val.trim()),
  content: z.string()
    .min(10, "Content must be at least 10 characters")
    .max(500, "Content must be less than 500 characters")
    .transform(val => val.trim()),
  bgColor: z.string()
    .regex(/^bg-[a-z]+-[0-9]+$/, "Invalid background color format")
    .default("bg-blue-600"),
  textColor: z.string()
    .regex(/^text-[a-z]+-[0-9]+$/, "Invalid text color format")
    .default("text-white"),
})

export async function createMessage(formData: FormData) {
  try {
    const rawData = {
      title: formData.get('title') || '',
      content: formData.get('content') || '',
      bgColor: formData.get('bgColor') || 'bg-blue-600',
      textColor: formData.get('textColor') || 'text-white',
    }

    // Validate the data
    const validatedData = MessageSchema.safeParse(rawData)

    if (!validatedData.success) {
      return { 
        success: false, 
        error: "Validation failed", 
        details: validatedData.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }
    }

    const newMessage = await db.adminMessage.create({
      data: validatedData.data,
    })

    revalidatePath('/admindashboard/master/addimpsmessage')
    revalidatePath('/') // Also revalidate the home page
    return { success: true, data: newMessage }
  } catch (error) {
    console.error('Failed to create message:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create message" 
    }
  }
}

export async function getMessages() {
  try {
    const messages = await db.adminMessage.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return { success: true, data: messages }
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch messages" 
    }
  }
}

export async function deleteMessage(id: string) {
  try {
    // Verify the message exists before deleting
    const message = await db.adminMessage.findUnique({
      where: { id },
    })

    if (!message) {
      return { success: false, error: "Message not found" }
    }

    await db.adminMessage.delete({
      where: { id },
    })

    revalidatePath('/admindashboard/master/addimpsmessage')
    revalidatePath('/') // Also revalidate the home page
    return { success: true }
  } catch (error) {
    console.error('Failed to delete message:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete message" 
    }
  }
}

export async function updateMessage(id: string, formData: FormData) {
  try {
    const rawData = {
      title: formData.get('title') || '',
      content: formData.get('content') || '',
      bgColor: formData.get('bgColor') || 'bg-blue-600',
      textColor: formData.get('textColor') || 'text-white',
    }

    // Validate the data
    const validatedData = MessageSchema.safeParse(rawData)

    if (!validatedData.success) {
      return { 
        success: false, 
        error: "Validation failed", 
        details: validatedData.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }
    }

    // Verify the message exists before updating
    const existingMessage = await db.adminMessage.findUnique({
      where: { id },
    })

    if (!existingMessage) {
      return { success: false, error: "Message not found" }
    }

    const updatedMessage = await db.adminMessage.update({
      where: { id },
      data: validatedData.data,
    })

    revalidatePath('/admindashboard/master/addimpsmessage')
    revalidatePath('/') // Also revalidate the home page
    return { success: true, data: updatedMessage }
  } catch (error) {
    console.error('Failed to update message:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update message" 
    }
  }
}

export async function getMessageById(id: string) {
  try {
    const message = await db.adminMessage.findUnique({
      where: { id },
    })

    if (!message) {
      return { success: false, error: "Message not found" }
    }

    return { success: true, data: message }
  } catch (error) {
    console.error('Failed to fetch message:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch message" 
    }
  }
}
