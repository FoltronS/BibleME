'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useUser } from '@/context/user-context';
import { msg } from '@/lib/msg';

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const t = useTranslations('settings');
  const { nickname, struggle, ttsSpeed, updateProfile, resetAll } = useUser();

  const [localNickname, setLocalNickname] = useState(nickname);
  const [localStruggle, setLocalStruggle] = useState(struggle);
  const [localSpeed, setLocalSpeed] = useState(ttsSpeed);
  function handleSave() {
    if (localStruggle.trim() !== struggle.trim()) {
      msg(`Name: ${localNickname}\nStruggle: ${localStruggle.trim() || '(cleared)'}`, 'Struggle Updated');
    }
    updateProfile({
      nickname: localNickname,
      struggle: localStruggle,
      ttsSpeed: localSpeed,
    });
    onClose();
  }

  function handleReset() {
    resetAll();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div className="absolute inset-0 bg-charcoal/30" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-ivory rounded-t-3xl md:rounded-2xl p-6 pb-8 space-y-5 animate-slide-up md:shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-[family-name:var(--font-playfair)] text-lg font-semibold">
            {t('title')}
          </h2>
          <button
            onClick={onClose}
            className="text-warm-gray hover:text-charcoal transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-warm-gray">{t('nickname')}</label>
          <input
            type="text"
            value={localNickname}
            onChange={(e) => setLocalNickname(e.target.value)}
            className="w-full bg-white/50 border border-soft-gold/40 rounded-xl px-4 py-3 text-charcoal focus:outline-none focus:ring-2 focus:ring-rose/30"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-warm-gray">{t('struggle')}</label>
          <textarea
            value={localStruggle}
            onChange={(e) => setLocalStruggle(e.target.value)}
            rows={2}
            className="w-full bg-white/50 border border-soft-gold/40 rounded-xl px-4 py-3 text-charcoal resize-none focus:outline-none focus:ring-2 focus:ring-rose/30"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-warm-gray">
            {t('ttsSpeed')}: {localSpeed.toFixed(1)}x
          </label>
          <div className="flex items-center gap-3">
            <span className="text-xs text-warm-gray">{t('ttsSpeedSlow')}</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={localSpeed}
              onChange={(e) => setLocalSpeed(parseFloat(e.target.value))}
              className="flex-1 accent-rose"
            />
            <span className="text-xs text-warm-gray">{t('ttsSpeedFast')}</span>
          </div>
        </div>


        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-rose text-white rounded-xl py-3 font-medium hover:bg-rose-dark transition-colors"
          >
            {t('save')}
          </button>
        </div>

        <button
          onClick={handleReset}
          className="w-full text-center text-sm text-warm-gray hover:text-rose-dark transition-colors py-2"
        >
          {t('reset')}
        </button>
      </div>
    </div>
  );
}
