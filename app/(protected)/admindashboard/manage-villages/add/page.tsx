
"use client"
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { MapPin, Users, Home, TreePine } from 'lucide-react'

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Village name must be at least 2 characters.",
    }),
    district: z.string().min(2, {
        message: "District name must be at least 2 characters.",
    }),
    population: z.number().min(1, {
        message: "Population must be at least 1.",
    }),
    area: z.number().min(0.1, {
        message: "Area must be at least 0.1 square kilometers.",
    }),
    type: z.enum(["rural", "urban", "suburban"]),
    description: z.string().optional(),
})

export default function Component() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            district: "",
            population: 0,
            area: 0,
            type: "rural",
            description: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        toast({
            title: "Village Added",
            description: `Successfully added ${values.name} to the database.`,
        })
        console.log(values)
    }

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Add New Village</CardTitle>
                    <CardDescription>Enter the details of the new village to add it to the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Village Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter village name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            The official name of the village.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="district"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>District</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter district name" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            The district where the village is located.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="population"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Population</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="Enter population" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormDescription>
                                            The current population of the village.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="area"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Area (sq km)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="Enter area in square kilometers" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormDescription>
                                            The total area of the village in square kilometers.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Village Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select village type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="rural">Rural</SelectItem>
                                                <SelectItem value="urban">Urban</SelectItem>
                                                <SelectItem value="suburban">Suburban</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            The classification of the village.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Enter a brief description of the village" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            A short description of the village, its history, or notable features.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Add Village</Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="flex space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                            <MapPin className="mr-1 h-4 w-4" />
                            Location
                        </div>
                        <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            Population
                        </div>
                        <div className="flex items-center">
                            <Home className="mr-1 h-4 w-4" />
                            Type
                        </div>
                        <div className="flex items-center">
                            <TreePine className="mr-1 h-4 w-4" />
                            Area
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}