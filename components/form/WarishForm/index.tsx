"use client";
import { useState, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { createNestedWarishDetails } from "@/action/warishApplicationAction";
import {
  warishFormSchema,
  type WarishFormValuesType,
} from "@/schema/warishSchema";
import { ApplicationInfo } from "./application-info";
import { WarishTable } from "./warish-table";
import { defaultValues } from "./constants";
import {
  CheckCircle2,
  ClipboardList,
  Users,
  SendHorizonal,
} from "lucide-react";

export default function WarishFormComponent() {
  const [acnumber, setAcnumber] = useState<string>("");
  const { toast } = useToast();
  const formreset = useRef(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<WarishFormValuesType>({
    resolver: zodResolver(warishFormSchema),
    defaultValues,
  });

  const resetForm = () => form.reset(defaultValues);

  async function onSubmit(data: WarishFormValuesType) {
    startTransition(async () => {
      try {
        const result = await createNestedWarishDetails(data);
        if (result?.errors) {
          toast({
            title: "Error / ত্রুটি",
            description: result.message,
            variant: "destructive",
          });
        } else if (result?.success) {
          startTransition(() => {
            resetForm();
          });

          toast({
            title: "Success / সফল",
            description: result.data?.acknowlegment?.toString(),
          });
          setAcnumber(result.data?.acknowlegment?.toString() || "");
        }
      } catch (error) {
        console.error("Failed to add warish details:", error);
        toast({
          title: "Error / ত্রুটি",
          description:
            "An unexpected error occurred. Please try again. / একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
          variant: "destructive",
        });
      } finally {
        router.refresh();
      }
    });
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 md:space-y-8"
          ref={formreset}
        >
          {acnumber && (
            <div className="bg-emerald-50/80 p-3 md:p-4 rounded-xl border border-emerald-200 flex items-center gap-2 md:gap-3">
              <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
              <p className="text-xs md:text-sm font-medium text-emerald-700">
                Acknowledgment Number / স্বীকৃতি নম্বর:{" "}
                <span className="font-semibold break-all">{acnumber}</span>
              </p>
            </div>
          )}

          {/* Part 1: Application Information */}
          <div className="bg-gradient-to-br from-primary/95 to-primary/80 text-primary-foreground px-4 py-3 md:px-6 md:py-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 md:gap-3">
              <ClipboardList className="h-5 w-5 md:h-6 md:w-6" />
              <h2 className="text-lg md:text-xl font-bold tracking-tight">
                Part 1: Application Information / আবেদনের তথ্য
              </h2>
            </div>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
            <ApplicationInfo form={form} />
          </div>

          {/* Part 2: Warish Information */}
          <div className="bg-gradient-to-br from-primary/95 to-primary/80 text-primary-foreground px-4 py-3 md:px-6 md:py-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 md:gap-3">
              <Users className="h-5 w-5 md:h-6 md:w-6" />
              <h2 className="text-lg md:text-xl font-bold tracking-tight">
                Part 2: Warish Information / ওয়ারিশ তথ্য
              </h2>
            </div>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <WarishTable form={form} />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-10 md:h-12 text-xs md:text-sm font-semibold bg-primary hover:bg-primary/90 transition-all"
            disabled={isPending}
          >
            {isPending ? (
              <div className="flex items-center gap-2 animate-pulse">
                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent"></div>
                <span>Submitting... / জমা দেওয়া হচ্ছে...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <SendHorizonal className="w-4 h-4" />
                <span>Submit Application / আবেদন জমা দিন</span>
              </div>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
