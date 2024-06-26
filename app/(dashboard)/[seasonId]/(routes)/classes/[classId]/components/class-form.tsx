"use client";

import * as z from "zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { CalendarIcon, Trash } from "lucide-react";
import { Classes, Student } from "@prisma/client";
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
import { X } from "lucide-react";
import { SearchBar } from "../../components/search-bar/searchbar";
import { SearchResultsList } from "../../components/search-bar/searchResultList";
interface StudentConnection {
  connect: Array<{ id: string }>;
}

interface Instructor {
  id: string;
  NAME_FIRST: string;
  NAME_LAST: string;
  HOME_TEL: string;
  C_TEL: string; // Add other properties as needed
}

interface InitialData {
  // ... other fields ...
  students?: StudentConnection | null;
}

interface StudentDetail {
  id: string;
  name: string;
  age: number;
  skillLevel: string;
  APPLYING_FOR: string;
  E_mail_main: string;
}
const formSchema = z.object({
  classId: z.number(),
  meetColor: z.string().optional(),
  meetingPoint: z.number().optional(),
  instructor: z.string().optional(),
  instructorID: z.number().optional(),
  Level: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  Age: z.number().optional(),
  day: z.string().optional(),
  assistant: z.string().optional(),
  assistantId: z.string().optional(),
});
const timeMapping = {
  Friday: { startTime: "7:00 PM", endTime: "9:00 PM" },
  "Saturday Morning": { startTime: "10:30 AM", endTime: "12:30 PM" },
  "Saturday Afternoon": { startTime: "2:00 PM", endTime: "4:00 PM" },
  "Sunday Morning": { startTime: "10:30 AM", endTime: "12:30 PM" },
  "Sunday Afternoon": { startTime: "2:00 PM", endTime: "4:00 PM" },
  // Add other days and times as necessary
};
type ClassFormValues = z.infer<typeof formSchema>;

