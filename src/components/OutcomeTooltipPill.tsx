import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

export interface OutcomeTooltipPillProps {
  icon: React.ReactNode;
  label: string;
  badgeClass?: string;
  tooltipTitle: string;
  tooltipDesc: string;
  statusBadge?: string;
  statusColor?: string;
}

export const OutcomeTooltipPill: React.FC<OutcomeTooltipPillProps> = ({
  icon,
  label,
  badgeClass = 'bg-gray-100 border-gray-200 text-gray-800',
  tooltipTitle,
  tooltipDesc,
  statusBadge,
  statusColor = 'bg-white/20 text-white'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  // Close on outside click or touch
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (pillRef.current && !pillRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div
      ref={pillRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        title={`${tooltipTitle}: ${tooltipDesc}`}
        aria-label={`${tooltipTitle}: ${label}. Tap or hover for plain-language explanation.`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-left cursor-pointer transition-all duration-150 select-none shadow-2xs hover:shadow-xs active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004B8D] ${badgeClass} ${
          isOpen ? 'ring-2 ring-[#004B8D]/30 border-[#004B8D]' : ''
        }`}
      >
        <span className="shrink-0">{icon}</span>
        <span className="font-bold">{label}</span>
        <HelpCircle className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity shrink-0 ml-0.5" />
      </button>

      {/* Floating Tooltip Card */}
      {isOpen && (
        <div
          role="tooltip"
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-64 max-w-[85vw] p-3 bg-[#002244] text-white rounded-xl shadow-xl border border-[#003566] text-left animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
        >
          {/* Top Arrow */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#002244] border-t border-l border-[#003566] rotate-45" />

          <div className="relative z-10 space-y-1">
            <div className="flex items-center justify-between gap-1.5 border-b border-white/15 pb-1">
              <span className="font-extrabold text-[#FFC72C] text-[11px] uppercase tracking-wider">
                {tooltipTitle}
              </span>
              {statusBadge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusColor}`}>
                  {statusBadge}
                </span>
              )}
            </div>
            <p className="text-[11.5px] text-gray-100 leading-snug font-normal pt-0.5">
              {tooltipDesc}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
