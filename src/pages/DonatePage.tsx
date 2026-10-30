import React from 'react';
import { Heart, Sparkles, Send } from 'lucide-react';
import { TELEGRAM_LINK } from '../services/api';

export const DonatePage: React.FC = () => {
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Decorative Petals */}
      <div className="petal-particle" style={{ left: '10%', animationDuration: '28s', animationDelay: '0s' }} />
      <div className="petal-particle" style={{ left: '30%', animationDuration: '32s', animationDelay: '3s' }} />
      <div className="petal-particle" style={{ left: '55%', animationDuration: '30s', animationDelay: '7s' }} />
      <div className="petal-particle" style={{ left: '75%', animationDuration: '35s', animationDelay: '2s' }} />
      <div className="petal-particle" style={{ left: '90%', animationDuration: '26s', animationDelay: '5s' }} />

      <div className="relative z-10 max-w-xl w-full glass-card p-6 sm:p-8 rounded-3xl border border-pink-500/25 shadow-glass-lg text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-400 via-rose-500 to-pink-600 flex items-center justify-center shadow-md animate-float">
          <Heart className="w-8 h-8 text-white fill-white" />
        </div>

        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-pink-600 dark:text-pink-400">
            Support Education For Everyone
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
            Donate Batch & Support
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
            GB STUDY is dedicated to making quality education 100% free and accessible for all students.
            If you have access to any course or want to contribute to server costs and help thousands of learners, reach out to us!
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-pink-500/10 dark:bg-pink-400/10 border border-pink-500/20 text-left space-y-2">
          <div className="flex items-center gap-2 text-pink-700 dark:text-pink-300 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            How You Can Help:
          </div>
          <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
            <li>Share active batches or notes to help fellow aspirants</li>
            <li>Report broken video links or missing lectures</li>
            <li>Share GB STUDY channel with friends in need</li>
          </ul>
        </div>

        <a
          href={TELEGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold text-sm shadow-btn-3d active:scale-95 transition-all cursor-pointer"
        >
          <Send className="w-4 h-4 fill-white" />
          Contact Admin on Telegram @GBFreestudy
        </a>
      </div>
    </div>
  );
};
