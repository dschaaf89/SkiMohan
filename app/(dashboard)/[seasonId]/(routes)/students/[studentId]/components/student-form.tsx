"use client";

import * as z from "zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormContext } from "react-hook-form";
import { toast } from "react-hot-toast";
import { CalendarIcon, Trash } from "lucide-react";
import { Student } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import React, { MouseEvent } from "react";
import {
  ProgramDetails,
  mondayPrograms,
  tuesdayPrograms,
  wednesdayPrograms,
  thursdayPrograms,
  fridayNightPrograms,
  saturdayPrograms,
  sundayPrograms,
} from "./programDropdown";
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
import "react-calendar/dist/Calendar.css";
import { cn } from "@/lib/utils";
import { differenceInYears } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const calculateAge = (birthdate: Date | null): number => {
  if (birthdate === null) {
    // Return a default value for age that indicates an invalid or unknown value.
    // Commonly, people use -1 or 0, depending on what makes sense for the application.
    return -1;
  }
  return differenceInYears(new Date(), birthdate);
};
const calculateAgeGroup = (birthdate: Date | null): number => {
  if (birthdate === null) {
    // Return a default value for age that indicates an invalid or unknown value.
    // Commonly, people use -1 or 0, depending on what makes sense for the application.
    return -1;
  }
  const nextYear = new Date().getFullYear() + 1;
  const jan1stNextYear = new Date(nextYear, 0, 1);
  return differenceInYears(jan1stNextYear, birthdate);
};

const getAllPrograms = () => {
  return [
    ...mondayPrograms,
    ...tuesdayPrograms,
    ...wednesdayPrograms,
    ...thursdayPrograms,
    ...fridayNightPrograms,
    ...saturdayPrograms,
    ...sundayPrograms,
  ];
};

const formSchema = z.object({
  UniqueID: z.string().min(1),
  NAME_FIRST: z.string().min(1),
  NAME_LAST: z.string().min(1),
  HOME_TEL: z.string().optional(),
  ADDRESS: z.string().min(1),
  CITY: z.string().min(1),
  STATE: z.string().min(1),
  ZIP: z.string().min(1),
  student_tel: z.string().optional(),
  Email_student: z.string().optional(),
  BRTHD: z.date(),
  AGE: z.number(),
  GradeLevel: z.string().optional(),
  APPLYING_FOR: z.string().optional(),
  LEVEL: z.string().optional(),
  Approach: z.string().optional(),
  E_mail_main: z.string().optional(),
  E_NAME: z.string().optional(),
  E_TEL: z.string().optional(),
  CCPayment: z.string().optional(),
  ProgCode: z.string().optional(),
  BUDDY: z.string().optional(),
  WComment: z.string().optional(),
  DateFeePaid: z.string().optional(),
  PaymentStatus: z.string().optional(),
  AcceptedTerms: z.boolean().optional(),
  AppType: z.number().optional(),
  Employer: z.string().optional(),
  C_TEL: z.string().optional(),
  Occupation: z.string().optional(),
  W_TEL: z.string().optional(),
  AGRESSIVENESS: z.string().optional(),
  GENDER: z.string().optional(),
  AGE_GROUP: z.number().optional(),
  FeeComment: z.string().optional(),
  DAY: z.string().optional(),
  StartTime: z.string().optional(),
  EndTime: z.string().optional(),
  classID: z.number().optional(),
  status: z.string().optional(),
  //updateAt:z.date().optional(),
});

type StudentFormValues = z.infer<typeof formSchema>;

