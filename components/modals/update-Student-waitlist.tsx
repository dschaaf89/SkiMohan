import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { StudentColumn } from "@/app/(dashboard)/[seasonId]/(routes)/students/components/columns";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; // Add this for page refresh

export interface UpdateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedInfo: Partial<StudentColumn>) => void;
  initialInfo: StudentColumn | null;
  loading: boolean;
  seasonId: string; // Include seasonId in props
}

export const UpdateStudentWaitlistModal: React.FC<UpdateStudentModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  initialInfo,
  loading,
  seasonId,
}) => {
  const [updatedInfo, setUpdatedInfo] = useState<Partial<StudentColumn> | null>(null);
  const router = useRouter(); // Use Next.js router

  useEffect(() => {
    if (initialInfo) {
      setUpdatedInfo({ ...initialInfo });
    }
  }, [initialInfo]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdatedInfo((prevInfo) => ({
      ...prevInfo,
      [name]: value,
    }));
  };

  // Handle Sending the Payslip
  const handleSendPayslip = async () => {
   if (updatedInfo?.E_mail_main) {
     try {
       // API call to send payslip
       const response = await axios.post("/api/send-payment-link", {
         studentEmail: updatedInfo.E_mail_main,
         studentId: updatedInfo.UniqueID, // Use the student ID
         seasonId: seasonId,
       });
 
       if (response.status === 200) {
         toast.success("Payslip sent.");
         
         // Close the modal
         onClose();
 
         // Refresh the page after success
         router.refresh();
       } else {
         throw new Error("Failed to send payslip.");
       }
     } catch (error) {
       console.error(error);
       toast.error("Failed to send payslip.");
     }
   } else {
     toast.error("No email address provided.");
   }
 };
 

  return (
    <Modal
      title="Update Student Information"
      description="Information"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="pt-6 space-y-4">
        <div>
          <label className="block mb-1 font-semibold" htmlFor="firstName">
            First Name:
          </label>
          <input
            className="w-full px-3 py-2 border rounded-md"
            type="text"
            id="firstName"
            name="NAME_FIRST"
            value={updatedInfo?.NAME_FIRST || ""}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold" htmlFor="lastName">
            Last Name:
          </label>
          <input
            className="w-full px-3 py-2 border rounded-md"
            type="text"
            id="lastName"
            name="NAME_LAST"
            value={updatedInfo?.NAME_LAST || ""}
            onChange={handleInputChange}
          />
        </div>

        {/* Status dropdown */}
        <div>
          <label className="block mb-1 font-semibold" htmlFor="status">
            Status:
          </label>
          <select
            className="w-full px-3 py-2 border rounded-md"
            id="status"
            name="status"
            value={updatedInfo?.status || ""}
            onChange={handleInputChange}
          >
            <option value="Waitlist">Waitlist</option>
            <option value="Registered">Registered</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-semibold" htmlFor="email">
            Email:
          </label>
          <input
            className="w-full px-3 py-2 border rounded-md"
            type="email"
            id="email"
            name="E_mail_main"
            value={updatedInfo?.E_mail_main || ""}
            onChange={handleInputChange}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button disabled={loading} variant="outline" onClick={onClose}>
            Cancel
          </Button>

          {/* Conditionally render the "Send Payslip" button when status is "Registered" */}
          {updatedInfo?.status === "Registered" && (
            <Button disabled={loading} onClick={handleSendPayslip}>
              Send Payslip
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
