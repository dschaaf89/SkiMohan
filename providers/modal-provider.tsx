"use client";

import { useEffect, useState } from "react";

import { SchoolModal } from "@/components/modals/school-modal";


export const ModalProvider = () => {
  const [isMounted, setIsMounted]= useState(false);

  useEffect(()=>{
    setIsMounted(true);
  }, []);

  if(!isMounted){
    return null;
  }

  return (
    <>
    <SchoolModal />
    </>
  )
}