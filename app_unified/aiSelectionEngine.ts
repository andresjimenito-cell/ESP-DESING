
import { EspPump, EspMotor, EspCable, SystemParams } from './types';

// MOST USED EQUIPMENT LISTS - Provided by User
export const MOST_USED_PUMPS = [
    "NP(7900-10100)H", "NHV(790-1000)H", "WE1500", "NP(4400-5700)H",
    "NP(3100-4400)H", "NH(2500-3100)", "NP(4700-6300)H", "WG4000FULLARCMP",
    "NPV(1900-2500)H1", "WE7000", "NH(4400-5000)H", "DN1800", "NH(4400-5000)H RE",
    "NH(2500-3100)H", "NP(11300-15100)H", "PMSXDH6TIPO:E1000", "NP(4700-6300)HRE"
];

export const MOST_USED_MOTORS = [
    "N406PM380", "N460PM64", "N512PM235", "N460PM343", "N460PM330", "N512PM480",
    "N460PM115", "N460PM129", "N512PM375", "N460PM324", "N460PM540", "N460PM170",
    "N512PM175", "N460PM200", "N512PM320", "N512PM105", "N406PM310", "N512PM345",
    "N512PM310", "N512PM620", "N406PM282", "N512PM355", "N460PM255", "N512PM220",
    "N460PM240", "N460PM360", "N460PM430", "N406PM380", "N460PM320"
];

export const MOST_USED_CABLES = [
    "05kV, 2 AWG", "450F 5KV AWG#4", "450F 5KV AWG#2", "AWG 2 SOL", "AWG#6",
    "KERITE", "HUATONG", "WANDA", "SB POWER", "REDA LEAD"
];

/**
 * AI Selection Engine
 * Refined logic to prioritize "Most Used" equipment and ensure technical viability.
 */
export const runAISelection = (
    catalog: EspPump[],
    motors: EspMotor[],
    cables: EspCable[],
    params: SystemParams,
    calculateSystemResults: Function,
    calculateTDH: Function
) => {
    // 1. EXTRACT SCENARIO DATA
    const targetFlow = params.targets.target.rate || 1000;
    const minFlow = params.targets.min.rate || (targetFlow * 0.7);
    const maxFlow = params.targets.max.rate || (targetFlow * 1.3);

    // Frequencies (typically same for all scenarios initially, or specific to each)
    const targetFreq = params.targets.target.frequency || 60;
    const minFreq = params.targets.min.frequency || 60;
    const maxFreq = params.targets.max.frequency || 60;

    // Calculate Required Head for the main target scenario
    const targetTdh = calculateTDH(targetFlow, params);

    // 2. INTELLIGENT FILTERING
    // A pump is viable only if it can handle the TARGET flow efficiently, 
    // and ideally covers MIN/MAX within its operating limits.

    const recommendations = catalog.map(p => {
        const baseFreq = p.nameplateFrequency || 60;

        // Viability check at Target (Primary)
        // Range expands/contracts with frequency
        const targetMinLimit = p.minRate * (targetFreq / baseFreq);
        const targetMaxLimit = p.maxRate * (targetFreq / baseFreq);
        const isTargetViable = targetFlow >= (targetMinLimit * 0.9) && targetFlow <= (targetMaxLimit * 1.1);

        // Viability check at Min/Max (Secondary)
        const minMinLimit = p.minRate * (minFreq / baseFreq);
        const maxMaxLimit = p.maxRate * (maxFreq / baseFreq);
        // Does the pump series/curves physically allow these rates?
        const coversFullRange = minFlow >= (minMinLimit * 0.85) && maxFlow <= (maxMaxLimit * 1.15);

        if (!isTargetViable) return null;

        // Calculate score for ranking
        let score = 0;

        // Priority 1: User's Most Used list
        const isMostUsed = MOST_USED_PUMPS.some(mu => p.model.toUpperCase().includes(mu.toUpperCase()));
        if (isMostUsed) score += 100;

        // Priority 2: Full range coverage (MIN/OBJ/MAX)
        if (coversFullRange) score += 60;

        // Priority 3: Proximity to BEP at Target flow
        const targetBep = p.bepRate * (targetFreq / baseFreq);
        const bepOffset = Math.abs(targetFlow - targetBep) / targetBep;
        score += (1 - bepOffset) * 40; // Max 40 points for perfect BEP match

        // Calculate stages needed for this pump at the target condition
        const headPerStage = p.h0 * (targetFreq / baseFreq) ** 2 * 0.75;
        const stages = Math.max(10, Math.ceil(targetTdh / headPerStage));

        // Find best motor and cable for THIS configuration
        const tempPump = { ...p, stages };
        const systemResults = calculateSystemResults(targetFlow, targetTdh, params, tempPump, targetFreq);
        const reqHp = (systemResults.hpTotal || 10) * 1.15;

        const viableMotors = motors.filter(m => m.hp >= reqHp).sort((a, b) => a.hp - b.hp);
        let motor = viableMotors.find(m => MOST_USED_MOTORS.some(mu => m.model.toUpperCase().includes(mu.toUpperCase())));
        if (!motor) motor = viableMotors[0];

        const motorAmps = motor?.amps || 50;
        const reqAmps = motorAmps * 1.25;
        const viableCables = cables.filter(c => c.maxAmps >= reqAmps);
        let cable = viableCables.find(c => MOST_USED_CABLES.some(mu => c.model.toUpperCase().includes(mu.toUpperCase())));
        if (!cable) cable = viableCables.sort((a, b) => a.maxAmps - b.maxAmps)[0];

        return {
            pump: p,
            stages,
            motor,
            cable,
            score,
            isMostUsed,
            coversFullRange,
            bhp: systemResults.hpTotal
        };
    })
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    return recommendations;
};
