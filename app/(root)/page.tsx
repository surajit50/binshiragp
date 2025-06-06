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
import { AdUnit } from "@/components/adsense-provider";
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
          <h1 className="text-2xl font-bold mb-4">
            Welcome to Binshira Gram Panchayat
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to access the full features.
          </p>
          <Link href="/auth/login" className="text-blue-600 hover:underline">
            Log In
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          Welcome to Binshira Gram Panchayat
        </h1>
        <p className="text-gray-600 mb-6">
          Please log in to access the full features.
        </p>
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Log In
        </Link>
      </div>
    </div>
  );
}
