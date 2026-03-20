
import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label,
  ReferenceDot,
  ReferenceLine,
} from 'recharts';
import { EspMotor } from '../types';
import { useLanguage } from '../i18n';

interface MotorChartProps {
  motor: EspMotor | undefined;
  currentLoadPct: number;
  motorEffNameplate?: number;
}

function cssVar(name: string): string {
  if (typeof window === 'undefined') return '#888';
  const val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return val ? `rgb(${val})` : '#888';
}

export const MotorChart: React.FC<MotorChartProps> = ({ motor, currentLoadPct, motorEffNameplate = 88 }) => {
  const { t } = useLanguage();

  const data = useMemo(() => {
    if (!motor) return [];
    const curve = [];
    for (let load = 0; load <= 130; load += 5) {
      let eff = 0;
      if (load > 0) {
        const rise = 1 - Math.exp(-load / 25);
        const drop = load > 100 ? (load - 100) * 0.05 : 0;
        eff = (motorEffNameplate / 0.95) * rise - drop;
        if (eff > motorEffNameplate + 2) eff = motorEffNameplate + 2;
      }
      let pf = 0;
      if (load > 0) pf = 0.88 * (1 - Math.exp(-load / 40));
      let ampsPct = 0;
      if (load > 0) ampsPct = (load * 0.9) + 10;
      curve.push({
        load,
        efficiency: Math.max(0, eff),
        pf: Math.max(0, pf * 100),
        amps: ampsPct,
      });
    }
    return curve;
  }, [motor, motorEffNameplate]);

  if (!motor) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-txt-muted">
        <h3 className="text-2xl font-black uppercase tracking-widest">{t('chart.noMotor')}</h3>
      </div>
    );
  }

  const operatingPoint = data.find(d => d.load >= currentLoadPct) || data[data.length - 1];
  const colorPrimary = cssVar('--color-primary');
  const colorSecondary = cssVar('--color-secondary');
  const colorGrid = cssVar('--color-surface-light');
  const colorMuted = cssVar('--color-text-muted');

  return (
    <div className="w-full h-full flex flex-col p-1 relative min-h-[300px]">
      <div className="absolute top-2 left-4 z-10 pointer-events-none opacity-80">
        <h3 className="text-sm font-black text-txt-main tracking-tight leading-none uppercase">{t('p5.motorCurve')}</h3>
        <p className="text-[9px] font-bold text-txt-muted uppercase mt-0.5 tracking-wide">
          {motor.manufacturer} {motor.model} ({motor.hp} HP)
        </p>
      </div>

      <div className="flex-1 min-h-0 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} vertical />

            <XAxis dataKey="load" type="number" domain={[0, 130]}
              tick={{ fontSize: 10, fill: colorMuted, fontWeight: 600 }} height={30} tickMargin={5}>
              <Label value={`% ${t('chart.motorLoad')}`} offset={-15} position="insideBottom"
                style={{ fontSize: 10, fill: colorMuted, fontWeight: 800, textTransform: 'uppercase' }} />
            </XAxis>

            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: colorMuted, fontWeight: 600 }} width={30}>
              <Label value={`${t('chart.efficiency')} & PF (%)`} angle={-90} position="insideLeft"
                style={{ fontSize: 10, fill: colorMuted, fontWeight: 800, textTransform: 'uppercase' }} />
            </YAxis>

            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(var(--color-canvas, 10 11 15))',
                borderColor: 'rgb(var(--color-surface-light, 30 35 48))',
                borderRadius: '12px', color: '#fff',
              }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ color: colorMuted, fontSize: '10px', fontWeight: 'bold', marginBottom: '8px' }}
              formatter={(value: number, name: string) => [
                value.toFixed(1),
                name === 'pf' ? `${t('chart.powerFactor')} %`
                  : name === 'efficiency' ? `${t('chart.efficiency')} %`
                    : name,
              ]}
            />

            <Legend verticalAlign="top" align="right" height={36} iconType="plainline" wrapperStyle={{ fontSize: '10px' }} />

            <ReferenceLine x={100} stroke={colorMuted} strokeDasharray="3 3">
              <Label value={t('chart.ratedLoad')} position="insideTopLeft" angle={-90} fill={colorMuted} fontSize={9} fontWeight={700} />
            </ReferenceLine>

            <Line type="monotone" dataKey="efficiency" stroke={colorPrimary} strokeWidth={2.5} dot={false} name={`${t('chart.efficiency')} %`} />
            <Line type="monotone" dataKey="pf" stroke={colorSecondary} strokeWidth={2.5} dot={false} name={`${t('chart.powerFactor')} %`} />

            <ReferenceDot x={currentLoadPct} y={operatingPoint.efficiency} r={5} fill={colorPrimary} stroke="#fff" strokeWidth={2}>
              <Label value={t('chart.opPoint')} position="top" fill={colorPrimary} fontSize={9} fontWeight={900} />
            </ReferenceDot>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
