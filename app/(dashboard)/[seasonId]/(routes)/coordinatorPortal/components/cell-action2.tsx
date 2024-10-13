"use-client";
import { UpdateStudentWaitlistModal } from "@/components/modals/update-Student-waitlist";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { StudentColumn } from "../../students/components/columns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash } from "lucide-react";

interface CellActionProps {
  data: StudentColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [initialStudentInfo, setInitialStudentInfo] = useState<StudentColumn | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const router = useRouter();
  const params = useParams(); // Get params
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [open, setOpen] = useState(false);

  // Ensure that seasonId is a string
  const seasonId = Array.isArray(params.seasonId) ? params.seasonId[0] : params.seasonId;

  const handleWaitlistToPending = async (updatedInfo: Partial<StudentColumn>) => {
    try {
      setUpdateLoading(true);

      // Update the student status to "Pending Payment" first
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
          <DropdownMenuItem onClick={() => toggleWaitlistModal(data)}>
            <Edit className="mr-2 h-4 w-4" />Move to Registered
          </DropdownMenuItem>
          {/* Delete action */}
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
