import { NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";


export const dynamic = "force-dynamic";


// Normalize frontend payload
function normalizeData(body) {
  if (body.data) return body.data;

  return {
    fullName: body.fullName || body.name || "",
    email: body.email || "",
    phone: body.phone || "",
    linkedin: body.linkedin || "",
    github: body.github || "",
    summary: body.summary || "",
    experiences: body.experiences || [],
    education: body.education || body.educations || [],
    skills: body.skills || [],
    certifications: body.certifications || [],
    projects: body.projects || [],
    languages: body.languages || [],
    template: body.template || "template1",
  };
}

// =========================
// PDF Generator with templates
// =========================
async function generatePDF(data) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Template color & spacing
  const templates = {
    template1: { color: rgb(0.2, 0.4, 0.7), gap: 20 },
    template2: { color: rgb(0.15, 0.6, 0.4), gap: 24 },
    template3: { color: rgb(0.6, 0.2, 0.3), gap: 18 },
    template4: { color: rgb(0.1, 0.1, 0.1), gap: 22 },
  };
  
  const tpl = templates[data.template] || templates.template1;
  

  let y = 800;

  const write = (text, size = 12) => {
    if (!text) return;
    page.drawText(text, { x: 40, y, size, font, color: tpl.color });
    y -= tpl.gap;
  };

  // Header
  write(data.fullName, 20);
  write(data.email);
  write(data.phone);
  write(data.linkedin);
  write(data.github);
  y -= 10;

  // Summary
  if (data.summary) {
    write("Summary", 16);
    write(data.summary, 12);
    y -= 10;
  }

  // Experiences
  if (data.experiences?.length) {
    write("Experience", 16);
    data.experiences.forEach((exp) => {
      write(`${exp.title} — ${exp.company}`, 12);
      write(`${exp.start || ""} - ${exp.end || ""}`, 10);
      write(exp.description, 10);
      y -= 5;
    });
  }

  // Education
  if (data.education?.length) {
    write("Education", 16);
    data.education.forEach((edu) => {
      write(`${edu.degree} — ${edu.university || edu.school || ""}`, 12);
      write(`${edu.year || `${edu.start || ""} - ${edu.end || ""}`}`, 10);
      y -= 5;
    });
  }

  // Skills
  if (data.skills?.length) {
    write("Skills", 16);
    write(data.skills.join(", "), 12);
  }

  // Certifications
  if (data.certifications?.length) {
    write("Certifications", 16);
    data.certifications.forEach((c) => write(c.name || c, 12));
  }

  // Projects
  if (data.projects?.length) {
    write("Projects", 16);
    data.projects.forEach((p) => {
      write(p.name || p.title, 12);
      write(p.description || "", 10);
      y -= 5;
    });
  }

  // Languages
  if (data.languages?.length) {
    write("Languages", 16);
    write(data.languages.join(", "), 12);
  }

  return await pdfDoc.save();
}

// =========================
// DOCX Generator with templates
// =========================
async function generateDocx(data) {
  const children = [];

  const templates = {
    template1: { color: "1D6AFF" },
    template2: { color: "1DC788" },
    template3: { color: "C74A57" },
    template4: { color: "000000" },
  };
  
  const tplColor = templates[data.template]?.color || "1D6AFF";
  

  children.push(
    new Paragraph({
      children: [new TextRun({ text: data.fullName, bold: true, size: 36, color: tplColor })],
    })
  );

  [data.email, data.phone, data.linkedin, data.github].forEach((t) => t && children.push(new Paragraph(t)));
  children.push(new Paragraph(" "));

  if (data.summary) {
    children.push(new Paragraph({ children: [new TextRun({ text: "Summary", bold: true, size: 28, color: tplColor })] }));
    children.push(new Paragraph(data.summary));
    children.push(new Paragraph(" "));
  }

  if (data.experiences?.length) {
    children.push(new Paragraph({ children: [new TextRun({ text: "Experience", bold: true, size: 28, color: tplColor })] }));
    data.experiences.forEach((exp) => {
      children.push(new Paragraph({ children: [new TextRun({ text: `${exp.title} — ${exp.company}`, bold: true })] }));
      children.push(new Paragraph(`${exp.start || ""} - ${exp.end || ""}`));
      children.push(new Paragraph(exp.description || ""));
      children.push(new Paragraph(" "));
    });
  }

  if (data.education?.length) {
    children.push(new Paragraph({ children: [new TextRun({ text: "Education", bold: true, size: 28, color: tplColor })] }));
    data.education.forEach((edu) => {
      children.push(new Paragraph({ children: [new TextRun({ text: `${edu.degree} — ${edu.university || edu.school || ""}`, bold: true })] }));
      children.push(new Paragraph(`${edu.year || `${edu.start || ""} - ${edu.end || ""}`}`));
      children.push(new Paragraph(" "));
    });
  }

  if (data.skills?.length) {
    children.push(new Paragraph({ children: [new TextRun({ text: "Skills", bold: true, size: 28, color: tplColor })] }));
    children.push(new Paragraph(data.skills.join(", ")));
    children.push(new Paragraph(" "));
  }

  if (data.certifications?.length) {
    children.push(new Paragraph({ children: [new TextRun({ text: "Certifications", bold: true, size: 28, color: tplColor })] }));
    data.certifications.forEach((c) => children.push(new Paragraph(c.name || c)));
    children.push(new Paragraph(" "));
  }

  if (data.projects?.length) {
    children.push(new Paragraph({ children: [new TextRun({ text: "Projects", bold: true, size: 28, color: tplColor })] }));
    data.projects.forEach((p) => {
      children.push(new Paragraph({ children: [new TextRun({ text: p.name || p.title, bold: true })] }));
      children.push(new Paragraph(p.description || ""));
      children.push(new Paragraph(" "));
    });
  }

  if (data.languages?.length) {
    children.push(new Paragraph({ children: [new TextRun({ text: "Languages", bold: true, size: 28, color: tplColor })] }));
    children.push(new Paragraph(data.languages.join(", ")));
  }

  const doc = new Document({ sections: [{ children }] });
  return await Packer.toBuffer(doc);
}

// =========================
// API Route
// =========================
export async function POST(req) {
  try {
    const body = await req.json();
    const data = normalizeData(body);
    const type = data.type || "pdf";

    let fileBuffer;
    let fileName;

    if (type === "docx") {
      fileBuffer = await generateDocx(data);
      fileName = `${data.template}-resume.docx`;
    } else {
      fileBuffer = await generatePDF(data);
      fileName = `${data.template}-resume.pdf`;
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          type === "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("EXPORT ERROR:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
