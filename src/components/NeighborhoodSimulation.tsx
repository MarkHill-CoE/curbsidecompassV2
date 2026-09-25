import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SimulationConfig } from '../types';
import { Volume2, VolumeX, Sliders, RefreshCw, AlertTriangle, ShieldCheck, RotateCcw, CheckCircle, Home, ZapOff } from 'lucide-react';
import { feedback, triggerFeedback } from '../utils/feedback';
import { ambientAudio } from '../utils/ambientAudio';

interface NeighborhoodSimulationProps {
  config: SimulationConfig;
  onConfigChange?: (newConfig: Partial<SimulationConfig>) => void;
  activeQuestionNumber?: number;
  policyNote?: string;
  isCompleted?: boolean;
  showControls?: boolean;
  onToggleControls?: () => void;
  onToggleMagnifiedGauge?: () => void;
  onToggleSimplifiedMode?: () => void;
  curbsideDemandCount?: number;
  curbsideStallsCapacity?: number;
  curbsidePct?: number;
  circlingCarCount?: number;
  occupiedGaragesCount?: number;
  onSimulationMetricsChange?: (metrics: {
    activeHouseholdCars: number;
    activeVisitorCars: number;
    totalDwellings: number;
    totalWeeklyDeliveries: number;
    circlingCarCount: number;
    curbsideDemandCount: number;
    curbsideStallsCapacity: number;
    curbsidePct: number;
    onReshuffle: () => void;
  }) => void;
  onHarmonyActiveChange?: (isActive: boolean) => void;
}

// 1950s–1960s Mid-Century Laned Bungalow Street (12 homes, gravel rear lane with detached garages, zero front curb cuts, continuous curbside parking)
const TOTAL_MIDCENTURY_HOMES = 12;
const BASE_LEGAL_CURBSIDE_STALLS = 16;
const TOTAL_LEGAL_CURBSIDE_STALLS = 16;

// =========================================================================================
// COMPONENT OVERVIEW (Plain English Security & Oversight Summary)
// -----------------------------------------------------------------------------------------
// This module provides an interactive 2.5D isometric simulation of an Edmonton residential street.
// It visually models the real-world impact of housing density, parking bylaws, and delivery habits:
// - Shows parked cars in driveways versus along the curbside.
// - Accurately tracks curbside capacity versus parking demand with an interactive dial gauge.
// - Models realistic traffic flow, lane changing, and delivery double-parking.
// - Prevents vehicle clipping through forward object detection and longitudinal clamping.
// - Uses a unified Painter's Algorithm render queue to preserve visual perspective and depth.
// =========================================================================================

