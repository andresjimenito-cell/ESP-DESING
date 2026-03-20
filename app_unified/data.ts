
import { PipeData, EspPump, EspMotor, EspCable, EspVSD } from './types';

// Roughness 0.00065 ft (standard commercial steel tubing)
const DEFAULT_ROUGHNESS = 0.00065;

export const TUBING_CATALOG: PipeData[] = [
    { description: '2-3/8" 4.60# J-55', od: 2.375, id: 1.995, weight: 4.60, roughness: DEFAULT_ROUGHNESS },
    { description: '2-3/8" 4.70# N-80', od: 2.375, id: 1.995, weight: 4.70, roughness: DEFAULT_ROUGHNESS },
    { description: '2-7/8" 6.40# J-55', od: 2.875, id: 2.441, weight: 6.40, roughness: DEFAULT_ROUGHNESS },
    { description: '2-7/8" 6.50# N-80', od: 2.875, id: 2.441, weight: 6.50, roughness: DEFAULT_ROUGHNESS },
    { description: '3-1/2" 9.20# J-55', od: 3.500, id: 2.992, weight: 9.20, roughness: DEFAULT_ROUGHNESS },
    { description: '3-1/2" 9.30# N-80', od: 3.500, id: 2.992, weight: 9.30, roughness: DEFAULT_ROUGHNESS },
    { description: '4-1/2" 12.60# J-55', od: 4.500, id: 3.958, weight: 12.60, roughness: DEFAULT_ROUGHNESS },
];

export const CASING_CATALOG: PipeData[] = [
    { description: '4-1/2" 11.60# J-55', od: 4.500, id: 4.000, weight: 11.60, roughness: DEFAULT_ROUGHNESS },
    { description: '5-1/2" 15.50# K-55', od: 5.500, id: 4.950, weight: 15.50, roughness: DEFAULT_ROUGHNESS },
    { description: '5-1/2" 17.00# N-80', od: 5.500, id: 4.892, weight: 17.00, roughness: DEFAULT_ROUGHNESS },
    { description: '7" 23.00# K-55', od: 7.000, id: 6.366, weight: 23.00, roughness: DEFAULT_ROUGHNESS },
    { description: '7" 26.00# N-80', od: 7.000, id: 6.276, weight: 26.00, roughness: DEFAULT_ROUGHNESS },
    { description: '9-5/8" 40.00# N-80', od: 9.625, id: 8.835, weight: 40.00, roughness: DEFAULT_ROUGHNESS },
    { description: '9-5/8" 53.50# N-80', od: 9.625, id: 8.535, weight: 53.50, roughness: DEFAULT_ROUGHNESS },
];

export const CABLE_CATALOG: EspCable[] = [
    { id: 'cbl-1-flat', manufacturer: 'Generic', type: 'Flat', awg: '#1', model: '#1 AWG Flat EPDM/Lead', ohmsPer1000ft: 0.134, maxAmps: 165, weightPer1000ft: 1800 },
    { id: 'cbl-1-round', manufacturer: 'Generic', type: 'Round', awg: '#1', model: '#1 AWG Round EPDM/Lead', ohmsPer1000ft: 0.134, maxAmps: 180, weightPer1000ft: 2100 },
    { id: 'cbl-2-flat', manufacturer: 'Generic', type: 'Flat', awg: '#2', model: '#2 AWG Flat EPDM/Lead', ohmsPer1000ft: 0.170, maxAmps: 140, weightPer1000ft: 1500 },
    { id: 'cbl-2-round', manufacturer: 'Generic', type: 'Round', awg: '#2', model: '#2 AWG Round EPDM/Lead', ohmsPer1000ft: 0.170, maxAmps: 155, weightPer1000ft: 1800 },
    { id: 'cbl-4-flat', manufacturer: 'Generic', type: 'Flat', awg: '#4', model: '#4 AWG Flat EPDM/Lead', ohmsPer1000ft: 0.273, maxAmps: 105, weightPer1000ft: 1100 },
    { id: 'cbl-4-round', manufacturer: 'Generic', type: 'Round', awg: '#4', model: '#4 AWG Round EPDM/Lead', ohmsPer1000ft: 0.273, maxAmps: 115, weightPer1000ft: 1300 },
    { id: 'cbl-6-flat', manufacturer: 'Generic', type: 'Flat', awg: '#6', model: '#6 AWG Flat EPDM/Lead', ohmsPer1000ft: 0.436, maxAmps: 85, weightPer1000ft: 800 },
];

