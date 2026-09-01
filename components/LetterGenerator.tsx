"use client";

import { useState } from "react";
import { Button, Input, TextArea } from "@/components/ui";
import { useApp } from "@/lib/AppContext";
import { UserProfile } from "@/types";
import { aiService } from "@/services/ai";

const emptyProfile: UserProfile = {
  personalInfo: { fullName: "", email: "", phone: "", location: "" },
  education: [],
  experience: [],
  internships: [],
  projects: [],
  skills: {
    technicalSkills: [],
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    networking: [],
    cloud: [],
    officeTools: [],
    softSkills: [],
    languages: [],
  },
  certifications: [],
  training: [],
  volunteering: [],
  achievements: [],
  references: [],
};

const LetterGenerator: React.FC = () => {
  const { language } = useApp();
  const [letterType, setLetterType] = useState<"application" | "cover">(
    "application",
  );
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [requirements, setRequirements] = useState("");
  const [profileText, setProfileText] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [copied, setCopied] = useState(false);

  const parseProfile = (text: string): Partial<UserProfile> => {
    const lower = text.toLowerCase();
    const parsed: Partial<UserProfile> = {
      personalInfo: { fullName: "", email: "", phone: "", location: "" },
      education: [],
      skills: { ...emptyProfile.skills },
    };

    const cgpaMatch = lower.match(/(\d+\.\d+)\s*cgpa/i);
    const gradMatch = lower.match(/graduated?\s*(\d{4})/i);
    const degreeMatch = lower.match(
      /software engineering|computer science|information technology|accounting|economics|nursing|medicine|law|civil engineering|mechanical engineering|electrical engineering/i,
    );
    const internshipMatch = lower.match(/intern(?:ship)? at\s+([^.]+)/i);
    const projectMatch = lower.match(/project:?\s+([^,]+)/i);

    const skills = [...emptyProfile.skills.technicalSkills];
    [
      "react",
      "node",
      "mysql",
      "javascript",
      "typescript",
      "python",
      "java",
      "html",
      "css",
      "postgresql",
      "mongodb",
      "sql",
      "git",
      "aws",
      "excel",
      "powerpoint",
    ].forEach((skill) => {
      if (lower.includes(skill)) {
        skills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });

    if (degreeMatch) {
      parsed.education = [
        {
          id: "auto-1",
          university: "",
          degree: degreeMatch[0],
          department: degreeMatch[0],
          startYear: gradMatch ? parseInt(gradMatch[1]) - 4 : 2020,
          graduationYear: gradMatch ? parseInt(gradMatch[1]) : 2024,
          cgpa: cgpaMatch ? parseFloat(cgpaMatch[1]) : undefined,
          relevantCourses: [],
          academicAchievements: [],
          academicAwards: [],
        },
      ];
    }

    if (internshipMatch) {
      parsed.internships = [
        {
          id: "auto-i1",
          organization: internshipMatch[1].trim(),
          position: "Intern",
          duration: "",
          startDate: "",
          responsibilities: [],
          achievements: [],
          skillsGained: [],
        },
      ];
    }

    if (projectMatch) {
      parsed.projects = [
        {
          id: "auto-p1",
          name: projectMatch[1].trim(),
          description: "",
          role: "",
          technologies: [],
          features: [],
        },
      ];
    }

    parsed.skills = {
      ...emptyProfile.skills,
      technicalSkills: [...new Set(skills)],
    };

    return parsed;
  };

  const handleGenerate = () => {
    const profile: UserProfile = {
      ...emptyProfile,
      ...(profileText.trim() ? parseProfile(profileText) : {}),
    };

    const letter =
      letterType === "application"
        ? aiService.generateApplicationLetter(
            profile,
            company,
            position,
            requirements.split("\n").filter((r) => r.trim()),
            language,
          )
        : aiService.generateCoverLetter(profile, company, position, language);

    setGeneratedLetter(letter);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedLetter], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${letterType}-letter_${position || "position"}_${company || "company"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
          Letter Generator
        </h1>
        <p className="text-gray-600 dark:text-zinc-400">
          Generate professional application letters and cover letters tailored
          to specific positions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
            Letter Details
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              Letter Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setLetterType("application")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  letterType === "application"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                }`}
              >
                Application Letter
              </button>
              <button
                onClick={() => setLetterType("cover")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  letterType === "cover"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                }`}
              >
                Cover Letter
              </button>
            </div>
          </div>

          <Input
            label="Company *"
            placeholder="e.g., ABC Technology PLC"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
          <Input
            label="Position *"
            placeholder="e.g., Junior Software Developer"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
          />

          {letterType === "application" && (
            <TextArea
              label="Job Requirements (one per line)"
              rows={5}
              placeholder={
                "- Bachelor's degree in Software Engineering\n- React\n- Node.js\n- SQL"
              }
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
          )}

          <TextArea
            label="Your Profile"
            rows={5}
            placeholder={
              "e.g., 3.75 cgpa, Software Engineering graduate 2024, skills: React, Node.js, SQL, MySQL, project: Digital Library Management System, internship at ABC Tech"
            }
            value={profileText}
            onChange={(e) => setProfileText(e.target.value)}
          />

          <Button onClick={handleGenerate} className="w-full">
            Generate {letterType === "application" ? "Application" : "Cover"}{" "}
            Letter
          </Button>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-4">
            Generated Letter
          </h3>

          {generatedLetter ? (
            <div>
              <div className="flex justify-end gap-2 mb-3">
                <Button onClick={handleCopy} variant="outline" size="sm">
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button onClick={handleDownload} variant="outline" size="sm">
                  Download
                </Button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 dark:text-zinc-200 bg-gray-50 dark:bg-zinc-800/50 rounded-md p-4 max-h-600px overflow-y-auto">
                {generatedLetter}
              </pre>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 dark:text-zinc-500 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-lg">
              Fill in the details and click &quot;Generate&quot; to create your
              letter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LetterGenerator;
