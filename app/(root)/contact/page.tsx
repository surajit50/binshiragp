
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

export default function ContactUs() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Here you would typically send the form data to a server
    console.log(values);
    toast({
      title: "Message sent",
      description: "Thank you for your message. We will get back to you soon!",
    });
    form.reset();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
        Contact Us
      </h1>
      <p className="text-lg text-gray-600 mb-12 text-center">
        We’re here to help! Reach out to us with any questions or concerns.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Contact Form */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Send us a message
            </CardTitle>
            <CardDescription className="text-gray-600">
              Fill out the form below, and we’ll get back to you as soon as
              possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your name"
                          {...field}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Your email"
                          {...field}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Subject</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Message subject"
                          {...field}
                          className="focus:ring-2 focus:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your message"
                          {...field}
                          className="focus:ring-2 focus:ring-blue-500"
                          rows={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Send Message
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Contact Information and Map */}
        <div className="space-y-8">
          {/* Contact Information Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800">
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-full">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-gray-700">
                  123 Gram Panchayat Road, Village Name, District, State, PIN
                  Code
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-full">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-gray-700">+91 1234567890</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-full">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-gray-700">contact@grampanchayat.gov.in</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-50 rounded-full">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-gray-700">
                  Monday to Friday, 9:00 AM to 5:00 PM
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Map Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-800">
                Our Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg"
                  alt="Map of Gram Panchayat office location"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
