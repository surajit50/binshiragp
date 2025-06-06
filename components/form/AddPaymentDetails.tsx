"use client";

import {
  useEffect,
  useCallback,
  useRef,
  useTransition,
  useState,
  useMemo,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Calendar,
  CheckCircle,
} from "lucide-react";
import {
  calculateNetAmount,
  calculateSecurityDeposit,
  formatDate,
} from "@/utils/utils";
import { formSchema, type FormValues } from "@/schema/formSchema";
import { addPaymentDetails } from "@/action/payment-details";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export default function AddPaymentDetails({
  worksDetailId,
}: {
  worksDetailId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      grossBillAmount: 0,
      lessIncomeTax: 0,
      lessLabourWelfareCess: 0,
      lessTdsCgst: 0,
      lessTdsSgst: 0,
      mbrefno: "",
      securityDeposit: 0,
      billPaymentDate: new Date(),
      workcompletaitiondate: undefined,
      eGramVoucher: "",
      eGramVoucherDate: new Date(),
      gpmsVoucherNumber: "",
      gpmsVoucherDate: new Date(),
      billType: undefined,
      netAmount: 0,
    },
  });

  const isCalculating = useRef(false);
  const updateCalculatedFields = useCallback(() => {
    if (isCalculating.current) return;
    isCalculating.current = true;

    let values = form.getValues();

    // Round deduction values
    const deductions = [
      "lessIncomeTax",
      "lessLabourWelfareCess",
      "lessTdsCgst",
      "lessTdsSgst",
    ] as const;
    deductions.forEach((field) => {
      const currentValue = values[field];
      const roundedValue = Math.round(currentValue);
      if (currentValue !== roundedValue) {
        form.setValue(field, roundedValue, { shouldValidate: true });
      }
    });

    // Recalculate security deposit and net amount
    values = form.getValues();
    const grossAmount = values.grossBillAmount;
    const incomeTax = values.lessIncomeTax;
    const labourCess = values.lessLabourWelfareCess;
    const tdsCgst = values.lessTdsCgst;
    const tdsSgst = values.lessTdsSgst;

    const securityDeposit = Math.round(calculateSecurityDeposit(grossAmount));
    const netAmount = Math.round(
      calculateNetAmount(
        grossAmount,
        incomeTax,
        labourCess,
        tdsCgst,
        tdsSgst,
        securityDeposit
      )
    );

    form.setValue("securityDeposit", securityDeposit, { shouldValidate: true });
    form.setValue("netAmount", netAmount, { shouldValidate: true });

    isCalculating.current = false;
  }, [form]);

  // Calculate total deductions
  const totalDeduction = useMemo(() => {
    const values = form.getValues();
    return (
      values.lessIncomeTax +
      values.lessLabourWelfareCess +
      values.lessTdsCgst +
      values.lessTdsSgst +
      values.securityDeposit
    );
  }, [form.watch()]);

  // Watch form values and update calculated fields
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Update calculated fields when relevant values change
      if (
        name &&
        [
          "grossBillAmount",
          "lessIncomeTax",
          "lessLabourWelfareCess",
          "lessTdsCgst",
          "lessTdsSgst",
        ].includes(name)
      ) {
        updateCalculatedFields();
      }

      // Sync voucher dates with bill payment date changes
      if (name === "billPaymentDate" && value.billPaymentDate) {
        form.setValue("eGramVoucherDate", value.billPaymentDate);
        form.setValue("gpmsVoucherDate", value.billPaymentDate);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, updateCalculatedFields]);

  // Handle percentage-based deduction changes
  const handlePercentageChange = (
    fieldName: keyof Pick<
      FormValues,
      "lessIncomeTax" | "lessLabourWelfareCess" | "lessTdsCgst" | "lessTdsSgst"
    >,
    percentageValue: string
  ) => {
    const grossAmount = form.getValues("grossBillAmount");
    const percentage = Number.parseFloat(percentageValue);
    if (!isNaN(percentage) && !isNaN(grossAmount)) {
      const calculatedValue = Math.round((grossAmount * percentage) / 100);
      form.setValue(fieldName, calculatedValue, { shouldValidate: true });
    }
  };

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const response = await addPaymentDetails(values, worksDetailId);
        if (response.error) {
          setError(response.error);
          return;
        }
        setSuccess("Payment details submitted successfully!");
        router.back();
      } catch (err) {
        setError("Failed to submit payment details. Please try again.");
      }
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg bg-white dark:bg-gray-800 rounded-lg">
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-emerald-50 border-emerald-400 text-emerald-700">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              {/* Bill Information Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 border-b pb-2">
                  Bill Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="grossBillAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gross Bill Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="h-12"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bill Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select Bill Type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["1st RA", "2nd RA", "3rd RA", "Final Bill"].map(
                              (type) => (
                                <SelectItem
                                  key={type}
                                  value={type}
                                  className="text-sm"
                                >
                                  {type}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="billPaymentDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Bill Payment Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="h-12 justify-start text-left font-normal"
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  formatDate(field.value)
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="workcompletaitiondate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Work Completion Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="h-12 justify-start text-left font-normal"
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  formatDate(field.value)
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mbrefno"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MB Reference No</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter MB reference no"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="bg-slate-100" />

              {/* Deductions Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 border-b pb-2">
                  Deductions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { field: "lessIncomeTax", label: "Income Tax" },
                    { field: "lessLabourWelfareCess", label: "Labour Welfare Cess" },
                    { field: "lessTdsCgst", label: "TDS CGST" },
                    { field: "lessTdsSgst", label: "TDS SGST" },
                  ].map(({ field, label }) => (
                    <div key={field} className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">
                        {label}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          {...form.register(field as keyof FormValues, {
                            valueAsNumber: true,
                          })}
                          type="number"
                          placeholder="Amount"
                          className="h-10"
                        />
                        <Input
                          type="number"
                          placeholder="%"
                          className="w-20 h-10"
                          onChange={(e) =>
                            handlePercentageChange(
                              field as any,
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-slate-100" />

              {/* Voucher Details Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 border-b pb-2">
                  Voucher Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="eGramVoucher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>eGram Voucher</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Voucher number"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eGramVoucherDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>eGram Voucher Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="h-12 justify-start text-left font-normal"
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  formatDate(field.value)
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gpmsVoucherNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GPMS Voucher Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Voucher number"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gpmsVoucherDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>GPMS Voucher Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="h-12 justify-start text-left font-normal"
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  formatDate(field.value)
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator className="bg-slate-100" />

              {/* Calculated Amounts Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 border-b pb-2">
                  Calculated Amounts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <Label className="text-sm font-medium text-slate-500">
                      Total Deductions
                    </Label>
                    <div className="text-2xl font-semibold mt-1 text-slate-800">
                      ₹{totalDeduction.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <Label className="text-sm font-medium text-slate-500">
                      Security Deposit
                    </Label>
                    <div className="text-2xl font-semibold mt-1 text-slate-800">
                      ₹{form.getValues("securityDeposit").toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-emerald-200">
                    <Label className="text-sm font-medium text-emerald-600">
                      Net Amount
                    </Label>
                    <div className="text-2xl font-semibold mt-1 text-emerald-700">
                      ₹{form.getValues("netAmount").toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <CardFooter className="px-0 pb-0 pt-6">
              <Button
                type="submit"
                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-5 w-5" />
                )}
                {isPending ? "Submitting..." : "Confirm Payment Details"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