const NeighborhoodSimulationComponent: React.FC<NeighborhoodSimulationProps> = ({
  config,
  onConfigChange,
  activeQuestionNumber,
  policyNote,
  isCompleted,
  showControls: externalShowControls,
  onToggleControls,
  onToggleMagnifiedGauge,
  onToggleSimplifiedMode,
  curbsideDemandCount: propCurbsideDemandCount,
  curbsideStallsCapacity: propCurbsideStallsCapacity,
  curbsidePct: propCurbsidePct,
  circlingCarCount: propCirclingCarCount,
  occupiedGaragesCount: propOccupiedGaragesCount,
  onSimulationMetricsChange,
  onHarmonyActiveChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gaugeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const propCurbsideDemandRef = useRef(propCurbsideDemandCount);
  propCurbsideDemandRef.current = propCurbsideDemandCount;

  const propCurbsideStallsCapacityRef = useRef(propCurbsideStallsCapacity);
  propCurbsideStallsCapacityRef.current = propCurbsideStallsCapacity;

  const propCurbsidePctRef = useRef(propCurbsidePct);
  propCurbsidePctRef.current = propCurbsidePct;

  const propCirclingCarCountRef = useRef(propCirclingCarCount);
  propCirclingCarCountRef.current = propCirclingCarCount;

  const propOccupiedGaragesRef = useRef(propOccupiedGaragesCount);
  propOccupiedGaragesRef.current = propOccupiedGaragesCount;

  const [soundEnabled, setSoundEnabled] = useState<boolean>(feedback.isSoundEnabled());
  const [internalShowControls, setInternalShowControls] = useState<boolean>(false);
  const showControls = externalShowControls !== undefined ? externalShowControls : internalShowControls;
  const setShowControls = useCallback((valOrFn: boolean | ((prev: boolean) => boolean)) => {
    if (onToggleControls) {
      onToggleControls();
    } else {
      setInternalShowControls(valOrFn);
    }
  }, [onToggleControls]);
  const [curbsideDemandCount, setCurbsideDemandCount] = useState<number>(() => propCurbsideDemandCount ?? 10);
  const [curbsideStallsCapacity, setCurbsideStallsCapacity] = useState<number>(() => propCurbsideStallsCapacity ?? BASE_LEGAL_CURBSIDE_STALLS);
  const [curbsidePct, setCurbsidePct] = useState<number>(() => propCurbsidePct ?? 62);
  const [circlingCarCount, setCirclingCarCount] = useState<number>(() => propCirclingCarCount ?? 0);
  const [isPoliceTrafficActive, setIsPoliceTrafficActive] = useState<boolean>(false);
  const [laneStuckSeconds, setLaneStuckSeconds] = useState<number>(0);
  const [zoomScale, setZoomScale] = useState<number>(1.33);
  const [showGarageIndicators, setShowGarageIndicators] = useState<boolean>(true);
  const [occupiedGaragesCount, setOccupiedGaragesCount] = useState<number>(() => propOccupiedGaragesCount ?? 10);
  const showGarageIndicatorsRef = useRef<boolean>(true);
  showGarageIndicatorsRef.current = showGarageIndicators;

  useEffect(() => {
    if (propCurbsideDemandCount !== undefined) {
      setCurbsideDemandCount(propCurbsideDemandCount);
    }
  }, [propCurbsideDemandCount]);

  useEffect(() => {
    if (propCurbsideStallsCapacity !== undefined) {
      setCurbsideStallsCapacity(propCurbsideStallsCapacity);
    }
  }, [propCurbsideStallsCapacity]);

  useEffect(() => {
    if (propCurbsidePct !== undefined) {
      setCurbsidePct(propCurbsidePct);
    }
  }, [propCurbsidePct]);

  useEffect(() => {
    if (propCirclingCarCount !== undefined) {
      setCirclingCarCount(propCirclingCarCount);
    }
  }, [propCirclingCarCount]);

  useEffect(() => {
    if (propOccupiedGaragesCount !== undefined) {
      setOccupiedGaragesCount(propOccupiedGaragesCount);
    }
  }, [propOccupiedGaragesCount]);

  const triggerVisualAudioAlert = useCallback((_text: string, _icon: 'horn' | 'siren' | 'alarm' | 'medal' = 'horn') => {
    // Visual sound caption removed per user request
  }, []);

  // Escape key listener for Manual Sliders Drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showControls) {
        setShowControls(false);
        document.getElementById('manual-controls-toggle')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showControls]);

  const touchStartDistRef = useRef<number | null>(null);
  const touchStartScaleRef = useRef<number>(1.33);

  const handleCanvasClickRef = useRef<((clickX: number, clickY: number) => void) | null>(null);

  useEffect(() => {
    return feedback.subscribe((enabled) => setSoundEnabled(enabled));
  }, []);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled && !isCompleted;
  }, [soundEnabled, isCompleted]);

  // Audio context reference
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundEnabledRef = useRef<boolean>(soundEnabled && !isCompleted);
  soundEnabledRef.current = soundEnabled && !isCompleted;

  
  const configRef = useRef<SimulationConfig>(config);
  configRef.current = config;
  
  const activeQuestionRef = useRef(activeQuestionNumber);
  activeQuestionRef.current = activeQuestionNumber;
  
  const isCompletedRef = useRef(isCompleted);
  isCompletedRef.current = isCompleted;


  // =========================================================================================
  // SECTION: PROCEDURAL AUDIO SYNTHESIS & AUDITORY ACCESSIBILITY (Plain English Oversight Summary)
  // -----------------------------------------------------------------------------------------
  // Purpose: Generates realistic traffic audio (horns, sirens, alarms) purely in the browser
  // using Web Audio API oscillators and gain envelopes without external network dependencies.
  // 
  // Key Rules:
  // 1. Safe Volume Envelopes: Procedural sound effects are strictly capped at 15% volume, and ambient
  //    city street noise is capped at 5% volume.
  // 2. Browser Autoplay Compliance: Audio contexts are suspended until the user interacts with the app,
  //    complying with modern web security and privacy policies.
  // 3. User Control: Users can mute or unmute audio at any time via a dedicated 44px touch button.
  // =========================================================================================

  // Initialize or resume audio context
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  const playHonk = useCallback((type: string) => {
    const vehicleNames: Record<string, string> = {
      boxTruck: 'Delivery Truck Horn',
      pickup: 'Pickup Truck Horn',
      police: 'Police Siren',
      firetruck: 'Fire Engine Siren',
      suv: 'SUV Horn',
      sedan: 'Car Horn'
    };
    triggerVisualAudioAlert(vehicleNames[type] || 'Vehicle Horn', type === 'police' || type === 'firetruck' ? 'siren' : 'horn');

    if (!soundEnabledRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      let f1 = 410;
      let f2 = 510;
      let duration = 0.35;
      let wave: OscillatorType = 'sawtooth';
      const volume = 0.15; // 15% procedural sound volume as requested

      if (type === 'boxTruck') {
        f1 = 130 + Math.random() * 15;
        f2 = 165 + Math.random() * 15;
        duration = 0.55;
        wave = 'square';
      } else if (type === 'pickup') {
        f1 = 280 + Math.random() * 20;
        f2 = 350 + Math.random() * 20;
        duration = 0.4;
      } else if (type === 'police') {
        f1 = 650 + Math.random() * 30;
        f2 = 780 + Math.random() * 30;
        duration = 0.35;
        wave = 'sawtooth';
      } else if (type === 'firetruck') {
        f1 = 160 + Math.random() * 20;
        f2 = 210 + Math.random() * 20;
        duration = 0.55;
        wave = 'square';
      } else if (type === 'suv') {
        f1 = 370 + Math.random() * 25;
        f2 = 450 + Math.random() * 25;
        duration = 0.38;
      }

      osc1.type = wave;
      osc2.type = wave;
      osc1.frequency.setValueAtTime(f1, now);
      osc2.frequency.setValueAtTime(f2, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch {
      // Audio safety fallback
    }
  }, [getAudioContext]);

  const playCriticalAlarm = useCallback(() => {
    triggerVisualAudioAlert('Severe Curbside Congestion Alarm', 'alarm');

    if (!soundEnabledRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.02); // 15% procedural alarm volume
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio safety fallback
    }
  }, [getAudioContext]);

  const playPoliceSirenSound = useCallback((mode: 'wail' | 'chirp' | 'yelp' = 'wail') => {
    triggerVisualAudioAlert('Police Siren', 'siren');

    if (!soundEnabledRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      if (mode === 'chirp') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (mode === 'yelp') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.linearRampToValueAtTime(1250, now + 0.14);
        osc.frequency.linearRampToValueAtTime(750, now + 0.28);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.16, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(1150, now + 0.28);
        osc.frequency.exponentialRampToValueAtTime(620, now + 0.58);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(625, now);
        osc2.frequency.exponentialRampToValueAtTime(1155, now + 0.28);
        osc2.frequency.exponentialRampToValueAtTime(625, now + 0.58);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.16, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.6);
        osc2.stop(now + 0.6);
      }
    } catch {
      // Audio safety fallback
    }
  }, [getAudioContext, triggerVisualAudioAlert]);

  const playPoliceSirenSoundRef = useRef(playPoliceSirenSound);
  playPoliceSirenSoundRef.current = playPoliceSirenSound;

  // Reshuffle signal
  const reshuffleTriggerRef = useRef<number>(0);
  const handleReshuffle = () => {
    reshuffleTriggerRef.current += 1;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    getAudioContext();
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDistRef.current = dist;
      touchStartScaleRef.current = zoomScale;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDistRef.current !== null) {
      // Prevent default to stop page scroll
      if (e.cancelable) e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = touchStartScaleRef.current * (dist / touchStartDistRef.current);
      setZoomScale(Math.min(Math.max(0.5, newScale), 4));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      touchStartDistRef.current = null;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Stop page scrolling or browser zoom
    setZoomScale(s => Math.min(Math.max(0.5, s - e.deltaY * 0.005), 4));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gaugeCanvas = gaugeCanvasRef.current;
    const gaugeCtx = gaugeCanvas ? gaugeCanvas.getContext('2d') : null;

    let animFrameId: number;
    let alarmCooldown = 0;
    const flowerBeds: Array<{x: number, y: number, color: string, z: number, id: number, sizeScale: number}> = [];
    const residents: Array<{
      x: number;
      y: number;
      state: 'inside' | 'walking_to_lawn' | 'chatting';
      targetX: number;
      targetY: number;
      color: string;
      homeX: number;
      timer: number;
      groupId: number;
      talkBubbleTimer: number;
    }> = [];
    const flowerColors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#f368e0', '#ff9f43', '#0abde3', '#e17055', '#fdcb6e'];
    const compColors = ['#FF8C00', '#8A2BE2', '#FF1493', '#00FFFF', '#FFD700', '#ADFF2F']; // Complementary colors to the 6 house colors
    const allFlowerColors = [...flowerColors, ...compColors];
    const shirtColors = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e67e22', '#1abc9c', '#e84393', '#00cec9', '#6c5ce7'];
    const _lotWidth = 55;
    let flowerIdCounter = 0;

    // =========================================================================================
    // SECTION: INFILL HOUSING LOT SPLITS & COMMUNITY RESIDENTS (Plain English Oversight Summary)
    // -----------------------------------------------------------------------------------------
    // Purpose: Models Edmonton's residential infill zoning policies where mature lots can be split
    // into skinny homes (doubling housing units on the lot).
    // 
    // Key Rules:
    // 1. Lot Split Math: A single 50-foot residential lot can split into 2 narrower infill lots.
    // 2. Curb Continuous Gains: Replacing a wide front driveway apron with street-accessible frontage
    //    can add continuous curbside parking space (+1 legal curbside stall per split).
    // 3. Dynamic Resident Hubs: Generates resident pedestrians, front lawn walkways, and flower beds
    //    adapted specifically to either single-family houses or infill skinny duplex configurations.
    // =========================================================================================

    // Helper to determine if a lot index (0 to 5) is converted into split infill skinny homes
    // Split infill lots count is 2 to 12 (increasing by 2 per physical lot split).
    const getSplitInfillCount = () => {
      const raw = configRef.current.splitInfillLots;
      const count = typeof raw === 'number' ? raw : 2;
      return Math.min(12, Math.max(2, Math.round(count / 2) * 2));
    };

    const isLotSplit = (lotIndex: number, splitCount = getSplitInfillCount()) => {
      const numPhysicalLotsSplit = Math.floor(splitCount / 2);
      // Allocate from right to left: e.g. 2 splits -> lot 5; 4 -> lots 5, 4; 6 -> lots 5, 4, 3; etc.
      return lotIndex >= 6 - numPhysicalLotsSplit;
    };

    // Dynamic lawn gathering hubs matching 12 mid-century bungalow front verandas and yards
    let lawnGatheringHubs: Array<{ centerX: number; centerY: number }> = [];

    let residentIdCounter = 0;
    const rebuildResidentsAndFlowers = () => {
      flowerBeds.length = 0;
      residents.length = 0;
      lawnGatheringHubs = [];
      const midCenturyLotWidth = 30.5;

      for (let h = 0; h < TOTAL_MIDCENTURY_HOMES; h++) {
        const startX = 8 + h * midCenturyLotWidth;
        const hubIdx = lawnGatheringHubs.length;
        lawnGatheringHubs.push({ centerX: startX + 11, centerY: 58 });

        // Friendly bungalow residents chatting on front lawn & veranda
        for (let r = 0; r < 2; r++) {
          const homeDoorX = startX + 13;
          residents.push({
            x: homeDoorX,
            y: 44,
            state: 'inside',
            targetX: homeDoorX,
            targetY: 44,
            color: shirtColors[residentIdCounter % shirtColors.length],
            homeX: homeDoorX,
            timer: 0.1 + Math.random() * 1.5,
            groupId: hubIdx,
            talkBubbleTimer: Math.random() * 4
          });
          residentIdCounter++;
        }

        // Foundation flower beds along front veranda
        for (let j = 0; j < 8; j++) {
          const fx = startX + 3 + Math.random() * 14;
          const bedColor = allFlowerColors[Math.floor(Math.random() * allFlowerColors.length)];
          const scale = 0.40 + Math.random() * 0.60;
          flowerBeds.push({ x: fx, y: 52 + Math.random() * 2.5, z: Math.random() * 1.5, color: bedColor, sizeScale: scale, id: flowerIdCounter++ });
        }
      }
    };
    rebuildResidentsAndFlowers();
    
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      life: number;
      color: string;
    }> = [];

    // Authentic Edmonton Mid-Century Architectural Palette for 12 Bungalows
    const edmontonPalette = [
      { name: 'Parkland Green', hex: '#009A44' },
      { name: 'Marigold Stucco', hex: '#FFC72C' },
      { name: 'Cedar & Brick', hex: '#E8552D' },
      { name: 'Mid-Century Sky Blue', hex: '#0081BC' },
      { name: 'Deep River Navy', hex: '#005087' },
      { name: 'Desert Sand Stucco', hex: '#D4A373' },
      { name: 'Sage Green Cottage', hex: '#5B8C5A' },
      { name: 'Golden Honey Stucco', hex: '#E5A93C' },
      { name: 'Terracotta Brick', hex: '#C05621' },
      { name: 'Coastal Mist Teal', hex: '#4A90A4' },
      { name: 'Royal Plum Gable', hex: '#68217A' },
      { name: 'Warm Biscuit Cream', hex: '#C8B69B' }
    ];

    const carTypes = ['sedan', 'suv', 'pickup', 'boxTruck', 'deliveryVan', 'etsBus', 'police', 'firetruck'];
    const colorCache = new Map<string, string>();

    function adjustColor(hex: string, percent: number): string {
      const key = `${hex}_${percent}`;
      if (colorCache.has(key)) return colorCache.get(key)!;
      const num = parseInt(hex.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = Math.min(255, Math.max(0, (num >> 16) + amt));
      const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
      const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));
      const res = '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
      colorCache.set(key, res);
      return res;
    }

    // =========================================================================================
    // SECTION: 2.5D ISOMETRIC COORDINATE PROJECTION ENGINE (Plain English Oversight Summary)
    // -----------------------------------------------------------------------------------------
    // Purpose: Transforms 3-dimensional physical coordinates (Length X, Depth Y, Height Z) into
    // 2-dimensional screen pixels (X, Y) using true 30-degree isometric geometry.
    // 
    // Key Rules:
    // 1. Math Constants: ISO_X uses cos(30°) ≈ 0.866 and ISO_Y uses sin(30°) = 0.5.
    // 2. Linear Transformation: project(x, y, z) converts any road, car, or house coordinate
    //    into the exact canvas pixel location.
    // 3. Color Shading: adjustColor dynamically brightens or darkens building and car sides
    //    to simulate natural sunlight hitting the left and right building surfaces.
    // =========================================================================================

    const offsetX = 380;
    const offsetY = 160;
    const scale = 2.2;
    const blockLength = 380;

    const ISO_X = scale * 0.8660254038;
    const ISO_Y = scale * 0.5;
    const ISO_Z = scale;

    function project(x: number, y: number, z: number) {
      return {
        x: (x - y) * ISO_X + offsetX,
        y: (x + y) * ISO_Y - z * ISO_Z + offsetY
      };
    }

    function drawFlatRect(x: number, y: number, w: number, d: number, color: string, targetCtx: CanvasRenderingContext2D = ctx!) {
      const p1_x = (x - y) * ISO_X + offsetX;
      const p1_y = (x + y) * ISO_Y + offsetY;
      const p2_x = (x + w - y) * ISO_X + offsetX;
      const p2_y = (x + w + y) * ISO_Y + offsetY;
      const p3_x = (x + w - (y + d)) * ISO_X + offsetX;
      const p3_y = (x + w + y + d) * ISO_Y + offsetY;
      const p4_x = (x - (y + d)) * ISO_X + offsetX;
      const p4_y = (x + y + d) * ISO_Y + offsetY;

      targetCtx.fillStyle = color;
      targetCtx.beginPath();
      targetCtx.moveTo(p1_x, p1_y);
      targetCtx.lineTo(p2_x, p2_y);
      targetCtx.lineTo(p3_x, p3_y);
      targetCtx.lineTo(p4_x, p4_y);
      targetCtx.closePath();
      targetCtx.fill();
    }

    function drawBlock(
      x: number,
      y: number,
      z: number,
      w: number,
      d: number,
      h: number,
      topColor: string,
      leftColor: string,
      rightColor: string,
      targetCtx: CanvasRenderingContext2D = ctx!
    ) {
      const z_off = z * ISO_Z;
      const zh_off = (z + h) * ISO_Z;

      const p2_x = (x + w - y) * ISO_X + offsetX;
      const p2_y = (x + w + y) * ISO_Y - z_off + offsetY;
      const p2_top_y = (x + w + y) * ISO_Y - zh_off + offsetY;

      const p3_x = (x + w - (y + d)) * ISO_X + offsetX;
      const p3_y = (x + w + y + d) * ISO_Y - z_off + offsetY;
      const p3_top_y = (x + w + y + d) * ISO_Y - zh_off + offsetY;

      const p4_x = (x - (y + d)) * ISO_X + offsetX;
      const p4_y = (x + y + d) * ISO_Y - z_off + offsetY;
      const p4_top_y = (x + y + d) * ISO_Y - zh_off + offsetY;

      const p1_top_x = (x - y) * ISO_X + offsetX;
      const p1_top_y = (x + y) * ISO_Y - zh_off + offsetY;

      targetCtx.strokeStyle = 'rgba(0,0,0,0.15)';
      targetCtx.lineWidth = 0.8;

      // Right Face
      targetCtx.fillStyle = rightColor;
      targetCtx.beginPath();
      targetCtx.moveTo(p3_x, p3_y);
      targetCtx.lineTo(p2_x, p2_y);
      targetCtx.lineTo(p2_x, p2_top_y);
      targetCtx.lineTo(p3_x, p3_top_y);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.stroke();

      // Left Face
      targetCtx.fillStyle = leftColor;
      targetCtx.beginPath();
      targetCtx.moveTo(p3_x, p3_y);
      targetCtx.lineTo(p4_x, p4_y);
      targetCtx.lineTo(p4_x, p4_top_y);
      targetCtx.lineTo(p3_x, p3_top_y);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.stroke();

      // Top Face
      targetCtx.fillStyle = topColor;
      targetCtx.beginPath();
      targetCtx.moveTo(p1_top_x, p1_top_y);
      targetCtx.lineTo(p2_x, p2_top_y);
      targetCtx.lineTo(p3_x, p3_top_y);
      targetCtx.lineTo(p4_x, p4_top_y);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.stroke();
    }

    function drawPitchedRoof(
      x: number,
      y: number,
      z: number,
      w: number,
      d: number,
      h: number,
      roofColor: string,
      gableColor: string,
      targetCtx: CanvasRenderingContext2D = ctx!
    ) {
      const z_off = z * ISO_Z;
      const zh_off = (z + h) * ISO_Z;
      const midY = y + d * 0.5;

      const p2_top_x = (x + w - y) * ISO_X + offsetX;
      const p2_top_y = (x + w + y) * ISO_Y - z_off + offsetY;

      const p3_top_x = (x + w - (y + d)) * ISO_X + offsetX;
      const p3_top_y = (x + w + y + d) * ISO_Y - z_off + offsetY;

      const p4_top_x = (x - (y + d)) * ISO_X + offsetX;
      const p4_top_y = (x + y + d) * ISO_Y - z_off + offsetY;

      const r1_x = (x - midY) * ISO_X + offsetX;
      const r1_y = (x + midY) * ISO_Y - zh_off + offsetY;

      const r2_x = (x + w - midY) * ISO_X + offsetX;
      const r2_y = (x + w + midY) * ISO_Y - zh_off + offsetY;

      targetCtx.strokeStyle = 'rgba(0,0,0,0.2)';
      targetCtx.lineWidth = 0.8;

      targetCtx.fillStyle = gableColor;
      targetCtx.beginPath();
      targetCtx.moveTo(p3_top_x, p3_top_y);
      targetCtx.lineTo(p2_top_x, p2_top_y);
      targetCtx.lineTo(r2_x, r2_y);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.stroke();

      targetCtx.fillStyle = roofColor;
      targetCtx.beginPath();
      targetCtx.moveTo(p4_top_x, p4_top_y);
      targetCtx.lineTo(p3_top_x, p3_top_y);
      targetCtx.lineTo(r2_x, r2_y);
      targetCtx.lineTo(r1_x, r1_y);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.stroke();
    }

    // Offscreen layers
    const bgGroundCanvas = document.createElement('canvas');
    bgGroundCanvas.width = canvas.width;
    bgGroundCanvas.height = canvas.height;
    const bgGroundCtx = bgGroundCanvas.getContext('2d')!;

    const bgHousesCanvas = document.createElement('canvas');
    bgHousesCanvas.width = canvas.width;
    bgHousesCanvas.height = canvas.height;
    const bgHousesCtx = bgHousesCanvas.getContext('2d')!;

    const bgTreesCanvas = document.createElement('canvas');
    bgTreesCanvas.width = canvas.width;
    bgTreesCanvas.height = canvas.height;
    const bgTreesCtx = bgTreesCanvas.getContext('2d')!;

    function renderGroundBackground() {
      bgGroundCtx.clearRect(0, 0, bgGroundCanvas.width, bgGroundCanvas.height);

      // 1. Rear Gravel Back Alley / Lane (running full block length behind properties)
      drawFlatRect(-15, -24, blockLength + 30, 18, '#B2AA9D', bgGroundCtx);
      drawFlatRect(-15, -24, blockLength + 30, 0.8, '#9A9184', bgGroundCtx);
      drawFlatRect(-15, -6.8, blockLength + 30, 0.8, '#9A9184', bgGroundCtx);

      // Dual vehicle tire ruts along gravel alley
      drawFlatRect(-15, -19, blockLength + 30, 2.5, '#999083', bgGroundCtx);
      drawFlatRect(-15, -12, blockLength + 30, 2.5, '#999083', bgGroundCtx);

      // 2. Backyard lawns (between bungalows and gravel alley)
      drawFlatRect(-15, -6, blockLength + 30, 20, '#7DB86B', bgGroundCtx);

      // 3. Front manicured open lawns (from bungalow facade y = 14 to sidewalk y = 70)
      drawFlatRect(-15, 14, blockLength + 30, 56, '#86c274', bgGroundCtx);

      // 4. Lush green grass boulevard (between sidewalk y = 78 and curb y = 93)
      drawFlatRect(-15, 78, blockLength + 30, 15, '#7bb369', bgGroundCtx);

      // 5. Rear parking pads & front walkways for all 12 mid-century homes
      // ZERO FRONT DRIVEWAYS OR FRONT CURB CUTS
      const lotWidth = 30.5;
      for (let h = 0; h < TOTAL_MIDCENTURY_HOMES; h++) {
        const startX = 8 + h * lotWidth;

        // Rear concrete apron connecting detached garage to gravel alley (y = -6 to 0)
        drawFlatRect(startX + 17.5, -6, 11.5, 6, '#9CA0A4', bgGroundCtx);
        drawFlatRect(startX + 17.5, -3, 11.5, 0.4, '#7E8387', bgGroundCtx);

        // Concrete pad apron in front of garage facing side yard (y = 16 to 22)
        drawFlatRect(startX + 17.5, 16, 11.5, 6, '#9CA0A4', bgGroundCtx);

        // Rear gravel parking pad beside garage (y = -6 to 6) for second off-street car
        drawFlatRect(startX + 4.5, -6, 9.5, 8, '#B2AA9D', bgGroundCtx);

        // Neat concrete front pedestrian walkway from veranda steps (y = 50) to municipal sidewalk (y = 70)
        drawFlatRect(startX + 7.8, 50, 3.0, 20, '#D0D4D8', bgGroundCtx);
        drawFlatRect(startX + 7.8, 56, 3.0, 0.3, '#B5BAC0', bgGroundCtx);
        drawFlatRect(startX + 7.8, 63, 3.0, 0.3, '#B5BAC0', bgGroundCtx);
      }

      // 6. Continuous Municipal Sidewalk with scored joint lines (y = 70 to 78)
      drawFlatRect(0, 70, blockLength, 8, '#b5bac0', bgGroundCtx);
      drawFlatRect(0, 69.6, blockLength, 0.5, '#8a8f94', bgGroundCtx);
      drawFlatRect(0, 77.9, blockLength, 0.5, '#8a8f94', bgGroundCtx);
      for (let s = 0; s < blockLength; s += 8) {
        drawFlatRect(s, 70, 0.5, 8, '#9a9fa3', bgGroundCtx);
      }

      // 7. Unbroken Continuous Street Curb (NO FRONT DRIVEWAYS, ZERO CURB CUTS!)
      drawFlatRect(0, 92.4, blockLength, 1.2, '#B5BAC0', bgGroundCtx);
      drawFlatRect(0, 93.3, blockLength, 0.4, '#8E9398', bgGroundCtx);

      // 8. Fire Hydrant 5m No-Parking Zone Road Markings (Hydrant at x = 27)
      // Zone spans from x = 10.5 to x = 43.5 along the curb and street (y = 92.5 to 97.5)
      // Safety Yellow Painted Curb
      drawFlatRect(10.5, 92.5, 33, 1.2, '#FBBF24', bgGroundCtx);
      // Yellow Pavement Chevron / Cross-Hatching on Asphalt
      drawFlatRect(10.5, 93.7, 33, 0.6, '#FBBF24', bgGroundCtx);
      for (let hx = 12; hx <= 42; hx += 3.5) {
        drawFlatRect(hx, 94.3, 0.9, 3.2, 'rgba(251, 191, 36, 0.75)', bgGroundCtx);
      }
      // 5m Distance Limit Boundary Lines
      drawFlatRect(10.2, 91.5, 0.8, 6.0, '#FFFFFF', bgGroundCtx);
      drawFlatRect(43.2, 91.5, 0.8, 6.0, '#FFFFFF', bgGroundCtx);
      // Stenciled "NO PARKING 5m" road stencil text
      const roadLabelPos = project(27, 96, 0);
      bgGroundCtx.save();
      bgGroundCtx.fillStyle = '#FBBF24';
      bgGroundCtx.font = 'bold 8px "Open Sans", sans-serif';
      bgGroundCtx.textAlign = 'center';
      bgGroundCtx.fillText('NO PARKING 5m', roadLabelPos.x, roadLabelPos.y);
      bgGroundCtx.restore();

      // 9. Asphalt roadway
      drawFlatRect(0, 93, blockLength, 45, '#505357', bgGroundCtx);

      // Center dashed road markings
      for (let i = 10; i < blockLength; i += 25) {
        drawFlatRect(i, 116, 12, 2, '#e0e0e0', bgGroundCtx);
      }
    }

    function drawFireHydrant(x: number, y: number, z: number, targetCtx: CanvasRenderingContext2D = bgHousesCtx) {
      // Ground shadow on grass boulevard
      const shadowPos = project(x, y, 0);
      targetCtx.save();
      targetCtx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      targetCtx.beginPath();
      targetCtx.ellipse(shadowPos.x, shadowPos.y, 7, 4, 0, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.restore();

      // Flanged base ring (bolted dark cast iron on grass)
      drawBlock(x - 0.9, y - 0.9, z, 1.8, 1.8, 0.7, '#374151', '#1F2937', '#111827', targetCtx);

      // Lower hydrant barrel
      drawBlock(x - 0.7, y - 0.7, z + 0.7, 1.4, 1.4, 1.1, '#991B1B', '#7F1D1D', '#581C17', targetCtx);

      // Main hydrant body barrel (City of Edmonton fire-engine red)
      drawBlock(x - 0.6, y - 0.6, z + 1.8, 1.2, 1.2, 2.2, '#DC2626', '#B91C1C', '#991B1B', targetCtx);

      // White reflective safety collar around upper barrel
      drawBlock(x - 0.65, y - 0.65, z + 3.7, 1.3, 1.3, 0.35, '#FFFFFF', '#E5E7EB', '#D1D5DB', targetCtx);

      // Steamer pumper nozzle port (facing street +y)
      drawBlock(x - 0.4, y + 0.6, z + 2.3, 0.8, 0.5, 0.9, '#E5E7EB', '#D1D5DB', '#9CA3AF', targetCtx);

      // Side 2.5" hose outlet nozzle caps (left -x and right +x)
      drawBlock(x - 1.1, y - 0.3, z + 2.5, 0.5, 0.6, 0.7, '#D1D5DB', '#9CA3AF', '#6B7280', targetCtx);
      drawBlock(x + 0.6, y - 0.3, z + 2.5, 0.5, 0.6, 0.7, '#D1D5DB', '#9CA3AF', '#6B7280', targetCtx);

      // Hydrant bonnet (City of Edmonton high-flow safety yellow dome/cap)
      drawBlock(x - 0.75, y - 0.75, z + 4.0, 1.5, 1.5, 0.8, '#FBBF24', '#D97706', '#B45309', targetCtx);

      // Pentagonal top operating nut (for hydrant wrench)
      drawBlock(x - 0.25, y - 0.25, z + 4.8, 0.5, 0.5, 0.7, '#F59E0B', '#B45309', '#78350F', targetCtx);
    }

    function drawHydrantSign(x: number, y: number, z: number, targetCtx: CanvasRenderingContext2D = bgHousesCtx) {
      // Thin steel sign post
      drawBlock(x, y, z, 0.4, 0.4, 6.0, '#9CA3AF', '#6B7280', '#4B5563', targetCtx);
      // Rectangular sign plate facing street
      drawBlock(x - 0.6, y + 0.2, z + 4.2, 1.6, 0.2, 2.0, '#FFFFFF', '#E5E7EB', '#D1D5DB', targetCtx);
      // Red prohibition circle on sign
      const signPos = project(x + 0.2, y + 0.4, z + 5.2);
      targetCtx.save();
      targetCtx.strokeStyle = '#DC2626';
      targetCtx.lineWidth = 1.2;
      targetCtx.beginPath();
      targetCtx.arc(signPos.x, signPos.y, 3.5, 0, Math.PI * 2);
      targetCtx.stroke();
      targetCtx.fillStyle = '#DC2626';
      targetCtx.font = 'bold 5px sans-serif';
      targetCtx.textAlign = 'center';
      targetCtx.fillText('5m', signPos.x, signPos.y + 2);
      targetCtx.restore();
    }

    function renderHousesBackground() {
      bgHousesCtx.clearRect(0, 0, bgHousesCanvas.width, bgHousesCanvas.height);
      bgTreesCtx.clearRect(0, 0, bgTreesCanvas.width, bgTreesCanvas.height);
      const lotWidth = 30.5;

      for (let h = 0; h < TOTAL_MIDCENTURY_HOMES; h++) {
        const startX = 8 + h * lotWidth;
        const brand = edmontonPalette[h % edmontonPalette.length];
        const topC = brand.hex;
        const leftC = adjustColor(brand.hex, -15);
        const rightC = adjustColor(brand.hex, -30);
        const roofC = adjustColor(brand.hex, -45);

        // 1. Backyard cedar privacy fence along property lines (between lots)
        drawBlock(startX + lotWidth - 0.5, -6, 0, 0.6, 26, 4.0, '#8C6D52', '#72563F', '#57412E', bgHousesCtx);
        // Back alley rear boundary fence behind bungalow and pad
        drawBlock(startX, -6, 0, 17.0, 0.6, 4.0, '#8C6D52', '#72563F', '#57412E', bgHousesCtx);

        // 2. Rear Detached Garage in backyard backing onto gravel alley
        // Authentic 1950s-1960s detached single-car garage with authentic proportions,
        // horizontal lap siding, white corner boards, and an unmistakable overhead sectional garage door.
        const garageX = startX + 17.5;
        const garageY = 0;
        const garageW = 11.0;
        const garageD = 14.5;
        const garageWallH = 7.2;
        const garageRoofH = 3.4;

        const garageTop = adjustColor(brand.hex, -8);
        const garageLeft = adjustColor(brand.hex, -20);
        const garageRight = adjustColor(brand.hex, -32);

        // Concrete foundation slab footing extending 0.4 units beyond walls
        drawBlock(garageX - 0.4, garageY - 0.4, 0, garageW + 0.8, garageD + 0.8, 0.5, '#A8ADB2', '#8E9398', '#757A7F', bgHousesCtx);

        // Main garage wall structure
        drawBlock(garageX, garageY, 0.5, garageW, garageD, garageWallH, garageTop, garageLeft, garageRight, bgHousesCtx);

        // Horizontal lap siding shadow lines on visible front face (facing yard/camera at y = garageY + garageD)
        const sidingC1 = adjustColor(brand.hex, -26);
        const sidingC2 = adjustColor(brand.hex, -28);
        const sidingC3 = adjustColor(brand.hex, -34);
        for (const sz of [2.0, 3.4, 4.8, 6.2]) {
          drawBlock(garageX + 0.2, garageY + garageD, sz, garageW - 0.4, 0.1, 0.2, sidingC1, sidingC2, sidingC3, bgHousesCtx);
        }

        // White exterior corner boards
        drawBlock(garageX - 0.1, garageY + garageD - 0.3, 0.5, 0.5, 0.35, garageWallH, '#FFFFFF', '#E2E8F0', '#CBD5E1', bgHousesCtx);
        drawBlock(garageX + garageW - 0.4, garageY + garageD - 0.3, 0.5, 0.5, 0.35, garageWallH, '#FFFFFF', '#E2E8F0', '#CBD5E1', bgHousesCtx);

        // Top frieze / fascia trim board below roofline
        drawBlock(garageX, garageY + garageD - 0.3, 0.5 + garageWallH - 0.4, garageW, 0.35, 0.4, '#FFFFFF', '#E2E8F0', '#CBD5E1', bgHousesCtx);

        // Overhead Sectional Vehicle Garage Door (facing yard / camera at y = garageY + garageD)
        const doorX = garageX + 1.2;
        const doorW = 8.6;
        const doorH = 5.6;
        const doorZ = 0.5;

        // White outer door frame casing
        drawBlock(doorX, garageY + garageD + 0.05, doorZ, doorW, 0.25, doorH, '#FFFFFF', '#E2E8F0', '#CBD5E1', bgHousesCtx);
        // Recessed door face
        drawBlock(doorX + 0.3, garageY + garageD + 0.1, doorZ + 0.15, doorW - 0.6, 0.2, doorH - 0.25, '#F8FAFC', '#E2E8F0', '#CBD5E1', bgHousesCtx);

        // Sectional horizontal joint grooves (dividing the door into 4 horizontal roll-up panels)
        drawBlock(doorX + 0.3, garageY + garageD + 0.15, doorZ + 1.4, doorW - 0.6, 0.1, 0.12, '#94A3B8', '#64748B', '#475569', bgHousesCtx);
        drawBlock(doorX + 0.3, garageY + garageD + 0.15, doorZ + 2.7, doorW - 0.6, 0.1, 0.12, '#94A3B8', '#64748B', '#475569', bgHousesCtx);
        drawBlock(doorX + 0.3, garageY + garageD + 0.15, doorZ + 4.0, doorW - 0.6, 0.1, 0.12, '#94A3B8', '#64748B', '#475569', bgHousesCtx);

        // Embossed raised panels on the 3 lower tiers
        for (let p = 0; p < 4; p++) {
          const px = doorX + 0.55 + p * 1.95;
          drawBlock(px, garageY + garageD + 0.16, doorZ + 0.3, 1.5, 0.08, 0.8, '#E2E8F0', '#CBD5E1', '#94A3B8', bgHousesCtx);
          drawBlock(px, garageY + garageD + 0.16, doorZ + 1.6, 1.5, 0.08, 0.8, '#E2E8F0', '#CBD5E1', '#94A3B8', bgHousesCtx);
          drawBlock(px, garageY + garageD + 0.16, doorZ + 2.9, 1.5, 0.08, 0.8, '#E2E8F0', '#CBD5E1', '#94A3B8', bgHousesCtx);
        }

        // Lift handle at center of bottom panel
        drawBlock(doorX + doorW * 0.5 - 0.5, garageY + garageD + 0.2, doorZ + 0.5, 1.0, 0.12, 0.2, '#1F2937', '#111827', '#0F172A', bgHousesCtx);

        // Side pedestrian service door on the right wall (x = garageX + garageW, facing right)
        drawBlock(garageX + garageW + 0.05, 8.0, 0.5, 0.2, 3.2, 5.8, '#FFFFFF', '#E2E8F0', '#CBD5E1', bgHousesCtx);
        drawBlock(garageX + garageW + 0.1, 8.25, 0.7, 0.15, 2.7, 5.4, '#F1F5F9', '#E2E8F0', '#CBD5E1', bgHousesCtx);
        drawBlock(garageX + garageW + 0.15, 8.55, 3.2, 0.12, 0.2, 0.2, '#F59E0B', '#D97706', '#B45309', bgHousesCtx);

        // Side window on right wall
        drawBlock(garageX + garageW + 0.05, 2.5, 3.4, 0.2, 3.2, 2.4, '#EEF5F9', '#A2C8E0', '#6BA1C4', bgHousesCtx);
        drawBlock(garageX + garageW + 0.1, 4.0, 3.4, 0.15, 0.2, 2.4, '#FFFFFF', '#E2E8F0', '#CBD5E1', bgHousesCtx);

        // Exterior gooseneck coach lantern fixture mounted above the overhead garage door
        drawBlock(garageX + 0.6, garageY + garageD + 0.1, 0.5 + doorH + 0.2, 0.35, 0.25, 0.7, '#1F2937', '#111827', '#0F172A', bgHousesCtx);
        drawBlock(garageX + 0.5, garageY + garageD + 0.18, 0.5 + doorH - 0.2, 0.55, 0.35, 0.55, '#374151', '#1F2937', '#111827', bgHousesCtx);

        // Gabled roof with authentic asphalt shingles
        const roofX = garageX - 0.5;
        const roofY = garageY - 0.5;
        const roofW = garageW + 1.0;
        const roofD = garageD + 1.0;
        drawPitchedRoof(roofX, roofY, 0.5 + garageWallH, roofW, roofD, garageRoofH, roofC, garageRight, bgHousesCtx);
        // Eave drip edge trim
        drawBlock(roofX, roofY + roofD, 0.5 + garageWallH, roofW, 0.25, 0.3, '#FFFFFF', '#E2E8F0', '#CBD5E1', bgHousesCtx);

        // 3. 1.5-Storey Mid-Century Bungalow on left side of lot (x = startX + 1.5 to 16.5, y = 22 to 43)
        drawBlock(startX + 1.5, 22, 0, 15.0, 21.0, 13.0, topC, leftC, rightC, bgHousesCtx);
        drawPitchedRoof(startX + 1.0, 20.5, 13.0, 16.0, 24.0, 6.5, roofC, rightC, bgHousesCtx);

        // Authentic red brick masonry chimney on roofline
        drawBlock(startX + 2.5, 27, 13.0, 2.2, 2.2, 8.5, '#B91C1C', '#991B1B', '#7F1D1D', bgHousesCtx);
        drawBlock(startX + 2.3, 26.8, 21.5, 2.6, 2.6, 0.6, '#374151', '#1F2937', '#111827', bgHousesCtx);

        // Front Veranda / Covered Porch (y = 43 to 50, facing street)
        // Porch deck
        drawBlock(startX + 2.8, 43, 0, 12.4, 7.0, 1.8, '#CBD5E1', '#94A3B8', '#64748B', bgHousesCtx);
        // Veranda roof canopy
        drawBlock(startX + 2.3, 43, 9.5, 13.4, 7.5, 1.0, roofC, rightC, rightC, bgHousesCtx);
        // Porch support posts
        drawBlock(startX + 3.2, 49.2, 1.8, 0.8, 0.8, 7.7, '#FFFFFF', '#E2E8F0', '#CBD5E1', bgHousesCtx);
        drawBlock(startX + 14.2, 49.2, 1.8, 0.8, 0.8, 7.7, '#FFFFFF', '#E2E8F0', '#CBD5E1', bgHousesCtx);
        // Porch concrete steps leading down to front walkway
        drawBlock(startX + 7.5, 50.0, 0, 3.5, 2.0, 0.9, '#D0D4D8', '#B5BAC0', '#9A9FA3', bgHousesCtx);

        // Large Horizontal Mid-Century Picture Window on front facade
        drawBlock(startX + 3.5, 43, 3.2, 6.5, 0.5, 5.0, '#EEF5F9', '#A2C8E0', '#6BA1C4', bgHousesCtx);
        // White picture window divided mullions
        drawBlock(startX + 6.7, 43.1, 3.2, 0.3, 0.3, 5.0, '#FFFFFF', '#E2E8F0', '#CBD5E1', bgHousesCtx);
        drawBlock(startX + 3.5, 43.1, 5.7, 6.5, 0.3, 0.3, '#FFFFFF', '#E2E8F0', '#CBD5E1', bgHousesCtx);

        // Front Entry Door under the veranda
        drawBlock(startX + 11.2, 43, 1.8, 3.0, 0.5, 6.8, '#FFFFFF', '#E2E8F0', '#CBD5E1', bgHousesCtx);
        drawBlock(startX + 11.8, 43.1, 4.8, 1.6, 0.2, 2.2, '#EEF5F9', '#A2C8E0', '#6BA1C4', bgHousesCtx);

        // Foundation coniferous shrubs in front yard
        drawBlock(startX + 1.2, 44, 0, 2.2, 2.2, 3.2, '#15803D', '#166534', '#14532D', bgHousesCtx);
        drawBlock(startX + 15.6, 44, 0, 2.2, 2.2, 3.0, '#047857', '#065F46', '#064E3B', bgHousesCtx);
      }

      // Boulevard Trees (City of Edmonton Urban Forest - Stately White Birch & Green Ashes)
      // Evenly spaced along the green grass boulevard (y = 84, between sidewalk y = 78 and curb y = 93)
      const treePalette = [
        { main: '#009A44', dark: '#007a36', deep: '#005927', highlight: '#43b865', top: '#32964e' },
        { main: '#15803D', dark: '#166534', deep: '#14532D', highlight: '#22C55E', top: '#16A34A' },
        { main: '#047857', dark: '#065F46', deep: '#064E3B', highlight: '#10B981', top: '#059669' },
        { main: '#1E7E34', dark: '#155724', deep: '#0F3E1A', highlight: '#28A745', top: '#218838' }
      ];

      const treePositions = [18, 65, 110, 155, 205, 255, 305, 355];
      for (let t = 0; t < treePositions.length; t++) {
        const treeX = treePositions[t];
        const treeY = 84;
        const palette = treePalette[t % treePalette.length];

        // Dark organic bark mulch ring around tree base on the grass boulevard
        const mulchPos = project(treeX + 1, treeY + 1, 0);
        bgTreesCtx.save();
        bgTreesCtx.fillStyle = '#2c1e16';
        bgTreesCtx.beginPath();
        bgTreesCtx.ellipse(mulchPos.x, mulchPos.y, 7.5, 4, 0, 0, Math.PI * 2);
        bgTreesCtx.fill();
        bgTreesCtx.restore();

        // White Birch / Green Ash trunk with distinctive Edmonton birch bark
        const isBirch = t % 2 === 1;
        const trunkTop = isBirch ? '#F8FAFC' : '#5c4033';
        const trunkLeft = isBirch ? '#E2E8F0' : '#4a332a';
        const trunkRight = isBirch ? '#CBD5E1' : '#38261f';
        drawBlock(treeX, treeY, 0, 2, 2, 8, trunkTop, trunkLeft, trunkRight, bgTreesCtx);
        if (isBirch) {
          // Birch dark bark lenticel markings
          drawBlock(treeX - 0.1, treeY + 0.5, 3, 2.2, 0.4, 0.5, '#334155', '#1E293B', '#0F172A', bgTreesCtx);
          drawBlock(treeX - 0.1, treeY + 0.5, 5.5, 2.2, 0.4, 0.5, '#334155', '#1E293B', '#0F172A', bgTreesCtx);
        }

        // Stepped cubic foliage canopy
        drawBlock(treeX - 4, treeY - 4, 8, 10, 10, 9, palette.main, palette.dark, palette.deep, bgTreesCtx);
        drawBlock(treeX - 2.5, treeY - 2.5, 17, 7, 7, 7, palette.highlight, palette.top, palette.dark, bgTreesCtx);
      }

      // Fire Hydrant on boulevard at x = 27, y = 85.5
      drawFireHydrant(27, 85.5, 0, bgHousesCtx);
      // City of Edmonton statutory 5m no-parking sign on boulevard post
      drawHydrantSign(30.5, 84, 0, bgHousesCtx);
    }

    renderGroundBackground();
    renderHousesBackground();

    interface HouseCarAssignment {
      type: string;
      x: number;
      y: number;
      w: number;
      d: number;
      color: string;
      isGarage?: boolean;
      homeIndex?: number;
    }

    function generateHouseCarAssignments(drivewayCap: number): HouseCarAssignment[] {
      const assignments: HouseCarAssignment[] = [];
      const typesY = ['sedanY', 'suvY', 'pickupY'];
      const typesX = ['sedan', 'suv', 'pickup'];
      const lotWidth = 30.5;

      // 1. Off-Street Parking: Detached Garages & Rear Parking Pads in Backyards along the Gravel Alley
      const effectiveCap = Math.min(2, Math.max(1, drivewayCap));
      for (let h = 0; h < TOTAL_MIDCENTURY_HOMES; h++) {
        const color = edmontonPalette[h % edmontonPalette.length].hex;
        const startX = 8 + h * lotWidth;

        // Spot 1: In detached rear garage
        assignments.push({
          type: typesY[h % 3],
          x: startX + 17.5,
          y: 4.5,
          w: 7.5,
          d: 11,
          color,
          isGarage: true,
          homeIndex: h
        });

        // Spot 2: Rear outdoor gravel/concrete parking pad (if capacity == 2)
        if (effectiveCap >= 2) {
          assignments.push({
            type: typesY[(h + 1) % 3],
            x: startX + 5.5,
            y: -1,
            w: 7.5,
            d: 11,
            color,
            isGarage: false,
            homeIndex: h
          });
        }
      }

      // 2. On-Street Curbside Stalls: Unbroken continuous curbline parking!
      // Continuous curbside stalls from x = 47 (clearing fire hydrant) to x = 365
      const curbsideStartX = 47;
      const stallWidth = 16;
      const stallSpacing = 19.8;
      for (let s = 0; s < 16; s++) {
        const stallX = curbsideStartX + s * stallSpacing;
        if (stallX + stallWidth > 375) break;
        assignments.push({
          type: typesX[s % 3],
          x: stallX,
          y: 94,
          w: stallWidth,
          d: 7.5,
          color: edmontonPalette[s % edmontonPalette.length].hex,
          isGarage: false
        });
      }

      return assignments;
    }

    let currentDrivewayCap = configRef.current.drivewayCapacity;
    let currentSplitLots = getSplitInfillCount();
    let currentTotalHomesCount = (6 - Math.floor(currentSplitLots / 2)) + (Math.floor(currentSplitLots / 2) * 2);
    let houseCarAssignments = generateHouseCarAssignments(currentDrivewayCap);
    let activeIndices = Array.from({ length: houseCarAssignments.length }, (_, i) => i);

    function shuffleSlots() {
      for (let i = activeIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeIndices[i], activeIndices[j]] = [activeIndices[j], activeIndices[i]];
      }
    }
    shuffleSlots();

    function drawHonkBubble(x: number, y: number, z: number) {
      const pos = project(x + 5, y + 2, z + 8);
      ctx!.save();
      ctx!.fillStyle = '#FFC72C';
      ctx!.strokeStyle = '#193A5A';
      ctx!.lineWidth = 1.5;

      ctx!.beginPath();
      ctx!.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.moveTo(pos.x - 4, pos.y + 12);
      ctx!.lineTo(pos.x - 8, pos.y + 20);
      ctx!.lineTo(pos.x + 2, pos.y + 14);
      ctx!.fillStyle = '#FFC72C';
      ctx!.fill();
      ctx!.stroke();
      
      // Honk lines
      ctx!.strokeStyle = '#193A5A';
      ctx!.beginPath();
      ctx!.moveTo(pos.x - 6, pos.y - 2);
      ctx!.lineTo(pos.x - 2, pos.y + 2);
      ctx!.moveTo(pos.x + 2, pos.y - 2);
      ctx!.lineTo(pos.x + 6, pos.y + 2);
      ctx!.stroke();

      ctx!.restore();
    }

    function drawCirclingBubble(x: number, y: number, z: number, lap: number = 1, isFull: boolean = false) {
      const pos = project(x + 6, y, z + 9);
      ctx!.save();

      const label = isFull && lap > 1 ? `Circling #${lap}` : 'Looking for P';
      ctx!.font = 'bold 8.5px system-ui, -apple-system, sans-serif';
      const textMetrics = ctx!.measureText(label);
      const bubbleW = textMetrics.width + 16;
      const bubbleH = 15;
      const bubbleX = pos.x - bubbleW / 2;
      const bubbleY = pos.y - bubbleH - 2;

      // Soft shadow
      ctx!.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx!.beginPath();
      if (ctx!.roundRect) {
        ctx!.roundRect(bubbleX + 1, bubbleY + 1, bubbleW, bubbleH, 4);
      } else {
        ctx!.rect(bubbleX + 1, bubbleY + 1, bubbleW, bubbleH);
      }
      ctx!.fill();

      // Background Bubble
      ctx!.fillStyle = '#FFFFFF';
      ctx!.strokeStyle = isFull ? '#E8552D' : '#0081BC';
      ctx!.lineWidth = 1.2;
      ctx!.beginPath();
      if (ctx!.roundRect) {
        ctx!.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 4);
      } else {
        ctx!.rect(bubbleX, bubbleY, bubbleW, bubbleH);
      }
      ctx!.fill();
      ctx!.stroke();

      // Pointer triangle pointing down to vehicle roof
      ctx!.beginPath();
      ctx!.moveTo(pos.x - 3, bubbleY + bubbleH);
      ctx!.lineTo(pos.x, bubbleY + bubbleH + 4);
      ctx!.lineTo(pos.x + 3, bubbleY + bubbleH);
      ctx!.fillStyle = '#FFFFFF';
      ctx!.fill();
      ctx!.beginPath();
      ctx!.moveTo(pos.x - 3, bubbleY + bubbleH);
      ctx!.lineTo(pos.x, bubbleY + bubbleH + 4);
      ctx!.lineTo(pos.x + 3, bubbleY + bubbleH);
      ctx!.strokeStyle = isFull ? '#E8552D' : '#0081BC';
      ctx!.lineWidth = 1.2;
      ctx!.stroke();

      // Mini magnifying glass icon
      ctx!.strokeStyle = isFull ? '#E8552D' : '#0081BC';
      ctx!.lineWidth = 1.2;
      ctx!.beginPath();
      ctx!.arc(bubbleX + 6, bubbleY + 7.5, 2.5, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.beginPath();
      ctx!.moveTo(bubbleX + 8, bubbleY + 9.5);
      ctx!.lineTo(bubbleX + 10.5, bubbleY + 12);
      ctx!.stroke();

      // Text label
      ctx!.fillStyle = '#11283F';
      ctx!.textBaseline = 'middle';
      ctx!.fillText(label, bubbleX + 13, bubbleY + 8);

      ctx!.restore();
    }

    function drawParkingAttemptBubble(x: number, y: number, z: number, text: string, status: 'attempt' | 'giveup' | 'success') {
      const pos = project(x + 8, y, z + 9);
      ctx!.save();

      ctx!.font = 'bold 8.5px system-ui, -apple-system, sans-serif';
      const textMetrics = ctx!.measureText(text);
      const bubbleW = textMetrics.width + 16;
      const bubbleH = 15;
      const bubbleX = pos.x - bubbleW / 2;
      const bubbleY = pos.y - bubbleH - 3;

      const themeColor = status === 'giveup' ? '#E8552D' : status === 'success' ? '#009A44' : '#0081BC';

      // Soft shadow
      ctx!.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx!.beginPath();
      if (ctx!.roundRect) {
        ctx!.roundRect(bubbleX + 1, bubbleY + 1, bubbleW, bubbleH, 4);
      } else {
        ctx!.rect(bubbleX + 1, bubbleY + 1, bubbleW, bubbleH);
      }
      ctx!.fill();

      // Background Bubble
      ctx!.fillStyle = '#FFFFFF';
      ctx!.strokeStyle = themeColor;
      ctx!.lineWidth = 1.3;
      ctx!.beginPath();
      if (ctx!.roundRect) {
        ctx!.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 4);
      } else {
        ctx!.rect(bubbleX, bubbleY, bubbleW, bubbleH);
      }
      ctx!.fill();
      ctx!.stroke();

      // Pointer triangle
      ctx!.beginPath();
      ctx!.moveTo(pos.x - 3, bubbleY + bubbleH);
      ctx!.lineTo(pos.x, bubbleY + bubbleH + 4);
      ctx!.lineTo(pos.x + 3, bubbleY + bubbleH);
      ctx!.fillStyle = '#FFFFFF';
      ctx!.fill();
      ctx!.beginPath();
      ctx!.moveTo(pos.x - 3, bubbleY + bubbleH);
      ctx!.lineTo(pos.x, bubbleY + bubbleH + 4);
      ctx!.lineTo(pos.x + 3, bubbleY + bubbleH);
      ctx!.strokeStyle = themeColor;
      ctx!.lineWidth = 1.3;
      ctx!.stroke();

      // Icon symbol dot
      ctx!.fillStyle = themeColor;
      ctx!.beginPath();
      ctx!.arc(bubbleX + 6.5, bubbleY + 7.5, 2.5, 0, Math.PI * 2);
      ctx!.fill();

      // Text label
      ctx!.fillStyle = '#11283F';
      ctx!.textBaseline = 'middle';
      ctx!.fillText(text, bubbleX + 12, bubbleY + 8);

      ctx!.restore();
    }

    function drawBusBubble(x: number, y: number, z: number, text: string) {
      const pos = project(x + 16, y, z + 12);
      ctx!.save();

      ctx!.font = 'bold 8.5px system-ui, -apple-system, sans-serif';
      const textMetrics = ctx!.measureText(text);
      const bubbleW = textMetrics.width + 16;
      const bubbleH = 15;
      const bubbleX = pos.x - bubbleW / 2;
      const bubbleY = pos.y - bubbleH - 3;

      // Soft shadow
      ctx!.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx!.beginPath();
      if (ctx!.roundRect) {
        ctx!.roundRect(bubbleX + 1, bubbleY + 1, bubbleW, bubbleH, 4);
      } else {
        ctx!.rect(bubbleX + 1, bubbleY + 1, bubbleW, bubbleH);
      }
      ctx!.fill();

      // Background Bubble (ETS Blue border)
      ctx!.fillStyle = '#FFFFFF';
      ctx!.strokeStyle = '#005087';
      ctx!.lineWidth = 1.3;
      ctx!.beginPath();
      if (ctx!.roundRect) {
        ctx!.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 4);
      } else {
        ctx!.rect(bubbleX, bubbleY, bubbleW, bubbleH);
      }
      ctx!.fill();
      ctx!.stroke();

      // Pointer triangle
      ctx!.beginPath();
      ctx!.moveTo(pos.x - 3, bubbleY + bubbleH);
      ctx!.lineTo(pos.x, bubbleY + bubbleH + 4);
      ctx!.lineTo(pos.x + 3, bubbleY + bubbleH);
      ctx!.fillStyle = '#FFFFFF';
      ctx!.fill();
      ctx!.beginPath();
      ctx!.moveTo(pos.x - 3, bubbleY + bubbleH);
      ctx!.lineTo(pos.x, bubbleY + bubbleH + 4);
      ctx!.lineTo(pos.x + 3, bubbleY + bubbleH);
      ctx!.strokeStyle = '#005087';
      ctx!.lineWidth = 1.3;
      ctx!.stroke();

      // Bus icon or bullet
      ctx!.fillStyle = '#005087';
      ctx!.beginPath();
      ctx!.arc(bubbleX + 6.5, bubbleY + 7.5, 2.5, 0, Math.PI * 2);
      ctx!.fill();

      // Text label
      ctx!.fillStyle = '#002B49';
      ctx!.textBaseline = 'middle';
      ctx!.fillText(text, bubbleX + 12, bubbleY + 8);

      ctx!.restore();
    }

    function drawPoliceBubble(x: number, y: number, z: number, text: string) {
      const pos = project(x + 7.5, y + 3.5, z + 9);
      ctx!.save();

      ctx!.font = 'bold 9.5px system-ui, -apple-system, sans-serif';
      const textMetrics = ctx!.measureText(text);
      const bubbleW = textMetrics.width + 24;
      const bubbleH = 17;
      const bubbleX = pos.x - bubbleW / 2;
      const bubbleY = pos.y - bubbleH - 5;

      // Shadow
      ctx!.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx!.beginPath();
      if (ctx!.roundRect) {
        ctx!.roundRect(bubbleX + 1.5, bubbleY + 1.5, bubbleW, bubbleH, 4);
      } else {
        ctx!.rect(bubbleX + 1.5, bubbleY + 1.5, bubbleW, bubbleH);
      }
      ctx!.fill();

      // Flashing alert border (Red / Blue alternating)
      const strobePhase = Math.floor((Date.now() / 140) % 2);
      const isRed = strobePhase === 0;
      const borderColor = isRed ? '#EF4444' : '#3B82F6';

      // Background Bubble
      ctx!.fillStyle = '#002B49';
      ctx!.strokeStyle = borderColor;
      ctx!.lineWidth = 1.6;
      ctx!.beginPath();
      if (ctx!.roundRect) {
        ctx!.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 4);
      } else {
        ctx!.rect(bubbleX, bubbleY, bubbleW, bubbleH);
      }
      ctx!.fill();
      ctx!.stroke();

      // Tail
      ctx!.beginPath();
      ctx!.moveTo(pos.x - 3, bubbleY + bubbleH);
      ctx!.lineTo(pos.x, bubbleY + bubbleH + 4);
      ctx!.lineTo(pos.x + 3, bubbleY + bubbleH);
      ctx!.fillStyle = '#002B49';
      ctx!.fill();
      ctx!.strokeStyle = borderColor;
      ctx!.lineWidth = 1.6;
      ctx!.stroke();

      // Strobe icon / beacon dot
      ctx!.fillStyle = borderColor;
      ctx!.beginPath();
      ctx!.arc(bubbleX + 8, bubbleY + 8.5, 3.2, 0, Math.PI * 2);
      ctx!.fill();

      // Text label
      ctx!.fillStyle = '#FFFFFF';
      ctx!.textBaseline = 'middle';
      ctx!.fillText(text, bubbleX + 15, bubbleY + 9);

      ctx!.restore();
    }

    function drawSpeechBubble(x: number, y: number, z: number) {
      const pos = project(x + 1, y - 1, z + 6);
      ctx!.save();
      ctx!.fillStyle = '#FFFFFF';
      ctx!.strokeStyle = '#193A5A';
      ctx!.lineWidth = 1.0;

      ctx!.beginPath();
      ctx!.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.stroke();

      // little dot inside
      ctx!.fillStyle = '#193A5A';
      ctx!.beginPath();
      ctx!.arc(pos.x - 2, pos.y, 1, 0, Math.PI * 2);
      ctx!.arc(pos.x + 2, pos.y, 1, 0, Math.PI * 2);
      ctx!.fill();

      // tail
      ctx!.beginPath();
      ctx!.moveTo(pos.x - 2, pos.y + 7);
      ctx!.lineTo(pos.x - 4, pos.y + 12);
      ctx!.lineTo(pos.x + 1, pos.y + 7);
      ctx!.fillStyle = '#FFFFFF';
      ctx!.fill();
      ctx!.stroke();

      ctx!.restore();
    }

    // =========================================================================================
    // SECTION: VEHICLE MODEL RENDERING & CUSTOM GEOMETRY (Plain English Oversight Summary)
    // -----------------------------------------------------------------------------------------
    // Purpose: Renders distinct 3D isometric vehicle types with authentic municipal and commercial details:
    // 
    // Types Rendered:
    // 1. Delivery Vans: Orange couriers with side green racing stripes, hazard blinkers, and parcel cargo.
    // 2. ETS Transit Buses: Edmonton Transit silver-and-blue livery, multi-pane windows, and route signs.
    // 3. Emergency Vehicles: EPS Police cruisers with roof lightbars and red-and-white Edmonton Fire Trucks.
    // 4. Resident Vehicles: Sedans, SUVs, and Pickups shaded in Edmonton civic colors.
    // 5. Active Micro-Mobility: Commuter bicycles with turning spokes and stand-up electric scooters with headlights.
    // =========================================================================================

    function drawVehicle(
      x: number,
      y: number,
      z: number,
      type: string,
      primaryColor: string,
      isFlipped = false,
      vehicleState?: string
    ) {
      const topC = primaryColor;
      const leftC = adjustColor(primaryColor, -15);
      const rightC = adjustColor(primaryColor, -30);
      const glass = type.includes('suv') ? '#81a3ba' : '#a2c8e0';
      const tire = '#1f1f1f';

      const zOffset = isFlipped ? z + 3 : z;
      const drawTopC = isFlipped ? '#222222' : topC;
      const drawLeftC = isFlipped ? '#111111' : leftC;
      const drawRightC = isFlipped ? '#000000' : rightC;

      if (type === 'deliveryVan') {
        const orangeBase = isFlipped ? '#442200' : '#FF5500';
        const orangeLeft = isFlipped ? '#331100' : '#E54D00';
        const orangeRight = isFlipped ? '#220000' : '#CC4300';
        const greenStripe = '#009A44';

        drawFlatRect(x - 1, y - 0.5, 24, 9, 'rgba(0,0,0,0.3)');
        drawBlock(x, y, zOffset, 15, 8, 9.5, orangeBase, orangeLeft, orangeRight);
        drawBlock(x + 15, y + 0.5, zOffset, 6, 7, 7, orangeBase, orangeLeft, orangeRight);
        drawBlock(x + 17, y + 0.8, zOffset + 3.5, 3.5, 6.4, 2.8, orangeBase, '#81a3ba', '#81a3ba');

        if (!isFlipped) {
          for (let s = 0; s < 3; s++) {
            const sx = x + 2 + s * 4.5;
            const p1 = project(sx, y + 8, zOffset + 1);
            const p2 = project(sx + 2, y + 8, zOffset + 1);
            const p3 = project(sx + 4.5, y + 8, zOffset + 8.5);
            const p4 = project(sx + 2.5, y + 8, zOffset + 8.5);

            ctx!.fillStyle = greenStripe;
            ctx!.beginPath();
            ctx!.moveTo(p1.x, p1.y);
            ctx!.lineTo(p2.x, p2.y);
            ctx!.lineTo(p3.x, p3.y);
            ctx!.lineTo(p4.x, p4.y);
            ctx!.closePath();
            ctx!.fill();
          }

          // Flashing hazard lights when delivery van is stopped for delivery
          const isVanStopped = vehicleState === 'STOPPED' || vehicleState === 'AT_DOOR' || vehicleState === 'RETURNING';
          if (isVanStopped) {
            const isBlinkerOn = Math.floor(Date.now() / 260) % 2 === 0;
            if (isBlinkerOn) {
              const amber = '#ffb300';
              const amberGlow = '#ff8800';
              // Front hazard lights
              drawBlock(x + 20.3, y + 0.5, zOffset + 1.8, 0.7, 0.9, 0.8, amber, amberGlow, amberGlow);
              drawBlock(x + 20.3, y + 6.3, zOffset + 1.8, 0.7, 0.9, 0.8, amber, amberGlow, amberGlow);
              // Rear hazard lights
              drawBlock(x - 0.4, y + 0.5, zOffset + 1.8, 0.7, 0.9, 0.8, amber, amberGlow, amberGlow);
              drawBlock(x - 0.4, y + 6.3, zOffset + 1.8, 0.7, 0.9, 0.8, amber, amberGlow, amberGlow);
            }
          }
        } else {
          drawBlock(x + 3, y - 1, zOffset + 9.5, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 11, y - 1, zOffset + 9.5, 3, 1, 2, tire, tire, tire);
        }
      } else if (type === 'sedan') {
        drawFlatRect(x - 1, y - 0.5, 17, 8, 'rgba(0,0,0,0.25)');
        if (!isFlipped) {
          drawBlock(x + 2, y - 0.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x + 11, y - 0.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x + 2, y + 6.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x + 11, y + 6.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x, y, zOffset + 0.8, 15, 7, 2.5, drawTopC, drawLeftC, drawRightC);
          drawBlock(x + 3, y + 0.5, zOffset + 3.3, 8, 6, 2.2, drawTopC, glass, glass);
        } else {
          drawBlock(x + 3, y + 0.5, zOffset, 8, 6, 2.2, drawTopC, '#111', '#111');
          drawBlock(x, y, zOffset + 2.2, 15, 7, 2.5, drawTopC, drawLeftC, drawRightC);
          drawBlock(x + 2, y - 1, zOffset + 4.7, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 11, y - 1, zOffset + 4.7, 3, 1, 2, tire, tire, tire);
        }
      } else if (type === 'sedanY') {
        drawFlatRect(x - 0.5, y - 1, 8, 17, 'rgba(0,0,0,0.25)');
        if (!isFlipped) {
          drawBlock(x - 0.5, y + 2, zOffset, 1, 3, 1.5, tire, tire, tire);
          drawBlock(x - 0.5, y + 11, zOffset, 1, 3, 1.5, tire, tire, tire);
          drawBlock(x + 6.5, y + 2, zOffset, 1, 3, 1.5, tire, tire, tire);
          drawBlock(x + 6.5, y + 11, zOffset, 1, 3, 1.5, tire, tire, tire);
          drawBlock(x, y, zOffset + 0.8, 7, 15, 2.5, drawTopC, drawLeftC, drawRightC);
          drawBlock(x + 0.5, y + 3, zOffset + 3.3, 6, 8, 2.2, drawTopC, glass, glass);
        } else {
          drawBlock(x + 0.5, y + 3, zOffset, 6, 8, 2.2, drawTopC, '#111', '#111');
          drawBlock(x, y, zOffset + 2.2, 7, 15, 2.5, drawTopC, drawLeftC, drawRightC);
          drawBlock(x - 1, y + 2, zOffset + 4.7, 1, 3, 2, tire, tire, tire);
          drawBlock(x - 1, y + 11, zOffset + 4.7, 1, 3, 2, tire, tire, tire);
        }
      } else if (type === 'police') {
        const white = '#ffffff';
        const epsNavy = '#002B49';
        drawFlatRect(x - 1, y - 0.5, 17, 8, 'rgba(0,0,0,0.25)');

        // Emergency light reflections on asphalt when lights are active
        const strobePhase = Math.floor((Date.now() / 90) % 4);
        const redActive = strobePhase === 0 || strobePhase === 1;
        const blueActive = strobePhase === 2 || strobePhase === 3;

        if (!isFlipped) {
          drawFlatRect(
            x - 5,
            y - 4,
            26,
            16,
            redActive ? 'rgba(239, 68, 68, 0.14)' : 'rgba(59, 130, 246, 0.14)'
          );

          drawBlock(x + 2, y - 0.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x + 11, y - 0.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x + 2, y + 6.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          drawBlock(x + 11, y + 6.5, zOffset, 3, 1, 1.5, tire, tire, tire);
          // White cruiser body
          drawBlock(x, y, zOffset + 0.8, 15, 7, 2.5, white, '#dddddd', '#cccccc');
          // EPS Dark Blue side doors
          drawBlock(x + 3, y - 0.2, zOffset + 1, 7, 7.4, 2.3, epsNavy, epsNavy, epsNavy);
          // Gold EPS star crest on door
          drawBlock(x + 6, y - 0.25, zOffset + 1.8, 1.5, 7.5, 0.8, '#FFC72C', '#E5B224', '#C99816');
          // Cabin & windows
          drawBlock(x + 3, y + 0.5, zOffset + 3.3, 8, 6, 2.2, white, glass, glass);

          // EPS Modern Aerodynamic Emergency Light Bar
          // Roof rack mounting bracket
          drawBlock(x + 5.5, y + 1.0, zOffset + 5.5, 2.4, 5.0, 0.3, '#333333', '#222222', '#111111');
          // Left strobe (Red)
          const leftColor = redActive ? '#FF1E1E' : '#550000';
          drawBlock(x + 5.7, y + 1.2, zOffset + 5.8, 1.8, 1.8, 0.85, leftColor, leftColor, leftColor);
          // Center white strobe
          const centerColor = (strobePhase === 1 || strobePhase === 3) ? '#FFFFFF' : '#444444';
          drawBlock(x + 5.7, y + 3.1, zOffset + 5.8, 1.8, 0.8, 0.85, centerColor, centerColor, centerColor);
          // Right strobe (Blue)
          const rightColor = blueActive ? '#1E6BFF' : '#001155';
          drawBlock(x + 5.7, y + 4.0, zOffset + 5.8, 1.8, 1.8, 0.85, rightColor, rightColor, rightColor);
        } else {
          drawBlock(x + 3, y + 0.5, zOffset, 8, 6, 2.2, white, '#111', '#111');
          drawBlock(x, y, zOffset + 2.2, 15, 7, 2.5, white, '#dddddd', '#cccccc');
          drawBlock(x + 3, y - 0.2, zOffset + 2.4, 7, 7.4, 2.3, epsNavy, epsNavy, epsNavy);
          drawBlock(x + 2, y - 1, zOffset + 4.7, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 11, y - 1, zOffset + 4.7, 3, 1, 2, tire, tire, tire);
        }
      } else if (type === 'firetruck') {
        const red = '#cc0000';
        const redDark = '#990000';
        const chrome = '#eeeeee';
        drawFlatRect(x - 1, y - 0.5, 26, 10, 'rgba(0,0,0,0.3)');
        if (!isFlipped) {
          drawBlock(x + 2, y - 0.5, zOffset, 4, 1.5, 2.5, tire, tire, tire);
          drawBlock(x + 16, y - 0.5, zOffset, 4, 1.5, 2.5, tire, tire, tire);
          drawBlock(x + 2, y + 8, zOffset, 4, 1.5, 2.5, tire, tire, tire);
          drawBlock(x + 16, y + 8, zOffset, 4, 1.5, 2.5, tire, tire, tire);
          drawBlock(x, y, zOffset + 1.2, 24, 9, 7.5, red, redDark, redDark);
          drawBlock(x + 18, y + 0.5, zOffset + 4.2, 6, 8, 4.8, red, glass, glass); // cab
          drawBlock(x + 24, y + 1.5, zOffset + 2, 0.5, 6, 2, chrome, chrome, chrome); // grill
          
          // flashing lights
          const lightColor = (Date.now() % 300 > 150) ? '#ff0000' : '#ffffff';
          drawBlock(x + 19, y + 1, zOffset + 9, 3, 7, 1.0, lightColor, lightColor, lightColor);
        } else {
          drawBlock(x, y, zOffset + 2, 24, 9, 7.5, red, redDark, redDark);
          drawBlock(x + 2, y - 1, zOffset + 9.7, 4, 1.5, 2.5, tire, tire, tire);
          drawBlock(x + 16, y - 1, zOffset + 9.7, 4, 1.5, 2.5, tire, tire, tire);
        }
      } else if (type === 'suv') {
        drawFlatRect(x - 1, y - 0.5, 18, 8.5, 'rgba(0,0,0,0.25)');
        if (!isFlipped) {
          drawBlock(x + 2, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 11, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 2, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 11, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x, y, zOffset + 1, 16, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
          drawBlock(x + 2, y + 0.5, zOffset + 4.2, 11, 6.5, 2.8, drawTopC, glass, glass);
        } else {
          drawBlock(x + 2, y + 0.5, zOffset, 11, 6.5, 2.8, drawTopC, '#111', '#111');
          drawBlock(x, y, zOffset + 2.8, 16, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
          drawBlock(x + 2, y - 1, zOffset + 6.0, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 11, y - 1, zOffset + 6.0, 3.5, 1, 2, tire, tire, tire);
        }
      } else if (type === 'suvY') {
        drawFlatRect(x - 0.5, y - 1, 8.5, 18, 'rgba(0,0,0,0.25)');
        if (!isFlipped) {
          drawBlock(x - 0.5, y + 2, zOffset, 1, 3.5, 2, tire, tire, tire);
          drawBlock(x - 0.5, y + 11, zOffset, 1, 3.5, 2, tire, tire, tire);
          drawBlock(x + 7, y + 2, zOffset, 1, 3.5, 2, tire, tire, tire);
          drawBlock(x + 7, y + 11, zOffset, 1, 3.5, 2, tire, tire, tire);
          drawBlock(x, y, zOffset + 1, 7.5, 16, 3.2, drawTopC, drawLeftC, drawRightC);
          drawBlock(x + 0.5, y + 2, zOffset + 4.2, 6.5, 11, 2.8, drawTopC, glass, glass);
        } else {
          drawBlock(x + 0.5, y + 2, zOffset, 6.5, 11, 2.8, drawTopC, '#111', '#111');
          drawBlock(x, y, zOffset + 2.8, 7.5, 16, 3.2, drawTopC, drawLeftC, drawRightC);
          drawBlock(x - 1, y + 2, zOffset + 6.0, 1, 3.5, 2, tire, tire, tire);
          drawBlock(x - 1, y + 11, zOffset + 6.0, 1, 3.5, 2, tire, tire, tire);
        }
      } else if (type === 'pickup') {
        drawFlatRect(x - 1, y - 0.5, 20, 8.5, 'rgba(0,0,0,0.25)');
        if (!isFlipped) {
          drawBlock(x + 2, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 13, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 2, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 13, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
          // Bed (Drawn first)
          drawBlock(x, y, zOffset + 1, 7, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
          // Cab (Drawn next so it overlaps the bed slightly if needed)
          drawBlock(x + 7, y, zOffset + 1, 11, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
          // Windshield/Roof
          drawBlock(x + 8, y + 0.5, zOffset + 4.2, 7, 6.5, 3, drawTopC, glass, glass);
        } else {
          drawBlock(x + 2, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 13, y - 0.5, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 2, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
          drawBlock(x + 13, y + 7, zOffset, 3.5, 1, 2, tire, tire, tire);
          // Bed (Drawn first since cab overlaps it from the front)
          drawBlock(x + 11, y, zOffset + 1, 7, 7.5, 3.2, drawTopC, drawLeftC, drawRightC);
          // Cab 
          drawBlock(x + 1, y, zOffset + 1, 11, 7.5, 3.2, drawTopC, '#111', '#111');
          // Windshield/Roof
          drawBlock(x + 3, y + 0.5, zOffset + 4.2, 7, 6.5, 3, drawTopC, glass, glass);
        }
      } else if (type === 'boxTruck') {
        drawFlatRect(x - 1, y - 0.5, 25, 9, 'rgba(0,0,0,0.3)');
        if (!isFlipped) {
          // Tires
          drawBlock(x + 2, y - 0.5, zOffset, 4, 1, 2, tire, tire, tire);
          drawBlock(x + 19, y - 0.5, zOffset, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 2, y + 7.5, zOffset, 4, 1, 2, tire, tire, tire);
          drawBlock(x + 19, y + 7.5, zOffset, 3, 1, 2, tire, tire, tire);
          // Box (White) with slight overhang over the cab
          drawBlock(x, y, zOffset + 1.5, 17, 8, 9.5, '#f0f2f5', '#dcdfe3', '#c8cbcf');
          // Cab (Red) (Drawn after Box to appear in front)
          drawBlock(x + 16, y + 0.5, zOffset + 1, 7, 7, 5, '#d94136', adjustColor('#d94136', -15), adjustColor('#d94136', -30));
          // Windshield
          drawBlock(x + 20, y + 1, zOffset + 3.5, 3, 6, 2.5, '#d94136', glass, glass);
        } else {
          // Tires
          drawBlock(x + 2, y - 0.5, zOffset, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 18, y - 0.5, zOffset, 4, 1, 2, tire, tire, tire);
          drawBlock(x + 2, y + 7.5, zOffset, 3, 1, 2, tire, tire, tire);
          drawBlock(x + 18, y + 7.5, zOffset, 4, 1, 2, tire, tire, tire);
          // Cab (Red) (Drawn before Box because Box has higher X and is closer in projection)
          drawBlock(x + 1, y + 0.5, zOffset + 1, 7, 7, 5, '#d94136', '#111', '#111');
          // Windshield
          drawBlock(x + 1, y + 1, zOffset + 3.5, 3, 6, 2.5, '#d94136', glass, glass);
          // Box (White)
          drawBlock(x + 7, y, zOffset + 1.5, 17, 8, 9.5, '#f0f2f5', '#dcdfe3', '#c8cbcf');
        }
      } else if (type === 'etsBus') {
        // Edmonton Transit Service (ETS) Transit Bus
        // Blue upper crown & roof: #005087 / #0081BC / #004070
        // Light silver/white lower body: #d9dfe5 / #cbd2d9 / #b8c1cb
        // Dark bumper / front bike rack / window glazing
        const etsBlue = '#005087';
        const etsBlueLight = '#0066aa';
        const etsBlueDark = '#003a63';
        const etsSilver = '#d9dfe5';
        const etsSilverDark = '#b8c1cb';
        const etsGlass = '#1a3347';
        const amberLed = '#ffb300';
        const bikeRack = '#2b2b2b';

        drawFlatRect(x - 1, y - 0.5, 36, 10, 'rgba(0,0,0,0.32)');

        if (!isFlipped) {
          // Tires (Front + Dual Rear)
          drawBlock(x + 5, y - 0.5, zOffset, 4, 1.2, 2.5, tire, tire, tire);
          drawBlock(x + 24, y - 0.5, zOffset, 5, 1.2, 2.5, tire, tire, tire);
          drawBlock(x + 5, y + 8.2, zOffset, 4, 1.2, 2.5, tire, tire, tire);
          drawBlock(x + 24, y + 8.2, zOffset, 5, 1.2, 2.5, tire, tire, tire);

          // Lower body (Silver/Grey)
          drawBlock(x, y, zOffset + 1.2, 33, 9, 3.8, etsSilver, etsSilverDark, etsSilverDark);

          // Dark front bumper
          drawBlock(x + 32, y + 0.5, zOffset + 0.8, 1.5, 8, 2.0, '#1a1a1a', '#111111', '#111111');

          // Bike rack on front bumper
          drawBlock(x + 33.5, y + 2, zOffset + 1.2, 2.0, 5, 1.4, bikeRack, bikeRack, bikeRack);

          // Passenger window ribbon (Dark tinted glass with slim pillars)
          drawBlock(x + 1, y + 0.4, zOffset + 5.0, 31, 8.2, 3.2, etsGlass, etsGlass, etsGlass);

          // Upper body & Aerodynamic Roof Pod (ETS Edmonton Blue)
          drawBlock(x, y, zOffset + 8.2, 33, 9, 2.4, etsBlue, etsBlueLight, etsBlueDark);
          // Streamlined AC / HVAC roof hump
          drawBlock(x + 6, y + 1.2, zOffset + 10.6, 18, 6.6, 1.6, etsBlue, etsBlueLight, etsBlueDark);

          // Front LED Destination Sign: "126 Westmount / ETS" (Amber LED)
          drawBlock(x + 32, y + 2, zOffset + 8.6, 0.8, 5, 1.4, amberLed, amberLed, amberLed);

          // Windshield with subtle reflection
          drawBlock(x + 31.5, y + 0.8, zOffset + 5.0, 1.2, 7.4, 3.4, '#81a3ba', etsGlass, etsGlass);

          // Headlights
          drawBlock(x + 32.8, y + 1, zOffset + 2.4, 0.4, 1.8, 1.0, '#ffffff', '#ffffff', '#ffffff');
          drawBlock(x + 32.8, y + 6.2, zOffset + 2.4, 0.4, 1.8, 1.0, '#ffffff', '#ffffff', '#ffffff');
        }
      }
    }

    function drawPedestrian(
      x: number,
      y: number,
      z: number,
      shirtColor: string,
      pose: 'normal' | 'bystander' | 'protester' | 'officer' = 'normal'
    ) {
      const skin = '#f0c8a0';
      const pants = pose === 'officer' ? '#002B49' : '#2c3e50';
      drawBlock(x, y, z, 1, 1, 2.5, pants, pants, pants);

      if (pose === 'officer') {
        // EPS Police Officer in uniform with high-vis yellow vest, peaked cap, and gold crest
        const navy = '#002B49';
        const vestYellow = '#FACC15';
        const vestDark = '#CA8A04';
        const silver = '#E2E8F0';

        // Navy base shirt with high-visibility fluorescent vest
        drawBlock(x - 0.25, y - 0.25, z + 2.5, 1.5, 1.5, 3.1, vestYellow, vestDark, vestDark);
        // Silver reflective stripes
        drawBlock(x - 0.3, y - 0.3, z + 3.6, 1.6, 1.6, 0.4, silver, silver, silver);

        // Head
        drawBlock(x + 0.1, y + 0.1, z + 5.5, 1.2, 1.2, 1.4, skin, skin, skin);

        // Peaked officer cap on head
        drawBlock(x - 0.2, y - 0.2, z + 6.6, 1.6, 1.6, 0.85, navy, navy, navy);
        // Cap visor / brim
        drawBlock(x + 0.8, y - 0.1, z + 6.5, 0.7, 1.4, 0.2, '#111111', '#111111', '#111111');
        // Gold crest badge on cap front
        drawBlock(x + 0.8, y + 0.3, z + 6.8, 0.2, 0.6, 0.35, '#FFC72C', '#FFC72C', '#FFC72C');

        // Right arm gesturing traffic forward with illuminated traffic wand
        const wave = Math.sin(Date.now() / 120);
        drawBlock(x + 1.2 + wave * 0.2, y + 0.2, z + 3.8, 1.1, 0.6, 0.6, vestYellow, vestDark, vestDark);
        // Orange illuminated traffic wand / director baton
        drawBlock(x + 2.2 + wave * 0.2, y + 0.3, z + 4.0, 1.4, 0.4, 0.4, '#FF4500', '#FF4500', '#FF4500');
        return;
      }

      drawBlock(x - 0.2, y - 0.2, z + 2.5, 1.4, 1.4, 3, shirtColor, adjustColor(shirtColor, -15), adjustColor(shirtColor, -30));
      drawBlock(x + 0.1, y + 0.1, z + 5.5, 1.2, 1.2, 1.4, skin, skin, skin);
    }

    function drawBusStopShelter(x: number, y: number) {
      // Concrete boarding & waiting pad extending across the boulevard to the curb edge (y: 80 to 93)
      drawFlatRect(x - 2, y - 1, 25, 13.5, '#c5cbd2');
      // High-visibility tactile yellow warning paving strip along the curb edge (y = 91.8 to 93)
      drawFlatRect(x - 2, y + 11.2, 25, 1.2, '#ffc72c');

      // Four dark steel stanchion posts for the bus stop shelter (y: y + 0.8 and y + 7.5)
      const postColor = '#1f2937';
      drawBlock(x + 1, y + 0.8, 0, 1.2, 1.2, 9.5, postColor, postColor, postColor);
      drawBlock(x + 17, y + 0.8, 0, 1.2, 1.2, 9.5, postColor, postColor, postColor);
      drawBlock(x + 1, y + 7.2, 0, 1.2, 1.2, 9.5, postColor, postColor, postColor);
      drawBlock(x + 17, y + 7.2, 0, 1.2, 1.2, 9.5, postColor, postColor, postColor);

      // Wooden waiting bench inside shelter
      drawBlock(x + 3.5, y + 1.8, 0, 11, 2.5, 2.8, '#b45309', '#92400e', '#78350f');

      // Rear tempered glass wind-screen panels
      drawBlock(x + 2, y + 1.0, 0.5, 15, 0.6, 8.5, 'rgba(180, 220, 245, 0.45)', 'rgba(140, 190, 225, 0.5)', 'rgba(140, 190, 225, 0.5)');

      // Left wind-screen panel
      drawBlock(x + 1.2, y + 1.6, 0.5, 0.6, 5.5, 8.5, 'rgba(180, 220, 245, 0.45)', 'rgba(140, 190, 225, 0.5)', 'rgba(140, 190, 225, 0.5)');

      // Curved / cantilevered canopy roof (ETS Blue top fascia)
      drawBlock(x - 0.5, y + 0.3, 9.5, 20, 9.2, 1.2, '#005087', '#003a63', '#002844');
      drawBlock(x - 0.2, y + 0.6, 10.7, 19.4, 8.6, 0.6, '#0081bc', '#0066aa', '#005087');

      // ETS Bus Stop Sign Post at the curb edge of the boulevard
      const signPostX = x + 20.5;
      const signPostY = y + 9.5;
      drawBlock(signPostX, signPostY, 0, 0.8, 0.8, 12, '#374151', '#1f2937', '#111827');
      // Sign plate (ETS Blue and White bus symbol) facing oncoming street traffic
      drawBlock(signPostX - 0.4, signPostY - 0.2, 9.8, 1.6, 2.2, 2.5, '#005087', '#003a63', '#0081bc');
      drawBlock(signPostX - 0.4, signPostY - 0.1, 10.6, 1.6, 2.0, 1.2, '#ffffff', '#e5e7eb', '#ffffff');

      // Floating Stop Label
      const labelPos = project(x + 10, y + 5, 16);
      ctx!.save();
      ctx!.font = 'bold 8.5px system-ui, -apple-system, sans-serif';
      const labelText = 'ETS Bus Stop';
      const tw = ctx!.measureText(labelText).width;
      ctx!.fillStyle = 'rgba(0, 43, 73, 0.85)';
      if (ctx!.roundRect) {
        ctx!.roundRect(labelPos.x - tw / 2 - 4, labelPos.y - 7, tw + 8, 13, 3);
      } else {
        ctx!.rect(labelPos.x - tw / 2 - 4, labelPos.y - 7, tw + 8, 13);
      }
      ctx!.fill();
      ctx!.fillStyle = '#ffffff';
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      ctx!.fillText(labelText, labelPos.x, labelPos.y);
      ctx!.restore();
    }

    function drawCyclist(x: number, y: number, z: number, bikeColor: string) {
      drawBlock(x, y, z, 3, 0.5, 2, '#333', '#222', '#111');
      drawBlock(x + 6, y, z, 3, 0.5, 2, '#333', '#222', '#111');
      drawBlock(x + 2, y, z + 1.5, 5, 0.5, 1.5, bikeColor, bikeColor, bikeColor);
      drawPedestrian(x + 3, y, z + 2, '#ffffff');
    }

    function drawScooter(x: number, y: number, z: number, scooterColor: string) {
      drawBlock(x, y, z, 7, 1, 0.6, scooterColor, scooterColor, scooterColor);
      drawBlock(x + 6, y + 0.2, z + 0.6, 0.5, 0.6, 4, '#333', '#222', '#111');
      drawPedestrian(x + 2, y, z + 0.6, '#0081BC');
    }

    const BASE_CAR_SPEED = 1.15;
    const MICRO_SPEED = BASE_CAR_SPEED * 0.75;
    const PED_SPEED = MICRO_SPEED * 0.25;

    const pedColors = ['#E8552D', '#0081BC', '#FFC72C', '#ffffff', '#68217A', '#009A44'];
    const pedestrians = Array.from({ length: 24 }, (_, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      return {
        id: i,
        x: Math.random() * blockLength,
        y: 73 + (i % 3) * 1.5,
        roadY: 98 + (i % 5) * 6,
        w: 2,
        d: 2,
        baseSpeed: PED_SPEED * dir,
        speed: PED_SPEED * dir,
        color: pedColors[i % pedColors.length]
      };
    });

    const microMobility = Array.from({ length: 12 }, (_, i) => ({
      type: i % 2 === 0 ? 'bike' : 'scooter',
      x: -50 - i * 65,
      y: i % 2 === 0 ? 110 : 124,
      baseY: i % 2 === 0 ? 110 : 124,
      targetY: i % 2 === 0 ? 110 : 124,
      w: i % 2 === 0 ? 8 : 7,
      d: 4,
      baseSpeed: MICRO_SPEED,
      speed: MICRO_SPEED,
      color: edmontonPalette[i % edmontonPalette.length].hex
    }));

    interface RoadObstacle {
      x: number;
      y: number;
      w: number;
      d: number;
      speed?: number;
      baseSpeed?: number;
      baseY?: number;
      targetY?: number;
      type: string;
      color?: string;
      isStatic?: boolean;
      stuckTimer?: number;
      honkCooldown?: number;
      honkBubbleTimer?: number;
      isStuckBehindVan?: boolean;
      isBurning?: boolean;
      isEmergency?: boolean;
      isCircling?: boolean;
      circlingLap?: number;
      searchingBubbleTimer?: number;
      searchScanTimer?: number;
      shouldRetire?: boolean;
      isExtraBus?: boolean;
      busDwellTimer?: number;
      busStopState?: 'approaching' | 'dwelling' | 'departing';
      parkingState?: 'cruising' | 'found_spot' | 'attempting_reverse' | 'giving_up' | 'docking' | 'parked';
      parkingTimer?: number;
      parkingTargetSlot?: any;
      parkingBubbleText?: string;
      parkingAttemptTimer?: number;
      spaceRatio?: number;
      policeBubbleText?: string;
      isFlipped?: boolean;
    }

    // Baseline through-traffic vehicles (constant through flow across the neighborhood)
    const throughVehicles: RoadObstacle[] = [
      { type: 'sedan', x: -40, y: 110, baseY: 110, targetY: 110, w: 15, d: 7, baseSpeed: 1.25, speed: 1.25, color: edmontonPalette[0].hex, stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isCircling: false },
      { type: 'etsBus', x: -220, y: 110, baseY: 110, targetY: 110, w: 33, d: 9, baseSpeed: 0.95, speed: 0.95, color: '#005087', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isCircling: false, busStopState: 'approaching' },
      { type: 'boxTruck', x: -420, y: 124, baseY: 124, targetY: 124, w: 24, d: 8.5, baseSpeed: 0.85, speed: 0.85, color: '', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isCircling: false }
    ];

    // Secondary frequent ETS Bus (injected when dwellings > 10)
    const extraEtsBus: RoadObstacle = {
      type: 'etsBus',
      x: -360,
      y: 110,
      baseY: 110,
      targetY: 110,
      w: 33,
      d: 9,
      baseSpeed: 0.95,
      speed: 0.95,
      color: '#005087',
      stuckTimer: 0,
      honkCooldown: 0,
      honkBubbleTimer: 0,
      isCircling: false,
      isExtraBus: true,
      busStopState: 'approaching'
    };

    // Cruising / Circling vehicle pool: activates as street parking fills up, creating realistic traffic searching for spots
    const cruisingVehiclePool: RoadObstacle[] = [
      { type: 'suv', x: -140, y: 124, baseY: 124, targetY: 124, w: 16, d: 7.5, baseSpeed: 0.72, speed: 0.72, color: edmontonPalette[3].hex, stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isCircling: true, circlingLap: 1, searchingBubbleTimer: 0, searchScanTimer: 0 },
      { type: 'pickup', x: -240, y: 110, baseY: 110, targetY: 110, w: 18, d: 7.5, baseSpeed: 0.75, speed: 0.75, color: edmontonPalette[2].hex, stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isCircling: true, circlingLap: 1, searchingBubbleTimer: 0, searchScanTimer: 0 },
      { type: 'sedan', x: -340, y: 124, baseY: 124, targetY: 124, w: 15, d: 7, baseSpeed: 0.68, speed: 0.68, color: '#C0392B', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isCircling: true, circlingLap: 1, searchingBubbleTimer: 0, searchScanTimer: 0 },
      { type: 'suv', x: -440, y: 110, baseY: 110, targetY: 110, w: 16, d: 7.5, baseSpeed: 0.7, speed: 0.7, color: '#27AE60', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isCircling: true, circlingLap: 1, searchingBubbleTimer: 0, searchScanTimer: 0 },
      { type: 'sedan', x: -540, y: 124, baseY: 124, targetY: 124, w: 15, d: 7, baseSpeed: 0.65, speed: 0.65, color: '#8E44AD', stuckTimer: 0, honkCooldown: 0, honkBubbleTimer: 0, isCircling: true, circlingLap: 1, searchingBubbleTimer: 0, searchScanTimer: 0 }
    ];

    const activeVehicles: RoadObstacle[] = [...throughVehicles];
    let lastReportedCircling = -1;
    let lastReportedDemand = -1;
    let lastReportedPct = -1;
    let lastReportedStallsCapacity = -1;
    let lastDrawnGaugeCars = -1;
    let lastDrawnGaugeCap = -1;
    let emergencyVehicles: RoadObstacle[] = [];

    // --- Police Traffic Clearance Response for Blockages (>20s) ---
    interface PoliceBlockageUnit {
      active: boolean;
      state: 'inactive' | 'dispatched' | 'investigating' | 'clearing' | 'resuming';
      blockedLane: 'north' | 'south';
      targetBlockageX: number;
      targetLaneY: number;
      stageTimer: number;
      sirenSoundTimer: number;
      bubbleText: string;
    }

    let laneNorthStuckTimer = 0;
    let laneSouthStuckTimer = 0;
    // =========================================================================================
    // SECTION: EMERGENCY RESPONSE & TRAFFIC BLOCKAGE RESOLUTION (Plain English Oversight Summary)
    // -----------------------------------------------------------------------------------------
    // Purpose: Simulates City of Edmonton Emergency and Police Services (EPS) resolving road gridlock.
    // 
    // Key Rules:
    // 1. Stuck Lane Timer: If any vehicle is stationary in an active travel lane for over 20 seconds,
    //    an automated emergency dispatch trigger is activated.
    // 2. Audible & Visual Dispatch: An EPS police cruiser arrives with flashing cherry-and-blue beacons
    //    and siren chirps, decelerating safely behind the blockage.
    // 3. Officer Directing Traffic: A uniformed officer steps out to manage traffic flow and clear
    //    the obstruction, safely releasing queued vehicles before clearing the scene.
    // =========================================================================================

    let policeResponseCooldown = 0;
    let lastReportedLaneStuckSeconds = -1;

    const policeBlockageUnit: PoliceBlockageUnit = {
      active: false,
      state: 'inactive',
      blockedLane: 'north',
      targetBlockageX: 160,
      targetLaneY: 110,
      stageTimer: 0,
      sirenSoundTimer: 0,
      bubbleText: ''
    };

    const policeTrafficCar: RoadObstacle = {
      type: 'police',
      x: -400,
      y: 124,
      baseY: 124,
      targetY: 124,
      w: 15,
      d: 7,
      baseSpeed: 2.8,
      speed: 2.8,
      color: '#ffffff',
      isEmergency: true,
      stuckTimer: 0,
      honkCooldown: 0,
      honkBubbleTimer: 0
    };

    const policeOfficerPed = {
      x: 0,
      y: 0,
      active: false,
      pose: 'officer' as const
    };

    (window as any).__dispatchPoliceBlockageTest = () => {
      laneNorthStuckTimer = 20.0;
    };

    // =========================================================================================
    // SECTION: COMMERCIAL DELIVERY & LOGISTICS SYSTEM (Plain English Oversight Summary)
    // -----------------------------------------------------------------------------------------
    // Purpose: Simulates home delivery services (e.g. couriers, grocery drop-offs) in the block.
    // 
    // Key Rules:
    // 1. Scalable Van Fleet: The number of active delivery vans scales with weekly package volumes.
    // 2. Curbside vs Double-Parking: The delivery driver checks if a curbside stall is vacant. If vacant,
    //    the van pulls in curbside (y: 94). If all stalls are full, it halts in the travel lane (y: 104)
    //    with hazard blinkers active, realistically creating momentary traffic impedance.
    // 3. Realistic Pedestrian Paths: The courier exits the cab, walks across the driveway apron
    //    and sidewalk directly to the front doorstep, deposits the parcel, and returns.
    // =========================================================================================

    interface DeliveryVan extends RoadObstacle {
      id: number;
      state: 'APPROACHING' | 'STOPPED' | 'AT_DOOR' | 'RETURNING' | 'LEAVING' | 'COOLDOWN';
      targetHouse: number;
      targetStopX: number;
      stopTimer: number;
      driver: {
        x: number;
        y: number;
        targetDoorX: number;
        targetDoorY: number;
        hasPackage: boolean;
        active: boolean;
        path?: {x: number; y: number}[];
        pathIdx?: number;
      };
    }

    interface DeliveredParcel {
      id: string;
      houseIndex: number;
      x: number;
      y: number;
      z: number;
      w: number;
      d: number;
      h: number;
      color: string;
      deliveredAt: number;
    }

    let deliveryVansList: DeliveryVan[] = [];
    const deliveredParcels: DeliveredParcel[] = [];

    function getTargetStopX(targetHouse: number): number {
      const houseIndex = targetHouse % TOTAL_MIDCENTURY_HOMES;
      if (houseIndex === 0) {
        return 48; // Past fire hydrant 5m clearance zone
      }
      const houseBaseX = 8 + houseIndex * 30.5;
      return houseBaseX + 6;
    }

    function createDeliveryVan(id: number, targetHouse: number): DeliveryVan {
      const houseIndex = targetHouse % TOTAL_MIDCENTURY_HOMES;
      const houseBaseX = 8 + houseIndex * 30.5;
      const doorX = houseBaseX + 13;
      const stopX = getTargetStopX(houseIndex);
      return {
        id,
        type: 'deliveryVan',
        x: -120 - id * 120,
        y: 104,
        baseY: 104,
        targetY: 104,
        w: 21,
        d: 8,
        baseSpeed: 0.9,
        speed: 0.9,
        color: '#FF5500',
        state: 'APPROACHING',
        targetHouse: houseIndex,
        targetStopX: stopX,
        stopTimer: 0,
        driver: {
          x: 0,
          y: 0,
          targetDoorX: doorX,
          targetDoorY: 44,
          hasPackage: true,
          active: false
        }
      };
    }

    function updateDeliveryPool(weeklyDeliveries: number) {
      const numVansNeeded = Math.min(3, Math.max(1, Math.ceil(weeklyDeliveries / 8)));
      while (deliveryVansList.length < numVansNeeded) {
        const id = deliveryVansList.length;
        const houseIdx = (id * 3) % TOTAL_MIDCENTURY_HOMES;
        deliveryVansList.push(createDeliveryVan(id, houseIdx));
      }
      if (deliveryVansList.length > numVansNeeded) {
        deliveryVansList = deliveryVansList.slice(0, numVansNeeded);
      }
    }

    function isCurbsideSpotOccupied(targetStopX: number, obstacles: RoadObstacle[] = []): boolean {
      // Zone checks: bus stop zone (x: 300 - 350) and fire hydrant zone (x: 20 - 35) prohibit curbside parking
      if (targetStopX + 21 >= 300 && targetStopX <= 350) return true;
      if (targetStopX + 21 >= 20 && targetStopX <= 35) return true;

      for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        if (obs.type === 'deliveryVan') continue; // Don't block self
        if (obs.y >= 90 && obs.y <= 98) {
          if (obs.x < targetStopX + 24 && obs.x + obs.w > targetStopX - 4) {
            return true;
          }
        }
      }
      return false;
    }

    // =========================================================================================
    // SECTION: CURBSIDE OCCUPANCY GAUGE & CAPACITY METRICS (Plain English Oversight Summary)
    // -----------------------------------------------------------------------------------------
    // Purpose: Visualizes curbside parking stress in real time as a municipal dashboard dial gauge.
    // 
    // Key Rules:
    // 1. Three Color-Coded Zones: Green (0-80% capacity = ample parking), Yellow (80-130% = balanced
    //    or tight), and Red (>130% = severe curbside overflow).
    // 2. Clear Numeric Readout: Shows parked cars versus legal capacity (e.g. "8/11 Cars" at 73%).
    // 3. Performance Caching: Only redraws the canvas when vehicle count or total capacity changes.
    // =========================================================================================

    function drawGauge(curbsideCars: number, totalLegalStalls: number) {
      if (!gaugeCtx || !gaugeCanvas) return;
      if (curbsideCars === lastDrawnGaugeCars && totalLegalStalls === lastDrawnGaugeCap) return;
      lastDrawnGaugeCars = curbsideCars;
      lastDrawnGaugeCap = totalLegalStalls;
      gaugeCtx.clearRect(0, 0, gaugeCanvas.width, gaugeCanvas.height);

      const cx = gaugeCanvas.width / 2;
      const cy = gaugeCanvas.height - Math.max(10, Math.round(gaugeCanvas.height * 0.2));
      const radius = Math.min(cx - 12, cy - 14); // Reduced radius to make room for text at top
      const lineWidth = Math.max(5, Math.round(radius * 0.16));

      const percentage = (curbsideCars / totalLegalStalls) * 100;
      const clampedPct = Math.min(200, Math.max(0, percentage));

      const startAngle = Math.PI;
      const endAngle = 2 * Math.PI;

      // Green arc
      gaugeCtx.strokeStyle = '#009A44';
      gaugeCtx.lineWidth = lineWidth;
      gaugeCtx.beginPath();
      gaugeCtx.arc(cx, cy, radius, startAngle, startAngle + Math.PI * 0.4, false);
      gaugeCtx.stroke();

      // Yellow arc
      gaugeCtx.strokeStyle = '#FFC72C';
      gaugeCtx.beginPath();
      gaugeCtx.arc(cx, cy, radius, startAngle + Math.PI * 0.4, startAngle + Math.PI * 0.65, false);
      gaugeCtx.stroke();

      // Red arc
      gaugeCtx.strokeStyle = '#E8552D';
      gaugeCtx.beginPath();
      gaugeCtx.arc(cx, cy, radius, startAngle + Math.PI * 0.65, endAngle, false);
      gaugeCtx.stroke();

      // Tick Labels
      const fontSize = Math.max(7, Math.round(radius * 0.15));
      gaugeCtx.fillStyle = '#ffffff';
      gaugeCtx.font = `bold ${fontSize}px "Open Sans", sans-serif`;
      gaugeCtx.textAlign = 'center';
      gaugeCtx.fillText('0%', cx - radius + 2, cy + fontSize + 2);
      gaugeCtx.fillText('100%', cx, cy - radius - 10);
      gaugeCtx.fillText('200%', cx + radius - 2, cy + fontSize + 2);

      // Pointer Needle
      const needleAngle = Math.PI + (clampedPct / 200) * Math.PI;
      const needleLen = radius - 3;

      gaugeCtx.save();
      gaugeCtx.translate(cx, cy);
      gaugeCtx.rotate(needleAngle);

      gaugeCtx.strokeStyle = '#ffffff';
      gaugeCtx.lineWidth = Math.max(1.8, Math.round(radius * 0.04));
      gaugeCtx.beginPath();
      gaugeCtx.moveTo(-3, 0);
      gaugeCtx.lineTo(needleLen, 0);
      gaugeCtx.stroke();

      gaugeCtx.fillStyle = '#FFC72C';
      gaugeCtx.beginPath();
      gaugeCtx.arc(0, 0, Math.max(2.5, Math.round(radius * 0.06)), 0, Math.PI * 2);
      gaugeCtx.fill();
      gaugeCtx.restore();
    }

    function spawnFireParticle(x: number, y: number, z: number) {
      particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 6,
        z: z + Math.random() * 4,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: 0.4 + Math.random() * 0.5,
        life: 1.0,
        color: Math.random() > 0.4 ? '#FF5500' : Math.random() > 0.5 ? '#FFC72C' : '#555555'
      });
    }

    function updateAndDrawParticles() {
      if (particles.length === 0) return;
      let writeIdx = 0;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;
        p.life -= 0.03;

        if (p.life > 0) {
          const posX = (p.x - p.y) * ISO_X + offsetX;
          const posY = (p.x + p.y) * ISO_Y - p.z * ISO_Z + offsetY;
          ctx!.fillStyle = p.color;
          ctx!.globalAlpha = Math.max(0, p.life);
          ctx!.beginPath();
          ctx!.arc(posX, posY, 2.5 * p.life + 1, 0, Math.PI * 2);
          ctx!.fill();

          particles[writeIdx++] = p;
        }
      }
      particles.length = writeIdx;
      ctx!.globalAlpha = 1.0;
    }

    // =========================================================================================
    // SECTION: COLLISION AVOIDANCE & SAFETY BUFFER ENGINE (Plain English Oversight Summary)
    // -----------------------------------------------------------------------------------------
    // Purpose: Prevents vehicles, delivery vans, emergency units, cyclists, and scooter riders
    // from clipping through each other or penetrating other objects.
    // 
    // Key Rules:
    // 1. Lateral Overlap: Checks if two entities share the same lane width plus a 1.2 unit margin.
    // 2. Safety Buffer: Assigns physical stopping distances per vehicle size (e.g., 9.5 for buses
    //    and fire trucks, 6.5 for cars, 4.5 for cyclists/scooters) plus extra courtesy spacing
    //    when cars follow cyclists.
    // 3. Smooth Deceleration: As distance narrows, closing speed smoothly drops to zero.
    // 4. Strict Clamp: Position is strictly capped so no vehicle front can penetrate another's rear.
    // =========================================================================================

    // Robust lateral (Y-axis) overlap check with safety margin across all vehicle and rider widths
    function hasLateralOverlap(y1: number, d1: number, y2: number, d2: number, margin = 1.2): boolean {
      return y1 < y2 + d2 + margin && y1 + d1 > y2 - margin;
    }

    // Comprehensive safety buffers based on vehicle classification and dynamic speeds
    function getSafetyBuffer(A: RoadObstacle, B?: RoadObstacle): { minStopGap: number; followBuffer: number } {
      let minStopGap = 6.5;
      if (A.type === 'bike' || A.type === 'scooter') {
        minStopGap = 4.5;
      } else if (A.type === 'etsBus' || A.type === 'firetruck') {
        minStopGap = 9.5;
      } else if (A.type === 'boxTruck' || A.type === 'deliveryVan') {
        minStopGap = 7.5;
      } else if (A.type === 'police' || A.isEmergency) {
        minStopGap = 7.0;
      } else {
        minStopGap = 6.5;
      }

      // Vehicles following cyclists or scooters provide extra courtesy safety buffer
      if (B && (B.type === 'bike' || B.type === 'scooter') && A.type !== 'bike' && A.type !== 'scooter') {
        minStopGap += 2.0;
      }

      const speedA = Math.max(0, A.speed !== undefined ? A.speed : (A.baseSpeed || 0));
      const speedB = Math.max(0, B && B.speed !== undefined ? B.speed : 0);
      const closingSpeed = Math.max(0, speedA - speedB);
      const followBuffer = minStopGap + closingSpeed * 5.0 + speedA * 4.0;
      return { minStopGap, followBuffer };
    }

    // Side-swipe & blind-spot collision detection: ensures moving laterally does not collide with any vehicle or rider
    function canChangeLane(A: RoadObstacle, candidateY: number, obstacles: RoadObstacle[]): boolean {
      const minX = A.x - 10.0;
      const maxX = A.x + (A.w || 15) + 12.0;

      for (let j = 0; j < obstacles.length; j++) {
        const B = obstacles[j];
        if (A === B) continue;
        if (B.parkingState === 'parked' && A.parkingTargetSlot === B) continue;
        if (B.isStatic && A.parkingTargetSlot && Math.abs(A.parkingTargetSlot.x - B.x) < 4 && Math.abs(A.parkingTargetSlot.y - B.y) < 2) continue;

        if (hasLateralOverlap(candidateY, A.d, B.y, B.d, 1.2)) {
          // Check longitudinal proximity
          if (B.x < maxX && B.x + (B.w || 15) > minX) {
            return false; // Space in target lane is occupied!
          }
        }
      }
      return true;
    }

    // Unified forward obstacle detection & non-penetration clamping across all road entities
    function checkForwardObstacle(
      A: RoadObstacle,
      proposedSpeed: number,
      obstacles: RoadObstacle[],
      protesters: { x: number; y: number }[] = []
    ): { safeSpeed: number; targetX: number; blocking: RoadObstacle | null } {
      let targetX = A.x + proposedSpeed;
      let safeSpeed = proposedSpeed;
      let blocking: RoadObstacle | null = null;
      const aWidth = A.w || 15;

      for (let j = 0; j < obstacles.length; j++) {
        const B = obstacles[j];
        if (A === B) continue;

        // When ETS Bus is pulling into/dwelling at bus stop (x: 250-345), ignore static parked stalls outside the stop
        if (A.type === 'etsBus' && B.isStatic && (A.busStopState === 'approaching' || A.busStopState === 'dwelling')) {
          if (B.x < 240 || B.x > 350) continue;
        }

        // When a car is parallel parking, ignore its targeted empty stall
        if (A.parkingState && A.parkingState !== 'cruising' && B.isStatic) {
          if (A.parkingTargetSlot && Math.abs(A.parkingTargetSlot.x - B.x) < 4 && Math.abs(A.parkingTargetSlot.y - B.y) < 2) {
            continue;
          }
        }

        // Check lateral overlap with standard safety margin
        if (!hasLateralOverlap(A.y, A.d, B.y, B.d, 1.2)) continue;

        const bWidth = B.w || 15;

        // If B is completely behind A's rear bumper, B cannot block A
        if (B.x + bWidth <= A.x) continue;

        // If A is already further ahead of B (A's front is ahead of B's front, and B's rear is behind A's rear),
        // then B is trailing A, not blocking A
        if (A.x + aWidth >= B.x + bWidth && A.x > B.x) continue;

        const { minStopGap, followBuffer } = getSafetyBuffer(A, B);
        const gap = B.x - (A.x + aWidth);
        const maxAllowedX = B.x - aWidth - minStopGap;

        if (targetX > maxAllowedX || gap < followBuffer) {
          targetX = Math.min(targetX, maxAllowedX);

          if (gap <= minStopGap + 0.1 || targetX <= A.x + 0.02) {
            safeSpeed = 0;
            // Prevent forward penetration, clamp strictly to not exceed maxAllowedX or current A.x
            targetX = Math.min(A.x, maxAllowedX);
          } else {
            // Smooth progressive deceleration as vehicle approaches follow buffer
            const ratio = Math.max(0, Math.min(1, (gap - minStopGap) / Math.max(1, followBuffer - minStopGap)));
            const leadSpeed = Math.max(0, B.speed || 0);
            const matchedSpeed = leadSpeed * 0.8 + proposedSpeed * ratio * 0.2;
            safeSpeed = Math.min(safeSpeed, Math.max(0, matchedSpeed), Math.max(0, targetX - A.x));
          }

          blocking = B;
        }
      }

      // Protesters / pedestrians blocking road lanes
      for (let k = 0; k < protesters.length; k++) {
        const ped = protesters[k];
        if (Math.abs(A.y - ped.y) < 8.5) {
          const minStopGap = 5.0;
          const followBuffer = 14.0;
          const gap = ped.x - (A.x + aWidth);

          if (ped.x + 2 > A.x && gap < followBuffer) {
            const maxAllowedX = ped.x - aWidth - minStopGap;
            targetX = Math.min(targetX, maxAllowedX);
            if (gap <= minStopGap + 0.2 || targetX <= A.x + 0.05) {
              targetX = Math.min(A.x, maxAllowedX);
              safeSpeed = 0;
            } else {
              safeSpeed = Math.min(safeSpeed, proposedSpeed * (gap / followBuffer) * 0.5);
            }
            blocking = { x: ped.x, y: ped.y, w: 2, d: 2, type: 'protester' };
            break;
          }
        }
      }

      return { safeSpeed, targetX, blocking };
    }

    function updateVanState(
      van: DeliveryVan,
      totalParked: number,
      activeRoadProtesters: { x: number; y: number }[] = [],
      allObstacles: RoadObstacle[] = []
    ) {
      if (van.state === 'APPROACHING') {
        if (van.x > van.targetStopX - 60) {
          const occupied = isCurbsideSpotOccupied(van.targetStopX, allObstacles);
          van.targetY = occupied ? 104 : 94;
        }

        const targetY = van.targetY || 104;
        if (Math.abs(van.y - targetY) > 0.05) {
          const nextY = van.y + (targetY > van.y ? 1 : -1) * Math.min(0.35, Math.abs(targetY - van.y));
          if (canChangeLane(van, nextY, allObstacles)) {
            van.y = nextY;
          }
        } else {
          van.y = targetY;
        }

        const { safeSpeed, targetX } = checkForwardObstacle(
          van,
          van.baseSpeed,
          allObstacles,
          activeRoadProtesters
        );

        van.speed = safeSpeed;

        const distToStop = van.targetStopX - van.x;
        if (distToStop <= 1.0 || (distToStop <= 8.0 && safeSpeed < 0.08)) {
          van.x = Math.min(targetX, van.targetStopX);
          van.speed = 0;
          van.state = 'STOPPED';
          van.stopTimer = 0;

          const targetHouse = van.targetHouse % TOTAL_MIDCENTURY_HOMES;
          const houseBaseX = 8 + targetHouse * 30.5;
          const doorX = houseBaseX + 13;
          const doorY = 44;
          const walkwayX = houseBaseX + 11.5;

          // Left side of van (driver cab door facing curb/travel lane edge)
          const cabX = van.x + 14;
          const cabY = van.y >= 100 ? 102.5 : 92.5;

          van.driver.active = true;
          van.driver.x = cabX;
          van.driver.y = cabY;
          van.driver.hasPackage = true;
          van.driver.targetDoorX = doorX;
          van.driver.targetDoorY = doorY;

          // Pedestrian courier path: cab -> street curb -> boulevard -> sidewalk -> front walkway -> veranda steps -> doorstep
          van.driver.path = [
            { x: cabX, y: cabY },
            { x: cabX, y: 78 },
            { x: walkwayX, y: 74 },
            { x: walkwayX, y: 51 },
            { x: doorX, y: doorY }
          ];
          van.driver.pathIdx = 1;
        } else {
          van.x = targetX;
        }
      } else if (van.state === 'STOPPED') {
        van.speed = 0;
        const d = van.driver;
        if (d.path && d.pathIdx !== undefined && d.pathIdx < d.path.length) {
          const target = d.path[d.pathIdx];
          const dx = target.x - d.x;
          const dy = target.y - d.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0.8) {
            d.x += (dx / dist) * 0.45;
            d.y += (dy / dist) * 0.45;
          } else {
            d.x = target.x;
            d.y = target.y;
            d.pathIdx++;
          }
        } else {
          van.state = 'AT_DOOR';
          van.stopTimer = 0;
        }
      } else if (van.state === 'AT_DOOR') {
        van.speed = 0;
        van.stopTimer++;
        
        // Delivery driver places parcel down at front door on veranda
        if (van.stopTimer === 25) {
          van.driver.hasPackage = false;

          const doorX = van.driver.targetDoorX;
          const existingParcelsAtHouse = deliveredParcels.filter(p => p.houseIndex === van.targetHouse).length;
          const pOffsetX = (existingParcelsAtHouse % 3) * 2.6 - 1.2;
          const pOffsetY = Math.floor(existingParcelsAtHouse / 3) * 1.5;

          deliveredParcels.push({
            id: `parcel_${Date.now()}_${Math.random()}`,
            houseIndex: van.targetHouse,
            x: doorX + pOffsetX,
            y: 44.5 + pOffsetY,
            z: 2.2,
            w: 2.4,
            d: 2.0,
            h: 1.6,
            color: '#d2b48c',
            deliveredAt: Date.now()
          });

          if (deliveredParcels.length > 12) {
            deliveredParcels.shift();
          }
        }

        // Driver pauses briefly after leaving parcel, then heads back to the delivery van
        if (van.stopTimer > 55) {
          van.state = 'RETURNING';
          const targetHouse = van.targetHouse % TOTAL_MIDCENTURY_HOMES;
          const houseBaseX = 8 + targetHouse * 30.5;
          const doorX = van.driver.targetDoorX;
          const doorY = van.driver.targetDoorY;
          const walkwayX = houseBaseX + 11.5;

          const cabX = van.x + 14;
          const cabY = van.y >= 100 ? 102.5 : 92.5;

          // Return pedestrian path: doorstep -> veranda steps -> front walkway -> sidewalk -> boulevard -> street curb -> cab
          van.driver.path = [
            { x: doorX, y: doorY },
            { x: walkwayX, y: 51 },
            { x: walkwayX, y: 74 },
            { x: cabX, y: 78 },
            { x: cabX, y: cabY }
          ];
          van.driver.pathIdx = 1;
        }
      } else if (van.state === 'RETURNING') {
        van.speed = 0;
        const d = van.driver;
        if (d.path && d.pathIdx !== undefined && d.pathIdx < d.path.length) {
          const target = d.path[d.pathIdx];
          const dx = target.x - d.x;
          const dy = target.y - d.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 0.8) {
            d.x += (dx / dist) * 0.45;
            d.y += (dy / dist) * 0.45;
          } else {
            d.x = target.x;
            d.y = target.y;
            d.pathIdx++;
          }
        } else {
          // Driver has returned to delivery van and gets back inside
          d.active = false;
          van.state = 'LEAVING';
          van.targetY = 104; // Merge back into travel lane
          van.stopTimer = 0;
        }
      } else if (van.state === 'LEAVING') {
        const targetY = 104;
        if (Math.abs(van.y - targetY) > 0.05) {
          const nextY = van.y + (targetY > van.y ? 1 : -1) * Math.min(0.28, Math.abs(targetY - van.y));
          if (canChangeLane(van, nextY, allObstacles)) {
            van.y = nextY;
          }
        } else {
          van.y = targetY;
        }

        const { safeSpeed, targetX } = checkForwardObstacle(
          van,
          van.baseSpeed,
          allObstacles,
          activeRoadProtesters
        );

        van.speed = safeSpeed;
        van.x = targetX;

        if (van.x > blockLength + 120) {
          van.state = 'COOLDOWN';
          van.stopTimer = 0;
        }
      } else if (van.state === 'COOLDOWN') {
        van.stopTimer++;
        if (van.stopTimer > 150) {
          const newHouse = (van.targetHouse + 1) % TOTAL_MIDCENTURY_HOMES;
          van.targetHouse = newHouse;
          const nextHouseBaseX = 8 + newHouse * 30.5;
          const nextDoorX = nextHouseBaseX + 13;

          van.targetStopX = getTargetStopX(newHouse);
          van.driver.targetDoorX = nextDoorX;
          van.driver.targetDoorY = 44;

          let spawnX = -140 - Math.random() * 80;
          for (let j = 0; j < allObstacles.length; j++) {
            const obs = allObstacles[j];
            if (obs === van) continue;
            if (obs.x < 0 && Math.abs(obs.y - 104) < 10) {
              if (obs.x > spawnX - van.w - 20 && obs.x < spawnX + van.w + 20) {
                spawnX = Math.min(spawnX, obs.x - van.w - 25);
              }
            }
          }

          van.x = spawnX;
          van.y = 104;
          van.baseY = 104;
          van.targetY = 104;
          van.speed = van.baseSpeed;
          van.state = 'APPROACHING';
        }
      }
    }

    const allRoadObstacles: RoadObstacle[] = [];
    let lastReshuffleTrigger = reshuffleTriggerRef.current;
    let busStopPassengerCount = 2; // 2 passengers waiting initially
    let busStopPassengerRespawnTimer = 0;
    let lastReportedGarageOccupied = -1;

    // Pedestrians walking from their successfully parallel parked car to their house
    const parkedWalkers: Array<{
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      color: string;
      active: boolean;
      state: 'curb_to_sidewalk' | 'sidewalk_to_door' | 'entered';
    }> = [];

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Check reshuffle signal
      if (reshuffleTriggerRef.current !== lastReshuffleTrigger) {
        lastReshuffleTrigger = reshuffleTriggerRef.current;
        shuffleSlots();
      }

      // Check if driveway capacity changed
      if (currentDrivewayCap !== configRef.current.drivewayCapacity) {
        currentDrivewayCap = configRef.current.drivewayCapacity;
        rebuildResidentsAndFlowers();
        houseCarAssignments = generateHouseCarAssignments(currentDrivewayCap);
        activeIndices = Array.from({ length: houseCarAssignments.length }, (_, i) => i);
        shuffleSlots();
        renderGroundBackground();
        renderHousesBackground();
      }

      const simTotalDwellings = TOTAL_MIDCENTURY_HOMES;

      const activeHouseholdCars = Math.round(configRef.current.householdCarsPerHome * simTotalDwellings);
      const activeVisitorCars = Math.round(configRef.current.visitorPassesPerHome * simTotalDwellings);
      const totalContinuousCars = (configRef.current.householdCarsPerHome + configRef.current.visitorPassesPerHome) * simTotalDwellings;
      const totalParkedCars = Math.round(totalContinuousCars);
      const totalToRender = Math.min(houseCarAssignments.length, totalParkedCars);

      let occupiedGaragesNow = 0;
      for (let i = 0; i < totalToRender; i++) {
        const car = houseCarAssignments[activeIndices[i]];
        if (car && car.isGarage) {
          occupiedGaragesNow++;
        }
      }
      if (occupiedGaragesNow !== lastReportedGarageOccupied) {
        lastReportedGarageOccupied = occupiedGaragesNow;
        setOccupiedGaragesCount(occupiedGaragesNow);
      }

      const weeklyDeliveries = Math.round(configRef.current.deliveriesPerHomePerWeek * simTotalDwellings);
      updateDeliveryPool(weeklyDeliveries);

      // Off-street garage capacity: in detached garages & rear parking pads backing onto gravel back alley
      const totalGarageSpots = Math.min(2, Math.max(1, currentDrivewayCap)) * simTotalDwellings;
      const calculatedDemand = Math.max(0, totalContinuousCars - totalGarageSpots);
      const curbsideDemand = propCurbsideDemandRef.current !== undefined
        ? propCurbsideDemandRef.current
        : calculatedDemand;
      const currentLegalCurbsideStalls = propCurbsideStallsCapacityRef.current !== undefined
        ? propCurbsideStallsCapacityRef.current
        : BASE_LEGAL_CURBSIDE_STALLS;
      const gaugePercent = propCurbsidePctRef.current !== undefined
        ? propCurbsidePctRef.current
        : (curbsideDemand / currentLegalCurbsideStalls) * 100;

      const roundedDemand = Math.round(curbsideDemand);
      if (roundedDemand !== lastReportedDemand) {
        lastReportedDemand = roundedDemand;
        setCurbsideDemandCount(roundedDemand);
      }
      if (currentLegalCurbsideStalls !== lastReportedStallsCapacity) {
        lastReportedStallsCapacity = currentLegalCurbsideStalls;
        setCurbsideStallsCapacity(currentLegalCurbsideStalls);
      }
      const roundedPct = Math.round(gaugePercent);
      if (roundedPct !== lastReportedPct) {
        lastReportedPct = roundedPct;
        setCurbsidePct(roundedPct);
      }
      drawGauge(curbsideDemand, currentLegalCurbsideStalls);

      const targetOccupiedGarages = propOccupiedGaragesRef.current !== undefined
        ? propOccupiedGaragesRef.current
        : occupiedGaragesNow;
      if (targetOccupiedGarages !== lastReportedGarageOccupied) {
        lastReportedGarageOccupied = targetOccupiedGarages;
        setOccupiedGaragesCount(targetOccupiedGarages);
      }

      // Cruising Traffic Management: As parking fills up on the street, traffic increases as more cars circle looking for parking
      let targetCirclingCount = propCirclingCarCountRef.current !== undefined
        ? propCirclingCarCountRef.current
        : (curbsideDemand >= 20 ? 5 : curbsideDemand >= 17 ? 4 : curbsideDemand >= 15 ? 2 : curbsideDemand >= 13 ? 1 : 0);

      if (configRef.current.cruisingTrafficLevel === 'high') {
        targetCirclingCount = Math.min(5, targetCirclingCount + 1);
      } else if (configRef.current.cruisingTrafficLevel === 'low') {
        targetCirclingCount = Math.max(0, targetCirclingCount - 1);
      }

      // Count currently active cruising vehicles
      const currentCirclingVehicles = activeVehicles.filter(v => v.isCircling && !v.shouldRetire);
      const currentCirclingCount = currentCirclingVehicles.length;

      if (currentCirclingCount < targetCirclingCount) {
        const candidate = cruisingVehiclePool.find(p => !activeVehicles.includes(p));
        if (candidate) {
          let spawnX = -80 - Math.random() * 50;
          for (const v of activeVehicles) {
            if (Math.abs(v.y - (candidate.baseY || 110)) < 8 && v.x < 0 && v.x > spawnX - candidate.w - 18) {
              spawnX = Math.min(spawnX, v.x - candidate.w - 18);
            }
          }
          candidate.x = spawnX;
          candidate.y = candidate.baseY || 110;
          candidate.targetY = candidate.baseY || 110;
          candidate.speed = candidate.baseSpeed || 0.7;
          candidate.circlingLap = 1;
          candidate.searchingBubbleTimer = 75;
          candidate.searchScanTimer = Math.floor(Math.random() * 100);
          candidate.shouldRetire = false;
          candidate.isBurning = false;
          activeVehicles.push(candidate);
        }
      } else if (currentCirclingCount > targetCirclingCount) {
        let excess = currentCirclingCount - targetCirclingCount;
        for (let i = activeVehicles.length - 1; i >= 0 && excess > 0; i--) {
          const v = activeVehicles[i];
          if (v.isCircling && !v.shouldRetire) {
            v.shouldRetire = true;
            excess--;
          }
        }
      }

      if (currentCirclingCount !== lastReportedCircling) {
        lastReportedCircling = currentCirclingCount;
        setCirclingCarCount(currentCirclingCount);
      }

      // ETS Transit Frequency: When there are greater than 10 dwellings on the street,
      // transit demand triggers higher ETS bus frequency (extra bus running in rotation)
      const hasHighTransitDemand = simTotalDwellings > 10;
      const isExtraBusActive = activeVehicles.includes(extraEtsBus);

      if (hasHighTransitDemand && !isExtraBusActive) {
        extraEtsBus.x = -360 - Math.random() * 80;
        extraEtsBus.y = 110;
        extraEtsBus.baseY = 110;
        extraEtsBus.targetY = 110;
        extraEtsBus.speed = 0.95;
        extraEtsBus.isBurning = false;
        extraEtsBus.busStopState = 'approaching';
        extraEtsBus.busDwellTimer = 0;
        extraEtsBus.searchingBubbleTimer = 90;
        activeVehicles.push(extraEtsBus);
      } else if (!hasHighTransitDemand && isExtraBusActive) {
        const extraIdx = activeVehicles.indexOf(extraEtsBus);
        if (extraIdx !== -1 && (extraEtsBus.x > blockLength + 40 || extraEtsBus.x < 0)) {
          activeVehicles.splice(extraIdx, 1);
        }
      }

      if (alarmCooldown > 0) {
        alarmCooldown -= 1 / 60;
      }

      // Riot / Vehicle Fire Invariant: ONLY cars on the road (y >= 90) can burn. Driveway cars (y < 70) NEVER burn.
      const roadCarRenderIndices: number[] = [];
      for (let i = 0; i < totalToRender; i++) {
        const car = houseCarAssignments[activeIndices[i]];
        if (car && car.y >= 90) {
          roadCarRenderIndices.push(i);
        }
      }

      // Layer 1: Ground, Road, Sidewalks, Driveways
      ctx!.drawImage(bgGroundCanvas, 0, 0);

      const activePedCount = Math.min(pedestrians.length, Math.floor(2 + totalParkedCars * 0.45));
      const activeMicroCount = Math.min(microMobility.length, Math.floor(totalParkedCars * 0.35));

      // 1. Pedestrian Movement: Peaceful Sidewalk Stroll
      const activeRoadProtesters: { x: number; y: number }[] = [];

      for (let i = 0; i < activePedCount; i++) {
        const p1 = pedestrians[i];
        if (p1.y < 71.5 || p1.y > 76.5) {
          p1.y += (73.5 - p1.y) * 0.1;
        }
        const nextX = p1.x + p1.speed;
        let collision = false;
        for (let j = 0; j < activePedCount; j++) {
          if (i === j) continue;
          const p2 = pedestrians[j];
          if (Math.abs(p1.y - p2.y) < 2) {
            if (nextX < p2.x + p2.w + 1 && nextX + p1.w + 1 > p2.x) {
              collision = true;
              break;
            }
          }
        }
        if (collision) p1.speed = -p1.speed;
        else p1.x = nextX;

        if (p1.x > blockLength + 10) p1.x = -10;
        if (p1.x < -10) p1.x = blockLength + 10;
      }

      // Collect obstacles
      allRoadObstacles.length = 0;
      for (let i = 0; i < totalToRender; i++) {
        const car = houseCarAssignments[activeIndices[i]];
        allRoadObstacles.push({
          x: car.x,
          y: car.y,
          w: car.w,
          d: car.d,
          speed: 0,
          isStatic: true,
          type: car.type
        });
      }

      for (let i = 0; i < deliveryVansList.length; i++) allRoadObstacles.push(deliveryVansList[i]);
      for (let i = 0; i < activeVehicles.length; i++) allRoadObstacles.push(activeVehicles[i]);
      for (let i = 0; i < emergencyVehicles.length; i++) allRoadObstacles.push(emergencyVehicles[i]);
      if (policeBlockageUnit.active) allRoadObstacles.push(policeTrafficCar);
      for (let i = 0; i < activeMicroCount; i++) allRoadObstacles.push(microMobility[i]);

      // Update delivery vans with complete obstacle awareness
      for (let i = 0; i < deliveryVansList.length; i++) {
        updateVanState(deliveryVansList[i], totalToRender, activeRoadProtesters, allRoadObstacles);
      }

      const staticObstacleCount = totalToRender + deliveryVansList.length;
      const roadObstacleCount = allRoadObstacles.length;

      // Road Obstacle Avoidance & Movement
      for (let i = staticObstacleCount; i < roadObstacleCount; i++) {
        const A = allRoadObstacles[i];
        if (A.speed === undefined || A.isStatic) continue;

        // Skip movement update for cars that have successfully parked at the curb
        if (A.parkingState === 'parked') {
          continue;
        }

        // Dedicated state machine controls the police blockage cruiser
        if (A === policeTrafficCar) {
          continue;
        }

        if (A.isEmergency && A.x < -100) {
          A.x = -800; // Park them
          continue;
        }

        let emergencyApproaching = false;
        if (!A.isEmergency) {
          for (let j = staticObstacleCount; j < roadObstacleCount; j++) {
            const E = allRoadObstacles[j];
            if (E.isEmergency && E.x > -150 && E.x < A.x && (A.x - E.x) < 160) {
              emergencyApproaching = true;
              break;
            }
          }
        }

        let targetLane = A.baseY || 110;
        const isCar_A = carTypes.includes(A.type);
        let isPullingOver = false;

        // =========================================================================================
        // SECTION: CIRCLING CARS & PARALLEL PARKING EVALUATION (Plain English Oversight Summary)
        // -----------------------------------------------------------------------------------------
        // Purpose: Demonstrates how drivers circle for parking and parallel park into curbside stalls.
        // 
        // Key Rules:
        // 1. Curbside Stall Scanning: Circling vehicles scan curbside stalls between x = 35 and 270.
        // 2. Spot Size Evaluation (80% vs 150%+): If a spot is less than 80% of vehicle length, the
        //    driver attempts to reverse, realizes it cannot fit without clipping, aborts, and resumes
        //    circling. If the spot is >= 150% of vehicle length, the driver smoothly completes the
        //    reverse parallel park, turns off the engine, exits the vehicle, and walks into the home.
        // 3. Realistic Driver Walkway Path: Upon successful parking, a resident pedestrian actor spawns,
        //    walks up the curb, across the boulevard, along the sidewalk, and through the front door.
        // =========================================================================================

        // Parallel parking logic for circling cars:
        // Scanning for curbside spots, evaluating spot size relative to car size:
        // - Spot < 80% car size: try to parallel park and give up
        // - Spot >= 150% car size: finish parking and walk away to house
        if (A.isCircling && !A.isBurning) {
          if (!A.parkingState || A.parkingState === 'cruising') {
            A.parkingState = 'cruising';
            // Only search while in the curbside lane and along the curbside block
            if (A.x > 35 && A.x < 270) {
              // Find all curbside parking stalls that are currently vacant
              const curbsideStalls = houseCarAssignments.filter(s => s.y >= 92 && s.y <= 96);
              const occupiedStalls = houseCarAssignments.slice(0, totalToRender);

              // Check if any other circling car is already targeting a stall
              const otherTargetedStalls = activeVehicles
                .filter(v => v !== A && v.parkingTargetSlot)
                .map(v => v.parkingTargetSlot);

              // Find candidate open stalls ahead of the car that it can scan
              for (const stall of curbsideStalls) {
                const isOccupied = occupiedStalls.some(
                  os => Math.abs(os.x - stall.x) < 4 && Math.abs(os.y - stall.y) < 2
                );
                const isTargeted = otherTargetedStalls.some(
                  ts => Math.abs(ts.x - stall.x) < 4 && Math.abs(ts.y - stall.y) < 2
                );
                if (isOccupied || isTargeted) continue;

                // Stall is open! Check if car is approaching alongside it (car front near stall front)
                const distToStall = (stall.x + stall.w) - A.x;
                if (distToStall > 0 && distToStall < 12) {
                  // Evaluate spot size relative to car size
                  // Alternate between a tight 80% spot attempt (fails & gives up) and an ample >= 150% spot (succeeds)
                  const carWidth = A.w || 15;
                  const isLargeSpot = (stall.w / carWidth >= 1.5) || ((A.circlingLap || 1) % 2 === 0);
                  const evaluatedRatio = isLargeSpot ? Math.max(1.5, stall.w / carWidth) : 0.8;

                  A.parkingTargetSlot = stall;
                  A.spaceRatio = evaluatedRatio;
                  A.parkingState = 'found_spot';
                  A.parkingTimer = 45; // Pause alongside open stall to inspect
                  A.parkingBubbleText = evaluatedRatio >= 1.5 ? 'Spot fits (150%+) - Parking' : 'Spot 80% size - Trying to park';
                  break;
                }
              }
            }
          }

          if (A.parkingState === 'found_spot') {
            // Decelerate and signal parallel parking maneuver alongside the stall
            targetLane = 104; // Pull alongside the curb stall
            isPullingOver = true;
            A.parkingTimer = (A.parkingTimer || 0) - 1;
            if (A.parkingTimer <= 0) {
              A.parkingState = 'attempting_reverse';
              A.parkingTimer = 90; // ~1.5s angle maneuver
              A.parkingBubbleText = A.spaceRatio! >= 1.5 ? 'Reverse parallel parking...' : 'Reversing into tight spot...';
            }
          } else if (A.parkingState === 'attempting_reverse') {
            // Vehicle steers into the curbside stall (y -> 94)
            targetLane = 94.0;
            isPullingOver = true;
            A.parkingTimer = (A.parkingTimer || 0) - 1;
            if (A.parkingTimer <= 0) {
              if (A.spaceRatio! < 1.5) {
                // 80% spot: too small to fit! Give up and rejoin traffic
                A.parkingState = 'giving_up';
                A.parkingTimer = 85;
                A.parkingBubbleText = 'Too tight (80%)! Giving up';
              } else {
                // 150%+ spot: finish parking into the stall
                A.parkingState = 'docking';
                A.parkingTimer = 50;
                A.parkingBubbleText = 'Parked!';
              }
            }
          } else if (A.parkingState === 'giving_up') {
            // Steer back out of stall into main travel lane (y = 110 or 124)
            targetLane = A.baseY || 110;
            A.parkingTimer = (A.parkingTimer || 0) - 1;
            if (A.parkingTimer <= 0) {
              // Reset back to cruising traffic
              A.parkingState = 'cruising';
              A.parkingTargetSlot = null;
              A.parkingBubbleText = undefined;
              A.searchScanTimer = 0; // Cooldown before next search attempt
            }
          } else if (A.parkingState === 'docking') {
            // Settle precisely into curbside stall position
            if (A.parkingTargetSlot) {
              A.x = A.parkingTargetSlot.x;
              A.y = A.parkingTargetSlot.y;
            } else {
              A.y = 94.0;
            }
            A.parkingTimer = (A.parkingTimer || 0) - 1;
            if (A.parkingTimer <= 0) {
              // Successfully parallel parked!
              A.parkingState = 'parked';
              A.isStatic = true;
              A.speed = 0;
              A.parkingBubbleText = undefined;
              A.searchingBubbleTimer = 0;

              // Driver exits car and walks to their house!
              const homeIndex = Math.min(TOTAL_MIDCENTURY_HOMES - 1, Math.max(0, Math.floor((A.x - 8) / 30.5)));
              const targetDoorX = 8 + homeIndex * 30.5 + 13;
              const targetDoorY = 44; // Front doorway on veranda
              parkedWalkers.push({
                x: A.x + (A.w / 2),
                y: 88, // Driver-side door at sidewalk edge
                targetX: targetDoorX,
                targetY: targetDoorY,
                color: A.color || '#005087',
                active: true,
                state: 'curb_to_sidewalk'
              });
            }
          }
        }

        // =========================================================================================
        // SECTION: ETS PUBLIC TRANSIT & CURBSIDE DWELLING (Plain English Oversight Summary)
        // -----------------------------------------------------------------------------------------
        // Purpose: Simulates Edmonton Transit Service (ETS) public transit serving higher density blocks.
        // 
        // Key Rules:
        // 1. Density Trigger (>11 Dwellings): A glass-paneled ETS bus shelter with bench, solar light,
        //    and transit route flag appears at the boulevard when infill density exceeds 11 homes.
        // 2. Curbside Pull-In & Boarding: Approaching ETS buses steer into the curbside zone (y = 94.5),
        //    decelerate to a stop, open doors, and commuters visibly step from the shelter into the bus.
        // 3. Safe Re-entry: The bus signals, checks lane clearance with blind-spot protection, and merges
        //    smoothly back into travel flow.
        // =========================================================================================

        if (emergencyApproaching) {
          targetLane = (A.baseY || 110) < 118 ? 108 : 126;
          isPullingOver = true;
        } else if (A.type === 'etsBus' && simTotalDwellings > 11 && !A.isBurning) {
          // Curbside pull-in / pull-out navigation for ETS Bus
          // When approaching or dwelling at bus stop (x: 250 - 325) with passengers, steer into curbside stall lane (y = 94.5)
          const isAtStopZone = A.x >= 250 && A.x <= 325;
          if ((A.busStopState === 'approaching' && isAtStopZone && busStopPassengerCount > 0) || A.busStopState === 'dwelling') {
            targetLane = 94.5;
            isPullingOver = true;
          } else if (A.busStopState === 'departing' || A.x > 325) {
            // Once passengers have boarded/alighted, merge back out into the standard roadway lane
            targetLane = A.baseY || 110;
          }
        } else if (!A.parkingState || A.parkingState === 'cruising') {
          let isBlockedInLane = false;
          for (let j = 0; j < roadObstacleCount; j++) {
            const B = allRoadObstacles[j];
            if (A === B || (B.speed || 0) > 0.3) continue;
            if (hasLateralOverlap(A.y, A.d, B.y, B.d, 1.2) && B.x > A.x && B.x - (A.x + (A.w || 15)) < 45) {
              isBlockedInLane = true;
              break;
            }
          }

          if (isBlockedInLane && !A.isEmergency) {
            const altLane = (A.baseY || 110) < 118 ? 124 : 110;
            let altClear = true;
            for (let j = 0; j < roadObstacleCount; j++) {
              const B = allRoadObstacles[j];
              if (A === B) continue;
              if (hasLateralOverlap(altLane, A.d, B.y, B.d, 1.2)) {
                if (B.x < A.x + (A.w || 15) + 24 && B.x + (B.w || 15) > A.x - 20) {
                  altClear = false;
                  break;
                }
              }
            }
            if (altClear) targetLane = altLane;
          }
        }

        // Yield right-hand lane to approaching emergency police cruiser
        if (policeBlockageUnit.active && policeBlockageUnit.state === 'dispatched' && !A.isEmergency) {
          if (Math.abs(A.y - 124) < 6 && A.x > policeTrafficCar.x && (A.x - policeTrafficCar.x) < 140) {
            targetLane = 110; // Shift to left lane to keep the right-hand lane clear for police
          }
        }

        const isChangingLanes = Math.abs(A.y - targetLane) > 0.05;
        if (isChangingLanes) {
          const step = A.type === 'etsBus' ? Math.min(0.28, Math.abs(targetLane - A.y)) : Math.min(0.36, Math.abs(targetLane - A.y));
          const nextY = A.y + (targetLane > A.y ? 1 : -1) * step;
          if (canChangeLane(A, nextY, allRoadObstacles)) {
            A.y = nextY;
          }
        } else {
          A.y = targetLane;
        }

        if (A.isCircling && (!A.parkingState || A.parkingState === 'cruising')) {
          A.searchScanTimer = (A.searchScanTimer || 0) + 1;
          if (A.x > 25 && A.x < 320) {
            // Every few seconds while passing street stalls, slow down to inspect open spots
            if (A.searchScanTimer > 280) {
              A.searchScanTimer = 0;
              A.searchingBubbleTimer = 75;
            }
          }
          if ((A.searchingBubbleTimer || 0) > 0) {
            A.searchingBubbleTimer!--;
          }
        }

        const isScanningSlowdown = A.isCircling && (A.searchingBubbleTimer || 0) > 20 && (!A.parkingState || A.parkingState === 'cruising');
        let assignedBaseSpeed = isScanningSlowdown
          ? Math.max(0.38, (A.baseSpeed || 0.7) * 0.65)
          : (A.baseSpeed || BASE_CAR_SPEED);

        // ETS Bus Stop Dwelling & Curbside Loading/Unloading (active if dwellings > 11 and bus shelter is present at x = 324)
        const hasBusStop = simTotalDwellings > 11;
        if (A.type === 'etsBus' && hasBusStop) {
          const stopTargetX = 308;
          if (A.busStopState === 'approaching' || !A.busStopState) {
            // Only initiate curbside pull-over stop if passengers are waiting
            if (busStopPassengerCount > 0) {
              if (A.x >= 260 && A.x < stopTargetX) {
                // Decelerate smoothly as bus steers over to the curb
                const distToStop = stopTargetX - A.x;
                assignedBaseSpeed = Math.max(0.18, (distToStop / 48) * (A.baseSpeed || 0.95));
              } else if (A.x >= stopTargetX && A.x < stopTargetX + 8) {
                // Curbside reached: initiate dwelling for boarding and alighting
                A.busStopState = 'dwelling';
                A.busDwellTimer = 180; // ~3 seconds dwell time
                assignedBaseSpeed = 0;
              }
            }
          } else if (A.busStopState === 'dwelling') {
            assignedBaseSpeed = 0;
            if ((A.busDwellTimer || 0) > 0) {
              A.busDwellTimer!--;
              // Passengers finish boarding midway through the dwell
              if (A.busDwellTimer! === 60) {
                busStopPassengerCount = 0; // Loaded onto bus
                busStopPassengerRespawnTimer = 400; // Will respawn next waiting passengers in ~6.5s
              }
              if (A.busDwellTimer! <= 0) {
                A.busStopState = 'departing';
              }
            }
          } else if (A.busStopState === 'departing') {
            // Accelerate and merge back out into street traffic
            assignedBaseSpeed = (A.baseSpeed || 0.95) * 0.85;
          }
        }

        // Adjust speed for parking maneuver states
        if (A.parkingState === 'found_spot') {
          assignedBaseSpeed = 0.22;
        } else if (A.parkingState === 'attempting_reverse') {
          assignedBaseSpeed = 0.18;
        } else if (A.parkingState === 'docking') {
          assignedBaseSpeed = 0;
        } else if (A.parkingState === 'giving_up') {
          assignedBaseSpeed = 0.45;
        }

        const proposedSpeed = isPullingOver && A.type !== 'etsBus' && !A.parkingState ? Math.min(0.35, assignedBaseSpeed) : assignedBaseSpeed;

        const { safeSpeed, targetX, blocking } = checkForwardObstacle(
          A,
          proposedSpeed,
          allRoadObstacles,
          activeRoadProtesters
        );

        A.speed = safeSpeed;
        A.x = targetX;
        const blockingObstacle: RoadObstacle | null = blocking;

        // Honk and stuck logic
        if (isCar_A && A.stuckTimer !== undefined && (!A.parkingState || A.parkingState === 'cruising')) {
          const isBlockedByObstacle =
            blockingObstacle &&
            (blockingObstacle.type === 'deliveryVan' ||
              blockingObstacle.isStuckBehindVan ||
              (blockingObstacle.speed || 0) < 0.2);

          if (isBlockedByObstacle && A.speed < 0.15) {
            A.isStuckBehindVan = true;
            A.stuckTimer += 1 / 60;
            if (A.stuckTimer >= 1.8 && A.stuckTimer < 18.0) {
              if ((A.honkCooldown || 0) <= 0) {
                playHonk(A.type);
                A.honkBubbleTimer = 45;
                A.honkCooldown = 2.0 + Math.random();
              }
            }
          } else {
            A.isStuckBehindVan = false;
            A.stuckTimer = 0;
          }

          if ((A.honkCooldown || 0) > 0) A.honkCooldown! -= 1 / 60;
          if ((A.honkBubbleTimer || 0) > 0) A.honkBubbleTimer!--;
        }

        if (A.x > blockLength + 80) {
          if (A.isEmergency) {
            A.x = -800;
            continue;
          }

          // If vehicle was marked to retire because street parking cleared up, exit from active list
          if (A.isCircling && A.shouldRetire) {
            A.shouldRetire = false;
            const idx = activeVehicles.indexOf(A);
            if (idx !== -1) {
              activeVehicles.splice(idx, 1);
            }
            continue;
          }

          // If circling vehicle reached end of block without finding a spot, circle the block!
          if (A.isCircling) {
            A.circlingLap = (A.circlingLap || 1) + 1;
            A.searchingBubbleTimer = 85; // Announce lap
            // Reset parking state for fresh search on next lap
            A.parkingState = 'cruising';
            A.parkingTargetSlot = null;
            A.parkingBubbleText = undefined;
            // Switch lane between laps to search both sides of the street
            A.baseY = A.baseY === 110 ? 124 : 110;
          }

          let respawnX = -70;
          for (let j = 0; j < roadObstacleCount; j++) {
            const B = allRoadObstacles[j];
            if (A === B) continue;
            if (hasLateralOverlap(A.y, A.d, B.y, B.d, 1.2)) {
              if (B.x <= 35 && B.x >= respawnX - (A.w || 15) - 20) {
                respawnX = Math.min(respawnX, B.x - (A.w || 15) - 25);
              }
            }
          }
          A.x = respawnX;
          A.y = A.baseY || 110;
          A.targetY = A.baseY || 110;
          A.speed = A.baseSpeed || BASE_CAR_SPEED;
          if (A.type === 'etsBus') {
            A.busStopState = 'approaching';
            A.busDwellTimer = 0;
          }
          if (A.stuckTimer !== undefined) {
            A.stuckTimer = 0;
            A.honkCooldown = 0;
            A.honkBubbleTimer = 0;
            A.isStuckBehindVan = false;
          }
        }
      }

      // --- Police Traffic Clearance Response for Blockages (>20s) ---
      policeResponseCooldown = Math.max(0, policeResponseCooldown - 1 / 60);

      // Evaluate whether travel lanes are stuck:
      let lane1Stopped = false;
      let lane2Stopped = false;
      let leadStopped1: RoadObstacle | null = null;
      let leadStopped2: RoadObstacle | null = null;
      let maxStuckTime = 0;

      // 1. Check delivery vans
      for (let j = 0; j < deliveryVansList.length; j++) {
        const v = deliveryVansList[j];
        if (v.x >= 15 && v.x <= blockLength - 10 && (v.state === 'STOPPED' || v.state === 'AT_DOOR' || v.state === 'RETURNING') && (v.speed || 0) < 0.2) {
          if (v.y < 118) {
            lane1Stopped = true;
            if (!leadStopped1 || v.x > leadStopped1.x) leadStopped1 = v;
          } else {
            lane2Stopped = true;
            if (!leadStopped2 || v.x > leadStopped2.x) leadStopped2 = v;
          }
        }
      }

      // 2. Check active road vehicles
      for (let j = 0; j < activeVehicles.length; j++) {
        const v = activeVehicles[j];
        if (v.x >= 15 && v.x <= blockLength - 10 && v.parkingState !== 'parked') {
          if (v.type === 'etsBus' && v.busStopState === 'dwelling' && (v.busDwellTimer || 0) > 0) {
            continue; // Normal brief transit stop
          }
          if ((v.stuckTimer || 0) > maxStuckTime) {
            maxStuckTime = v.stuckTimer || 0;
          }
          if ((v.speed || 0) < 0.2) {
            if (v.y < 118) {
              lane1Stopped = true;
              if (!leadStopped1 || v.x > leadStopped1.x) leadStopped1 = v;
            } else {
              lane2Stopped = true;
              if (!leadStopped2 || v.x > leadStopped2.x) leadStopped2 = v;
            }
          }
        }
      }

      if (lane1Stopped) {
        laneNorthStuckTimer += 1 / 60;
      } else {
        laneNorthStuckTimer = Math.max(0, laneNorthStuckTimer - 2 / 60);
      }

      if (lane2Stopped) {
        laneSouthStuckTimer += 1 / 60;
      } else {
        laneSouthStuckTimer = Math.max(0, laneSouthStuckTimer - 2 / 60);
      }

      const currentMaxStuck = Math.max(laneNorthStuckTimer, laneSouthStuckTimer, maxStuckTime);
      if (Math.floor(currentMaxStuck) !== Math.floor(lastReportedLaneStuckSeconds)) {
        lastReportedLaneStuckSeconds = currentMaxStuck;
        setLaneStuckSeconds(Math.min(20, Math.floor(currentMaxStuck)));
      }

      // Trigger condition: a lane of traffic is stuck for more than 20 seconds
      if ((laneNorthStuckTimer >= 20.0 || laneSouthStuckTimer >= 20.0 || maxStuckTime >= 20.0) && !policeBlockageUnit.active && policeResponseCooldown <= 0) {
        const isNorth = laneNorthStuckTimer >= 20.0 || (laneNorthStuckTimer >= laneSouthStuckTimer);
        policeBlockageUnit.active = true;
        policeBlockageUnit.state = 'dispatched';
        policeBlockageUnit.blockedLane = isNorth ? 'north' : 'south';
        policeBlockageUnit.targetLaneY = isNorth ? 110 : 124;
        const leadObstacle = isNorth ? leadStopped1 : leadStopped2;
        policeBlockageUnit.targetBlockageX = leadObstacle ? leadObstacle.x : (isNorth ? 150 : 200);
        policeBlockageUnit.stageTimer = 0;
        policeBlockageUnit.sirenSoundTimer = 0;
        policeBlockageUnit.bubbleText = '🚨 EPS: Taking right hand lane to traffic blockage!';

        // The police cruiser takes the right hand lane (y = 124) to get to the scene of the traffic blockage
        policeTrafficCar.x = -130;
        policeTrafficCar.y = 124;
        policeTrafficCar.baseY = 124;
        policeTrafficCar.targetY = 124;
        policeTrafficCar.baseSpeed = 2.8;
        policeTrafficCar.speed = 2.8;
        policeTrafficCar.isEmergency = true;
        policeTrafficCar.policeBubbleText = policeBlockageUnit.bubbleText;

        policeOfficerPed.active = false;
        setIsPoliceTrafficActive(true);
        playPoliceSirenSoundRef.current('wail');
      }

      // Update Police Blockage Unit State Machine
      if (policeBlockageUnit.active) {
        if (policeBlockageUnit.state === 'dispatched') {
          policeBlockageUnit.sirenSoundTimer++;
          if (policeBlockageUnit.sirenSoundTimer % 38 === 0) {
            playPoliceSirenSoundRef.current('wail');
          }

          // Cruiser drives down the right hand lane (y = 124) to the blockage
          policeTrafficCar.y = 124;
          policeTrafficCar.targetY = 124;

          const isBlockedNorth = policeBlockageUnit.blockedLane === 'north';
          // In the right hand lane, pull up alongside north-lane blockages, or directly behind right-lane blockages
          const stopX = Math.max(20, policeBlockageUnit.targetBlockageX - (isBlockedNorth ? 10 : 22));
          if (policeTrafficCar.x < stopX) {
            const dist = stopX - policeTrafficCar.x;
            const desiredSpeed = dist < 45 ? Math.max(0.35, dist * 0.1) : (policeTrafficCar.baseSpeed || 2.8);
            const { safeSpeed, targetX } = checkForwardObstacle(
              policeTrafficCar,
              desiredSpeed,
              allRoadObstacles,
              activeRoadProtesters
            );
            policeTrafficCar.speed = safeSpeed;
            policeTrafficCar.x = Math.min(targetX, stopX);
            if (policeTrafficCar.x >= stopX - 0.5) {
              policeTrafficCar.x = stopX;
              policeTrafficCar.speed = 0;
              policeBlockageUnit.state = 'investigating';
              policeBlockageUnit.stageTimer = 160;
              policeBlockageUnit.bubbleText = '🚨 EPS: Investigating scene of blockage...';
              policeTrafficCar.policeBubbleText = policeBlockageUnit.bubbleText;
              playPoliceSirenSoundRef.current('chirp');

              policeOfficerPed.active = true;
              policeOfficerPed.x = policeTrafficCar.x + 8;
              policeOfficerPed.y = 117;
            }
          } else {
            policeTrafficCar.x = stopX;
            policeTrafficCar.speed = 0;
            policeBlockageUnit.state = 'investigating';
            policeBlockageUnit.stageTimer = 160;
            policeBlockageUnit.bubbleText = '🚨 EPS: Investigating scene of blockage...';
            policeTrafficCar.policeBubbleText = policeBlockageUnit.bubbleText;
            playPoliceSirenSoundRef.current('chirp');

            policeOfficerPed.active = true;
            policeOfficerPed.x = policeTrafficCar.x + 8;
            // Officer steps out of cruiser into center street strip (y = 117) to direct traffic
            policeOfficerPed.y = 117;
          }
        } else if (policeBlockageUnit.state === 'investigating') {
          policeTrafficCar.speed = 0;
          policeBlockageUnit.stageTimer--;
          if (policeBlockageUnit.stageTimer <= 0) {
            policeBlockageUnit.state = 'clearing';
            policeBlockageUnit.stageTimer = 180;
            policeBlockageUnit.bubbleText = '🚨 EPS: Directing traffic — move along! Clearing blockage.';
            policeTrafficCar.policeBubbleText = policeBlockageUnit.bubbleText;
            playPoliceSirenSoundRef.current('yelp');

            // Force delivery vans to leave
            for (let j = 0; j < deliveryVansList.length; j++) {
              const van = deliveryVansList[j];
              if (van.state === 'STOPPED' || van.state === 'AT_DOOR' || van.state === 'RETURNING') {
                van.driver.active = false;
                van.driver.hasPackage = false;
                van.state = 'LEAVING';
                van.targetY = 104;
                van.baseSpeed = 1.3;
                van.speed = 1.3;
                van.x += 2.0;
              }
            }

            // Reset stalled parking attempts & release queued vehicles
            for (let j = 0; j < activeVehicles.length; j++) {
              const v = activeVehicles[j];
              if (v.parkingState === 'giving_up' || v.parkingState === 'attempting_reverse' || v.parkingState === 'found_spot') {
                v.parkingState = 'cruising';
                v.parkingTargetSlot = null;
                v.parkingBubbleText = undefined;
                v.speed = v.baseSpeed || 1.0;
              }
              // Reset queue in blocked lane
              if (Math.abs(v.y - policeBlockageUnit.targetLaneY) < 10) {
                v.stuckTimer = 0;
                v.isStuckBehindVan = false;
                if ((v.speed || 0) < 0.3) {
                  v.speed = Math.max(0.75, v.baseSpeed || 0.9);
                  v.x += 1.0;
                }
              }
            }

            laneNorthStuckTimer = 0;
            laneSouthStuckTimer = 0;
          }
        } else if (policeBlockageUnit.state === 'clearing') {
          policeTrafficCar.speed = 0;
          policeBlockageUnit.stageTimer--;

          // Keep queued vehicles accelerating freely past the scene
          for (let j = 0; j < activeVehicles.length; j++) {
            const v = activeVehicles[j];
            if (Math.abs(v.y - policeBlockageUnit.targetLaneY) < 10) {
              v.stuckTimer = 0;
              v.isStuckBehindVan = false;
              if ((v.speed || 0) < 0.4) {
                v.speed = Math.max(0.75, v.baseSpeed || 0.9);
                v.x += 0.8;
              }
            }
          }

          if (policeBlockageUnit.stageTimer === 60) {
            policeBlockageUnit.bubbleText = '✅ EPS: Lane cleared! Traffic flowing freely.';
            policeTrafficCar.policeBubbleText = policeBlockageUnit.bubbleText;
          }

          if (policeBlockageUnit.stageTimer <= 0) {
            policeBlockageUnit.state = 'resuming';
            policeOfficerPed.active = false; // Officer steps back into cruiser
            policeBlockageUnit.bubbleText = '✅ EPS: Resuming patrol down right hand lane';
            policeTrafficCar.policeBubbleText = policeBlockageUnit.bubbleText;
            policeTrafficCar.isEmergency = false;
            policeTrafficCar.baseSpeed = 1.4;
            policeTrafficCar.speed = 1.4;
            policeTrafficCar.y = 124;
            policeTrafficCar.targetY = 124;
            policeBlockageUnit.stageTimer = 90;
          }
        } else if (policeBlockageUnit.state === 'resuming') {
          policeBlockageUnit.stageTimer--;
          if (policeBlockageUnit.stageTimer <= 0) {
            policeTrafficCar.policeBubbleText = undefined;
          }
          policeTrafficCar.y = 124; // Continues in right hand lane
          const { safeSpeed, targetX } = checkForwardObstacle(
            policeTrafficCar,
            policeTrafficCar.baseSpeed || 1.4,
            allRoadObstacles,
            activeRoadProtesters
          );
          policeTrafficCar.speed = safeSpeed;
          policeTrafficCar.x = targetX;

          if (policeTrafficCar.x > blockLength + 80) {
            policeBlockageUnit.active = false;
            policeBlockageUnit.state = 'inactive';
            policeResponseCooldown = 15.0;
            setIsPoliceTrafficActive(false);
          }
        }
      }

      // Layer 2: Houses (drawn on background behind vehicles in front of them)
      ctx!.drawImage(bgHousesCanvas, 0, 0);

      // Dynamic Detached Rear Garages: Real-time Window Glow, Coach Lanterns & Occupancy Indicator Badges
      const occupiedGarages = new Map<number, { color: string; type: string }>();
      for (let i = 0; i < totalToRender; i++) {
        const assignment = houseCarAssignments[activeIndices[i]];
        if (assignment && assignment.isGarage && assignment.homeIndex !== undefined) {
          occupiedGarages.set(assignment.homeIndex, {
            color: i >= activeHouseholdCars ? '#ffffff' : assignment.color,
            type: assignment.type
          });
        }
      }

      const midCenturyLotWidth = 30.5;
      for (let h = 0; h < TOTAL_MIDCENTURY_HOMES; h++) {
        const startX = 8 + h * midCenturyLotWidth;
        const garageX = startX + 17.5;
        const garageY = 0;
        const garageW = 11.0;
        const garageD = 14.5;
        const garageWallH = 7.2;
        const garageRoofH = 3.4;
        const doorX = garageX + 1.2;
        const doorH = 5.6;
        const doorZ = 0.5;

        const isOccupied = occupiedGarages.has(h);
        const carInfo = occupiedGarages.get(h);

        // 1. Dynamic Garage Door Upper Windows
        const windowZ = doorZ + 4.2;
        const windowH = 0.95;
        for (let p = 0; p < 4; p++) {
          const px = doorX + 0.55 + p * 1.95;
          if (isOccupied) {
            // Warm glowing interior light when car is inside
            drawBlock(px, garageY + garageD + 0.18, windowZ, 1.5, 0.08, windowH, '#FEF08A', '#FDE047', '#F59E0B');
            // Subtle cross mullion
            drawBlock(px + 0.7, garageY + garageD + 0.2, windowZ, 0.12, 0.04, windowH, '#FFFFFF', '#FFFFFF', '#FFFFFF');
            drawBlock(px, garageY + garageD + 0.2, windowZ + windowH * 0.5 - 0.06, 1.5, 0.04, 0.12, '#FFFFFF', '#FFFFFF', '#FFFFFF');
          } else {
            // Cool dark reflective glass when garage is vacant
            drawBlock(px, garageY + garageD + 0.18, windowZ, 1.5, 0.08, windowH, '#334155', '#1E293B', '#0F172A');
            drawBlock(px + 0.7, garageY + garageD + 0.2, windowZ, 0.12, 0.04, windowH, '#64748B', '#475569', '#334155');
          }
        }

        // 2. Exterior Coach Light
        const lampX = garageX + 0.6;
        const lampY = garageY + garageD + 0.18;
        const lampZ = 0.5 + doorH - 0.2;
        if (isOccupied) {
          drawBlock(lampX + 0.05, lampY + 0.05, lampZ + 0.05, 0.35, 0.15, 0.35, '#FEF08A', '#FBBF24', '#D97706');
          // Soft ambient radial glow
          const lampPos = project(lampX + 0.25, lampY + 0.1, lampZ + 0.25);
          ctx!.save();
          const grad = ctx!.createRadialGradient(lampPos.x, lampPos.y, 0.5, lampPos.x, lampPos.y, 9);
          grad.addColorStop(0, 'rgba(251, 191, 36, 0.65)');
          grad.addColorStop(1, 'rgba(251, 191, 36, 0)');
          ctx!.fillStyle = grad;
          ctx!.beginPath();
          ctx!.arc(lampPos.x, lampPos.y, 9, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.restore();
        } else {
          drawBlock(lampX + 0.05, lampY + 0.05, lampZ + 0.05, 0.35, 0.15, 0.35, '#94A3B8', '#64748B', '#475569');
        }

        // 3. 2.5D Garage Occupancy Indicator Badge floating directly above the garage roof
        if (showGarageIndicatorsRef.current) {
          const badgePos = project(garageX + garageW * 0.5, garageY + garageD * 0.5, 0.5 + garageWallH + garageRoofH + 1.2);
          ctx!.save();
          if (isOccupied) {
            // HIGHLIGHT IN GREEN
            const pillW = 68;
            const pillH = 17;
            const px = badgePos.x - pillW / 2;
            const py = badgePos.y - pillH - 4;

            // Pointer tick down towards roof - Green
            ctx!.fillStyle = '#059669';
            ctx!.beginPath();
            ctx!.moveTo(badgePos.x - 4, py + pillH);
            ctx!.lineTo(badgePos.x, py + pillH + 4);
            ctx!.lineTo(badgePos.x + 4, py + pillH);
            ctx!.closePath();
            ctx!.fill();

            // Pill container - Vibrant Green
            ctx!.fillStyle = '#059669';
            ctx!.strokeStyle = '#34D399';
            ctx!.lineWidth = 1.4;
            ctx!.beginPath();
            if (ctx!.roundRect) {
              ctx!.roundRect(px, py, pillW, pillH, 8.5);
            } else {
              ctx!.rect(px, py, pillW, pillH);
            }
            ctx!.fill();
            ctx!.stroke();

            // Status dot
            ctx!.fillStyle = '#A7F3D0';
            ctx!.beginPath();
            ctx!.arc(px + 9, py + pillH / 2, 3, 0, Math.PI * 2);
            ctx!.fill();

            // Text label
            ctx!.fillStyle = '#FFFFFF';
            ctx!.font = 'bold 8.5px "Open Sans", -apple-system, sans-serif';
            ctx!.textAlign = 'left';
            ctx!.textBaseline = 'middle';
            ctx!.fillText('OCCUPIED', px + 16, py + pillH / 2 + 0.5);
          } else {
            // HIGHLIGHT IN YELLOW (if vacant highlight pill colour as yellow)
            const pillW = 56;
            const pillH = 17;
            const px = badgePos.x - pillW / 2;
            const py = badgePos.y - pillH - 4;

            // Pointer tick down towards roof - Yellow
            ctx!.fillStyle = '#FBBF24';
            ctx!.beginPath();
            ctx!.moveTo(badgePos.x - 4, py + pillH);
            ctx!.lineTo(badgePos.x, py + pillH + 4);
            ctx!.lineTo(badgePos.x + 4, py + pillH);
            ctx!.closePath();
            ctx!.fill();

            // Pill container - Vibrant Yellow
            ctx!.fillStyle = '#FBBF24';
            ctx!.strokeStyle = '#D97706';
            ctx!.lineWidth = 1.4;
            ctx!.beginPath();
            if (ctx!.roundRect) {
              ctx!.roundRect(px, py, pillW, pillH, 8.5);
            } else {
              ctx!.rect(px, py, pillW, pillH);
            }
            ctx!.fill();
            ctx!.stroke();

            // Status dot - Dark amber
            ctx!.fillStyle = '#78350F';
            ctx!.beginPath();
            ctx!.arc(px + 9, py + pillH / 2, 3, 0, Math.PI * 2);
            ctx!.fill();

            // Text label - High-contrast dark amber on bright yellow
            ctx!.fillStyle = '#78350F';
            ctx!.font = 'bold 8.5px "Open Sans", -apple-system, sans-serif';
            ctx!.textAlign = 'left';
            ctx!.textBaseline = 'middle';
            ctx!.fillText('VACANT', px + 16, py + pillH / 2 + 0.5);
          }
          ctx!.restore();
        }
      }

      // Render delivered parcels sitting at the front doors of houses
      for (let pIdx = 0; pIdx < deliveredParcels.length; pIdx++) {
        const p = deliveredParcels[pIdx];
        drawBlock(p.x, p.y, p.z, p.w, p.d, p.h, '#d2b48c', '#b89768', '#9e7a4a');
        drawBlock(p.x + p.w * 0.38, p.y, p.z + p.h, p.w * 0.24, p.d, 0.04, '#c29b68', '#b08a56', '#9f7845');
        drawBlock(p.x + 0.3, p.y + 0.3, p.z + p.h, 0.8, 0.8, 0.05, '#ffffff', '#e8e8e8', '#d0d0d0');
      }

      // Residents remain comfortably in their homes
      for (let i = 0; i < residents.length; i++) {
        const r = residents[i];
        if (r.state !== 'inside') {
          const dx = r.homeX - r.x;
          const dy = 35 - r.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 1.0) {
            r.x += (dx / dist) * 0.5;
            r.y += (dy / dist) * 0.5;
          } else {
            r.x = r.homeX;
            r.y = 35;
            r.state = 'inside';
          }
        }
      }
      // =========================================================================================
      // SECTION: PAINTER'S ALGORITHM VISUAL DEPTH SORTING (Plain English Oversight Summary)
      // -----------------------------------------------------------------------------------------
      // Purpose: Ensures visual realism on an isometric 2.5D display. Objects further back
      // (higher on screen or further left) are drawn first, and objects in front are drawn on top.
      // 
      // Key Rules:
      // 1. Unified Queue: Consolidates 10 distinct entity types (parked cars, delivery vans,
      //    emergency vehicles, cruising traffic, cyclists, scooter riders, pedestrians, bus shelters,
      //    transit riders, and walking homeowners) into a single processing list.
      // 2. Exact Depth Key: Computes (x + w * 0.75) + (y + d) * 1.15 to order objects accurately.
      // 3. Occlusion Integrity: Eliminates flickering, ghosting, or cars rendering inside buildings/shelters.
      // =========================================================================================

      // Layer 3: Unified Painter's Algorithm Depth-Ordered Render Queue
      // Computes exact 2.5D isometric depth key: (x + w * 0.75) + (y + d) * 1.15
      // Guarantees all vehicles, trucks, delivery vans, police cars, fire trucks, cyclists, scooter riders, and pedestrians render in pristine isometric layer order
      function getIsometricDepthKey(x: number, y: number, w = 15, d = 7): number {
        return (x + w * 0.75) + (y + d) * 1.15;
      }

      const renderQueue: any[] = [];

      // 1. Static and parked household vehicles (outdoor curbside stalls and outdoor gravel/concrete pads)
      const curbsideStalls = houseCarAssignments.filter(c => !c.isGarage && c.y === 94);
      const drivewayPads = houseCarAssignments.filter(c => !c.isGarage && c.y < 50);

      // Render exactly the number of curbside cars that corresponds to curbsideDemand (up to 16 stalls)
      const curbsideCountToRender = Math.min(curbsideStalls.length, Math.max(0, Math.round(curbsideDemand)));
      for (let s = 0; s < curbsideCountToRender; s++) {
        const car = curbsideStalls[s];
        if (!car) continue;
        const carColor = s >= Math.round(curbsideCountToRender * 0.7) ? '#F8FAFC' : car.color;
        const w = car.w || 15;
        const d = car.d || 7;
        renderQueue.push({
          ...car,
          color: carColor,
          isFlipped: false,
          w,
          d,
          depthKey: getIsometricDepthKey(car.x, car.y, w, d)
        });
      }

      // Render outdoor driveway pad parked cars
      const padCarsToRender = Math.min(drivewayPads.length, Math.max(0, activeHouseholdCars - targetOccupiedGarages));
      for (let p = 0; p < padCarsToRender; p++) {
        const car = drivewayPads[p];
        if (!car) continue;
        const w = car.w || 15;
        const d = car.d || 7;
        renderQueue.push({
          ...car,
          color: car.color,
          isFlipped: false,
          w,
          d,
          depthKey: getIsometricDepthKey(car.x, car.y, w, d)
        });
      }

      // 2. Delivery vans and active delivery drivers
      for (let i = 0; i < deliveryVansList.length; i++) {
        const van = deliveryVansList[i];
        renderQueue.push({
          ...van,
          color: van.color || '#FF5500',
          isFlipped: false,
          w: 21,
          d: 8,
          state: van.state,
          depthKey: getIsometricDepthKey(van.x, van.y, 21, 8)
        });
        if (van.driver.active) {
          renderQueue.push({
            type: 'deliveryDriver',
            x: van.driver.x,
            y: van.driver.y,
            w: 2,
            d: 2,
            hasPackage: van.driver.hasPackage,
            depthKey: getIsometricDepthKey(van.driver.x, van.driver.y, 2, 2)
          });
        }
      }

      // 3. Emergency response vehicles (police cruisers & fire trucks)
      for (let i = 0; i < emergencyVehicles.length; i++) {
        const v = emergencyVehicles[i];
        const w = v.w || (v.type === 'firetruck' ? 28 : 15);
        const d = v.d || (v.type === 'firetruck' ? 9 : 7);
        renderQueue.push({
          ...v,
          color: v.color || '#ffffff',
          isFlipped: false,
          w,
          d,
          depthKey: getIsometricDepthKey(v.x, v.y, w, d)
        });
      }

      // 4. Dedicated EPS Police Traffic Blockage Cruiser
      if (policeBlockageUnit.active) {
        renderQueue.push({
          ...policeTrafficCar,
          color: '#ffffff',
          isFlipped: false,
          w: 15,
          d: 7,
          policeBubbleText: policeTrafficCar.policeBubbleText,
          depthKey: getIsometricDepthKey(policeTrafficCar.x, policeTrafficCar.y, 15, 7)
        });
      }

      // 5. EPS Police Officer directing traffic at scene of blockage
      if (policeBlockageUnit.active && policeOfficerPed.active) {
        renderQueue.push({
          type: 'policeOfficer',
          x: policeOfficerPed.x,
          y: policeOfficerPed.y,
          w: 2,
          d: 2,
          depthKey: getIsometricDepthKey(policeOfficerPed.x, policeOfficerPed.y, 2, 2)
        });
      }

      // 6. Active cruising and through-traffic vehicles (sedans, SUVs, pickups, box trucks, ETS buses)
      for (let i = 0; i < activeVehicles.length; i++) {
        const v = activeVehicles[i];
        const w = v.w || 15;
        const d = v.d || 7;
        renderQueue.push({
          ...v,
          color: v.color || '#0081BC',
          isFlipped: false,
          w,
          d,
          honkBubbleTimer: v.honkBubbleTimer,
          isCircling: v.isCircling,
          circlingLap: v.circlingLap,
          searchingBubbleTimer: v.searchingBubbleTimer,
          busStopState: v.busStopState,
          isExtraBus: v.isExtraBus,
          parkingState: v.parkingState,
          parkingBubbleText: v.parkingBubbleText,
          depthKey: getIsometricDepthKey(v.x, v.y, w, d)
        });
      }

      // 7. Micro-mobility traffic: Cyclists and Scooter Riders
      for (let i = 0; i < activeMicroCount; i++) {
        const mm = microMobility[i];
        const w = mm.w || (mm.type === 'bike' ? 8 : 7);
        const d = mm.d || 4;
        renderQueue.push({
          ...mm,
          w,
          d,
          depthKey: getIsometricDepthKey(mm.x, mm.y, w, d)
        });
      }

      // 8. Public pedestrians walking along the sidewalk
      for (let i = 0; i < activePedCount; i++) {
        const p = pedestrians[i];
        renderQueue.push({
          type: 'pedestrian',
          x: p.x,
          y: p.y,
          w: 2,
          d: 2,
          color: p.color,
          pose: 'normal',
          isRecording: false,
          id: p.id,
          depthKey: getIsometricDepthKey(p.x, p.y, 2, 2)
        });
      }

      // 9. ETS Bus Stop Shelter & Waiting/Boarding Passengers
      const hasBusStopShelter = simTotalDwellings > 11;
      if (hasBusStopShelter) {
        if (busStopPassengerRespawnTimer > 0) {
          busStopPassengerRespawnTimer--;
          if (busStopPassengerRespawnTimer === 0) {
            busStopPassengerCount = 2;
          }
        }

        renderQueue.push({
          type: 'busStopShelter',
          x: 324,
          y: 80.5,
          w: 20,
          d: 9.5,
          depthKey: getIsometricDepthKey(324, 80.5, 20, 9.5)
        });

        const dwellingBus = activeVehicles.find(v => v.type === 'etsBus' && v.busStopState === 'dwelling');
        if (dwellingBus) {
          const dwellLeft = dwellingBus.busDwellTimer || 0;
          const boardProgress = Math.min(1, Math.max(0, (180 - dwellLeft) / 110));
          if (dwellLeft > 70) {
            const p1X = 330 + (320 - 330) * boardProgress;
            const p1Y = 83.5 + (90.5 - 83.5) * boardProgress;
            renderQueue.push({
              type: 'busPassenger',
              x: p1X,
              y: p1Y,
              w: 2,
              d: 2,
              color: '#005087',
              depthKey: getIsometricDepthKey(p1X, p1Y, 2, 2)
            });

            const p2X = 341 + (326 - 341) * boardProgress;
            const p2Y = 88.0 + (91.0 - 88.0) * boardProgress;
            renderQueue.push({
              type: 'busPassenger',
              x: p2X,
              y: p2Y,
              w: 2,
              d: 2,
              color: '#0284c7',
              depthKey: getIsometricDepthKey(p2X, p2Y, 2, 2)
            });
          }
        } else if (busStopPassengerCount > 0) {
          renderQueue.push({
            type: 'busPassenger',
            x: 330,
            y: 83.5,
            w: 2,
            d: 2,
            color: '#005087',
            depthKey: getIsometricDepthKey(330, 83.5, 2, 2)
          });
          if (busStopPassengerCount > 1) {
            renderQueue.push({
              type: 'busPassenger',
              x: 341,
              y: 88.0,
              w: 2,
              d: 2,
              color: '#0284c7',
              depthKey: getIsometricDepthKey(341, 88.0, 2, 2)
            });
          }
        }
      }

      // 10. Update & include residents walking from parked cars to house doorways
      for (let i = parkedWalkers.length - 1; i >= 0; i--) {
        const pw = parkedWalkers[i];
        if (!pw.active) {
          parkedWalkers.splice(i, 1);
          continue;
        }

        if (pw.state === 'curb_to_sidewalk') {
          const treePositions = [18, 65, 110, 155, 205, 255, 305, 355];
          for (let t = 0; t < treePositions.length; t++) {
            const tX = treePositions[t];
            if (Math.abs(pw.x - tX) < 4.5 && pw.y > 77 && pw.y < 89) {
              pw.x += (pw.x < tX ? -0.4 : 0.4);
            }
          }
          pw.y -= 0.35;
          if (pw.y <= 74) {
            pw.y = 74;
            pw.state = 'sidewalk_to_door';
          }
        } else if (pw.state === 'sidewalk_to_door') {
          const dx = pw.targetX - pw.x;
          if (Math.abs(dx) > 0.8) {
            pw.x += Math.sign(dx) * 0.45;
          } else {
            pw.x = pw.targetX;
            pw.y -= 0.4;
            if (pw.y <= pw.targetY) {
              pw.state = 'entered';
              pw.active = false;
            }
          }
        }

        if (pw.active) {
          renderQueue.push({
            type: 'parkedWalker',
            x: pw.x,
            y: pw.y,
            w: 2,
            d: 2,
            color: pw.color,
            depthKey: getIsometricDepthKey(pw.x, pw.y, 2, 2)
          });
        } else {
          parkedWalkers.splice(i, 1);
        }
      }

      // Sort entire scene strictly from back to front by isometric depth key
      renderQueue.sort((a, b) => a.depthKey - b.depthKey);

      // Render all items in exact depth order
      for (const item of renderQueue) {
        if (item.type === 'busStopShelter') {
          drawBusStopShelter(item.x, item.y);
        } else if (item.type === 'policeOfficer') {
          drawPedestrian(item.x, item.y, 0, '#002B49', 'officer');
        } else if (item.type === 'pedestrian') {
          drawPedestrian(item.x, item.y, 0, item.color, item.pose);
        } else if (item.type === 'parkedWalker' || item.type === 'busPassenger') {
          drawPedestrian(item.x, item.y, 0, item.color, 'normal');
        } else if (item.type === 'bike') {
          drawCyclist(item.x, item.y, 0, item.color);
        } else if (item.type === 'scooter') {
          drawScooter(item.x, item.y, 0, item.color);
        } else if (item.type === 'deliveryDriver') {
          drawPedestrian(item.x, item.y, 0, '#009A44');
          if (item.hasPackage) {
            drawBlock(item.x - 0.4, item.y - 0.8, 2.6, 2.0, 1.6, 1.4, '#d2b48c', '#b89768', '#9e7a4a');
            drawBlock(item.x + 0.2, item.y - 0.8, 4.0, 0.5, 1.6, 0.04, '#c29b68', '#b08a56', '#9f7845');
            drawBlock(item.x - 0.2, item.y - 0.6, 4.0, 0.7, 0.7, 0.05, '#ffffff', '#e8e8e8', '#d0d0d0');
          }
        } else {
          drawVehicle(item.x, item.y, 0, item.type, item.color, false, item.state);

          if (item.policeBubbleText) {
            drawPoliceBubble(item.x, item.y, 0, item.policeBubbleText);
          } else if (item.honkBubbleTimer && item.honkBubbleTimer > 0) {
            drawHonkBubble(item.x, item.y, 0);
          } else if (item.parkingBubbleText && item.parkingState !== 'parked') {
            const status = item.parkingState === 'giving_up' 
              ? 'giveup' 
              : item.parkingState === 'docking' 
                ? 'success' 
                : 'attempt';
            drawParkingAttemptBubble(item.x, item.y, 0, item.parkingBubbleText, status);
          } else if (item.isCircling && item.searchingBubbleTimer && item.searchingBubbleTimer > 0) {
            drawCirclingBubble(item.x, item.y, 0, item.circlingLap || 1, curbsideDemand >= currentLegalCurbsideStalls);
          } else if (item.type === 'etsBus') {
            if (item.busStopState === 'dwelling') {
              drawBusBubble(item.x, item.y, 0, 'ETS Bus Stop - Boarding');
            } else if (item.isExtraBus && item.searchingBubbleTimer && item.searchingBubbleTimer > 0) {
              item.searchingBubbleTimer--;
              drawBusBubble(item.x, item.y, 0, 'Frequent ETS Service (10+ homes)');
            }
          }
        }
      }

      updateAndDrawParticles();

      // Layer 5: Trees
      ctx!.drawImage(bgTreesCanvas, 0, 0);

      animFrameId = requestAnimationFrame(animate);
    }

    handleCanvasClickRef.current = (clickX: number, clickY: number) => {
      const simDwellings = TOTAL_MIDCENTURY_HOMES;
      const totalParked = Math.min(
        houseCarAssignments.length,
        Math.round((configRef.current.householdCarsPerHome + configRef.current.visitorPassesPerHome) * simDwellings)
      );

      // Check if user clicked on any parked car
      for (let i = 0; i < totalParked; i++) {
        const car = houseCarAssignments[activeIndices[i]];
        if (car) {
          const pos = project(car.x + (car.w / 2), car.y + (car.d / 2), 3);
          if (Math.hypot(clickX - pos.x, clickY - pos.y) < 32) {
            playHonk(car.type || 'sedan');
            return;
          }
        }
      }

      // Check if user clicked on moving road traffic vehicle
      for (let v of activeVehicles) {
        const pos = project(v.x + (v.w / 2), v.y + (v.d / 2), 3);
        if (Math.hypot(clickX - pos.x, clickY - pos.y) < Math.max(32, v.w)) {
          playHonk(v.type || 'sedan');
          return;
        }
      }

      playHonk('sedan');
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [playHonk, playCriticalAlarm]);

  const totalDwellings = TOTAL_MIDCENTURY_HOMES;
  const totalLegalCurbsideStalls = TOTAL_LEGAL_CURBSIDE_STALLS;

  const activeHouseholdCars = Math.round(config.householdCarsPerHome * totalDwellings);
  const activeVisitorCars = Math.round(config.visitorPassesPerHome * totalDwellings);
  const totalWeeklyDeliveries = Math.round(config.deliveriesPerHomePerWeek * totalDwellings);

  // Notify parent of simulation live metrics for the question-overlay drawer
  useEffect(() => {
    if (onSimulationMetricsChange) {
      onSimulationMetricsChange({
        activeHouseholdCars,
        activeVisitorCars,
        totalDwellings,
        totalWeeklyDeliveries,
        circlingCarCount,
        curbsideDemandCount,
        curbsideStallsCapacity,
        curbsidePct,
        onReshuffle: handleReshuffle
      });
    }
  }, [onSimulationMetricsChange, activeHouseholdCars, activeVisitorCars, totalDwellings, totalWeeklyDeliveries, circlingCarCount, curbsideDemandCount, curbsideStallsCapacity, curbsidePct]);

  const getGaugeStatusColor = () => {
    if (curbsidePct >= 150) return 'text-[#E8552D] bg-[#E8552D]/10 border-[#E8552D]/40';
    if (curbsidePct >= 90) return 'text-[#FFC72C] bg-[#FFC72C]/10 border-[#FFC72C]/40';
    return 'text-[#009A44] bg-[#009A44]/10 border-[#009A44]/40';
  };

  // =========================================================================================
  // SECTION: HEADS-UP DISPLAY (HUD), MANUAL CONTROLS & USER INTERACTION (Plain English Oversight Summary)
  // -----------------------------------------------------------------------------------------
  // Purpose: Provides accessible, interactive controls overlaying the canvas:
  // 
  // Key Features:
  // 1. Accessibility Compliance: All interactive buttons meet WCAG 2.1 AA with minimum 44x44px touch targets.
  // 2. Curbside Dial Gauge HUD: Displays live percentage occupancy and links to the magnified inspection modal.
  // 3. Manual Sliders Drawer: Allows users and planners to test customized density, driveway capacities,
  //    and delivery volumes directly.
  // 4. Zoom & Pan Navigation: Smooth pinch-to-zoom (touch) and mousewheel zoom controls with one-click reset.
  // =========================================================================================

  return (
    <div
      ref={containerRef}
      id="simulation-view-container"
      className="relative w-full h-full min-h-0 flex items-center justify-center bg-[#193A5A] overflow-hidden select-none"
    >
      {/* 2.5D Isometric Main Stage */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-0.5 sm:p-1 overflow-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          id="cityCanvas"
          width={1200}
          height={800}
          className="w-full h-full max-h-[100%] object-contain rounded-lg shadow-2xl block cursor-crosshair origin-center"
          style={{ transform: `scale(${zoomScale})` }}
          title="Live Edmonton Multimodal Neighborhood Simulation - Click vehicles to honk"
          role="img"
          aria-label="Live 2.5D Isometric Neighborhood Simulation showing residential parking, driveways, and road traffic based on the active policy settings."
          onClick={(e) => {
            getAudioContext();
            const canvas = canvasRef.current;
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const clickX = (e.clientX - rect.left) * scaleX;
            const clickY = (e.clientY - rect.top) * scaleY;
            handleCanvasClickRef.current?.(clickX, clickY);
          }}
        >
          <p>Your browser does not support the canvas element needed to render the neighborhood simulation.</p>
        </canvas>

        {/* Top-Left Status: Emergency Alerts */}
        {isPoliceTrafficActive && (
          <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 z-30 flex flex-col items-start gap-1.5 sm:gap-2 pointer-events-none">
            <div
              id="police-traffic-status"
              className="flex items-center gap-2.5 bg-[#002B49]/95 border-l-4 border-[#3B82F6] px-3 py-1.5 sm:px-4 sm:py-2 rounded shadow-2xl backdrop-blur-sm pointer-events-none"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping shrink-0" />
              <div className="flex flex-col">
                <span className="text-white text-xs sm:text-sm font-black tracking-wide flex items-center gap-1.5 leading-tight">
                  🚨 EPS TRAFFIC INVESTIGATION
                </span>
                <span className="text-[#93C5FD] text-[10px] sm:text-xs font-semibold leading-tight">
                  Traffic blockage detected &gt;20s • Cruiser clearing lane
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Top Right HUD: Audio + Gauge + Manual Controls Toggle */}
        <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 z-20 flex flex-col items-end gap-1 sm:gap-2">
          <div className="flex items-center gap-0.5 sm:gap-1 bg-[#193A5A]/90 backdrop-blur-md border border-[#0081BC]/40 p-0.5 sm:p-1.5 rounded-md sm:rounded-lg shadow-lg">
            {/* Audio Toggle */}
            <button
              type="button"
              id="audio-toggle-btn"
              onClick={() => {
                getAudioContext();
                feedback.toggleSound();
              }}
              title={soundEnabled ? 'Mute Simulation & City Traffic Noise' : 'Enable City Traffic Ambience (5%) & SFX (15%)'}
              className={`min-h-[44px] min-w-[44px] p-2 flex items-center justify-center rounded-md transition-colors cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] ${
                soundEnabled
                  ? 'bg-[#0081BC] text-white hover:bg-[#005087]'
                  : 'bg-black/40 text-gray-400 hover:text-white'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Manual Controls Toggle */}
            <button
              type="button"
              id="manual-controls-toggle"
              onClick={() => {
                triggerFeedback('button');
                setShowControls((prev) => !prev);
              }}
              title="Toggle Manual Simulation Sliders"
              aria-expanded={showControls}
              aria-controls="manual-sliders-drawer"
              className={`min-h-[44px] min-w-[44px] px-2.5 sm:px-3 rounded-md transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] ${
                showControls
                  ? 'bg-[#0081BC] text-white'
                  : 'bg-black/40 text-gray-300 hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">Controls</span>
            </button>

            {/* Reshuffle */}
            <button
              type="button"
              id="reshuffle-sim-btn"
              onClick={() => {
                triggerFeedback('button');
                handleReshuffle();
              }}
              title="Randomize Parking Distribution"
              aria-label="Randomize Parking Distribution"
              className="min-h-[44px] min-w-[44px] p-2 rounded-md bg-black/40 text-gray-300 hover:text-white transition-colors cursor-pointer active:scale-95 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C]"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Simplified View Switcher */}
            {onToggleSimplifiedMode && (
              <button
                type="button"
                id="hud-toggle-simplified-btn"
                onClick={() => {
                  triggerFeedback('button');
                  onToggleSimplifiedMode();
                }}
                title="Switch to Simplified Static View (Low Motion)"
                aria-label="Switch to Simplified Static View"
                className="min-h-[44px] min-w-[44px] p-2 rounded-md bg-black/40 text-gray-300 hover:text-white transition-colors cursor-pointer active:scale-95 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C]"
              >
                <ZapOff className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Compact Curbside Dial Gauge - with clear legible typography and interactive magnified gauge toggle */}
          <div
            id="hud-gauge-widget"
            role="button"
            tabIndex={0}
            onClick={() => {
              triggerFeedback('button');
              if (onToggleMagnifiedGauge) {
                onToggleMagnifiedGauge();
              } else {
                setShowControls((prev) => !prev);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerFeedback('button');
                if (onToggleMagnifiedGauge) {
                  onToggleMagnifiedGauge();
                } else {
                  setShowControls((prev) => !prev);
                }
              }
            }}
            title="Curbside Parking Gauge: Click to view magnified gauge analysis"
            aria-label="Curbside Parking Gauge - Click to view magnified gauge analysis"
            aria-haspopup="dialog"
            className={`bg-[#193A5A]/90 backdrop-blur-md border border-[#0081BC]/40 hover:border-[#FFC72C]/80 hover:bg-[#1f476e]/95 p-1 sm:p-2 rounded-md sm:rounded-lg shadow-lg flex flex-col items-center transition-all self-end origin-top-right scale-50 lg:scale-100 [@media(orientation:landscape)_and_(max-height:540px)]:scale-50 [@media(max-height:540px)]:scale-50 -mb-[42px] lg:mb-0 [@media(orientation:landscape)_and_(max-height:540px)]:-mb-[42px] [@media(max-height:540px)]:-mb-[42px] w-[130px] sm:w-[140px] cursor-pointer select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFC72C] group ${
              curbsidePct >= 150 ? 'animate-bounce border-[#E8552D]' : ''
            }`}
          >
            <div className="flex items-center justify-between w-full text-[10px] sm:text-xs font-bold text-gray-200 mb-0.5 sm:mb-1 gap-1">
              <span>Curbside</span>
              <span className={`px-1.5 py-0.5 rounded border text-[10px] sm:text-xs font-bold ${getGaugeStatusColor()}`}>
                {curbsidePct}%
              </span>
            </div>
            <canvas ref={gaugeCanvasRef} width={120} height={60} className="w-full h-auto block" />
            <span className="text-[10px] sm:text-xs font-semibold text-gray-200 mt-0.5 whitespace-nowrap">
              {curbsideDemandCount}/{curbsideStallsCapacity || totalLegalCurbsideStalls} Cars
            </span>

            {/* Circling / Cruising Traffic Indicator */}
            {circlingCarCount > 0 ? (
              <div 
                id="hud-circling-traffic-indicator"
                className="w-full mt-1 pt-1 border-t border-white/10 flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-semibold text-amber-300"
                title={`${circlingCarCount} vehicles circling looking for parking as curbside fills up`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                <span className="truncate">{circlingCarCount} {circlingCarCount === 1 ? 'car' : 'cars'} circling</span>
              </div>
            ) : (
              <div 
                id="hud-circling-traffic-indicator"
                className="w-full mt-1 pt-1 border-t border-white/10 flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-medium text-emerald-300/90"
                title="Curbside parking open - through traffic flowing smoothly"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span className="truncate">Traffic flowing</span>
              </div>
            )}
          </div>


        </div>

        {/* Zoom Controls (Bottom Left) */}

        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 z-10 flex flex-col gap-1 bg-black/60 backdrop-blur-sm p-1 rounded-lg border border-white/10 origin-bottom-left scale-50 lg:scale-100 [@media(orientation:landscape)_and_(max-height:540px)]:scale-50 [@media(max-height:540px)]:scale-50 transition-transform">
          <button 
            type="button"
            onClick={() => setZoomScale(s => Math.min(4, s + 0.25))}
            className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 active:bg-white/30 rounded font-bold text-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            +
          </button>
          <button 
            type="button"
            onClick={() => setZoomScale(1.33)}
            className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 active:bg-white/30 rounded font-bold text-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
            title="Reset Camera View (Default 1.33x)"
            aria-label="Reset Camera View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => setZoomScale(s => Math.max(0.5, s - 0.25))}
            className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/20 active:bg-white/30 rounded font-bold text-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            -
          </button>
        </div>

        {/* Bottom Center Status: Rear Garages Container */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 sm:bottom-3 z-20 pointer-events-auto max-w-[calc(100%-88px)]">
          <div
            id="hud-garage-status"
            role="button"
            tabIndex={0}
            onClick={() => {
              triggerFeedback('button');
              setShowGarageIndicators((prev) => !prev);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerFeedback('button');
                setShowGarageIndicators((prev) => !prev);
              }
            }}
            className="flex items-center gap-1.5 sm:gap-2 bg-[#193A5A]/95 backdrop-blur-md border border-[#0081BC]/40 hover:border-[#FFC72C]/70 hover:bg-[#1f476e]/95 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md sm:rounded-lg shadow-xl text-white pointer-events-auto transition-all cursor-pointer select-none active:scale-95"
            title="Detached Laned Garages: Real-time off-street vehicle parking across all 12 properties (Click to toggle garage roof indicators)"
            aria-label={`Rear Garages Status: ${occupiedGaragesCount} of 12 occupied. Click to toggle garage badges.`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse shrink-0" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs font-black tracking-wide whitespace-nowrap">
                <span>🏠 REAR GARAGES</span>
                <span className="bg-[#059669] text-white border border-[#34D399]/60 px-1.5 py-0.2 rounded text-[10px] font-bold">
                  {occupiedGaragesCount}/12 Occupied
                </span>
                <span className="bg-[#FBBF24] text-[#78350F] border border-[#D97706]/60 px-1.5 py-0.2 rounded text-[10px] font-bold">
                  {12 - occupiedGaragesCount} Vacant
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const NeighborhoodSimulation = React.memo(NeighborhoodSimulationComponent);
