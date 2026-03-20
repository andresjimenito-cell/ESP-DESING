import React, { useMemo } from 'react';
import { Box } from 'lucide-react';
import { EspPump, EspMotor, EspVSD, SystemParams } from '../types';
import { useLanguage } from '../i18n';

interface Props {
    pump: EspPump | null;
    motor: EspMotor | undefined;
    params: SystemParams;
    results: any;
    frequency: number;
    cable?: any;
    selectedVSD?: EspVSD;
    mode?: 'ui' | 'report';
}

export const VisualESPStack: React.FC<Props> = ({ pump, motor, params, results, frequency, cable, selectedVSD, mode = 'ui' }) => {
    const { t } = useLanguage();

    // --- CONFIG & SCALING ---
    const isReport = mode === 'report';
    const width = isReport ? 1300 : 650;  // Increased to avoid any cropping with larger VSD
    const center = isReport ? 550 : 280;  // Balanced center
    const casingW = isReport ? 550 : 340;
    const tubingW = isReport ? 72 : 44;

    // --- COMPONENT WIDTHS ---
    const scaleFactor = isReport ? 2.4 : 1.4;
    const pumpW = 72 * scaleFactor;
    const flangeW = 78 * scaleFactor;
    const intakeW = 55 * scaleFactor;
    const sealW = 60 * scaleFactor;
    const motorW = 68 * scaleFactor;
    const sensorW = 42 * scaleFactor;
    const shaftW = 20 * scaleFactor;

    // --- HEIGHTS ---
    const dischargeH = 40;
    const housingCount = pump?.housingCount || 1;
    const totalPumpH = pump ? Math.min(350, Math.max(160, pump.stages * 2.2)) : 160;
    const bodyH = totalPumpH / housingCount;
    const gapH = 12;

    const intakeH = 65;
    const sealH = 110;

    const motorHp = motor?.hp || params.motorHp || 100;
    const motorH = Math.min(280, 130 + (motorHp * 0.4));
    const sensorH = 55;

    // Y-Positions — VSD box space at top, then wellhead, then ESP string
    const vsdBoxH = selectedVSD ? (isReport ? 170 : 160) : 0;  // MORE height for better visibility
    const vsdBoxW = isReport ? 480 : 250;                        // MORE width for larger text
    const vsdBoxPad = selectedVSD ? (isReport ? 30 : 20) : 0;   // Gap between VSD box and wellhead
    const surfY = vsdBoxH + vsdBoxPad + 10;                      // Surface ground line Y
    const tubingLen = isReport ? 50 : 22;
    const startY = surfY + tubingLen;

    const dischargeY = startY;
    const pumpTopY = dischargeY + dischargeH;
    const pumpSectionHeight = (bodyH * housingCount) + (gapH * (housingCount - 1));
    const pumpBottomY = pumpTopY + pumpSectionHeight;

    // connH reducido para mayor compacidad
    const connH = 4;

    const intakeY = pumpBottomY + connH;
    const sealY = intakeY + intakeH + connH;
    const motorY = sealY + sealH + connH;
    const sensorY = motorY + motorH + connH;
    const espBottomY = sensorY + sensorH;

    // ratHoleH moderado — suficiente para perforaciones y espacio inferior
    const ratHoleH = isReport ? 90 : 55;
    const casingBottomY = espBottomY + ratHoleH;

    const perfsVisualY = espBottomY + (ratHoleH * 0.5);
    const perfsH = 80;

    const bubbles = useMemo(() => {
        return Array.from({ length: 80 }).map((_, i) => ({
            id: i,
            side: Math.random() > 0.5 ? 'left' : 'right',
            offset: (isReport ? 35 : 50) + Math.random() * 80,
            size: 2.5 + Math.random() * 5,
            delay: Math.random() * 6,
            duration: 2.5 + Math.random() * 5
        }));
    }, [isReport]);

    const safeResults = {
        pip: results?.pip ?? 0,
        motorLoad: results?.motorLoad ?? 0,
        fluidLevel: results?.fluidLevel ?? 0,
        tdh: results?.tdh ?? 0,
        electrical: results?.electrical || { amps: 0, volts: 0, kva: 0, voltDrop: 0, kwLoss: 0 }
    };

    const intakeTemp = isNaN(params.bottomholeTemp) ? 150 : params.bottomholeTemp;
    const motorRise = (safeResults.motorLoad || 0) * 0.8;
    const motorTemp = intakeTemp + motorRise;

    const pumpDepthMD = params.pressures.pumpDepthMD || 0;
    // --- FLUID LEVEL VISUALIZATION ---
    // results.fluidLevel is depth from surface (MD)
    // submergence is the fluid column ABOVE the pump intake
    const submergenceFt = Math.max(0, pumpDepthMD - (results.fluidLevel || pumpDepthMD));
    const pixelsPerFt = isReport ? 0.25 : 0.4;

    let fluidY = intakeY - (submergenceFt * pixelsPerFt);
    if (isNaN(fluidY) || fluidY < surfY) fluidY = surfY;
    if (fluidY > casingBottomY) fluidY = casingBottomY;

    // --- HELPER: Coupling neck (between pump tandem sections) ---
    const Coupling = ({ y, w = shaftW }: { y: number, w?: number }) => (
        <g>
            <rect x={center - w / 2 - 2} y={y - connH} width={w + 4} height={connH * 3} fill="url(#collarGrad)" stroke="#000" strokeWidth="0.5" />
            <rect x={center - w / 2 - 2} y={y - connH} width={w + 4} height={2} fill="rgb(var(--color-text-main))" opacity="0.1" />
        </g>
    );

    // --- HELPER: Wellhead (Cabezal de Pozo) ---
    const Wellhead = ({ y }: { y: number }) => {
        const h = isReport ? 35 : 22;
        const w = isReport ? 110 : 70;
        const flangeH = isReport ? 8 : 5;
        const flangeW = w + (isReport ? 20 : 12);
        return (
            <g transform={`translate(${center - w / 2}, ${y - h})`}>
                {/* Master Valve / Top Flange */}
                <rect x={(w - flangeW) / 2} y={0} width={flangeW} height={flangeH} fill="url(#collarGrad)" stroke="#000" strokeWidth="0.8" />
                {/* Main Body */}
                <rect x={0} y={flangeH} width={w} height={h - flangeH * 2} fill="url(#cylinderMetal)" stroke="#000" strokeWidth="1" />
                {/* Side wing valves (optional visual flair) */}
                <rect x={- (isReport ? 15 : 10)} y={h / 2 - 2} width={isReport ? 15 : 10} height={isReport ? 10 : 6} fill="url(#cylinderDark)" stroke="#000" />
                <rect x={w} y={h / 2 - 2} width={isReport ? 15 : 10} height={isReport ? 10 : 6} fill="url(#cylinderDark)" stroke="#000" />
                {/* Bottom Flange */}
                <rect x={(w - flangeW) / 2} y={h - flangeH} width={flangeW} height={flangeH} fill="url(#collarGrad)" stroke="#000" strokeWidth="0.8" />
            </g>
        );
    };

    // --- HELPER: Tapered transition joint between two components ---
    const TransitionJoint = ({
        yTop, yBottom, topW, bottomW
    }: { yTop: number; yBottom: number; topW: number; bottomW: number }) => {
        const tl = center - topW / 2;
        const tr = center + topW / 2;
        const bl = center - bottomW / 2;
        const br = center + bottomW / 2;
        return (
            <g>
                <path
                    d={`M${tl} ${yTop} L${tr} ${yTop} L${br} ${yBottom} L${bl} ${yBottom} Z`}
                    fill="url(#collarGrad)"
                    stroke="#000"
                    strokeWidth="0.8"
                />
                {/* Left edge highlight */}
                <path d={`M${tl + 1.5} ${yTop} L${bl + 1.5} ${yBottom}`} stroke="rgb(var(--color-text-main))" strokeWidth="1.2" opacity="0.3" />
                {/* Right edge shadow */}
                <path d={`M${tr - 1.5} ${yTop} L${br - 1.5} ${yBottom}`} stroke="#000" strokeWidth="1.6" opacity="0.6" />
            </g>
        );
    };

    // --- HELPER: Industrial SmartTag ---
    const SmartTag = ({ y, label, value, unit, side = 'right', color = 'slate' }: any) => {
        const lineLen = isReport ? 120 : 50;
        const tagWidth = isReport ? 260 : 135;
        const xStart = side === 'right' ? center + (pumpW / 2) + 5 : center - (pumpW / 2) - 5;
        const xEnd = side === 'right' ? xStart + lineLen : xStart - lineLen;

        const colorMap: Record<string, { stroke: string; accent: string; text: string; bg: string }> = {
            blue: { stroke: 'rgb(var(--color-primary))', accent: 'rgb(var(--color-primary))', text: 'rgb(var(--color-text-main))', bg: 'rgb(var(--color-surface))' },
            emerald: { stroke: 'rgb(var(--color-success))', accent: 'rgb(var(--color-success))', text: 'rgb(var(--color-text-main))', bg: 'rgb(var(--color-surface))' },
            amber: { stroke: 'rgb(var(--color-warning))', accent: 'rgb(var(--color-warning))', text: 'rgb(var(--color-text-main))', bg: 'rgb(var(--color-surface))' },
            red: { stroke: 'rgb(var(--color-danger))', accent: 'rgb(var(--color-danger))', text: 'rgb(var(--color-text-main))', bg: 'rgb(var(--color-surface))' },
            slate: { stroke: 'rgb(var(--color-text-muted))', accent: 'rgb(var(--color-text-muted))', text: 'rgb(var(--color-text-main))', bg: 'rgb(var(--color-surface))' },
        };
        const c = colorMap[color] || colorMap.slate;

        const bgColor = c.bg;
        const textColor = c.text;
        const labelColor = 'rgb(var(--color-text-muted))';

        return (
            <g>
                <path d={`M${xStart} ${y} L${xEnd} ${y}`} stroke={c.stroke} strokeWidth={isReport ? 1.5 : 1} strokeDasharray="4 2" />
                <circle cx={xStart} cy={y} r={isReport ? 4 : 2.5} fill={c.stroke} />
                <g transform={`translate(${side === 'right' ? xEnd : xEnd - tagWidth}, ${y - 30})`}>
                    <rect width={tagWidth} height={isReport ? 65 : 52} rx="8" fill={bgColor} stroke="rgb(var(--color-text-muted) / 0.2)" strokeWidth="1.5" />
                    <rect width={6} height={isReport ? 65 : 52} rx="2" fill={c.accent} />
                    <text x={isReport ? 20 : 16} y={isReport ? 20 : 18} fontSize={isReport ? 14 : 11} fill={labelColor} fontWeight="900"
                        fontFamily="system-ui, sans-serif" letterSpacing="0.05em"
                        style={{ textTransform: 'uppercase' }}>{label}</text>
                    <text x={isReport ? 20 : 16} y={isReport ? 48 : 42} fontSize={isReport ? 24 : 18} fill={textColor} fontWeight="900"
                        fontFamily="system-ui, sans-serif" letterSpacing="-0.02em">
                        {value}
                        <tspan fontSize={isReport ? 14 : 11} fill={labelColor} fontWeight="700" dx="6">{unit}</tspan>
                    </text>
                </g>
            </g>
        );
    };

    // Real rendered Y positions accounting for connH transforms applied to each group
    const intakeRealTop = intakeY + connH;
    const intakeRealBottom = intakeRealTop + intakeH;
    const sealRealTop = intakeRealBottom + connH;
    const sealRealBottom = sealRealTop + sealH;
    const motorRealTop = sealRealBottom + connH;
    const motorRealBottom = motorRealTop + motorH;
    const sensorRealTop = motorRealBottom + connH;

    return (
        <div className={`h-full w-full bg-canvas relative overflow-hidden flex flex-col items-center ${isReport ? '' : 'border-l border-white/5'} select-none transition-colors duration-500`}>
            {/* Background geology texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 Q 25 10 50 20 T 100 20' fill='none' stroke='%23ffffff' stroke-width='2'/%3E%3Cpath d='M0 50 Q 25 40 50 50 T 100 50' fill='none' stroke='%23ffffff' stroke-width='1'/%3E%3Cpath d='M0 80 Q 25 70 50 80 T 100 80' fill='none' stroke='%23ffffff' stroke-width='3'/%3E%3C/svg%3E")`,
                backgroundSize: '200px 200px'
            }}></div>

            {/* Header badge removed as requested */}

            {/* Depth ruler - Movida al fondo (z-0) para no obstruir etiquetas */}
            <div className="absolute left-1 top-0 bottom-0 w-12 border-r border-white/10 flex flex-col justify-between py-10 opacity-60 pointer-events-none z-0">
                {[0, 25, 50, 75, 100].map(p => (
                    <div key={p} className="flex items-center gap-2">
                        <div className="h-[2px] w-4 bg-txt-muted"></div>
                        <span className="text-[10px] font-bold font-mono text-txt-muted">
                            {Math.round(pumpDepthMD * (p / 100))}ft
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex-1 w-full overflow-y-auto custom-scrollbar flex justify-center relative z-10">
                <svg viewBox={`0 0 ${width} ${casingBottomY + 60}`} style={{ maxHeight: '100%', width: 'auto', minWidth: mode === 'report' ? '280px' : '400px' }} preserveAspectRatio="xMidYMin meet" className="my-4">
                    <defs>
                        {/* ── STEEL GRADIENTS ── Aspecto metálico sólido */}
                        <linearGradient id="cylinderMetal" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0a0a0c" />
                            <stop offset="15%" stopColor="#374151" />
                            <stop offset="30%" stopColor="#9ca3af" />
                            <stop offset="50%" stopColor="#ffffff" />
                            <stop offset="70%" stopColor="#374151" />
                            <stop offset="100%" stopColor="#0a0a0c" />
                        </linearGradient>
                        <linearGradient id="vsdMainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff76" />
                            <stop offset="20%" stopColor="#f8fafc" />
                            <stop offset="100%" stopColor="#e2e8f09b" />
                        </linearGradient>
                        <linearGradient id="cylinderPump" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#050a14" />
                            <stop offset="15%" stopColor="rgb(var(--color-primary) / 0.8)" />
                            <stop offset="35%" stopColor="rgb(var(--color-primary))" />
                            <stop offset="50%" stopColor="#ffffff" />
                            <stop offset="65%" stopColor="rgb(var(--color-primary))" />
                            <stop offset="85%" stopColor="rgb(var(--color-primary) / 0.6)" />
                            <stop offset="100%" stopColor="#050a14" />
                        </linearGradient>
                        <linearGradient id="motorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#1a1d21" />
                            <stop offset="15%" stopColor="#4b5563" />
                            <stop offset="35%" stopColor="#9ca3af" />
                            <stop offset="50%" stopColor="#ffffff" />
                            <stop offset="65%" stopColor="#9ca3af" />
                            <stop offset="85%" stopColor="#4b5563" />
                            <stop offset="100%" stopColor="#1a1d21" />
                        </linearGradient>
                        <linearGradient id="cylinderDark" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#09090b" />
                            <stop offset="25%" stopColor="#3f3f46" />
                            <stop offset="50%" stopColor="#ffffff" />
                            <stop offset="75%" stopColor="#3f3f46" />
                            <stop offset="100%" stopColor="#09090b" />
                        </linearGradient>
                        <linearGradient id="sealGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#06121a" />
                            <stop offset="30%" stopColor="rgb(var(--color-primary))" />
                            <stop offset="50%" stopColor="#ffffff" />
                            <stop offset="70%" stopColor="rgb(var(--color-primary))" />
                            <stop offset="100%" stopColor="#06121a" />
                        </linearGradient>
                        <linearGradient id="collarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0c1117" />
                            <stop offset="30%" stopColor="#4b5563" />
                            <stop offset="50%" stopColor="#ffffff" />
                            <stop offset="70%" stopColor="#4b5563" />
                            <stop offset="100%" stopColor="#0c1117" />
                        </linearGradient>
                        <linearGradient id="casingWallGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgb(var(--color-canvas))" />
                            <stop offset="30%" stopColor="rgb(var(--color-surface))" />
                            <stop offset="55%" stopColor="rgb(var(--color-surface-light))" />
                            <stop offset="65%" stopColor="rgb(var(--color-text-muted) / 0.3)" />
                            <stop offset="100%" stopColor="rgb(var(--color-canvas))" />
                        </linearGradient>
                        <linearGradient id="casingWallGradR" x1="100%" y1="0%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="rgb(var(--color-canvas))" />
                            <stop offset="30%" stopColor="rgb(var(--color-surface))" />
                            <stop offset="55%" stopColor="rgb(var(--color-surface-light))" />
                            <stop offset="65%" stopColor="rgb(var(--color-text-muted) / 0.3)" />
                            <stop offset="100%" stopColor="rgb(var(--color-canvas))" />
                        </linearGradient>
                        <linearGradient id="cylinderGold" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#78350f" />
                            <stop offset="20%" stopColor="#b45309" />
                            <stop offset="50%" stopColor="#fbbf24" />
                            <stop offset="80%" stopColor="#b45309" />
                            <stop offset="100%" stopColor="#78350f" />
                        </linearGradient>

                        {/*
                          ── FLUID GRADIENT ──
                          Azul-gris translúcido apagado — ni muy azul ni muy oscuro.
                        */}
                        <linearGradient id="fluidGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity={isReport ? 0.08 : 0.15} />
                            <stop offset="50%" stopColor="rgb(var(--color-primary))" stopOpacity={isReport ? 0.06 : 0.18} />
                            <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity={isReport ? 0.04 : 0.22} />
                        </linearGradient>

                        {/* Shimmer horizontal en la superficie del fluido */}
                        <linearGradient id="fluidSurface" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="rgb(var(--color-primary))" stopOpacity="0" />
                            <stop offset="28%" stopColor="rgb(var(--color-primary))" stopOpacity="0.2" />
                            <stop offset="72%" stopColor="rgb(var(--color-primary))" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="rgb(var(--color-primary))" stopOpacity="0" />
                        </linearGradient>

                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgb(var(--color-text-main))" strokeWidth="0.5" opacity="0.05" />
                        </pattern>
                        <pattern id="screenPat" width="5" height="5" patternUnits="userSpaceOnUse">
                            <rect width="5" height="5" fill="rgb(var(--color-surface))" />
                            <rect width="3.5" height="3.5" fill="rgb(var(--color-text-muted) / 0.3)" />
                            <rect x="0.5" y="0.5" width="1" height="1" fill="rgb(var(--color-primary))" opacity="0.4" />
                        </pattern>
                        <pattern id="cementPat" width="12" height="12" patternUnits="userSpaceOnUse">
                            <rect width="12" height="12" fill="rgb(var(--color-surface-light))" />
                            <circle cx="3" cy="3" r="1.2" fill="rgb(var(--color-canvas))" opacity="0.3" />
                            <circle cx="9" cy="7" r="0.8" fill="rgb(var(--color-canvas))" opacity="0.2" />
                            <circle cx="5" cy="10" r="1" fill="rgb(var(--color-canvas))" opacity="0.25" />
                        </pattern>

                        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                        <filter id="deepShadow" x="-50%" y="-10%" width="200%" height="120%">
                            <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#000" floodOpacity="0.75" />
                        </filter>
                        <filter id="softGlow">
                            <feGaussianBlur stdDeviation="1.5" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                        <filter id="fluidLineGlow" x="-10%" y="-200%" width="120%" height="500%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>

                        <style>{`
                            @keyframes rise {
                                0%   { transform: translateY(0); opacity: 0; }
                                20%  { opacity: 0.45; }
                                100% { transform: translateY(-${Math.max(0, perfsVisualY - fluidY)}px); opacity: 0; }
                            }
                            .oil-bubble { animation: rise linear infinite; }
                            .cable-flow { 
                                stroke-dasharray: 8 16; 
                                stroke-dashoffset: 100; 
                                animation: flow 3s linear infinite; 
                            }
                            @keyframes flow { to { stroke-dashoffset: 0; } }
                            .component-hover:hover { filter: brightness(1.15); cursor: pointer; }
                            @keyframes fluidPulse {
                                0%, 100% { opacity: 0.9; }
                                50%       { opacity: 1; }
                            }
                            .fluid-layer { animation: fluidPulse 6s ease-in-out infinite; }
                        `}</style>
                    </defs>

                    {/* ── CEMENT SHEATH ── */}
                    <rect x={center - casingW / 2 - 18} y={surfY} width={casingW + 36} height={casingBottomY - surfY} fill="url(#cementPat)" stroke="rgb(var(--color-text-muted) / 0.6)" strokeWidth="1.2" />

                    {/* ── CASING WALLS ── */}
                    <rect x={center - casingW / 2 - 12} y={surfY} width={12} height={casingBottomY - surfY} fill="url(#casingWallGrad)" stroke="rgb(var(--color-text-muted) / 0.8)" strokeWidth="0.8" />
                    <rect x={center + casingW / 2} y={surfY} width={12} height={casingBottomY - surfY} fill="url(#casingWallGradR)" stroke="rgb(var(--color-text-muted) / 0.8)" strokeWidth="0.8" />
                    {/* Wellbore interior - Un poco más de cuerpo para resaltar el equipo */}
                    <rect x={center - casingW / 2} y={surfY} width={casingW} height={casingBottomY - surfY} fill="rgb(var(--color-surface) / 0.15)" />
                    <rect x={center - casingW / 2} y={surfY} width={8} height={casingBottomY - surfY} fill="rgb(var(--color-text-muted) / 0.2)" opacity="0.8" />
                    <rect x={center + casingW / 2 - 8} y={surfY} width={8} height={casingBottomY - surfY} fill="rgb(var(--color-text-muted) / 0.2)" opacity="0.8" />

                    {/* Casing coupling collars */}
                    {[100, 220, 340, 460, 580].map(offset => {
                        const cy = surfY + offset;
                        if (cy > casingBottomY - 20) return null;
                        return (
                            <g key={offset}>
                                <rect x={center - casingW / 2 - 16} y={cy} width={16} height={8} fill="url(#collarGrad)" stroke="rgb(var(--color-canvas))" strokeWidth="0.5" />
                                <rect x={center + casingW / 2} y={cy} width={16} height={8} fill="url(#collarGrad)" stroke="rgb(var(--color-canvas))" strokeWidth="0.5" />
                            </g>
                        );
                    })}

                    {/* Well shoe */}
                    <path d={`M${center - casingW / 2 - 12} ${casingBottomY} L${center} ${casingBottomY + 28} L${center + casingW / 2 + 12} ${casingBottomY} Z`} fill="url(#cylinderDark)" stroke="rgb(var(--color-canvas))" strokeWidth="1" />
                    <path d={`M${center - casingW / 2 - 8}  ${casingBottomY} L${center} ${casingBottomY + 18} L${center + casingW / 2 + 8}  ${casingBottomY} Z`} fill="rgb(var(--color-canvas) / 0.4)" />

                    {/* ── FLUID LEVEL ── Gris-azul translúcido, apagado */}
                    <rect
                        x={center - casingW / 2 + 1}
                        y={fluidY}
                        width={casingW - 2}
                        height={casingBottomY - fluidY}
                        fill="url(#fluidGrad)"
                        className="fluid-layer"
                    />
                    {/* Línea de nivel dinámico — tono del tema */}
                    <line
                        x1={center - casingW / 2} y1={fluidY}
                        x2={center + casingW / 2} y2={fluidY}
                        stroke="rgb(var(--color-primary))" strokeWidth="1.8"
                        filter="url(#fluidLineGlow)"
                    />
                    {/* Shimmer horizontal en la superficie */}
                    <rect
                        x={center - casingW / 2 + 1} y={fluidY}
                        width={casingW - 2} height={4}
                        fill="url(#fluidSurface)"
                        opacity="0.3"
                    />

                    {/* Bubbles - More and more visible */}
                    {bubbles.map(b => (
                        <circle key={b.id}
                            cx={b.side === 'left' ? center - b.offset : center + b.offset}
                            cy={perfsVisualY + 30} r={b.size}
                            fill="rgb(var(--color-text-main))" className="oil-bubble"
                            style={{ animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s` }}
                            opacity="0.8"
                        />
                    ))}

                    {/* ── VSD SURFACE BOX ── */}
                    {selectedVSD && (() => {
                        const vsdX = center + (casingW / 4) + (isReport ? 30 : 25);
                        const vsdY = 15;
                        const fr = isReport ? 8 : 6;
                        const fs = isReport ? 24 : 16;               // MUCH LARGER font size
                        const fsL = isReport ? 18 : 13;              // MUCH LARGER label font size
                        const fsSub = isReport ? 16 : 11;            // MUCH LARGER sub font size
                        const pad = isReport ? 22 : 16;
                        const cableEndX = center + tubingW / 2 + 3; // cable entry to well
                        const cableEndY = surfY;

                        // manufacturer color accent
                        const mfgColor = (() => {
                            const m = selectedVSD.manufacturer.toLowerCase();
                            if (m === 'triol') return 'rgb(var(--color-secondary))';
                            if (m === 'clesus') return '#f59e0b'; // Amber/Gold for Clesus Colombia
                            if (m === 'abb') return '#ef4444';
                            if (m === 'slb') return 'rgb(var(--color-primary))';
                            if (m === 'siemens') return '#3b82f6';
                            if (m === 'baker hughes') return '#10b981';
                            return 'rgb(var(--color-primary))';
                        })();

                        return (
                            <g key="vsd-surface-box">
                                {/* ── Cable from VSD side to well ── */}
                                <path
                                    d={`M${vsdX} ${vsdY + vsdBoxH - 15} L${vsdX - (isReport ? 40 : 25)} ${vsdY + vsdBoxH - 15} L${center + tubingW / 2 + 4} ${surfY - 2} L${cableEndX} ${cableEndY}`}
                                    fill="none" stroke="rgb(var(--color-canvas))" strokeWidth={isReport ? 10 : 7} strokeLinecap="round"
                                />
                                <path
                                    d={`M${vsdX} ${vsdY + vsdBoxH - 15} L${vsdX - (isReport ? 40 : 25)} ${vsdY + vsdBoxH - 15} L${center + tubingW / 2 + 4} ${surfY - 2} L${cableEndX} ${cableEndY}`}
                                    fill="none" stroke="rgb(var(--color-warning))" strokeWidth={isReport ? 6 : 4} strokeLinecap="round"
                                />
                                <path
                                    d={`M${vsdX} ${vsdY + vsdBoxH - 15} L${vsdX - (isReport ? 40 : 25)} ${vsdY + vsdBoxH - 15} L${center + tubingW / 2 + 4} ${surfY - 2} L${cableEndX} ${cableEndY}`}
                                    fill="none" stroke={mfgColor} strokeWidth="2" strokeLinecap="round"
                                    strokeDasharray="6 10" opacity="0.7" className="cable-flow"
                                />

                                {/* VSD Box shadow */}
                                <rect x={vsdX + 4} y={vsdY + 4} width={vsdBoxW} height={vsdBoxH} rx={fr} fill="#000" opacity="0.5" />

                                {/* VSD Box main body — LIGHT METALLIC LOOK */}
                                <rect x={vsdX} y={vsdY} width={vsdBoxW} height={vsdBoxH} rx={fr}
                                    fill="url(#vsdMainGrad)"
                                    stroke="rgb(var(--color-primary) / 0.5)" strokeWidth="1"
                                />
                                <path d={`M${vsdX} ${vsdY + 2} L${vsdX + vsdBoxW} ${vsdY + 2}`} stroke="#fff" strokeWidth="1" opacity="0.8" />

                                {/* Control Panel Section (Industrial LCD Screen Look) */}
                                <rect x={vsdX + pad} y={vsdY + (isReport ? 45 : 30)} width={vsdBoxW - pad * 2} height={isReport ? 90 : 65} rx="6" fill="#000" />
                                <rect x={vsdX + pad + 2} y={vsdY + (isReport ? 45 : 30) + 2} width={vsdBoxW - pad * 2 - 4} height={isReport ? 90 : 65 - 4} rx="4" fill="url(#cylinderDark)" opacity="0.6" />

                                {/* Top label strip — Integrado con el tema */}
                                <rect x={vsdX} y={vsdY} width={vsdBoxW} height={isReport ? 32 : 24} rx={`${fr} ${fr} 0 0`}
                                    fill="rgb(var(--color-primary))" opacity="1" />
                                <text x={vsdX + vsdBoxW / 2} y={vsdY + (isReport ? 21 : 16)}
                                    fontSize={isReport ? 13 : 9} fill="#fff" fontWeight="950"
                                    fontFamily="system-ui" letterSpacing="0.15em" textAnchor="middle"
                                    style={{ textTransform: 'uppercase' }}>
                                    VARIABLE SPEED DRIVE SYSTEM
                                </text>

                                {/* Screen labels inside the dark panel */}
                                <text x={vsdX + pad + 12} y={vsdY + (isReport ? 80 : 54)}
                                    fontSize={fs + 2} fill="rgb(var(--color-primary))" fontWeight="950"
                                    filter="url(#vsdGlow)"
                                    fontFamily="'Courier New', monospace">
                                    {selectedVSD.model}
                                </text>
                                <text x={vsdX + pad + 12} y={vsdY + (isReport ? 105 : 72)}
                                    fontSize={fsSub + 1} fill="white" fontWeight="900"
                                    fontFamily="system-ui" opacity="0.9">
                                    {selectedVSD.brand} · {selectedVSD.manufacturer}
                                </text>

                                {/* Specs row below the dark panel */}
                                {[
                                    { label: 'POWER', value: `${selectedVSD.kvaRating} kVA` },
                                    { label: 'OUTPUT', value: selectedVSD.outputVoltage },
                                ].map((spec, i) => {
                                    const colW = (vsdBoxW - pad * 2) / 2;
                                    const specX = vsdX + pad + i * colW;
                                    const specY = vsdY + (isReport ? 165 : 120);
                                    return (
                                        <g key={i}>
                                            <text x={specX} y={specY}
                                                fontSize={fsL} fill="#475569" fontWeight="950"
                                                fontFamily="system-ui" style={{ textTransform: 'uppercase' }}>
                                                {spec.label}
                                            </text>
                                            <text x={specX} y={specY + (isReport ? 24 : 18)}
                                                fontSize={isReport ? 19 : 14} fill="rgb(var(--color-text-main))" fontWeight="900"
                                                fontFamily="'Courier New', monospace">
                                                {spec.value}
                                            </text>
                                        </g>
                                    );
                                })}

                                {/* Vents / Grille visual detail */}
                                <g opacity="0.4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <line key={i} x1={vsdX + vsdBoxW - 25} y1={vsdY + vsdBoxH - 10 - i * 4} x2={vsdX + vsdBoxW - 10} y2={vsdY + vsdBoxH - 10 - i * 4} stroke="#000" strokeWidth="1" />
                                    ))}
                                </g>
                            </g>
                        );
                    })()}

                    {/* ── GROUND / SURFACE LINE ── */}
                    <line x1={0} y1={surfY} x2={width} y2={surfY}
                        stroke="rgb(var(--color-text-muted))" strokeWidth="2" opacity="0.4" />
                    <rect x={0} y={surfY} width={width} height={50} fill="url(#cementPat)" opacity="0.2" />

                    {/* ── WELLHEAD (CABEZAL) ── */}
                    <Wellhead y={surfY} />

                    <text x={isReport ? 16 : 14} y={surfY - 4}
                        fontSize={isReport ? 11 : 7.5} fill="rgb(var(--color-text-muted))" fontWeight="700"
                        fontFamily="system-ui" letterSpacing="0.12em" style={{ textTransform: 'uppercase' }}>
                        SUPERFICIE / SURFACE
                    </text>

                    {/* ── TUBING STRING ── */}
                    <rect x={center - tubingW / 2} y={surfY} width={tubingW} height={startY - surfY + 10} fill="url(#cylinderMetal)" stroke="rgb(var(--color-canvas))" strokeWidth="0.5" />
                    <rect x={center - tubingW / 2} y={surfY} width={2} height={startY - surfY + 10} fill="rgb(var(--color-text-main))" opacity="0.2" />
                    <rect x={center + tubingW / 2 - 2} y={surfY} width={2} height={startY - surfY + 10} fill="rgb(var(--color-text-main))" opacity="0.1" />
                    {[1, 2, 3].map(i => (
                        <g key={i}>
                            <rect x={center - tubingW / 2 - 4} y={surfY + i * 140} width={tubingW + 8} height={8} fill="url(#collarGrad)" stroke="rgb(var(--color-primary) / 0.4)" strokeWidth="0.5" />
                            <rect x={center - tubingW / 2 - 4} y={surfY + i * 140} width={tubingW + 8} height={2} fill="rgb(var(--color-text-main))" opacity="0.1" />
                        </g>
                    ))}

                    {/* ── POWER CABLE ── */}
                    <g>
                        <path d={`
                            M${center + tubingW / 2 + 3} ${surfY} 
                            L${center + tubingW / 2 + 3} ${startY - 10} 
                            C${center + pumpW / 2 + 20} ${startY}, ${center + pumpW / 2 + 20} ${pumpTopY}, ${center + pumpW / 2 + 10} ${pumpTopY + 20}
                            L${center + pumpW / 2 + 10} ${pumpBottomY}
                            L${center + intakeW / 2 + 15} ${intakeRealTop}
                            L${center + motorW / 2 + 8} ${motorRealTop + 30}
                        `} fill="none" stroke="rgb(var(--color-canvas))" strokeWidth="7" strokeLinecap="round" />
                        <path d={`
                            M${center + tubingW / 2 + 3} ${surfY} 
                            L${center + tubingW / 2 + 3} ${startY - 10} 
                            C${center + pumpW / 2 + 20} ${startY}, ${center + pumpW / 2 + 20} ${pumpTopY}, ${center + pumpW / 2 + 10} ${pumpTopY + 20}
                            L${center + pumpW / 2 + 10} ${pumpBottomY}
                            L${center + intakeW / 2 + 15} ${intakeRealTop}
                            L${center + motorW / 2 + 8} ${motorRealTop + 30}
                        `} fill="none" stroke="rgb(var(--color-warning))" strokeWidth="4.5" strokeLinecap="round" />
                        <path d={`
                            M${center + tubingW / 2 + 2} ${surfY} 
                            L${center + tubingW / 2 + 2} ${startY - 10}
                        `} fill="none" stroke="rgb(var(--color-warning) / 0.4)" strokeWidth="1.5" strokeLinecap="round" />
                        <path d={`
                            M${center + tubingW / 2 + 3} ${surfY} 
                            L${center + tubingW / 2 + 3} ${startY - 10} 
                            C${center + pumpW / 2 + 20} ${startY}, ${center + pumpW / 2 + 20} ${pumpTopY}, ${center + pumpW / 2 + 10} ${pumpTopY + 20}
                            L${center + pumpW / 2 + 10} ${pumpBottomY}
                            L${center + intakeW / 2 + 15} ${intakeRealTop}
                            L${center + motorW / 2 + 8} ${motorRealTop + 30}
                        `} fill="none" stroke="rgb(var(--color-primary))" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" className="cable-flow" />
                        {[100, 220, 340].map(off => (
                            <g key={off}>
                                <rect x={center + tubingW / 2} y={surfY + off - 4} width={8} height={8} rx="1.5" fill="rgb(var(--color-surface))" stroke="rgb(var(--color-text-muted) / 0.4)" />
                            </g>
                        ))}
                    </g>

                    {/* ══════════════════════════════════════════════════════
                        ── TRANSITION CONNECTORS & CENTRAL PIPE ──
                        Forman juntas que unen los componentes.
                        ══════════════════════════════════════════════════════ */}

                    {/* Central Pipe - Runs through everything to provide a unified structure */}
                    <rect
                        x={center - tubingW / 2}
                        y={startY}
                        width={tubingW}
                        height={espBottomY - startY}
                        fill="url(#cylinderMetal)"
                        stroke="rgb(var(--color-canvas))"
                        strokeWidth="0.5"
                    />

                    {/* tubing → discharge head (already naturally connected) */}

                    {/* pump flange bottom → intake cap top */}
                    <TransitionJoint
                        yTop={pumpBottomY}
                        yBottom={intakeRealTop}
                        topW={flangeW}
                        bottomW={intakeW + 10}
                    />

                    {/* intake cap bottom → seal top */}
                    <TransitionJoint
                        yTop={intakeRealBottom}
                        yBottom={sealRealTop}
                        topW={intakeW + 10}
                        bottomW={sealW}
                    />

                    {/* seal bottom → motor collar top */}
                    <TransitionJoint
                        yTop={sealRealBottom}
                        yBottom={motorRealTop}
                        topW={sealW}
                        bottomW={motorW + 6}
                    />

                    {/* motor collar bottom → sensor top */}
                    <TransitionJoint
                        yTop={motorRealBottom}
                        yBottom={sensorRealTop}
                        topW={motorW + 6}
                        bottomW={sensorW}
                    />

                    {/* ── ESP ASSEMBLY (componentes sobre los conectores) ── */}
                    <g filter="url(#deepShadow)">

                        {/* 1. DISCHARGE HEAD */}
                        <g className="component-hover">
                            <path d={`M${center - tubingW / 2} ${startY} L${center + tubingW / 2} ${startY} 
                                      C${center + pumpW / 2} ${startY + 10}, ${center + pumpW / 2} ${pumpTopY - 5}, ${center + pumpW / 2} ${pumpTopY}
                                      L${center - pumpW / 2} ${pumpTopY}
                                      C${center - pumpW / 2} ${pumpTopY - 5}, ${center - pumpW / 2} ${startY + 10}, ${center - tubingW / 2} ${startY} Z`}
                                fill="url(#cylinderDark)" stroke="#000" strokeWidth="1" />
                            <path d={`M${center - tubingW / 2} ${startY} C${center - pumpW / 2} ${startY + 10}, ${center - pumpW / 2} ${pumpTopY - 5}, ${center - pumpW / 2} ${pumpTopY}`}
                                fill="none" stroke="rgb(var(--color-text-main))" strokeWidth="0.8" opacity="0.15" />
                            <rect x={center - pumpW / 2 - 3} y={pumpTopY - 5} width={pumpW + 6} height={7} fill="url(#collarGrad)" stroke="#000" rx="1" />
                            <text x={center} y={startY + dischargeH * 0.55} fontSize={isReport ? 15 : 12} textAnchor="middle" fill="#000"
                                fontWeight="950" fontFamily="'Courier New', monospace" letterSpacing="0.08em">DISCHARGE HEAD</text>
                        </g>

                        {/* 2. PUMP SECTIONS */}
                        {Array.from({ length: housingCount }).map((_, i) => {
                            const y = pumpTopY + i * (bodyH + gapH);

                            // Lógica: cada cuerpo toma el maxStages, el último el resto
                            const totalStages = pump?.stages || 0;
                            const maxStagesPerBody = pump?.maxStages || 400; // Por defecto si no hay dato

                            let stagesThisBody = 0;
                            if (housingCount === 1) {
                                stagesThisBody = totalStages;
                            } else {
                                const assignedBefore = i * maxStagesPerBody;
                                stagesThisBody = Math.max(0, Math.min(maxStagesPerBody, totalStages - assignedBefore));
                            }

                            if (stagesThisBody <= 0 && i > 0) return null;

                            return (
                                <g key={i} className="component-hover">
                                    <rect x={center - pumpW / 2} y={y} width={pumpW} height={bodyH} fill="url(#cylinderPump)" stroke="#000" strokeWidth="0.8" />
                                    <rect x={center - pumpW / 2} y={y} width={2} height={bodyH} fill="#000" opacity="0.2" />
                                    <rect x={center + pumpW / 2 - 2} y={y} width={2} height={bodyH} fill="#000" opacity="0.2" />
                                    {Array.from({ length: Math.min(14, Math.ceil(bodyH / 14)) }, (_, s) => (
                                        <line key={s}
                                            x1={center - pumpW / 2} y1={y + (s + 1) * (bodyH / (Math.min(14, Math.ceil(bodyH / 14)) + 1))}
                                            x2={center + pumpW / 2} y2={y + (s + 1) * (bodyH / (Math.min(14, Math.ceil(bodyH / 14)) + 1))}
                                            stroke="#000" strokeWidth="1.2" opacity="0.3" />
                                    ))}
                                    {[-pumpW / 2, pumpW / 2 - 3].map((nx, ni) => [10, 25, 40, 55, 70].map((off, oi) => {
                                        if (y + off + 4 > y + bodyH - 8) return null;
                                        return <rect key={`${ni}-${oi}`} x={center + nx} y={y + off} width={3} height={4} fill="#000" opacity="0.5" />;
                                    }))}
                                    <rect x={center - flangeW / 2} y={y} width={flangeW} height={8} fill="url(#collarGrad)" stroke="#000" strokeWidth="0.5" />
                                    <rect x={center - flangeW / 2} y={y} width={flangeW} height={2} fill="rgb(var(--color-text-main))" opacity="0.1" />
                                    <rect x={center - flangeW / 2} y={y + bodyH - 8} width={flangeW} height={8} fill="url(#collarGrad)" stroke="#000" strokeWidth="0.5" />
                                    {[1.5, 3, 4.5, 6, 7.5].map(b => (
                                        <g key={b}>
                                            <circle cx={center - flangeW / 2 + b * 10} cy={y + 4} r="1.8" fill="rgb(var(--color-surface))" stroke="rgb(var(--color-text-muted))" strokeWidth="0.5" />
                                            <circle cx={center - flangeW / 2 + b * 10} cy={y + bodyH - 4} r="1.8" fill="rgb(var(--color-surface))" stroke="rgb(var(--color-text-muted))" strokeWidth="0.5" />
                                        </g>
                                    ))}
                                    <g>
                                        <text x={center} y={y + bodyH * 0.25 + 16} textAnchor="middle"
                                            fontSize={isReport ? 15 : 13} fill="#000"
                                            fontWeight="950" fontFamily="'Courier New', monospace">
                                            {pump?.model || 'PUMP'}
                                        </text>
                                        <line x1={center - 38} y1={y + bodyH * 0.25 + 22} x2={center + 38} y2={y + bodyH * 0.25 + 22} stroke="#000" strokeWidth="1.5" opacity="0.4" />
                                        <text x={center} y={y + bodyH * 0.25 + 38} textAnchor="middle"
                                            fontSize={isReport ? 13 : 11} fill="#000"
                                            fontWeight="900" fontFamily="'Courier New', monospace">
                                            {stagesThisBody} STAGES
                                        </text>
                                    </g>
                                    {i < housingCount - 1 && <Coupling y={y + bodyH + gapH / 2} />}
                                </g>
                            );
                        })}

                        <g transform={`translate(0, ${connH})`} className="component-hover">
                            <rect x={center - intakeW / 2 - 5} y={pumpBottomY} width={intakeW + 10} height={10} fill="url(#collarGrad)" stroke="#000" strokeWidth="0.5" />
                            <rect x={center - intakeW / 2} y={pumpBottomY + 10} width={intakeW} height={intakeH - 20} fill="rgb(var(--color-surface-light))" stroke="#000" />
                            <rect x={center - intakeW / 2 + 3} y={pumpBottomY + 13} width={intakeW - 6} height={intakeH - 26} fill="url(#screenPat)" stroke="#000" />
                            {[12, 26, 40].map(py => (
                                <g key={py}>
                                    <ellipse cx={center - intakeW / 2 + 1} cy={pumpBottomY + 10 + py} rx={5} ry={3.5} fill="rgb(var(--color-canvas))" stroke="rgb(var(--color-text-muted) / 0.4)" strokeWidth="0.8" />
                                    <ellipse cx={center + intakeW / 2 - 1} cy={pumpBottomY + 10 + py} rx={5} ry={3.5} fill="rgb(var(--color-canvas))" stroke="rgb(var(--color-text-muted) / 0.4)" strokeWidth="0.8" />
                                </g>
                            ))}
                            <rect x={center - intakeW / 2 - 5} y={pumpBottomY + intakeH - 10} width={intakeW + 10} height={10} fill="url(#collarGrad)" stroke="#000" strokeWidth="0.5" />
                            <text x={center} y={pumpBottomY + intakeH / 2 + 5} textAnchor="middle"
                                fontSize={isReport ? 15 : 12} fill="#000"
                                fontWeight="950" fontFamily="'Courier New', monospace" letterSpacing="0.08em">INTAKE</text>
                        </g>

                        {/* 4. PROTECTOR / SEAL */}
                        <g transform={`translate(0, ${connH * 2})`} className="component-hover">
                            <rect x={center - sealW / 2} y={intakeY + intakeH} width={sealW} height={sealH} fill="url(#sealGrad)" stroke="#000" strokeWidth="1" rx="3" />
                            <rect x={center - sealW / 2} y={intakeY + intakeH} width={2} height={sealH} fill="#000" opacity="0.3" rx="1" />
                            <rect x={center + sealW / 2 - 2} y={intakeY + intakeH} width={2} height={sealH} fill="#000" opacity="0.3" rx="1" />
                            <ellipse cx={center} cy={intakeY + intakeH + sealH / 2} rx={sealW / 2 - 8} ry={sealH / 2 - 10} fill="none" stroke="rgb(var(--color-primary) / 0.2)" strokeWidth="1" strokeDasharray="3,2" />
                            <rect x={center - sealW / 2 - 2} y={intakeY + intakeH + sealH / 2 - 4} width={sealW + 4} height={8} fill="url(#collarGrad)" stroke="#000" strokeWidth="0.5" />
                            <path d={`M${center - 10} ${intakeY + intakeH + 38} L${center + 10} ${intakeY + intakeH + 52} M${center + 10} ${intakeY + intakeH + 38} L${center - 10} ${intakeY + intakeH + 52}`} stroke="rgb(var(--color-text-main) / 0.3)" strokeWidth="1.2" />
                            <text x={center} y={intakeY + intakeH + 22} textAnchor="middle"
                                fontSize={isReport ? 15 : 12} fill="#000"
                                fontWeight="950" fontFamily="'Courier New', monospace" letterSpacing="0.06em">PROTECTOR</text>
                        </g>

                        {/* 5. MOTOR */}
                        <g transform={`translate(0, ${connH * 3})`} className="component-hover">
                            <rect x={center - motorW / 2} y={sealY + sealH} width={motorW} height={motorH} fill="url(#motorGrad)" stroke="#000" strokeWidth="1.5" rx="2" />
                            <rect x={center - motorW / 2} y={sealY + sealH} width={2} height={motorH} fill="#000" opacity="0.3" rx="1" />
                            <rect x={center + motorW / 2 - 2} y={sealY + sealH} width={2} height={motorH} fill="#000" opacity="0.3" rx="1" />
                            {Array.from({ length: Math.floor(motorH / 10) }).map((_, k) => (
                                <line key={k}
                                    x1={center - motorW / 2} y1={sealY + sealH + 8 + k * 10}
                                    x2={center + motorW / 2} y2={sealY + sealH + 8 + k * 10}
                                    stroke="#000" strokeWidth="1.2" opacity="0.4" />
                            ))}
                            <rect x={center - motorW / 2 - 3} y={sealY + sealH - 4} width={motorW + 6} height={8} fill="url(#collarGrad)" stroke="#000" rx="1" />
                            <rect x={center - motorW / 2 - 3} y={sealY + sealH + motorH - 4} width={motorW + 6} height={8} fill="url(#collarGrad)" stroke="#000" rx="1" />
                            {/* Pothead connector */}
                            <g transform={`translate(${center + motorW / 2 - 9}, ${sealY + sealH + 14})`}>
                                <rect width={16} height={28} rx="3" fill="rgb(var(--color-surface))" stroke="rgb(var(--color-text-muted) / 0.5)" strokeWidth="1.2" />
                                <rect x="2" y="-6" width="12" height="6" fill="rgb(var(--color-surface-light))" rx="2" stroke="rgb(var(--color-text-muted) / 0.5)" strokeWidth="0.8" />
                                {[-3, 0, 3].map(px => <circle key={px} cx={8 + px} cy={14} r="1.8" fill="rgb(var(--color-canvas))" stroke="rgb(var(--color-text-muted) / 0.5)" />)}
                            </g>
                            {/* Motor label - Sin caja de fondo */}
                            <g>
                                <text x={center} y={sealY + sealH + motorH / 2 - 4} textAnchor="middle"
                                    fontSize={isReport ? 16 : 14}
                                    fill="#000" fontWeight="950" fontFamily="'Courier New', monospace">
                                    {motor?.model || 'MOTOR'}
                                </text>
                                <line x1={center - 48} y1={sealY + sealH + motorH / 2 + 6} x2={center + 48} y2={sealY + sealH + motorH / 2 + 6} stroke="#000" strokeWidth="1.5" opacity="0.4" />
                                <text x={center} y={sealY + sealH + motorH / 2 + 22} textAnchor="middle"
                                    fontSize={isReport ? 17 : 15}
                                    fill="#000" fontWeight="950" fontFamily="'Courier New', monospace">
                                    {motorHp} HP
                                </text>
                            </g>
                        </g>

                        {/* 6. DOWNHOLE SENSOR */}
                        <g transform={`translate(0, ${connH * 4})`} className="component-hover">
                            <rect x={center - sensorW / 2} y={motorY + motorH} width={sensorW} height={sensorH} fill="url(#cylinderDark)" stroke="#000" strokeWidth="1.2" rx="6" />
                            <rect x={center - sensorW / 2} y={motorY + motorH} width={2} height={sensorH} fill="#000" opacity="0.3" rx="3" />
                            <rect x={center + sensorW / 2 - 2} y={motorY + motorH} width={2} height={sensorH} fill="#000" opacity="0.3" rx="3" />
                            <rect x={center - sensorW / 2 + 8} y={motorY + motorH + 22} width={sensorW - 16} height={5} rx="1" fill="rgb(var(--color-text-main))" opacity="0.4" />
                            <path d={`M${center - sensorW / 2 + 8} ${motorY + motorH + sensorH - 10} L${center} ${motorY + motorH + sensorH + 10} L${center + sensorW / 2 - 8} ${motorY + motorH + sensorH - 10} Z`} fill="rgb(var(--color-canvas))" stroke="rgb(var(--color-text-main))" />
                            <text x={center} y={motorY + motorH + 18} textAnchor="middle"
                                fontSize={isReport ? 14 : 11} fill="#000"
                                fontWeight="950" fontFamily="'Courier New', monospace" letterSpacing="0.04em">DS SENSOR</text>
                        </g>
                    </g>

                    {/* ── PERFORATIONS ── */}
                    <g>
                        {[8, 20, 32, 44, 56, 68].map(d => (
                            <g key={d}>
                                <line x1={center - casingW / 2 - 12} y1={perfsVisualY - perfsH / 2 + d} x2={center - casingW / 2 + 8} y2={perfsVisualY - perfsH / 2 + d} stroke="rgb(var(--color-warning))" strokeWidth="2" strokeDasharray="3,2" />
                                <line x1={center + casingW / 2 + 12} y1={perfsVisualY - perfsH / 2 + d} x2={center + casingW / 2 - 8} y2={perfsVisualY - perfsH / 2 + d} stroke="rgb(var(--color-warning))" strokeWidth="2" strokeDasharray="3,2" />
                            </g>
                        ))}
                        {[-20, 0, 20].map(off => (
                            <g key={off}>
                                <path d={`M${center - casingW / 2 - 12} ${perfsVisualY + off} l-22 -8`} stroke="rgb(var(--color-warning))" strokeWidth="2.5" opacity="0.45" strokeLinecap="round" />
                                <circle cx={center - casingW / 2 - 34} cy={perfsVisualY + off - 8} r="2.5" fill="rgb(var(--color-warning))" opacity="0.3" />
                                <path d={`M${center + casingW / 2 + 12} ${perfsVisualY + off} l 22 -8`} stroke="rgb(var(--color-warning))" strokeWidth="2.5" opacity="0.45" strokeLinecap="round" />
                                <circle cx={center + casingW / 2 + 34} cy={perfsVisualY + off - 8} r="2.5" fill="rgb(var(--color-warning))" opacity="0.3" />
                            </g>
                        ))}
                        {/*
                          Label zona cañoneada — Reposicionada al lateral DERECHO para claridad
                        */}
                        <g>
                            <path d={`M${center + casingW / 2} ${perfsVisualY} L${center + casingW / 2 + 40} ${perfsVisualY}`} stroke="rgb(var(--color-warning))" strokeWidth="2.5" strokeDasharray="4 2" />
                            <g transform={`translate(${center + casingW / 2 + 40}, ${perfsVisualY - 20})`}>
                                <rect
                                    width={140} height={45} rx="8"
                                    fill="rgb(var(--color-canvas) / 0.98)"
                                    stroke="rgb(var(--color-warning))" strokeWidth="2.5"
                                />
                                <rect width={8} height={45} rx="2" fill="rgb(var(--color-warning))" />
                                <text
                                    x={74} y={28}
                                    textAnchor="middle"
                                    fontSize={isReport ? 16 : 13} fill="rgb(var(--color-warning))" fontWeight="950"
                                    fontFamily="system-ui, sans-serif" letterSpacing="0.08em">
                                    PERFORATIONS
                                </text>
                            </g>
                        </g>
                    </g>

                    {/* ── DATA TAGS ── */}
                    <SmartTag y={pumpTopY + (bodyH * housingCount) * 0.35} label="Generated Head" value={safeResults.tdh?.toFixed(0)} unit="FT" side="right" color="blue" />
                    <SmartTag y={intakeRealTop + intakeH / 2} label="Intake Pressure" value={safeResults.pip?.toFixed(0)} unit="PSI" side="left" color="emerald" />
                    <SmartTag y={motorRealTop + motorH * 0.28} label="Motor Load" value={safeResults.motorLoad?.toFixed(1)} unit="%" side="left" color="amber" />
                    <SmartTag y={motorRealTop + motorH * 0.72} label="Motor Temp (Winding)" value={motorTemp?.toFixed(0)} unit="°F" side="right" color="red" />
                    <SmartTag y={fluidY + 22} label="Fluid Level (from Surf.)" value={(results.fluidLevel || 0).toFixed(0)} unit="FT" side="right" color="blue" />
                    {isReport && (
                        <>
                            <SmartTag y={surfY + 40} label="Cable Volt Drop" value={safeResults.electrical?.voltDrop?.toFixed(0)} unit="V Drop" side="right" color="red" />
                            <SmartTag y={surfY + 105} label="Cable Power Loss" value={safeResults.electrical?.kwLoss?.toFixed(1)} unit="kW Loss" side="right" color="amber" />
                            <SmartTag y={pumpTopY + bodyH * 0.72} label="Unit Stages" value={pump?.stages || 0} unit="STG" side="left" color="slate" />
                        </>
                    )}
                    <SmartTag y={casingBottomY - 18} label="Well TD" value={params.totalDepthMD} unit="ft" side="right" color="slate" />

                </svg>
            </div>
        </div >
    );
};