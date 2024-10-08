"use-client";
import axios from "axios";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StudentColumn } from "./columns";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import {toast} from 'react-hot-toast';
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AlertModal } from "@/components/modals/alert-modal";

interface CellActionProps{
  data: StudentColumn
}

export const CellAction: React.FC<CellActionProps> = ({
  data
}) =>{
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading]=useState(false);
  const[open,setOpen]=useState(false);

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${params.seasonId}/students/${data.UniqueID}`
      );
      router.refresh();
      router.push(`/${params.seasonId}/students`);
      toast.success("student deleted.");
    } catch (error: any) {
      toast.error(
        "student not deleted"
      );
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return(
    <>
    <AlertModal
    isOpen={open}
    onClose={()=> setOpen(false)}
    onConfirm={onDelete}
    loading={loading}
    />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open Menu</span>
            <MoreHorizontal className="h-4 w-4"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            Actions
          </DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/${params.seasonId}/students/${data.UniqueID}`)}>
            <Edit className="mr-2 h-4 w-4"/>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={()=> setOpen(true)}>
            <Trash className="mr-2 h-4 w-4"/>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </>
  );
};