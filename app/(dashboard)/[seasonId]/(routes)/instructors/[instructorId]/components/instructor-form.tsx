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
import React, { MouseEvent } from 'react';

import { Input } from "@/components/ui/input";
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
import 'react-calendar/dist/Calendar.css';
import { cn } from "@/lib/utils";
import { differenceInYears } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";


type CalendarValue = Date | Date[] | null;



const calculateAge = (birthdate: Date | null): number => {
  if (birthdate === null) {
    // Return a default value for age that indicates an invalid or unknown value.
    // Commonly, people use -1 or 0, depending on what makes sense for the application.
    return -1;
  }
  return differenceInYears(new Date(), birthdate);
};

const formSchema = z.object({
  UniqueID: z.number(),
  NAME_FIRST: z.string().min(1),
  NAME_LAST: z.string().min(1),
  HOME_TEL: z.string().min(1),
  E_MAIL: z.string().email(),
  C_TEL: z.string().min(1),
  BRTHD: z.date(),
  E_mail_main: z.string().email().optional(),
  ADDRESS: z.string().min(1),
  CITY: z.string().min(1),
  STATE: z.string().min(1),
  ZIP: z.string().min(1),
  Employer: z.string().min(1),
  Occupation: z.string().min(1),
  W_Tel: z.string().min(1),
  CCPayment: z.string().min(1),
  DateFeePaid: z.date(),
  PSIAcertification: z.number(),
  AASIcertification: z.number(),
  NumDays: z.number(),
  ApplyingFor: z.number(),
  PaymentStatus: z.string().min(1),
  PROG_CODE: z.string().min(1),
  Clinic1: z.number(),
  Clinic2: z.number(),
  Clinic3: z.number(),
  Clinic4: z.number(),
  Clinic5: z.number(),
  Clinic6: z.number(),
  AcceptedTerms: z.boolean(),
  Schedule1: z.boolean(),
  Schedule2: z.boolean(),
  Schedule3: z.boolean(),
  Schedule4: z.boolean(),
  Schedule5: z.boolean(),
  Schedule6: z.boolean(),
  Schedule7: z.boolean(),
  Schedule8: z.boolean(),
  Schedule9: z.boolean(),
  WComment: z.string().optional(),
  returning: z.boolean(),
});

type InstructorFormValues = z.infer<typeof formSchema>;

interface InstructorFormProps {
  initialData: Instructor | null;
}
const createDefaultValues = (initialData: Instructor | null): InstructorFormValues => {
  const defaultValues: InstructorFormValues = {
    UniqueID: 0,
    NAME_FIRST: "",
    NAME_LAST: "",
    HOME_TEL: "",
    E_MAIL: "",
    C_TEL: "",
    BRTHD: new Date(),
    E_mail_main: "",
    ADDRESS: "",
    CITY: "",
    STATE: "",
    ZIP: "",
    Employer: "",
    Occupation: "",
    W_Tel: "",
    CCPayment: "",
    DateFeePaid: new Date(),
    PSIAcertification: 0,
    AASIcertification: 0,
    NumDays: 0,
    ApplyingFor: 0,
    PaymentStatus: "",
    PROG_CODE: "",
    Clinic1: 0,
    Clinic2: 0,
    Clinic3: 0,
    Clinic4: 0,
    Clinic5: 0,
    Clinic6: 0,
    AcceptedTerms: false,
    Schedule1: false,
    Schedule2: false,
    Schedule3: false,
    Schedule4: false,
    Schedule5: false,
    Schedule6: false,
    Schedule7: false,
    Schedule8: false,
    Schedule9: false,
    WComment: "",
    returning: false,
};

if (initialData) {
  (Object.keys(defaultValues) as Array<keyof InstructorFormValues>).forEach(key => {
    if (
      key in initialData &&
      initialData[key] !== null &&
      initialData[key] !== undefined &&
      (typeof initialData[key] !== "string" || (initialData[key] as string).trim() !== "")
    ) {
      switch (key) {
        case "UniqueID":
        case "PSIAcertification":
        case "AASIcertification":
        case "NumDays":
        case "ApplyingFor":
          defaultValues[key] = initialData[key] as number;
          break;
        case "NAME_FIRST":
        case "NAME_LAST":
        case "HOME_TEL":
        case "E_MAIL":
        case "C_TEL":
        case "ADDRESS":
        case "CITY":
        case "STATE":
        case "ZIP":
        case "Employer":
        case "Occupation":
        case "W_Tel":
        case "CCPayment":
        case "PaymentStatus":
        case "PROG_CODE":
        case "WComment":
          defaultValues[key] = initialData[key] as string;
          break;
        case "BRTHD":
        case "DateFeePaid":
          defaultValues[key] = new Date(initialData[key] as string);
          break;
        case "AcceptedTerms":
        case "returning":
        case "Schedule1":
        case "Schedule2":
        case "Schedule3":
        case "Schedule4":
        case "Schedule5":
        case "Schedule6":
        case "Schedule7":
        case "Schedule8":
        case "Schedule9":
          defaultValues[key] = initialData[key] as boolean;
          break;
        default:
          // Leave other cases as-is or handle them specifically
          break;
      }
    }
  });
}

  return defaultValues;
};

