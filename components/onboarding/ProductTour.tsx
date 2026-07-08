'use client';

// components/onboarding/ProductTour.tsx
// ─────────────────────────────────────────────
// First-run product tour. A short, skippable, step-by-step walkthrough that
// spotlights the real sidebar sections (Employers → Shifts → Wages → Calendar →
// Clock) so a new user knows where to create their first employee, shift and
// wage. Shows once per user (localStorage); can be replayed from Settings.
//
// Zero dependencies — the spotlight is a single element with a large box-shadow
// "cutout", the copy sits in a card positioned next to the highlighted item.
// Colours/typography come from the app's own tokens, so it always matches the
// current theme (light/dark) and brand palette.
// ─────────────────────────────────────────────
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles, Building2, CalendarClock, Coins, Calendar, Clock, PartyPopper,
} from 'lucide-react';
import { dataStore } from '@/store/dataStore';
import { authStore } from '@/store/authStore';

const TOUR_VERSION = 'v1';
const storageKey = (userId?: string) => `rp_tour_${TOUR_VERSION}_${userId || 'anon'}`;
export const TOUR_RESTART_EVENT = 'rp:tour:restart';

// Fire this (e.g. from a "Replay tutorial" button) to run the tour again.
export function restartProductTour() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(TOUR_RESTART_EVENT));
}

type Placement = 'right' | 'center';
interface Step {
  target?: string;            // data-tour value of the element to spotlight
  placement: Placement;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    placement: 'center',
    icon: Sparkles,
    title: 'Welcome to RotaPay 👋',
    body: "Let's take 30 seconds to show you the essentials — creating an employee, a shift and wages. You can skip anytime.",
  },
  {
    target: '/dashboard/employers',
    placement: 'right',
    icon: Building2,
    title: '1. Add your employees',
    body: 'Start here. An employee is a workplace or person you track hours and pay for. Your first one becomes the default scope for everything.',
  },
  {
    target: '/dashboard/shifts',
    placement: 'right',
    icon: CalendarClock,
    title: '2. Create shift presets',
    body: 'Build reusable shifts (day, night, rotational) once — then drop them onto any date instead of retyping the times.',
  },
  {
    target: '/dashboard/shifts',
    placement: 'right',
    icon: Coins,
    title: '3. Set wages on a shift',
    body: 'While creating a shift, add its pay rate (hourly or fixed). RotaPay uses it to total your earnings automatically.',
  },
  {
    target: '/dashboard/calendar',
    placement: 'right',
    icon: Calendar,
    title: '4. Schedule on the calendar',
    body: 'Assign your shift presets to real dates to build your rota. Everything you plan here feeds earnings and reports.',
  },
  {
    target: '/dashboard/clock',
    placement: 'right',
    icon: Clock,
    title: '5. Clock in & out',
    body: 'Track live worked hours. Your clocked time flows straight into earnings, salary overview and reports.',
  },
  {
    placement: 'center',
    icon: PartyPopper,
    title: "You're all set! 🎉",
    body: 'Add your first employee to get going. You can replay this walkthrough anytime from Settings.',
  },
];

const GRADIENT = 'linear-gradient(135deg, #06b6d4 0%, #2563eb 55%, #1d4ed8 100%)';
const PAD = 8; // spotlight padding around the target

export function ProductTour() {
  const loaded = dataStore((s) => s.loaded);
  const employers = dataStore((s) => s.employers);
  const user = authStore((s) => s.user);

  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Auto-start once, after the cache has loaded and the onboarding gate is
  // satisfied (user already has ≥1 employee), and only if never seen before.
  useEffect(() => {
    if (!mounted || !loaded || active) return;
    if (employers.length === 0) return; // OnboardingGate is showing — wait
    try {
      if (!localStorage.getItem(storageKey(user?.id))) {
        setIndex(0);
        setActive(true);
      }
    } catch { /* localStorage unavailable — skip the tour silently */ }
  }, [mounted, loaded, employers.length, user?.id, active]);

  // Manual replay (from Settings).
  useEffect(() => {
    const onRestart = () => { setIndex(0); setActive(true); };
    window.addEventListener(TOUR_RESTART_EVENT, onRestart);
    return () => window.removeEventListener(TOUR_RESTART_EVENT, onRestart);
  }, []);

  const step = STEPS[index];

  const measure = useCallback(() => {
    if (!step?.target) { setRect(null); return; }
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step]);

  useLayoutEffect(() => {
    if (!active) return;
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [active, measure]);

  const finish = useCallback(() => {
    try { localStorage.setItem(storageKey(user?.id), Date.now().toString()); } catch { /* ignore */ }
    setActive(false);
  }, [user?.id]);

  const next = () => (index >= STEPS.length - 1 ? finish() : setIndex((i) => i + 1));
  const back = () => setIndex((i) => Math.max(0, i - 1));

  if (!mounted || !active || !step) return null;

  const isCenter = step.placement === 'center' || !rect;
  const Icon = step.icon;

  // Card position: to the right of the spotlit item, otherwise centered.
  const cardStyle: React.CSSProperties = isCenter
    ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    : {
        top: Math.min(
          Math.max(12, (rect!.top + rect!.height / 2) - 90),
          window.innerHeight - 240,
        ),
        left: Math.min(rect!.right + 20, window.innerWidth - 360),
      };

  return createPortal(
    <div
      className="fixed inset-0 z-[70]"
      role="dialog"
      aria-modal="true"
      aria-label="Product tour"
    >
      {/* Dim + spotlight cutout */}
      {isCenter ? (
        <div className="absolute inset-0" style={{ background: 'rgba(29,78,216,0.55)' }} />
      ) : (
        <div
          className="absolute rounded-xl transition-all duration-300 ease-out"
          style={{
            top: rect!.top - PAD,
            left: rect!.left - PAD,
            width: rect!.width + PAD * 2,
            height: rect!.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(29,78,216,0.55)',
            outline: '2px solid #06b6d4',
            outlineOffset: '2px',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Step card */}
      <div
        className="absolute w-[340px] max-w-[calc(100vw-24px)] bg-card text-card-foreground border border-border rounded-2xl shadow-2xl p-5 animate-fade-in"
        style={cardStyle}
      >
        <div className="flex items-center gap-3 mb-3">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-xl text-white shrink-0"
            style={{ background: GRADIENT }}
          >
            <Icon size={20} />
          </span>
          <h3 className="font-heading font-bold text-base leading-tight">{step.title}</h3>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.body}</p>

        <div className="flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === index ? 18 : 6,
                  height: 6,
                  background: i === index ? '#06b6d4' : 'var(--border)',
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {index > 0 && (
              <button
                onClick={back}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-muted-foreground hover:bg-muted/10 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={next}
              className="px-4 py-1.5 text-xs font-bold rounded-lg text-white shadow-sm transition-transform hover:-translate-y-0.5"
              style={{ background: GRADIENT }}
            >
              {index >= STEPS.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>

        {/* Skip */}
        {index < STEPS.length - 1 && (
          <button
            onClick={finish}
            className="absolute -top-9 right-0 text-xs font-semibold text-white/90 hover:text-white transition-colors"
          >
            Skip tour ✕
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
