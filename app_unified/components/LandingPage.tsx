import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
    Globe, Command, FileText, User, Briefcase, ChevronRight, UploadCloud,
    Activity, Zap, Power, Palette, Sun, Moon, Database, Sparkles, Cpu, GitCompareArrows
} from 'lucide-react';
import { SystemParams } from '../types';
import { useTheme } from '../theme';

interface LandingPageProps {
    onStart: () => void;
    onCompare: () => void;
    params: SystemParams;
    setParams: React.Dispatch<React.SetStateAction<SystemParams>>;
    language: string;
    toggleLanguage: () => void;
    onImportFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
    onStart,
    onCompare,
    params,
    setParams,
    language,
    toggleLanguage,
    onImportFile
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0, rawX: 0, rawY: 0 });
    const { theme, cycleTheme, toggleLightMode } = useTheme();

    // MEJORA: Partículas con mayor opacidad y brillo (Glow)
    const particles = useMemo(() => {
        return Array.from({ length: 35 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            delay: Math.random() * 5,
            duration: 8 + Math.random() * 12,
            size: 2 + Math.random() * 4, // Un poco más grandes
            opacity: 0.4 + Math.random() * 0.4 // Mucho más visibles (0.4 a 0.8)
        }));
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20,
                rawX: e.clientX,
                rawY: e.clientY
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="h-screen w-full bg-canvas relative flex items-center justify-center overflow-hidden font-sans text-txt-main selection:bg-primary/30 transition-colors duration-700">

            {/* --- BACKGROUND LAYER SYSTEM --- */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="ambient-light bg-primary/20 top-[-10%] left-[-10%] w-[70vw] h-[70vw]" style={{ animationDuration: '15s' }}></div>

                <div
                    className="absolute inset-[-5%] bg-cover bg-center opacity-10 mix-blend-luminosity grayscale transition-transform duration-700 ease-out"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1599940824399-b87987ced72a?q=80&w=2927&auto=format&fit=crop')`,
                        transform: `translate3d(${mousePos.x * -0.8}px, ${mousePos.y * -0.8}px, 0) scale(1.02)`
                    }}
                />

                {/* Cyber Grid Floor */}
                <div className="absolute bottom-[-10%] left-[-20%] right-[-20%] h-[40vh] bg-[linear-gradient(rgba(var(--color-primary),0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--color-primary),0.12)_1px,transparent_1px)] bg-[size:50px_50px] [transform:perspective(1000px)_rotateX(75deg)] opacity-40 animate-scan"></div>

                {/* Floating Particles - MEJORA: Se añadió drop-shadow para nitidez */}
                {particles.map(p => (
                    <div
                        key={p.id}
                        className="absolute bottom-[-10px] bg-primary rounded-full animate-float"
                        style={{
                            left: `${p.left}%`,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            opacity: p.opacity,
                            boxShadow: `0 0 8px rgba(var(--color-primary), 0.8)`,
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                        }}
                    />
                ))}
            </div>

            {/* --- HEADER --- */}
            <header className="absolute top-0 left-0 w-full p-8 z-50 flex justify-between items-center animate-fadeIn">
                <div className="flex items-center gap-4 group cursor-default">
                    <div className="w-14 h-14 glass-surface-light rounded-2xl flex items-center justify-center relative z-10 border border-white/10 group-hover:border-primary/50 transition-all duration-500 overflow-hidden shadow-2xl">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(var(--color-primary),0.5)] brightness-110" style={{ imageRendering: 'auto' }} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-3xl font-black tracking-tighter text-txt-main leading-none uppercase">
                            EDS<span className="text-primary">.IA</span>
                        </span>
                        <span className="text-[8px] font-bold text-txt-muted uppercase tracking-[0.4em] opacity-60 mt-1">VERSION VETA</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={toggleLightMode} className="w-10 h-10 flex items-center justify-center glass-surface-light border border-white/5 rounded-full hover:border-primary/30 transition-all">
                        {(theme === 'executive' || theme === 'heritage') ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </button>
                    <button onClick={cycleTheme} className="px-4 h-10 flex items-center gap-2 glass-surface-light border border-white/5 rounded-full hover:border-primary/30 transition-all">
                        <Palette className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{theme}</span>
                    </button>
                </div>
            </header>

            {/* --- MAIN CONTENT --- */}
            <main className="relative z-30 w-full max-w-[1500px] px-12 grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">

                {/* LEFT: CONTENT */}
                <div className="xl:col-span-7 space-y-8 animate-fadeInLeft">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="h-[1px] w-12 bg-primary/60"></div>
                            {/* MEJORA: Letra de subtítulo más pequeña y elegante */}
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.6em]">
                                {language === 'es' ? 'Ingeniería de Siguiente Generación' : 'Next-Gen Engineering'}
                            </span>
                        </div>
                        <h1 className="text-7xl md:text-8xl xl:text-[9rem] font-black text-txt-main leading-[0.85] tracking-tighter select-none">
                            ESP<br />
                            <span className="opacity-20">DESIGN</span><br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary/80">STUDIO</span>
                        </h1>
                    </div>

                    <p className="text-lg text-txt-muted max-w-lg font-medium leading-relaxed border-l border-primary/20 pl-6">
                        {language === 'es'
                            ? "Simulación avanzada de sistemas electrosumergibles. Optimización de precisión industrial impulsada por algoritmos de IA."
                            : "Advanced electric submersible pump simulation. Industrial-grade precision optimization powered by AI algorithms."}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                        {[{ icon: Zap, label: 'VFD Sim' }, { icon: Database, label: 'PVT Core' }, { icon: Cpu, label: 'AI Suite' }].map((item, i) => (
                            <div key={i} className="px-5 py-2.5 rounded-lg glass-surface-light border border-white/5 flex items-center gap-3">
                                <item.icon className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: FORM CARD */}
                <div className="xl:col-span-5 flex justify-center xl:justify-end animate-fadeInRight">
                    <div className="w-full max-w-[460px] relative group">
                        <div className="absolute -inset-1 bg-primary/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition duration-700"></div>

                        <div className="relative glass-surface border border-white/10 rounded-[32px] p-10 shadow-2xl backdrop-blur-2xl">
                            <div className="mb-10 flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-txt-main uppercase tracking-tight">
                                        {language === 'es' ? 'Acceso al Sistema' : 'System Access'}
                                    </h3>
                                    <p className="text-[9px] font-bold text-txt-muted uppercase tracking-widest opacity-40">Security Clearance Required</p>
                                </div>
                                <Command className="w-5 h-5 text-primary opacity-50" />
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-primary/80 uppercase tracking-widest ml-1">Project Identifier</label>
                                    <input
                                        type="text"
                                        value={params.metadata.projectName}
                                        onChange={e => setParams({ ...params, metadata: { ...params.metadata, projectName: e.target.value } })}
                                        className="w-full bg-white/5 border border-white/10 text-txt-main font-bold text-lg rounded-xl py-5 px-6 focus:border-primary/50 outline-none transition-all uppercase"
                                        placeholder="PRJ-2026-X"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-txt-muted uppercase tracking-widest ml-1">Engineer</label>
                                        <input
                                            type="text"
                                            value={params.metadata.engineer}
                                            onChange={e => setParams({ ...params, metadata: { ...params.metadata, engineer: e.target.value } })}
                                            className="w-full bg-white/5 border border-white/10 text-txt-main font-bold rounded-lg py-3 px-4 focus:border-primary/30 outline-none text-xs"
                                            placeholder="Lead"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-txt-muted uppercase tracking-widest ml-1">Corp</label>
                                        <input
                                            type="text"
                                            value={params.metadata.company}
                                            onChange={e => setParams({ ...params, metadata: { ...params.metadata, company: e.target.value } })}
                                            className="w-full bg-white/5 border border-white/10 text-txt-main font-bold rounded-lg py-3 px-4 focus:border-primary/30 outline-none text-xs"
                                            placeholder="Company"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 space-y-3">
                                <button
                                    onClick={onStart}
                                    className="group relative w-full h-16 overflow-hidden rounded-2xl bg-primary transition-all hover:shadow-[0_0_30px_rgba(var(--color-primary),0.3)] active:scale-[0.98]"
                                >
                                    <div className="relative z-10 flex items-center justify-center gap-3">
                                        <Power className="w-4 h-4 text-white" />
                                        <span className="font-black uppercase tracking-[0.3em] text-white text-sm">
                                            {language === 'es' ? 'Inicializar' : 'Initialize'}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-3 rounded-lg border border-white/5 bg-white/5 text-[9px] font-black text-txt-muted hover:text-primary transition-all uppercase tracking-widest">
                                        <UploadCloud className="w-3.5 h-3.5" /> Import
                                    </button>
                                    <button onClick={onCompare} className="flex items-center justify-center gap-2 py-3 rounded-lg border border-white/5 bg-white/5 text-[9px] font-black text-txt-muted hover:text-secondary transition-all uppercase tracking-widest">
                                        <GitCompareArrows className="w-3.5 h-3.5" /> Compare
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Hidden Input for File Import */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={onImportFile}
                accept=".json,.xlsx"
                className="hidden"
            />

            {/* --- FOOTER --- */}
            <footer className="absolute bottom-8 left-8 z-40 flex items-center gap-6 opacity-40 hover:opacity-80 transition-opacity">
                <div className="h-[1px] w-8 bg-primary/40"></div>
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-primary uppercase tracking-[0.4em]">Status: AJM</span>
                    <span className="text-[7px] font-bold text-txt-muted uppercase tracking-widest mt-1">EDS STUDIO © 2026</span>
                </div>
            </footer>

            <style>{`
                .ambient-light {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(120px);
                    animation: pulse-light 12s infinite alternate ease-in-out;
                }
                @keyframes pulse-light {
                    0% { transform: scale(1); opacity: 0.1; }
                    100% { transform: scale(1.1); opacity: 0.3; }
                }
                @keyframes scan {
                    from { background-position: 0 0; }
                    to { background-position: 0 100px; }
                }
                .animate-scan { animation: scan 8s linear infinite; }
                @keyframes float {
                    0% { transform: translateY(5vh); opacity: 0; }
                    20% { opacity: var(--tw-opacity); }
                    80% { opacity: var(--tw-opacity); }
                    100% { transform: translateY(-110vh); opacity: 0; }
                }
                .animate-float { animation: float linear infinite; }
                .glass-surface { background: rgba(var(--color-surface-rgb), 0.6); backdrop-filter: blur(40px); }
                .glass-surface-light { background: rgba(var(--color-surface-rgb), 0.3); backdrop-filter: blur(12px); }
            `}</style>
        </div>
    );
};