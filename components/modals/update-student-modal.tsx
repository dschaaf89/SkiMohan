import { useEffect, useState } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { StudentColumn } from "@/app/(dashboard)/[seasonId]/(routes)/students/components/columns";

export interface UpdateStudentModalProps {
  isOpen: boolean;
  onClose: () => void; // This is correct as is
  onUpdate: (updatedInfo: Partial<StudentColumn>) => void;
  initialInfo: StudentColumn | null;
  loading: boolean;
}




export const UpdateStudentModal: React.FC<UpdateStudentModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  initialInfo,
  loading,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState<Partial<StudentColumn> | null>(null); // Adjust type to Partial<StudentColumn> | null

  useEffect(() => {
    setIsMounted(true);
    setUpdatedInfo(initialInfo ? { ...initialInfo } : null); // Copy initialInfo if it's not null
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
      onUpdate({
        // Assuming StudentColumn properties are optional or nullable
        // If not, you may need additional checks or modifications here
        ...updatedInfo,
      });
      onClose();
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
            name="NAME_FIRST" // Adjust input name to match StudentColumn properties
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
            name="NAME_LAST" // Adjust input name to match StudentColumn properties
            value={updatedInfo?.NAME_LAST || ""}
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
            name="E_mail_main" // Adjust input name to match StudentColumn properties
            value={updatedInfo?.E_mail_main || ""}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold" htmlFor="phone">
            Phone:
          </label>
          <input
            className="w-full px-3 py-2 border rounded-md"
            type="tel"
            id="phone"
            name="HOME_TEL" // Adjust input name to match StudentColumn properties
            value={updatedInfo?.HOME_TEL || ""}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex justify-end">
          <Button
            disabled={loading}
            variant="outline"
            onClick={onClose}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            disabled={loading}
            variant="outline"
            onClick={handleUpdate}
          >
            Update
          </Button>
        </div>
      </div>
    </Modal>
  );
};
