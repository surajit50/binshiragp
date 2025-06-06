import React from "react";
import AddPaymentDetails from "@/components/form/AddPaymentDetails";
import { Metadata } from "next";
import { ShowWorkDetails } from "@/components/Work-details";
export const metadata: Metadata = {
  title: "Add Payment Details | Works Management",
  description: "Add payment details for the selected work",
};

interface PageProps {
  params: { id: string };
}

export default function PaymentDetailsPage({ params }: PageProps) {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold">Add Payment Details</h1>
        <p className="text-blue-100 mt-2">Fill in the payment details for the selected work</p>
      </header>

      <section aria-label="Work Details" className="mb-8">
        <ShowWorkDetails worksDetailId={params.id} />
      </section>

      <section aria-label="Payment Form">
        <AddPaymentDetails worksDetailId={params.id} />
      </section>
    </div>
  );
}

