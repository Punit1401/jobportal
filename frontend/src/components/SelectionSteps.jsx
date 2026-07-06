import { CheckCircleIcon } from "@heroicons/react/24/solid";

export default function SelectionSteps() {
  const steps = [
    {
      title: "Step 1: Reading of Job Description",
      desc: "Review our available positions and understand the requirements",
      done: true,
    },
    {
      title: "Step 2: Filling of Basic Contact Information",
      desc: "Complete your personal and professional details in our application form",
      done: true,
    },
    {
      title: "Step 3: Uploading of Resume",
      desc: "Upload your resume in PDF, DOC, or DOCX format",
      done: true,
    },
    {
      title: "Step 4: Google Meeting to assign sample task",
      desc: "Initial interview and assignment of a task related to your profile and job description",
      done: false,
    },
    {
      title: "Step 5: Google Meeting for final Discussion",
      desc: "Final interview round to discuss your task completion and fit",
      done: false,
    },
    {
      title: "Step 6: Confirmation for the qualified candidate",
      desc: "Final selection and onboarding process for successful candidates",
      done: false,
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="text-center mb-10">
        <p className="text-blue-600 font-semibold uppercase tracking-widest">How it works</p>
        <h2 className="text-3xl font-bold">Selection Process Steps</h2>
        <p className="text-gray-600 mt-2">
          Complete our 6-step screening and selection process to join our team
        </p>
      </div>

      <div className="max-w-4xl mx-auto bg-white p-8 shadow-sm rounded-lg">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-4 mb-6">
            <div>
              {step.done ? (
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              ) : (
                <div className="h-8 w-8 border-2 border-gray-300 rounded-full" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