export const InstructorForm: React.FC<InstructorFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialData?.BRTHD || null);

  const title = initialData ? "Edit Instructor" : "Create  Instructor";
  const description = initialData ? "Edit a  Instructor." : "Add a new  Instructor";
  const toastMessage = initialData ? " Instructor updated." : " Instructor created.";
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
          `/api/${params.seasonId}/instructors/${params. instructorId}`,
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


    const handleBirthdateChange = (value: any, event: React.MouseEvent<HTMLButtonElement>) => {
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
                  <FormLabel>HOME_TEL</FormLabel>
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
              name="GradeLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Grade Level of student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="K">Kindergarden</SelectItem>
                      <SelectItem value="1">1st</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="7">7</SelectItem>
                      <SelectItem value="8">8</SelectItem>
                      <SelectItem value="9">9</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="11">11</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Calendar onChange={handleBirthdateChange} value={selectedDate} />
                     
                     
                     {/* <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          // Call handleBirthdateChange when a date is selected
                          console.log(date);
                          handleBirthdateChange(date);
                          // You might need to convert the date to a proper format before setting
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      /> */}
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
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="APPLYING_FOR"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Applying For</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="SKI" />
                        </FormControl>
                        <FormLabel className="font-normal">SKI</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="BOARD" />
                        </FormControl>
                        <FormLabel className="font-normal">BOARD</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Transportation" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          TRANSPORTATION
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
              name="LEVEL"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Level</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="1/2 novice" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          1/2 novice
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="3/4 inter" />
                        </FormControl>
                        <FormLabel className="font-normal">3/4 inter</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="5/6 adv inter" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          5/6 adv inter
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="7/8 advance" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          7/8 Advance
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="9 atac" />
                        </FormControl>
                        <FormLabel className="font-normal">9 ATAC</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ProgCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PROGRAM</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="PROGRAM" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BALL">BALL</SelectItem>
                      <SelectItem value="EAST">EAST</SelectItem>
                      <SelectItem value="ECKS">ECKS</SelectItem>
                      <SelectItem value="G110">G110</SelectItem>
                      <SelectItem value="G115">G115</SelectItem>
                      <SelectItem value="G120">G120</SelectItem>
                      <SelectItem value="G125">G125</SelectItem>
                      <SelectItem value="G710">G710</SelectItem>
                      <SelectItem value="G715">G715</SelectItem>
                      <SelectItem value="G720">G720</SelectItem>
                      <SelectItem value="G725">G725</SelectItem>
                      <SelectItem value="HAML">HAML</SelectItem>
                      <SelectItem value="JANE">JANE</SelectItem>
                      <SelectItem value="ROOS">ROOS</SelectItem>
                      <SelectItem value="NATH">NATH</SelectItem>
                      <SelectItem value="LINC">LINC</SelectItem>
                      <SelectItem value="WHIT">WHIT</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="AGRESSIVENESS"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>AGRESSIVENESS</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="AGRESSIVENESS"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Approach"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approach</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="approach"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="BUDDY"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Friend Rqst</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Buddy Request"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="WComment"
              render={({ field }) => (
                <FormItem className="m-10">
                  <FormLabel>Comment</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="DateFeePaid"
              render={({ field }) => (
                <FormItem className="m-10">
                  <FormLabel>Date Registered</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