interface ClassFormProps {
  initialData: Classes | null;
}
const createDefaultValues = (initialData: Classes | null): ClassFormValues => {
  const defaultValues: ClassFormValues = {
    classId: 0,
    Level: initialData?.Level ?? "",
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

  const dayToClassTimeIdMapping: { [key: string]: number } = {
    Friday: 2,
    "Saturday Morning": 3,
    "Saturday Afternoon": 4,
    "Sunday Morning": 5,
    "Sunday Afternoon": 6,
  };

  const onSubmit = async (data: ClassFormValues) => {
    console.log("Selected Instructor Name:", selectedInstructorName);
    console.log("Selected Instructor Phone:", selectedInstructorPhone);
    // Include instructor name and phone in the submission data
    const submissionData = {
      ...data,
      instructor: selectedInstructorId
        ? { connect: { id: selectedInstructorId } }
        : undefined,
      assistant: selectedAssistantId
        ? { connect: { id: selectedAssistantId } }
        : undefined,
      instructorName: selectedInstructorName,
      instructorPhone: selectedInstructorPhone,
    };
    console.log("Submitting data with classId:", submissionData);

    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.seasonId}/classes/${params.classId}`,
          submissionData
        );
      } else {
        await axios.post(`/api/${params.seasonId}/classes`, submissionData);
      }
      router.refresh();
      //router.push(`/${params.seasonId}/classes`);
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
      await axios.delete(`/api/${params.seasonId}/classes/${params.classId}`);
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
  const [studentSearch, setStudentSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  // To store search results
  const [addedStudents, setAddedStudents] = useState([]); // To store added students
  const [studentNames, setStudentNames] = useState<string[]>([]);
  const [studentDetails, setStudentDetails] = useState<StudentDetail[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [assistants, setAssistants] = useState<Instructor[]>([]);
  const [classTimeId, setClassTimeId] = useState<number | undefined>(undefined);
  const [selectedInstructorId, setSelectedInstructorId] = useState<
    string | null | undefined
  >();
  const [selectedAssistantId, setSelectedAssistantId] = useState<
    string | null | undefined
  >();
  const [selectedInstructorName, setSelectedInstructorName] = useState("");
  const [selectedInstructorPhone, setSelectedInstructorPhone] = useState("");
  const [selectedAssistantName, setSelectedAssistantName] = useState("");
  const [selectedAssistantPhone, setSelectedAssitantPhone] = useState("");
  const [studentsToAdd, setStudentsToAdd] = useState<string[]>([]);
  const [studentsToRemove, setStudentsToRemove] = useState<string[]>([]);
  useEffect(() => {
    async function fetchData() {
      if (!classTimeId) {
        console.error("Class time ID is not available.");
        return;
      }

      // Fetch Instructors
      try {
        const responseInstructors = await axios.get(
          `/api/${params.seasonId}/classes/availableInstructors?classTimeId=${classTimeId}`
        );
        console.log("Fetched instructors:", responseInstructors.data); // This line logs the fetched instructor data

        setInstructors(responseInstructors.data);
      } catch (error) {
        console.error("Error fetching instructors", error);
        setInstructors([]);
      }

      // Fetch Assistants
      try {
        const responseAssistants = await axios.get(
          `/api/${params.seasonId}/classes/availableAssistants?classTimeId=${classTimeId}`
        );
        setAssistants(responseAssistants.data);
      } catch (error) {
        console.error("Error fetching assistants", error);
        setAssistants([]);
      }
    }

    fetchData();
  }, [classTimeId, params.seasonId]);
  useEffect(() => {
    if (initialData) {
      form.reset({
        ...form.getValues(),
        classId: initialData.classId,
        meetColor: initialData.meetColor!,
        meetingPoint: initialData.meetingPoint!,
        day: initialData.day,
        Age: initialData.Age!,
        Level: initialData.Level!,
      });

      if (
        instructors.some(
          (instructor) => instructor.id === initialData.instructorId
        )
      ) {
        setSelectedInstructorId(initialData.instructorId);
      }
      if (
        assistants.some((assistant) => assistant.id === initialData.assistantId)
      ) {
        setSelectedAssistantId(initialData.assistantId);
      }
    }
  }, [initialData, instructors, assistants, form]);

  useEffect(() => {
    if (initialData && typeof initialData.day === "string") {
      const dayKey = initialData.day as keyof typeof dayToClassTimeIdMapping;
      if (dayKey in dayToClassTimeIdMapping) {
        const newClassTimeId = dayToClassTimeIdMapping[dayKey];
        setClassTimeId(newClassTimeId);
      }
    }
  }, [initialData, dayToClassTimeIdMapping]);


  useEffect(() => {
    const fetchStudentNames = async () => {
      const studentData = initialData?.students as unknown as StudentConnection | undefined;
      if (studentData?.connect) {
        const details = await Promise.all(
          studentData.connect.map(async ({ id }) => {
            try {
              const response = await axios.get(`/api/${params.seasonId}/students/${id}`);
              const student = response.data;
              return {
                id: student.id,
                name: `${student.NAME_FIRST ?? ""} ${student.NAME_LAST ?? ""}`.trim(),
                age: student.AGE,
                skillLevel: student.LEVEL,
                APPLYING_FOR: student.APPLYING_FOR,
                E_mail_main: student.E_mail_main,
              };
            } catch (error) {
              console.error("Error fetching student data", error);
              return null;
            }
          })
        );
        setStudentDetails(details.filter((detail) => detail !== null) as StudentDetail[]);
      }
    };
  
    if ((initialData?.students as unknown as StudentConnection | undefined)?.connect) {
      fetchStudentNames();
    }
  }, [initialData, params.seasonId]);
  useEffect(() => {
    const fetchStudents = async () => {
      // Fetch the student list (consider doing this once and storing the result if it doesn't change often)
      const response = await axios.get(`/api/${params.seasonId}/students/findStudnet`);
      const allStudents = response.data;

      // Filter students based on the search query
      const filteredStudents = allStudents.filter((student:Student) =>
        student.NAME_LAST.toLowerCase().includes(studentSearch.toLowerCase())
      );

      setSearchResults(filteredStudents);
    };

    if (studentSearch.length > 1) {
      // Maybe trigger the search after at least 2 characters have been typed
      fetchStudents();
    } else {
      setSearchResults([]); // Clear search results if the search query is cleared
    }
  }, [params.seasonId,studentSearch]);

  useEffect(() => {
    // Check if initialData is available and the 'day' field is a string
    if (initialData && typeof initialData.day === "string") {
      const dayKey = initialData.day as keyof typeof timeMapping;
      if (dayKey in timeMapping) {
        // Find the corresponding time mapping for the selected day
        const times = timeMapping[dayKey];
        // Set the start and end times in the form
        form.setValue("startTime", times.startTime);
        form.setValue("endTime", times.endTime);
      }
    }
  }, [initialData, form]);

  const handleInstructorChange = (value: string) => {
    console.log("Selected Instructor ID:", value);
    setSelectedInstructorId(value);
    form.setValue("instructor", value);

    // Find the selected instructor and set name and phone
    const instructor = instructors.find((i) => i.id === value);
    if (instructor) {
      const fullName = `${instructor.NAME_FIRST} ${instructor.NAME_LAST}`;
      const phone = instructor.HOME_TEL || instructor.C_TEL; // Using HOME_TEL or C_TEL as the phone number
      setSelectedInstructorName(fullName);
      setSelectedInstructorPhone(phone);

      console.log(`Selected Instructor Name: ${fullName}`);
      console.log(`Selected Instructor Phone: ${phone}`);
    }
  };
  const handleAssistantChange = (value: string) => {
    setSelectedAssistantId(value);
    form.setValue("assistant", value);

    // Find the selected instructor and set name and phone
    const instructor = instructors.find((i) => i.id === value);
    if (instructor) {
      const fullName = `${instructor.NAME_FIRST} ${instructor.NAME_LAST}`;
      const phone = instructor.HOME_TEL || instructor.C_TEL; // Using HOME_TEL or C_TEL as the phone number
      setSelectedAssistantName(fullName);
      setSelectedAssitantPhone(phone);

      console.log(`Selected Instructor Name: ${fullName}`);
      console.log(`Selected Instructor Phone: ${phone}`);
    }
  };
  const handleRemoveStudent = (studentId: string) => {
    setStudentDetails((prev) =>
      prev.filter((student) => student.id !== studentId)
    );
    setStudentsToRemove((prev) => [...prev, studentId]);
  };
  const handleAddStudent = (student: Student) => {
    console.log("Selected student:", student);
    // Add your logic here, for example, adding the student to a selected list
  };


  const handleSelectStudent = (student: Student) => {
    // Handle the selection logic, e.g., adding the student to a selected list
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
                        <Select
                          onValueChange={handleInstructorChange}
                          value={selectedInstructorId || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Instructor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {instructors.map((instructor) => (
                              <SelectItem
                                key={instructor.id}
                                value={instructor.id}
                              >
                                {`${instructor.NAME_FIRST} ${instructor.NAME_LAST}`}{" "}
                                {/* Concatenating first and last name */}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Assistants Name */}
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="instructor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assistant</FormLabel>
                        <Select
                          onValueChange={handleAssistantChange}
                          value={selectedAssistantId || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Assistant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {assistants.map((assistants) => (
                              <SelectItem
                                key={assistants.id}
                                value={assistants.id}
                              >
                                {`${assistants.NAME_FIRST} ${assistants.NAME_LAST}`}{" "}
                                {/* Concatenating first and last name */}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                <div className="relative">                 
                </div>

                <h3>Student Names</h3>
                {/* {console.log(studentNames)} */}
                <ul>
                  {studentDetails.map((student, index) => (
                    <li key={index}>
                      Name: {student.name}
                      <button
                        onClick={() => handleRemoveStudent(student.id)}
                        aria-label="Remove student"
                        style={{ color: "red" }} // Inline styling for red color
                        className="p-1" // Add padding, adjust as needed
                      >
                        <X className="w-6 h-6 hover:scale-110 transition-transform" />{" "}
                        {/* Adjust size as needed */}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Third Column */}
              <div className="w-full md:w-1/3 px-2 mb-4 md:mb-0">
                <FormField
                  control={form.control}
                  name="Level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1/2 novice">1/2 novice</SelectItem>
                          <SelectItem value="3/4 inter">3/4 Int</SelectItem>
                          <SelectItem value="5/6 adv inter">
                            5/6 Int ADV
                          </SelectItem>
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
                  name="Age"
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
                  name="day"
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
                {/* Start Time */}
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

                {/* End Time */}
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
