"use-client";
import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { VolunteerColumn } from "@/app/(dashboard)/[seasonId]/(routes)/volunteers/components/columns";



export interface UpdateVolunteerModalProps {
   isOpen: boolean;
   onClose: () => void;
   onUpdate: (updatedInfo: Partial<VolunteerColumn>) => void;
   initialInfo: VolunteerColumn | null;
   loading: boolean;
}

export const UpdateVolunteerModal: React.FC<UpdateVolunteerModalProps> = ({
   isOpen,
   onClose,
   onUpdate,
   initialInfo,
   loading,
}) => {
   const [isMounted, setIsMounted] = useState(false);
   const [updatedInfo, setUpdatedInfo] = useState<Partial<VolunteerColumn> | null>(null);

   useEffect(() => {
      setIsMounted(true);
      setUpdatedInfo(initialInfo ? { ...initialInfo } : null);
   }, [initialInfo]);

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

   return (
      <Modal
         title="Update Volunteer Information"
         description="Please update the volunteer's details."
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
                  name="firstName"
                  value={updatedInfo?.firstName || ""}
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
                  name="lastName"
                  value={updatedInfo?.lastName || ""}
                  onChange={handleInputChange}
               />
            </div>
            <div>
               <label className="block mb-1 font-semibold" htmlFor="homePhone">
                  Home Phone:
               </label>
               <input
                  className="w-full px-3 py-2 border rounded-md"
                  type="tel"
                  id="homePhone"
                  name="homePhone"
                  value={updatedInfo?.homePhone || ""}
                  onChange={handleInputChange}
               />
            </div>
            <div>
               <label className="block mb-1 font-semibold" htmlFor="mobilePhone">
                  Mobile Phone:
               </label>
               <input
                  className="w-full px-3 py-2 border rounded-md"
                  type="tel"
                  id="mobilePhone"
                  name="mobilePhone"
                  value={updatedInfo?.mobilePhone || ""}
                  onChange={handleInputChange}
               />
            </div>
            <div>
               <label className="block mb-1 font-semibold" htmlFor="workPhone">
                  Work Phone:
               </label>
               <input
                  className="w-full px-3 py-2 border rounded-md"
                  type="tel"
                  id="workPhone"
                  name="workPhone"
                  value={updatedInfo?.workPhone || ""}
                  onChange={handleInputChange}
               />
            </div>
            <div>
               <label className="block mb-1 font-semibold" htmlFor="email">
                  Email:
               </label>
               <input
                  className="w-full px-3 py-2 border rounded-md"
                  type="email"
                  id="email"
                  name="email"
                  value={updatedInfo?.email || ""}
                  onChange={handleInputChange}
               />
            </div>
            <div className="flex justify-end space-x-2">
               <Button disabled={loading} variant="outline" onClick={onClose}>
                  Cancel
               </Button>
               <Button disabled={loading} variant="outline" onClick={handleUpdate}>
                  Update
               </Button>
            </div>
         </div>
      </Modal>
   );
};
