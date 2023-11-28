"use client"

import { cn } from "@/lib/utils"
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export function MainNav({
  className,
  ...props
}:React.HTMLAttributes<HTMLElement>){
  const pathname = usePathname();
  const params = useParams();

  const routes = [
    {
      href:`/${params.seasonId}/`,
      label:'Dashboard',
      active: pathname===`${params.seasonId}/`
    },
    {
      href:`/${params.seasonId}/students`,
      label:'Students',
      active: pathname===`${params.seasonId}/students`
    },
    {
      href:`/${params.seasonId}/instructors`,
      label:'Instructors',
      active: pathname===`${params.seasonId}/instructors`
    },


    {
      href:`/${params.seasonId}/classes`,
      label:'Classes',
      active: pathname===`${params.seasonId}/classes`
    },
    {
      href:`/${params.seasonId}/waitlists`,
      label:'Waitlists',
      active: pathname===`${params.seasonId}/waitlists`
    },
    {
      href:`/${params.seasonId}/billboards`,
      label:'Billboards',
      active: pathname===`${params.seasonId}/billboards`
    },

    {
      href:`/${params.seasonId}/settings`,
      label:'Settings',
      active: pathname===`${params.seasonId}/settings`
    }
  ];
  return(
    <nav
    className={cn("flex items-center space-x-4 lg:space-x-6 ",className)}>
      {routes.map((route) => (
        <Link
        key={route.href}
        href={route.href}
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          route.active ? "text-black dark:text-white": "text-muted-foreground"
        )}
        >
        {route.label}
        </Link>   ))}
    </nav>
  )
};