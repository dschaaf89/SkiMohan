"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { CalendarIcon, Trash } from "lucide-react";
import { Instructor } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import React, { MouseEvent } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
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
import { format } from "date-fns";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { cn } from "@/lib/utils";
import { differenceInYears } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const ageRequest = [
  {
    id: "4-5",
    label: "4-5",
  },
  {
    id: "6-12",
    label: "6-12",
  },
  {
    id: "Teens",
    label: "Teens",
  },
  {
    id: "Adults",
    label: "Adults",
  },
  {
    id: "AllAges",
    label: "All Ages",
  },
] as const;

const classes = [
  {
    id: "Thursday",
    label: "1. Thursday 7:00pm-9:00pm",
  },
  {
    id: "Friday",
    label: "2. Friday 7:00pm-9:00pm",
  },
  {
    id: "Saturday-1",
    label: "3. Saturday session 1 10:30am-12:30pm",
  },
  {
    id: "Saturday-2",
    label: "4. Saturday session 2 2:00pm-4:00pm",
  },
  {
    id: "Sunday-1",
    label: "5. Sunday session 1 10:30am-12:30pm",
  },
  {
    id: "Sunday-2",
    label: "6. Sunday session 2 2:00pm-4:00pm",
  },
] as const;

const clinics = [
  {
    id:"1",
    label:"Dry Land#1 Tuesday December 5th 2023 7pm Zoom"

  },
  {
    id:"2",
    label:"Dry Land#1 Thursday December 7th 2023 7pm Zoom"

  },
  {
    id:"3",
    label:"On Snow Clinic#1 Saturday December 9th 2023 930am Summit Central"

  },
  {
    id:"4",
    label:"On Snow Clinic#1 Sunday December 10th 2023 930am Summit Central"

  },

  {
    id:"5",
    label:"Dry Land#2 Tuesday December 12th 2023 7pm Zoom"

  },
  {
    id:"6",
    label:"Dry Land#2 Thursday December 14th 2023 7pm Zoom"

  },
  {
    id:"7",
    label:"On Snow Clinic#2 Saturday December 16th 2023 930am Summit Central"

  },
  {
    id:"8",
    label:"On Snow Clinic#2 Sunday December 17th 2023 930am Summit Central"

  },
  {
    id:"9",
    label:"Dry Land#3 Tuesday December 19th 2023 7pm Zoom"

  },
  {
    id:"10",
    label:"Dry Land#3 Thursday December 21st 2023 7pm Zoom"

  },
  {
    id:"11",
    label:"On Snow Clinic#3 Saturday December 30th 2023 930am Summit Central"

  },
  {
    id:"12",
    label:"On Snow Clinic#3 Sunday December 31st 2023 930am Summit Central"

  },
  {
    id:"7",
    label:"Dry Land#4 Tuesday January 2nd 2024 7pm Zoom"

  },
  {
    id:"7",
    label:"Dry Land#4 Thursday January 4th 2024 7pm Zoom"

  },
   {
    id:"11",
    label:"On Snow Clinic#4 Saturday January 6th 2024 930am Summit Central"

  },
  {
    id:"12",
    label:"On Snow Clinic#4 Sunday January 7th 2024 930am Summit Central"

  },

] as const;

