"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TemplateOne, TemplateTwo, TemplateThree, TemplateFour, TemplateFive,  } from "@/components/Templates";

export default function ResumeFinal() {
  const { style } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("resumeData");
    if (stored) setData(JSON.parse(stored));
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-xl">
        Loading Resume...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center py-10">
      {/* Buttons */}
      <div className="flex gap-6 mb-8 no-print flex-wrap justify-center">
        <button
          onClick={() => router.push("/user/resumebuilder/resumepreview")}
          className="px-6 py-2 bg-gray-700 text-white rounded"
        >
          Change Template
        </button>
        <button
          onClick={() => router.push("/user/resumebuilder")}
          className="px-6 py-2 bg-gray-700 text-white rounded"
        >
          Edit Resume
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-indigo-600 text-white rounded"
        >
          Download PDF
        </button>
      </div>

      {/* Resume preview */}
      <div className="print-area">
        {style === "1" && <TemplateOne data={data} />}
        {style === "2" && <TemplateTwo data={data} />}
        {style === "3" && <TemplateThree data={data} />}
        {style === "4" && <TemplateFour data={data} />}
        {style === "5" && <TemplateFive data={data} />}



        
      </div>

  <style jsx global>{`
  @page { 
    size: A4; 
    margin: 0; 
  }
  @media print {
    body { background: white !important; margin: 0 !important; padding: 0 !important; }
    .no-print { display: none !important; }
    body * { visibility: hidden; }
    .print-area, .print-area * { visibility: visible; }
    .print-area { position: absolute; left: 0; top: 0; width: 210mm; }
    
    /* મેઈન કન્ટેનરને ફ્લેક્સ રાખવા માટે */
    .grid-cols-12 {
      display: flex !important;
      flex-direction: row !important;
      width: 100% !important;
    }

    /* લેફ્ટ સાઈડ (Side Box) */
    .col-span-4 {
      width: 33.33% !important;
      display: block !important;
    }

    /* રાઈટ સાઈડ (Main Content) */
    .col-span-8 {
      width: 66.66% !important;
      display: block !important;
    }

    /* એક્સપિરિયન્સ અને પ્રોજેક્ટના બોક્સ બાજુ-બાજુમાં રાખવા માટે */
    .grid-cols-1.md\:grid-cols-2 {
      display: flex !important;
      flex-wrap: wrap !important;
      gap: 10px !important;
    }

    .grid-cols-1.md\:grid-cols-2 > div {
      width: 48% !important; 
      /* કન્ટેન્ટ મોટું હોય તો અડધું કપાય નહીં અને નવા પેજ પર જાય તે માટે */
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    /* આ મેઈન પ્રોપર્ટી છે જે સેક્શન કે ટેક્સ્ટને અડધું કપાતા રોકશે */
    section, 
    .experience-item, 
    .project-item, 
    header, 
    .bg-slate-50,
    .resume-section {
    break-inside: avoid !important;
      padding-top: 20mm !important; 
      margin-top: 0 !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      display: block !important; /* બ્રેક કંટ્રોલ માટે જરૂરી */
    }
    
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  }
`}</style>
    </div>
  );
}