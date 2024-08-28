"use client"
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary"
import { ImagePlus, Trash } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value
}) => {

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onSuccess = (result: any) => {
    console.log("Upload success result:", result); // Debugging line
    if (result.info && result.info.secure_url) {
      onChange(result.info.secure_url); // Passing the secure URL to the parent component
    } else {
      console.error("Upload failed or result structure unexpected", result);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
            <div className="z-10 absolute top-2 right-2">
              <Button type="button" onClick={() => onRemove(url)} variant="destructive" size="icon">
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="image"
              src={url}
            />
          </div>
        ))}
        <div>
          <CldUploadWidget onSuccess={onSuccess} uploadPreset="bcfpwqvw">
            {({ open }) => {
              const onClick = () => {
                open();
              }
              return (
                <Button type="button"
                  disabled={disabled}
                  variant="secondary"
                  onClick={onClick}
                >
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Upload an image
                </Button>
              )
            }}
          </CldUploadWidget>
        </div>
      </div>
    </div>
  )
}

export default ImageUpload;
