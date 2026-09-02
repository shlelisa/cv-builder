'use client';

import Link from 'next/link';
import { useApp } from '@/lib/AppContext';
import { LanguageCode } from '@/types';

export default function Home() {
  const { t, language, setLanguage } = useApp();

  const featuredTemplates = [
    {
      id: 'academic-graduate',
      name: 'Academic Graduate',
      role: 'Software Engineer / Academic CV',
      badge: 'Academic Pro',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      headerBg: 'bg-white dark:bg-zinc-900 border-b-2 border-slate-900 dark:border-slate-100',
      colors: ['#0f172a', '#2563eb', '#10b981', '#f8fafc'],
      features: ['Two-column balanced layout', 'Academic CGPA & Exit Exam highlights', 'Technical project showcases'],
    },
    {
      id: 'slate-timeline',
      name: 'Modern Slate Timeline',
      role: 'Richard Sanchez · Marketing Manager',
      badge: 'Timeline Pro',
      badgeColor: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
      headerBg: 'bg-[#2c3848] text-white',
      colors: ['#2c3848', '#e8edf2', '#2c3848', '#ffffff'],
      features: ['Dark slate header band', 'Circular avatar with white border', 'Connected milestone timeline tree'],
    },
    {
      id: 'modern-executive',
      name: 'Modern Executive',
      role: 'Executive & Corporate Roles',
      badge: 'Executive',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      headerBg: 'bg-[#4c1728] text-white',
      colors: ['#4c1728', '#f5f0f3', '#4c1728', '#1a1a1a'],
      features: ['Deep plum header band', 'Soft lavender sidebar', 'Solid square icon badges & experience track'],
    },
    {
      id: 'navy-professional',
      name: 'Navy Professional',
      role: 'Tech & Business Leadership',
      badge: 'Corporate',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      headerBg: 'bg-[#1a365d] text-white',
      colors: ['#1a365d', '#f0f4f8', '#2b6cb0', '#2d3748'],
      features: ['Deep corporate navy sidebar', 'Bold underlined headings', 'ATS-friendly clean typography'],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 via-white to-blue-50/40 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 transition-colors">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-gray-100 dark:border-zinc-800">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-linear-to-tr from-blue-400/15 via-indigo-400/10 to-purple-400/15 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Glowing Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60 shadow-xs mb-6">
            <span>{t.home.badge}</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-zinc-100 tracking-tight leading-[1.15] max-w-4xl mx-auto mb-6">
            {t.home.heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed mb-10">
            {t.home.heroSubtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-14">
            <Link
              href="/builder"
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all flex items-center gap-2"
            >
              <span>{t.home.ctaBuild}</span>
            </Link>
            <Link
              href="/builder"
              className="px-6 py-3.5 rounded-xl bg-white dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 font-semibold text-sm sm:text-base border border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700/60 shadow-xs transition-all flex items-center gap-2"
            >
              <span>📄 {t.home.ctaTemplates}</span>
            </Link>
            <Link
              href="/jobs"
              className="px-6 py-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-sm sm:text-base border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/60 transition-all flex items-center gap-2"
            >
              <span>{t.home.ctaJobMatch}</span>
            </Link>
            <Link
              href="/letters"
              className="px-6 py-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold text-sm sm:text-base border border-purple-200 dark:border-purple-800 hover:bg-purple-100/60 transition-all flex items-center gap-2"
            >
              <span>{t.home.ctaLetter}</span>
            </Link>
          </div>

          {/* 4 Feature Badges Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto pt-4">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs border border-gray-200/70 dark:border-zinc-800 rounded-xl p-3.5 shadow-2xs text-left">
              <span className="text-xl block mb-1">📄</span>
              <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 block">{t.home.statA4}</span>
              <span className="text-[11px] text-gray-500 dark:text-zinc-400 block">{t.home.statA4Desc}</span>
            </div>

            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs border border-gray-200/70 dark:border-zinc-800 rounded-xl p-3.5 shadow-2xs text-left">
              <span className="text-xl block mb-1">🎨</span>
              <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 block">{t.home.statFonts}</span>
              <span className="text-[11px] text-gray-500 dark:text-zinc-400 block">{t.home.statFontsDesc}</span>
            </div>

            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs border border-gray-200/70 dark:border-zinc-800 rounded-xl p-3.5 shadow-2xs text-left">
              <span className="text-xl block mb-1">🔍</span>
              <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 block">{t.home.statAts}</span>
              <span className="text-[11px] text-gray-500 dark:text-zinc-400 block">{t.home.statAtsDesc}</span>
            </div>

            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs border border-gray-200/70 dark:border-zinc-800 rounded-xl p-3.5 shadow-2xs text-left">
              <span className="text-xl block mb-1">🌍</span>
              <span className="text-xs font-bold text-gray-900 dark:text-zinc-100 block">{t.home.statMulti}</span>
              <span className="text-[11px] text-gray-500 dark:text-zinc-400 block">{t.home.statMultiDesc}</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED TEMPLATES SHOWCASE */}
      <section className="py-16 md:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              Top Design Gallery
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight">
              {t.home.showcaseTitle}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 mt-1 max-w-xl">
              {t.home.showcaseSubtitle}
            </p>
          </div>

          <Link
            href="/builder"
            className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1.5 self-start md:self-auto"
          >
            <span>View all templates in Builder →</span>
          </Link>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              className="group bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Visual Header Mockup */}
                <div className={`p-4 ${tpl.headerBg} border-b border-gray-100 dark:border-zinc-800`}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tpl.badgeColor}`}>
                      {tpl.badge}
                    </span>
                    <div className="flex items-center gap-1">
                      {tpl.colors.map((c, i) => (
                        <span
                          key={i}
                          className="w-2.5 h-2.5 rounded-full border border-black/10 dark:border-white/10"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <h4 className="font-bold text-sm tracking-tight truncate">{tpl.name}</h4>
                  <p className="text-[11px] opacity-80 truncate">{tpl.role}</p>
                </div>

                {/* Features List */}
                <div className="p-4 space-y-2">
                  {tpl.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-zinc-400">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Action Link */}
              <div className="p-4 pt-0">
                <Link
                  href={`/builder?template=${tpl.id}`}
                  className="w-full py-2 px-3 rounded-lg bg-gray-50 dark:bg-zinc-800 group-hover:bg-blue-600 text-gray-700 dark:text-zinc-200 group-hover:text-white font-semibold text-xs text-center block transition-colors shadow-2xs"
                >
                  {t.home.useTemplate}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 CORE VALUE PILLARS */}
      <section className="py-16 md:py-20 bg-gray-50/70 dark:bg-zinc-900/50 border-y border-gray-200/80 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              Engineered for Results
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight">
              {t.home.featuresTitle}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 mt-2">
              {t.home.featuresSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl mb-4">
                📄
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-2">
                {t.home.feature1Title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                {t.home.feature1Desc}
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl mb-4">
                🎨
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-2">
                {t.home.feature2Title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                {t.home.feature2Desc}
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl mb-4">
                🔍
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-2">
                {t.home.feature3Title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                {t.home.feature3Desc}
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 p-6 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl mb-4">
                ✍️
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-2">
                {t.home.feature4Title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                {t.home.feature4Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* UPLOAD TEMPLATE SCANNER CALLOUT */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6">
        <Link
          href="/templates"
          className="group block bg-linear-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 sm:p-10 text-white shadow-xl hover:shadow-2xl transition-all"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-6">
              <span className="text-4xl sm:text-5xl">✨</span>
              <div className="max-w-2xl">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white mb-2">
                  AI Layout Vision
                </span>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  {t.home.uploadTitle}
                </h3>
                <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
                  {t.home.uploadDesc}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm whitespace-nowrap shadow-md group-hover:bg-blue-50 transition-colors">
              <span>{t.home.uploadAction}</span>
            </span>
          </div>
        </Link>
      </section>

      {/* DISCIPLINES & ACADEMIC SUPPORT */}
      <section className="py-12 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
            <h4 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
              <span>🌐</span>
              <span>Multi-Language Native</span>
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
              Create documents in English, Afaan Oromo, and Amharic with culturally respectful professional phrasing.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
            <h4 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
              <span>🎓</span>
              <span>All Academic Disciplines</span>
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
              {t.home.disciplinesDesc}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs">
            <h4 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
              <span>⚡</span>
              <span>Multi-Format Export</span>
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
              Instantly export to single-page PDF, Microsoft Word (.doc), and high-resolution Image (.png).
            </p>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA BANNER */}
      <section className="py-16 md:py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-zinc-900 dark:bg-zinc-800 text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {t.home.ctaTitle}
            </h2>
            <p className="text-sm sm:text-base text-zinc-300">
              {t.home.ctaSubtitle}
            </p>
            <div className="pt-4 flex flex-wrap justify-center gap-3">
              <Link
                href="/builder"
                className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base shadow-lg transition-all"
              >
                {t.home.ctaButton}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}