interface StudentFormProps {
  initialData: Student | null;
}
const createDefaultValues = (
  initialData: Student | null,
  allPrograms: ProgramDetails[]
): StudentFormValues => {
  const defaultValues: StudentFormValues = {
    UniqueID: "",
    NAME_FIRST: "",
    NAME_LAST: "",
    HOME_TEL: "",
    ADDRESS: "",
    CITY: "",
    STATE: "",
    ZIP: "",
    student_tel: "",
    Email_student: "",
    BRTHD: new Date(),
    AGE: 0,
    GradeLevel: "",
    APPLYING_FOR: "",
    LEVEL: "",
    Approach: "",
    E_mail_main: "",
    E_NAME: "",
    E_TEL: "",
    CCPayment: "",
    ProgCode: "",
    BUDDY: "",
    WComment: "",
    DateFeePaid: "",
    PaymentStatus: "",
    AcceptedTerms: false,
    AppType: 0,
    Employer: "",
    C_TEL: "",
    Occupation: "",
    W_TEL: "",
    AGE_GROUP: 0,
    AGRESSIVENESS: "",
    GENDER: "",
    FeeComment: "",
    DAY: "",
    StartTime: "",
    EndTime: "",
    classID: 0,
    status: "",
    //updateAt:new Date(),
  };

  if (initialData) {
    const initialProgram = allPrograms.find(
      (p) => p.code === initialData.ProgCode
    );

    if (initialProgram) {
      defaultValues.StartTime = initialProgram.startTime;
      defaultValues.EndTime = initialProgram.endTime;
      defaultValues.ProgCode = initialProgram.program;
    }
    //   //const initialProgram= initialData.ProgCode;
    // // Set StartTime and EndTime based on the found program
    // if (initialProgram) {
    //   defaultValues.StartTime = initialData.StartTime ||'';
    //   defaultValues.EndTime = initialData.EndTime || '';
    // }
    (Object.keys(defaultValues) as Array<keyof StudentFormValues>).forEach(
      (key) => {
        // Check if the key exists in initialData and if it's not null or undefined
        if (
          key in initialData &&
          initialData[key] !== null &&
          initialData[key] !== undefined &&
          (typeof initialData[key] !== "string" ||
            (initialData[key] as string).trim() !== "")
        ) {
          // Explicitly specify the types for assignment
          switch (key) {
            case "UniqueID":
            case "NAME_FIRST":
            case "NAME_LAST":
            case "ADDRESS":
            case "CITY":
            case "STATE":
            case "ZIP":
            case "HOME_TEL":
            case "student_tel":
            case "Email_student":
            case "GradeLevel":
            case "APPLYING_FOR":
            case "LEVEL":
            case "Approach":
            case "E_mail_main":
            case "E_NAME":
            case "E_TEL":
            case "CCPayment":
            case "BUDDY":
            case "WComment":
            case "DateFeePaid":
            case "PaymentStatus":

            case "Employer":
            case "C_TEL":
            case "Occupation":
            case "W_TEL":
            case "AGRESSIVENESS":
            case "GENDER":
            case "FeeComment":
            case "DAY":
            case "ProgCode":
            case "StartTime":
            case "EndTime":
              defaultValues[key] =
                initialData[key] !== null ? (initialData[key] as string) : "";
              break;

            // case "ProgCode":
            //   // Use the ProgCode from initialProgram if available, otherwise fall back to initialData
            //   defaultValues[key] = initialProgram
            //     ? initialProgram.code
            //     : (initialData[key] as string) || "";
            //   break;
            // case "StartTime":
            //   // Use the StartTime from initialProgram if available, otherwise fall back to initialData
            //   defaultValues[key] = initialProgram
            //     ? initialProgram.startTime
            //     : (initialData[key] as string) || "";
            //   break;
            // case "EndTime":
            //   // Use the EndTime from initialProgram if available, otherwise fall back to initialData
            //   defaultValues[key] = initialProgram
            //     ? initialProgram.endTime
            //     : (initialData[key] as string) || "";
            //   break;

            case "status":
              defaultValues[key] =
                initialData[key] != null
                  ? (initialData[key] as string)
                  : "Registered";
              break;
            case "BRTHD":
              // case"updateAt":
              defaultValues[key] = initialData[key]
                ? new Date(initialData[key])
                : new Date();

              break;
            case "AGE":
              defaultValues.AGE = calculateAge(initialData.BRTHD);
              break;
            case "AppType":
              defaultValues.AppType = (initialData[key] as number) || 0;
              break;
            case "AGE_GROUP":
              defaultValues.AGE_GROUP = (initialData[key] as number) || 0;
              break;
            case "classID":
              defaultValues.classID = (initialData[key] as number) || 0;
              break;
            case "AcceptedTerms":
              defaultValues[key] =
                initialData[key] != null ? Boolean(initialData[key]) : false;
              break;

            default:
              if (initialData[key] !== null && initialData[key] !== undefined) {
                defaultValues[key] = initialData[key];
              }
              break;
          }
        }
      }
    );
  }
  console.log("Default values set from initialData", defaultValues);
  return defaultValues;
};

