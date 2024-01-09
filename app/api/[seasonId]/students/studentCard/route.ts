
import { NextResponse } from 'next/server';
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

// Define the type for the expected request body
interface Student {
  NAME_LAST: string;
  NAME_FIRST: string;
  UniqueID: string;
  meetingPoint: number;
  HOME_TEL: string;
  id: string;
  DAY: string;
  StartTime:string;
  EndTime:string;
  // Add other student fields as needed
}

export async function POST(
  req: Request,
) {
  try {
    let topMargin: string = '0.0in'; 
    const body = await req.json();
    const students: Student[] = body; // Cast directly as Student[]

    if (!Array.isArray(students)) {
      return new NextResponse( 'Payload is not an array');
    }
  console.log("req body :", students); 
  const browser = await puppeteer.launch({
    headless: "new" // opt into the new headless mode
  });
  const page = await browser.newPage();

  const cssFilePath = path.join(process.cwd(), 'app', 'resources', 'styles.css');

  const cssContent = fs.readFileSync(cssFilePath, "utf8");

  let combinedHtmlContent = students
  .map((student, index) => {
    // Determine the top margin based on the index
    topMargin = index === 0 ? '0.0in' : '0.2in';
    return `
    <div class="card-container">
      <div class="info-section">
        <label>Student Name:</label> <span>${student.NAME_FIRST}${student.NAME_LAST}</span>
        <label>Student ID:</label> <span>${student.UniqueID}</span>
        <label>Meeting Point:</label> <span>${student.meetingPoint}</span>
      </div>
      <div class="info-section">
        <label>Emergency Phone:</label> <span>${student.HOME_TEL}</span>
        <label>Program:</label> <span>${student.DAY}:${student.StartTime}-${student.EndTime}</span>
        <label>Weeks Attended:</label> <span>1 2 3 4 5 6 7</span>
      </div>
       <div class="info-section">
        <label>Outfit Description:</label> <span>_________________</span>
        <label>Helmet/Hat:</label> <span>_____________</span>
       
      </div>
  
      <div class="info-section">
        <p>____ We reviewed "CLOVER'S" safety rules</p>
        <p>____ We reviewed on hill accident procedures</p>
        <p>____ We reviewed separation / lost procedures</p>
      </div>
      
      <div class="info-section-lifts">
        <label>Lifts:</label>
        <span>Magic Carpet ___ Holiday ___ Gallery ___ Reggie ____ </span>
      </div>
      
      <div class="info-section-stickers">
        <label>Stickers:</label> <span>Red___White___Blue___Purple___Pink___Gold___</span>
      </div>
      
      <div class="info-section-ribbons">
        <label>Ribbons:</label>
        <span>Awesome Attitude _ Most Caring _ Most Improved _ Wildest Wipeout</span>
      </div>
      <div class="info-section">
        <label>Pins:</label> <span>#Type!</span>
      </div>
      <div class="notes-section">
        <label>Notes:</label> 
         <p>____________________________________________________</p>
         <p>____________________________________________________</p>
         <p>____________________________________________________</p>
         <p>____________________________________________________</p>
         <p>____________________________________________________</p>
         <p>____________________________________________________</p>
         <p>____________________________________________________</p>
         <p>____________________________________________________</p>
      </div>
    </div>
    `
  })
    .join("");
  await page.setContent(
    `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <style>${cssContent}</style>
    </head>
    <body>${combinedHtmlContent}</body>
    </html>
  `,
    { waitUntil: "networkidle0" }
  );

  const pdfBuffer = await page.pdf({
    width: '4in',   // Set the width to 4 inches
    height: '6in',  // Set the height to 6 inches
    printBackground: true, // Optionally, include background graphics
    margin: { top: topMargin, right: '0', bottom: '0', left: '0' }, // Margin based on index
    scale: 1, // Scale factor (1 is the default)
  });
  await browser.close();

  // Create a NextResponse object for the PDF
  const response = new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=students.pdf'
    }
  });

  return response;

} catch (error) {
  console.error('Error generating PDF:', error);
  return new NextResponse('Internal Server Error', { status: 500 });
}
}
