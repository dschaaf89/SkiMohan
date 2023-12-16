"use-client";
import axios from "axios";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ClassColumn } from "./columns";
import { Button } from "@/components/ui/button";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";
import {toast} from 'react-hot-toast';
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AlertModal } from "@/components/modals/alert-modal";

interface CellActionProps{
  data: ClassColumn
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
        `/api/${params.seasonId}/classes/${data.classId}`
      );
      router.refresh();
      router.push(`/${params.seasonId}/classes`);
      toast.success("class deleted.");
    } catch (error: any) {
      toast.error(
        "class not deleted"
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
          <DropdownMenuItem onClick={() => router.push(`/${params.seasonId}/classes/${data.id}/`)}>
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