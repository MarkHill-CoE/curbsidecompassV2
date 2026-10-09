declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID ||
  import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
  'G-GTSPXG6VD9';

let isInitialized = false;

/**
 * Initializes Google Analytics 4 (GA4).
 * Uses standard Google Tag (gtag.js) with the configured GA4 Measurement ID,
 * without invoking Firebase Installations to prevent 401 authentication errors.
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined' || isInitialized) return;
  if (!GA_MEASUREMENT_ID) return;

  try {
    // 1. Initialize dataLayer and gtag queue
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: true,
      anonymize_ip: true,
      cookie_flags: 'SameSite=None;Secure'
    });

    // 2. Inject Google Tag script into <head> if not already present
    const existingScript = document.querySelector(
      `script[src*="googletagmanager.com/gtag/js?id="]`
    );
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);
    }

    isInitialized = true;
  } catch (err) {
    console.warn('[Analytics] GA4 initialization notice:', err);
  }
}

/**
 * Tracks a custom event in Google Analytics 4 via gtag.js.
 */
export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;

  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, params);
    } catch {
      // Graceful no-op
    }
  }
}

/**
 * Tracks virtual page view changes in the single-page application.
 */
export function trackPageView(pageTitle?: string, pagePath?: string): void {
  if (typeof window === 'undefined') return;

  const title = pageTitle || document.title;
  const path = pagePath || window.location.pathname;

  trackEvent('page_view', {
    page_title: title,
    page_location: window.location.href,
    page_path: path
  });
}

/**
 * Domain-specific analytics helpers for civic engagement tracking
 */
export function trackSurveyStep(stepIndex: number, questionId: string, category?: string): void {
  trackEvent('survey_step_view', {
    step_index: stepIndex,
    question_id: questionId,
    category: category || 'general'
  });
}

export function trackSurveyComplete(personaType: string, streetLayout: string): void {
  trackEvent('survey_completed', {
    persona_type: personaType,
    street_layout: streetLayout
  });
}

export function trackStreetLayoutSelected(layoutId: string, stalls: number): void {
  trackEvent('street_layout_selected', {
    layout_id: layoutId,
    curbside_stalls: stalls
  });
}

export function trackSimulationAdjusted(parameter: string, value: number | string): void {
  trackEvent('simulation_adjusted', {
    parameter,
    value
  });
}

/**
 * Unified GA4 Funnel Tracking
 * Tracks sequential steps in the civic engagement journey:
 * Step 1: "How to Use" screen viewed (how_to_use_view)
 * Step 2: "How to Use" completed / survey started (how_to_use_start)
 * Step 3: Survey questions progression (survey_step_view)
 * Step 4: Survey completed / Results screen (survey_completed)
 * Step 5: Thank You & Share screen (thank_you_view)
 * Step 6: Conversion: "Copy Full Post Text to Clipboard" (copy_full_post_text) OR "Retake Survey" (retake_survey)
 */
export function trackFunnelStep(
  stepNumber: number,
  stepName: string,
  extraParams?: Record<string, unknown>
): void {
  // Generic funnel event for GA4 Funnel Explorations with step_number and step_name
  trackEvent('civic_funnel_step', {
    funnel_name: 'how_to_use_to_conversion',
    step_number: stepNumber,
    step_name: stepName,
    ...extraParams
  });

  // Dedicated named event for direct GA4 funnel step configuration
  trackEvent(stepName, {
    funnel_step: stepNumber,
    ...extraParams
  });
}
