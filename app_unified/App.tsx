
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    generateMultiCurveData, findIntersection, calculateSystemResults, calculateTDH, enforcePVTConsistency, calculateAOF, calculateBaseHead, exportProjectToExcel, getShaftLimitHp, getDownloadFilename
} from './utils';
import { read, utils as xlsxUtils } from 'xlsx';
import { PumpImportModal } from './components/PumpImportModal';
import { LandingPage } from './components/LandingPage';
import { Phase1 } from './components/Phase1';
import { Phase2 } from './components/Phase2';
import { Phase3 } from './components/Phase3';
import { PhaseScenarios } from './components/PhaseScenarios';
import { Phase5, ReportSelectorModal, DesignReport } from './components/Phase5';
import { PhaseSimulations } from './components/PhaseSimulations';
import { Phase6 } from './components/Phase6';
import { DesignComparator } from './components/DesignComparator';
import { TUBING_CATALOG, CASING_CATALOG } from './data';
import {
    Activity, RotateCcw, Ruler, Droplets, Target, Hexagon, CheckCircle2, Clock, ClipboardCheck, Maximize, Minimize, Globe, AlertCircle, Sparkles, RefreshCw, Send, ChevronDown, ChevronRight, AlertTriangle, Layers, Palette, FileSpreadsheet, Maximize2, Printer, GitCompareArrows
} from 'lucide-react';
import { EspPump, EspMotor, SystemParams, SurveyPoint } from './types';
import { useLanguage } from './i18n';
import { useTheme } from './theme';
import { useEspCopilot } from './hooks/useEspCopilot';

const INITIAL_SURVEY: SurveyPoint[] = [];

const INITIAL_PARAMS: SystemParams = {
    metadata: {
        projectName: 'New Design 001',
        wellName: 'Well-X',
        engineer: '',
        company: '',
        date: new Date().toISOString().split('T')[0],
        comments: ''
    },
    wellbore: {
        correlation: 'Hagedorn-Brown',
        casing: CASING_CATALOG[0],
        tubing: TUBING_CATALOG[0],
        casingTop: 0, casingBottom: 0,
        tubingTop: 0, tubingBottom: 0,
        midPerfsMD: 0
    },
    fluids: {
        apiOil: 0, geGas: 0, waterCut: 0, geWater: 1.0, salinity: 0, pb: 0, gor: 0, glr: 0,
        isDeadOil: false, co2: 0, h2s: 0, n2: 0, sandCut: 0, sandDensity: 2.65,
        pvtCorrelation: 'Lasater', viscosityModel: 'Total Fluid',
        correlations: {
            viscDeadOil: 'Beggs-Robinson', viscSatOil: 'Beggs-Robinson', viscUnsatOil: 'Vasquez-Beggs',
            viscGas: 'Lee', viscWater: 'Matthews & Russell', oilDensity: 'Katz',
            gasDensity: 'Beggs', waterDensity: 'Beggs', pbRs: 'Lasater',
            oilComp: 'Vasquez-Beggs', oilFvf: 'Vasquez-Beggs', waterFvf: 'HP41C',
            zFactor: 'Dranchuk-Purvis', surfaceTensionOil: 'Baker-Swerdloff', surfaceTensionWater: 'Hough'
        }
    },
    inflow: {
        model: 'Productivity Index', staticSource: 'BHP', pStatic: 0, staticLevel: 0, ip: 0
    },
    pressures: { totalRate: 0, pht: 0, phc: 0, pumpDepthMD: 0 },
    targets: {
        min: { rate: 0, ip: 0, waterCut: 0, gor: 0, frequency: 50 },
        target: { rate: 0, ip: 0, waterCut: 0, gor: 0, frequency: 60 },
        max: { rate: 0, ip: 0, waterCut: 0, gor: 0, frequency: 60 }
    },
    activeScenario: 'target',
    surfaceTemp: 0, bottomholeTemp: 0,
    motorHp: 0,
    totalDepthMD: 0, survey: INITIAL_SURVEY,
    simulation: { annualWearPercent: 0, simulationMonths: 36, costPerKwh: 0 }
};

