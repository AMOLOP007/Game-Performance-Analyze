/**
 * Game Performance Analyzer - Script
 * Handles logic for FPS estimation
 */

document.getElementById('calculateBtn').addEventListener('click', function() {
    // Get form values
    const game = document.getElementById('game').value;
    const cpu = document.getElementById('cpu').value;
    const gpu = document.getElementById('gpu').value;
    const ram = document.getElementById('ram').value;
    const preset = document.getElementById('preset').value;
    const upscaleEnabled = document.getElementById('upscale').checked;

    // Check if inputs are missing
    if (!game || !cpu || !gpu || !ram) {
        alert('Please select all options before calculating!');
        return;
    }

    // 1. Base FPS (Realistic 1080p Ultra Raw Base)
    const baseFPSData = {
        'gtav': 80,
        'rdr2': 50,
        'spiderman': 60,
        'minecraft': 70,
        'cyberpunk': 35,
        'codw': 75,
        'acv': 55,
        'forza5': 80,
        'eldenring': 60,
        'hogwarts': 45
    };

    // 2. GPU Performance Multipliers (Relative to GTX 1080 Ti as 1.0)
    const gpuFactors = {
        'gtx1080ti': 1.0,
        'rtx2060': 1.1,
        'rtx3060': 1.25,
        'rtx4060': 1.4,
        'rtx4070': 1.6,
        'rtx4080': 1.9,
        'rtx4090': 2.2,
        'rtx5090': 2.5,
        // AMD GPUs
        'rx6600': 1.1,
        'rx6700xt': 1.3,
        'rx6800': 1.5,
        'rx7600': 1.25,
        'rx7700xt': 1.6,
        'rx7800xt': 1.8,
        'rx7900xt': 2.0,
        'rx7900xtx': 2.2
    };

    // 3. CPU Performance Multipliers (Minor impact)
    const cpuFactors = {
        'i5-10400f': 0.85, 'i5-12400f': 1.0, 'i7-12700h': 1.1, 'i9-13900k': 1.15,
        'r5-5600x': 1.0, 'r7-5800h': 1.05, 'r7-6800h': 1.1, 'r7-7435hs': 1.1,
        'r9-5900x': 1.12, 'r9-7950x': 1.15
    };

    // 4. Graphics Preset Multipliers
    const presetMultipliers = {
        'low': 1.6,
        'medium': 1.3,
        'high': 1.1,
        'veryhigh': 1.0,
        'ultra': 0.85
    };

    // 5. RAM Bonuses
    const ramBonus = {
        '8': -5,
        '16': 0,
        '24': 3,
        '32': 5
    };

    // --- CALCULATION STEP 1: RAW PERFORMANCE ---
    let finalFPS = (baseFPSData[game] * gpuFactors[gpu] * cpuFactors[cpu] * presetMultipliers[preset]) + ramBonus[ram];
    
    // --- CALCULATION STEP 2: UPSCALING BOOST ---
    if (upscaleEnabled) {
        // Apply 45% boost (Upscaling + Frame Gen)
        finalFPS *= 1.45;
    }

    // Apply minor randomness (+/- 2 FPS)
    finalFPS += (Math.random() * 4) - 2;

    // --- CALCULATION STEP 3: LIMITING/CLAMPING ---
    finalFPS = Math.round(finalFPS);
    if (finalFPS < 20) finalFPS = 20;
    if (finalFPS > 180) finalFPS = 180;

    // Get display names
    const gameName = document.getElementById('game').options[document.getElementById('game').selectedIndex].text;
    const cpuName = document.getElementById('cpu').options[document.getElementById('cpu').selectedIndex].text;
    const gpuName = document.getElementById('gpu').options[document.getElementById('gpu').selectedIndex].text;
    const presetName = document.getElementById('preset').options[document.getElementById('preset').selectedIndex].text;
    const upscaleStatus = upscaleEnabled ? "Enabled (Boosted)" : "Disabled (Raw)";

    // Display Result
    showResult(finalFPS, gameName, cpuName, gpuName, presetName, upscaleStatus);
});

function showResult(fps, game, cpu, gpu, preset, upscale) {
    const resultContainer = document.getElementById('resultContainer');
    const fpsValue = document.getElementById('fpsValue');
    const perfLevel = document.getElementById('perfLevel');
    const suggestionText = document.getElementById('suggestionText');
    const fpsProgress = document.getElementById('fpsProgress');
    
    // Summary elements
    document.getElementById('resGame').innerText = game;
    document.getElementById('resHardware').innerText = `${cpu} | ${gpu}`;
    document.getElementById('resSettings').innerText = `Preset: ${preset}`;
    document.getElementById('resUpscale').innerText = upscale;

    // Unhide the result card
    resultContainer.classList.remove('hidden');

    // Update FPS value
    fpsValue.innerText = fps;

    // Update Progress Bar (Max 180 FPS for bar visual)
    let barWidth = (fps / 180) * 100;
    if (barWidth > 100) barWidth = 100;
    fpsProgress.style.width = barWidth + '%';

    // Determine Performance Level
    if (fps < 30) {
        perfLevel.innerText = 'Low (Cinematic/Laggy)';
        perfLevel.style.color = '#ff4d4d';
        suggestionText.innerText = 'Consider lowering your resolution or enabling Upscaling technology.';
    } else if (fps < 60) {
        perfLevel.innerText = 'Medium (Playable)';
        perfLevel.style.color = '#ffcc00';
        suggestionText.innerText = 'Good performance. For a smoother experience, try High instead of Ultra settings.';
    } else if (fps < 120) {
        perfLevel.innerText = 'High (Smooth)';
        perfLevel.style.color = '#4dff88';
        suggestionText.innerText = 'Excellent FPS! You are getting a very fluid gaming experience.';
    } else {
        perfLevel.innerText = 'Ultra (Elite)';
        perfLevel.style.color = '#00d1ff';
        suggestionText.innerText = 'Maximum fluidity! Your system is handling this game like a beast.';
    }

    // Smooth scroll to results
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}


