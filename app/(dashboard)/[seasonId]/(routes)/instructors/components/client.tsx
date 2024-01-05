"use client"

import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation";
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { InstructorColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import axios from 'axios';

interface InstuctorClientProps {
  data: InstructorColumn[];
}





export const InstructorClient: React.FC<InstuctorClientProps> = ({
  data
}) => {
  const params = useParams();
  const router = useRouter();
  const seasonId = params.seasonId;
  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
  
      reader.onload = async (e) => {
        // Ensure that the result is not null
        if (e.target && e.target.result) {
          const data = e.target.result;
          const workbook = XLSX.read(data, {
            type: 'binary'
          });
  
          // Assuming your Excel file has a sheet named "Sheet1"
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          
          // Convert the sheet to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1
          });
  
          // Log the JSON object to inspect it
          console.log(jsonData);
          
          // Use axios to send this JSON data to your server
          try {
            const response = await axios.post(`/api/${params.seasonId}/instructors/importInstructors`, jsonData);
            console.log('Server Response:', response.data);
            // Handle the successful response here
            router.refresh();
            router.push(`/${params.seasonId}/instructors`);
          } catch (error) {
            console.error('Error posting data:', error);
            // Handle the error here
          }
        } else {
          console.error('File read error');
        }
      };
  
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
      };
  
      reader.readAsBinaryString(file);
    }
  };

  return(
    <>
    <div className=" flex items-center justify-between">
      <Heading
      title = {`Instructors (${data.length})`}
      description="Manage instructors"
      />
        <div className="flex items-center">
        <Button onClick={() => document.getElementById('fileInput')!.click()} className="mr-4">
        <input type="file" id="fileInput" style={{ display: 'none' }} onChange={handleFileInputChange} accept=".xlsx, .xls" />
        <Plus className=" mr-2 b-4 w-4"/>
        Import instructors
      </Button>

      <Button onClick={() => router.push(`/${params.seasonId}/instructors/new`)}>
        <Plus className=" m-2 b-4 w-4"/>
        Add New
      </Button>
      </div>
    </div>
   
    <Separator/>
    <DataTable searchKey="NAME_LAST" columns={columns} data={data}/>
    </>
  )
}