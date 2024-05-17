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
      href:`/${params.seasonId}/volunteers`,
      label:'Volunteers',
      active: pathname===`${params.seasonId}/volunteers`
    },
    {
      href:`/${params.seasonId}/waitlist`,
      label:'Waitlist',
      active: pathname===`${params.seasonId}/waitlist`
    },
    {
      href:`/${params.seasonId}/coordinatorPortal`,
      label:'Coordinator Portal',
      active: pathname===`${params.seasonId}/coordinatorPortal`
    },
    {
      href:`/${params.seasonId}/billboards`,
      label:'Billboards',
      active: pathname===`${params.seasonId}/billboards`
    },
    {
      href:`/${params.seasonId}/programs`,
      label:'Programs',
      active: pathname===`${params.seasonId}/programs`
    },
    {
      href:`/${params.seasonId}/types`,
      label:'Type',
      active: pathname===`${params.seasonId}/types`
    },
    {
      href:`/${params.seasonId}/products`,
      label:'Products',
      active: pathname===`${params.seasonId}/products`
    },
    {
      href:`/${params.seasonId}/orders`,
      label:'Orders',
      active: pathname===`${params.seasonId}/orders`
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