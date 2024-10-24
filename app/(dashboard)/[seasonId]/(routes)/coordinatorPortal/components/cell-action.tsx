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
import { Copy,Edit, MoreHorizontal, Trash } from "lucide-react";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { StudentColumn } from "../../students/components/columns";
import { useUser } from "@clerk/nextjs"; // Clerk hook to get user information


interface CellActionProps {
  data: StudentColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [initialStudentInfo, setInitialStudentInfo] =
    useState<StudentColumn | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useUser(); // Get user info from Clerk
  const isAdmin = user?.publicMetadata?.role === "admin"; // Check if user is an Admin

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.seasonId}/students/${data.UniqueID}`);
      router.refresh();
      router.push(`/${params.seasonId}/students`);
      toast.success("Student deleted.");
    } catch (error: any) {
      toast.error("Student not deleted");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const handleUpdate = async (updatedInfo: Partial<StudentColumn>) => {
    try {
      setUpdateLoading(true);

      if (updatedInfo.BRTHD) {
        const formattedDate = new Date(updatedInfo.BRTHD).toISOString();
        updatedInfo.BRTHD = formattedDate;
      }
      if (updatedInfo.updateAt) {
        updatedInfo.updateAt = new Date(updatedInfo.updateAt).toISOString();
      }

      await axios.patch(
        `/api/${params.seasonId}/students/${updatedInfo.UniqueID}`,
        updatedInfo
      );

      setInitialStudentInfo(null);
      setIsEditModalOpen(false);
      router.refresh();
      toast.success("Student information updated.");
    } catch (error) {
      toast.error("Failed to update student information.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const toggleEditModal = (student: StudentColumn) => {
    setInitialStudentInfo(student);
    setIsEditModalOpen(!isEditModalOpen);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
  };

  // Function to copy email to clipboard
  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(data.E_mail_main); // Copy email
    toast.success("Email copied to clipboard!"); // Show toast message
  };

  return (
    <>
      {/* Render UpdateStudentModal for editing */}
      <UpdateStudentModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        onUpdate={handleUpdate}
        initialInfo={initialStudentInfo}
        loading={updateLoading}
      />

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

          {/* Edit action */}
          <DropdownMenuItem onClick={() => toggleEditModal(data)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>

          {/* Copy Email action */}
          <DropdownMenuItem onClick={copyEmailToClipboard}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Email
          </DropdownMenuItem>

          {/* Conditionally render Delete option if user is an Admin */}
          {isAdmin && (
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
