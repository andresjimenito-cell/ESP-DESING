
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  ReferenceDot,
  ReferenceLine
} from 'recharts';
import { EspPump } from '../types';
import { calculateOperatingRange, calculateBaseHead } from '../utils';
import { useLanguage } from '../i18n';

interface PumpChartProps {
  data: any[];
  pump: EspPump;
  currentFrequency: number;
  intersectionPoint?: { flow: number, head: number } | null;
  intersectionLabel?: string;
  referencePoints?: any[];
  secondaryPoint?: any;
  targetFlow?: number;
  className?: string;
}

export const PumpChart: React.FC<PumpChartProps> = ({ data, pump, currentFrequency, intersectionPoint, intersectionLabel, referencePoints, targetFlow, className }) => {
  const { t } = useLanguage();

  // Theme Colors linked to CSS Variables
  const colorPrimary = 'rgb(var(--color-primary))';
  const colorSecondary = 'rgb(var(--color-secondary))';
  const colorTextMuted = 'rgb(var(--color-text-muted))';
  const colorGrid = 'rgb(var(--color-surface-light))';
  const colorSurface = 'rgb(var(--color-surface))';

  // Calcular rangos para visualización si es necesario
  const range = calculateOperatingRange(pump, currentFrequency);

  const formatNumber = (val: number) => {
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const hasData = useMemo(() => {
    if (!pump) return false;
    // Extremely relaxed check: just need a pump and a non-zero h0 or maxRate
    return (pump.stages >= 1) || (pump.maxRate > 0) || (pump.maxHead > 0);
  }, [pump]);

  const safeData = useMemo(() => {
    if (!data) return [];
    return data.map(d => ({
      ...d,
      flow: d.flow ?? 0,
    }));
  }, [data]);

  // Calculate intersection dots for limits (Red Dots)
  const limitDots = useMemo(() => {
    if (!hasData) return [];
    const baseFreq = pump.nameplateFrequency || 60;
    // Standard frequencies plotted + current user frequency
    const freqsToCheck = [30, 40, 50, 60, 70, currentFrequency];
    const uniqueFreqs = Array.from(new Set(freqsToCheck));

    return uniqueFreqs.flatMap(f => {
      const ratio = f / baseFreq;
      if (ratio <= 0) return [];

      // Min Limit Point
      const qMinBase = pump.minRate;
      const hMinBase = calculateBaseHead(qMinBase, pump);
      const qMinActual = qMinBase * ratio;
      const hMinActual = hMinBase * Math.pow(ratio, 2);

      // Max Limit Point
      const qMaxBase = pump.maxRate;
      const hMaxBase = calculateBaseHead(qMaxBase, pump);
      const qMaxActual = qMaxBase * ratio;
      const hMaxActual = hMaxBase * Math.pow(ratio, 2);

      return [
        { x: qMinActual, y: hMinActual },
        { x: qMaxActual, y: hMaxActual }
      ];
    });
  }, [pump, currentFrequency, hasData]);

  if (!hasData) {
    return (
      <div className={`w-full h-full flex flex-col p-6 bg-surface rounded-[32px] relative justify-center items-center border border-white/5 ${className}`}>
        <h3 className="text-4xl font-black text-txt-muted tracking-widest uppercase select-none opacity-50">
          {t('chart.noData')}
        </h3>
        <p className="text-txt-muted font-bold mt-4 text-xl">{t('chart.noDataSub')}</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface/95 p-5 border border-white/10 shadow-2xl rounded-2xl text-sm z-50 backdrop-blur-md min-w-[280px]">
          <p className="font-bold border-b border-white/10 pb-2 mb-3 text-txt-muted flex justify-between gap-8 text-xs uppercase tracking-wider">
            <span className="opacity-70">{t('chart.flow')}</span>
            <span className="font-mono text-primary text-base">{formatNumber(label)} BPD</span>
          </p>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => {
              if (entry.value === null || entry.value === undefined) return null;

              // Rename keys for better readability in tooltip
              let name = entry.name;
              if (entry.dataKey === 'pumpMin') name = t('chart.rangeMin');
              if (entry.dataKey === 'sysMin') name = t('chart.sysMin');
              if (entry.dataKey === 'pumpMax') name = t('chart.rangeMax');
              if (entry.dataKey === 'sysMax') name = t('chart.sysMax');
              if (entry.dataKey === 'designPumpCurve') name = t('chart.design');
              if (entry.dataKey === 'userHz') name = `${t('p5.pump')} @ ${currentFrequency}Hz`;
              if (entry.dataKey === 'systemCurve') name = t('chart.sysCurve');
              if (entry.dataKey === 'minLimit') name = t('chart.limitMin');
              if (entry.dataKey === 'maxLimit') name = t('chart.limitMax');

              // Standard frequencies
              if (entry.dataKey === 'hz30') name = '30 Hz';
              if (entry.dataKey === 'hz40') name = '40 Hz';
              if (entry.dataKey === 'hz50') name = '50 Hz';
              if (entry.dataKey === 'hz60') name = '60 Hz';
              if (entry.dataKey === 'hz70') name = '70 Hz';

              const isEff = entry.dataKey === 'efficiency';
              const unit = isEff ? '%' : ' ft';
              const val = entry.value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

              return (
                <div key={index} className="flex justify-between gap-6 items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: entry.color, color: entry.color }}></div>
                    <span className="font-bold text-txt-muted text-xs">{name}</span>
                  </div>
                  <span className="font-mono font-bold text-txt-main text-sm">
                    {val}{unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={className} style={{ width: '100%', height: '100%', minHeight: '300px', position: 'relative', display: 'flex', flexDirection: 'column', padding: '1rem', borderRadius: '32px', backgroundColor: 'rgb(var(--color-surface))' }}>

      {/* Chart Header overlaid - Absolute Position */}
      <div className="absolute top-4 left-8 z-10 pointer-events-none opacity-80">
        <h3 className="text-xl font-black text-txt-muted tracking-tight leading-none uppercase">
          {t('p5.perfCurve')}
        </h3>
        <p className="text-[10px] font-bold text-txt-muted uppercase mt-1 tracking-wide">
          {pump.manufacturer} | {pump.series} | <span className="text-secondary">{pump.model}</span>
        </p>
      </div>

      <div style={{ flex: 1, minHeight: 0, marginTop: '0.5rem' }}>
        <ResponsiveContainer width="100%" height="99%" minHeight={250}>
          <LineChart
            data={safeData}
            margin={{ top: 30, right: 30, left: 10, bottom: 20 }}
          >
            <defs>
              <filter id="glow-primary" height="300%" width="300%" x="-100%" y="-100%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={colorPrimary} floodOpacity="0.5" />
              </filter>
              <filter id="glow-secondary" height="300%" width="300%" x="-100%" y="-100%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={colorSecondary} floodOpacity="0.4" />
              </filter>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} strokeWidth={1} vertical={false} />

            <XAxis
              dataKey="flow"
              type="number"
              domain={[0, 'auto']}
              tick={{ fontSize: 10, fill: colorTextMuted, fontWeight: 700 }}
              tickLine={{ stroke: colorGrid }}
              axisLine={{ stroke: colorGrid, strokeWidth: 2 }}
              allowDataOverflow={false}
              height={30}
              tickMargin={5}
            >
              <Label value={`${t('chart.flow')} (BPD)`} offset={0} position="insideBottom" dy={20} style={{ fontSize: 10, fill: colorTextMuted, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }} />
            </XAxis>

            <YAxis
              yAxisId="left"
              domain={[0, 'auto']}
              tick={{ fontSize: 10, fill: colorTextMuted, fontWeight: 700 }}
              tickLine={{ stroke: colorGrid }}
              axisLine={{ stroke: colorGrid, strokeWidth: 2 }}
              tickFormatter={formatNumber}
              width={45}
              tickMargin={5}
            >
              <Label value={`${t('chart.head')} (ft)`} angle={-90} position="insideLeft" dx={-5} style={{ fontSize: 10, fill: colorTextMuted, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }} />
            </YAxis>

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: colorTextMuted, strokeWidth: 2, strokeDasharray: '4 4' }} />

            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ bottom: 0, left: 0, right: 0, fontSize: '10px', fontWeight: 700, color: colorTextMuted, paddingTop: '5px' }}
            />

            {/* --- Standard Frequency Curves (Ghost Lines) --- */}
            <Line yAxisId="left" type="monotone" dataKey="hz70" stroke={colorTextMuted} strokeWidth={1.5} dot={false} name="70 Hz" isAnimationActive={false} connectNulls={false} strokeOpacity={0.2} />
            <Line yAxisId="left" type="monotone" dataKey="hz60" stroke={colorTextMuted} strokeWidth={1.5} dot={false} name="60 Hz" isAnimationActive={false} connectNulls={false} strokeOpacity={0.2} />
            <Line yAxisId="left" type="monotone" dataKey="hz50" stroke={colorTextMuted} strokeWidth={1.5} dot={false} name="50 Hz" isAnimationActive={false} connectNulls={false} strokeOpacity={0.2} />
            <Line yAxisId="left" type="monotone" dataKey="hz40" stroke={colorTextMuted} strokeWidth={1.5} dot={false} name="40 Hz" isAnimationActive={false} connectNulls={false} strokeOpacity={0.2} />
            <Line yAxisId="left" type="monotone" dataKey="hz30" stroke={colorTextMuted} strokeWidth={1} dot={false} name="30 Hz" isAnimationActive={false} connectNulls={false} strokeOpacity={0.2} />

            {/* --- SYSTEM CURVES --- */}
            <Line yAxisId="left" type="monotone" dataKey="sysMin" stroke={colorSecondary} strokeWidth={1} dot={false} name={t('chart.sysMin')} isAnimationActive={false} connectNulls={false} opacity={0.4} />
            <Line yAxisId="left" type="monotone" dataKey="sysMax" stroke={colorSecondary} strokeWidth={1} dot={false} name={t('chart.sysMax')} isAnimationActive={false} connectNulls={false} opacity={0.4} />

            {/* MAIN SYSTEM CURVE (Target/Actual) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="systemCurve"
              stroke={colorSecondary}
              strokeWidth={3}
              dot={false}
              name={t('chart.sysCurve')}
              isAnimationActive={false}
              strokeDasharray="8 6"
              connectNulls={false}
              filter="url(#glow-secondary)"
            />

            {/* --- PUMP OPERATING LIMITS --- */}
            <Line yAxisId="left" type="monotone" dataKey="pumpMin" stroke={colorTextMuted} strokeWidth={1.5} dot={false} name={t('chart.rangeMin')} isAnimationActive={false} connectNulls={false} strokeDasharray="5 5" opacity={0.4} />
            <Line yAxisId="left" type="monotone" dataKey="pumpMax" stroke={colorTextMuted} strokeWidth={1.5} dot={false} name={t('chart.rangeMax')} isAnimationActive={false} connectNulls={false} strokeDasharray="5 5" opacity={0.4} />

            <Line yAxisId="left" type="monotone" dataKey="minLimit" stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name={t('chart.limitMin')} isAnimationActive={false} connectNulls={false} opacity={0.8} />
            <Line yAxisId="left" type="monotone" dataKey="maxLimit" stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} dot={false} name={t('chart.limitMax')} isAnimationActive={false} connectNulls={false} opacity={0.8} />

            {/* --- MAIN PUMP CURVE (User Hz) - DOTTED & THINNER --- */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="userHz"
              stroke={colorPrimary}
              strokeWidth={3}
              strokeDasharray="7 5"
              dot={false}
              name={`${t('chart.pumpCurve')} (${currentFrequency} Hz)`}
              activeDot={{ r: 5, strokeWidth: 2, fill: colorPrimary, stroke: '#fff' }}
              connectNulls={false}
              strokeLinecap="round"
              filter="url(#glow-primary)"
              animationDuration={500}
            />

            {/* --- LIMIT INTERSECTION DOTS (Red Points) --- */}
            {limitDots.map((dot, idx) => (
              <ReferenceDot
                key={`limit-dot-${idx}`}
                yAxisId="left"
                x={dot.x}
                y={dot.y}
                r={2.5}
                fill="#ef4444"
                stroke="none"
              />
            ))}

            {/* --- REFERENCE LINES & DOTS --- */}

            {/* Target Flow Line - TRANSPARENT GRAY --- */}
            {targetFlow && targetFlow > 0 && (
              <ReferenceLine
                yAxisId="left"
                x={targetFlow}
                stroke={colorTextMuted}
                strokeDasharray="5 5"
                strokeWidth={1.5}
                opacity={0.5}
                label={{ position: 'insideTopLeft', value: t('chart.target'), fill: colorTextMuted, fontSize: 10, fontWeight: '700', offset: 10 }}
              />
            )}

            {/* Intersection Point (Operating Point) */}
            {intersectionPoint && (
              <ReferenceDot
                yAxisId="left"
                x={intersectionPoint.flow}
                y={intersectionPoint.head}
                r={6}
                fill="#10b981"
                stroke="#fff"
                strokeWidth={3}
              />
            )}

            {/* Reference Points (e.g., from History Match) */}
            {referencePoints && referencePoints.map((pt, i) => (
              <ReferenceDot
                key={i}
                yAxisId="left"
                x={pt.flow}
                y={pt.head}
                r={5}
                fill={pt.color || '#f59e0b'}
                stroke="#fff"
                strokeWidth={1.5}
              >
                <Label value={pt.label} position="top" fill={pt.color || '#f59e0b'} fontSize={9} fontWeight="bold" />
              </ReferenceDot>
            ))}

          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
