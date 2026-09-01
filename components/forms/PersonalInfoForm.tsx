'use client';

import { Input } from '@/components/ui';
import { PersonalInfo } from '@/types';

interface PersonalInfoFormProps {
  value: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
      <p className="text-sm text-gray-500">
        This information will be used to create your professional profile.
      </p>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Full Name *"
          placeholder="e.g., John Smith"
          value={value.fullName}
          onChange={(e) => onChange({ ...value, fullName: e.target.value })}
          required
        />
        <Input
          label="Email *"
          type="email"
          placeholder="e.g., john@email.com"
          value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          required
        />
        <Input
          label="Phone *"
          placeholder="e.g., +251 900 000 000"
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
          required
        />
        <Input
          label="Location *"
          placeholder="e.g., Addis Ababa, Ethiopia"
          value={value.location}
          onChange={(e) => onChange({ ...value, location: e.target.value })}
          required
        />
        <Input
          label="LinkedIn Profile"
          placeholder="e.g., https://linkedin.com/in/john"
          value={value.linkedin || ''}
          onChange={(e) => onChange({ ...value, linkedin: e.target.value })}
        />
        <Input
          label="GitHub Profile"
          placeholder="e.g., https://github.com/john"
          value={value.github || ''}
          onChange={(e) => onChange({ ...value, github: e.target.value })}
        />
        <Input
          label="Portfolio Website"
          placeholder="e.g., https://john.dev"
          value={value.portfolio || ''}
          onChange={(e) => onChange({ ...value, portfolio: e.target.value })}
        />
        <Input
          label="Nationality (Optional)"
          placeholder="e.g., Ethiopian"
          value={value.nationality || ''}
          onChange={(e) => onChange({ ...value, nationality: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Date of Birth (Optional)"
          type="date"
          value={value.dateOfBirth || ''}
          onChange={(e) => onChange({ ...value, dateOfBirth: e.target.value })}
        />
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Photo
          </label>
          <input
            type="file"
            accept="image/*"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  onChange({ ...value, profilePhoto: event.target?.result as string });
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
