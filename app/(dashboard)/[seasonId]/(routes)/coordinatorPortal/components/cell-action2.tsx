"use-client";
import { UpdateStudentModal } from "@/components/modals/update-student-modal";
import { UpdateStudentWaitlistModal } from "@/components/modals/update-Student-waitlist";
import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { StudentColumn } from "../../students/components/columns";
interface CellActionProps {
  data: StudentColumn;
}
// Inside the CellAction component
export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [initialStudentInfo, setInitialStudentInfo] =
    useState<StudentColumn | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.seasonId}/students/${data.id}`);
      router.refresh();
      router.push(`/${params.seasonId}/students`);
      toast.success("student deleted.");
    } catch (error: any) {
      toast.error("student not deleted");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleUpdate = async (updatedInfo: Partial<StudentColumn>) => {
    try {
      setUpdateLoading(true);

      // Convert the BRTHD field to an ISO-8601 date format
      // Convert `BRTHD` into a valid ISO-8601 format
      if (updatedInfo.BRTHD) {
        const formattedDate = new Date(updatedInfo.BRTHD).toISOString();
        updatedInfo.BRTHD = formattedDate;
      }
      if (updatedInfo.updateAt) {
        updatedInfo.updateAt = new Date(updatedInfo.updateAt).toISOString();
      }

      // Make an API call to update the student's information
      await axios.patch(
        `/api/${params.seasonId}/students/${updatedInfo.id}`,
        updatedInfo
      );

      setInitialStudentInfo(null); // Reset initial student info
      setIsEditModalOpen(false); // Close the edit modal
      router.refresh(); // Refresh the page or update data as needed
      toast.success("Student information updated.");
    } catch (error) {
      toast.error("Failed to update student information.");
    } finally {
      setUpdateLoading(false);
    }
  };

  // State to manage modal visibility for editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Function to toggle modal visibility for editing

  const handleModalClose = () => {
    setIsEditModalOpen(false); // Properly close the modal
  };

  const toggleWaitlistModal = (student: StudentColumn) => {
    setInitialStudentInfo(student);
    setIsWaitlistModalOpen(!isWaitlistModalOpen);
  };

  const handleWaitlistToRegistered = async (
    updatedInfo: Partial<StudentColumn>
  ) => {
    try {
      setUpdateLoading(true);

      updatedInfo.status = "Registered"; // Update status to "Registered"

      await axios.patch(
        `/api/${params.seasonId}/students/${updatedInfo.id}`,
        updatedInfo
      );

      if (updatedInfo.E_mail_main) {
        await axios.post("/api/send-payslip", {
          email: updatedInfo.E_mail_main,
        });
      }

      setInitialStudentInfo(null);
      setIsWaitlistModalOpen(false);
      router.refresh();
      toast.success("Student information updated.");
    } catch (error) {
      toast.error("Failed to update student information.");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <>
      {/* Render UpdateStudentModal for editing */}
         <UpdateStudentWaitlistModal
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
        onUpdate={handleWaitlistToRegistered}
        initialInfo={initialStudentInfo}
        loading={updateLoading}
      />

      {/* Rest of your code */}

      {/* Dropdown menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open Menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => toggleWaitlistModal(data)}>
            <Edit className="mr-2 h-4 w-4"/>Move to Registered
          </DropdownMenuItem>
          {/* Delete action */}
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
