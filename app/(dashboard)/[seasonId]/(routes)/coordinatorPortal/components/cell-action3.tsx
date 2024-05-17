"use-client";
import { UpdateVolunteerModal } from "@/components/modals/update-volunteer-modal";

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

import { VolunteerColumn } from "../../volunteers/components/columns";

interface CellActionProps {
  data: VolunteerColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [initialVolunteerInfo, setInitialVolunteerInfo] =
    useState<VolunteerColumn | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);


  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.seasonId}/Volunteers/${data.id}`);
      router.refresh();
      router.push(`/${params.seasonId}/Volunteers`);
      toast.success("Volunteer deleted.");
    } catch (error: any) {
      toast.error("Volunteer not deleted");
    } finally {
      setLoading (false);
      setOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedInfo((prevInfo) => ({
       ...prevInfo,
       [name]: value || "", // Ensure valid value or default
    }));
 };

 const handleUpdate = async (updatedInfo: Partial<VolunteerColumn>) => {
  try {
     setUpdateLoading(true);

     // Merge updatedInfo with initial data, retaining unmodified fields
     const finalInfo = { ...initialVolunteerInfo, ...updatedInfo };

     // Ensure necessary fields retain valid values or set defaults
     if (!finalInfo.busChaperoneSchool) {
        finalInfo.busChaperoneSchool = initialVolunteerInfo?.busChaperoneSchool || ""; // Retain initial value or set default
     }
     if (!finalInfo.emergencyDriverDay) {
        finalInfo.emergencyDriverDay = initialVolunteerInfo?.emergencyDriverDay || ""; // Retain initial value or set default
     }
     if (!finalInfo.homePhone) {
        finalInfo.homePhone = initialVolunteerInfo?.homePhone || ""; // Retain initial value or set default
     }

     await axios.patch(`/api/${params.seasonId}/volunteers/${finalInfo.id}`, finalInfo);

     setInitialVolunteerInfo(null);
     setIsEditModalOpen(false);
     router.refresh();
     toast.success("Volunteer information updated.");
  } catch (error) {
     toast.error("Failed to update volunteer information.");
  } finally {
     setUpdateLoading(false);
  }
};


  // State to manage modal visibility for editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Function to toggle modal visibility for editing
  const toggleEditModal = (volunteer: VolunteerColumn) => {
    setInitialVolunteerInfo(volunteer); // Set initial Volunteer info
    setIsEditModalOpen(!isEditModalOpen); // Toggle edit modal
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false); // Properly close the modal
  };

  return (
    <>
      {/* Render UpdateVolunteerModal for editing */}
      <UpdateVolunteerModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose} // Close without arguments
        onUpdate={handleUpdate}
        initialInfo={initialVolunteerInfo}
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
          <DropdownMenuItem onClick={() => toggleEditModal(data)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
function setUpdatedInfo(arg0: (prevInfo: any) => any) {
  throw new Error("Function not implemented.");
}

