// import { NextResponse } from "next/server";
// import { PrismaClient } from '@prisma/client';
// import puppeteer from "puppeteer-core";
// import chromium from "@sparticuz/chromium-min"; // Use chromium-min
// import fs from "fs";
// import path from "path";
// const prismadb = new PrismaClient();
// interface Class {
//   classId: string;
//   meetingPoint: number;
//   HOME_TEL: string;
//   DAY: string;
//   startTime: string;
//   endTime: string;
//   meetColor: string;
//   Level: string;
//   Age: string;
//   students: { [key: string]: any };
//   instructorName: string;
//   assistantName: string;
//   instructorID: string;
//   date: string;
//   timeSlot: number;
// }
// // Define the type for the expected request body
// interface Student {
//   NAME_LAST: string;
//   NAME_FIRST: string;
//   UniqueID: string;
//   meetingPoint: number;
//   HOME_TEL: string;
//   UniqueId: number;
//   DAY: string;
//   StartTime: string;
//   EndTime: string;
//   meetColor: string;
//   // Add other student fields as needed
// }

// export async function POST(req: Request) {
//   try {
//     let studentIds: number[] = [];
//     const body = await req.json();
//     const classes: Class[] = body;
//     console.log(classes);
//     if (!Array.isArray(classes)) {
//       return new NextResponse("Payload is not an array");
//     }

//     // Extract Student IDs from classes
//     classes.forEach(classItem => {
//       Object.entries(classItem.students).forEach(([studentId, _]) => {
//         studentIds.push(Number(studentId));
//       });
  
//       // Additional processing for each class...
//     });
//     // Fetch Student Data from Database
//     const studentsData = await prismadb.student.findMany({
//       where: { UniqueID: { in: Array.from(studentIds) } },
//       select: { UniqueID: true, NAME_FIRST: true, NAME_LAST: true }
//     });
//     console.log("Fetched Students Data:", studentsData);
//     const studentMap = new Map(studentsData.map(s => [s.UniqueID, s]));

//     // Map Student Data Back to Classes
//     classes.forEach(classItem => {
//       Object.entries(classItem.students).forEach(([studentId, studentDetails]) => {
//         const studentData = studentMap.get(Number(studentId));
//         if (studentData) {
//           studentDetails.NAME_FIRST = studentData.NAME_FIRST;
//           studentDetails.NAME_LAST = studentData.NAME_LAST;
//           console.log(`Updated Student: ${studentDetails.NAME_FIRST} ${studentDetails.NAME_LAST}`);
//         }
//       });
//     });
//     console.log("Updated Classes Object:", classes);
    // const browser = await puppeteer.launch({
    //   args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
    //   defaultViewport: chromium.defaultViewport,
    //   executablePath: await chromium.executablePath(
    //     "https://github.com/Sparticuz/chromium/releases/download/v122.0.0/chromium-v122.0.0-pack.tar"
    //   ),
    //   headless: true,
    //   ignoreHTTPSErrors: true,
    // });
//     const page = await browser.newPage();

//     const cssFilePath = path.join(
//       process.cwd(),
//       "app",
//       "resources",
//       "payStyles.css"
//     );
//     const cssContent = fs.readFileSync(cssFilePath, "utf8");
//     let combinedHtmlContent = classes.map(classItem => {
//       // Convert the students object to an array of its values
//       const studentsArray = Object.values(classItem.students);
    
//       const studentListHtml = studentsArray
//         .map((student: any) => `<li>${student.NAME_FIRST} ${student.NAME_LAST}</li>`)
//         .join('');
//         return `
//         <div class="page">
//         <div class="top-half-content">
//           <!-- All content that should be in the top half goes here -->
//           <div class="class-info-container">
//             <div class="class-info-box">
//               <span class="class-number">${classItem.meetingPoint}</span>
//               <span class="meet-color">${classItem.meetColor}</span>
//             </div>
//             <div class="time-details">
//               <span class="week"> Week 7 </span>
//               <span class="class-day">${classItem.DAY}</span>
//               <span class="class-time">${classItem.startTime} - ${classItem.endTime}</span>
//               <div class="level-age">
//                 <span class="level">LEVEL: ${classItem.Level}</span>
//                 <span class="age-group">AGE GROUP: ${classItem.Age}</span>
//               </div>
//             </div>
//             <div class="class-id-right">${classItem.classId}</div>
//           </div>
//           <!-- Use CSS Grid for two columns -->
//           <div class="student-instructor-grid">
          
