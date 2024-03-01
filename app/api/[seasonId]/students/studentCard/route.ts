import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min"; // Use chromium-min
import fs from "fs";
import path from "path";
import * as tar from "tar"; // Import the tar module


// Define the type for the expected request body
interface Student {
  NAME_LAST: string;
  NAME_FIRST: string;
  UniqueID: string;
  meetingPoint: number;
  HOME_TEL: string;
  id: string;
  DAY: string;
  StartTime: string;
  EndTime: string;
  meetColor: string;
  // Add other student fields as needed
}

export async function POST(req: Request) {
  try {
    let topMargin: string = "0.0in";
    const body = await req.json();
    const students: Student[] = body; // Cast directly as Student[]

    if (!Array.isArray(students)) {
      return new NextResponse("Payload is not an array");
    }
    console.log("req body :", students);
        // Initialize Puppeteer with the Chromium executable path
        const browser = await puppeteer.launch({
          args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(
            "https://github.com/Sparticuz/chromium/releases/download/v116.0.0/chromium-v116.0.0-pack.tar"
          ),
          headless: true,
          ignoreHTTPSErrors: true,
        });

    const page = await browser.newPage();

    const cssFilePath = path.join(
      process.cwd(),
      "app",
      "resources",
      "styles.css"
    );

    const cssContent = fs.readFileSync(cssFilePath, "utf8");

    let combinedHtmlContent = students
      .map((student, index) => {
        // Determine the top margin based on the index
        topMargin = index === 0 ? "0.0in" : "0.2in";
        return `
        <div class="card-container">
        <div class="name-id-section">
          <span class="name">${student.NAME_FIRST} ${student.NAME_LAST}</span>
          <span class="student-id">Student ID: ${student.UniqueID}</span>
        </div>
        <div class="meet-section">
          <span class="meet-color"> ${student.meetColor}</span>
          <span class="meeting-point">${student.meetingPoint}</span>
          <label>Program:</label> <span>${student.DAY}:${student.StartTime}-${student.EndTime}</span>
          
          
        </div>
      <div class="contact-section">
        <label>Emergency Phone:</label> <span>${student.HOME_TEL}</span>
        <label>Weeks Attended:</label> <span>1 2 3 4 5 6 7</span>
      </div>
      <div class="outfit-helmet-section">
      <div class="outfit-description">
        <label>Outfit Description:</label> <span>_________________</span>
      </div>
      <div class="helmet-hat">
        <label>Helmet/Hat:</label> <span>_________</span>
      </div>
    </div>
      <div class="info-section">
      <label>
        <input type="checkbox" name="clovers_reviewed" disabled> We reviewed "CLOVER'S" safety rules
      </label>
    </div>
    <div class="info-section">
      <label>
        <input type="checkbox" name="hill_accident_reviewed" disabled> We reviewed on hill accident procedures
      </label>
    </div>
    <div class="info-section">
      <label>
        <input type="checkbox" name="separation_reviewed" disabled> We reviewed separation / lost procedures
      </label>
      </div>
      <div class="info-section">
      <label>Lifts:</label>
      <label><input type="checkbox" name="lift_magic_carpet" disabled> MC</label>
      <label><input type="checkbox" name="lift_holiday" disabled> Hol</label>
      <label><input type="checkbox" name="lift_gallery" disabled> Gal</label>
      <label><input type="checkbox" name="lift_reggie" disabled> Reg</label>
      <label><input type="checkbox" name="lift_T60" disabled> T60</label>
      <label><input type="checkbox" name="lift_CE" disabled> CE</label>
    </div>
    
    <div class="info-section">
      <label>Stickers:</label>
      
    </div>
    
    <div class="info-section">
      <label>Pins:</label>
      
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
      </div>
    </div>
    `;
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
      width: "4in", // Set the width to 4 inches
      height: "6in", // Set the height to 6 inches
      printBackground: true, // Optionally, include background graphics
      margin: { top: topMargin, right: "0", bottom: "0", left: "0" }, // Margin based on index
      scale: 1, // Scale factor (1 is the default)
    });
    await browser.close();

    // Create a NextResponse object for the PDF
    const response = new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=students.pdf",
      },
    });

    return response;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