// --- ADVANCED MARKDOWN RENDERER ---
const MarkdownRenderer = ({ content }: { content: string }) => {
    // Helper to process inline formatting (bold, math, code)
    const processInline = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*|\$.*?\$|`.*?`)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-txt-main font-black">{part.slice(2, -2)}</strong>;
            if (part.startsWith('$') && part.endsWith('$')) return <span key={i} className="text-secondary font-mono bg-secondary/10 px-1 rounded mx-1">{part.slice(1, -1)}</span>;
            if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="text-primary font-mono bg-surface-light px-1 rounded">{part.slice(1, -1)}</code>;
            return <span key={i}>{part}</span>;
        });
    };

    // Split by lines
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let tableBuffer: string[] = [];
    let inTable = false;

    const flushTable = (keyPrefix: string) => {
        if (tableBuffer.length === 0) return null;
        const rows = tableBuffer.map(row => row.split('|').filter(c => c.trim() !== '').map(c => c.trim()));
        const header = rows[0];
        const body = rows.slice(2); // Skip separator row

        const table = (
            <div key={keyPrefix} className="my-6 overflow-hidden rounded-2xl border border-surface-light shadow-md">
                <table className="w-full text-sm text-left">
                    <thead className="bg-surface-light text-txt-muted uppercase font-black tracking-widest">
                        <tr>{header.map((h, i) => <th key={i} className="px-5 py-4">{processInline(h)}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-surface-light bg-surface">
                        {body.map((row, i) => (
                            <tr key={i} className="hover:bg-surface-light/50 transition-colors">
                                {row.map((cell, j) => (
                                    <td key={j} className={`px-5 py-3 font-medium ${j === 0 ? 'text-primary font-black' : 'text-txt-muted'}`}>
                                        {processInline(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
        tableBuffer = [];
        inTable = false;
        return table;
    };

    lines.forEach((line, index) => {
        const trimmed = line.trim();

        // Handle Table Lines
        if (trimmed.startsWith('|')) {
            inTable = true;
            tableBuffer.push(trimmed);
            // If it's the last line, flush
            if (index === lines.length - 1) elements.push(flushTable(`tbl-${index}`));
            return;
        } else if (inTable) {
            elements.push(flushTable(`tbl-${index}`));
        }

        // Headers
        if (trimmed.startsWith('###')) {
            elements.push(<h4 key={index} className="text-base font-black text-primary uppercase tracking-widest mt-8 mb-3 border-b-2 border-surface-light pb-2">{trimmed.replace(/^###\s*/, '')}</h4>);
        } else if (trimmed.startsWith('##')) {
            elements.push(<h3 key={index} className="text-lg font-black text-txt-main mt-10 mb-4 flex items-center gap-3"><div className="w-1.5 h-6 bg-primary rounded-full"></div>{trimmed.replace(/^##\s*/, '')}</h3>);
        } else if (trimmed.startsWith('#')) {
            elements.push(<h2 key={index} className="text-2xl font-black text-txt-main mt-6 mb-6 tracking-tighter">{trimmed.replace(/^#\s*/, '')}</h2>);
        }
        // Lists
        else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            elements.push(<div key={index} className="flex gap-3 ml-2 mb-1 text-txt-muted"><span className="text-primary font-bold mt-1.5">•</span><span className="leading-relaxed">{processInline(trimmed.substring(2))}</span></div>);
        }
        else if (/^\d+\./.test(trimmed)) {
            elements.push(<div key={index} className="flex gap-3 ml-2 mb-1 text-txt-muted"><span className="text-secondary font-bold mt-0.5 min-w-[20px]">{trimmed.split('.')[0]}.</span><span className="leading-relaxed">{processInline(trimmed.replace(/^\d+\.\s*/, ''))}</span></div>);
        }
        // Empty lines
        else if (trimmed === '') {
            elements.push(<div key={index} className="h-2"></div>);
        }
        // Paragraphs
        else {
            elements.push(<p key={index} className="text-txt-muted leading-relaxed mb-2 text-sm font-medium">{processInline(trimmed)}</p>);
        }
    });

    // Flush table if leftover
    if (inTable) elements.push(flushTable(`tbl-end`));

    return <div className="space-y-1">{elements}</div>;
};

const App: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();
    const { theme, cycleTheme } = useTheme();
    const [appMode, setAppMode] = useState<'landing' | 'main' | 'comparator'>('landing');
    const [activeStep, setActiveStep] = useState(0);
    const [initialDesignForComparator, setInitialDesignForComparator] = useState<any>(null);
    const [showPumpModal, setShowPumpModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isChatMinimized, setIsChatMinimized] = useState(true);

    // AI Controls
    const [aiScope, setAiScope] = useState<number | 'current'>('current');
    const [userInput, setUserInput] = useState('');

    const chatEndRef = useRef<HTMLDivElement>(null);

    const [params, setParams] = useState<SystemParams>(INITIAL_PARAMS);
    const [customPump, setCustomPump] = useState<EspPump | null>(null);
    const [rawSurvey, setRawSurvey] = useState('');
    const [toast, setToast] = useState<{ msg: string, show: boolean, type?: 'info' | 'warning' }>({ msg: '', show: false });
    const [pumpCatalog, setPumpCatalog] = useState<EspPump[]>([]);
    const [showGlobalReportSelector, setShowGlobalReportSelector] = useState(false);
    const [globalReportConfig, setGlobalReportConfig] = useState<any>({ isOpen: false, type: 'target' });

    const [motorCatalog, setMotorCatalog] = useState<EspMotor[]>([]);

    // Calculations
    const currentFrequency = params.targets[params.activeScenario].frequency;
    const curveData = useMemo(() => customPump ? generateMultiCurveData(customPump, params, currentFrequency) : [], [customPump, params, currentFrequency]);
    const match = useMemo(() => findIntersection(curveData), [curveData]);

    const designResults = useMemo(() => calculateSystemResults(params.pressures.totalRate, null, params, customPump || { id: 'tmp', stages: 1, h0: 0, h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0, p0: 0, p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, nameplateFrequency: 60 } as any, currentFrequency), [params.pressures.totalRate, params, customPump, currentFrequency]);
    const matchResults = useMemo(() => calculateSystemResults(match?.flow || 0, match?.head || 0, params, customPump || { id: 'tmp', stages: 1, h0: 0, h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0, p0: 0, p1: 0, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0, nameplateFrequency: 60 } as any, currentFrequency), [match, params, customPump, currentFrequency]);

    // --- REAL AI INTEGRATION ---
    const { messages, loading: aiLoading, sendMessage, analyzePhase } = useEspCopilot(params, designResults, activeStep, customPump);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Sync active step with scope selector automatically
    useEffect(() => {
        setAiScope(activeStep);
    }, [activeStep]);

    const handleSendMessage = () => {
        if (!userInput.trim()) return;
        sendMessage(userInput);
        setUserInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSendMessage();
    };

    const handleRunAnalysis = (scenarioScope: 'min' | 'target' | 'max' | 'all' = 'target') => {
        const targetPhase = aiScope === 'current' ? activeStep : aiScope;
        analyzePhase(targetPhase, scenarioScope);
    };

    const handleExportAll = () => {
        if (!customPump) {
            alert("No pump selected.");
            return;
        }

        const designFreqs = [30, 40, 50, 60, 70];
        if (!designFreqs.includes(currentFrequency)) designFreqs.push(currentFrequency);
        designFreqs.sort((a, b) => a - b);

        const designVsdData = designFreqs.map(hz => {
            const cData = generateMultiCurveData(customPump, params, hz, 60);
            const m = findIntersection(cData);
            let flow = m ? m.flow : 0;
            let head = m ? m.head : 0;
            const res = calculateSystemResults(flow, head, params, customPump, hz);
            const shaftLimit = getShaftLimitHp(customPump?.series);
            const bhp = res.hpTotal || 0;
            const pumpShaftLoad = shaftLimit > 0 ? (bhp / shaftLimit) * 100 : 0;
            const intakeT = params.bottomholeTemp;
            const motorT = intakeT + (res.motorLoad || 0) * 0.8;

            return {
                Frequency_Hz: hz, RPM: hz * 60, Flow_BPD: flow, Head_ft: res.tdh?.toFixed(0),
                PIP_psi: res.pip?.toFixed(0), PDP_psi: res.pdp?.toFixed(0), Pwf_psi: res.pwf?.toFixed(0),
                Motor_Amps: res.electrical.amps?.toFixed(1), Motor_Volts: res.electrical.volts?.toFixed(0),
                Surf_Volts: res.electrical.surfaceVolts?.toFixed(0), Power_kVA: res.electrical.kva?.toFixed(1),
                Power_kW: res.electrical.kw?.toFixed(1), Pump_Eff_Pct: res.effEstimated?.toFixed(1),
                Motor_Eff_Pct: res.electrical.motorEff?.toFixed(1), Motor_Load_Pct: res.motorLoad?.toFixed(0),
                Pump_Shaft_Load_Pct: pumpShaftLoad.toFixed(0), Motor_Temp_F: motorT.toFixed(0)
            };
        });

        exportProjectToExcel(params, customPump, params.selectedMotor, designResults, designVsdData, []);
    };

    useEffect(() => { if (params.fluids.pb > 0) { const { updated, corrected, minGor } = enforcePVTConsistency(params); if (corrected) { setParams(updated); setToast({ show: true, msg: `PVT AI: GOR corrected to min ${minGor.toFixed(0)} scf/stb to match Bubble Point physics.`, type: 'info' }); } } }, [params.fluids.pb, params.fluids.apiOil, params.fluids.geGas, params.bottomholeTemp, params.fluids.gor]);
    useEffect(() => { if (toast.show) { const timer = setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000); return () => clearTimeout(timer); } }, [toast.show]);
    useEffect(() => { setParams(current => { if (current.activeScenario !== 'target') return current; const masterIP = current.inflow.ip; const masterWC = current.fluids.waterCut; const masterGOR = current.fluids.gor; const masterRate = current.pressures.totalRate; const t = current.targets; const isTargetSynced = t.target.ip === masterIP && t.target.waterCut === masterWC && t.target.gor === masterGOR && t.target.rate === masterRate; if (!isTargetSynced) { return { ...current, targets: { ...t, target: { ...t.target, ip: masterIP, waterCut: masterWC, gor: masterGOR, rate: masterRate } } }; } return current; }); }, [params.inflow.ip, params.fluids.waterCut, params.fluids.gor, params.pressures.totalRate, params.activeScenario]);

    const steps = [
        { id: 'wellbore', label: t('nav.wellbore'), sub: t('nav.wellbore.sub'), icon: Ruler },
        { id: 'fluid', label: t('nav.fluids'), sub: t('nav.fluids.sub'), icon: Droplets },
        { id: 'inflow', label: t('nav.inflow'), sub: t('nav.inflow.sub'), icon: Target },
        { id: 'scenarios', label: t('scen.title'), sub: t('scen.sub'), icon: Layers },
        { id: 'equipment', label: t('nav.equipment'), sub: t('nav.equipment.sub'), icon: Hexagon },
        { id: 'simulations', label: t('nav.simulations'), sub: t('nav.simulations.sub'), icon: Clock },
        { id: 'match', label: t('nav.match'), sub: t('nav.match.sub'), icon: ClipboardCheck },
    ];

    const handlePumpImport = (pump: EspPump | null, motorHp: number, fullPumpCatalog?: EspPump[], fullMotorCatalog?: EspMotor[]) => { if (fullPumpCatalog?.length) setPumpCatalog(fullPumpCatalog.filter(p => p && p.id)); if (fullMotorCatalog?.length) setMotorCatalog(fullMotorCatalog.filter(m => m && m.id)); if (pump) { setCustomPump(pump); setParams(p => ({ ...p, motorHp })); } setShowPumpModal(false); };
    const handleProjectImport = (data: { params: SystemParams, customPump: EspPump | null, frequency: number }) => {
        if (data.params) {
            const sanitizedParams = { ...INITIAL_PARAMS, ...data.params, metadata: data.params.metadata || INITIAL_PARAMS.metadata, simulation: data.params.simulation || INITIAL_PARAMS.simulation, targets: data.params.targets || INITIAL_PARAMS.targets };
            setParams(sanitizedParams);
            if (data.params.survey) setRawSurvey(data.params.survey.map(s => `${s.md}\t${s.tvd}`).join('\n'));
        }
        if (data.customPump) {
            setCustomPump(data.customPump);
            if (!pumpCatalog.some(p => p && p.id === data.customPump?.id)) setPumpCatalog(prev => [...prev, data.customPump!]);
        }
        if (data.frequency) {
            setParams(prev => ({ ...prev, targets: { ...prev.targets, target: { ...prev.targets.target, frequency: data.frequency } } }));
        }
        setShowPumpModal(false);
    };
    const handleLandingFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const handleData = (json: any) => {
            if (json.type === 'esp-studio-project' && json.data) {
                handleProjectImport(json.data);
                setAppMode('main');
            } else alert("Invalid Project File");
        };

        if (file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const json = JSON.parse(event.target?.result as string);
                    handleData(json);
                } catch (err) { alert("Error reading file"); }
            };
            reader.readAsText(file);
        } else if (file.name.endsWith('.xlsx')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target?.result as ArrayBuffer);
                    const workbook = read(data, { type: 'array' });
                    const sheet = workbook.Sheets['APP_DATA'];
                    if (sheet) {
                        const jsonData = xlsxUtils.sheet_to_json(sheet, { header: 1 }) as any[][];
                        const jsonStr = jsonData[1]?.[0] as string;
                        if (jsonStr) {
                            handleData(JSON.parse(jsonStr));
                            return;
                        }
                    }
                    alert("No valid project data found in Excel file");
                } catch (err) { alert("Error reading Excel file"); }
            };
            reader.readAsArrayBuffer(file);
        }
    };
    const toggleFullScreen = () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error(err)); else if (document.exitFullscreen) document.exitFullscreen().then(() => setIsFullscreen(false)).catch(err => console.error(err)); };
    const toggleLanguage = () => setLanguage(language === 'en' ? 'es' : 'en');

    if (appMode === 'comparator') return <DesignComparator initialDesign={initialDesignForComparator} onBack={() => { setInitialDesignForComparator(null); setAppMode('main'); }} />;
    if (appMode === 'landing') return <LandingPage onStart={() => setAppMode('main')} onCompare={() => setAppMode('comparator')} params={params} setParams={setParams} language={language} toggleLanguage={toggleLanguage} onImportFile={handleLandingFileImport} />;

    return (
        <div className="flex h-screen bg-canvas font-sans overflow-hidden text-txt-main selection:bg-primary/30 transition-colors duration-500 relative">
            {/* Vibrant Luminous Background */}
            <div className="aurora-bg">
                <div className="aurora-1 opacity-60"></div>
                <div className="aurora-2 opacity-40"></div>
                <div className="blueprint-grid absolute inset-0 opacity-10"></div>
                {/* Neon Accent Orbs */}
                <div className="absolute top-[-10%] left-[20%] w-[30vw] h-[30vw] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[20%] w-[30vw] h-[30vw] bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-canvas/20 pointer-events-none"></div>
            </div>

            {toast.show && (
                <div className="fixed top-20 right-8 z-[100] animate-fadeIn">
                    <div className="glass-morphism backdrop-blur-md border border-primary/50 shadow-[0_0_30px_rgba(var(--color-primary),0.3)] px-8 py-6 rounded-2xl flex items-start gap-4 max-w-md">
                        <div className="p-3 bg-primary/20 rounded-full text-primary shrink-0 mt-0.5"><AlertCircle className="w-6 h-6" /></div>
                        <div><h4 className="text-lg font-black text-txt-main uppercase tracking-wide mb-2">System Correction</h4><p className="text-sm font-medium text-txt-muted leading-relaxed">{toast.msg}</p></div>
                        <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="text-txt-muted hover:text-txt-main"><div className="w-2 h-2 rounded-full bg-slate-500"></div></button>
                    </div>
                </div>
            )}

            <PumpImportModal isOpen={showPumpModal} onClose={() => setShowPumpModal(false)} onSave={handlePumpImport} onImportProject={handleProjectImport} initialPump={customPump} initialMotorHp={params.motorHp} />

            {/* Sidebar with distinct surface depth */}
            <aside className="w-[300px] flex-none border-r border-surface-light/40 bg-canvas/40 backdrop-blur-3xl flex flex-col z-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                <div className="p-8 pb-6 bg-gradient-to-b from-surface/40 to-transparent shrink-0 relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary via-primary to-secondary rounded-2xl shadow-glow-primary border border-white/10 group/logo overflow-hidden flex items-center justify-center p-1">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain filter drop-shadow-md brightness-110" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-txt-main uppercase tracking-tighter leading-none">{t('app.title')}</h1>
                            <p className="text-[10px] text-primary font-black uppercase tracking-[0.3em] mt-1 opacity-80">{t('app.subtitle')}</p>
                        </div>
                    </div>
                    <div className="h-px w-full bg-gradient-to-r from-surface-light/50 to-transparent"></div>
                </div>

                <nav className="flex-1 overflow-y-auto p-5 space-y-3.5 custom-scrollbar relative z-10">
                    <div className="text-[10px] font-black text-txt-muted uppercase tracking-[0.3em] mb-4 flex justify-between items-center px-2">
                        <span>{t('app.workflow')}</span>
                        <span className="text-primary font-mono">{activeStep + 1} / {steps.length}</span>
                    </div>
                    {steps.map((step, idx) => {
                        const isActive = activeStep === idx;
                        const isCompleted = idx < activeStep;
                        return (
                            <button key={step.id} onClick={() => setActiveStep(idx)} className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all duration-500 group relative overflow-hidden light-sweep ${isActive ? 'bg-gradient-to-r from-primary/20 to-secondary/10 border border-primary/40 shadow-glow-primary scale-[1.02] z-10' : isCompleted ? 'bg-surface/40 border border-surface-light/30 hover:bg-surface/80 text-txt-muted grayscale' : 'hover:bg-surface/50 border border-transparent opacity-60 grayscale hover:grayscale-0'}`}>
                                {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-gradient-to-b from-primary to-secondary rounded-r-full shadow-[0_0_15px_rgb(var(--color-primary)/1)]"></div>}
                                <div className={`relative w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-500 ${isActive ? 'bg-primary text-white shadow-glow-primary' : isCompleted ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-light text-txt-muted group-hover:text-txt-main'}`}>
                                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <step.icon className="w-3.5 h-3.5" />}
                                </div>
                                <div className="text-left flex-1">
                                    <span className={`block font-black text-xs uppercase tracking-wider transition-all duration-300 ${isActive ? 'text-txt-main scale-[1.02] origin-left' : 'text-txt-muted group-hover:text-txt-main'}`}>{step.label}</span>
                                </div>
                                {isActive && <ChevronRight className="w-4 h-4 text-primary animate-pulse" />}
                            </button>
                        )
                    })}
                </nav>

                <div className={`flex-none ${isChatMinimized ? 'h-[64px]' : 'h-1/3 min-h-[350px]'} glass-surface flex flex-col overflow-hidden relative border-t border-surface-light/30 transition-all duration-500 ease-in-out shadow-glow-primary`}>
                    <div className="p-4 bg-gradient-to-b from-surface/40 to-transparent border-b border-surface-light/20 shadow-lg z-10 space-y-3 backdrop-blur-md shrink-0">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="p-2.5 bg-gradient-to-br from-primary via-primary to-secondary rounded-[10px] shadow-glow-primary ring-2 ring-white/5">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div onClick={() => setIsChatMinimized(!isChatMinimized)} className="cursor-pointer group flex flex-col gap-0.5">
                                    <h3 className="text-sm font-black text-txt-main uppercase tracking-widest flex items-center gap-2 group-hover:text-primary transition-colors">Gemini AI <span className="inline-block w-2 h-2 rounded-full bg-primary animate-ping"></span></h3>
                                    <p className="text-xs font-black text-primary tracking-widest opacity-80 uppercase leading-none">{t('ai.copilot')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isChatMinimized && <div className="hidden sm:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5 shadow-inner"><div className={`w-2 h-2 rounded-full ${aiLoading ? 'bg-primary' : 'bg-secondary'} animate-pulse`}></div><span className="text-xs font-black text-txt-muted uppercase tracking-widest">{aiLoading ? '...' : t('app.live')}</span></div>}
                                <button onClick={() => setIsChatMinimized(!isChatMinimized)} className="p-2 hover:bg-surface-light rounded-xl text-txt-muted hover:text-primary transition-all active:scale-95">{isChatMinimized ? <Maximize2 className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}</button>
                            </div>
                        </div>
                        {!isChatMinimized && (
                            <div className="relative group">
                                <select value={aiScope} onChange={(e) => setAiScope(e.target.value === 'current' ? 'current' : parseInt(e.target.value))} className="w-full bg-surface/50 text-sm font-black text-txt-main border border-surface-light rounded-xl py-3 pl-4 pr-10 outline-none focus:border-primary/50 appearance-none cursor-pointer hover:bg-surface-light transition-all uppercase tracking-widest">
                                    <option value="current">⚡ Current Phase</option>
                                    <hr />
                                    {steps.map((s, i) => <option key={s.id} value={i}>Phase {i + 1}: {s.label}</option>)}
                                </select>
                                <ChevronDown className="w-5 h-5 text-txt-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary transition-colors" />
                            </div>
                        )}
                    </div>

                    {!isChatMinimized && (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-canvas scroll-smooth text-sm">
                                {messages.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-40 space-y-2 py-8"><div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center border border-surface-light animate-pulse"><Sparkles className="w-6 h-6 text-primary/50" /></div><p className="text-[10px] font-black uppercase text-txt-muted tracking-widest">{t('ai.ready')}</p></div>}
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex flex-col gap-1.5 animate-fadeIn ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[95%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm border ${msg.role === 'user' ? 'bg-primary text-white border-primary/20 rounded-br-none' : 'bg-surface text-txt-main border-surface-light rounded-bl-none'}`}>
                                            <div className="markdown-content"><MarkdownRenderer content={msg.text} /></div>
                                        </div>
                                        <span className="text-[10px] font-black text-txt-muted px-3 uppercase opacity-60 tracking-widest">{msg.role === 'user' ? t('ai.user') : t('ai.ai')} • {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                ))}
                                <div ref={chatEndRef}></div>
                            </div>
                            <div className="p-3 bg-surface border-t border-surface-light mt-auto">
                                <div className="flex items-center gap-2 bg-canvas border border-surface-light rounded-xl px-3 py-1.5 focus-within:border-primary/50 transition-all shadow-inner">
                                    <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={handleKeyPress} placeholder={language === 'es' ? "Pregunte..." : "Ask..."} className="bg-transparent w-full text-xs font-bold text-txt-main outline-none placeholder:text-txt-muted/50" disabled={aiLoading} />
                                    <button onClick={handleSendMessage} disabled={!userInput.trim() || aiLoading} className="p-2 bg-primary hover:bg-primary/90 text-white rounded-lg disabled:opacity-50 transition-all active:scale-95"><Send className="w-3.5 h-3.5" /></button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden relative">
                <header className="relative h-14 bg-canvas/60 backdrop-blur-md border-b border-surface-light/30 px-6 flex items-center justify-between z-20">
                    <div className="flex items-center gap-4">
                        <span className="text-txt-muted font-mono text-[10px] font-black tracking-widest opacity-60">P0{activeStep + 1}</span>
                        <div className="h-4 w-px bg-surface-light/50"></div>
                        <h2 className="text-[11px] font-black text-txt-main uppercase tracking-[0.2em]">{steps[activeStep].label}</h2>
                    </div>

                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group pointer-events-none">
                        <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em] mb-0.5 opacity-60">{t('app.session')}</span>
                        <h1 className="relative text-[10px] font-black text-txt-main uppercase tracking-[0.2em] bg-surface/50 px-4 py-1.5 rounded-lg border border-surface-light/50 shadow-sm transition-all pointer-events-auto hover:border-primary/30">{params.metadata.projectName || t('app.untitled')}</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={toggleLanguage} className="bg-surface/50 hover:bg-surface-light border border-surface-light rounded-full w-10 h-10 flex items-center justify-center transition-all group relative cursor-pointer">
                            <Globe className="w-4 h-4 text-txt-muted group-hover:text-primary" />
                            <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black uppercase text-primary whitespace-nowrap bg-surface px-2 py-1 rounded border border-surface-light shadow-xl z-50">{language === 'en' ? 'EN' : 'ES'}</span>
                        </button>
                        <button onClick={cycleTheme} className="bg-surface/50 hover:bg-surface-light border border-surface-light rounded-full w-10 h-10 flex items-center justify-center transition-all group relative cursor-pointer">
                            <Palette className="w-4 h-4 text-txt-muted group-hover:text-primary" />
                            <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black uppercase text-primary whitespace-nowrap bg-surface px-2 py-1 rounded border border-surface-light shadow-xl z-50">{t('app.theme')}</span>
                        </button>
                        <button onClick={toggleFullScreen} className="bg-surface/50 hover:bg-surface-light border border-surface-light rounded-full w-10 h-10 flex items-center justify-center transition-all group relative cursor-pointer">
                            {isFullscreen ? <Minimize className="w-4 h-4 text-txt-muted group-hover:text-primary" /> : <Maximize className="w-4 h-4 text-txt-muted group-hover:text-primary" />}
                            <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black uppercase text-primary whitespace-nowrap bg-surface px-2 py-1 rounded border border-surface-light shadow-xl z-50">{t('header.fullscreen')}</span>
                        </button>
                        <div className="w-px h-6 bg-surface-light mx-1"></div>
                        <button onClick={() => setAppMode('landing')} className="bg-surface/50 hover:bg-surface-light border border-surface-light rounded-full w-10 h-10 flex items-center justify-center transition-all group relative cursor-pointer">
                            <RotateCcw className="w-4 h-4 text-txt-muted group-hover:text-primary" />
                            <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black uppercase text-primary whitespace-nowrap bg-surface px-2 py-1 rounded border border-surface-light shadow-xl z-50">{t('header.exit')}</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 relative">
                    <div className="max-w-[1920px] mx-auto animate-fadeIn relative z-10 min-h-full">
                        {activeStep === 0 && <Phase1 params={params} setParams={setParams} rawSurvey={rawSurvey} setRawSurvey={setRawSurvey} />}
                        {activeStep === 1 && <Phase2 params={params} setParams={setParams} />}
                        {activeStep === 2 && <Phase3 params={params} setParams={setParams} results={designResults} />}
                        {activeStep === 3 && <PhaseScenarios params={params} setParams={setParams} results={designResults} />}
                        {activeStep === 4 && <Phase5 
                            params={params} setParams={setParams} 
                            customPump={customPump} setCustomPump={setCustomPump} 
                            pumpCatalog={pumpCatalog} motorCatalog={motorCatalog} 
                            setShowPumpModal={setShowPumpModal} 
                            curveData={curveData} match={match} results={matchResults}
                            onCompare={(snapshot: any) => {
                                setInitialDesignForComparator(snapshot);
                                setAppMode('comparator');
                            }}
                        />}
                        {activeStep === 5 && <PhaseSimulations params={params} setParams={setParams} pump={customPump} frequency={currentFrequency} />}
                        {activeStep === 6 && <Phase6 params={params} setParams={setParams} pump={customPump} designFreq={currentFrequency} />}
                    </div>
                </main>

                <footer className="h-12 bg-surface border-t border-surface-light px-8 flex items-center justify-between z-20">
                    <button onClick={() => setActiveStep(Math.max(0, activeStep - 1))} disabled={activeStep === 0} className="text-xs font-black text-txt-muted hover:text-txt-main disabled:opacity-0 uppercase flex items-center gap-3 transition-all tracking-[0.2em]"><ChevronRight className="w-4 h-4 rotate-180" /> {t('footer.prev')}</button>
                    <div className="flex gap-4 items-center">
                        <div className="flex gap-2">{steps.map((_, idx) => <div key={idx} className={`h-1.5 rounded-full transition-all ${idx === activeStep ? 'bg-primary w-8' : 'bg-surface-light w-2.5'}`}></div>)}</div>
                        {activeStep >= 4 && <div className="ml-4 border-l-2 border-surface-light/50 pl-4 flex items-center gap-2">
                            <button onClick={() => setShowGlobalReportSelector(true)} className="flex items-center gap-3 text-[10px] font-black text-primary hover:text-white bg-primary/10 hover:bg-primary px-4 py-2 rounded-lg transition-all border border-primary/20 shadow-sm">
                                <Printer className="w-3.5 h-3.5" />
                                <span className="uppercase tracking-widest">{t('p5.designReport')}</span>
                            </button>
                            <button onClick={() => {
                                const snapshot = {
                                    id: `d${Date.now()}`,
                                    fileName: params.metadata.projectName || 'Current Design',
                                    params: params,
                                    pump: customPump,
                                    results: matchResults,
                                    frequency: currentFrequency
                                };
                                setInitialDesignForComparator(snapshot);
                                setAppMode('comparator');
                            }} className="flex items-center gap-3 text-[10px] font-black text-indigo-500 hover:text-white bg-indigo-500/10 hover:bg-indigo-500 px-4 py-2 rounded-lg transition-all border border-indigo-500/20 shadow-sm">
                                <GitCompareArrows className="w-3.5 h-3.5" />
                                <span className="uppercase tracking-widest">{language === 'es' ? 'COMPARAR' : 'COMPARE'}</span>
                            </button>
                            <button onClick={handleExportAll} className="flex items-center gap-3 text-[10px] font-black text-secondary hover:text-txt-main bg-secondary/10 hover:bg-secondary/20 px-4 py-2 rounded-lg transition-all border border-secondary/20 shadow-sm"><FileSpreadsheet className="w-3.5 h-3.5" /><span className="uppercase tracking-widest">{t('p5.report')}</span></button>
                            <button onClick={() => {
                                const payload = {
                                    type: 'esp-studio-project',
                                    version: '2.0',
                                    exportedAt: new Date().toISOString(),
                                    data: { params, customPump, frequency: currentFrequency }
                                };
                                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                const fname = getDownloadFilename(params, customPump, "Project");
                                a.download = `${fname}.json`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }} className="flex items-center gap-2 text-[10px] font-black text-txt-muted hover:text-txt-main bg-surface-light/50 hover:bg-surface-light px-4 py-2 rounded-lg transition-all border border-surface-light shadow-sm">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                <span className="uppercase tracking-widest">JSON</span>
                            </button>
                        </div>}
                    </div>
                    <button onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))} disabled={activeStep === steps.length - 1} className="bg-primary hover:bg-primary/80 text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase flex items-center gap-3 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 tracking-[0.2em]">{t('footer.next')} <ChevronRight className="w-3.5 h-3.5" /></button>
                </footer>
            </div>
            {showGlobalReportSelector && <ReportSelectorModal isOpen={showGlobalReportSelector} onClose={() => setShowGlobalReportSelector(false)} onSelect={(type: string) => { setShowGlobalReportSelector(false); setGlobalReportConfig({ isOpen: true, type }); }} />}
            {globalReportConfig.isOpen && <DesignReport onClose={() => setGlobalReportConfig({ isOpen: false, type: 'target' })} type={globalReportConfig.type} params={params} pump={customPump} results={designResults} frequency={currentFrequency} motor={params.selectedMotor} cable={params.selectedCable} />}
            <style>{`.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--color-surface-light), 0.8); border-radius: 3px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(var(--color-primary), 0.5); }`}</style>
        </div>
    );
};

export default App;