// --- VSD (Variable Speed Drive) SURFACE CATALOG ---
export const VSD_CATALOG: EspVSD[] = [
    // --- SCHLUMBERGER / SLB (REDA PowerCENT) ---
    { id: 'slb-pc-150', manufacturer: 'SLB', brand: 'REDA PowerCENT', model: 'PC-150', kvaRating: 150, inputVoltage: '460 / 600 V', outputVoltage: '0–600 V', outputFrequency: '5–120 Hz', thd: '<3%', efficiency: 97.5, cooling: 'Forced Air', enclosure: 'NEMA 3R', weight_kg: 680, notes: 'Flare-rated, suitable for offshore' },
    { id: 'slb-pc-300', manufacturer: 'SLB', brand: 'REDA PowerCENT', model: 'PC-300', kvaRating: 300, inputVoltage: '460 / 600 V', outputVoltage: '0–600 V', outputFrequency: '5–120 Hz', thd: '<3%', efficiency: 97.8, cooling: 'Forced Air', enclosure: 'NEMA 3R', weight_kg: 950, notes: 'Medium duty, oil & gas rated' },
    { id: 'slb-pc-500', manufacturer: 'SLB', brand: 'REDA PowerCENT', model: 'PC-500', kvaRating: 500, inputVoltage: '480 / 600 V', outputVoltage: '0–600 V', outputFrequency: '5–120 Hz', thd: '<3%', efficiency: 98.0, cooling: 'Forced Air', enclosure: 'NEMA 4X', weight_kg: 1250, notes: 'Heavy duty, redundant fans' },
    { id: 'slb-pc-1000', manufacturer: 'SLB', brand: 'REDA PowerCENT', model: 'PC-1000', kvaRating: 1000, inputVoltage: '480 / 600 V', outputVoltage: '0–4160 V', outputFrequency: '5–120 Hz', thd: '<3%', efficiency: 98.2, cooling: 'Liquid Cooled', enclosure: 'NEMA 4X', weight_kg: 2800, notes: 'High power, step-up transformer incl.' },
    // --- ABB (ACS880 ESP Series) ---
    { id: 'abb-acs880-75', manufacturer: 'ABB', brand: 'ACS880-ESP', model: 'ACS880-ESP-075', kvaRating: 75, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '0–120 Hz', thd: '<3% (filtered)', efficiency: 97.2, cooling: 'Forced Air', enclosure: 'IP54', weight_kg: 320, notes: 'DTC control, sensorless vector' },
    { id: 'abb-acs880-200', manufacturer: 'ABB', brand: 'ACS880-ESP', model: 'ACS880-ESP-200', kvaRating: 200, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '0–120 Hz', thd: '<3% (filtered)', efficiency: 97.8, cooling: 'Forced Air', enclosure: 'IP54', weight_kg: 580, notes: 'Direct Torque Control, ESP optimized' },
    { id: 'abb-acs880-400', manufacturer: 'ABB', brand: 'ACS880-ESP', model: 'ACS880-ESP-400', kvaRating: 400, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '0–120 Hz', thd: '<3% (filtered)', efficiency: 98.1, cooling: 'Forced Air', enclosure: 'IP54', weight_kg: 1100, notes: 'Advanced pump diagnostics built-in' },
    { id: 'abb-acs880-800', manufacturer: 'ABB', brand: 'ACS880-ESP', model: 'ACS880-ESP-800', kvaRating: 800, inputVoltage: '400–690 V', outputVoltage: '0–690 V', outputFrequency: '0–120 Hz', thd: '<4%', efficiency: 98.3, cooling: 'Liquid Cooled', enclosure: 'IP54', weight_kg: 2200, notes: 'MV option available' },
    // --- BAKER HUGHES (Centrilift CENTRiStar) ---
    { id: 'bh-cs-100', manufacturer: 'Baker Hughes', brand: 'CENTRiStar', model: 'CS-100', kvaRating: 100, inputVoltage: '460 / 575 V', outputVoltage: '0–575 V', outputFrequency: '10–120 Hz', thd: '<5%', efficiency: 97.0, cooling: 'Forced Air', enclosure: 'NEMA 3R', weight_kg: 420, notes: 'Harmonic filter option available' },
    { id: 'bh-cs-250', manufacturer: 'Baker Hughes', brand: 'CENTRiStar', model: 'CS-250', kvaRating: 250, inputVoltage: '460 / 575 V', outputVoltage: '0–575 V', outputFrequency: '10–120 Hz', thd: '<5%', efficiency: 97.5, cooling: 'Forced Air', enclosure: 'NEMA 3R', weight_kg: 780, notes: 'Integrated output reactor standard' },
    { id: 'bh-cs-600', manufacturer: 'Baker Hughes', brand: 'CENTRiStar', model: 'CS-600', kvaRating: 600, inputVoltage: '460 / 575 V', outputVoltage: '0–575 V', outputFrequency: '10–120 Hz', thd: '<5%', efficiency: 97.9, cooling: 'Forced Air', enclosure: 'NEMA 3R', weight_kg: 1600, notes: 'Skid-mounted, weather proof' },
    // --- SIEMENS (SINAMICS G120XA) ---
    { id: 'sie-g120xa-90', manufacturer: 'Siemens', brand: 'SINAMICS G120XA', model: 'G120XA-090', kvaRating: 90, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '0–120 Hz', thd: '<4%', efficiency: 97.0, cooling: 'Forced Air', enclosure: 'IP66', weight_kg: 280, notes: 'IEC rated, global voltage range' },
    { id: 'sie-g120xa-250', manufacturer: 'Siemens', brand: 'SINAMICS G120XA', model: 'G120XA-250', kvaRating: 250, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '0–120 Hz', thd: '<4%', efficiency: 97.7, cooling: 'Forced Air', enclosure: 'IP66', weight_kg: 680, notes: 'Integrated EMC filter, Modbus RTU' },
    { id: 'sie-g120xa-500', manufacturer: 'Siemens', brand: 'SINAMICS G120XA', model: 'G120XA-500', kvaRating: 500, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '0–120 Hz', thd: '<4%', efficiency: 98.0, cooling: 'Forced Air', enclosure: 'IP54', weight_kg: 1350, notes: 'SafetyIntegrated SIL2' },
    // --- FRANKLIN ELECTRIC (SubDrive ULTRA) ---
    { id: 'fe-su-50', manufacturer: 'Franklin Electric', brand: 'SubDrive ULTRA', model: 'ULTRA-050', kvaRating: 50, inputVoltage: '208–480 V', outputVoltage: '0–480 V', outputFrequency: '30–90 Hz', thd: '<8%', efficiency: 96.5, cooling: 'Forced Air', enclosure: 'NEMA 4', weight_kg: 120, notes: 'Compact, single-phase input option' },
    { id: 'fe-su-150', manufacturer: 'Franklin Electric', brand: 'SubDrive ULTRA', model: 'ULTRA-150', kvaRating: 150, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '30–90 Hz', thd: '<6%', efficiency: 97.0, cooling: 'Forced Air', enclosure: 'NEMA 4', weight_kg: 360, notes: 'Municipal & agriculture' },
    // --- CLESUS (Colombia — Distribuidor especializado) ---
    { id: 'clesus-100', manufacturer: 'CLESUS', brand: 'CLESUS VSD', model: 'CL-VSD-100', kvaRating: 100, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '5–120 Hz', thd: '<5%', efficiency: 97.0, cooling: 'Forced Air', enclosure: 'NEMA 3R', weight_kg: 380, notes: 'Soporte local Colombia — Piedemonte & Llanos' },
    { id: 'clesus-200', manufacturer: 'CLESUS', brand: 'CLESUS VSD', model: 'CL-VSD-200', kvaRating: 200, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '5–120 Hz', thd: '<5%', efficiency: 97.3, cooling: 'Forced Air', enclosure: 'NEMA 3R', weight_kg: 620, notes: 'Certificado para Zona 2 ATEX' },
    { id: 'clesus-300', manufacturer: 'CLESUS', brand: 'CLESUS VSD', model: 'CL-VSD-300', kvaRating: 300, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '5–120 Hz', thd: '<5%', efficiency: 97.5, cooling: 'Forced Air', enclosure: 'NEMA 3R', weight_kg: 850, notes: 'Configuración estándar para Casanare' },
    { id: 'clesus-450', manufacturer: 'CLESUS', brand: 'CLESUS VSD', model: 'CL-VSD-450', kvaRating: 450, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '5–120 Hz', thd: '<5%', efficiency: 97.6, cooling: 'Forced Air', enclosure: 'NEMA 4X', weight_kg: 1050, notes: 'Alta potencia, skid personalizado' },

    // --- TRIOL (Rusia — Presencia en Colombia) ---
    { id: 'triol-at24-75', manufacturer: 'TRIOL', brand: 'TRIOL AT24', model: 'AT24-075', kvaRating: 75, inputVoltage: '380–480 V', outputVoltage: '0–600 V', outputFrequency: '1–120 Hz', thd: '<4%', efficiency: 96.8, cooling: 'Forced Air', enclosure: 'IP54', weight_kg: 290, notes: 'Control vectorial, autosintonía' },
    { id: 'triol-at24-150', manufacturer: 'TRIOL', brand: 'TRIOL AT24', model: 'AT24-150', kvaRating: 150, inputVoltage: '380–480 V', outputVoltage: '0–600 V', outputFrequency: '1–120 Hz', thd: '<4%', efficiency: 97.2, cooling: 'Forced Air', enclosure: 'IP54', weight_kg: 520, notes: 'Certificado Ex, diagnóstico ESP integrado' },
    { id: 'triol-at24-250', manufacturer: 'TRIOL', brand: 'TRIOL AT24', model: 'AT24-250', kvaRating: 250, inputVoltage: '380–480 V', outputVoltage: '0–600 V', outputFrequency: '1–120 Hz', thd: '<4%', efficiency: 97.5, cooling: 'Forced Air', enclosure: 'IP54', weight_kg: 780, notes: 'Versión robusta para yacimientos maduros' },
    { id: 'triol-at24-350', manufacturer: 'TRIOL', brand: 'TRIOL AT24', model: 'AT24-350', kvaRating: 350, inputVoltage: '380–480 V', outputVoltage: '0–600 V', outputFrequency: '1–120 Hz', thd: '<3%', efficiency: 97.8, cooling: 'Forced Air', enclosure: 'IP54', weight_kg: 940, notes: 'Protón vectorial, Modbus TCP/IP' },
    { id: 'triol-at24-600', manufacturer: 'TRIOL', brand: 'TRIOL AT24', model: 'AT24-600', kvaRating: 600, inputVoltage: '380–690 V', outputVoltage: '0–690 V', outputFrequency: '1–120 Hz', thd: '<3%', efficiency: 98.0, cooling: 'Liquid Cooled', enclosure: 'IP54', weight_kg: 1800, notes: 'Alta potencia, skid modular' },
    { id: 'triol-at27-400', manufacturer: 'TRIOL', brand: 'TRIOL AT27', model: 'AT27-400MV', kvaRating: 400, inputVoltage: '4160 V', outputVoltage: '0–4160 V', outputFrequency: '1–120 Hz', thd: '<3%', efficiency: 98.2, cooling: 'Forced Air', enclosure: 'NEMA 3R', weight_kg: 2200, notes: 'Medium Voltage Drive, multipulse input' },
    { id: 'triol-at27-800', manufacturer: 'TRIOL', brand: 'TRIOL AT27', model: 'AT27-800MV', kvaRating: 800, inputVoltage: '4160 V', outputVoltage: '0–4160 V', outputFrequency: '1–120 Hz', thd: '<3%', efficiency: 98.4, cooling: 'Forced Air', enclosure: 'NEMA 3R', weight_kg: 3500, notes: 'Alta eficiencia en media tensión' },

    // --- LS ELECTRIC (Premium series iS7 / iH) ---
    { id: 'ls-is7-125', manufacturer: 'LS ELECTRIC', brand: 'Starvert iS7', model: 'iS7-125', kvaRating: 125, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '0–400 Hz', thd: '<3%', efficiency: 97.5, cooling: 'Forced Air', enclosure: 'IP21/IP54', weight_kg: 85, notes: 'Premium Vector Drive, High Performance' },
    { id: 'ls-is7-250', manufacturer: 'LS ELECTRIC', brand: 'Starvert iS7', model: 'iS7-250', kvaRating: 250, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '0–400 Hz', thd: '<3%', efficiency: 97.8, cooling: 'Forced Air', enclosure: 'IP21/54', weight_kg: 145, notes: 'Dual-rated (CT/VT), built-in DC Reactor' },
    { id: 'ls-is7-500', manufacturer: 'LS ELECTRIC', brand: 'Starvert iS7', model: 'iS7-500', kvaRating: 500, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '0–400 Hz', thd: '<3%', efficiency: 98.1, cooling: 'Forced Air', enclosure: 'IP54', weight_kg: 320, notes: 'Sensorless & Vector Control ESP' },

    // --- LEX ENERGY / LEXPOWER (Distribuidos en Latam) ---
    { id: 'lex-ultra-200', manufacturer: 'LEX ENERGY', brand: 'LEX ULTRA', model: 'ULTRA-200', kvaRating: 200, inputVoltage: '480 V', outputVoltage: '0–480 V', outputFrequency: '5–120 Hz', thd: '<4%', efficiency: 97.2, cooling: 'Forced Air', enclosure: 'NEMA 3R', weight_kg: 450, notes: 'Diseño compacto para pozos de baja potencia' },
    { id: 'lex-ultra-400', manufacturer: 'LEX ENERGY', brand: 'LEX ULTRA', model: 'ULTRA-400', kvaRating: 400, inputVoltage: '480 V', outputVoltage: '0–480 V', outputFrequency: '5–120 Hz', thd: '<4%', efficiency: 97.5, cooling: 'Forced Air', enclosure: 'NEMA 3R', weight_kg: 820, notes: 'Optimizador de energía integrado' },
    { id: 'lex-ultra-750', manufacturer: 'LEX ENERGY', brand: 'LEX ULTRA', model: 'ULTRA-750', kvaRating: 750, inputVoltage: '480 V', outputVoltage: '0–480 V', outputFrequency: '5–120 Hz', thd: '<3%', efficiency: 97.9, cooling: 'Forced Air', enclosure: 'NEMA 4X', weight_kg: 1350, notes: 'Heavy duty, monitoreo remoto avanzado' },

    // --- INVERTEK (Optidrive P2 ESP - UK) ---
    { id: 'inv-p2-075', manufacturer: 'Invertek', brand: 'Optidrive P2', model: 'ODP-2-44075', kvaRating: 75, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '0–500 Hz', thd: '<5%', efficiency: 98.0, cooling: 'Forced Air', enclosure: 'IP66', weight_kg: 45, notes: 'ESP specific firmware, high switching frequency' },
    { id: 'inv-p2-150', manufacturer: 'Invertek', brand: 'Optidrive P2', model: 'ODP-2-54150', kvaRating: 150, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '0–500 Hz', thd: '<5%', efficiency: 98.2, cooling: 'Forced Air', enclosure: 'IP66', weight_kg: 85, notes: 'Outdoor rated, no extra cabinet needed' },
    { id: 'inv-p2-250', manufacturer: 'Invertek', brand: 'Optidrive P2', model: 'ODP-2-64250', kvaRating: 250, inputVoltage: '380–480 V', outputVoltage: '0–480 V', outputFrequency: '0–500 Hz', thd: '<5%', efficiency: 98.4, cooling: 'Forced Air', enclosure: 'IP66', weight_kg: 130, notes: 'PLC functions on-board' },

    // --- DANFOSS (VLT AutomationDrive FC 302 ESP) ---
    { id: 'dan-fc302-132', manufacturer: 'Danfoss', brand: 'VLT FC 302', model: 'FC-302-132KW', kvaRating: 165, inputVoltage: '380–500 V', outputVoltage: '0–500 V', outputFrequency: '0–590 Hz', thd: '<3%', efficiency: 98.0, cooling: 'Forced Air', enclosure: 'IP54', weight_kg: 125, notes: 'Sine-wave filter ready, low RFI' },
    { id: 'dan-fc302-315', manufacturer: 'Danfoss', brand: 'VLT FC 302', model: 'FC-302-315KW', kvaRating: 400, inputVoltage: '380–500 V', outputVoltage: '0–500 V', outputFrequency: '0–590 Hz', thd: '<3%', efficiency: 98.3, cooling: 'Forced Air', enclosure: 'IP54', weight_kg: 280, notes: 'Safe Torque Off (STO) SIL3' },
    { id: 'dan-fc302-630', manufacturer: 'Danfoss', brand: 'VLT FC 302', model: 'FC-302-630KW', kvaRating: 780, inputVoltage: '380–500 V', outputVoltage: '0–500 V', outputFrequency: '0–590 Hz', thd: '<3%', efficiency: 98.5, cooling: 'Liquid Cooled', enclosure: 'IP54', weight_kg: 620, notes: 'Extreme high power density' },
];

