
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
  ReferenceLine
} from 'recharts';
import { useLanguage } from '../i18n';

interface Props {
  data: any[];
  currentFlow: number;
  pump: any;
  frequency: number;
  className?: string;
}

export const PerformanceCurveMultiAxis: React.FC<Props> = ({ data, currentFlow, pump, frequency, className }) => {
  const { t } = useLanguage();
  if (!pump) return <div className="flex items-center justify-center h-full text-txt-muted font-bold">SELECT A PUMP TO VIEW CURVES</div>;

  // Theme Colors linked to CSS Variables
  const colorHead = 'rgb(var(--color-secondary))'; // Blue/Secondary for Head
  const colorPower = 'rgb(var(--color-primary))';  // Orange/Primary for Power
  const colorEff = '#10b981';  // Emerald/Green for Efficiency (Fixed contrast)

  const colorGrid = 'rgb(var(--color-surface-light))';
  const colorText = 'rgb(var(--color-text-muted))';
  const colorBg = 'rgb(var(--color-surface))';

  const opPoint = useMemo(() => {
    if (!data || data.length === 0) return null;
    return data.reduce((prev, curr) => {
      const dCurr = Math.abs((curr.flow || 0) - currentFlow);
      const dPrev = Math.abs((prev.flow || 0) - currentFlow);
      return dCurr < dPrev ? curr : prev;
    }, data[0] || { flow: 0 });
  }, [data, currentFlow]);

  const safeData = useMemo(() => {
    if (!data) return [];
    return data.map(d => ({
      flow: d.flow ?? 0,
      headNew: (d.headNew !== undefined && !isNaN(d.headNew)) ? d.headNew : null,
      headCurr: (d.headCurr !== undefined && !isNaN(d.headCurr)) ? d.headCurr : null,
      effNew: (d.effNew !== undefined && !isNaN(d.effNew)) ? d.effNew : null,
      effCurr: (d.effCurr !== undefined && !isNaN(d.effCurr)) ? d.effCurr : null,
      pwrNew: (d.pwrNew !== undefined && !isNaN(d.pwrNew)) ? d.pwrNew : null,
      pwrCurr: (d.pwrCurr !== undefined && !isNaN(d.pwrCurr)) ? d.pwrCurr : null,
      systemCurve: (d.systemCurve !== undefined && !isNaN(d.systemCurve)) ? d.systemCurve : null,
      designSystemCurve: (d.designSystemCurve !== undefined && !isNaN(d.designSystemCurve)) ? d.designSystemCurve : null,
      hz30: d.hz30, hz40: d.hz40, hz50: d.hz50, hz60: d.hz60, hz70: d.hz70,
      minLimit: d.minLimit, maxLimit: d.maxLimit,
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className={`w-full h-full flex flex-col p-6 bg-surface rounded-[32px] relative justify-center items-center border border-white/5 ${className}`}>
        <h3 className="text-4xl font-black text-txt-muted tracking-widest uppercase select-none opacity-50">
          {t('chart.noData')}
        </h3>
        <p className="text-txt-muted font-bold mt-4 text-sm">{t('chart.noDataSub')}</p>
      </div>
    );
  }

  return (
    <div className={`${className}`} style={{ width: '100%', height: '100%', minHeight: '350px' }}>
      <div className="flex justify-between items-center mb-2 px-4">
        <div className="flex gap-6 text-[10px] font-bold bg-white/5 p-2 rounded-lg border border-white/5 uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: colorHead }}></div> Head (ft)</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: colorEff }}></div> Eff (%)</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: colorPower }}></div> Power (HP)</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="99%" minHeight={300}>
        <ComposedChart data={safeData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} vertical={false} opacity={0.5} />

          {/* X AXIS: FLOW */}
          <XAxis
            dataKey="flow"
            type="number"
            tick={{ fontSize: 11, fill: colorText, fontWeight: 700 }}
            tickLine={false}
            axisLine={{ stroke: colorGrid }}
            domain={['auto', 'auto']}
          >
            <Label value="CAPACITY (BPD)" offset={-10} position="insideBottom" style={{ fontSize: 10, fill: colorText, fontWeight: 800 }} />
          </XAxis>

          {/* Y AXIS 1: HEAD (LEFT) */}
          <YAxis
            yAxisId="left"
            orientation="left"
            tick={{ fontSize: 11, fill: colorHead, fontWeight: 700 }}
            tickLine={false}
            axisLine={{ stroke: colorHead, strokeWidth: 2 }}
            label={{ value: 'HEAD (ft)', angle: -90, position: 'insideLeft', fill: colorHead, fontSize: 10, fontWeight: 800 }}
          />

          {/* Y AXIS 2: EFFICIENCY (RIGHT) - 0 to 100% */}
          <YAxis
            yAxisId="right_eff"
            orientation="right"
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: colorEff, fontWeight: 700 }}
            tickLine={false}
            axisLine={{ stroke: colorEff, strokeWidth: 2 }}
            label={{ value: 'EFFICIENCY (%)', angle: 90, position: 'insideRight', fill: colorEff, fontSize: 10, fontWeight: 800 }}
          />

          {/* Y AXIS 3: POWER (RIGHT) - Starts at 0 */}
          <YAxis
            yAxisId="right_pwr"
            orientation="right"
            domain={[0, 'auto']}
            tick={{ fontSize: 11, fill: colorPower, fontWeight: 700 }}
            tickLine={false}
            axisLine={false}
            dx={10}
            label={{ value: 'POWER (HP)', angle: 90, position: 'insideRight', offset: 40, fill: colorPower, fontSize: 10, fontWeight: 800 }}
          />

          <Tooltip
            contentStyle={{ backgroundColor: 'rgb(var(--color-surface) / 0.9)', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '16px', color: colorText, fontSize: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)' }}
            itemStyle={{ fontWeight: 'bold' }}
            labelStyle={{ color: colorText, marginBottom: '5px', fontWeight: 900 }}
            formatter={(val: number) => val?.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            labelFormatter={(label) => `Flow: ${Math.round(Number(label))} BPD`}
          />

          <Legend verticalAlign="top" height={36} iconType="plainline" wrapperStyle={{ fontSize: '11px', fontWeight: 700, color: colorText }} />

          {/* --- CURVES --- */}

          {/* 1. HEAD (Blue/Secondary) */}
          <Line yAxisId="left" type="monotone" dataKey="headNew" stroke={colorHead} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Head (Design)" opacity={0.5} />
          <Line yAxisId="left" type="monotone" dataKey="headCurr" stroke={colorHead} strokeWidth={4} dot={false} name="Head (Actual)" />

          {/* 2. EFFICIENCY (Emerald) */}
          <Line yAxisId="right_eff" type="monotone" dataKey="effNew" stroke={colorEff} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Eff (Design)" opacity={0.5} />
          <Line yAxisId="right_eff" type="monotone" dataKey="effCurr" stroke={colorEff} strokeWidth={3} dot={false} name="Eff (Actual)" />

          {/* 3. POWER (Orange/Primary) */}
          <Line yAxisId="right_pwr" type="monotone" dataKey="pwrNew" stroke={colorPower} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Power (Design)" opacity={0.5} />
          <Line yAxisId="right_pwr" type="monotone" dataKey="pwrCurr" stroke={colorPower} strokeWidth={3} dot={false} name="Power (Actual)" />

          {/* 4. OPERATING LIMITS (ROR) */}
          <Line yAxisId="left" type="monotone" dataKey="minLimit" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Min Limit" opacity={0.8} />
          <Line yAxisId="left" type="monotone" dataKey="maxLimit" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Max Limit" opacity={0.8} />

          {/* OP Line */}
          <ReferenceLine yAxisId="left" x={currentFlow} stroke={colorText} strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'OP', fill: colorText, fontSize: 10, fontWeight: 900 }} />

          {opPoint && (
            <>
              <ReferenceDot yAxisId="left" x={opPoint.flow} y={opPoint.headCurr} r={5} fill={colorHead} stroke="white" strokeWidth={2} />
              <ReferenceDot yAxisId="right_eff" x={opPoint.flow} y={opPoint.effCurr} r={5} fill={colorEff} stroke="white" strokeWidth={2} />
              <ReferenceDot yAxisId="right_pwr" x={opPoint.flow} y={opPoint.pwrCurr} r={5} fill={colorPower} stroke="white" strokeWidth={2} />
            </>
          )}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