const calculateAge = (birthdate: Date | null): number => {
  if (birthdate === null) {
    // Return a default value for age that indicates an invalid or unknown value.
    // Commonly, people use -1 or 0, depending on what makes sense for the application.
    return -1;
  }
  return differenceInYears(new Date(), birthdate);
};
const formSchema = z.object ({
  UniqueID: z.string(),    
  NAME_FIRST: z.string(), 
  NAME_LAST: z.string(),   
  HOME_TEL: z.string(),         
  C_TEL: z.string(),       
  BRTHD:z.date(),       
  AGE:z.number(),         
  E_mail_main:z.string(), 
  ADDRESS: z.string(), 
  CITY: z.string(),         
  STATE: z.string(),       
  ZIP: z.string(),          
  //Employer: z.string(),     
  //Occupation: z.string(),   
  //W_Tel: z.string(),        
  GENDER: z.string(),
});
// const formSchema = z.object({
//   UniqueID: z.string(),
//   NAME_FIRST: z.string().min(1),
//   NAME_LAST: z.string().min(1),
//   HOME_TEL: z.string().min(1),
//   E_MAIL: z.string().email(),
//   C_TEL: z.string().min(1),
//   BRTHD: z.date(),
//   E_mail_main: z.string().email().optional(),
//   ADDRESS: z.string().min(1),
//   CITY: z.string().min(1),
//   STATE: z.string().min(1),
//   ZIP: z.string().min(1),
//   Employer: z.string().min(1),
//   Occupation: z.string().min(1),
//   W_Tel: z.string().min(1),
//   CCPayment: z.string().min(1),
//   DateFeePaid: z.date(),
//   PSIAcertification: z.number(),
//   AASIcertification: z.number(),
//   NumDays: z.number(),
//   ApplyingFor: z.number(),
//   PaymentStatus: z.string().min(1),
//   PROG_CODE: z.string().min(1),
//   Clinic1: z.number(),
//   Clinic2: z.number(),
//   Clinic3: z.number(),
//   Clinic4: z.number(),
//   Clinic5: z.number(),
//   Clinic6: z.number(),
//   AcceptedTerms: z.boolean(),
//   Schedule1: z.boolean(),
//   Schedule2: z.boolean(),
//   Schedule3: z.boolean(),
//   Schedule4: z.boolean(),
//   Schedule5: z.boolean(),
//   Schedule6: z.boolean(),
//   Schedule7: z.boolean(),
//   Schedule8: z.boolean(),
//   Schedule9: z.boolean(),
//   WComment: z.string().optional(),
//   returning: z.boolean(),
// });

type InstructorFormValues = z.infer<typeof formSchema>;

interface InstructorFormProps {
  initialData: Instructor | null;
}
const createDefaultValues = (
  initialData: Instructor | null
): InstructorFormValues => {
  const defaultValues: InstructorFormValues = {
    UniqueID: "",
    NAME_FIRST: "",
    NAME_LAST: "",
    HOME_TEL: "",
    C_TEL: "",
    BRTHD: new Date(),
    E_mail_main: "",
    ADDRESS: "",
    CITY: "",
    STATE: "",
    ZIP: "",
    //Employer: "",
    //Occupation: "",
    //W_Tel: "",
    GENDER:"",
    AGE:0,
    // CCPayment: "",
    // DateFeePaid: new Date(),
    // PSIAcertification: 0,
    // AASIcertification: 0,
    // NumDays: 0,
    // ApplyingFor: 0,
    // PaymentStatus: "",
    // PROG_CODE: "",
    // Clinic1: 0,
    // Clinic2: 0,
    // Clinic3: 0,
    // Clinic4: 0,
    // Clinic5: 0,
    // Clinic6: 0,
    // AcceptedTerms: false,
    // Schedule1: false,
    // Schedule2: false,
    // Schedule3: false,
    // Schedule4: false,
    // Schedule5: false,
    // Schedule6: false,
    // Schedule7: false,
    // Schedule8: false,
    // Schedule9: false,
    // WComment: "",
    // returning: false,
  };

  if (initialData) {
    (Object.keys(defaultValues) as Array<keyof InstructorFormValues>).forEach(
      (key) => {
        if (
          key in initialData &&
          initialData[key] !== null &&
          initialData[key] !== undefined &&
          (typeof initialData[key] !== "string" ||
            (initialData[key] as string).trim() !== "")
        ) {
          switch (key) {
            // case "UniqueID":
            // case "PSIAcertification":
            // case "AASIcertification":
            // case "NumDays":
            // case "ApplyingFor":
            case "AGE":
              defaultValues[key] = initialData[key] as number;
              break;
            case "NAME_FIRST":
            case "NAME_LAST":
            case "HOME_TEL":
            case "E_mail_main":
            case "C_TEL":
            case "ADDRESS":
            case "CITY":
            case "STATE":
            case "ZIP":
            case "UniqueID":
            //case "Employer":
            //case "Occupation":
            //case "W_Tel":
            // case "CCPayment":
            // case "PaymentStatus":
            // case "PROG_CODE":
            // case "WComment":
              defaultValues[key] = initialData[key] as string;
              break;
            case "BRTHD":
            //case "DateFeePaid":
              defaultValues[key] = new Date(initialData[key] as unknown as string);
              break;
            // case "AcceptedTerms":
            // case "returning":
            // case "Schedule1":
            // case "Schedule2":
            // case "Schedule3":
            // case "Schedule4":
            // case "Schedule5":
            // case "Schedule6":
            // case "Schedule7":
            // case "Schedule8":
            // case "Schedule9":
            //   defaultValues[key] = initialData[key] as boolean;
            //   break;
            // default:
            //   // Leave other cases as-is or handle them specifically
            //   break;
          }
        }
      }
    );
  }

  return defaultValues;
};

