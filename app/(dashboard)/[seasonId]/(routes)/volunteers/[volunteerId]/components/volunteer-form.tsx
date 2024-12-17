"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { CalendarIcon, Trash } from "lucide-react";
import "react-calendar/dist/Calendar.css";
import { Volunteer } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "react-calendar";

const formSchema = z.object({
  id: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  birthDate: z.date().optional(),
  homePhone: z.string().optional(),
  mobilePhone: z.string(),
  workPhone: z.string().optional(),
  Address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  email: z.string(),
  employerSchool: z.string().optional(),
  occupationGrade: z.string().optional(),
  isGreeter: z.boolean().optional(),
  isProgramCoordinator: z.boolean().optional(),
  isBusChaperone: z.boolean().optional(),
  busChaperoneSchool: z.string().optional(),
  isEmergencyDriver: z.boolean().optional(),
  emergencyDriverDay: z.string().optional(),
  applicantStatus: z.string().optional().optional(), // Correcting the type here
  agreeToTerms: z.boolean().optional(),
  busChaperoneWk1: z.boolean().optional(),
  busChaperoneWk2: z.boolean().optional(),
  busChaperoneWk3: z.boolean().optional(),
  busChaperoneWk4: z.boolean().optional(),
  busChaperoneWk5: z.boolean().optional(),
  busChaperoneWk6: z.boolean().optional(),
  emergencyDriverWk1: z.boolean().optional(),
  emergencyDriverWk2: z.boolean().optional(),
  emergencyDriverWk3: z.boolean().optional(),
  emergencyDriverWk4: z.boolean().optional(),
  emergencyDriverWk5: z.boolean().optional(),
  emergencyDriverWk6: z.boolean().optional(),
  GreetTimeSlot: z.string().optional(),
  WSPRecieved: z.boolean().optional(),
});

type VolunteerFormValues = z.infer<typeof formSchema>;

interface VolunteerFormProps {
  initialData: Volunteer | null;
}