//             <div class="instructor-details">
//               <span class="instructor">Instructor: ${classItem.instructorName}</span>
//               <span class="assistant">Assistant: ${classItem.assistantName ? classItem.assistantName : " "}</span>
//               <div class="signature-box">
//                 time-card signiture
//                </div>
//             </div>

//             <div class="student-list-container">
//             <ol class="student-list">${studentListHtml}</ol>
//           </div>
//           </div>
          
//           <div class="turn-in">
//   <label for="radioReturned">
//     <input type="checkbox" id="radioReturned" name="checklist">
//     Radio Returned
//   </label>

//   <label for="classCardsCompleted">
//     <input type="checkbox" id="classCardsCompleted" name="checklist">
//     Class Cards Completed
//   </label>

//   <label for="bibsReturned">
//     <input type="checkbox" id="bibsReturned" name="checklist">
//     Bibs Returned
//   </label>
// </div>
//         </div>
//         <div class="bottom-half-content">
//         <div class="copy">---------------------------------- Bottom Copy for Your Records -------------------------------------</div>
//         <div class="class-info-container">
//           <div class="class-info-box">
//             <span class="class-number">${classItem.meetingPoint}</span>
//             <span class="meet-color">${classItem.meetColor}</span>
//           </div>
//           <div class="time-details">
//             <span class="class-day">${classItem.DAY}</span>
//             <span class="class-time">${classItem.startTime} - ${classItem.endTime}</span>
//             <div class="level-age">
//               <span class="level">LEVEL: ${classItem.Level}</span>
//               <span class="age-group">AGE GROUP: ${classItem.Age}</span>
//             </div>
//           </div>
//           <div class="class-id-right">${classItem.classId}</div>
//         </div>
//         <!-- Use CSS Grid for two columns -->
//         <div class="student-instructor-grid">
        
//           <div class="instructor-details">
//             <span class="instructor">Instructor: ${classItem.instructorName}</span>
//             <span class="assistant">Assistant: ${classItem.assistantName ? classItem.assistantName : " "}</span>
//           </div>

//           <div class="student-list-container">
//           <ol class="student-list">${studentListHtml}</ol>
//         </div>
//         </div>
//       </div>
//         </div>
       
//       </div>
//     `;
//       })
//       .join("");
//     await page.setContent(
//       `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//       <style>${cssContent}</style>
//     </head>
//     <body>${combinedHtmlContent}</body>
//     </html>
//   `,
//       { waitUntil: "networkidle0" }
//     );

//     const pdfBuffer = await page.pdf({
//       format: "letter",
//       printBackground: true, // Optionally, include background graphics
//       margin: { top: "0", right: "0", bottom: "0", left: "0" }, // Margin based on index
//       scale: 1, // Scale factor (1 is the default)
//     });
//     await browser.close();

//     // Create a NextResponse object for the PDF
//     const response = new NextResponse(pdfBuffer, {
//       status: 200,
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": "attachment; filename=paySlips.pdf",
//       },
//     });

//     return response;
//   } catch (error) {
//     console.error("Error generating PDF:", error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   } finally{
//     await prismadb.$disconnect();
//   }
// }
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
import fs from "fs";
import path from "path";

