"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
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
import ImageUpload from "@/components/ui/image-upload";
import { Program } from "@prisma/client";

const formSchema = z.object({
  name: z.string().min(2),
  imageUrl: z.string().min(1),
});

type ProgramFormValues = z.infer<typeof formSchema>;

interface ProgramFormProps {
  initialData: Program | null;
}

export const ProgramForm: React.FC<ProgramFormProps> = ({ initialData }) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit Program" : "Create Program";
  const description = initialData ? "Edit a Program." : "Add a new Program";
  const toastMessage = initialData ? "Program updated." : "Program created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      imageUrl: "",
    },
  });

  const onSubmit = async (data: ProgramFormValues) => {
    console.log("Form submission data:", data); // Debugging line to check form data

    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.seasonId}/programs/${params.ProgramId}`,
          data
        );
      } else {
        await axios.post(`/api/${params.seasonId}/programs`, data);
      }
      router.refresh();
      router.push(`/${params.seasonId}/programs`);
      toast.success(toastMessage);
    } catch (error: any) {
      console.error("Error during form submission:", error); // Debugging line to catch errors
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.seasonId}/programs/${params.ProgramId}`
      );
      router.refresh();
      router.push(`/${params.seasonId}/programs`);
      toast.success("Program deleted.");
    } catch (error: any) {
      toast.error(
        "Make sure you removed all products using this Program first."
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
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background image</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value ? [field.value] : []}
                  disabled={loading}
                  onChange={(url) => {
                    console.log("Image uploaded URL received in form:", url); // Debugging line
                    field.onChange(url); // Update the form state with the new URL
                  }}
                  onRemove={() => field.onChange("")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="Program name"
                      {...field}
                    />
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