export const StudentForm: React.FC<StudentFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const [allPrograms, setAllPrograms] = useState<ProgramDetails[]>(
    getAllPrograms()
  );

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState<number | null>(null);
  const [ageGroup, setAgeGroup] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialData?.BRTHD || null
  );
  const [selectedDay, setSelectedDay] = useState("");
  const [programs, setPrograms] = useState<ProgramDetails[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ProgramDetails | null>(
    null
  );

  const title = initialData ? "Edit Student" : "Create Student";
  const description = initialData ? "Edit a Student." : "Add a new Student";
  const toastMessage = initialData ? "Student updated." : "Student created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<StudentFormValues>({
    //resolver: zodResolver(formSchema),
    defaultValues: createDefaultValues(initialData, allPrograms),
  });

  useEffect(() => {
    if (initialData && initialData.ProgCode) {
      // Assume getAllPrograms is a function that returns all programs regardless of the day
      const allPrograms = getAllPrograms();
      const programToSelect = allPrograms.find(
        (p) => p.code === initialData.ProgCode
      );
      if (programToSelect) {
        setSelectedProgram(programToSelect);
        // If the day is also being set from initial data, make sure to update it
        setSelectedDay(programToSelect.day);
        // Filter programs based on the selected day
        setPrograms(allPrograms.filter((p) => p.day === programToSelect.day));
      }
    }
  }, [initialData]);

  const onSubmit = async (data: StudentFormValues) => {
    try {
      // Debugging form data
      console.log("Form Data:", data);

      // Ensure that classID is a string. If it's undefined, use a default value or handle accordingly.
      const classIdValue = data.classID?.toString() ?? "0";
      const classIdNumber = parseInt(classIdValue, 10);

      if (isNaN(classIdNumber)) {
        console.error("Invalid classID");
        return;
      }

      const submissionData = {
        ...data,
        classID: classIdNumber,
        ProgCode: selectedProgram?.code || "",
        StartTime: selectedProgram?.startTime || "",
        EndTime: selectedProgram?.endTime || "",
      };

      // Log submission data
      console.log("Submission Data:", submissionData);

      setLoading(true);

      if (initialData) {
        console.log("Updating student...");
        await axios.patch(
          `/api/${params.seasonId}/students/${params.studentId}`,
          submissionData
        );
      } else {
        console.log("Creating new student...");
        await axios.post(`/api/${params.seasonId}/students`, submissionData);
      }

      router.refresh();
      router.push(`/${params.seasonId}/students`);
      toast.success(toastMessage);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (selectedDay: string) => {
    setSelectedDay(selectedDay);

    // Filter the programs based on the selected day directly
    const filteredPrograms = allPrograms.filter((p) => p.day === selectedDay);

    setPrograms(filteredPrograms);
    setSelectedProgram(null);
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.seasonId}/students/${params.studentId}`
      );
      router.refresh();
      router.push(`/${params.seasonId}/students`);
      toast.success("student deleted.");
    } catch (error: any) {
      toast.error(
        "Make sure you removed all categories using this billboard first."
      );
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleStatusChange = (value: string) => {
    console.log("Status changed to:", value);
    // Assuming `field.onChange` is your method to update the form state
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
      const ageGroup = calculateAgeGroup(selectedDate);
      if (newAge !== null) {
        setAge(newAge);
        setAgeGroup(ageGroup);
        form.setValue("AGE", newAge);
        form.setValue("AGE_GROUP", ageGroup);
        form.setValue("BRTHD", selectedDate);
      } else {
        form.setValue("AGE", newAge);
        form.setValue("AGE_GROUP", ageGroup);
        form.setValue("BRTHD", selectedDate);
      }
    } else {
      // Handle the case when selectedDate is null
      setAge(null);
      form.setValue("AGE", 0); // or use a default value if the form doesn't accept null
      form.setValue("BRTHD", new Date());
    }
  };
  useEffect(() => {
    if (initialData?.BRTHD) {
      const birthdate = new Date(initialData.BRTHD);
      const age = calculateAge(birthdate);
      const ageGroup = calculateAgeGroup(birthdate);
      setAge(age);
      setAgeGroup(ageGroup);
    }
  }, [initialData]);

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
            <FormItem>
              <FormLabel>Age Group</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  value={ageGroup !== null ? ageGroup.toString() : ""}
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
                <FormItem>
                  <FormLabel>Skill Level</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // handleDayChange(value); // Remove this line if not needed for skill levels
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Skill Level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">Level 1</SelectItem>
                      <SelectItem value="2">Level 2</SelectItem>
                      <SelectItem value="3">Level 3</SelectItem>
                      <SelectItem value="4">Level 4</SelectItem>
                      <SelectItem value="5">Level 5</SelectItem>
                      <SelectItem value="6">Level 6</SelectItem>
                      <SelectItem value="7">Level 7</SelectItem>
                      <SelectItem value="8">Level 8</SelectItem>
                      <SelectItem value="9">Level 9</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="AppType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Session type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value as unknown as string}
                      className="flex flex-col"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={1 as any} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Lesson Only
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={2 as any} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Transportation Only
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={3 as any} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Lesson and Transportation Only
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
              name="DAY"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Day</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleDayChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
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
                    onValueChange={(value) => {
                      field.onChange(value); // You may need this for React Hook Form to detect the change
                      const selected = programs.find((p) => p.code === value);
                      setSelectedProgram(selected || null);
                      console.log("Selected Program:", selected);
                    }}
                    defaultValue={initialData?.ProgCode || field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Program" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Here you map over the programs state to render options */}
                      {programs.map((program) => (
                        <SelectItem key={program.code} value={program.code}>
                          {program.program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="StartTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      value={selectedProgram ? selectedProgram.startTime : ""}
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="EndTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End TIme</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      value={selectedProgram ? selectedProgram.endTime : ""}
                      readOnly
                    />
                  </FormControl>
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
              name="CCPayment"
              render={({ field }) => (
                <FormItem className="m-10">
                  <FormLabel>fee</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder=""
                      {...field}
                      readOnly
                    />
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
                    <Input
                      disabled={loading}
                      placeholder=""
                      {...field}
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
           <FormField
          control={form.control}
          name="AcceptedTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                
              </FormControl>
              <FormLabel>
                  Accepted Terms
                </FormLabel>
            </FormItem>
          )}
        />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        console.log(value);
                      }}
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
                          <RadioGroupItem value="Unregistered" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Unregistered
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="waitlist" />
                        </FormControl>
                        <FormLabel className="font-normal">Waitlist</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="classID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class ID</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="classID"
                      {...field}
                      value={field.value || initialData?.classId || null} // Fallback to 0, as it's numeric
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <FormField
              control={form.control}
              name="updateAt"
              render={({ field }) => (
                <FormItem className="m-10">
                  <FormLabel>Date Modified</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
