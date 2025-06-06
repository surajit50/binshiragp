import { Suspense } from "react";
import ProdhanSection from "@/components/prodhan-section";
import GovernmentSchemeSection from "@/components/government-scheme-section";

import HeroSection from "@/components/hero-section";
import AdminMarquee from "@/components/AdminMarquee";

import { db } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import LatestNewsUpdate from "@/components/latest-news-update";
import { AdUnit } from "@/components/adsense-provider"
import { auth } from "@/auth";
type AdminMessage = {
  id: string;
  title: string;
  content: string;
  bgColor: string;
  textColor: string;
  createdAt: Date;
  updatedAt: Date;
};

export default async function Home() {
  const addminmessage = (await db.adminMessage.findMany({})) as AdminMessage[];

  const session = await auth();
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Binshira Gram Panchayat</h1>
          <p className="text-gray-600 mb-6">Please log in to access the full features.</p>
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative py-2 px-4">
        <HeroSection />
      </section>
      <div>
        {addminmessage.length > 0 &&
          addminmessage.map((item) => (
            <AdminMarquee
              key={item.id}
              message={item.content}
              bgColor={item.bgColor}
              textColor={item.textColor}
              speed={25}
              icon={<span>🚨</span>}
            />
          ))}
      </div>

      {/* Quick Stats */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                15,247
              </div>
              <div className="text-gray-600">Total Population</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">12</div>
              <div className="text-gray-600">Villages Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                ₹2.5Cr
              </div>
              <div className="text-gray-600">Annual Budget</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">45+</div>
              <div className="text-gray-600">Development Projects</div>
            </div>
          </div>
        </div>
      </section>

      {/* Message from Prodhan */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardTitle className="text-2xl">
                  Message from the Prodhan
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Leadership committed to community development
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <Image
                      src="https://res.cloudinary.com/dqkmkxgdo/image/upload/v1698161664/IMG_20231024_210228_dyy8dw.jpg"
                      alt="Prodhan Photo"
                      width={150}
                      height={150}
                      className="rounded-full border-4 border-blue-200"
                    />
                  </div>
                  <div className="flex-1">
                    <blockquote className="text-lg text-gray-700 mb-4 italic">
                      &quot;Welcome to Dhalpara Gram Panchayat. We are committed
                      to serving our community and working towards sustainable
                      development. Our goal is to improve the quality of life
                      for all residents through transparent governance,
                      inclusive growth, and community-driven initiatives that
                      address the real needs of our people.&quot;
                    </blockquote>
                    <div className="border-t pt-4">
                      <p className="font-semibold text-gray-900">
                        Smt.Bithika Ghosh
                      </p>
                      <p className="text-gray-600">
                        Prodhan, Dhalpara Gram Panchayat
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Elected: 2023 | Experience: 8 years in local governance
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Our Services
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive services designed to meet the diverse needs of our
              community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-blue-600" />
                  Birth & Death Certificates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Quick and efficient processing of birth and death certificates
                  with online tracking facility.
                </p>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-green-600" />
                  Property Tax Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Online property tax payment, assessment, and grievance
                  redressal services.
                </p>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-purple-600" />
                  Welfare Schemes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Information and application process for various government
                  welfare schemes and benefits.
                </p>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent News & Updates */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Latest News & Updates
            </h3>
            <p className="text-xl text-gray-600">
              Stay informed about recent developments and announcements
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Badge className="w-fit mb-2">Development</Badge>
                <CardTitle className="text-lg">
                  New Water Supply Project Launched
                </CardTitle>
                <CardDescription>January 15, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  A comprehensive water supply project covering 8 villages has
                  been initiated with a budget of ₹50 lakhs.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Badge className="w-fit mb-2" variant="secondary">
                  Meeting
                </Badge>
                <CardTitle className="text-lg">
                  Monthly Gram Sabha Meeting
                </CardTitle>
                <CardDescription>January 20, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Next Gram Sabha meeting scheduled to discuss budget allocation
                  and ongoing development projects.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Badge className="w-fit mb-2" variant="outline">
                  Scheme
                </Badge>
                <CardTitle className="text-lg">
                  PM Awas Yojana Applications
                </CardTitle>
                <CardDescription>January 10, 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  New round of applications for PM Awas Yojana housing scheme
                  now open for eligible beneficiaries.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest News Update */}
      <section className="my-8">
        <LatestNewsUpdate />
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info Column */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="mr-3 h-5 w-5" />
                  <span>
                    Dhalpara Gram Panchayat Office, Dhalpara, West Bengal -
                    733126
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-3 h-5 w-5" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-3 h-5 w-5" />
                  <span>info@dhalparagp.in</span>
                </div>
              </div>
            </div>

            {/* Office Hours Column */}
            <div>
              <h3 className="text-2xl font-bold mb-6">Office Hours</h3>
              <div className="space-y-2">
                <p>
                  <strong>Monday - Friday:</strong> 10:00 AM - 5:00 PM
                </p>
                <p>
                  <strong>Saturday:</strong> 10:00 AM - 2:00 PM
                </p>
                <p>
                  <strong>Sunday:</strong> Closed
                </p>
                <p className="text-blue-200 text-sm mt-4">
                  Emergency services available 24/7
                </p>
              </div>
            </div>

            {/* Ad Container - Now centered below on medium screens */}
            <div className="md:col-span-2 flex justify-center">
              <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden relative">
                <AdUnit slot="1590942900" format="auto" responsive={true} style={{ minHeight: "300px" }} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
