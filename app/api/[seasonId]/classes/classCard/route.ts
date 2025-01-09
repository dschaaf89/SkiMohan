import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { chromium } from "playwright";
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

    // Generate the PDF content
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

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
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <style>${cssContent}</style>
      </head>
      <body>${combinedHtmlContent}</body>
      </html>
      `
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
