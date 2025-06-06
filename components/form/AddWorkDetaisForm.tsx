
"use client"

import type React from "react"
import { useState } from "react"
import { useForm, useFormContext, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery, useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query"
import type { ApprovedActionPlanDetails } from "@prisma/client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Search,
  X,
  CheckCircle2,
  IndianRupee,
  CalendarDays,
  MapPin,
  ClipboardList,
  Landmark,
  Hammer,
} from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { fetchApprovedActionPlans } from "@/action/fetchApprovedActionPlans"
import { addTenderDetails } from "@/action/addTenderDetails"

const predefinedParticipationFees = ["400", "500", "600", "800", "1000", "1500"]
const participationFeeOptions = [...predefinedParticipationFees, "Other"]

const predefinedFinalEstimates = ["100000", "130000", "150000", "200000", "250000", "300000", "350000", "400000"]
const finalEstimateOptions = [...predefinedFinalEstimates, "Other"]

const formSchema = z
  .object({
    approvedActionPlanId: z.string().nonempty("Please select a work detail"),
    participation_fee_type: z.string().nonempty("Please select participation fee type"),
    participation_fee: z.string().nonempty("Participation fee is required"),
    final_Estimate_Amount_type: z.string().nonempty("Please select estimate amount type"),
    final_Estimate_Amount: z.string().nonempty("Final estimate amount is required"),
  })
  .superRefine((data, ctx) => {
    if (data.participation_fee_type === "Other" && !data.participation_fee) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["participation_fee"],
        message: "Please enter participation fee amount",
      })
    }
    if (data.final_Estimate_Amount_type === "Other" && !data.final_Estimate_Amount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["final_Estimate_Amount"],
        message: "Please enter final estimate amount",
      })
    }
  })

type FormValues = z.infer<typeof formSchema>

interface AddWorkDetailsFormProps {
  tenderId: string
}

interface SelectWithOtherProps {
  name: keyof Pick<FormValues, "participation_fee" | "final_Estimate_Amount">
  options: string[]
  predefinedValues: string[]
  label: string
  selectedType: string
  selectedValue: string
  onTypeChange: (value: string) => void
  onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
}

const SelectWithOther = ({
  name,
  options,
  predefinedValues,
  label,
  selectedType,
  selectedValue,
  onTypeChange,
  onValueChange,
  error,
}: SelectWithOtherProps) => {
  const form = useFormContext<FormValues>()

  const handleTypeChange = (value: string) => {
    onTypeChange(value)

    if (value === "Other") {
      const currentValue = form.getValues(name)
      if (predefinedValues.includes(currentValue)) {
        form.setValue(name, "")
      }
    } else {
      form.setValue(name, value)
    }
  }

  return (
    <div className="space-y-2 bg-white/50 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <Label className="text-gray-600 flex items-center gap-2 font-medium">
        <div className="p-1.5 bg-blue-100 rounded-lg">
          <IndianRupee className="h-5 w-5 text-blue-600" />
        </div>
        {label}
      </Label>

      <div className="flex flex-col gap-2">
        <select
          value={selectedType}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="w-full h-14 rounded-xl border-2 border-gray-200/80 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-lg shadow-sm pl-4 pr-8 appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjYmNiY2IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSIvPjwvc3ZnPg==')] bg-no-repeat bg-[right_1rem_center]"
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option === "Other" ? "Other (Specify Amount)" : `₹${Number(option).toLocaleString()}`}
            </option>
          ))}
        </select>

        {selectedType === "Other" && (
          <div className="relative">
            <Input
              value={selectedValue}
              onChange={onValueChange}
              placeholder="Enter custom amount"
              className="h-14 rounded-xl border-2 border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-lg shadow-sm pl-12"
            />
            <IndianRupee className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )
}

