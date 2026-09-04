'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserProfileData } from '@/lib/AuthContext';
import { useApp } from '@/lib/AppContext';
import { Button } from '@/components/ui';
import AuthModal from '@/components/auth/AuthModal';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, updateProfile, savedCvs, deleteCvFromCloud, signOut } = useAuth();
  const { t } = useApp();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'saved_cvs'>('profile');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Form State
  const [formData, setFormData] = useState<UserProfileData>({
    id: '',
    fullName: '',
    email: '',
    phone: '',
    location: '',
    headline: '',
    linkedin: '',
    github: '',
    portfolio: '',
    bio: '',
    education: [],
    experience: [],
    skills: { technical: [], soft: [], languages: [] },
    projects: [],
  });

  const [techSkillsInput, setTechSkillsInput] = useState('');
  const [softSkillsInput, setSoftSkillsInput] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      setTechSkillsInput((profile.skills?.technical || []).join(', '));
      setSoftSkillsInput((profile.skills?.soft || []).join(', '));
    }
  }, [profile]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveStatus('saving');

    const updatedData: Partial<UserProfileData> = {
      ...formData,
      skills: {
        ...formData.skills,
        technical: techSkillsInput.split(',').map((s) => s.trim()).filter(Boolean),
        soft: softSkillsInput.split(',').map((s) => s.trim()).filter(Boolean),
      },
    };

    const res = await updateProfile(updatedData);
    if (!res.error) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } else {
      setSaveStatus('error');
    }
  };

  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...(prev.education || []),
        {
          university: '',
          degree: '',
          department: '',
          graduationYear: '',
          cgpa: '',
        },
      ],
    }));
  };

  const handleRemoveEducation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        {
          company: '',
          position: '',
          duration: '',
          responsibilities: [],
        },
      ],
    }));
  };

  const handleRemoveExperience = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== index),
    }));
  };

  const handleAddProject = () => {
    setFormData((prev) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        {
          name: '',
          description: '',
          technologies: [],
        },
      ],
    }));
  };

  const handleRemoveProject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index),
    }));
  };

  const handleOpenCvInBuilder = (cv: any) => {
    router.push(`/builder?template=${cv.templateId || 'corporate-navy'}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2.5 text-gray-500 font-semibold text-sm">
          <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Loading your profile &amp; cloud data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Profile Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : '👤'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-zinc-100 tracking-tight">
                {formData.fullName || 'Candidate Profile'}
              </h1>
              {user ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Cloud Synced
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Local Mode
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400 mt-0.5">
              {formData.headline || 'Maintain your master career profile to auto-fill resumes and job analysis.'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {!user ? (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setAuthModalOpen(true)}
              className="gap-1.5 shadow-sm"
            >
              <span>🔐</span>
              <span>Sign In with Email</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="text-xs text-red-600 hover:text-red-700 hover:border-red-300"
            >
              Sign Out
            </Button>
          )}

          <button
            type="button"
            onClick={() => handleSaveProfile()}
            disabled={saveStatus === 'saving'}
            className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saveStatus === 'saving' ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <span>✓</span>
                <span>Saved!</span>
              </>
            ) : (
              <>
                <span>💾</span>
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
              : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          👤 Master Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('saved_cvs')}
          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'saved_cvs'
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
              : 'text-gray-600 dark:text-zinc-400 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-zinc-800'
          }`}
        >
          <span>📂 Saved Cloud CVs</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-gray-200 dark:bg-zinc-700">
            {savedCvs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: MASTER PROFILE FORM */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Section A: Contact & Personal Info */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
              <span>📍</span>
              <span>Personal Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName || ''}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Lelisa Bekele"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Professional Title / Headline
                </label>
                <input
                  type="text"
                  value={formData.headline || ''}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  placeholder="e.g. Full-Stack Software Developer"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. name@example.com"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +251 900 000 000"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Location / City
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Addis Ababa, Ethiopia"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={formData.linkedin || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  placeholder="linkedin.com/in/username"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Professional Bio / Executive Summary
              </label>
              <textarea
                rows={3}
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="2-3 sentences summarizing your career background and key strengths..."
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Section B: Skills Matrix */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200 flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
              <span>🛠️</span>
              <span>Skills Matrix</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Technical Skills &amp; Tools (comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={techSkillsInput}
                  onChange={(e) => setTechSkillsInput(e.target.value)}
                  placeholder="e.g. React.js, Node.js, TypeScript, SQL, MongoDB, Git, Docker, REST APIs"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                  Soft Skills &amp; Interpersonal (comma-separated)
                </label>
                <textarea
                  rows={3}
                  value={softSkillsInput}
                  onChange={(e) => setSoftSkillsInput(e.target.value)}
                  placeholder="e.g. Problem Solving, Team Leadership, Communication, Agile Collaboration"
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section C: Education Entries */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200 flex items-center gap-2">
                <span>🎓</span>
                <span>Education Background</span>
              </h2>
              <button
                type="button"
                onClick={handleAddEducation}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
              >
                + Add Degree
              </button>
            </div>

            {(formData.education || []).map((edu, idx) => (
              <div key={idx} className="p-4 bg-gray-50 dark:bg-zinc-800/60 rounded-xl border border-gray-200 dark:border-zinc-700 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(idx)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                >
                  ✕ Remove
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                      University / Institution
                    </label>
                    <input
                      type="text"
                      value={edu.university || ''}
                      onChange={(e) => {
                        const updated = [...(formData.education || [])];
                        updated[idx].university = e.target.value;
                        setFormData({ ...formData, education: updated });
                      }}
                      placeholder="e.g. Addis Ababa University"
                      className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                      Degree &amp; Field
                    </label>
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) => {
                        const updated = [...(formData.education || [])];
                        updated[idx].degree = e.target.value;
                        setFormData({ ...formData, education: updated });
                      }}
                      placeholder="e.g. BSc in Software Engineering"
                      className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      value={edu.graduationYear || ''}
                      onChange={(e) => {
                        const updated = [...(formData.education || [])];
                        updated[idx].graduationYear = e.target.value;
                        setFormData({ ...formData, education: updated });
                      }}
                      placeholder="e.g. 2024"
                      className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                      CGPA / Grade (Optional)
                    </label>
                    <input
                      type="text"
                      value={edu.cgpa || ''}
                      onChange={(e) => {
                        const updated = [...(formData.education || [])];
                        updated[idx].cgpa = e.target.value;
                        setFormData({ ...formData, education: updated });
                      }}
                      placeholder="e.g. 3.9"
                      className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white dark:bg-zinc-800"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Save Bar */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className="py-3 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saveStatus === 'saving' ? 'Saving Profile...' : 'Save & Update Master Profile'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SAVED CLOUD CVS */}
      {activeTab === 'saved_cvs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400">
              Your saved resumes are stored securely and accessible from any device.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => router.push('/builder')}
              className="text-xs"
            >
              + Create New CV
            </Button>
          </div>

          {savedCvs.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl space-y-3">
              <span className="text-3xl">📄</span>
              <h3 className="font-bold text-gray-800 dark:text-zinc-200">No Saved CVs Found</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Open the CV Builder to design and save your customized resume versions.
              </p>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => router.push('/builder')}
                className="mt-2 text-xs"
              >
                Open CV Builder
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedCvs.map((cv) => (
                <div
                  key={cv.id}
                  className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-500/60 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 uppercase">
                        {cv.templateId || 'Template'}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(cv.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-zinc-100">
                      {cv.title || 'Untitled CV'}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      Candidate: {cv.singletonData?.fullName || 'Not specified'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenCvInBuilder(cv)}
                      className="flex-1 text-xs justify-center"
                    >
                      Open in Builder ↗
                    </Button>
                    <button
                      type="button"
                      onClick={() => deleteCvFromCloud(cv.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs transition-colors cursor-pointer"
                      title="Delete Resume"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
