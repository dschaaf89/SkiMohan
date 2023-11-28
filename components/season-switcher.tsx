"use client"
import { Check, ChevronsUpDown, PlusCircle, Snowflake } from "lucide-react";
import { Season } from "@prisma/client"
import { useParams, useRouter } from "next/navigation";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useSchoolModal } from "@/hooks/use-school-modal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";




type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface SeasonSwitcherProps extends PopoverTriggerProps{
  items: Season[];
};

export default function SeasonSwitcher({
  className,
  items=[]
}:SeasonSwitcherProps) {

  const seasonModal = useSchoolModal();
  const params =useParams();
  const router = useRouter();

  const formattedItems = items.map((item)=>({
    label: item.name,
    value: item.id
  }));

  const currentSeason = formattedItems.find((item)=> item.value === params.seasonId);

  const [open, setOpen]= useState(false);

  const onSeasonSelect = (season:{value: string, label: string}) =>{
    setOpen(false);
    router.push(`/${season.value}`);
  }


  return(
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline"
        size="sm"
        role="combobox"
        aria-expanded={open}
        aria-label="Select a Season"
        className={cn("w-[200px] justify-between", className)}>
         
          <Snowflake className="mr-2 h-4 w-4"/>
          {currentSeason?.label}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50"/>
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="search Season..."/>
            <CommandEmpty>No Season Found</CommandEmpty>
            <CommandGroup heading="Seasons">
              {formattedItems.map((season)=>(
                <CommandItem
                key={season.value}
                onSelect={()=> onSeasonSelect(season)}
                className="text-sm"
                >
                  <Snowflake className="mr -2 h-4 w-4"/>
                  {season.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentSeason?.value === season.value ?"opacity-100":"opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator/>
          <CommandList>
            <CommandGroup>
              <CommandItem
              onSelect={()=>{
              setOpen(false);
              seasonModal.onOpen();
            }}
              >
                <PlusCircle className="mr-2 h-5 w-5"/>
                Create Season
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}