const prismadb = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const classIds = body.map((classItem: { classId: number }) => classItem.classId);

    if (!Array.isArray(classIds) || classIds.length === 0) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    // Fetch classes and their associated students
    const classesWithStudents = await prismadb.classes.findMany({
      where: {
        classId: { in: classIds },
      },
      include: {
        students: {
          select: {
            UniqueID: true,
            NAME_FIRST: true,
            NAME_LAST: true,
            AGE: true,
            LEVEL: true,
            meetColor: true,
            meetingPoint: true,
          },
        },
      },
    });

    // Launch Puppeteer with @sparticuz/chromium-min
    const browser = await puppeteer.launch({
      args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v122.0.0/chromium-v122.0.0-pack.tar"
      ),
      headless: true,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    // Load CSS for styling
    const cssFilePath = path.join(
      process.cwd(),
      "app",
      "resources",
      "payStyles.css"
    );
    const cssContent = fs.readFileSync(cssFilePath, "utf8");

    const combinedHtmlContent = classesWithStudents
      .map((classItem) => {
        const studentListHtml = classItem.students
          .map(
            (student) =>
              `<li>${student.NAME_FIRST} ${student.NAME_LAST} (ID: ${student.UniqueID}, Level: ${student.LEVEL ?? "N/A"}, Age: ${student.AGE ?? "N/A"})</li>`
          )
          .join("");

        return `
        <div class="page">
          <div class="top-half-content">
            <div class="class-info-container">
              <div class="class-info-box">
                <span class="class-number">${classItem.meetingPoint ?? "N/A"}</span>
                <span class="meet-color">${classItem.meetColor ?? "N/A"}</span>
              </div>
              <div class="time-details">
                <span class="week">Week 7</span>
                <span class="class-day">${classItem.day}</span>
                <span class="class-time">${classItem.startTime ?? "N/A"} - ${
          classItem.endTime ?? "N/A"
        }</span>
                <div class="level-age">
                  <span class="level">LEVEL: ${classItem.Level ?? "N/A"}</span>
                  <span class="age-group">AGE GROUP: ${classItem.Age ?? "N/A"}</span>
                </div>
              </div>
              <div class="class-id-right">${classItem.classId}</div>
            </div>
            <div class="student-instructor-grid">
              <div class="instructor-details">
                <span class="instructor">Instructor: ${
                  classItem.instructorName ?? "N/A"
                }</span>
                <span class="assistant">Assistant: ${
                  classItem.assistantName ?? "N/A"
                }</span>
                <div class="signature-box">Time-card signature</div>
              </div>
              <div class="student-list-container">
                <ol class="student-list">${studentListHtml}</ol>
              </div>
            </div>
            <div class="turn-in">
              <label>
                <input type="checkbox"> Radio Returned
              </label>
              <label>
                <input type="checkbox"> Class Cards Completed
              </label>
              <label>
                <input type="checkbox"> Bibs Returned
              </label>
            </div>
          </div>
          <div class="bottom-half-content">
            <div class="copy">---------------------------------- Bottom Copy for Your Records -------------------------------------</div>
            <div class="class-info-container">
              <div class="class-info-box">
                <span class="class-number">${classItem.meetingPoint ?? "N/A"}</span>
                <span class="meet-color">${classItem.meetColor ?? "N/A"}</span>
              </div>
              <div class="time-details">
                <span class="class-day">${classItem.day}</span>
                <span class="class-time">${classItem.startTime ?? "N/A"} - ${
          classItem.endTime ?? "N/A"
        }</span>
                <div class="level-age">
                  <span class="level">LEVEL: ${classItem.Level ?? "N/A"}</span>
                  <span class="age-group">AGE GROUP: ${classItem.Age ?? "N/A"}</span>
                </div>
              </div>
              <div class="class-id-right">${classItem.classId}</div>
            </div>
            <div class="student-instructor-grid">
              <div class="instructor-details">
                <span class="instructor">Instructor: ${
                  classItem.instructorName ?? "N/A"
                }</span>
                <span class="assistant">Assistant: ${
                  classItem.assistantName ?? "N/A"
                }</span>
              </div>
              <div class="student-list-container">
                <ol class="student-list">${studentListHtml}</ol>
              </div>
            </div>
          </div>
        </div>`;
      })
      .join("");

    await page.setContent(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <style>${cssContent}</style>
      </head>
      <body>${combinedHtmlContent}</body>
      </html>`
    );

    const pdfBuffer = await page.pdf({
      format: "letter",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=ClassCards.pdf",
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  } finally {
    await prismadb.$disconnect();
  }
}