export const PUMP_DATABASE: EspPump[] = [];

// --- HELPER TO GENERATE GENERIC CURVE COEFFICIENTS (Simulated Data) ---
const genCurve = (maxHead: number, maxRate: number, hpFactor: number) => {
    return {
        h0: maxHead,
        h1: 0,
        h2: -maxHead / Math.pow(maxRate, 2),
        h3: 0, h4: 0, h5: 0, h6: 0,
        p0: hpFactor * 0.2,
        p1: (hpFactor * 0.8) / maxRate,
        p2: 0, p3: 0, p4: 0, p5: 0, p6: 0
    };
};

// --- HELPER TO GENERATE GENERIC MOTOR COEFFICIENTS ---
// Simulates typical Induction Motor curves relative to Load % (0-130)
const genMotorCoeffs = (baseHp: number) => {
    // RPM: 3600 sync, ~3450 at 100% load. Linear slip.
    // r = 3600 - 1.5*x
    const r = { r0: 3600, r1: -1.5, r2: 0, r3: 0, r4: 0, r5: 0 };

    // Amps %: ~30% magnetizing at 0 load, 100% at 100% load. Slightly non-linear.
    // a = 30 + 0.7*x + small quadratic? Linear is safe for simulation approx.
    const a = { a0: 30, a1: 0.7, a2: 0, a3: 0, a4: 0, a5: 0 };

    // PF: Low start, asymptotic to ~88 at 100%.
    // P = 90 * (1 - e^(-0.05*x))
    // Polynomial Approx of 1 - e^-x is 0 + x - x^2/2 ...
    // Using explicit points fit for 0-120 range:
    // 0:0, 20:50, 50:80, 100:88
    const p = { p0: 5, p1: 2.5, p2: -0.025, p3: 0.00008, p4: 0, p5: 0 }; // Rough shape

    // Eff: Rises fast, peaks at 70-80% load, stays flat-ish.
    // 0:0, 25:70, 50:85, 75:88, 100:87, 125:85
    const e = { e0: 0, e1: 3.5, e2: -0.045, e3: 0.00018, e4: 0, e5: 0 };

    return { ...r, ...a, ...p, ...e };
};

