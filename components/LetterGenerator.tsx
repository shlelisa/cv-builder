"use client";

import { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { aiService } from "@/services/ai";
import { LanguageCode } from "@/types";
import { exportLetterToWord } from "@/lib/export-utils";

export default function LetterGenerator() {
  const { t, language, setLanguage } = useApp();
  const tl = t.letters;

  // Settings
  const [letterType, setLetterType] = useState<"application" | "cover">("application");
  const [tone, setTone] = useState<"professional" | "fresh-graduate" | "modern">("professional");

  // Candidate Details
  const [applicantName, setApplicantName] = useState("Maqaa Kee / Your Name");
  const [email, setEmail] = useState("yourname@example.com");
  const [phone, setPhone] = useState("+251 91 234 5678");
  const [location, setLocation] = useState("Addis Ababa, Ethiopia");

  // Job Details
  const [company, setCompany] = useState("ABC Company");
  const [position, setPosition] = useState("Junior Software Engineer");
  const [recipient, setRecipient] = useState("Hiring Committee");

  // Background
  const [degree, setDegree] = useState("BSc in Software Engineering");
  const [university, setUniversity] = useState("ABC University");
  const [skills, setSkills] = useState("Java, C++, React.js, Node.js, SQL, MongoDB, Git, Problem Solving");
  const [experienceSummary, setExperienceSummary] = useState("Software Development Intern at ABC Company");
  const [keyProjects, setKeyProjects] = useState("Employee Hiring System (Final Year Project) & House Rental Platform");
  const [requirements, setRequirements] = useState("- Degree in Software Engineering or CS\n- Proficiency in React & Node.js\n- Database knowledge (SQL/MongoDB)\n- Strong problem-solving & collaborative attitude");

  // Output state
  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const skillsArray = skills
      .split(/[,|\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const letter = aiService.generateHumanLetter({
      letterType,
      tone,
      language: language as LanguageCode,
      company: company.trim(),
      position: position.trim(),
      recipient: recipient.trim(),
      applicantName: applicantName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      location: location.trim(),
      degree: degree.trim(),
      university: university.trim(),
      skills: skillsArray,
      experienceSummary: experienceSummary.trim(),
      keyProjects: keyProjects.trim(),
      jobRequirements: requirements.split("\n").map((r) => r.trim()).filter(Boolean),
    });

    setGeneratedLetter(letter);
    setCopied(false);
  };

  const handleLoadSample = (type: "software" | "marketing") => {
    if (type === "software") {
      setApplicantName("Maqaa Kee / Your Name");
      setEmail("yourname@example.com");
      setPhone("+251 91 234 5678");
      setLocation("Addis Ababa, Ethiopia");
      setCompany("ABC Company");
      setPosition("Junior Software Engineer");
      setRecipient("Engineering Hiring Team");
      setDegree("BSc in Software Engineering");
      setUniversity("ABC University");
      setSkills("Java, C++, React.js, Node.js, SQL, MongoDB, Git, REST APIs, Teamwork");
      setExperienceSummary("IT and Software Engineering Internship at ABC Company");
      setKeyProjects("Automated University Hiring System (PHP/MySQL) & House Rental Portal (MERN stack)");
      setRequirements("- Bachelor's degree in Software Engineering\n- Experience in full-stack web technologies\n- Database management (SQL & NoSQL)\n- Collaborative mindset");
    } else {
      setApplicantName("Richard Sanchez");
      setEmail("richard.sanchez@email.com");
      setPhone("+1 (555) 234-5678");
      setLocation("Chicago, IL");
      setCompany("Borcelle Media Group");
      setPosition("Marketing Manager");
      setRecipient("Director of Talent Acquisition");
      setDegree("Bachelor of Business Management");
      setUniversity("Wardiere University");
      setSkills("Digital Marketing, Brand Strategy, SEO, Campaign Management, Team Leadership, Analytics");
      setExperienceSummary("Marketing Lead at Fauget Studio managing multi-channel campaigns with 35% ROI growth");
      setKeyProjects("National brand relaunch campaign reaching 1.2M impressions");
      setRequirements("- 3+ years in marketing strategy\n- Experience managing creative and growth teams\n- Proven ROI on multi-channel campaigns");
    }
  };

  const handleCopy = async () => {
    if (!generatedLetter) return;
    try {
      await navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownloadDoc = async () => {
    if (!generatedLetter) return;
    const filename = `${(applicantName || "Application").replace(/\s+/g, "_")}_Letter.docx`;
    await exportLetterToWord(generatedLetter, applicantName, position, filename);
  };

  const handleDownloadTxt = () => {
    if (!generatedLetter) return;
    const blob = new Blob([generatedLetter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(applicantName || "Application").replace(/\s+/g, "_")}_Letter.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    if (!generatedLetter) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${position} - Application Letter</title>
          <style>
            @page { size: A4; margin: 25mm 20mm; }
            body { font-family: 'Georgia', serif; font-size: 11pt; line-height: 1.6; color: #111; margin: 0; padding: 20px; }
            p { margin-bottom: 14pt; }
          </style>
        </head>
        <body>
          ${generatedLetter.split("\n\n").map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`).join("")}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  // Metrics
  const wordCount = generatedLetter ? generatedLetter.trim().split(/\s+/).length : 0;
  const readTimeMin = Math.max(1, Math.round(wordCount / 180));

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
            {tl.badge}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight">
            {tl.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 mt-1">
            {tl.subtitle}
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">{tl.sampleProfiles}</span>
          <button
            type="button"
            onClick={() => handleLoadSample("software")}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-xs"
          >
            {tl.techGrad}
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample("marketing")}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-xs"
          >
            {tl.businessPro}
          </button>
        </div>
      </div>

      {/* Main Split Layout: Inputs (Left) vs Document Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Controls & Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Format & Style Selectors */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
              {tl.formatAndTone}
            </h3>

            {/* Letter Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1.5">
                {tl.documentType}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLetterType("application")}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${letterType === "application"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100"
                    }`}
                >
                  {tl.formalApp}
                </button>
                <button
                  type="button"
                  onClick={() => setLetterType("cover")}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border text-center transition-all ${letterType === "cover"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:bg-gray-100"
                    }`}
                >
                  {tl.coverLetter}
                </button>
              </div>
            </div>

            {/* Writing Tone */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1.5">
                {tl.writingTone}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "professional" as const, label: tl.toneProfessional },
                  { id: "fresh-graduate" as const, label: tl.toneFreshGrad },
                  { id: "modern" as const, label: tl.toneModern },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTone(item.id)}
                    className={`p-2 rounded-lg border text-center transition-all ${tone === item.id
                      ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300 font-bold"
                      : "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-100"
                      }`}
                  >
                    <span className="text-xs block">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1.5">
                Language
              </label>
              <div className="flex gap-2">
                {[
                  { id: "en" as const, label: "English" },
                  { id: "om" as const, label: "Afaan Oromoo" },
                  { id: "am" as const, label: "አማርኛ (Amharic)" },
                ].map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setLanguage(lang.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${language === lang.id
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs"
                      : "bg-gray-50 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 hover:bg-gray-100"
                      }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Candidate & Target Information Form */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
              {tl.candidateInfo}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  {tl.applicantName} *
                </label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="e.g. Maqaa Kee/Your Name"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  {tl.email} *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@email.com"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  {tl.phone}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +251 912 345 678"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  {tl.location}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Addis Ababa, Ethiopia"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  {tl.company} *
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. ABC Technology PLC"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  {tl.position} *
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g. Junior Software Developer"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                {tl.recipient}
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="e.g. Hiring Committee, Mr. Abebe Bekele"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Qualifications & Experience Form */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300">
              {tl.qualifications}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  {tl.degreeUni}
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. BSc in Software Engineering"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  University / College
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. ABC University"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                {tl.skills}
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Node.js, SQL, TypeScript, Git, Problem Solving"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                {tl.experience}
              </label>
              <input
                type="text"
                value={experienceSummary}
                onChange={(e) => setExperienceSummary(e.target.value)}
                placeholder="e.g. Software Development Intern at ABC Company"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                {tl.projects}
              </label>
              <input
                type="text"
                value={keyProjects}
                onChange={(e) => setKeyProjects(e.target.value)}
                placeholder="e.g. Employee Hiring System for ABC University"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                {tl.jobRequirements}
              </label>
              <textarea
                rows={3}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder={tl.requirementsPlaceholder}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Big Action Button */}
          <button
            type="button"
            onClick={handleGenerate}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{tl.generateBtn}</span>
          </button>
        </div>

        {/* RIGHT COLUMN: Live Document Editor & Preview (7 cols, sticky) */}
        <div className="lg:col-span-7 sticky top-20 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[700px]">
            {/* Action Bar */}
            <div className="px-5 py-3.5 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-800/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <span>📄</span>
                  <span>{tl.outputTitle}</span>
                </span>
                {generatedLetter && (
                  <span className="text-[11px] font-mono text-gray-500 dark:text-zinc-400 bg-gray-200/60 dark:bg-zinc-700/60 px-2 py-0.5 rounded">
                    {wordCount} {tl.wordCount} · {readTimeMin} {tl.readTime}
                  </span>
                )}
              </div>

              {generatedLetter && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 transition-colors shadow-2xs"
                  >
                    {copied ? tl.copied : tl.copy}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadDoc}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 transition-colors shadow-2xs"
                  >
                    {tl.wordDoc}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 transition-colors shadow-2xs"
                  >
                    {tl.printPdf}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 transition-colors shadow-2xs"
                  >
                    {tl.txtFile}
                  </button>
                </div>
              )}
            </div>

            {/* Letter Paper Body */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col bg-white dark:bg-zinc-900">
              {generatedLetter ? (
                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="text-[11px] text-gray-400 dark:text-zinc-500 italic">
                    💡 Click anywhere inside to make direct personalized adjustments:
                  </div>
                  <textarea
                    rows={26}
                    value={generatedLetter}
                    onChange={(e) => setGeneratedLetter(e.target.value)}
                    className="w-full flex-1 p-4 text-sm sm:text-[15px] leading-relaxed font-serif text-gray-900 dark:text-zinc-100 bg-gray-50/40 dark:bg-zinc-800/30 border border-gray-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                    style={{ minHeight: "520px" }}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl">
                  <span className="text-4xl mb-3">✍️</span>
                  <h4 className="text-base font-bold text-gray-800 dark:text-zinc-200 mb-1">
                    {tl.outputTitle}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 max-w-sm mb-5">
                    {tl.emptyHint}
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold text-xs hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    {tl.generateBtn} →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

