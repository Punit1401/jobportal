// src/app/api/excel-candidates/upload/route.js
import { NextResponse } from "next/server";
import connectMongo from "@/lib/mongodb";
import ExcelCandidate from "@/models/ExcelCandidate";
import User from "@/models/User";
import { read, utils } from "xlsx";

// export const config = {
//   api: { bodyParser: false },
// };

export async function POST(req) {
  try {
    await connectMongo();

    const formData = await req.formData();
    const mode = formData.get("mode");

    // -------------------- PREVIEW --------------------
    if (mode === "preview") {
      const file = formData.get("file");
      if (!file)
        return NextResponse.json({ error: "No file provided" }, { status: 400 });

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const workbook = read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = utils.sheet_to_json(sheet);

      return NextResponse.json({ message: "Preview generated", preview: json });
    }

    // -------------------- SAVE DATA --------------------
    if (mode === "save") {
      const rowsJson = formData.get("rows");
      if (!rowsJson)
        return NextResponse.json({ error: "No rows provided" }, { status: 400 });

      const rows = JSON.parse(rowsJson);
      let inserted = [];
      let updated = [];
      let skipped = [];

      const FIELD_MAP = {
        fullName: ["Name", "FullName", "Full Name"],
        email: ["Email", "email", "E-mail"],
        mobile: ["Mobile", "Phone", "Contact"],
        dob: ["DOB", "Birthdate", "Birth Date"],
        profession: ["Profession"],
        position: ["Position"],
        role: ["Role"],
        experience: ["Experience", "Exp"],
        city: ["City", "Location"],
        reference: ["Reference", "Ref"],
        linkedin: ["LinkedIn", "Linkedin"],
        portfolio: ["Portfolio"],
        skills: ["Skills"],
        resume: ["Resume"],
      };

      const getValue = (row, keys) => {
        for (const k of keys) if (row[k] !== undefined) return row[k];
        return null;
      };

      for (const row of rows) {
        const email = getValue(row, FIELD_MAP.email);

        if (!email) {
          skipped.push({ reason: "Missing email", row });
          continue;
        }

        const normalizedEmail = email.toLowerCase().trim();

        // ---------------------------------
        // 🔥 CHECK IF USER ALREADY REGISTERED
        // ---------------------------------
        const registered = await User.findOne({ email: normalizedEmail });

        if (registered) {
          // 🔥 REMOVE FROM ExcelCandidate
          await ExcelCandidate.deleteOne({ email: normalizedEmail });

          skipped.push({
            reason: "Already registered (removed from ExcelCandidate)",
            row,
          });

          continue; // Skip adding/updating
        }

        // ---------------------------------
        // PROCESS EXCEL CANDIDATE
        // ---------------------------------
        const existing = await ExcelCandidate.findOne({
          email: normalizedEmail,
        });

        const newData = {
          fullName: getValue(row, FIELD_MAP.fullName),
          mobile: getValue(row, FIELD_MAP.mobile),
          dob: getValue(row, FIELD_MAP.dob),
          profession: getValue(row, FIELD_MAP.profession),
          position: getValue(row, FIELD_MAP.position),
          role: getValue(row, FIELD_MAP.role),
          experience: getValue(row, FIELD_MAP.experience),
          city: getValue(row, FIELD_MAP.city),
          reference: getValue(row, FIELD_MAP.reference),
          linkedin: getValue(row, FIELD_MAP.linkedin),
          portfolio: getValue(row, FIELD_MAP.portfolio),
          skills: getValue(row, FIELD_MAP.skills)
            ? getValue(row, FIELD_MAP.skills).split(",")
            : [],
          resume: getValue(row, FIELD_MAP.resume),
        };

        if (!existing) {
          newData.email = normalizedEmail;
          newData.mailCount = 0;
          newData.unsubscribed = false;

          const created = await ExcelCandidate.create(newData);
          inserted.push(created);
        } else {
          await ExcelCandidate.updateOne(
            { email: normalizedEmail },
            { $set: newData }
          );
          const updatedCandidate = await ExcelCandidate.findOne({
            email: normalizedEmail,
          });
          updated.push(updatedCandidate);
        }
      }

      return NextResponse.json({
        message: "Save + Update completed",
        insertedCount: inserted.length,
        updatedCount: updated.length,
        skippedCount: skipped.length,
        inserted,
        updated,
        skipped,
      });
    }

    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  } catch (err) {
    console.error("Excel Upload API Error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
