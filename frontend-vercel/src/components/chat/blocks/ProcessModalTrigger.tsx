import { useEffect, useRef, useState } from 'react';
import {
  CalendarCheck,
  Check,
  Compass,
  HeartPulse,
  PhoneCall,
  Plane,
  Route,
  Stethoscope,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import type { TranslationKey } from '@/i18n';
import { cn } from '@/lib/utils';
import type { ProcessModalTriggerBlock } from '../../../types/chatbot-blocks';
import { createChatWidgetTranslator } from '../chat-widget-i18n';
import { BRAND_LOGO_URL } from '@/config/brandAssets';

const CONFIRM_STEPS = [
  { icon: Stethoscope, title: 'processConfirm.step1.title', price: 'processConfirm.step1.price', desc: 'processConfirm.step1.desc' },
  { icon: Plane, title: 'processConfirm.step2.title', price: 'processConfirm.step2.price', desc: 'processConfirm.step2.desc' },
  { icon: CalendarCheck, title: 'processConfirm.step3.title', price: 'processConfirm.step3.price', desc: 'processConfirm.step3.desc' },
  { icon: HeartPulse, title: 'processConfirm.step4.title', price: 'processConfirm.step4.price', desc: 'processConfirm.step4.desc' },
  { icon: Compass, title: 'processConfirm.step5.title', price: 'processConfirm.step5.price', desc: 'processConfirm.step5.desc' },
  { icon: PhoneCall, title: 'processConfirm.step6.title', price: 'processConfirm.step6.price', desc: 'processConfirm.step6.desc' },
] as const;

interface ProcessModalTriggerProps {
  block: ProcessModalTriggerBlock;
  onOpen?: () => void;
  historyResourceId?: string;
  historyResourceStatus?: string;
}

export function ProcessModalTrigger({
  block,
  onOpen,
  historyResourceId,
  historyResourceStatus,
}: ProcessModalTriggerProps) {
  const language = useLanguage();
  const { currentLanguage } = language;
  const [isOpen, setIsOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translate = createChatWidgetTranslator(currentLanguage.code);
  const translatePage = (key: TranslationKey) => (language.t ? language.t(key) : translate(key));

  useEffect(() => () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
  }, []);

  const handleClick = () => {
    setAgreed(false);
    setConfirmed(false);
    setIsOpen(true);
    onOpen?.();
  };

  const handleClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(false);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, 1600);
  };

  const ctaLabel = block.ctaLabel ?? translate('chatWidget.process.openGuide');

  return (
    <>
      <div
        data-block-type="PROCESS_MODAL_TRIGGER"
        data-history-resource-id={historyResourceId}
        data-history-resource-status={historyResourceStatus}
        className="max-w-[92%] rounded-[24px] border border-teal-100 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]"
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50">
            <Route className="h-4 w-4 text-teal-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold leading-5 text-slate-900">{block.title}</div>
            {block.description && (
              <div className="mt-0.5 text-[12px] leading-5 text-slate-500">{block.description}</div>
            )}
            <Button
              type="button"
              onClick={handleClick}
              className="mt-3 inline-flex h-9 items-center rounded-xl bg-teal-600 px-4 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={translatePage('processConfirm.title')}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={handleClose}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              handleClose();
            }
          }}
        >
          <div
            className="relative grid w-full max-w-2xl gap-0 overflow-hidden rounded-lg border-0 bg-white p-0 shadow-[0_20px_60px_-20px_rgba(46,123,168,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label={translate('chatWidget.process.close')}
              autoFocus
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#2E7BA8] focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{translate('chatWidget.process.close')}</span>
            </button>

            <div className="flex flex-col items-center gap-4 bg-white px-7 pb-5 pt-6 text-center">
              <img
                src={BRAND_LOGO_URL}
                alt={translatePage('processConfirm.logoAlt')}
                className="h-14 w-auto object-contain"
              />
              <div className="space-y-2 sm:text-center">
                <h2 className="text-2xl font-semibold text-slate-950">
                  {translatePage('processConfirm.title')}
                </h2>
                <p className="text-sm leading-relaxed text-slate-500">
                  {translatePage('processConfirm.description')}
                </p>
              </div>
            </div>

            <div className="max-h-[55vh] overflow-y-auto bg-white px-7 py-5">
              <ol className="space-y-4">
                {CONFIRM_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <li
                      key={step.title}
                      className={cn(
                        'group relative flex gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all',
                        'hover:border-[#2E7BA8]/40 hover:shadow-[0_8px_24px_-12px_rgba(46,123,168,0.18)]',
                      )}
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF4FA] text-[#2E7BA8] ring-1 ring-[#2E7BA8]/15">
                          <Icon className="h-5 w-5" />
                        </div>
                        {index < CONFIRM_STEPS.length - 1 && (
                          <div className="mt-2 h-full w-px bg-gradient-to-b from-[#2E7BA8]/30 to-transparent" />
                        )}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-3">
                          <h3 className="text-sm font-semibold text-slate-950">
                            <span className="mr-1.5 text-[#2E7BA8]">{index + 1}.</span>
                            {translatePage(step.title)}
                          </h3>
                          <span className="rounded-full bg-[#EAF4FA] px-2 py-0.5 text-xs font-medium text-[#2E7BA8]">
                            {translatePage(step.price)}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                          {translatePage(step.desc)}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-100/40 px-7 py-5 sm:flex-col sm:space-x-0">
              <label className="flex cursor-pointer select-none items-start gap-3">
                <Checkbox
                  checked={agreed}
                  onCheckedChange={(value) => setAgreed(value === true)}
                  className="mt-0.5 border-[#2E7BA8] data-[state=checked]:bg-[#2E7BA8] data-[state=checked]:text-white"
                />
                <span className="text-sm leading-snug text-slate-950">
                  {translatePage('processConfirm.agreement')}
                </span>
              </label>
              <div className="flex w-full justify-end gap-3">
                <Button type="button" variant="ghost" onClick={handleClose}>
                  {translatePage('processConfirm.cancel')}
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!agreed || confirmed}
                  size="lg"
                  className="min-w-44 bg-[#2E7BA8] text-white shadow-[0_8px_24px_-12px_rgba(46,123,168,0.18)] transition-all hover:bg-[#25698F]"
                >
                  {confirmed ? (
                    <>
                      <Check className="h-4 w-4" /> {translatePage('processConfirm.confirmed')}
                    </>
                  ) : (
                    translatePage('processConfirm.confirm')
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
