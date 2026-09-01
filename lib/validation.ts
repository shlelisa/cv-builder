import {
  UserProfile,
  PersonalInfo,
  Education,
  Experience,
  Internship,
  Project,
  Skills,
} from '@/types';
import { Translations } from '@/lib/translations';

export type ValidationErrorCode =
  | 'required'
  | 'invalidEmail'
  | 'invalidPhone'
  | 'invalidUrl'
  | 'invalidYear'
  | 'endBeforeStart'
  | 'invalidNumber';

export type FieldErrors = Partial<Record<string, ValidationErrorCode>>;

export interface SectionValidation {
  personal: FieldErrors;
  education: FieldErrors;
  experience: FieldErrors;
  internships: FieldErrors;
  projects: FieldErrors;
  skills: FieldErrors;
  additional: FieldErrors;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s().-]*$/;
const URL_RE = /^(https?:\/\/)?(www\.)?[\w-]+(\.[\w-]+)+([/?#].*)?$/i;
const YEAR_RE = /^(19|20)\d{2}$/;

const isBlank = (value?: string | number | null): boolean =>
  value === undefined || value === null || String(value).trim().length === 0;

function requireField(errors: FieldErrors, key: string, value?: string | number | null) {
  if (isBlank(value)) errors[key] = 'required';
}

function validUrl(errors: FieldErrors, key: string, value?: string) {
  if (!isBlank(value) && !URL_RE.test(String(value).trim())) errors[key] = 'invalidUrl';
}

function validEmail(errors: FieldErrors, key: string, value?: string) {
  if (!isBlank(value) && !EMAIL_RE.test(String(value).trim())) errors[key] = 'invalidEmail';
}

function validPhone(errors: FieldErrors, key: string, value?: string) {
  if (!isBlank(value) && !PHONE_RE.test(String(value).trim())) errors[key] = 'invalidPhone';
}

function validYear(errors: FieldErrors, key: string, value?: number) {
  if (!isBlank(value) && !YEAR_RE.test(String(value))) errors[key] = 'invalidYear';
}

export function validatePersonalInfo(info: PersonalInfo): FieldErrors {
  const errors: FieldErrors = {};
  requireField(errors, 'fullName', info.fullName);
  requireField(errors, 'email', info.email);
  requireField(errors, 'phone', info.phone);
  requireField(errors, 'location', info.location);
  validEmail(errors, 'email', info.email);
  validPhone(errors, 'phone', info.phone);
  validUrl(errors, 'linkedin', info.linkedin);
  validUrl(errors, 'github', info.github);
  validUrl(errors, 'portfolio', info.portfolio);
  return errors;
}

export function validateEducationList(items: Education[]): FieldErrors {
  const errors: FieldErrors = {};
  items.forEach((item, index) => {
    const p = `${index}.`;
    requireField(errors, `${p}university`, item.university);
    requireField(errors, `${p}department`, item.department);
    validYear(errors, `${p}startYear`, item.startYear);
    validYear(errors, `${p}graduationYear`, item.graduationYear);
    if (
      item.startYear > 0 &&
      item.graduationYear > 0 &&
      item.graduationYear < item.startYear
    ) {
      errors[`${p}graduationYear`] = 'endBeforeStart';
    }
  });
  return errors;
}

export function validateExperienceList(items: Experience[]): FieldErrors {
  const errors: FieldErrors = {};
  items.forEach((item, index) => {
    const p = `${index}.`;
    requireField(errors, `${p}company`, item.company);
    requireField(errors, `${p}position`, item.position);
    requireField(errors, `${p}startDate`, item.startDate);
    if (!item.isCurrent) requireField(errors, `${p}endDate`, item.endDate);
    if (
      item.startDate &&
      item.endDate &&
      !item.isCurrent &&
      item.endDate < item.startDate
    ) {
      errors[`${p}endDate`] = 'endBeforeStart';
    }
  });
  return errors;
}

export function validateInternshipList(items: Internship[]): FieldErrors {
  const errors: FieldErrors = {};
  items.forEach((item, index) => {
    const p = `${index}.`;
    requireField(errors, `${p}organization`, item.organization);
    requireField(errors, `${p}position`, item.position);
  });
  return errors;
}

export function validateProjectsList(items: Project[]): FieldErrors {
  const errors: FieldErrors = {};
  items.forEach((item, index) => {
    const p = `${index}.`;
    requireField(errors, `${p}name`, item.name);
    validUrl(errors, `${p}githubUrl`, item.githubUrl);
    validUrl(errors, `${p}demoUrl`, item.demoUrl);
  });
  return errors;
}

export function validateSkills(_skills: Skills): FieldErrors {
  return {};
}

export function validateAdditional(profile: UserProfile): FieldErrors {
  const errors: FieldErrors = {};
  profile.certifications.forEach((_cert, i) => {
    requireField(errors, `cert-${i}.name`, profile.certifications[i].name);
  });
  profile.training.forEach((_tr, i) => {
    requireField(errors, `train-${i}.name`, profile.training[i].name);
  });
  profile.volunteering.forEach((_vol, i) => {
    requireField(errors, `vol-${i}.organization`, profile.volunteering[i].organization);
  });
  profile.achievements.forEach((_ach, i) => {
    requireField(errors, `ach-${i}.title`, profile.achievements[i].title);
  });
  profile.references.forEach((_ref, i) => {
    const p = `ref-${i}.`;
    requireField(errors, `${p}name`, profile.references[i].name);
    validEmail(errors, `${p}email`, profile.references[i].email);
    validPhone(errors, `${p}phone`, profile.references[i].phone);
  });
  return errors;
}

export function validateAll(profile: UserProfile): SectionValidation {
  return {
    personal: validatePersonalInfo(profile.personalInfo),
    education: validateEducationList(profile.education),
    experience: validateExperienceList(profile.experience),
    internships: validateInternshipList(profile.internships),
    projects: validateProjectsList(profile.projects),
    skills: validateSkills(profile.skills),
    additional: validateAdditional(profile),
  };
}

export function sectionHasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function sectionErrorCount(errors: FieldErrors): number {
  return Object.keys(errors).length;
}

export function fieldError(
  t: Translations,
  errors: FieldErrors,
  touched: Record<string, boolean>,
  field: string,
): string | undefined {
  const code = errors[field];
  if (!code || !touched[field]) return undefined;
  return t.validation[code];
}