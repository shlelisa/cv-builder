import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-zinc-100 mb-4">
            Build Your Professional Career
          </h1>
          <p className="text-xl text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
            Create ATS-friendly CVs, cover letters, and application letters with
            AI-powered assistance. Perfect for students and fresh graduates.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/builder"
              className="inline-flex items-center px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Start Building Your CV
            </Link>
            <Link
              href="/templates"
              className="inline-flex items-center px-8 py-3 rounded-lg bg-white dark:bg-zinc-800 text-blue-700 dark:text-blue-300 font-semibold hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors shadow-lg hover:shadow-xl border border-blue-200 dark:border-blue-900"
            >
              Build from a Template
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
            <div className="text-blue-600 dark:text-blue-400 text-3xl mb-3">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2">
              Smart CV Generation
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 text-sm">
              Our AI analyzes your education, skills, and experience to create a
              professional, ATS-optimized CV tailored to your career goals.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
            <div className="text-blue-600 dark:text-blue-400 text-3xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2">
              Job Matching
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 text-sm">
              Paste any job description and our system will analyze requirements
              and show you exactly how well you match, with recommendations to
              improve.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 p-6">
            <div className="text-blue-600 dark:text-blue-400 text-3xl mb-3">✉️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-2">
              Cover Letters & Applications
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 text-sm">
              Generate professional application letters and cover letters that
              connect your qualifications to specific job requirements.
            </p>
          </div>
        </div>

        <div className="mb-16">
          <Link
            href="/templates"
            className="block bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 p-8 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="text-5xl">✨</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-1">
                  Upload Any CV Template
                </h3>
                <p className="text-gray-600 dark:text-zinc-400">
                  Have a CV from a recruiter or a PDF you like? Upload the image and
                  our AI understands the layout, identifies the required sections, and
                  asks you for exactly the info it needs to match that template.
                </p>
              </div>
              <span className="inline-flex px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold whitespace-nowrap">
                Try it now →
              </span>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-3">Multi-Language Support</h3>
            <p className="text-blue-100">
              Create professional documents in English, Afaan Oromo, and Amharic
              while preserving professional terminology.
            </p>
          </div>

          <div className="bg-linear-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-3">All Academic Fields</h3>
            <p className="text-purple-100">
              From Engineering to Health Sciences, Business to Law — support for
              every department and career path.
            </p>
          </div>

          <div className="bg-linear-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-3">ATS Optimized</h3>
            <p className="text-emerald-100">
              Keywords and formatting optimized for Applicant Tracking Systems
              to get your application noticed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}