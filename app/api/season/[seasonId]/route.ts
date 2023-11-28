import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH
 (
  req:Request,
  {params}:{params:{seasonId:string}}
  ){
    try {
      const { userId } = auth();
      const body = await req.json();
      const { name } = body;

      if(!userId){
        return new NextResponse("unauthenticated", {status:401})}
        
        if(!name){
          return new NextResponse("name is required" ,{status: 400})
        }
        if(!params.seasonId){
          return new NextResponse ("season Id is required",{status:400} )
        }

        const season = await prismadb.season.updateMany({
          where: {
            id: params.seasonId,
          },
          data:{
            name
          } 
        })
      return NextResponse.json(season);
    } catch (error) {
      console.log('[SEASON_PATCH]', error);
      return new NextResponse("Internal error", {status:500});
    }
  }


  export async function DELETE
 (
  req:Request,
  {params}:{params:{seasonId:string}}
  ){
    try {
      const { userId } = auth();
      
     

      if(!userId){
        return new NextResponse("unauthenticated", {status:401})}
        
        if(!params.seasonId){
          return new NextResponse ("season Id is required",{status:400} )
        }

        const season = await prismadb.season.delete({
          where: {
            id: params.seasonId
          }
        })
      return NextResponse.json(season);
    } catch (error) {
      console.log('[SEASON_DELETE]', error);
      return new NextResponse("Internal error", {status:500});
    }
  }