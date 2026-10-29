import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Video, FileText, CheckCircle2 } from 'lucide-react';
import { Chapter } from '../types';
import { getSubjectChapters, getBatchDetails } from '../services/api';

interface SubjectPageProps {
  batchId: string;
  subjectSlug: string;
  subjectTitle?: string;
  onSelectChapter: (topicId: string, chapterTitle: string) => void;
  onBack: () => void;
  onToast: (msg: string, isError?: boolean) => void;
}

export const SubjectPage: React.FC<SubjectPageProps> = ({
  batchId,
  subjectSlug,
  subjectTitle = 'Subject',
  onSelectChapter,
  onBack,
  onToast
}) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'UNITS' | 'STUDY_MATERIAL' | 'DIGITAL_BOOKS'>('UNITS');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        // Resolve subjectId from batch details if slug was passed
        let targetSubjectId = subjectSlug;
        const details = await getBatchDetails(batchId);
        if (details?.subjects) {
          const matched = details.subjects.find(
            (s) => s.slug === subjectSlug || s._id === subjectSlug || s.subjectId === subjectSlug
          );
          if (matched) {
            targetSubjectId = matched._id;
          }
        }

        const data = await getSubjectChapters(batchId, targetSubjectId);
        if (cancelled) return;
        setChapters(data);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          onToast('Failed to load chapters', true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [batchId, subjectSlug]);

  return (
    <div className="container mx-auto px-3 sm:px-6 py-6 max-w-6xl">
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Batch
      </button>

      {/* Header */}
      <div className="glass-card !rounded-2xl p-5 mb-6 border border-emerald-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
            Subject View
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            {subjectTitle}
          </h1>
        </div>
        <span className="text-xs bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full font-semibold border border-emerald-500/30">
          {chapters.length} Chapters Total
        </span>
      </div>

      {/* Tabs Menu matching original */}
      <div className="flex gap-2 border-b border-emerald-500/20 mb-6 pb-2">
        <button
          onClick={() => setActiveTab('UNITS')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'UNITS'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600'
          }`}
        >
          Chapters
        </button>
        <button
          onClick={() => setActiveTab('STUDY_MATERIAL')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'STUDY_MATERIAL'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600'
          }`}
        >
          Study Material
        </button>
        <button
          onClick={() => setActiveTab('DIGITAL_BOOKS')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'DIGITAL_BOOKS'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600'
          }`}
        >
          Digital Books
        </button>
      </div>

      {/* Chapters Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-5 rounded-xl space-y-3 animate-pulse">
              <div className="h-5 bg-muted-foreground/20 rounded-md w-3/4" />
              <div className="h-4 bg-muted-foreground/20 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : chapters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapters.map((ch) => (
            <div
              key={ch._id}
              onClick={() => onSelectChapter(ch.slug || ch._id, ch.name)}
              className="glass-card p-5 rounded-2xl hover:shadow-spring-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border border-emerald-500/15 dark:border-teal-500/20 group flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {ch.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Counts row */}
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-emerald-500" />
                  <strong className="text-gray-700 dark:text-gray-200">{ch.videos ?? ch.lectureVideos ?? 0}</strong> Lectures
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <strong className="text-gray-700 dark:text-gray-200">{ch.notes ?? 0}</strong> Notes
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <strong className="text-gray-700 dark:text-gray-200">{ch.exercises ?? 0}</strong> DPPs
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-10 text-center text-gray-500">
          No chapters found for this subject.
        </div>
      )}
    </div>
  );
};
