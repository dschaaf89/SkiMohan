import { authMiddleware } from "@clerk/nextjs";
 
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
      // Include your route in the publicRoutes array
      publicRoutes: [
        "/3523ea0b-4dc2-4efb-be8d-10e1740d2f63/classes/availableInstructors"
      ]
    });
 
export const config = {
      matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
 