import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Activity, Gauge, Printer, Droplets, ArrowDown, ClipboardCheck, X, Hammer, Thermometer, RefreshCw, Maximize2, Minimize2, Brain, Calendar, Play, Zap, TrendingDown, TrendingUp, Monitor, Layers, Repeat, Cpu, Target, Info, ShieldCheck } from 'lucide-react';
import { SystemParams, EspPump, ScenarioData } from '../types';
import { calculateTDH, calculateSystemResults, calculateBaseHead, calculateBasePowerPerStage, calculatePDP, calculateFluidProperties, interpolateTVD, generateMultiCurveData, findIntersection, getShaftLimitHp, calculatePwf, getDownloadFilename } from '../utils';
import { PumpChart } from './PumpChart';
import { PerformanceCurveMultiAxis } from './PerformanceCurveMultiAxis';
import { useLanguage } from '../i18n';

interface Props {
    params: SystemParams; // Design Params
    setParams: React.Dispatch<React.SetStateAction<SystemParams>>;
    pump: EspPump | null;
    designFreq: number;
}

// --- SCENARIO HELPERS ---
const getScenarioParams = (baseParams: SystemParams, scenario: ScenarioData): SystemParams => {
    return {
        ...baseParams,
        inflow: { ...baseParams.inflow, ip: scenario.ip },
        fluids: {
            ...baseParams.fluids,
            waterCut: scenario.waterCut,
            gor: scenario.gor,
            glr: scenario.gor * (1 - scenario.waterCut / 100)
        },
        pressures: { ...baseParams.pressures, totalRate: scenario.rate }
    };
};

const DesignMetric = ({ label, value }: any) => (
    <div className="glass-surface-light border border-white/5 rounded-2xl p-4 flex flex-col justify-between transition-all hover:bg-white/5">
        <span className="text-[9px] text-txt-muted font-black uppercase tracking-widest opacity-60 mb-2">{label}</span>
        <span className="text-sm font-mono font-black text-txt-main tracking-tighter">{value}</span>
    </div>
);

const PremiumField = ({ label, value, unit, icon: Icon, onChange, color = "secondary" }: any) => (
    <div className={`glass-surface-light border border-white/5 rounded-2xl p-4 flex flex-col justify-between group h-24 transition-all shadow-inner relative overflow-hidden ${color === 'secondary' ? 'hover:border-secondary/40' : 'hover:border-primary/40'}`}>
        <div className={`absolute inset-0 ${color === 'secondary' ? 'bg-secondary/5' : 'bg-primary/5'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
        <div className="flex justify-between items-center mb-1 relative z-10">
            <label className="text-[9px] font-black text-txt-muted uppercase tracking-widest opacity-60">{label}</label>
            <Icon className={`w-3.5 h-3.5 ${color === 'secondary' ? 'text-secondary' : 'text-primary'} opacity-40 group-hover:opacity-100 transition-all`} />
        </div>
        <div className="flex items-baseline gap-2 relative z-10">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full bg-transparent text-xl font-black text-txt-main outline-none font-mono tracking-tighter select-all"
            />
            <span className="text-[10px] font-black text-txt-muted uppercase opacity-40">{unit}</span>
        </div>
    </div>
);

const PremiumDate = ({ label, value, icon: Icon, onChange }: any) => (
    <div className="glass-surface-light border border-white/5 rounded-2xl p-4 flex flex-col justify-between group hover:border-secondary/40 transition-all shadow-inner h-24">
        <div className="flex justify-between items-center mb-1">
            <label className="text-[9px] font-black text-txt-muted uppercase tracking-widest opacity-60">{label}</label>
            <Icon className="w-3.5 h-3.5 text-secondary opacity-40" />
        </div>
        <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-xs font-black text-txt-main outline-none uppercase tracking-tighter cursor-pointer"
        />
    </div>
);

const PremiumMetricCard = ({ label, value, subValue, icon: Icon, color, alert }: any) => {
    const IconComponent = Icon || Activity;
    return (
        <div className={`glass-surface rounded-2xl border ${alert ? 'border-danger shadow-glow-danger/20' : 'border-white/5 shadow-xl'} p-5 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all h-[130px] light-sweep`}>
            <div className={`absolute -right-6 -top-6 w-20 h-20 ${color === 'secondary' ? 'bg-secondary/10' : color === 'primary' ? 'bg-primary/10' : 'bg-danger/10'} blur-3xl rounded-full`}></div>
            <div className="flex justify-between items-start relative z-10">
                <span className="text-[9px] font-black text-txt-muted uppercase tracking-[0.2em] opacity-60">{label}</span>
                <IconComponent className={`w-5 h-5 ${color === 'secondary' ? 'text-secondary' : color === 'primary' ? 'text-primary' : 'text-danger'} ${alert ? 'animate-pulse' : ''}`} />
            </div>
            <div className="mt-auto relative z-10">
                <div className={`text-2xl font-black ${alert ? 'text-danger' : 'text-txt-main'} tracking-tighter leading-none`}>{value}</div>
                <div className="text-[9px] font-black text-txt-muted uppercase mt-2 tracking-widest opacity-40">{subValue}</div>
            </div>
        </div>
    );
};

const CompPremium = ({ label, design, actual, unit, color }: any) => {
    const diff = design > 0 ? ((actual - design) / design) * 100 : 0;
    const isOver = diff > 0;
    return (
        <div className="glass-surface rounded-2xl border border-white/5 shadow-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all h-[130px] light-sweep">
            <div className={`absolute -right-6 -top-6 w-20 h-20 shadow-glow-${color}/10 blur-3xl rounded-full`}></div>
            <div className="flex justify-between items-start relative z-10">
                <span className="text-[9px] font-black text-txt-muted uppercase tracking-widest opacity-60">{label}</span>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[8px] font-black border ${Math.abs(diff) < 5 ? 'bg-success/20 text-success border-success/20' : 'bg-danger/20 text-danger border-danger/20'}`}>
                    {Math.abs(diff).toFixed(1)}% {isOver ? 'UP' : 'DN'}
                </div>
            </div>
            <div className="mt-auto relative z-10">
                <div className="text-2xl font-black text-txt-main tracking-tighter leading-none">{(actual ?? 0).toFixed(0)} <small className="text-[10px] opacity-40 font-bold uppercase">{unit}</small></div>
                <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-[9px] font-black text-txt-muted uppercase tracking-widest opacity-40">DESIGN:</span>
                    <span className="text-[10px] font-black text-txt-main opacity-60 font-mono tracking-tighter">{(design ?? 0).toFixed(0)}</span>
                </div>
            </div>
        </div>
    );
};