export const VolunteerForm: React.FC<VolunteerFormProps> = ({
  initialData,
}) => {
  const params = useParams();
  const router = useRouter();
  const [isGreeterChecked, setIsGreeterChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isBusChaperoneChecked, setBusChaperoneChecked] = useState(false);
  const [isEmergencyDriverChecked, setEmergencyDriverChecked] = useState(false);
  const title = initialData ? "Edit Volunteer" : "Create Volunteer";
  const description = initialData ? "Edit a Volunteer." : "Add a new Volunteer";
  const toastMessage = initialData
    ? "Volunteer updated."
    : "Volunteer created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<VolunteerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      id: "",
      firstName: "",
      lastName: "",
      birthDate: new Date(),
      homePhone: "",
      mobilePhone: "",
      workPhone: "",
      Address: "",
      city: "",
      state: "",
      zipCode: "",
      email: "",
      employerSchool: "",
      occupationGrade: "",
      isGreeter: false,
      isProgramCoordinator: false,
      isBusChaperone: false,
      busChaperoneSchool: "",
      isEmergencyDriver: false,
      emergencyDriverDay: "",
      applicantStatus: "", // Valid enum value// Make sure it's undefined here
      agreeToTerms: false,
      busChaperoneWk1: false,
      busChaperoneWk2: false,
      busChaperoneWk3: false,
      busChaperoneWk4: false,
      busChaperoneWk5: false,
      busChaperoneWk6: false,
      emergencyDriverWk1: false,
      emergencyDriverWk2: false,
      emergencyDriverWk3: false,
      emergencyDriverWk4: false,
      emergencyDriverWk5: false,
      emergencyDriverWk6: false,
      GreetTimeSlot: "",
      WSPRecieved: false,
    },
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    form.control._formValues.birthDate ?? null // Ensure correct initialization
  );
  const handleCheckboxChange = (
    type: "busChaperone" | "emergencyDriver",
    checked: boolean
  ) => {
    if (type === "busChaperone") {
      setBusChaperoneChecked(checked);
    } else if (type === "emergencyDriver") {
      setEmergencyDriverChecked(checked);
    }
  };

  const validDate = selectedDate ?? undefined; // Ensure it's not null

  const handleBirthdateChange = (
    value: any,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    let date: Date | null = null;

    // Determine if value is a single Date or the first date in an array
    if (value instanceof Date) {
      date = value; // Direct assignment
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      date = value[0]; // First date in range
    }

    setSelectedDate(date); // Update the state with the selected date

    // Set the birthdate in the form, handling possible null cases
    form.setValue("birthDate", date ?? new Date()); // Use current date as a default
  };

  const onSubmit = async (data: VolunteerFormValues) => {
    alert(data);
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.seasonId}/volunteers/${params.volunteerId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.seasonId}/volunteers`, data);
      }
      router.refresh();
      router.push(`/${params.seasonId}/volunteers`);
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
        `/api/${params.seasonId}/volunteers/${params.volunteerId}`
      );
      router.refresh();
      router.push(`/${params.seasonId}/volunteers`);
      toast.success("Volunteer deleted.");
    } catch (error: any) {
      toast.error(
        "Make sure you removed all categories using this Volunteer first."
      );
    } finally {
      setLoading(false);
      setOpen(false);
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
              name="firstName"
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
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="last Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Address"
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
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="state" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zip</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="zip" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
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
              name="birthDate"
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mobilePhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cell Phone</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Cell Phone"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="homePhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Phone</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="homePhone"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="workPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Work Phone</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="workPhone"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="WSPRecieved"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>WSP Recieved</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="employerSchool"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employer School</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified email to display" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Ballard">Ballard</SelectItem>
                      <SelectItem value="SouthJackon">South Jackson</SelectItem>
                      <SelectItem value="SalmonBay">Salmon Bay</SelectItem>
                      <SelectItem value="Eastside Catholic">
                        Eastside Catholic
                      </SelectItem>
                      <SelectItem value="Interlake">Interlake</SelectItem>
                      <SelectItem value="Meadowbrook">Meadowbrook</SelectItem>
                      <SelectItem value="North East Seattle">
                        North East Seattle
                      </SelectItem>
                      <SelectItem value="Roosevelt">Roosevelt</SelectItem>
                      <SelectItem value="Soundview">Soundview</SelectItem>
                      <SelectItem value="Thorton Creek">
                        Thorton Creek
                      </SelectItem>
                      <SelectItem value="Wallingford">Wallingford</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="occupationGrade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>occupation</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="occupation"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isProgramCoordinator"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Program Coordinator</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isBusChaperone"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked: boolean) => {
                        field.onChange(checked); // Update form state
                        handleCheckboxChange("busChaperone", checked); // Update local state
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Bus Chaperone</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isEmergencyDriver"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked: boolean) => {
                        field.onChange(checked); // Update form state
                        handleCheckboxChange("emergencyDriver", checked); // Update local state
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Emergency Driver</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isGreeter"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked: boolean) => {
                        field.onChange(checked);
                        setIsGreeterChecked(checked);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Greeter</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="agreeToTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Agree to Terms</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Conditional rendering based on the checkbox state */}
            {/* Conditional rendering of Programs field for Greeter */}
            {isGreeterChecked && (
              <FormField
                control={form.control}
                name="GreetTimeSlot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day and Time Slot</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SaturdayMorning">
                          Saturday 10:30 AM - 12:30pm
                        </SelectItem>
                        <SelectItem value="SaturdayAfternoon">
                          Saturday 02:00pm - 04:00pm
                        </SelectItem>
                        <SelectItem value="SundayMorning">
                          Sunday 10:30 AM - 12:30pm
                        </SelectItem>
                        <SelectItem value="SundayAfternoon">
                          Sunday 02:00pm - 04:00pm
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {isBusChaperoneChecked ? (
              <div className="scheduling">
                Scheduling
                <FormField
                  control={form.control}
                  name="busChaperoneWk1"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Bus Chaperone WK1</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="busChaperoneWk2"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Bus Chaperone WK2</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="busChaperoneWk3"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Bus Chaperone WK3</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="busChaperoneWk4"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Bus Chaperone WK4</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="busChaperoneWk5"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Bus Chaperone WK5</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="busChaperoneWk6"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Bus Chaperone WK6</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            ) : null}
            {/* Conditional rendering based on the checkbox state */}
            {isEmergencyDriverChecked ? (
              <div className="scheduling">
                Scheduling
                <FormField
                  control={form.control}
                  name="emergencyDriverWk1"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Emergency Driver WK1</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyDriverWk2"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Emergency Driver WK2</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyDriverWk3"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Emergency Driver WK3</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyDriverWk4"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Emergency Driver WK4</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyDriverWk5"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Emergency Driver WK5</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyDriverWk6"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Emergency Driver WK6</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            ) : null}
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
