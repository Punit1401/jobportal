import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import * as mammoth from "mammoth";
import formidable from "formidable";
import fs from "fs";

export const runtime = "nodejs";

export async function POST(req) {
  const form = formidable({ multiples: false });

  return new Promise((resolve) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("formidable error:", err);
        resolve(NextResponse.json({ error: "Upload error" }, { status: 500 }));
        return;
      }

      const file = files.file;

      if (!file) {
        resolve(NextResponse.json({ error: "No file uploaded" }, { status: 400 }));
        return;
      }

      try {
        const buffer = fs.readFileSync(file.filepath);

        let extractedText = "";

        // ---------------- PDF (using pdf-lib) ----------------
        if (file.mimetype === "application/pdf") {
          const pdfDoc = await PDFDocument.load(buffer);
          let text = "";

          for (const page of pdfDoc.getPages()) {
            try {
              text += page.getText ? page.getText() : "";
            } catch {
              text += "";
            }
          }

          extractedText = text || "";
        }

        // ---------------- DOCX (using mammoth) --------------
        else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value;
        }

        else {
          resolve(NextResponse.json({ error: "Invalid file type" }, { status: 400 }));
          return;
        }

        // Normalize text
        const clean = extractedText.replace(/\r/g, "").trim();

        resolve(
          NextResponse.json(
            { success: true, rawText: clean },
            { status: 200 }
          )
        );
      } catch (error) {
        console.error("IMPORT ERROR:", error);
        resolve(
          NextResponse.json(
            { error: error.message },
            { status: 500 }
          )
        );
      }
    });
  });
}