// --- STANDARD PUMP LIBRARY ---
export const STANDARD_PUMPS: EspPump[] = [
    // --- REDA (SLB) Style ---
    {
        id: 'reda-dn1100', manufacturer: 'REDA', series: '338', model: 'DN1100', stages: 1,
        minRate: 600, bepRate: 1100, maxRate: 1600, maxEfficiency: 68, maxHead: 0, maxGraphRate: 1800, nameplateFrequency: 60,
        ...genCurve(24, 1800, 0.25)
    },
    {
        id: 'reda-dn1750', manufacturer: 'REDA', series: '400', model: 'DN1750', stages: 1,
        minRate: 1200, bepRate: 1750, maxRate: 2300, maxEfficiency: 70, maxHead: 0, maxGraphRate: 2500, nameplateFrequency: 60,
        ...genCurve(32, 2600, 0.45)
    },
    {
        id: 'reda-gn4000', manufacturer: 'REDA', series: '538', model: 'GN4000', stages: 1,
        minRate: 2800, bepRate: 4000, maxRate: 5200, maxEfficiency: 74, maxHead: 0, maxGraphRate: 6000, nameplateFrequency: 60,
        ...genCurve(45, 6500, 1.2)
    },
    {
        id: 'reda-gn7000', manufacturer: 'REDA', series: '538', model: 'GN7000', stages: 1,
        minRate: 4500, bepRate: 7000, maxRate: 9000, maxEfficiency: 75, maxHead: 0, maxGraphRate: 10000, nameplateFrequency: 60,
        ...genCurve(55, 11000, 2.1)
    },
    {
        id: 'reda-j14000', manufacturer: 'REDA', series: '675', model: 'J14000', stages: 1,
        minRate: 9000, bepRate: 14000, maxRate: 18000, maxEfficiency: 78, maxHead: 0, maxGraphRate: 20000, nameplateFrequency: 60,
        ...genCurve(65, 22000, 4.5)
    },
    {
        id: 'slb-s4000n', manufacturer: 'SLB', series: '538', model: 'S4000N', stages: 1,
        minRate: 1000, bepRate: 4200, maxRate: 6000, maxEfficiency: 72.7, maxHead: 76.5, maxGraphRate: 7000, nameplateFrequency: 60,
        maxStages: 120,
        h0: 76.5, h1: 0, h2: -7.5e-7, h3: -3.5e-11, h4: 0, h5: 0, h6: 0,
        p0: 0.95, p1: 1.375e-4, p2: 0, p3: 0, p4: 0, p5: 0, p6: 0
    },

    // --- BAKER HUGHES Style ---
    // --- BAKER HUGHES (Centrilift) Catalog ---
    // Series 338 (OD 3.38")
    { id: 'bh-p6', manufacturer: 'Baker', series: '338', model: 'P6', stages: 1, minRate: 200, bepRate: 600, maxRate: 850, maxEfficiency: 61, maxHead: 0, maxGraphRate: 1000, nameplateFrequency: 60, ...genCurve(18, 1000, 0.12) },
    { id: 'bh-p10', manufacturer: 'Baker', series: '338', model: 'P10', stages: 1, minRate: 400, bepRate: 1000, maxRate: 1400, maxEfficiency: 66, maxHead: 0, maxGraphRate: 1600, nameplateFrequency: 60, ...genCurve(22, 1600, 0.2) },
    { id: 'bh-p15', manufacturer: 'Baker', series: '338', model: 'P15', stages: 1, minRate: 600, bepRate: 1500, maxRate: 2100, maxEfficiency: 67, maxHead: 0, maxGraphRate: 2500, nameplateFrequency: 60, ...genCurve(26, 2500, 0.35) },
    { id: 'bh-p22', manufacturer: 'Baker', series: '338', model: 'P22', stages: 1, minRate: 800, bepRate: 2200, maxRate: 3100, maxEfficiency: 68, maxHead: 0, maxGraphRate: 3500, nameplateFrequency: 60, ...genCurve(29, 3600, 0.55) },

    // Series 400 (OD 4.00")
    { id: 'bh-g12', manufacturer: 'Baker', series: '400', model: 'G12', stages: 1, minRate: 500, bepRate: 1200, maxRate: 1700, maxEfficiency: 67, maxHead: 0, maxGraphRate: 2000, nameplateFrequency: 60, ...genCurve(25, 2200, 0.28) },
    { id: 'bh-p17', manufacturer: 'Baker', series: '400', model: 'P17', stages: 1, minRate: 700, bepRate: 1700, maxRate: 2400, maxEfficiency: 69, maxHead: 0, maxGraphRate: 2800, nameplateFrequency: 60, ...genCurve(28, 3000, 0.42) },
    { id: 'bh-p22-400', manufacturer: 'Baker', series: '400', model: 'P22 (400)', stages: 1, minRate: 1000, bepRate: 2200, maxRate: 3200, maxEfficiency: 70, maxHead: 0, maxGraphRate: 3800, nameplateFrequency: 60, ...genCurve(32, 4000, 0.58) },
    { id: 'bh-p31', manufacturer: 'Baker', series: '400', model: 'P31', stages: 1, minRate: 1400, bepRate: 3100, maxRate: 4400, maxEfficiency: 72, maxHead: 0, maxGraphRate: 5200, nameplateFrequency: 60, ...genCurve(38, 5500, 0.95) },
    { id: 'bh-p39', manufacturer: 'Baker', series: '400', model: 'P39', stages: 1, minRate: 1800, bepRate: 3900, maxRate: 5500, maxEfficiency: 73, maxHead: 0, maxGraphRate: 6500, nameplateFrequency: 60, ...genCurve(42, 6800, 1.25) },
    { id: 'bh-p45', manufacturer: 'Baker', series: '400', model: 'P45', stages: 1, minRate: 2000, bepRate: 4500, maxRate: 6200, maxEfficiency: 73, maxHead: 0, maxGraphRate: 7500, nameplateFrequency: 60, ...genCurve(45, 7800, 1.65) },
    { id: 'bh-p60', manufacturer: 'Baker', series: '400', model: 'P60', stages: 1, minRate: 2800, bepRate: 6000, maxRate: 8400, maxEfficiency: 74, maxHead: 0, maxGraphRate: 10000, nameplateFrequency: 60, ...genCurve(52, 10500, 2.45) },

    // Series 538 (OD 5.38")
    { id: 'bh-g80', manufacturer: 'Baker', series: '538', model: 'G80', stages: 1, minRate: 3500, bepRate: 8000, maxRate: 11200, maxEfficiency: 75, maxHead: 0, maxGraphRate: 13000, nameplateFrequency: 60, ...genCurve(55, 13500, 3.2) },
    { id: 'bh-g110', manufacturer: 'Baker', series: '538', model: 'G110', stages: 1, minRate: 5000, bepRate: 11000, maxRate: 15500, maxEfficiency: 76, maxHead: 0, maxGraphRate: 18000, nameplateFrequency: 60, ...genCurve(62, 19000, 4.8) },

    // FLEXPump™ Line (Wide range)
    { id: 'bh-flex25', manufacturer: 'Baker', series: 'FLEX', model: 'FLEX25', stages: 1, minRate: 1400, bepRate: 2500, maxRate: 3500, maxEfficiency: 70, maxHead: 0, maxGraphRate: 4500, nameplateFrequency: 60, ...genCurve(38, 4800, 0.72) },
    {
        id: 'bh-flex27', manufacturer: 'Baker', series: 'FLEX', model: 'FLEX27', stages: 1,
        minRate: 750, bepRate: 2790, maxRate: 3300, maxEfficiency: 64.03, maxHead: 69.0, maxGraphRate: 4000, nameplateFrequency: 60,
        maxStages: 258,
        h0: 7.07056049e+01, h1: -5.16127787e-03, h2: 3.93110038e-06, h3: -2.20567256e-09, h4: 2.40501299e-13, h5: 0, h6: 0,
        p0: 8.53371702e-01, p1: 4.15109896e-04, p2: -4.79464147e-08, p3: 0, p4: 0, p5: 0, p6: 0
    },
    { id: 'bh-flex35', manufacturer: 'Baker', series: 'FLEX', model: 'FLEX35', stages: 1, minRate: 1750, bepRate: 3500, maxRate: 5000, maxEfficiency: 71, maxHead: 0, maxGraphRate: 6000, nameplateFrequency: 60, ...genCurve(45, 6500, 1.1) },
    {
        id: 'bh-flex47', manufacturer: 'Baker', series: '538', model: 'FLEX47', stages: 1,
        minRate: 1450, bepRate: 5000, maxRate: 6000, maxEfficiency: 71.22, maxHead: 0, maxGraphRate: 8200, nameplateFrequency: 60,
        h0: 6.85361359e+01, h1: 5.55158584e-03, h2: -5.11899291e-06, h3: 1.16290067e-09, h4: -9.55199375e-14, h5: -3.99098422e-18, h6: 5.54777552e-22,
        p0: 1.72341510e+00, p1: 9.05185250e-05, p2: 2.67379337e-08, p3: 1.03478504e-11, p4: -4.15490540e-15, p5: 3.88964395e-19, p6: -1.06901194e-23
    },
    { id: 'bh-flex60', manufacturer: 'Baker', series: 'FLEX', model: 'FLEX60', stages: 1, minRate: 2500, bepRate: 6000, maxRate: 7400, maxEfficiency: 72, maxHead: 0, maxGraphRate: 9000, nameplateFrequency: 60, ...genCurve(52, 9500, 2.2) },
    { id: 'bh-flex95', manufacturer: 'Baker', series: 'FLEX', model: 'FLEX95', stages: 1, minRate: 4800, bepRate: 9500, maxRate: 12000, maxEfficiency: 74, maxHead: 0, maxGraphRate: 15000, nameplateFrequency: 60, ...genCurve(58, 15500, 3.8) },
    {
        id: 'bh-flexer', manufacturer: 'Baker', series: 'FLEX', model: 'FLEXER', stages: 1,
        minRate: 50, bepRate: 1900, maxRate: 2800, maxEfficiency: 64.36, maxHead: 0, maxGraphRate: 3200, nameplateFrequency: 60,
        h0: 29.071, h1: -0.0039, h2: 2e-06, h3: -3e-09, h4: 9e-13, h5: -1e-16, h6: 6e-22,
        p0: 0.2816, p1: 2e-06, p2: 1e-07, p3: -1e-10, p4: 4e-14, p5: -9e-18, p6: 1e-21
    },

    // --- NOVOMET Style ---
    {
        id: 'novo-vn500', manufacturer: 'Novomet', series: '362', model: 'VN500', stages: 1,
        minRate: 300, bepRate: 500, maxRate: 800, maxEfficiency: 64, maxHead: 0, maxGraphRate: 1000, nameplateFrequency: 50,
        ...genCurve(18, 1100, 0.15)
    },
    {
        id: 'novo-vn1500', manufacturer: 'Novomet', series: '406', model: 'VN1500', stages: 1,
        minRate: 1000, bepRate: 1500, maxRate: 2200, maxEfficiency: 69, maxHead: 0, maxGraphRate: 2500, nameplateFrequency: 50,
        ...genCurve(28, 2800, 0.4)
    },
    {
        id: 'novo-vn5000', manufacturer: 'Novomet', series: '512', model: 'VN5000', stages: 1,
        minRate: 3500, bepRate: 5000, maxRate: 7000, maxEfficiency: 75, maxHead: 0, maxGraphRate: 8000, nameplateFrequency: 50,
        ...genCurve(50, 8500, 1.6)
    },

    // --- BORETS Style ---
    {
        id: 'borets-e2500', manufacturer: 'Borets', series: '400', model: 'E2500', stages: 1,
        minRate: 1800, bepRate: 2500, maxRate: 3200, maxEfficiency: 70, maxHead: 0, maxGraphRate: 3800, nameplateFrequency: 60,
        ...genCurve(38, 4000, 0.7)
    },
    {
        id: 'borets-e6000', manufacturer: 'Borets', series: '538', model: 'E6000', stages: 1,
        minRate: 4200, bepRate: 6000, maxRate: 7800, maxEfficiency: 74, maxHead: 0, maxGraphRate: 9000, nameplateFrequency: 60,
        ...genCurve(53, 9500, 1.9)
    },

    // --- ALKHORAYEF (ACP) Style ---
    {
        id: 'acp-p3000', manufacturer: 'ACP', series: '400', model: 'P3000', stages: 1,
        minRate: 2000, bepRate: 3000, maxRate: 4000, maxEfficiency: 71, maxHead: 0, maxGraphRate: 4500, nameplateFrequency: 60,
        ...genCurve(40, 4800, 0.9)
    },
];

