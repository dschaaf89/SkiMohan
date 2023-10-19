"use client";

import { useEffect } from "react";

import { useSchoolModal } from "@/hooks/use-school-modal";


const SetupPage = () => {
  const onOpen = useSchoolModal((state)=> state.onOpen);
  const isOpen = useSchoolModal((state)=> state.isOpen);

  useEffect(()=> {
    if(!isOpen){
      onOpen();
    }
  },[isOpen,onOpen]);
  return null;
}

export default SetupPage;