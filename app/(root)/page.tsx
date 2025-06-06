
import Link from "next/link";
import {

import { auth } from "@/auth";


export default async function Home() {
  
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