export const InstructorForm: React.FC<InstructorFormProps> = ({
  initialData,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialData?.BRTHD || null
  );
  const [activeTab, setActiveTab] = useState("personal");
  const title = initialData ? "Edit Instructor" : "Create  Instructor";
  const description = initialData
    ? "Edit a  Instructor."
    : "Add a new  Instructor";
  const toastMessage = initialData
    ? " Instructor updated."
    : " Instructor created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<InstructorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: createDefaultValues(initialData),
  });

  const onSubmit = async (data: InstructorFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.seasonId}/instructors/${params.instructorId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.seasonId}/instructors`, data);
      }
      router.refresh();
      router.push(`/${params.seasonId}/instructors`);
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.seasonId}/instructors/${params.instructorId}`
      );
      router.refresh();
      router.push(`/${params.seasonId}/instructors`);
      toast.success("instructor deleted.");
    } catch (error: any) {
      toast.error(
        "Make sure you removed all categories using this billboard first."
      );
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleBirthdateChange = (
    value: any,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    let date: Date | null = null;

    if (value instanceof Date) {
      date = value;
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      // Assuming range selection is enabled and you are interested in the first date
      date = value[0];
    }

    setSelectedDate(date);

    if (selectedDate) {
      const newAge = calculateAge(selectedDate);
      if (newAge !== null) {
        setAge(newAge);
        form.setValue("AGE", newAge);
        form.setValue("BRTHD", selectedDate);
      } else {
        form.setValue("AGE", newAge);
        form.setValue("BRTHD", selectedDate);
      }
    } else {
      // Handle the case when selectedDate is null
      setAge(null);
      form.setValue("AGE", 0); // or use a default value if the form doesn't accept null
      form.setValue("BRTHD", new Date());
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="UniqueID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RegNum</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="RegNum" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="NAME_FIRST"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="First Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="NAME_LAST"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Last Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ADDRESS"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="CITY"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CITY</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="CITY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="STATE"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>STATE</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="STATE" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ZIP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="ZIP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="HOME_TEL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="HOME_TEL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="E_mail_main"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="BRTHD"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        onChange={handleBirthdateChange}
                        value={selectedDate}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Your date of birth is used to calculate your age.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  value={age !== null ? age.toString() : ""}
                  readOnly
                />
              </FormControl>
            </FormItem>
            <FormField
              control={form.control}
              name="GENDER"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="male" />
                        </FormControl>
                        <FormLabel className="font-normal">Male</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="female" />
                        </FormControl>
                        <FormLabel className="font-normal">Female</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* <Tabs defaultValue="instructorInfo" className="w-[100%]">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="instructorInfo">Instructor Info</TabsTrigger>
              <TabsTrigger value="personalInfo">Personal Info</TabsTrigger>
              <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
              <TabsTrigger value="accounting">Accounting</TabsTrigger>
              <TabsTrigger value="clinics">Clinics</TabsTrigger>
            </TabsList>
            <TabsContent value="instructorInfo">
              <Card>
                <CardHeader>
                  <CardTitle>Instructor Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="md:grid md:grid-cols-3 gap-8">
                  
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="STATUS"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col"
                              >
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Registered" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Registered
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Pre-Registered" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Pre-Registered
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Inactive" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Inactive
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Inactive-NoMail" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Inactive No Mail
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Remove" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Remove
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Do Not Hire" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Do Not Hire
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="comments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comments</FormLabel>
                            <FormControl>
                              <div className="">
                                <Textarea
                                  placeholder=""
                                  className="resize-none"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="prevYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>prev year</FormLabel>
                            <FormControl>
                              <div className="">
                                <Textarea
                                  placeholder=""
                                  className=""
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dateReg"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Registered</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder=""
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dateConfirmed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Confirmed</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder=""
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="emailCommunication"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Email Communication Active</FormLabel>
                              <FormDescription></FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="InstructorType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructor Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Instructor Type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">
                                  Ski Instructor
                                </SelectItem>
                                <SelectItem value="2">
                                  Board Instructor
                                </SelectItem>
                                <SelectItem value="3">
                                  Ski and Board Instructor
                                </SelectItem>
                                <SelectItem value="4">Ski assistant</SelectItem>
                                <SelectItem value="5">
                                  Board assistant
                                </SelectItem>
                                <SelectItem value="6">
                                  Ski and Board Assistant
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex flex-col">
                        <FormField
                          control={form.control}
                          name="PSIA"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>PSIA CERT</FormLabel>
                              <FormControl>
                                <Input
                                  disabled={loading}
                                  placeholder="PSIA"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="AASI"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>AASI CERT</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="AASI CERT"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="testScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Test Score</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="0"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ParentSchoolAuth"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Parent School Authorization</FormLabel>
                              <FormDescription></FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="overNightLodge"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-y-0 space-x-3 mt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Over Night Lodge</FormLabel>
                              <FormDescription></FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="items"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">
                                Age Request made by staff
                              </FormLabel>
                            </div>
                            {ageRequest.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="ageRequest"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(
                                            item.id
                                          )}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([
                                                  ...field.value,
                                                  item.id,
                                                ])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item.id
                                                  )
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {item.label}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="clinicInstructor"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Clinic Instructor</FormLabel>
                              <FormDescription></FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="Supervisor"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Supervisor</FormLabel>
                              <FormDescription></FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="personalInfo">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Info</CardTitle>
                  <CardDescription></CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="md:grid md:grid-cols-2 gap-8">
                  
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="married"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Married</FormLabel>
                              <FormDescription></FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="NAME_SPOUSE"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Spouse Name</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder=""
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="resume"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resume</FormLabel>
                            <FormControl>
                              <div className="">
                                <Textarea
                                  placeholder=""
                                  className="resize-none"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                  
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="instructorCom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instructor Com</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder=""
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="noteToInstr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Note to Instructor</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder=""
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="scheduling">
              <Card>
                <CardHeader>
                  <CardTitle>Instructor Class Scheduling</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="md:grid md:grid-cols-3 gap-8">
                  
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="classReg"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">
                                class scheduling
                              </FormLabel>
                            </div>
                            {classes.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="ageRequest"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(
                                            item.id
                                          )}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([
                                                  ...field.value,
                                                  item.id,
                                                ])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item.id
                                                  )
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {item.label}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>priority</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="0"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="classesPerWeek"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>No. of Classes Per Week</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="0"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="permSub"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Permeanently assigned Substitute
                              </FormLabel>
                              <FormDescription></FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="back2back"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Prefer Back to Back</FormLabel>
                              <FormDescription></FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                   
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="dateModified"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Modified</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder=""
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dateAssigned"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Assigned</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder=""
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="assignmentConf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assignment Confirmed</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder=""
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="numberAssigned"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>No. of classess assigned</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="0"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="classesSign"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>No. of classess signed up</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="0"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="back2back"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Private Lessons</FormLabel>
                            <FormDescription></FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="datesTimes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dates and Times</FormLabel>
                          <FormControl>
                            <Input
                              disabled={loading}
                              placeholder=""
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="accounting">
              <Card>
                <CardHeader>
                  <CardTitle>Accounting</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="md:grid md:grid-cols-3 gap-8">
                    
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="employeeNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Employee Number</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="0"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="payRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pay Rate</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="$0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deductions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Deductions</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="0"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="payCheckNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pay Check No.</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="0"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="payCheckDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pay Check Date</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="0"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="payAdvance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pay Advance</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="$0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="payComment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Comments</FormLabel>
                            <FormControl>
                              <div className="">
                                <Textarea
                                  placeholder=""
                                  className="resize-none"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                   // return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="UniqueID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RegNum</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="RegNum" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="NAME_FIRST"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="First Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="NAME_LAST"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Last Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ADDRESS"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="CITY"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CITY</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="CITY" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="STATE"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>STATE</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="STATE" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ZIP"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="ZIP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="HOME_TEL"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="HOME_TEL"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Email_student"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="BRTHD"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of birth</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        onChange={handleBirthdateChange}
                        value={selectedDate}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Your date of birth is used to calculate your age.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  value={age !== null ? age.toString() : ""}
                  readOnly
                />
              </FormControl>
            </FormItem>
            <FormField
              control={form.control}
              name="GENDER"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="male" />
                        </FormControl>
                        <FormLabel className="font-normal">Male</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="female" />
                        </FormControl>
                        <FormLabel className="font-normal">Female</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="ssn"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SSN</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder="xxx-xx-xxxx"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="payType"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Pay Type</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Regular" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Regular
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="Volunteer" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Volunteer
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="DateFeePaid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date Fee Paid</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder=""
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="disclosureForm"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Disclosure Form Recieved</FormLabel>
                              <FormDescription></FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="disclosureForm"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>I9 Recieved</FormLabel>
                              <FormDescription></FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="disclosureForm"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>W4 Recived</FormLabel>
                              <FormDescription></FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="disclosureForm"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>WSPRecieved</FormLabel>
                              <FormDescription></FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="disclosureForm"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Test Recieved</FormLabel>
                              <FormDescription></FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="disclosureForm"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>ID Recieved</FormLabel>
                              <FormDescription></FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="disclosureForm"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>School Permission</FormLabel>
                              <FormDescription></FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="WSPDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>WSP ACCEPTED</FormLabel>
                            <FormControl>
                              <Input
                                disabled={loading}
                                placeholder=""
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="clinics">
              <Card>
                <CardHeader>
                  <CardTitle>Clinics</CardTitle>
                </CardHeader>
                <CardContent>
                <FormField
                        control={form.control}
                        name="clinics"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">
                                clinics scheduling
                              </FormLabel>
                            </div>
                            {clinics.map((item) => (
                              <FormField
                                key={item.id}
                                control={form.control}
                                name="clinics"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={item.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(
                                            item.id
                                          )}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([
                                                  ...field.value,
                                                  item.id,
                                                ])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== item.id
                                                  )
                                                );
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {item.label}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  <div className="md:grid md:grid-cols-3 gap-8">
                   
                    <div className="space-y-2">
                      
                    </div>

                    
                    <div className="space-y-2">
                      
                    </div>

                    
                    <div className="space-y-2">
                      
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs> */}
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
