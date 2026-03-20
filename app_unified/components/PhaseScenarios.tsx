
import React, { useMemo } from 'react';
import { Target, TrendingUp, TrendingDown, ArrowRight, Layers, Activity, Droplets, Flame, ArrowUpRight, Lock, AlertTriangle, CheckCircle2, Sparkles, RefreshCcw, Unlock } from 'lucide-react';
import { SystemParams, ScenarioData } from '../types';
import { calculateTDH, calculatePwf, calculatePIP, generateIPRData, calculateAOF, calculateSystemResults } from '../utils';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceDot, Label, ReferenceLine } from 'recharts';
import { useLanguage } from '../i18n';

interface Props {
    params: SystemParams;
    setParams: React.Dispatch<React.SetStateAction<SystemParams>>;
    results: any;
}

const getScenarioParams = (baseParams: SystemParams, scenario: ScenarioData): SystemParams => {
    return {
        ...baseParams,
        inflow: { ...baseParams.inflow, ip: scenario.ip },
        fluids: { ...baseParams.fluids, waterCut: scenario.waterCut, gor: scenario.gor, glr: scenario.gor * (1 - scenario.waterCut / 100) },
        pressures: { ...baseParams.pressures, totalRate: scenario.rate }
    };
};

const ScenarioCard = ({ type, data, onChange, baseParams, active, onActivate, globalResults, maxAOF }: { type: 'min' | 'target' | 'max', data: ScenarioData, onChange: (field: keyof ScenarioData, value: number) => void, baseParams: SystemParams, active: boolean, onActivate: () => void, globalResults: any, maxAOF: number }) => {
    const { t } = useLanguage();

    // Calculate local feasibility
    const calcParams = getScenarioParams(baseParams, data);
    let localResults;

    const dummyPump = { id: 'scenario_calc', stages: 1, nameplateFrequency: 60, minRate: 0, maxRate: 0, bepRate: 0, maxEfficiency: 70, h0: 0, h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, p0: 0, p1: 0, p2: 0, p3: 0, p4: 0, p5: 0 } as any;
    localResults = calculateSystemResults(calcParams.pressures.totalRate, null, calcParams, dummyPump, data.frequency);

    const colorMap = { min: 'text-secondary', target: 'text-primary', max: 'text-primary' };
    const baseBorder = 'border-surface-light/30';
    const activeBorder = 'border-primary/60';
    const glowColor = 'rgb(var(--color-primary)/0.2)';

    const activeClass = active ? `border-2 ${activeBorder} shadow-[0_0_15px_${glowColor}] scale-[1.01] z-10` : `hover:border-txt-muted opacity-80 hover:opacity-100 hover:scale-[1.01] hover:shadow-[0_0_8px_${glowColor}]`;
    const label = type === 'min' ? t('scen.min') : type === 'target' ? t('scen.target') : t('scen.max');
    const Icon = type === 'min' ? TrendingDown : type === 'target' ? Target : TrendingUp;

    // INTELLIGENCE CHECKS
    const isImpossible = data.rate > maxAOF;
    const isCriticalDrawdown = localResults.pwf < (baseParams.inflow.pStatic * 0.1); // <10% Pr

    let statusColor = "text-primary";
    let statusText = t('scen.feasible');
    let StatusIcon = CheckCircle2;

    if (isImpossible) {
        statusColor = "text-danger";
        statusText = t('scen.impossible');
        StatusIcon = AlertTriangle;
    } else if (isCriticalDrawdown) {
        statusColor = "text-warning";
        statusText = t('scen.critical');
        StatusIcon = AlertTriangle;
    }

    return (
        <div
            onClick={onActivate}
            className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border-2 transition-all duration-500 cursor-pointer w-full p-5 light-sweep h-[260px]
                ${active
                    ? `border-primary/50 shadow-glow-primary glass-surface !bg-primary/5 scale-[1.02] z-10`
                    : `border-white/5 glass-surface opacity-80 hover:opacity-100 hover:border-white/20 hover:scale-[1.01]`
                }
                ${isImpossible ? 'border-danger/40 bg-danger/5' : ''}
            `}
        >
            {/* Selection indicator Side */}
            <div className={`absolute left-0 top-0 h-full w-1.5 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}
                ${type === 'min' ? 'bg-secondary' : type === 'target' ? 'bg-primary' : 'bg-primary/70'}
            `}></div>

            {/* Header / Icon */}
            <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
                <div className={`p-3 rounded-2xl border transition-all duration-500 ${active ? 'bg-white/5 border-white/10' : 'bg-white/5 border-white/5'} shadow-inner`}>
                    <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-txt-muted'}`} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-txt-main' : 'text-txt-muted'}`}>{label}</span>
            </div>

            {/* Input Section - Rate (The big value) */}
            <div className={`flex flex-col gap-1 min-w-[120px] bg-canvas/60 p-3 rounded-2xl border ${active ? 'border-white/10' : 'border-white/5'} shadow-inner`}>
                <label className="text-[9px] font-black text-txt-muted uppercase tracking-widest leading-none mb-1">{t('scen.prodRate')}</label>
                <div className="flex items-baseline gap-1">
                    <input
                        type="number"
                        value={data.rate}
                        onChange={(e) => onChange('rate', parseFloat(e.target.value))}
                        className={`bg-transparent w-full text-2xl font-black outline-none font-mono tracking-tighter ${isImpossible ? 'text-danger' : 'text-txt-main'}`}
                    />
                    <span className="text-[9px] font-bold text-txt-muted opacity-50">BPD</span>
                </div>
                {/* Visual Progress Mini */}
                <div className="h-1 w-full bg-surface-light/30 rounded-full overflow-hidden mt-1">
                    <div className={`h-full transition-all duration-1000 
                        ${isImpossible ? 'bg-danger' : isCriticalDrawdown ? 'bg-warning' : 'bg-primary'}
                    `} style={{ width: `${Math.min(100, (data.rate / maxAOF) * 100)}%` }}></div>
                </div>
            </div>

            {/* Sub Params Grid - Vertical but compact */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
                <div className="flex justify-between items-center bg-canvas/30 px-3 py-1.5 rounded-xl border border-white/5 light-sweep">
                    <span className="text-[8px] font-black text-txt-muted uppercase">IP</span>
                    <input type="number" step="0.1" value={data.ip} onChange={(e) => onChange('ip', parseFloat(e.target.value))} className="bg-transparent w-16 text-right text-xs font-black outline-none font-mono text-secondary" />
                </div>
                <div className="flex justify-between items-center bg-canvas/30 px-3 py-1.5 rounded-xl border border-white/5 light-sweep">
                    <span className="text-[8px] font-black text-txt-muted uppercase">WC%</span>
                    <input type="number" value={data.waterCut} onChange={(e) => onChange('waterCut', parseFloat(e.target.value))} className="bg-transparent w-16 text-right text-xs font-black outline-none font-mono text-txt-main" />
                </div>
                <div className="flex justify-between items-center bg-canvas/30 px-3 py-1.5 rounded-xl border border-white/5 light-sweep">
                    <span className="text-[8px] font-black text-txt-muted uppercase">GOR</span>
                    <input type="number" value={data.gor} onChange={(e) => onChange('gor', parseFloat(e.target.value))} className="bg-transparent w-16 text-right text-xs font-black outline-none font-mono text-txt-muted" />
                </div>
            </div>

            {/* Results Section */}
            <div className="flex flex-col gap-2 min-w-[100px] pl-4 border-l border-white/10">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-txt-muted uppercase tracking-widest">Pwf (Psi)</span>
                    <span className={`text-lg font-black font-mono tracking-tighter ${localResults.pwf < 200 ? 'text-danger' : 'text-txt-main'}`}>
                        {localResults.pwf?.toFixed(0) || '--'}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-txt-muted uppercase tracking-widest">TDH (Ft)</span>
                    <span className={`text-lg font-black font-mono tracking-tighter ${localResults.tdh > 0 ? 'text-primary' : 'text-txt-muted'}`}>
                        {localResults.tdh > 0 ? localResults.tdh.toFixed(0) : 'N/A'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export const PhaseScenarios: React.FC<Props> = ({ params, setParams, results }) => {
    const { t } = useLanguage();

    // Theme colors
    const colorPrimary = 'rgb(var(--color-primary))';
    const colorSecondary = 'rgb(var(--color-secondary))';
    const colorTextMuted = 'rgb(var(--color-text-muted))';
    const colorGrid = 'rgb(var(--color-surface-light))';

    // Compute Absolute Open Flow (AOF) for limit checks
    const aof = calculateAOF(params);

    const allCurvesData = useMemo(() => {
        const pStatic = params.inflow.pStatic; const { min, target, max } = params.targets; const model = params.inflow.model;
        const getMax = (ip: number) => model === 'Vogel' ? (ip * pStatic) / 1.8 : ip * pStatic;
        const maxAOF = Math.max(getMax(min.ip), getMax(target.ip), getMax(max.ip));
        const steps = 60; const limit = maxAOF * 1.1; const stepSize = limit / steps;
        const data = [];
        for (let i = 0; i <= steps; i++) {
            const q = i * stepSize;
            const calcP = (ip: number) => { const p = calculatePwf(q, { inflow: { pStatic, ip: ip > 0 ? ip : 0.001, model } } as any); return p > 0 ? p : null; };
            const minP = calcP(min.ip); const targetP = calcP(target.ip); const maxP = calcP(max.ip);
            if (minP === null && targetP === null && maxP === null && i > 0) { data.push({ flow: Math.round(q), minP: minP !== null ? 0 : null, targetP: targetP !== null ? 0 : null, maxP: maxP !== null ? 0 : null }); break; }
            data.push({ flow: Math.round(q), minP: minP !== null ? Number(minP.toFixed(0)) : null, targetP: targetP !== null ? Number(targetP.toFixed(0)) : null, maxP: maxP !== null ? Number(maxP.toFixed(0)) : null });
        }
        return data;
    }, [params.inflow.pStatic, params.targets, params.inflow.model]);

    const updateScenarioData = (scenario: 'min' | 'target' | 'max', field: keyof ScenarioData, val: number) => {
        setParams(prev => {
            const updatedTargets = { ...prev.targets, [scenario]: { ...prev.targets[scenario], [field]: val } };

            // Critical: If editing target, we MUST sync the global shortcuts
            let extraUpdates = {};
            if (scenario === 'target') {
                if (field === 'rate') extraUpdates = { pressures: { ...prev.pressures, totalRate: val } };
                if (field === 'ip') extraUpdates = { ...extraUpdates, inflow: { ...prev.inflow, ip: val } };
                if (field === 'waterCut') {
                    const glr = prev.fluids.gor * (1 - val / 100);
                    extraUpdates = { ...extraUpdates, fluids: { ...prev.fluids, waterCut: val, glr } };
                }
                if (field === 'gor') {
                    const glr = val * (1 - prev.fluids.waterCut / 100);
                    extraUpdates = { ...extraUpdates, fluids: { ...prev.fluids, gor: val, glr } };
                }
            }

            // Sync if editing the currently active scenario
            if (prev.activeScenario === scenario) {
                const newData = updatedTargets[scenario];
                return {
                    ...prev,
                    targets: updatedTargets,
                    ...extraUpdates,
                    pressures: { ...prev.pressures, totalRate: newData.rate },
                    inflow: { ...prev.inflow, ip: newData.ip },
                    fluids: { ...prev.fluids, waterCut: newData.waterCut, gor: newData.gor, glr: newData.gor * (1 - newData.waterCut / 100) }
                };
            }

            return { ...prev, targets: updatedTargets, ...extraUpdates };
        });
    };

    const activateScenario = (scenario: 'min' | 'target' | 'max') => {
        const data = params.targets[scenario];
        setParams(prev => ({ ...prev, activeScenario: scenario, pressures: { ...prev.pressures, totalRate: data.rate }, inflow: { ...prev.inflow, ip: data.ip }, fluids: { ...prev.fluids, waterCut: data.waterCut, gor: data.gor, glr: data.gor * (1 - data.waterCut / 100) } }));
    };

    const points = useMemo(() => {
        const getOpPwf = (q: number, ip: number) => calculatePwf(q, getScenarioParams(params, { rate: q, ip, waterCut: 0, gor: 0, frequency: 60 }));
        return [
            { flow: params.targets.min.rate, pwf: getOpPwf(params.targets.min.rate, params.targets.min.ip), label: 'MIN', color: colorSecondary },
            { flow: params.targets.target.rate, pwf: getOpPwf(params.targets.target.rate, params.targets.target.ip), label: 'OBJ', color: colorPrimary },
            { flow: params.targets.max.rate, pwf: getOpPwf(params.targets.max.rate, params.targets.max.ip), label: 'MAX', color: colorSecondary }
        ];
    }, [params, colorPrimary, colorSecondary]);

    return (
        <div className="flex flex-col h-full gap-6 animate-fadeIn overflow-hidden p-1">

            {/* HEADER TOOLBAR */}
            <div className="glass-surface rounded-[2rem] p-5 border border-surface-light/50 shadow-xl flex justify-between items-center relative overflow-hidden group shrink-0 light-sweep">
                <div className="absolute left-0 top-0 w-2 h-full bg-gradient-to-b from-primary to-secondary shadow-glow-primary"></div>

                <div className="relative z-10 flex items-center gap-4 pl-4">
                    <div className="p-3 bg-primary/20 rounded-2xl border border-white/10 shadow-glow-primary">
                        <Layers className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-txt-main uppercase tracking-tighter leading-none">{t('scen.title')}</h2>
                        <p className="text-[10px] text-txt-muted font-black uppercase tracking-[0.2em] mt-1.5 opacity-70">
                            Sensitivity & Limit Analysis <span className="text-primary/70">[{params.inflow.model}]</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 relative z-10 pr-2">
                    <div className="flex items-center gap-3 glass-surface-light px-5 py-2.5 rounded-2xl border border-white/5 shadow-inner">
                        <span className="text-[9px] font-bold text-txt-muted uppercase tracking-widest">{t('scen.activeCase')}:</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-glow-primary"></div>
                            <span className="text-xs font-black uppercase text-primary tracking-tighter">
                                {params.activeScenario === 'min' ? t('scen.min') : params.activeScenario === 'target' ? t('scen.target') : t('scen.max')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ANALYTIC DASHBOARD BODY */}
            <div className="flex-1 min-h-0 flex gap-6 overflow-hidden">

                {/* LEFT: SCENARIO CARDS (45%) */}
                <div className="flex-[0.45] flex flex-col gap-4 min-h-0 overflow-y-auto custom-scrollbar pr-2">
                    <ScenarioCard
                        type="target"
                        data={params.targets.target}
                        onChange={(f, v) => updateScenarioData('target', f, v)}
                        baseParams={params}
                        active={params.activeScenario === 'target'}
                        onActivate={() => activateScenario('target')}
                        globalResults={results}
                        maxAOF={aof}
                    />
                    <ScenarioCard
                        type="min"
                        data={params.targets.min}
                        onChange={(f, v) => updateScenarioData('min', f, v)}
                        baseParams={params}
                        active={params.activeScenario === 'min'}
                        onActivate={() => activateScenario('min')}
                        globalResults={results}
                        maxAOF={aof}
                    />
                    <ScenarioCard
                        type="max"
                        data={params.targets.max}
                        onChange={(f, v) => updateScenarioData('max', f, v)}
                        baseParams={params}
                        active={params.activeScenario === 'max'}
                        onActivate={() => activateScenario('max')}
                        globalResults={results}
                        maxAOF={aof}
                    />
                </div>

                {/* RIGHT: SYSTEM VISUALIZER (55%) */}
                <div className="flex-[0.55] glass-surface rounded-[2.5rem] border border-white/5 p-8 flex flex-col shadow-2xl relative overflow-hidden light-sweep">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--color-primary),0.02)_1px,transparent_1px)] bg-[size:100%_40px] pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                    <div className="flex justify-between items-center mb-8 shrink-0 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 glass-surface-light rounded-2xl text-primary border border-white/5 shadow-glow-primary"><Activity className="w-6 h-6" /></div>
                            <div>
                                <h4 className="text-sm font-black text-txt-main uppercase tracking-[0.3em] mb-1">IPR OPERATIONAL ENVELOPES</h4>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                    <p className="text-[10px] font-black text-txt-muted uppercase tracking-widest opacity-60">System Dynamics Analysis</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 relative">
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(var(--color-primary),0.2) 1.5px, transparent 1.5px)', backgroundSize: '30px 30px' }}></div>
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={allCurvesData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                                <defs>
                                    <linearGradient id="iprGradTarget" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={colorPrimary} stopOpacity={0.4} />
                                        <stop offset="95%" stopColor={colorPrimary} stopOpacity={0} />
                                    </linearGradient>
                                    <filter id="glow-target" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="3" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} vertical={false} opacity={0.2} />
                                <XAxis
                                    dataKey="flow"
                                    type="number"
                                    tick={{ fontSize: 10, fontWeight: 900, fill: colorTextMuted }}
                                    axisLine={{ stroke: colorGrid, opacity: 0.3 }}
                                    tickLine={false}
                                    height={40}
                                >
                                    <Label value="FLOW RATE (BPD)" position="insideBottom" offset={0} fill={colorTextMuted} fontSize={9} fontWeight={900} style={{ letterSpacing: '0.2em' }} />
                                </XAxis>
                                <YAxis
                                    tick={{ fontSize: 10, fontWeight: 900, fill: colorTextMuted }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={45}
                                >
                                    <Label value="PRESSURE (PSI)" angle={-90} position="insideLeft" fill={colorTextMuted} fontSize={9} fontWeight={900} style={{ letterSpacing: '0.2em' }} />
                                </YAxis>
                                <Tooltip
                                    content={({ active, payload, label }: any) => active && payload ? (
                                        <div className="glass-surface p-5 shadow-2xl rounded-3xl text-sm z-50">
                                            <p className="font-black border-b border-white/10 pb-3 mb-3 text-txt-muted flex justify-between gap-12 items-center">
                                                <span className="tracking-widest uppercase text-[10px]">FLOW RATE</span>
                                                <span className="font-mono text-txt-main text-xl tracking-tighter">{label} <small className="text-[10px] opacity-40">BPD</small></span>
                                            </p>
                                            <div className="space-y-3">
                                                {payload.map((e: any, i: number) => e.value !== null && (
                                                    <div key={i} className="flex justify-between gap-10 items-center">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ backgroundColor: e.color, boxShadow: `0 0 10px ${e.color}` }}></div>
                                                            <span className="font-black text-txt-muted uppercase text-[10px] tracking-widest">{e.name}</span>
                                                        </div>
                                                        <span className="font-mono font-black text-txt-main text-base">{e.value} <small className="text-[9px] opacity-40 uppercase">psi</small></span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}
                                    cursor={{ stroke: colorPrimary, strokeWidth: 1.5, strokeDasharray: '4 4' }}
                                />
                                <ReferenceLine x={aof} stroke="rgb(var(--color-danger))" strokeDasharray="6 6" strokeWidth={2.5} label={{ position: 'insideTopRight', value: 'AOF LIMIT', fill: 'rgb(var(--color-danger))', fontSize: 10, fontWeight: '950', style: { letterSpacing: '0.2em' } }} />
                                <Line type="monotone" dataKey="minP" name="MIN" stroke={colorSecondary} strokeWidth={2.5} strokeDasharray="6 4" dot={false} activeDot={false} isAnimationActive={false} opacity={0.6} />
                                <Line type="monotone" dataKey="maxP" name="MAX" stroke={colorPrimary} strokeWidth={2.5} strokeDasharray="6 4" dot={false} activeDot={false} isAnimationActive={false} opacity={0.3} />
                                <Area type="monotone" dataKey="targetP" name="TARGET" stroke={colorPrimary} strokeWidth={5} fillOpacity={1} fill="url(#iprGradTarget)" filter="url(#glow-target)" animationDuration={2000} />
                                {points.map((p, i) => (
                                    <ReferenceDot key={i} x={p.flow} y={p.pwf} r={7} fill={p.color} stroke="white" strokeWidth={2} fillOpacity={1} style={{ filter: `drop-shadow(0 0 8px ${p.color})` }}>
                                        <Label value={p.label} position="top" fill={p.color} fontSize={10} fontWeight="950" offset={15} />
                                    </ReferenceDot>
                                ))}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
