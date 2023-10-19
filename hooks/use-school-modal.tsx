import {create} from "zustand";

interface useSchoolModalSchool {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useSchoolModal = create<useSchoolModalSchool>((set)=> ({
  isOpen: false,
  onOpen: () => set({isOpen: true}),
  onClose: () => set({isOpen: false}),
}))

