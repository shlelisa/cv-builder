export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  profilePhoto?: string;
  dateOfBirth?: string;
  nationality?: string;
}

export interface Education {
  id: string;
  university: string;
  degree: string;
  department: string;
  major?: string;
  minor?: string;
  startYear: number;
  graduationYear: number;
  cgpa?: number;
  majorGpa?: number;
  exitExamScore?: number;
  academicAchievements?: string[];
  relevantCourses?: string[];
  academicAwards?: string[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  employmentType: 'full-time' | 'part-time' | 'contract' | 'temporary';
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  responsibilities: string[];
  achievements: string[];
  technologiesUsed: string[];
}

export interface Internship {
  id: string;
  organization: string;
  position: string;
  duration: string;
  startDate: string;
  endDate?: string;
  responsibilities: string[];
  achievements: string[];
  skillsGained: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  role: string;
  technologies: string[];
  features: string[];
  resultsImpact?: string;
  githubUrl?: string;
  demoUrl?: string;
}

export interface Skills {
  technicalSkills: string[];
  programmingLanguages: string[];
  frameworks: string[];
  databases: string[];
  networking: string[];
  cloud: string[];
  officeTools: string[];
  softSkills: string[];
  languages: Language[];
}

export interface Language {
  name: string;
  proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'basic';
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  date: string;
  credentialUrl?: string;
}

export interface Training {
  id: string;
  name: string;
  institution: string;
  duration: string;
  skillsLearned: string[];
}

export interface Volunteering {
  id: string;
  organization: string;
  position: string;
  responsibilities: string[];
  achievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  category: 'award' | 'competition' | 'scholarship' | 'leadership' | 'academic' | 'professional';
  description: string;
  date: string;
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  organization: string;
  email: string;
  phone: string;
}

export interface UserProfile {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  internships: Internship[];
  projects: Project[];
  skills: Skills;
  certifications: Certification[];
  training: Training[];
  volunteering: Volunteering[];
  achievements: Achievement[];
  references: Reference[];
}

export interface JobDescription {
  position: string;
  company: string;
  requirements: string[];
  responsibilities?: string[];
  qualifications?: string[];
  keywords?: string[];
}

export interface JobAnalysis {
  requiredEducation: string[];
  requiredTechnicalSkills: string[];
  preferredTechnicalSkills: string[];
  requiredExperience: string[];
  softSkills: string[];
  keywords: string[];
}

export interface JobMatchResult {
  matchScore: number;
  matchedQualifications: string[];
  matchedTechnicalSkills: string[];
  matchedExperience: string[];
  matchedEducation: string[];
  missingRequirements: string[];
  recommendations: string[];
}

export type DocumentType = 'cv' | 'application-letter' | 'cover-letter';

export type LanguageCode = 'en' | 'om' | 'am';

export interface GeneratedDocument {
  type: DocumentType;
  content: string;
  language: LanguageCode;
  generatedAt: Date;
}
