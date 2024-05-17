import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { StudentColumn } from "@/app/(dashboard)/[seasonId]/(routes)/students/components/columns";
import axios from "axios";
import toast from "react-hot-toast";

export interface UpdateStudentModalProps {
   isOpen: boolean;
   onClose: () => void;
   onUpdate: (updatedInfo: Partial<StudentColumn>) => void;
   initialInfo: StudentColumn | null;
   loading: boolean;
}

export const UpdateStudentWaitlistModal: React.FC<UpdateStudentModalProps> = ({
   isOpen,
   onClose,
   onUpdate,
   initialInfo,
   loading,
}) => {
   const [isMounted, setIsMounted] = useState(false);
   const [updatedInfo, setUpdatedInfo] = useState<Partial<StudentColumn> | null>(null);

   useEffect(() => {
      setIsMounted(true);
      setUpdatedInfo(initialInfo ? { ...initialInfo } : null);
   }, [initialInfo]);

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setUpdatedInfo((prevInfo) => ({
         ...prevInfo,
         [name]: value,
      }));
   };

   const handleUpdate = () => {
      if (updatedInfo) {
         onUpdate(updatedInfo);
         onClose();
      }
   };

   const handleSendPayslip = () => {
      if (updatedInfo?.E_mail_main) {
         // Example API call to send payslip
         axios.post("/api/send-payslip", { email: updatedInfo.E_mail_main })
            .then(() => toast.success("Payslip sent."))
            .catch(() => toast.error("Failed to send payslip."));
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
               <label className="block mb-1 font-semibold" htmlFor="name">
                  First Name:
               </label>
               <input
                  className="w-full px-3 py-2 border rounded-md"
                  type="text"
                  id="name"
                  name="NAME_FIRST"
                  value={updatedInfo?.NAME_FIRST || ""}
                  onChange={handleInputChange}
               />
            </div>
            <div>
               <label className="block mb-1 font-semibold" htmlFor="name">
                  Last Name:
               </label>
               <input
                  className="w-full px-3 py-2 border rounded-md"
                  type="text"
                  id="name"
                  name="NAME_LAST"
                  value={updatedInfo?.NAME_LAST || ""}
                  onChange={handleInputChange}
               />
            </div>
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
               {updatedInfo?.status === "Registered" && (
                  <Button variant="outline" onClick={handleSendPayslip}>
                     Send Payslip
                  </Button>
               )}
            </div>
         </div>
      </Modal>
   );
};
