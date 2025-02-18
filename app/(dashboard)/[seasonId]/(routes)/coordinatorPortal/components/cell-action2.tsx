"use-client";
import { UpdateStudentWaitlistModal } from "@/components/modals/update-Student-waitlist";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { StudentColumn } from "../../students/components/columns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, MoreHorizontal, Edit, Trash } from "lucide-react"; // Import Copy icon
import { useUser } from "@clerk/nextjs"; // Import Clerk's useUser hook

interface CellActionProps {
  data: StudentColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [initialStudentInfo, setInitialStudentInfo] = useState<StudentColumn | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const router = useRouter();
  const params = useParams(); // Get params
  const { user } = useUser(); // Get user information from Clerk
  const isAdmin = user?.publicMetadata?.role === "admin"; // Check if the user is an Admin
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [open, setOpen] = useState(false);

  // Ensure that seasonId is a string
  const seasonId = Array.isArray(params.seasonId) ? params.seasonId[0] : params.seasonId;

  const handleWaitlistToPending = async (updatedInfo: Partial<StudentColumn>) => {
    try {
      setUpdateLoading(true);

      // Update the student status to "Pending Payment"
      await axios.patch(`/api/${seasonId}/students/${updatedInfo.UniqueID}`, {
        status: "Pending Payment",
      });

      // Ensure the data is fully populated by merging with original 'data'
      const fullStudentInfo: StudentColumn = { ...data, ...updatedInfo };

      // Open modal to send the payment link with fully populated data
      setInitialStudentInfo(fullStudentInfo);
      setIsWaitlistModalOpen(true);

      toast.success("Student status updated to 'Pending Payment'.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to move student to Registered.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const toggleWaitlistModal = (student: StudentColumn) => {
    setInitialStudentInfo(student); // Set initial student info before opening modal
    setIsWaitlistModalOpen(true); // Opens modal when triggered
  };

  // Function to copy email to clipboard
  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText(data.E_mail_main); // Copy the student's email
    toast.success("Email copied to clipboard!"); // Show a success toast message
  };

  return (
    <>
      {/* Render UpdateStudentWaitlistModal */}
      {initialStudentInfo && (
        <UpdateStudentWaitlistModal
          isOpen={isWaitlistModalOpen}
          onClose={() => setIsWaitlistModalOpen(false)}
          onUpdate={handleWaitlistToPending}  // Move to pending here
          initialInfo={initialStudentInfo}
          loading={updateLoading}
          seasonId={seasonId} // Pass the seasonId here
        />
      )}

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

          {/* Move to Registered action */}
          <DropdownMenuItem onClick={() => toggleWaitlistModal(data)}>
            <Edit className="mr-2 h-4 w-4" />Move to Registered
          </DropdownMenuItem>

          {/* Copy Email action */}
          <DropdownMenuItem onClick={copyEmailToClipboard}>
            <Copy className="mr-2 h-4 w-4" />Copy Email
          </DropdownMenuItem>

          {/* Conditionally render Delete action if user is Admin */}
          {isAdmin && (
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <Trash className="mr-2 h-4 w-4" />Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
