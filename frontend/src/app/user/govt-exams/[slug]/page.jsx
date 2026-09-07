"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Landmark, Calendar, Users, MapPin, IndianRupee, GraduationCap,
  FileText, ExternalLink, ArrowLeft, Download, BadgeInfo, ShieldCheck, ClipboardList, Bookmark,
} from "lucide-react";
import UserSidebar from "@/components/UserSidebar";
import FeatureGuard from "@/components/FeatureGuard";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

// A labelled row, only rendered when a value exists.
function Field({ label, value }) {
  if (!value) return null;
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-800 whitespace-pre-line">{value}</dd>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
        {icon} {title}
      </h2>
      {children}
    </section>
  );
}

export default function ExamDetailPage() {
  const { slug } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchExam = async () => {
      try {
        const res = await fetch(`/api/candidate/govt-exams/${slug}`);
        const result = await res.json();
        if (result.success) {
          setExam(result.data);
          // Determine saved state for this user.
          try {
            const s = await fetch("/api/candidate/saved-exams").then((r) => r.json());
            if (s.success) setSaved((s.savedExams || []).some((e) => e._id === result.data._id));
          } catch { /* not logged in / no profile — ignore */ }
        } else setNotFound(true);
      } catch (err) {
        console.error(err);
        setNotFound(true);
      }
      setLoading(false);
    };
    fetchExam();
  }, [slug]);

  const toggleSave = async () => {
    if (!exam) return;
    setSavingBookmark(true);
    try {
      const res = await fetch("/api/candidate/saved-exams", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId: exam._id }),
      });
      const result = await res.json();
      if (result.success) {
        setSaved(result.saved);
      } else if (res.status === 401) {
        alert("Please log in to save exams.");
      } else {
        alert(result.error || "Could not save. Please try again.");
      }
    } catch {
      alert("Network error while saving. Please try again.");
    }
    setSavingBookmark(false);
  };

  const dateItems = exam
    ? [
      ["Application Start", exam.keyDates?.applicationStart],
      ["Last Date to Apply", exam.keyDates?.applicationEnd],
      ["Correction Window", exam.keyDates?.correctionWindowEnd],
      ["Admit Card", exam.keyDates?.admitCardDate],
      ["Exam Date", exam.keyDates?.examDate],
      ["Answer Key", exam.keyDates?.answerKeyDate],
      ["Result", exam.keyDates?.resultDate],
      ["Interview", exam.keyDates?.interviewDate],
    ].filter(([, v]) => v)
    : [];

  return (
    <div className="flex h-screen bg-[#FDFEFF] overflow-hidden">
      <UserSidebar onCollapseChange={setIsSidebarCollapsed} />

      <main className={`flex-1 overflow-y-auto transition-all duration-300 pt-20 lg:pt-8
        ${isSidebarCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
        <FeatureGuard featureName="Government Portal Access">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">

          <Link href="/user/govt-schemes" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 mb-6">
            <ArrowLeft className="h-4 w-4" /> Back to Govt Exams
          </Link>

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : notFound || !exam ? (
            <div className="text-center py-32 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Exam not found</h3>
              <p className="text-gray-500 mt-1">This exam may have been removed or is no longer live.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">{exam.category}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{exam.source}</span>
                  {exam.isFeatured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Featured</span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{exam.name}</h1>
                <p className="mt-1 text-gray-600 flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-blue-600" /> {exam.conductingAuthority}
                  {exam.advertisementNumber && <span className="text-gray-400">• Advt: {exam.advertisementNumber}</span>}
                </p>

                {/* Apply / official links */}
                <div className="mt-5 flex flex-wrap gap-3">
                  {exam.applyLink && (
                    <a href={exam.applyLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700">
                      Apply on Official Portal <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  )}
                  {exam.officialWebsite && (
                    <a href={exam.officialWebsite} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200">
                      Official Website <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  )}
                  <button onClick={toggleSave} disabled={savingBookmark}
                    className={`inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold border transition-colors disabled:opacity-60 ${saved ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}>
                    <Bookmark className={`mr-2 h-4 w-4 ${saved ? "fill-blue-600 text-blue-600" : ""}`} />
                    {saved ? "Saved" : "Save Exam"}
                  </button>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {typeof exam.vacancyCount === "number" && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <Users className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900">{exam.vacancyCount.toLocaleString("en-IN")}</div>
                    <div className="text-xs text-gray-500">Vacancies</div>
                  </div>
                )}
                {exam.keyDates?.applicationEnd && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <Calendar className="h-5 w-5 text-red-500 mx-auto mb-1" />
                    <div className="text-sm font-bold text-gray-900">{fmtDate(exam.keyDates.applicationEnd)}</div>
                    <div className="text-xs text-gray-500">Last Date</div>
                  </div>
                )}
                {exam.jobLocation && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <MapPin className="h-5 w-5 text-gray-400 mx-auto mb-1" />
                    <div className="text-sm font-bold text-gray-900">{exam.jobLocation}</div>
                    <div className="text-xs text-gray-500">Location</div>
                  </div>
                )}
                {exam.qualification && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <GraduationCap className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <div className="text-sm font-bold text-gray-900">{exam.qualification}</div>
                    <div className="text-xs text-gray-500">Qualification</div>
                  </div>
                )}
              </div>

              {/* Important dates */}
              {dateItems.length > 0 && (
                <Section icon={<Calendar className="h-5 w-5 text-blue-600" />} title="Important Dates">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    {dateItems.map(([label, val]) => (
                      <div key={label} className="flex justify-between py-2 border-b border-gray-100 text-sm">
                        <span className="text-gray-500">{label}</span>
                        <span className="font-semibold text-gray-800">{fmtDate(val)}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Eligibility */}
              <Section icon={<BadgeInfo className="h-5 w-5 text-blue-600" />} title="Eligibility">
                <dl>
                  <Field label="Qualification" value={exam.qualification} />
                  <Field label="Eligibility Conditions" value={exam.eligibilityConditions} />
                  <Field label="Age Limit" value={exam.ageLimit} />
                  <Field label="Reservation Details" value={exam.reservationDetails} />
                  <Field label="Nationality" value={exam.nationality} />
                  <Field label="Experience" value={exam.experience} />
                  <Field label="Physical Eligibility" value={exam.physicalEligibility} />
                </dl>
              </Section>

              {/* Selection & pattern */}
              {(exam.selectionProcedure || exam.examPattern || exam.negativeMarking || exam.syllabus) && (
                <Section icon={<ClipboardList className="h-5 w-5 text-blue-600" />} title="Selection & Exam Pattern">
                  <dl>
                    <Field label="Selection Procedure" value={exam.selectionProcedure} />
                    <Field label="Exam Pattern" value={exam.examPattern} />
                    <Field label="Negative Marking" value={exam.negativeMarking} />
                    <Field label="Syllabus" value={exam.syllabus} />
                  </dl>
                </Section>
              )}

              {/* Salary & application */}
              <Section icon={<IndianRupee className="h-5 w-5 text-blue-600" />} title="Salary & Application">
                <dl>
                  <Field label="Salary Structure" value={exam.salaryStructure} />
                  <Field label="Application Fees" value={exam.applicationFees} />
                  <Field label="Payment Methods" value={exam.paymentMethods} />
                  <Field label="Required Documents" value={exam.requiredDocuments?.join(", ")} />
                  <Field label="Helpdesk" value={exam.helpdeskInfo} />
                </dl>
              </Section>

              {/* Attachments */}
              {exam.attachments?.length > 0 && (
                <Section icon={<Download className="h-5 w-5 text-blue-600" />} title="Official Documents">
                  <div className="space-y-2">
                    {exam.attachments.map((a, i) => (
                      <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                        <span className="flex items-center gap-2 text-sm font-medium text-gray-800">
                          <FileText className="h-4 w-4 text-blue-600" /> {a.label}
                        </span>
                        <Download className="h-4 w-4 text-gray-400" />
                      </a>
                    ))}
                  </div>
                </Section>
              )}

              <p className="flex items-center gap-2 text-xs text-gray-400 mb-10">
                <ShieldCheck className="h-4 w-4" />
                Always verify details on the official portal before applying.
              </p>
            </>
          )}
          </div>
        </FeatureGuard>
      </main>
    </div>
  );
}