export default function AddWorkDetailsForm({ tenderId }: AddWorkDetailsFormProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWork, setSelectedWork] = useState<ApprovedActionPlanDetails | null>(null)
  const [page, setPage] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const pageSize = 20
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      approvedActionPlanId: "",
      participation_fee_type: "",
      participation_fee: "",
      final_Estimate_Amount_type: "",
      final_Estimate_Amount: "",
    },
  })

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["approvedActionPlans", page, pageSize, searchTerm],
    queryFn: () => fetchApprovedActionPlans(page, pageSize, searchTerm),
    staleTime: 5 * 60 * 1000,
  })

  const mutation = useMutation({
    mutationFn: (values: FormValues) => addTenderDetails(values, tenderId),
    onMutate: async (newTenderDetails) => {
      const queryKey: QueryKey = ["tenderDetails", tenderId]
      await queryClient.cancelQueries({ queryKey })
      const previousTenderDetails = queryClient.getQueryData(queryKey)
      queryClient.setQueryData(queryKey, (old: any[] = []) => [...old, newTenderDetails])
      return { previousTenderDetails }
    },
    onError: (err, newTenderDetails, context) => {
      const queryKey: QueryKey = ["tenderDetails", tenderId]
      queryClient.setQueryData(queryKey, context?.previousTenderDetails)
      toast({
        title: "Error",
        description: "Failed to add tender details. Please try again.",
        variant: "destructive",
      })
    },
    onSuccess: () => {
      const queryKey: QueryKey = ["tenderDetails", tenderId]
      queryClient.invalidateQueries({ queryKey })
      toast({
        title: "Success",
        description: "Tender details added successfully!",
      })
      setIsDialogOpen(true)
      handleDialogClose()
    },
  })

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values)
  }

  const handleWorkSelect = (work: ApprovedActionPlanDetails) => {
    setSelectedWork(work)
    form.setValue("approvedActionPlanId", work.id)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSelectedWork(null)
    form.setValue("approvedActionPlanId", "")
    setPage(0)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    form.reset()
    setSelectedWork(null)
    setSearchTerm("")
    setPage(0)
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl rounded-3xl border-0 bg-gradient-to-br from-white to-blue-50/30 overflow-hidden">
      <CardHeader className="space-y-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-3xl py-10 px-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-4"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="p-3 bg-white/10 rounded-full backdrop-blur-sm"
          >
            <Hammer className="h-8 w-8 text-white/90" />
          </motion.div>
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight">Tender Work Configuration</CardTitle>
            <CardDescription className="text-center text-blue-100/90 text-lg mt-2">
              Link municipal plans with tender specifications
            </CardDescription>
          </div>
        </motion.div>
      </CardHeader>

      <CardContent className="p-8">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8">
              {/* Search Section */}
              <div className="relative group">
                <Label htmlFor="search" className="text-sm font-medium text-gray-600 mb-2 block">
                  Search Approved Plans
                </Label>
                <div className="relative transition-all duration-300 hover:shadow-sm focus-within:ring-2 focus-within:ring-blue-200 rounded-xl">
                  <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 z-10" />
                  <Input
                    id="search"
                    placeholder="Search by activity, scheme, or location..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setPage(1)
                    }}
                    className="pl-10 pr-10 h-14 rounded-xl border border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 text-lg shadow-sm bg-white/50 backdrop-blur-sm"
                  />
                  {searchTerm && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-3 top-3 h-8 w-8 p-0 hover:bg-gray-100/50 rounded-lg"
                      onClick={clearSearch}
                    >
                      <X className="h-5 w-5 text-gray-500" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Search Results */}
              <AnimatePresence>
                {(searchTerm || (data && data.plans.length > 0)) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-gray-100 shadow-lg rounded-xl overflow-hidden bg-white/90 backdrop-blur-sm">
                      <ScrollArea className="h-[300px]">
                        <CardContent className="p-4">
                          {isLoading ? (
                            <div className="flex items-center justify-center h-full py-8">
                              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                          ) : data && data.plans.length > 0 ? (
                            <RadioGroup
                              value={selectedWork?.id}
                              onValueChange={(value) => {
                                const work = data.plans.find((p) => p.id === value)
                                if (work) handleWorkSelect(work)
                              }}
                            >
                              <div className="space-y-3">
                                {data.plans.map((work) => (
                                  <motion.div
                                    key={work.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <RadioGroupItem value={work.id} id={work.id} className="peer sr-only" />
                                    <Label
                                      htmlFor={work.id}
                                      className="flex flex-col items-start p-5 border rounded-lg cursor-pointer transition-all 
                                        bg-white hover:border-blue-200 peer-checked:border-blue-400 peer-checked:bg-blue-50/30
                                        shadow-sm hover:shadow-md mb-2 group"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-lg shadow-inner">
                                          <ClipboardList className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                          <h3 className="font-semibold text-gray-800 text-lg">{work.activityName}</h3>
                                          <p className="text-sm text-gray-500 mt-1">{work.schemeName}</p>
                                        </div>
                                      </div>

                                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm w-full">
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <CalendarDays className="h-4 w-4 text-blue-500" />
                                          <span>{work.financialYear}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <IndianRupee className="h-4 w-4 text-green-500" />
                                          <span>{work.estimatedCost}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <MapPin className="h-4 w-4 text-red-500" />
                                          <span>{work.locationofAsset}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <Landmark className="h-4 w-4 text-purple-500" />
                                          <span>{work.activityCode}</span>
                                        </div>
                                      </div>
                                    </Label>
                                  </motion.div>
                                ))}
                              </div>
                            </RadioGroup>
                          ) : (
                            <div className="text-center p-6">
                              <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                                <Search className="h-8 w-8 text-gray-400" />
                              </div>
                              <p className="text-gray-500 font-medium">No matching works found</p>
                            </div>
                          )}
                        </CardContent>
                      </ScrollArea>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected Work Preview */}
              <AnimatePresence>
                {selectedWork && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border border-blue-200 bg-gradient-to-r from-blue-50/30 to-purple-50/20 rounded-xl backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                          <CheckCircle2 className="h-6 w-6 text-green-600 animate-pulse" />
                          Selected Work Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <Label className="text-sm text-gray-600 flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Financial Year
                          </Label>
                          <p className="font-medium">{selectedWork.financialYear}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm text-gray-600 flex items-center gap-2">
                            <ClipboardList className="h-4 w-4" />
                            Activity Code
                          </Label>
                          <p className="font-medium">{selectedWork.activityCode}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm text-gray-600 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Estimated Cost
                          </Label>
                          <p className="font-medium">{selectedWork.estimatedCost}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-sm text-gray-600 flex items-center gap-2">
                            <Landmark className="h-4 w-4" />
                            Scheme
                          </Label>
                          <p className="font-medium">{selectedWork.schemeName}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Payment Details */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IndianRupee className="h-6 w-6 text-blue-600" />
                  </div>
                  Financial Parameters
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SelectWithOther
                    name="participation_fee"
                    options={participationFeeOptions}
                    predefinedValues={predefinedParticipationFees}
                    label="Participation Fee"
                    selectedType={form.watch("participation_fee_type")}
                    selectedValue={form.watch("participation_fee")}
                    onTypeChange={(value) => form.setValue("participation_fee_type", value)}
                    onValueChange={(e) => form.setValue("participation_fee", e.target.value)}
                    error={form.formState.errors.participation_fee?.message}
                  />

                  <SelectWithOther
                    name="final_Estimate_Amount"
                    options={finalEstimateOptions}
                    predefinedValues={predefinedFinalEstimates}
                    label="Final Estimate Amount"
                    selectedType={form.watch("final_Estimate_Amount_type")}
                    selectedValue={form.watch("final_Estimate_Amount")}
                    onTypeChange={(value) => form.setValue("final_Estimate_Amount_type", value)}
                    onValueChange={(e) => form.setValue("final_Estimate_Amount", e.target.value)}
                    error={form.formState.errors.final_Estimate_Amount?.message}
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                text-white rounded-xl shadow-xl hover:shadow-2xl transition-all text-lg font-semibold group"
              disabled={form.formState.isSubmitting || !selectedWork}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
                  <span className="bg-gradient-to-r from-white/90 to-white/70 bg-clip-text text-transparent">
                    Finalize Tender Details
                  </span>
                </div>
              )}
            </Button>
          </form>
        </FormProvider>
      </CardContent>

      {/* Success Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-2xl max-w-md border-0 shadow-2xl bg-gradient-to-b from-white to-blue-50/30">
          <div className="flex flex-col items-center py-8 px-4 text-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-4 bg-green-100/80 rounded-full backdrop-blur-sm mb-6"
            >
              <CheckCircle2 className="h-16 w-16 text-green-600 animate-pulse" />
            </motion.div>
            <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">
              Configuration Complete!
            </DialogTitle>
            <DialogDescription className="text-gray-600 mb-6">
              Tender details have been successfully integrated with the municipal plan.
            </DialogDescription>
            <div className="flex gap-4 w-full">
              <Button
                variant="outline"
                onClick={handleDialogClose}
                className="h-12 flex-1 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50/80 shadow-sm"
              >
                Return to Dashboard
              </Button>
              <Button
                onClick={handleDialogClose}
                className="h-12 flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                  text-white rounded-xl shadow-md transition-all"
              >
                Add New Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
