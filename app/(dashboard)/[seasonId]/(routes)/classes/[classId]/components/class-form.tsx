"use client";

import * as z from "zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { CalendarIcon, Trash } from "lucide-react";
import { Classes} from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import React, { MouseEvent } from "react";
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


interface StudentConnection {
  connect: Array<{ id: string }>;
}
interface InitialData {
  // ... other fields ...
  students?: StudentConnection | null;
}

interface Student {
  id: string;
  // other properties
}

const formSchema = z.object({
  classId:z.number(),
  meetColor:z.string().optional(),
  meetingPoint: z.number().optional(),
  instructor:z.string().optional(),
  instructorID:z.number().optional(),
  skillLevel: z.string().optional(),
  startTime:z.string().optional(),
  endTime: z.string().optional(),
  AgeGroup:z.number().optional(),
  Day:z.string().optional(),



});

type ClassFormValues = z.infer<typeof formSchema>;

interface ClassFormProps {
  initialData: Classes | null;
}
const createDefaultValues = (
  initialData: Classes | null,
): ClassFormValues => {
  const defaultValues: ClassFormValues = {
    classId: 0,
    skillLevel:initialData?.Level,
  };
  return defaultValues; // Make sure this return statement is present
};

export const ClassForm: React.FC<ClassFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();


  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);


  const title = initialData ? "Edit Class" : "Create Class";
  const description = initialData ? "Edit a Class." : "Add a new Class";
  const toastMessage = initialData ? "Class updated." : "Class created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: createDefaultValues(initialData),
  });

 

  const onSubmit = async (data: ClassFormValues) => {
    const submissionData = {
      ...data,
    };
    console.log("Submitted data", data);
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.seasonId}/classes/${params.classId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.seasonId}/classes`, submissionData);
      }
      router.refresh();
      router.push(`/${params.seasonId}/classes`);
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
        `/api/${params.seasonId}/classes/${params.classId}`
      );
      router.refresh();
      router.push(`/${params.seasonId}/classes`);
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
  const [studentSearch, setStudentSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]); // To store search results
  const [addedStudents, setAddedStudents] = useState([]); // To store added students
  const [studentNames, setStudentNames] = useState<string[]>([]);


  useEffect(() => {
    // Explicitly assert the type of initialData.students
    const studentData = initialData?.students as StudentConnection | undefined;

    if (studentData?.connect) {
      const fetchStudentNames = async () => {
        const names = await Promise.all(
          studentData.connect.map(async ({ id }: { id: string }) => {
            try {
              const response = await axios.get(`/api/${params.seasonId}/students/${id}`);
              const student = response.data;
              console.log(student);
              // Handle potential null values in student.NAME_FIRST and student.NAME_LAST
              return `${student.NAME_FIRST ?? ''} ${student.NAME_LAST ?? ''}`.trim();
            } catch (error) {
              console.error("Error fetching student data", error);
              return '';
            }
          })
        );
        setStudentNames(names.filter(name => name !== ''));
      };
      fetchStudentNames();
    }
  }, [initialData]);

  // Function to handle adding a student
  // const handleAddStudent = (student) => {
  //   if (addedStudents.some((s) => s.UniqueId === student.UniqueId)) {
  //     toast.error('This student is already added to a class.');
  //     return;
  //   }
  //   setAddedStudents((prevStudents) => [...prevStudents, student]);
  //   setStudentSearch('');
  // };

  // // Function to handle removing a student
  // const handleRemoveStudent = (studentId) => {
  //   setAddedStudents((prevStudents) => prevStudents.filter((s) => s.id !== studentId));
  // };

  // // Function to handle student search
  // const handleStudentSearch = async (searchTerm) => {
  //   // Simulate an API call to search for students by name or UniqueId
  //   const matchingStudents = allStudents.filter((student) =>
  //     student.name.includes(searchTerm) || student.UniqueId.includes(searchTerm)
  //   );
  //   setSearchResults(matchingStudents);
  // };

  useEffect(() => {
    // This block of code will run when the component mounts,
    // and whenever the dependencies (initialData or form) change.
    console.log("initialData:", initialData); // Check the structure and values
    if (initialData) {
      // If initialData is provided, it means we're editing an existing class,
      // and we need to populate the form fields with this data.
  
      form.reset({
        classId: initialData.classId,
        meetColor: initialData.meetColor,
        meetingPoint:initialData.meetingPoint,
        Day:initialData.day,
        AgeGroup:initialData.Age,
        skillLevel:initialData.Level,
        

        // ... include mappings for other fields present in initialData
      });
    }
  }, [initialData, form]);
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
          <div className="border border-black p-4">
            <div className="flex flex-wrap -mx-2">
              {/* First Column */}
              <div className="w-full md:w-1/3 px-2 mb-4">
              <FormField
          control={form.control}
          name="meetColor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meet Color</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
        control={form.control}
        name="meetingPoint"
        render={({ field }) => (
          <FormItem>
            <FormLabel>MeetingPoint</FormLabel>
            <FormControl>
              <Input type="number" placeholder="" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

        {/* Instructor Name */}
        <div className="mt-4">
        <FormField
          control={form.control}
          name="instructor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructor</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Red">Red</SelectItem>
                  <SelectItem value="Yellow">Yellow</SelectItem>
                  <SelectItem value="Blue">Blue</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        </div>

        {/* Instructor ID */}
        <FormField
        control={form.control}
        name="instructorID"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instructor ID:</FormLabel>
            <FormControl>
              <Input type="number" placeholder="" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
              </div>

         {/* Second Column */}
<div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">

  {/* Class ID */}
  <FormField
    control={form.control}
    name="classId"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Class ID</FormLabel>
        <FormControl>
          <Input type="number" placeholder="" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
   <input
    type="text"
    value={studentSearch}
    onChange={(e) => setStudentSearch(e.target.value)}
    placeholder="Search by name or UniqueId"
  />

<h3>Student Names</h3>
{console.log(studentNames)}
                <ul>
                    {studentNames.map((name, index) => (
                        <li key={index}>{name}</li>
                    ))}
                </ul>
  </div>

 
              {/* Third Column */}
              <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
              <FormField
          control={form.control}
          name="skillLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skill Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1/2 novice">1/2 novice</SelectItem>
                  <SelectItem value="3/4 inter">3/4 Int</SelectItem>
                  <SelectItem value="5/6 adv inter">5/6 Int ADV</SelectItem>
                  <SelectItem value="7/8 advance">7/8 ADV</SelectItem>
                  <SelectItem value="9 ATAC">9 ATAC</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
                 <FormField
          control={form.control}
          name="AgeGroup"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age Group</FormLabel>
              <FormControl>
                <Input placeholder="" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="Day"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Day</FormLabel>
              <FormControl>
                <Input placeholder="Day" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Time:</FormLabel>
              <FormControl>
                <Input placeholder="Start Time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Time:</FormLabel>
              <FormControl>
                <Input placeholder="End Time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
                {/* Date */}
                {/* Session Time */}
                {/* Your form fields for the third column */}
              </div>
            </div>

            {/* Signature and Checklist */}
            {/* Your form fields for signature and checklist */}
          </div>
    
      


          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
