"use client";

import * as z from "zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash, X } from "lucide-react";
import { Classes } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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

interface Instructor {
  UniqueID: number;
  NAME_FIRST: string;
  NAME_LAST: string;
  HOME_TEL: string;
  C_TEL: string;
}

interface StudentDetail {
  UniqueID: number;
  oldIds: string;
  NAME_FIRST: string;
  NAME_LAST: string;
  AGE: number;
  LEVEL: string;
  APPLYING_FOR: string;
  E_mail_main: string;
}

interface StudentConnection {
  connect: Array<{ id: string }>;
}

const formSchema = z.object({
  classId: z.number(),
  meetColor: z.string().optional(),
  meetingPoint: z.number().optional(),
  instructorID: z.number().optional(),
  Level: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  Age: z.number().optional(),
  day: z.string().optional(),
  assistantId: z.number().optional(),
});

type ClassFormValues = z.infer<typeof formSchema>;

interface ClassFormProps {
  initialData: (Classes & {
    students?: StudentDetail[];
    oldStudents?: StudentConnection;
  }) | null;
}

export const ClassForm: React.FC<ClassFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studentDetails, setStudentDetails] = useState<StudentDetail[]>([]);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classId: initialData?.classId || 0,
      meetColor: initialData?.meetColor || "",
      meetingPoint: initialData?.meetingPoint || 0,
      instructorID: initialData?.instructorId || 0,
      assistantId: initialData?.assistantId || 0,
      Level: initialData?.Level || "",
      startTime: initialData?.startTime || "",
      endTime: initialData?.endTime || "",
      Age: initialData?.Age || 0,
      day: initialData?.day || "",
    },
  });

  const title = initialData ? "Edit Class" : "Create Class";
  const description = initialData ? "Edit a Class." : "Add a new Class";
  const toastMessage = initialData ? "Class updated." : "Class created.";
  const action = initialData ? "Save changes" : "Create";

  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [assistants, setAssistants] = useState<Instructor[]>([]);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>("");
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>("");

  const onSubmit = async (data: ClassFormValues) => {
    try {
      setLoading(true);
      const submissionData = {
        ...data,
        instructorID: selectedInstructorId
          ? Number(selectedInstructorId)
          : undefined,
        assistantId: selectedAssistantId
          ? Number(selectedAssistantId)
          : undefined,
      };

      if (initialData) {
        await axios.patch(
          `/api/${params.seasonId}/classes/${params.classId}`,
          submissionData
        );
      } else {
        await axios.post(`/api/${params.seasonId}/classes`, submissionData);
      }

      toast.success(toastMessage);
      router.refresh();
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
      toast.success("Class deleted.");
      router.push(`/${params.seasonId}/classes`);
    } catch (error: any) {
      toast.error("Error deleting the class.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        let students: StudentDetail[] = [];

        // Fetch students using the current structure if available
        if (initialData?.students && initialData.students.length > 0) {
          students = initialData.students;
        } else if (initialData?.oldStudents) {
          // Handle backwards compatibility for oldStudents
          const studentConnections = initialData.oldStudents.connect;
          if (!studentConnections) return;

          const uniqueIds = studentConnections
            .map((conn) => Number(conn.id))
            .filter((id) => !isNaN(id)); // Filter valid numbers for UniqueID
          const oldIds = studentConnections
            .map((conn) => conn.id)
            .filter((id) => isNaN(Number(id))); // Filter strings for oldIds

          // Fetch students by UniqueID
          if (uniqueIds.length > 0) {
            const { data: uniqueIdStudents } = await axios.get(
              `/api/${params.seasonId}/students`,
              {
                params: {
                  UniqueID: uniqueIds, // Pass UniqueIDs as a query parameter
                },
              }
            );
            students = uniqueIdStudents;
          }

          // Fetch students by oldIds
          if (oldIds.length > 0) {
            const { data: oldIdStudents } = await axios.get(
              `/api/${params.seasonId}/students/byOldId`,
              {
                params: {
                  oldIds: oldIds.join(","), // Pass oldIds as a query parameter
                },
              }
            );
            students = [...students, ...oldIdStudents]; // Merge results
          }
        }

        // Map the fetched student data into the format needed for the component
        const studentDetails = students.map((student) => ({
          UniqueID: student.UniqueID,
          oldIds: student.oldIds,
          NAME_FIRST: student.NAME_FIRST,
          NAME_LAST: student.NAME_LAST,
          AGE: student.AGE,
          LEVEL: student.LEVEL,
          APPLYING_FOR: student.APPLYING_FOR,
          E_mail_main: student.E_mail_main,
        }));

        setStudentDetails(studentDetails);
      } catch (error) {
        console.error("Error fetching student data", error);
      }
    };

    fetchStudentDetails();
  }, [initialData, params.seasonId]);

  const handleInstructorChange = (value: string) => {
    setSelectedInstructorId(value);
  };

  const handleAssistantChange = (value: string) => {
    setSelectedAssistantId(value);
  };

  const handleRemoveStudent = (studentId: number) => {
    setStudentDetails((prevDetails) =>
      prevDetails.filter((student) => student.UniqueID !== Number(studentId))
    );
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
                        <Input placeholder="Color" {...field} />
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
                      <FormLabel>Meeting Point</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Point" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Instructor Name */}
                <FormField
                  control={form.control}
                  name="instructorID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instructor</FormLabel>
                      <Select
                        onValueChange={handleInstructorChange}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Instructor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {instructors.map((instructor) => (
                            <SelectItem
                              key={instructor.UniqueID}
                              value={instructor.UniqueID.toString()}
                            >
                              {`${instructor.NAME_FIRST} ${instructor.NAME_LAST}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Assistant Name */}
                <FormField
                  control={form.control}
                  name="assistantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assistant</FormLabel>
                      <Select
                        onValueChange={handleAssistantChange}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Assistant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {assistants.map((assistant) => {
                            console.log("Rendering Assistant:", assistant);
                            return (
                              <SelectItem
                                key={assistant.UniqueID}
                                value={assistant.UniqueID.toString()}
                              >
                                {`${assistant.NAME_FIRST} ${assistant.NAME_LAST}`}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
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
                        <Input type="number" placeholder="ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <h3>Student Names</h3>
                <ul>
                  {studentDetails.map((student, index) => (
                    <li key={index}>
                      {`Name: ${student.NAME_FIRST} ${student.NAME_LAST}, Age: ${student.AGE}, Skill Level: ${student.LEVEL}`}
                      <button
                        onClick={() => handleRemoveStudent(student.UniqueID)}
                        aria-label="Remove student"
                        style={{ color: "red" }}
                        className="p-1"
                      >
                        <X className="w-6 h-6 hover:scale-110 transition-transform" />
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
                            <SelectValue placeholder="Select Level" />
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
                        <Input type="number" placeholder="Age" {...field} />
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
                      <FormLabel>Start Time</FormLabel>
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
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input placeholder="End Time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
