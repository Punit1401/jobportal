"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TemplateOne, TemplateTwo, TemplateThree, TemplateFour, TemplateFive } from "@/components/Templates";
import UserSidebar from "@/components/UserSidebar"; // સાઇડબાર ઈમ્પોર્ટ કરેલું જ છે

export default function TemplateSelection() {
  const router = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("resumeData");
    if (stored) setData(JSON.parse(stored));
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex  items-center justify-center font-bold text-xl bg-slate-50 text-slate-400 italic">
        No Resume Data Found...
      </div>
    );
  }

  return (
    // આખું કન્ટેનર flex રાખ્યું છે જેથી સાઇડબાર અને મેઈન કન્ટેન્ટ બાજુ-બાજુમાં આવે
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-100 overflow-hidden">
      
      {/* સાઇડબાર અહીં એડ કર્યું */}
      <UserSidebar activePage="resumebuilder" />

      {/* મેઈન કન્ટેન્ટ એરિયા - overflow-y-auto થી ફક્ત આ જ ભાગ સ્ક્રોલ થશે */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 pt-20 lg:pt-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
            <div>
              <h1 className="text-3xl font-black text-slate-900">Choose Your Template</h1>
              <p className="text-slate-500 font-medium">Select a layout to preview your professional resume</p>
            </div>
            
            <button
              onClick={() => router.push("/user/resumebuilder")}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              ← Edit Resume
            </button>
          </div>

          {/* ટેમ્પલેટ ગ્રીડ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                onClick={() => router.push(`/user/resumebuilder/resumepreview/${num}`)}
                className="group cursor-pointer bg-white rounded-[32px] shadow-sm overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border border-slate-200"
              >
                {/* કાર્ડ હેડર (માત્ર પ્રીવ્યુ માટે) */}
                <div
                  className="relative bg-slate-50 flex justify-center items-start overflow-hidden border-b border-slate-100"
                  style={{ height: "350px" }}
                >
                  <div
                    className="origin-top transition-transform duration-500 group-hover:scale-[0.38]"
                    style={{
                      transform: "scale(0.35)",
                      transformOrigin: "top center",
                      width: "210mm"
                    }}
                  >
                    {num === 1 && <TemplateOne data={data} />}
                    {num === 2 && <TemplateTwo data={data} />}
                    {num === 3 && <TemplateThree data={data} />}
                    {num === 4 && <TemplateFour data={data} />}
                    {num === 5 && <TemplateFive data={data} />}
                  </div>
                  
                  {/* હોવર ઇફેક્ટ માટે ઓવરલે */}
                  <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors duration-500" />
                </div>

                {/* કાર્ડ ફૂટર */}
                <div className="py-5 text-center font-black text-xs uppercase tracking-[0.2em] text-slate-400 bg-white group-hover:text-indigo-600 transition-colors">
                  Template {num}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}