// --- STANDARD MOTOR LIBRARY (IM - Induction Motors) ---
export const STANDARD_MOTORS: EspMotor[] = [
    // --- APC (Alkhorayef) 560 Series - Requested by User ---
    { id: 'apc-560-391-3033', manufacturer: 'APC', series: '560', model: 'XCeeD XT1-S 391HP', hp: 391, voltage: 3033, amps: 78.3, ...genMotorCoeffs(391) },
    { id: 'apc-560-391-2533', manufacturer: 'APC', series: '560', model: 'XCeeD XT1-S 391HP', hp: 391, voltage: 2533, amps: 92.6, ...genMotorCoeffs(391) },
    { id: 'apc-560-391-2027', manufacturer: 'APC', series: '560', model: 'XCeeD XT1-S 391HP', hp: 391, voltage: 2027, amps: 115.6, ...genMotorCoeffs(391) },
    { id: 'apc-560-391-1774', manufacturer: 'APC', series: '560', model: 'XCeeD XT1-S 391HP', hp: 391, voltage: 1774, amps: 132.8, ...genMotorCoeffs(391) },
    { id: 'apc-560-391-1454', manufacturer: 'APC', series: '560', model: 'XCeeD XT1-S 391HP', hp: 391, voltage: 1454, amps: 160.8, ...genMotorCoeffs(391) },
    { id: 'apc-560-390-4050', manufacturer: 'APC', series: '560', model: 'XCeeD XT1-T 390HP', hp: 390, voltage: 4050, amps: 57.8, ...genMotorCoeffs(390) },
    { id: 'apc-560-390-3685', manufacturer: 'APC', series: '560', model: 'XCeeD XT2-S 390HP', hp: 390, voltage: 3685, amps: 64.0, ...genMotorCoeffs(390) },
    { id: 'apc-560-390-3549', manufacturer: 'APC', series: '560', model: 'XCeeD XT1-T 390HP', hp: 390, voltage: 3549, amps: 66.9, ...genMotorCoeffs(390) },

    // --- REDA (Schlumberger) 456 Series ---
    { id: 'reda-456-60-780', manufacturer: 'REDA', series: '456', model: '456 Series 60HP', hp: 60, voltage: 780, amps: 52, ...genMotorCoeffs(60) },
    { id: 'reda-456-75-975', manufacturer: 'REDA', series: '456', model: '456 Series 75HP', hp: 75, voltage: 975, amps: 52, ...genMotorCoeffs(75) },
    { id: 'reda-456-100-1100', manufacturer: 'REDA', series: '456', model: '456 Series 100HP', hp: 100, voltage: 1100, amps: 58, ...genMotorCoeffs(100) },
    { id: 'reda-456-120-1320', manufacturer: 'REDA', series: '456', model: '456 Series 120HP', hp: 120, voltage: 1320, amps: 58, ...genMotorCoeffs(120) },
    { id: 'reda-456-150-1460', manufacturer: 'REDA', series: '456', model: '456 Series 150HP', hp: 150, voltage: 1460, amps: 65, ...genMotorCoeffs(150) },
    { id: 'reda-456-180-1750', manufacturer: 'REDA', series: '456', model: '456 Series 180HP', hp: 180, voltage: 1750, amps: 65, ...genMotorCoeffs(180) },
    { id: 'reda-456-200-2100', manufacturer: 'REDA', series: '456', model: '456 Series 200HP (Tandem)', hp: 200, voltage: 2100, amps: 60, ...genMotorCoeffs(200) },

    // --- BAKER HUGHES (Centrilift) Motors ---
    // Series 375 (Slim 3.75")
    { id: 'bh-375-30-460', manufacturer: 'Baker', series: '375', model: 'Centrilift 375 30HP', hp: 30, voltage: 460, amps: 42, ...genMotorCoeffs(30) },
    { id: 'bh-375-50-840', manufacturer: 'Baker', series: '375', model: 'Centrilift 375 50HP', hp: 50, voltage: 840, amps: 38, ...genMotorCoeffs(50) },
    { id: 'bh-375-75-1015', manufacturer: 'Baker', series: '375', model: 'Centrilift 375 75HP', hp: 75, voltage: 1015, amps: 46, ...genMotorCoeffs(75) },
    { id: 'bh-375-100-1100', manufacturer: 'Baker', series: '375', model: 'Centrilift 375 100HP', hp: 100, voltage: 1100, amps: 58, ...genMotorCoeffs(100) },

    // Series 450 (Standard 4.50")
    { id: 'baker-450-30-460', manufacturer: 'Baker', series: '450', model: 'Centrilift 450 30HP', hp: 30, voltage: 460, amps: 41, ...genMotorCoeffs(30) },
    { id: 'baker-450-40-460', manufacturer: 'Baker', series: '450', model: 'Centrilift 450 40HP', hp: 40, voltage: 460, amps: 54, ...genMotorCoeffs(40) },
    { id: 'baker-450-50-840', manufacturer: 'Baker', series: '450', model: 'Centrilift 450 50HP', hp: 50, voltage: 840, amps: 37, ...genMotorCoeffs(50) },
    { id: 'baker-450-60-840', manufacturer: 'Baker', series: '450', model: 'Centrilift 450 60HP', hp: 60, voltage: 840, amps: 45, ...genMotorCoeffs(60) },
    { id: 'baker-450-75-1015', manufacturer: 'Baker', series: '450', model: 'Centrilift 450 75HP', hp: 75, voltage: 1015, amps: 45, ...genMotorCoeffs(75) },
    { id: 'baker-450-100-1100', manufacturer: 'Baker', series: '450', model: 'Centrilift 450 100HP', hp: 100, voltage: 1100, amps: 56, ...genMotorCoeffs(100) },
    { id: 'baker-450-125-1360', manufacturer: 'Baker', series: '450', model: 'Centrilift 450 125HP', hp: 125, voltage: 1360, amps: 56, ...genMotorCoeffs(125) },
    { id: 'baker-450-150-1460', manufacturer: 'Baker', series: '450', model: 'Centrilift 450 150HP', hp: 150, voltage: 1460, amps: 72, ...genMotorCoeffs(150) },
    { id: 'baker-450-200-2100', manufacturer: 'Baker', series: '450', model: 'Centrilift 450 200HP', hp: 200, voltage: 2100, amps: 65, ...genMotorCoeffs(200) },


    // --- BAKER HUGHES (Centrilift) 562 Series ---
    { id: 'baker-562-150-1050', manufacturer: 'Baker', series: '562', model: 'Centrilift 562 150HP', hp: 150, voltage: 1050, amps: 88, ...genMotorCoeffs(150) },
    { id: 'baker-562-200-1400', manufacturer: 'Baker', series: '562', model: 'Centrilift 562 200HP', hp: 200, voltage: 1400, amps: 88, ...genMotorCoeffs(200) },
    { id: 'baker-562-250-1750', manufacturer: 'Baker', series: '562', model: 'Centrilift 562 250HP', hp: 250, voltage: 1750, amps: 88, ...genMotorCoeffs(250) },
    { id: 'baker-562-300-2100', manufacturer: 'Baker', series: '562', model: 'Centrilift 562 300HP', hp: 300, voltage: 2100, amps: 88, ...genMotorCoeffs(300) },
    { id: 'baker-562-400-2300', manufacturer: 'Baker', series: '562', model: 'Centrilift 562 400HP', hp: 400, voltage: 2300, amps: 105, ...genMotorCoeffs(400) },

    // --- NOVOMET 406 Series (Typical IM) ---
    { id: 'novo-406-40-700', manufacturer: 'Novomet', series: '406', model: 'Novomet 406 40HP', hp: 40, voltage: 700, amps: 36, ...genMotorCoeffs(40) },
    { id: 'novo-406-63-1000', manufacturer: 'Novomet', series: '406', model: 'Novomet 406 63HP', hp: 63, voltage: 1000, amps: 40, ...genMotorCoeffs(63) },
    { id: 'novo-406-80-1200', manufacturer: 'Novomet', series: '406', model: 'Novomet 406 80HP', hp: 80, voltage: 1200, amps: 42, ...genMotorCoeffs(80) },
    { id: 'novo-406-100-1500', manufacturer: 'Novomet', series: '406', model: 'Novomet 406 100HP', hp: 100, voltage: 1500, amps: 42, ...genMotorCoeffs(100) },
    // Novomet High Voltage / Hi-Temp
    { id: 'novo-512-120-2000', manufacturer: 'Novomet', series: '512', model: 'Novomet 512 120HP HV', hp: 120, voltage: 2000, amps: 41, ...genMotorCoeffs(120) },
    { id: 'novo-512-160-2300', manufacturer: 'Novomet', series: '512', model: 'Novomet 512 160HP HV', hp: 160, voltage: 2300, amps: 48, ...genMotorCoeffs(160) },

    // --- BORETS (Weatherford Legacy) ---
    { id: 'borets-456-60-850', manufacturer: 'Borets', series: '456', model: 'Borets 456 60HP', hp: 60, voltage: 850, amps: 45, ...genMotorCoeffs(60) },
    { id: 'borets-456-90-1100', manufacturer: 'Borets', series: '456', model: 'Borets 456 90HP', hp: 90, voltage: 1100, amps: 52, ...genMotorCoeffs(90) },
    { id: 'borets-540-150-1350', manufacturer: 'Borets', series: '540', model: 'Borets 540 150HP', hp: 150, voltage: 1350, amps: 70, ...genMotorCoeffs(150) },

    // --- ALKHORAYEF (ACP) / GENERIC IM ---
    { id: 'acp-456-50-650', manufacturer: 'ACP', series: '456', model: 'ACP 456 IM 50HP', hp: 50, voltage: 650, amps: 48, ...genMotorCoeffs(50) },
    { id: 'acp-456-75-950', manufacturer: 'ACP', series: '456', model: 'ACP 456 IM 75HP', hp: 75, voltage: 950, amps: 49, ...genMotorCoeffs(75) },
    { id: 'acp-456-125-1400', manufacturer: 'ACP', series: '456', model: 'ACP 456 IM 125HP', hp: 125, voltage: 1400, amps: 55, ...genMotorCoeffs(125) },
    { id: 'acp-540-180-1300', manufacturer: 'ACP', series: '540', model: 'ACP 540 IM 180HP', hp: 180, voltage: 1300, amps: 85, ...genMotorCoeffs(180) },
    { id: 'acp-540-250-1800', manufacturer: 'ACP', series: '540', model: 'ACP 540 IM 250HP', hp: 250, voltage: 1800, amps: 85, ...genMotorCoeffs(250) },

    // --- WOOD GROUP / GE (Legacy) ---
    { id: 'wg-450-60-800', manufacturer: 'WoodGroup', series: '450', model: 'WG 450 60HP', hp: 60, voltage: 800, amps: 47, ...genMotorCoeffs(60) },
    { id: 'wg-450-90-1150', manufacturer: 'WoodGroup', series: '450', model: 'WG 450 90HP', hp: 90, voltage: 1150, amps: 48, ...genMotorCoeffs(90) },
];