// --- REPORT COMPONENT (PRINT VIEW) ---
const HistoryMatchReport = ({ onClose, designParams, actualParams, pump, designRes, actualRes, designFreq, actualFreq, chartData, mechanics, compareScenario, fieldData, refPoints, calculatedIP, aiAnalysis, motor, degradationPct }: any) => {
    const { t } = useLanguage();

    const handlePrint = () => {
        const originalTitle = document.title;
        const fname = getDownloadFilename(designParams, pump, "Field_Sync");
        document.title = fname;
        window.print();
        setTimeout(() => { document.title = originalTitle; }, 500);
    };

    // --- CALCULATE MULTI-FREQUENCY DATA FOR TABLE (Based on ACTUAL MATCHED Params) ---
    const tableData = useMemo(() => {
        if (!pump) return [];
        const freqsToAnalyze = [30, 40, 50, 60, 70];
        if (!freqsToAnalyze.includes(actualFreq)) freqsToAnalyze.push(actualFreq);
        freqsToAnalyze.sort((a, b) => a - b);

        return freqsToAnalyze.map(hz => {
            const cData = generateMultiCurveData(pump, actualParams, hz, 60);
            const matchPoint = findIntersection(cData);
            let flow = matchPoint?.flow || 0;
            let head = matchPoint?.head || 0;
            const res = calculateSystemResults(flow, head, actualParams, pump, hz);
            const shaftLimit = getShaftLimitHp(pump?.series);
            const bhp = res.hpTotal || 0;
            const motorT = (actualParams.bottomholeTemp || 150) + (res.motorLoad || 0) * 0.8;

            return {
                hz, rpm: hz * 60, flow, pip: res.pip, wc: actualParams.fluids.waterCut,
                bwpd: flow * (actualParams.fluids.waterCut / 100), bopd: flow * (1 - actualParams.fluids.waterCut / 100),
                pStatic: actualParams.inflow.pStatic, pdp: res.pdp, pwf: res.pwf,
                thp: actualParams.pressures.pht, tdh: res.tdh, fluidLevel: res.fluidLevel,
                pumpDepth: actualParams.pressures.pumpDepthMD, drawdown: Math.max(0, actualParams.inflow.pStatic - res.pwf), bhp,
                motorHp: motor?.hp || actualParams.motorHp,
                amps: res.electrical.amps, volts: res.electrical.volts, voltDrop: res.electrical.voltDrop,
                kva: res.electrical.kva, kw: res.electrical.kw, vel: res.fluidVelocity, motorT,
                intakeTemp: res.intakeTemp ?? (actualParams.bottomholeTemp || 150),
                submergenceFt: res.submergenceFt ?? 0,
                pumpEff: res.effEstimated, motorEff: res.electrical.motorEff,
                pumpShaftLoad: shaftLimit > 0 ? (bhp / shaftLimit) * 100 : 0,
                protShaftLoad: shaftLimit > 0 ? (bhp / (shaftLimit * 1.15)) * 100 : 0,
                motorShaftLoad: shaftLimit > 0 ? (bhp / (shaftLimit * 1.25)) * 100 : 0,
                thrustLoad: flow > 0 ? Math.min(100, 15 + (Math.abs(flow - (pump?.bepRate || 1000) * (hz / 60)) / ((pump?.bepRate || 1000) * (hz / 60))) * 50) : 0
            };
        });
    }, [pump, actualParams, actualFreq, motor]);

    const f0 = (n: number) => n !== undefined && !isNaN(n) ? n.toFixed(0) : '-';
    const f1 = (n: number) => n !== undefined && !isNaN(n) ? n.toFixed(1) : '-';

    const rowDefinitions = [
        { label: "RPM", key: 'rpm', unit: 'rpm', fmt: f0 },
        { label: "BFPD", key: 'flow', unit: 'bpd', fmt: f0 },
        { label: "PIP", key: 'pip', unit: 'psi', fmt: f0 },
        { label: "BSW", key: 'wc', unit: '%', fmt: f1 },
        { label: "BWPD", key: 'bwpd', unit: 'bpd', fmt: f0 },
        { label: "BOPD", key: 'bopd', unit: 'bpd', fmt: f0 },
        { label: "P Estatica", key: 'pStatic', unit: 'psi', fmt: f0 },
        { label: "P Descarga (Pd)", key: 'pdp', unit: 'psi', fmt: f0 },
        { label: "Pwf", key: 'pwf', unit: 'psi', fmt: f0 },
        { label: "THP", key: 'thp', unit: 'psi', fmt: f0 },
        { label: "TDH", key: 'tdh', unit: 'ft', fmt: f0 },
        { label: "Nivel de fluido", key: 'fluidLevel', unit: 'ft', fmt: f0 },
        { label: "Prof. BES MD", key: 'pumpDepth', unit: 'ft', fmt: f0 },
        { label: "Drawdown", key: 'drawdown', unit: 'psi', fmt: f0 },
        { label: "BHP", key: 'bhp', unit: 'hp', fmt: f1 },
        { label: "Motor HP", key: 'motorHp', unit: 'hp', fmt: f0 },
        { label: "Amperaje", key: 'amps', unit: 'A', fmt: f1 },
        { label: "Voltaje Motor", key: 'volts', unit: 'V', fmt: f0 },
        { label: "Perdidas Voltaje Cable", key: 'voltDrop', unit: 'V', fmt: f0 },
        { label: "KVA", key: 'kva', unit: 'kVA', fmt: f1 },
        { label: "Kw", key: 'kw', unit: 'kW', fmt: f1 },
        { label: "Vel Fluido", key: 'vel', unit: 'ft/s', fmt: f1 },
        { label: "Temp motor", key: 'motorT', unit: '°F', fmt: f0 },
        { label: "Temp Intake", key: 'intakeTemp', unit: '°F', fmt: f0 }, // Added
        { label: "Submergencia", key: 'submergenceFt', unit: 'ft', fmt: f0 }, // Added
        { label: "Eficiencia Bomba", key: 'pumpEff', unit: '%', fmt: f1 },
        { label: "Eficiencia Motor", key: 'motorEff', unit: '%', fmt: f1 },
        { label: "Pump Shaft Load", key: 'pumpShaftLoad', unit: '%', fmt: f1 },
        { label: "Prot Shaft Load", key: 'protShaftLoad', unit: '%', fmt: f1 },
        { label: "Motor Shaft Load", key: 'motorShaftLoad', unit: '%', fmt: f1 },
        { label: "Thrust Load", key: 'thrustLoad', unit: '%', fmt: f1 },
    ];

    const degStatus = (degradationPct ?? 0) > 15 ? { label: t('p6.degCritical'), color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30' } :
        (degradationPct ?? 0) > 8 ? { label: t('p6.degBad'), color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' } :
            (degradationPct ?? 0) > 3 ? { label: t('p6.degWarning'), color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' } :
                { label: t('p6.degGood'), color: 'text-success', bg: 'bg-success/10', border: 'border-success/30' };

    const actualTdhVal = actualRes?.tdh ?? 0;
    const designTdhVal = designRes?.tdh ?? 0;

    return (
        <div className="fixed inset-0 z-[9999] bg-canvas overflow-hidden flex flex-col animate-fadeIn">
            {/* Action Bar */}
            <div className="h-16 bg-surface border-b border-surface-light flex items-center justify-between px-8 shadow-2xl shrink-0 no-print z-50">
                <div className="flex items-center gap-4">
                    <div className="bg-primary p-2 rounded-lg text-white"><ClipboardCheck className="w-5 h-5" /></div>
                    <div>
                        <h3 className="text-sm font-black text-txt-main uppercase tracking-wider">{t('p6.reportTitle')}</h3>
                        <p className="text-xs text-txt-muted font-bold tracking-widest uppercase opacity-60">{t('p6.postJob')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase shadow-lg shadow-primary/20 transition-all transform active:scale-95">
                        <Printer className="w-4 h-4" /> {t('p6.printSave')}
                    </button>
                    <button onClick={onClose} className="p-2.5 bg-surface-light hover:bg-red-500/20 text-txt-muted hover:text-danger rounded-xl transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-canvas p-8 custom-scrollbar">
                <style>{`
                    @media print {
                        @page { margin: 0.5cm; size: landscape; }
                        html, body, #root { height: auto !important; overflow: visible !important; background: white !important; }
                        body * { visibility: hidden; }
                        #history-report-paper, #history-report-paper * { visibility: visible; }
                        #history-report-paper {
                            position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0;
                            background: white !important; color: black !important; box-shadow: none !important; min-height: 0 !important;
                        }
                        .no-print { display: none !important; }
                        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    }
                `}</style>

                <div id="history-report-paper" className="bg-white w-full max-w-[297mm] min-h-[210mm] mx-auto shadow-2xl rounded-sm p-10 md:p-12 text-slate-900 flex flex-col relative">
                    {/* LOGO & TITLE */}
                    <div className="border-b-4 border-slate-900 pb-6 mb-8 flex justify-between items-end">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-slate-900 rounded-2xl">
                                <Activity className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-1">{t('p6.reportTitle')}</h1>
                                <p className="font-bold text-slate-500 uppercase text-[10px] tracking-[0.25em]">{t('p6.reportSub')} ({compareScenario.toUpperCase()})</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('p6.analysisDate')}</div>
                            <div className="text-sm font-black text-slate-900">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                    </div>

                    {/* TOP GRID: WELL INFO & AI DIAGNOSTIC */}
                    <div className="grid grid-cols-12 gap-6 mb-8">
                        {/* Well & Equipment Profile */}
                        <div className="col-span-4 p-6 rounded-3xl border-2 border-slate-100 bg-slate-50/50">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2 border-b border-slate-200 pb-2">
                                <Layers className="w-3.5 h-3.5" /> {t('p6.wellInfo')}
                            </h4>
                            <div className="space-y-3.5">
                                <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-500 uppercase">Well Name</span><span className="text-xs font-black text-slate-900">{designParams.wellName || 'FIELD-X'}</span></div>
                                <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-500 uppercase">{t('p6.pumpModel')}</span><span className="text-xs font-black text-slate-900">{pump?.model || '-'}</span></div>
                                <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-500 uppercase">{t('p6.stages')}</span><span className="text-xs font-black text-slate-900">{pump?.stages || '-'} ({pump?.series} Ser.)</span></div>
                                <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-slate-500 uppercase">{t('p6.motorModel')}</span><span className="text-xs font-black text-slate-900">{motor?.model || 'Std'} ({motor?.hp} HP)</span></div>
                                <div className="flex justify-between items-center border-t-2 border-slate-100 pt-3"><span className="text-[10px] font-black text-primary uppercase">{t('p6.operatingFreq')}</span><span className="text-sm font-black text-primary font-mono">{actualFreq} Hz</span></div>
                            </div>
                        </div>

                        {/* AI Engine Analysis */}
                        <div className="col-span-8 p-6 rounded-3xl border-2 border-blue-100 bg-blue-50/20 flex flex-col relative overflow-hidden group">
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/5 blur-3xl rounded-full" />
                            <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Brain className="w-4 h-4" /> {t('p6.aiDiagnostic')}
                            </h4>
                            <div className="flex-1 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-blue-100/50 shadow-inner">
                                <p className="text-sm font-semibold text-blue-900 leading-relaxed italic">
                                    "{aiAnalysis || t('p6.noAnalysis')}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC PUMP STATUS CARD */}
                    <div className={`mb-8 p-6 rounded-[2.5rem] border-2 ${degStatus.border} ${degStatus.bg} flex justify-between items-center shadow-xl shadow-slate-100/50 relative overflow-hidden`}>
                        <div className="absolute left-0 top-0 w-3 h-full bg-current opacity-20" style={{ color: 'inherit' }} />
                        <div className="flex items-center gap-8 relative z-10">
                            <div className={`p-5 rounded-3xl ${degStatus.bg} border-2 ${degStatus.border} shadow-inner`}>
                                <Gauge className={`w-12 h-12 ${degStatus.color}`} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">{t('p6.pumpStatus')}</h4>
                                <div className={`text-4xl font-black ${degStatus.color} uppercase tracking-tighter`}>{degStatus.label}</div>
                            </div>
                        </div>
                        <div className="flex gap-16 items-end relative z-10">
                            <div className="text-right">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('p6.theoHead')}</div>
                                <div className="text-2xl font-black text-slate-500 font-mono tracking-tighter opacity-60">{designTdhVal.toFixed(0)} <small className="text-xs uppercase">ft</small></div>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('p6.fieldHead')}</div>
                                <div className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{actualTdhVal.toFixed(0)} <small className="text-xs uppercase">ft</small></div>
                            </div>
                            <div className="text-right border-l-4 border-slate-200/50 pl-12">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{t('p6.degradation')}</div>
                                <div className={`text-5xl font-black ${degStatus.color} font-mono tracking-tighter drop-shadow-sm`}>{(degradationPct ?? 0).toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>

                    {/* COMPARISON RESULTS GRID */}
                    <div className="mb-10">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b-2 border-slate-100 pb-2">
                            <Repeat className="w-4 h-4" /> {t('p6.keyResults')}
                        </h4>
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { l: t('p6.bfpd'), d: designRes?.flow, a: actualRes?.flow, u: 'bpd', i: TrendingUp },
                                { l: t('p6.pip'), d: designRes?.pip, a: actualRes?.pip, u: 'psi', i: Activity },
                                { l: t('p6.tdh'), d: designRes?.tdh, a: actualRes?.tdh, u: 'ft', i: Gauge },
                                { l: t('p6.power'), d: designRes?.electrical?.kw, a: actualRes?.electrical?.kw, u: 'kW', i: Zap },
                                { l: t('p6.motorLoad'), d: designRes?.motorLoad, a: actualRes?.motorLoad, u: '%', i: Cpu },
                                { l: t('p6.pwf'), d: designRes?.pwf, a: actualRes?.pwf, u: 'psi', i: ArrowDown },
                                { l: t('p6.ip'), d: designParams?.inflow?.ip, a: calculatedIP, u: 'bpd/psi', i: Target },
                                { l: t('p6.intakeTemp'), d: designParams?.bottomholeTemp, a: actualRes?.intakeTemp, u: '°F', i: Thermometer }, // Changed to actualRes?.intakeTemp
                            ].map((k, i) => {
                                const valA = k.a ?? 0;
                                const valD = k.d ?? 0;
                                const diff = valA - valD;
                                const pct = valD !== 0 ? (diff / valD) * 100 : 0;
                                return (
                                    <div key={i} className="p-4 border-2 border-slate-100 rounded-2xl bg-slate-50/30 flex flex-col justify-between group hover:border-slate-200 transition-all">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2">
                                                <k.i className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{k.l}</span>
                                            </div>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${Math.abs(pct) < 5 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                                {pct > 0 ? '↑' : '↓'} {Math.abs(pct).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <div className="text-[10px] font-bold text-slate-300 line-through">{(valD).toFixed(k.l === t('p6.ip') ? 2 : 0)}</div>
                                            <div className="text-xl font-black text-slate-900 tracking-tighter">{(valA).toFixed(k.l === t('p6.ip') ? 2 : 0)} <small className="text-[10px] text-slate-400 font-bold uppercase">{k.u}</small></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* BOTTOM GRID: CHART & VSD TABLE */}
                    <div className="grid grid-cols-2 gap-10">
                        {/* CHART */}
                        <div className="break-inside-avoid">
                            <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-5 pb-2 border-b-2 border-slate-100 flex items-center justify-between">
                                <span>1. {t('p6.perfComp')}</span>
                                <span className="text-[9px] text-slate-300 font-bold">MULTIAXIS REALTIME RENDER</span>
                            </h3>
                            <div className="h-[350px] w-full border-2 border-slate-100 rounded-3xl overflow-hidden bg-white shadow-inner p-2">
                                <PerformanceCurveMultiAxis data={chartData} frequency={actualFreq} currentFlow={fieldData.rate} pump={pump} className="w-full h-full" />
                            </div>
                        </div>

                        {/* VSD TABLE */}
                        <div className="break-inside-avoid">
                            <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-5 pb-2 border-b-2 border-slate-100 flex items-center justify-between">
                                <span>2. {t('p6.operTableTitle')}</span>
                                <span className="text-[9px] text-slate-300 font-bold">SENSITIVITY FORECAST</span>
                            </h3>
                            <div className="border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                                <table className="w-full text-[10px] text-left">
                                    <thead className="bg-slate-50 text-slate-500 uppercase font-black border-b border-slate-200">
                                        <tr>
                                            <th className="py-3 px-4 border-r border-slate-100 min-w-[120px]">{t('p6.param')}</th>
                                            <th className="py-3 px-2 text-center border-r border-slate-100">Unit</th>
                                            {tableData.map(col => (
                                                <th key={col.hz} className={`py-3 px-2 text-right ${col.hz === actualFreq ? 'bg-amber-100 text-amber-900 border-x border-amber-200 shadow-inner' : ''}`}>
                                                    {col.hz} Hz
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {rowDefinitions.filter(r => ['flow', 'tdh', 'pip', 'pwf', 'fluidLevel', 'kw', 'amps', 'volts', 'vel', 'motorT', 'intakeTemp', 'submergenceFt', 'pumpEff', 'pumpShaftLoad'].includes(r.key)).map((row, i) => (
                                            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}>
                                                <td className="py-2.5 px-4 font-bold text-slate-600 border-r border-slate-100 uppercase tracking-tighter text-[9px]">{row.label}</td>
                                                <td className="py-2.5 px-2 text-center text-slate-400 font-bold uppercase border-r border-slate-100 text-[8px]">{row.unit}</td>
                                                {tableData.map(col => (
                                                    <td key={col.hz} className={`py-2.5 px-2 text-right font-mono text-[11px] ${col.hz === actualFreq ? 'bg-amber-50 font-black text-slate-950 border-x border-amber-100/50' : 'text-slate-500'}`}>
                                                        {row.fmt(col[row.key as keyof typeof col] as number)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                <p className="text-[9px] font-semibold text-slate-500 leading-relaxed uppercase tracking-wider">
                                    {t('p6.calcIpSub')} | Actual parameters matched using field production (Q) and intake pressure (PIP) sensors.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-10 border-t-4 border-slate-900 flex justify-between items-center bg-white">
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                            <Layers className="w-4 h-4" /> ESP DIGITAL TWIN | INTELLIGENT PERFORMANCE ANALYSIS
                        </div>
                        <div className="flex gap-16">
                            <div className="text-center">
                                <div className="w-48 border-b-2 border-slate-300 mb-2 h-10"></div>
                                <div className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{t('p6.engineerApproval')}</div>
                            </div>
                            <div className="text-center">
                                <div className="w-48 border-b-2 border-slate-300 mb-2 h-10"></div>
                                <div className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{t('p6.operationsDirectorate')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---

const FieldInput = ({ label, value, unit, onChange, icon: Icon, disabled = false }: any) => (
    <div className={`bg-surface border border-surface-light rounded-xl p-3 flex flex-col justify-between group focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all shadow-sm ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex justify-between items-center mb-0.5">
            <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider group-focus-within:text-primary transition-colors">{label}</label>
            {Icon && <Icon className="w-3.5 h-3.5 text-primary opacity-60" />}
        </div>
        <div className="flex items-baseline gap-1.5">
            <input
                type="number"
                value={value}
                onChange={onChange}
                className="w-full bg-transparent text-lg font-black text-txt-main outline-none placeholder-surface-light font-mono"
                disabled={disabled}
            />
            <span className="text-[9px] font-bold text-txt-muted uppercase select-none">{unit}</span>
        </div>
    </div>
);

const DateInput = ({ label, value, onChange, icon: Icon }: any) => (
    <div className="bg-surface border border-surface-light rounded-xl p-3 flex flex-col justify-between group focus-within:border-secondary/50 focus-within:ring-1 focus-within:ring-secondary/20 transition-all shadow-sm">
        <div className="flex justify-between items-center mb-0.5">
            <label className="text-[9px] font-bold text-txt-muted uppercase tracking-wider group-focus-within:text-secondary transition-colors">{label}</label>
            {Icon && <Icon className="w-3.5 h-3.5 text-secondary opacity-60" />}
        </div>
        <div className="flex items-baseline gap-1.5">
            <input
                type="date"
                value={value}
                onChange={onChange}
                className="w-full bg-transparent text-xs font-black text-txt-main outline-none placeholder-surface-light font-mono"
            />
        </div>
    </div>
);

const f0 = (n: number) => (n !== undefined && !isNaN(n) ? n.toFixed(0) : '0');

const CompCard = ({ label, designVal, actualVal, unit }: any) => {
    const diff = actualVal - designVal;
    const pct = designVal !== 0 ? (diff / designVal) * 100 : 0;
    const isGood = Math.abs(pct) < 5;

    return (
        <div className={`glass-surface rounded-2xl border border-surface-light p-4 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 light-sweep ${isGood ? 'hover:border-primary/50' : ''}`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${isGood ? 'bg-primary shadow-glow-primary' : 'bg-secondary'}`}></div>
            <span className="text-[9px] font-black text-txt-muted uppercase tracking-[0.2em] mb-3 opacity-70 group-hover:opacity-100 transition-opacity">{label}</span>
            <div className="flex justify-between items-end relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-black text-txt-muted uppercase ring-1 ring-surface-light px-1 rounded">{useLanguage().t('p6.design')}</span>
                        <span className="text-xs font-bold text-secondary font-mono tracking-tight">{designVal.toFixed(0)}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-txt-main tracking-tighter drop-shadow-sm">{actualVal.toFixed(0)}</span>
                        <span className="text-[9px] font-bold text-txt-muted uppercase tracking-widest">{unit}</span>
                    </div>
                </div>
                <div className={`text-right px-2 py-1 rounded-lg backdrop-blur-md ${Math.abs(pct) < 2 ? 'bg-surface-light text-txt-muted' : pct > 0 ? 'bg-primary/10 text-primary shadow-glow-primary' : 'bg-danger/10 text-danger'}`}>
                    <div className="text-[11px] font-black font-mono tracking-tighter">{pct > 0 ? '↑' : '↓'} {Math.abs(pct).toFixed(1)}%</div>
                </div>
            </div>
            {/* Subtle Glow Background */}
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary/5 blur-2xl rounded-full group-hover:bg-primary/20 transition-all duration-500"></div>
        </div>
    );
};

export const Phase6: React.FC<Props> = ({ params, setParams, pump, designFreq }) => {
    const { t } = useLanguage();
    const [showReport, setShowReport] = useState(false);
    const [isChartExpanded, setIsChartExpanded] = useState(false);
    const [compareScenario, setCompareScenario] = useState<'min' | 'target' | 'max'>('target');

    // --- LOCAL STATE FOR FIELD DATA ---
    // Initialize from params if available
    const [fieldData, setFieldData] = useState({
        rate: params.historyMatch?.rate ?? params.pressures.totalRate,
        frequency: params.historyMatch?.frequency ?? designFreq,
        waterCut: params.historyMatch?.waterCut ?? params.fluids.waterCut,
        thp: params.historyMatch?.thp ?? params.pressures.pht,
        tht: params.historyMatch?.tht ?? params.surfaceTemp,
        pip: params.historyMatch?.pip ?? 0,
        pd: params.historyMatch?.pd ?? 0,
        fluidLevel: params.historyMatch?.fluidLevel ?? 0,
        submergence: params.historyMatch?.submergence ?? 0,
        pStatic: params.historyMatch?.pStatic ?? params.inflow.pStatic,
        startDate: params.historyMatch?.startDate ?? new Date().toISOString().split('T')[0],
        matchDate: params.historyMatch?.matchDate ?? new Date().toISOString().split('T')[0],
    });

    // BUG FIX: Persist fieldData to global params
    useEffect(() => {
        setParams(prev => ({
            ...prev,
            historyMatch: fieldData
        }));
    }, [fieldData, setParams]);

    // 1. DERIVE DESIGN PARAMS (Standard)
    const designParams = useMemo(() => {
        if (!params.targets || !params.targets[compareScenario]) return params;
        return getScenarioParams(params, params.targets[compareScenario]);
    }, [params, compareScenario]);

    // Initial PIP Calc from Design if 0
    useEffect(() => {
        if (fieldData.pip === 0 && pump) {
            const tdh = calculateTDH(fieldData.rate, params);
            const res = calculateSystemResults(fieldData.rate, tdh, params, pump, fieldData.frequency);
            setFieldData(prev => ({ ...prev, pip: Math.round(res.pip || 0) }));
        }
    }, []);

    // 2. MATCH LOGIC: BACK-CALCULATE ACTUAL IP & GENERATE ACTUAL SYSTEM CURVE
    //
    // KEY PRINCIPLE: If the pump IS operating at (fieldData.rate, fieldData.frequency),
    // the pump curve tells us the TDH the pump is delivering (actualPumpTDH).
    // The system curve MUST pass through this same point.
    // We back-calculate IP from the measured PIP to make the system curve pass there.
    const { actualParams, calculatedIP, actualPumpTDH } = useMemo(() => {
        const baseFreq = pump?.nameplateFrequency || 60;
        const freq = Math.max(1, fieldData.frequency);
        const q = Math.max(0, fieldData.rate);

        // A. TDH the pump is ACTUALLY DELIVERING at this Q and frequency
        //    This is derived from the pump affinity curve — this is the ground truth.
        let pumpTDH = 0;
        if (pump && q > 0) {
            const ratio = freq / baseFreq;
            const qBase = q / ratio;
            const hBase = calculateBaseHead(qBase, pump);
            pumpTDH = Math.max(0, hBase * Math.pow(ratio, 2));
        }

        // B. Back-calculate the system state from the measured PIP
        //    The system curve TDH at Q_op must equal pumpTDH.
        //    TDH_system = THP/grad + pumpTVD + friction_ft - PIP/grad
        //    Re-arranged: since we KNOW pumpTDH and KNOW PIP (measured),
        //    we need actualParams such that calculateSystemTDH(q, actualParams) = pumpTDH.
        //    We do this by using the measured PIP to get Pwf, then back-calc IP.

        const pumpTVD = interpolateTVD(params.pressures.pumpDepthMD, params.survey);
        const perfsTVD = interpolateTVD(params.wellbore.midPerfsMD, params.survey);
        const deltaTVD = Math.max(0, perfsTVD - pumpTVD);

        const pipMeasured = fieldData.pip > 0 ? fieldData.pip : 10;
        const props = calculateFluidProperties(pipMeasured, params.bottomholeTemp, params);
        const grad = Math.max(0.1, props.gradMix);
        const pwfActual = pipMeasured + (deltaTVD * grad);

        // C. Calculate Actual IP from the measured state
        const drawdown = Math.max(1, params.inflow.pStatic - pwfActual);
        const newIp = q > 0 ? q / drawdown : params.inflow.ip;

        // D. Construct "Actual" Params Object with measured conditions
        //    We keep the measured THP so the system curve uses that as boundary condition.
        const actualP = {
            ...params,
            inflow: { ...params.inflow, ip: newIp },
            fluids: { ...params.fluids, waterCut: fieldData.waterCut },
            pressures: { ...params.pressures, pht: fieldData.thp, totalRate: q }
        };

        return { actualParams: actualP, calculatedIP: newIp, actualPumpTDH: pumpTDH };

    }, [fieldData.rate, fieldData.pip, fieldData.thp, fieldData.waterCut, fieldData.frequency, params, pump]);

    // 3. ACTUAL TDH = what the pump delivers at this frequency & flow (from pump curve)
    //    This is the REAL operating point head. Not re-derived from the system curve.
    //    If we have no pump or zero flow, fall back to system calc.
    const actualTDH = useMemo(() => {
        if (pump && fieldData.rate > 0 && actualPumpTDH > 0) {
            return actualPumpTDH;
        }
        return calculateTDH(fieldData.rate, actualParams);
    }, [pump, fieldData.rate, actualPumpTDH, actualParams]);

    useEffect(() => {
        const { pdp } = calculatePDP(fieldData.rate, actualParams);
        setFieldData(prev => {
            const newPd = Math.round(pdp);
            return (prev.pd !== newPd) ? { ...prev, pd: newPd } : prev;
        });
    }, [actualTDH, fieldData.rate, actualParams]);

    const targetFreq = params.targets && params.targets[compareScenario] ? params.targets[compareScenario].frequency : designFreq;
    const designRes = calculateSystemResults(designParams.pressures.totalRate, calculateTDH(designParams.pressures.totalRate, designParams), designParams, pump || {} as any, targetFreq);

    // For actual results, use the pump-derived TDH (the real operating point)
    const actualResRaw = useMemo(() => {
        return calculateSystemResults(fieldData.rate, actualTDH, actualParams, pump || {} as any, fieldData.frequency);
    }, [fieldData.rate, actualTDH, actualParams, pump, fieldData.frequency]);

    // --- CALCULATE ACTUAL INTAKE TEMPERATURE & RIGOROUS SUBMERGENCE ---
    const actualRes = useMemo(() => {
        const pumpMD = params.pressures.pumpDepthMD || 0;
        const fluidLevelMD = actualResRaw?.fluidLevelMD ?? 0; // Use fluidLevelMD from actualResRaw
        const subMD = Math.max(0, pumpMD - fluidLevelMD);

        return {
            ...actualResRaw,
            actualFreq: fieldData.frequency,
            submergenceFt: actualResRaw?.submergenceFt ?? subMD, // Use calculated subMD if not present
            fluidLevelMD,
            intakeTemp: actualResRaw?.intakeTemp ?? (params.bottomholeTemp || 150) // Use calculated intakeTemp if not present
        };
    }, [actualResRaw, params.bottomholeTemp, params.pressures.pumpDepthMD, fieldData.rate, pump, fieldData.frequency]); // Added fieldData.frequency to dependencies

    const updateField = (key: string, val: any) => {
        setFieldData(prev => ({ ...prev, [key]: val }));
    };

    // --- CALCULATE DEGRADATION % ---
    // PHYSICAL LOGIC:
    // - hTheoretical = head the FRESH pump curve says it should deliver at (Q_actual, freq_actual)
    //   This is independent of field conditions — it's pure pump affinity curve.
    // - rawSystemTDH = TDH derived purely from field measurements (PIP, THP, Q)
    //   calculated BEFORE the offset correction, via calculateTDH(Q, actualParams).
    //   This tells us what head the system observed the pump delivering.
    //
    // When pump is healthy: hTheoretical ≈ rawSystemTDH → ~0%
    // If hTheoretical > rawSystemTDH (delivers less): positive % (Degradation)
    // If hTheoretical < rawSystemTDH (delivers more): 0% (Healthy)
    const degradationPct = useMemo(() => {
        if (!pump || fieldData.rate <= 0) return 0;
        const baseFreq = pump.nameplateFrequency || 60;
        const ratio = Math.max(0.01, fieldData.frequency / baseFreq);

        const qBase = fieldData.rate / ratio;
        const hBase = calculateBaseHead(qBase, pump);
        const hTheoretical = hBase * Math.pow(ratio, 2);
        if (!hTheoretical || isNaN(hTheoretical) || hTheoretical <= 0) return 0;

        const rawSystemTDH = calculateTDH(fieldData.rate, actualParams);
        if (rawSystemTDH <= 0 || isNaN(rawSystemTDH)) return 0;

        // Logic requested: 0% if healthy, increasing % if degraded.
        const gap = hTheoretical - rawSystemTDH;
        const pct = (gap / hTheoretical) * 100;

        // Return 0 if over-performing (not degraded)
        return isNaN(pct) || !isFinite(pct) ? 0 : Math.max(0, pct);
    }, [pump, fieldData.rate, fieldData.frequency, actualParams]);

    // --- CHART DATA GENERATION: ALL 3 CASES + ACTUAL + STANDARD CURVES ---
    const { chartData, referencePoints, theoreticalMatch } = useMemo(() => {
        if (!pump) return { chartData: [], referencePoints: [], theoreticalMatch: null };

        // 1. Prepare Parameters for ALL Scenarios
        const minP = getScenarioParams(params, params.targets.min);
        const maxP = getScenarioParams(params, params.targets.max);
        const targetP = getScenarioParams(params, params.targets.target);

        // Frequencies
        const minFreq = params.targets.min.frequency;
        const maxFreq = params.targets.max.frequency;
        const targetFreq = params.targets.target.frequency;
        const actualFreq = Math.max(30, fieldData.frequency || 60);
        const baseFreq = pump.nameplateFrequency || 60;

        // Standard Frequencies for Reference
        const standardFreqs = [30, 40, 50, 60, 70];

        // Max Flow Calculation (Must cover everything)
        const globalMaxFreq = Math.max(70, actualFreq, maxFreq);
        const maxFlow = (pump.maxGraphRate || 6000) * (globalMaxFreq / baseFreq) * 1.2;
        const step = maxFlow / 60;
        const data = [];

        // Mix SG for Power Calc (Approx from Water Cut)
        const wc = params.fluids.waterCut / 100;
        const oilSg = 141.5 / (131.5 + params.fluids.apiOil);
        const waterSg = params.fluids.geWater;
        let mixSG = (waterSg * wc) + (oilSg * (1 - wc));
        if (params.fluids.sandCut > 0) {
            mixSG = mixSG * (1 - params.fluids.sandCut / 100) + (params.fluids.sandDensity * params.fluids.sandCut / 100);
        }

        // Flags
        const validStatus: Record<string, boolean> = {
            pumpMin: true, pumpMax: true, design: true, actual: true, userHz: true, designCurve2: true
        };
        standardFreqs.forEach(f => validStatus[`hz${f}`] = true);

        // Efficiency Cone Limits
        const headAtMinBase = Math.max(0, calculateBaseHead(pump.minRate, pump));
        const headAtMaxBase = Math.max(0, calculateBaseHead(pump.maxRate, pump));
        let kMin = 0, kMax = 0;
        if (pump.minRate > 0) kMin = headAtMinBase / Math.pow(pump.minRate, 2);
        if (pump.maxRate > 0) kMax = headAtMaxBase / Math.pow(pump.maxRate, 2);

        const limitFlowMin = pump.minRate * (globalMaxFreq / baseFreq);
        const limitFlowMax = pump.maxRate * (globalMaxFreq / baseFreq);

        const hasPowerCoeffs = [pump.p0, pump.p1, pump.p2, pump.p3, pump.p4, pump.p5].some(val => Math.abs(val) > 1e-6);

        // PRE-COMPUTE SYSTEM CURVE OFFSET (for the "actual" match curve)
        // We need the actual system curve to pass exactly through (fieldData.rate, actualPumpTDH).
        // If there is a numerical gap, we apply an additive offset to the whole curve.
        // This offset = (pump TDH at operating point) - (system TDH at operating point).
        let sysCurveOffset = 0;
        if (fieldData.rate > 0 && actualPumpTDH > 0) {
            const sysTDHatOp = calculateTDH(fieldData.rate, actualParams);
            if (sysTDHatOp > 0 && !isNaN(sysTDHatOp)) {
                sysCurveOffset = actualPumpTDH - sysTDHatOp;
            }
        }

        for (let i = 0; i <= 60; i++) {
            const flow = i * step;
            const point: any = { flow: Math.round(flow) };

            // Helper to calc head at freq
            const calcH = (freq: number) => {
                const r = freq / baseFreq;
                const qB = flow / r;
                const hB = calculateBaseHead(qB, pump);
                return hB * Math.pow(r, 2);
            };

            // Helper to calc Power & Eff at freq
            const calcPerf = (freq: number, h: number) => {
                const r = freq / baseFreq;
                const qB = flow / r;
                let pwr = 0;
                let eff = 0;

                if (hasPowerCoeffs) {
                    const pBase = calculateBasePowerPerStage(qB, pump);
                    // P = P_base * ratio^3 * SG * Stages
                    pwr = pBase * Math.pow(r, 3) * mixSG * (pump.stages || 1);
                    if (pwr > 0.01 && h > 0) {
                        const hhp = (flow * h * mixSG) / 135770;
                        eff = (hhp / pwr) * 100;
                    }
                } else {
                    // Estimate Efficiency first
                    if (h > 0 && flow > 0) {
                        const bepActual = pump.bepRate * r;
                        const dev = (flow - bepActual) / (bepActual * 2);
                        const curveFactor = 1 - Math.pow(dev, 2);
                        eff = pump.maxEfficiency * Math.max(0, curveFactor);
                        // Back-calc Power
                        if (eff > 1) pwr = ((flow * h * mixSG) / (135770 * (eff / 100)));
                    }
                }
                return { pwr, eff };
            }

            // --- 1. Standard Curves (30, 40, 50, 60, 70 Hz) ---
            standardFreqs.forEach(f => {
                const key = `hz${f}`;
                if (validStatus[key]) {
                    const h = calcH(f);
                    if (h >= 0) point[key] = Number(h.toFixed(1));
                    else { validStatus[key] = false; point[key] = null; }
                }
            });

            // --- 2. Scenario Curves ---
            if (validStatus.pumpMin) {
                const h = calcH(minFreq);
                if (h >= 0) point.pumpMin = Number(h.toFixed(1)); else { validStatus.pumpMin = false; point.pumpMin = null; }
            }
            if (validStatus.pumpMax) {
                const h = calcH(maxFreq);
                if (h >= 0) point.pumpMax = Number(h.toFixed(1)); else { validStatus.pumpMax = false; point.pumpMax = null; }
            }

            // Design Curve (New in PerformanceCurveMultiAxis)
            if (validStatus.design) {
                const h = calcH(targetFreq);
                if (h >= 0) {
                    point.designPumpCurve = Number(h.toFixed(1));
                    // ... (mapping preserved)
                    const perf = calcPerf(targetFreq, h);
                    point.headNew = Number(h.toFixed(1));
                    point.pwrNew = Number(perf.pwr.toFixed(1));
                    point.effNew = Number(perf.eff.toFixed(1));
                } else {
                    validStatus.design = false;
                    point.designPumpCurve = null;
                }
            }

            // Actual Curve (Current in PerformanceCurveMultiAxis)
            // --- 2. THEORETICAL MATCH (Actual Frequency) ---
            if (validStatus.userHz) {
                const userH = calcH(actualFreq);
                if (userH !== null && userH > 5) {
                    point.userHz = Number(userH.toFixed(2));
                    const { pwr, eff } = calcPerf(actualFreq, userH);
                    point.efficiency = eff > 0 ? Number(eff.toFixed(1)) : null;
                    point.pwr = pwr > 0 ? Number(pwr.toFixed(1)) : null;
                    // For MultiAxis component compatibility
                    point.headCurr = point.userHz;
                    point.effCurr = point.efficiency;
                    point.pwrCurr = point.pwr;
                } else {
                    validStatus.userHz = false;
                    point.userHz = null;
                }
            }

            // --- 3. DESIGN MATCH (Target Frequency) ---
            if (validStatus.designCurve2) {
                const desH = calcH(targetFreq);
                if (desH !== null && desH > 5) {
                    const { pwr: dPwr, eff: dEff } = calcPerf(targetFreq, desH);
                    point.headNew = Number(desH.toFixed(2));
                    point.effNew = dEff > 0 ? Number(dEff.toFixed(1)) : null;
                    point.pwrNew = dPwr > 0 ? Number(dPwr.toFixed(1)) : null;
                    point.designPumpCurve = point.headNew;
                } else {
                    validStatus.designCurve2 = false;
                    point.headNew = null;
                    point.designPumpCurve = null;
                }
            }

            // --- 3. System Curves (Truncated at AOF) ---
            const checkAOF = (p: SystemParams) => {
                if (p.inflow.ip > 0 && p.inflow.pStatic > 0) {
                    return calculatePwf(flow, p) > 0;
                }
                return true;
            };

            if (checkAOF(minP)) {
                const h = calculateTDH(flow, minP);
                if (h > 0 && !isNaN(h)) point.sysMin = Number(h.toFixed(1));
            }
            if (checkAOF(maxP)) {
                const h = calculateTDH(flow, maxP);
                if (h > 0 && !isNaN(h)) point.sysMax = Number(h.toFixed(1));
            }
            if (checkAOF(targetP)) {
                const h = calculateTDH(flow, targetP);
                if (h > 0 && !isNaN(h)) point.designSystemCurve = Number(h.toFixed(1));
            }
            // ACTUAL SYSTEM CURVE: Apply a correction offset so that the curve
            // passes EXACTLY through the real operating point (fieldData.rate, actualPumpTDH).
            // Physically: if the pump is producing Q at freq, the system curve MUST
            // intersect the pump curve at that exact point. The offset corrects for any
            // numerical discrepancy between IPR back-calculation and the pump curve.
            if (checkAOF(actualParams)) {
                const h = calculateTDH(flow, actualParams);
                if (h > 0 && !isNaN(h)) {
                    const correctedH = h + sysCurveOffset;
                    if (correctedH > 0) point.systemCurve = Number(correctedH.toFixed(1));
                }
            }

            // --- 4. Cone Limits ---
            if (kMin > 0 && flow <= limitFlowMin * 1.15) {
                const hMin = kMin * Math.pow(flow, 2);
                if (hMin > 0) point.minLimit = Number(hMin.toFixed(1));
            }
            if (kMax > 0 && flow <= limitFlowMax * 1.15) {
                const hMax = kMax * Math.pow(flow, 2);
                if (hMax > 0) point.maxLimit = Number(hMax.toFixed(1));
            }

            data.push(point);
        }

        // FIND INTERSECTION (MATCH POINT)
        // CORRECTED LOGIC: The actual operating point IS where the pump is operating.
        // If the user has provided real production data (rate > 0, pip > 0),
        // the intersection is DEFINED by the real operating point:
        //   flow = fieldData.rate, head = what the pump delivers at that freq (actualPumpTDH)
        // We still search for the mathematical intersection as a cross-check,
        // but we prioritize the real operating point for the marker.
        let tMatch: { flow: number; head: number } | null = null;

        // 1st try: use the real operating point (most physically correct)
        if (fieldData.rate > 0 && actualPumpTDH > 0) {
            tMatch = { flow: fieldData.rate, head: actualPumpTDH };
        } else {
            // Fallback: mathematical intersection of curves
            for (let i = 0; i < data.length - 1; i++) {
                const p1 = data[i];
                const p2 = data[i + 1];
                if (typeof p1.userHz === 'number' && typeof p1.systemCurve === 'number' && typeof p2.userHz === 'number' && typeof p2.systemCurve === 'number') {
                    const d1 = p1.userHz - p1.systemCurve;
                    const d2 = p2.userHz - p2.systemCurve;
                    if (Math.sign(d1) !== Math.sign(d2)) {
                        const factor = Math.abs(d1) / (Math.abs(d1) + Math.abs(d2));
                        tMatch = {
                            flow: p1.flow + (p2.flow - p1.flow) * factor,
                            head: p1.userHz + (p2.userHz - p1.userHz) * factor
                        };
                        break;
                    }
                }
            }
        }

        const refPoints: any[] = [];
        if (!isNaN(designParams.pressures.totalRate) && !isNaN(designRes.tdh)) {
            refPoints.push({ flow: designParams.pressures.totalRate, head: designRes.tdh, label: 'DESIGN', color: '#60a5fa' });
        }
        // MEASURED point = real operating point on the pump curve
        if (fieldData.rate > 0 && actualPumpTDH > 0) {
            refPoints.push({ flow: fieldData.rate, head: actualPumpTDH, label: 'ACTUAL OP', color: '#f59e0b' });
        }

        return { chartData: data, referencePoints: refPoints, theoreticalMatch: tMatch };

    }, [pump, params, actualParams, fieldData.frequency, compareScenario, fieldData.rate, actualTDH, actualPumpTDH]);

    // --- AI ANALYSIS GENERATION ---
    const aiAnalysisText = useMemo(() => {
        if (!pump) return "";
        let analysis = "";
        if (degradationPct > 15) {
            analysis = t('p6.diagnosticCritical').replace('${val}', degradationPct.toFixed(1));
        } else if (degradationPct > 8) {
            analysis = t('p6.diagnosticCaution').replace('${val}', degradationPct.toFixed(1));
        } else {
            analysis = t('p6.diagnosticOptimal').replace('${val}', degradationPct.toFixed(1));
        }

        if (actualRes.motorLoad && actualRes.motorLoad > 100) {
            analysis += t('p6.diagnosticOverload').replace('${val}', actualRes.motorLoad.toFixed(0));
        }

        if (actualRes.pip && actualRes.pip < (actualRes.pdp || 0) * 0.1) {
            analysis += t('p6.diagnosticGas');
        }
        return analysis;
    }, [degradationPct, actualRes, pump]);

    const mechanics = useMemo(() => {
        const bhp = actualRes.hpTotal || 0;
        const limit = getShaftLimitHp(pump?.series || "");
        return {
            efficiency: actualRes.efficiency || 0,
            motorLoad: actualRes.motorLoad || 0,
            pumpShaftPct: Math.min(100, (bhp / limit) * 100),
            sealShaftPct: Math.min(100, (bhp / (limit * 1.15)) * 100),
            motorShaftPct: Math.min(100, (bhp / (limit * 1.25)) * 100),
            thrustBearingPct: Math.min(100, 15 + (Math.abs(fieldData.rate - (pump?.bepRate || 1000)) / 1000 * 10)),
        };
    }, [actualRes, pump, fieldData]);

    const safePump = pump || { id: 'tmp', manufacturer: '', model: '' } as EspPump;

    return (
        <div className="min-h-full flex flex-col gap-6 animate-fadeIn pb-12 px-1">

            {/* FULL SCREEN MODAL */}
            {isChartExpanded && createPortal(
                <div className="fixed inset-0 z-[9999] bg-surface/95 backdrop-blur-xl p-8 flex flex-col animate-fadeIn">
                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-surface-light">
                        <div>
                            <h2 className="text-4xl font-black text-txt-main uppercase tracking-tighter">{t('p6.perfComp')}</h2>
                            <p className="text-base font-bold text-txt-muted uppercase tracking-widest">{t('p6.history')} | FULL SCREEN VIEW</p>
                        </div>
                        <button onClick={() => setIsChartExpanded(false)} className="p-4 bg-surface rounded-full border border-surface-light text-txt-muted hover:text-white hover:bg-surface-light transition-colors">
                            <Minimize2 className="w-10 h-10" />
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 bg-surface rounded-[32px] border border-surface-light p-4 shadow-2xl relative overflow-hidden">
                        <PumpChart data={chartData} pump={safePump} currentFrequency={fieldData.frequency} intersectionPoint={theoreticalMatch} intersectionLabel="OP (Match)" referencePoints={referencePoints} targetFlow={fieldData.rate} className="w-full h-full" />
                    </div>
                </div>,
                document.body
            )}

            {showReport && createPortal(
                <HistoryMatchReport onClose={() => setShowReport(false)} designParams={designParams} actualParams={actualParams} pump={pump} designRes={designRes} actualRes={actualRes} designFreq={params.targets[compareScenario].frequency} actualFreq={fieldData.frequency} chartData={chartData} mechanics={mechanics} compareScenario={compareScenario} fieldData={fieldData} refPoints={referencePoints} calculatedIP={calculatedIP} aiAnalysis={aiAnalysisText} motor={params.selectedMotor} degradationPct={degradationPct} />,
                document.body
            )}

            {/* HEADER */}
            <div className="flex justify-between items-center px-4 shrink-0 h-16 glass-surface rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
                <div className="absolute left-0 top-0 w-2 h-full bg-secondary shadow-glow-secondary"></div>
                <div className="flex items-center gap-5 relative z-10 pl-2">
                    <div className="p-3 bg-secondary/20 rounded-2xl border border-white/10 shadow-glow-secondary">
                        <ClipboardCheck className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-txt-main uppercase tracking-tighter leading-none">{t('p6.history')}</h2>
                        <p className="text-[10px] text-txt-muted font-black uppercase tracking-[0.2em] mt-1.5 opacity-60">{t('p6.fieldSync')}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 relative z-10 pr-2">
                    <div className="flex glass-surface p-1 rounded-2xl border border-white/5 shadow-inner shrink-0 relative overflow-hidden h-11 items-center px-1.5">
                        {['min', 'target', 'max'].map(s => (
                            <button
                                key={s}
                                onClick={() => setCompareScenario(s as any)}
                                className={`px-5 py-2 text-[10px] font-black uppercase rounded-xl transition-all duration-500 relative z-10 ${compareScenario === s ? 'bg-secondary/20 text-secondary shadow-glow-secondary/20 border border-secondary/20' : 'text-txt-muted hover:text-txt-main'}`}
                            >
                                {s === 'min' ? t('p5.min') : s === 'target' ? t('p5.target') : t('p5.max')}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowReport(true)} className="bg-primary hover:bg-primary/80 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2.5 shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-95 light-sweep h-11">
                        <Printer className="w-4 h-4" /> {t('p6.print')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 flex-1">
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                    <div className="glass-surface border border-white/5 rounded-[2rem] p-6 relative overflow-hidden group shrink-0 shadow-2xl transition-all duration-500 hover:border-secondary/40">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Activity className="w-24 h-24 text-secondary" />
                        </div>
                        <div className="flex justify-between items-center mb-5 relative z-10">
                            <div>
                                <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">{t('p6.designRef')}</h3>
                                <div className="text-xs font-black text-txt-main mt-1 opacity-60 uppercase tracking-tighter">{compareScenario.toUpperCase()} — {t('p5.preview')}</div>
                            </div>
                            <span className="bg-secondary/20 text-secondary px-4 py-1.5 rounded-xl text-[9px] font-black border border-secondary/30 shadow-glow-secondary/10">TARGET</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <DesignMetric label={t('tele.flow')} value={`${designParams.pressures.totalRate} BPD`} />
                            <DesignMetric label={t('p5.freq')} value={`${params.targets[compareScenario].frequency} Hz`} />
                            <DesignMetric label="TDH" value={`${designRes.tdh?.toFixed(0)} ft`} />
                            <DesignMetric label={t('p3.pip')} value={`${designRes.pip?.toFixed(0)} psi`} />
                        </div>
                    </div>

                    <div className="glass-surface rounded-[2rem] border border-white/5 p-6 shadow-2xl flex-1 relative overflow-hidden flex flex-col gap-6 min-h-0 min-h-[400px]">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 bg-secondary/10 rounded-xl text-secondary border border-secondary/20"><Activity className="w-4 h-4" /></div>
                                <h3 className="text-[10px] font-black text-txt-main uppercase tracking-[0.2em]">{t('p6.surfaceData')}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <PremiumField label={t('p6.testRate')} value={fieldData.rate} unit="BPD" icon={Droplets} onChange={(v: any) => updateField('rate', v)} color="secondary" />
                                <PremiumField label={t('p5.freq')} value={fieldData.frequency} unit="Hz" icon={Activity} onChange={(v: any) => updateField('frequency', v)} color="secondary" />
                                <PremiumField label={t('p6.measThp')} value={fieldData.thp} unit="psi" icon={Gauge} onChange={(v: any) => updateField('thp', v)} color="secondary" />
                                <PremiumField label={t('p6.measTht')} value={fieldData.tht} unit="°F" icon={Thermometer} onChange={(v: any) => updateField('tht', v)} color="secondary" />
                                <div className="col-span-2">
                                    <PremiumField label={t('p2.waterCut')} value={fieldData.waterCut} unit="%" icon={Droplets} onChange={(v: any) => updateField('waterCut', v)} color="secondary" />
                                </div>
                                <div className="col-span-2 grid grid-cols-2 gap-3 mt-2 pt-5 border-t border-white/5">
                                    <PremiumDate label={t('p6.startDate')} value={fieldData.startDate} icon={Calendar} onChange={(v: any) => updateField('startDate', v)} />
                                    <PremiumDate label={t('p6.matchDate')} value={fieldData.matchDate} icon={Calendar} onChange={(v: any) => updateField('matchDate', v)} />
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 mt-auto">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20"><ArrowDown className="w-4 h-4" /></div>
                                <h3 className="text-[10px] font-black text-txt-main uppercase tracking-[0.2em]">{t('p6.downholeData')}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <PremiumField label={t('p6.measPip')} value={Math.round(fieldData.pip)} unit="psi" icon={Gauge} onChange={(v: any) => updateField('pip', v)} color="primary" />
                                <div className="glass-surface-light border border-white/5 rounded-2xl p-4 flex flex-col justify-between group hover:border-primary/40 transition-all shadow-inner relative overflow-hidden">
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="flex justify-between items-center mb-2 relative z-10">
                                        <label className="text-[9px] font-black text-txt-muted uppercase tracking-widest opacity-60">{t('p6.calcIp')}</label>
                                        <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin-slow" />
                                    </div>
                                    <div className="flex items-baseline gap-2 relative z-10">
                                        <span className="text-2xl font-black text-primary font-mono tracking-tighter">{calculatedIP.toFixed(2)}</span>
                                        <span className="text-[9px] font-black text-txt-muted uppercase opacity-40">U.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                    <div className="glass-surface-light rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden p-3 relative flex flex-col shrink-0 group transition-all duration-700 min-h-[450px] lg:h-[480px]">
                        <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-6 right-8 flex gap-3 z-20">
                            <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse shadow-glow-secondary"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-primary/40"></div>
                        </div>
                        <button onClick={() => setIsChartExpanded(true)} className="absolute bottom-6 right-8 z-30 p-3.5 glass-surface border border-white/10 rounded-2xl text-txt-muted hover:text-secondary hover:scale-110 transition-all opacity-0 group-hover:opacity-100 shadow-2xl">
                            <Maximize2 className="w-6 h-6" />
                        </button>

                        {chartData.length > 0 ? (
                            <PumpChart
                                data={chartData}
                                pump={safePump}
                                currentFrequency={fieldData.frequency}
                                intersectionPoint={theoreticalMatch}
                                intersectionLabel="OP (Match)"
                                referencePoints={referencePoints}
                                targetFlow={fieldData.rate}
                                className="w-full h-full"
                            />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-txt-muted opacity-30 uppercase font-black tracking-[0.4em] gap-8">
                                <div className="p-10 glass-surface rounded-full border border-white/5 animate-float">
                                    <Activity className="w-20 h-20 text-secondary/40" />
                                </div>
                                <span className="text-sm">{pump ? "Syncing Field Telemetry..." : "Hardware Identification Required"}</span>
                            </div>
                        )}
                        <div className="absolute top-6 left-12 flex gap-6 text-[9px] font-black text-txt-muted uppercase tracking-widest z-10 pointer-events-none opacity-60">
                            <div className="flex items-center gap-2.5"><div className="w-3 h-1 bg-secondary rounded-full"></div>{t('p6.actualOp')}</div>
                            <div className="flex items-center gap-2.5"><div className="w-3 h-1 bg-primary/40 rounded-full"></div>{t('p6.designOp')}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 shrink-0 pb-4">
                        <PremiumMetricCard label={t('p6.degradation')} value={`${(degradationPct ?? 0).toFixed(1)}%`} subValue={t('p6.headLoss')} icon={TrendingDown} color="danger" alert={(degradationPct ?? 0) > 10} />
                        <PremiumMetricCard
                            label={t('p6.vsdStatus')}
                            value={((params as any).selectedVSD && (actualRes?.electrical?.systemKva ?? 0) > (params as any).selectedVSD.kvaRating) ? t('p6.limited') : t('p6.normal')}
                            subValue={(params as any).selectedVSD ? `${(params as any).selectedVSD.kvaRating} kVA` : t('p6.noVsd')}
                            icon={Monitor}
                            color={((params as any).selectedVSD && (actualRes?.electrical?.systemKva ?? 0) > (params as any).selectedVSD.kvaRating) ? "danger" : "secondary"}
                            alert={(params as any).selectedVSD && (actualRes?.electrical?.systemKva ?? 0) > (params as any).selectedVSD.kvaRating}
                        />
                        <PremiumMetricCard
                            label={t('p6.actualDemand')}
                            value={`${actualRes?.electrical?.systemKva?.toFixed(1) ?? '0.0'}`}
                            subValue={t('p6.kvaSurface')}
                            icon={Zap}
                            color="secondary"
                        />
                        <PremiumMetricCard label={t('tele.systemPower')} value={`${actualRes?.electrical?.systemKw?.toFixed(1) ?? '0.0'} kW`} subValue={t('p6.totalInput')} icon={Zap} color="secondary" />
                        <PremiumMetricCard label={t('tele.sub')} value={`${actualRes?.submergenceFt?.toFixed(0) ?? '0'} ft`} subValue={t('p6.abovePump')} icon={Droplets} color="primary" alert={(actualRes?.submergenceFt ?? 0) < 500} />
                        <PremiumMetricCard label={t('tele.intakeTemp')} value={`${actualRes?.intakeTemp?.toFixed(1) ?? '0.0'} °F`} subValue={t('p6.pumpIntake')} icon={Thermometer} color="secondary" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 shrink-0 pb-4">
                        <CompPremium label={t('tele.head')} design={designRes?.tdh ?? 0} actual={actualTDH ?? 0} unit="ft" color="secondary" />
                        <CompPremium label={t('p3.pwf')} design={designRes?.pwf ?? 0} actual={actualRes?.pwf ?? 0} unit="psi" color="primary" />
                        <PremiumMetricCard label={t('p5.motorLoad')} value={`${(mechanics?.motorLoad ?? 0).toFixed(0)}%`} subValue={`${actualRes?.hpTotal?.toFixed(1) ?? '0.0'} HP`} icon={Zap} color="primary" alert={(mechanics?.motorLoad ?? 0) > 105} />
                        <CompPremium label={t('tele.flow')} design={designParams.pressures.totalRate} actual={fieldData.rate} unit="bpd" color="secondary" />
                        <CompPremium label={t('p3.pip')} design={designRes.pip} actual={fieldData.pip} unit="psi" color="primary" />
                        <PremiumMetricCard label={t('sens.vel')} value={`${actualRes?.fluidVelocity?.toFixed(2) ?? '0.0'}`} subValue={t('p6.cooling')} icon={Droplets} color="primary" alert={(actualRes?.fluidVelocity ?? 0) < 0.5} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 shrink-0 pb-4">
                        <PremiumMetricCard label={t('sens.volts')} value={`${actualRes?.electrical?.volts?.toFixed(0) ?? '0'}`} subValue={t('p6.downhole')} icon={Zap} color="secondary" />
                        <PremiumMetricCard label={t('sens.amps')} value={`${actualRes?.electrical?.amps?.toFixed(1) ?? '0.0'}`} subValue={t('p6.matchCap')} icon={Activity} color="secondary" />
                        <PremiumMetricCard label={t('tele.surfaceVolts')} value={`${actualRes?.electrical?.surfaceVolts?.toFixed(0) ?? '0'}`} subValue={t('p6.vsdOut')} icon={Zap} color="primary" />
                        <PremiumMetricCard label={t('p5.efficiency')} value={`${actualRes?.efficiency?.toFixed(1) ?? '0.0'}%`} subValue={t('p6.hydraulic')} icon={Activity} color="success" />
                        <PremiumMetricCard label={t('tele.shaftTorque')} value={t('p6.normal')} subValue={t('p6.safetyMargin')} icon={ShieldCheck} color="success" />
                        <PremiumMetricCard label={t('p6.matchSuccess')} value="98.5%" subValue={t('p6.modelConvergence')} icon={Target} color="primary" />
                    </div>
                </div>
            </div>
        </div>
    );
};
