/**
 * Game Performance Analyzer - Smarter FPS Engine
 * A realistic architecture simulating non-linear scaling, bottlenecks, and sensitive hardware scaling.
 */

// --- DATASETS ---

const games = {
    "Cyberpunk 2077": {
        referenceFPS: 100, // Tuned for 1080p High on RTX 3080 Ref
        referenceGPU: "RTX 3080",
        referenceCPU: "Intel i9-13900K",
        referenceResolution: "1080p",
        referencePreset: "High",
        gpuWeight: 0.85,
        cpuWeight: 0.15,
        vramRequirement: { "Low": 6, "Medium": 8, "High": 10, "Ultra": 12 },
        rtSupported: true
    },
    "Elden Ring": {
        referenceFPS: 75,
        referenceGPU: "RTX 3080",
        referenceCPU: "Intel i5-12400",
        referenceResolution: "1080p",
        referencePreset: "High",
        gpuWeight: 0.70,
        cpuWeight: 0.30,
        vramRequirement: { "Low": 4, "Medium": 6, "High": 8, "Ultra": 8 },
        rtSupported: true
    },
    "Counter-Strike 2": {
        referenceFPS: 310,
        referenceGPU: "RTX 3080",
        referenceCPU: "Intel i9-13900K",
        referenceResolution: "1080p",
        referencePreset: "High",
        gpuWeight: 0.40,
        cpuWeight: 0.60,
        vramRequirement: { "Low": 2, "Medium": 4, "High": 6, "Ultra": 8 },
        rtSupported: false
    },
    "Fortnite": {
        referenceFPS: 160,
        referenceGPU: "RTX 3080",
        referenceCPU: "Intel i5-12400",
        referenceResolution: "1080p",
        referencePreset: "Epic",
        gpuWeight: 0.75,
        cpuWeight: 0.25,
        vramRequirement: { "Low": 2, "Medium": 4, "High": 6, "Ultra": 8 },
        rtSupported: true
    },
    "Red Dead Redemption 2": {
        referenceFPS: 95,
        referenceGPU: "RTX 3080",
        referenceCPU: "Intel i9-13900K",
        referenceResolution: "1080p",
        referencePreset: "High",
        gpuWeight: 0.80,
        cpuWeight: 0.20,
        vramRequirement: { "Low": 4, "Medium": 6, "High": 8, "Ultra": 10 },
        rtSupported: false
    },
    "Hogwarts Legacy": {
        referenceFPS: 80,
        referenceGPU: "RTX 3080",
        referenceCPU: "Intel i5-12400",
        referenceResolution: "1080p",
        referencePreset: "Ultra",
        gpuWeight: 0.82,
        cpuWeight: 0.18,
        vramRequirement: { "Low": 6, "Medium": 8, "High": 10, "Ultra": 14 },
        rtSupported: true
    }
};

const gpus = {
    // NVIDIA
    "RTX 4090": { brand: 'nvidia', performanceScore: 1000, rtTier: 3, frameGenSupported: true, vram: 24 },
    "RTX 4080": { brand: 'nvidia', performanceScore: 780, rtTier: 3, frameGenSupported: true, vram: 16 },
    "RTX 3080": { brand: 'nvidia', performanceScore: 292, rtTier: 2, frameGenSupported: false, vram: 10 },
    "RTX 3060": { brand: 'nvidia', performanceScore: 123, rtTier: 2, frameGenSupported: false, vram: 12 },
    "GTX 1080 Ti": { brand: 'nvidia', performanceScore: 110, rtTier: 0, frameGenSupported: false, vram: 11 },
    "RTX 2060": { brand: 'nvidia', performanceScore: 95, rtTier: 1, frameGenSupported: false, vram: 6 },
    "GTX 1660": { brand: 'nvidia', performanceScore: 50, rtTier: 0, frameGenSupported: false, vram: 6 },
    // AMD
    "RX 7900 XTX": { brand: 'amd', performanceScore: 920, rtTier: 2, frameGenSupported: true, vram: 24 },
    "RX 7900 XT": { brand: 'amd', performanceScore: 750, rtTier: 2, frameGenSupported: true, vram: 20 },
    "RX 7800 XT": { brand: 'amd', performanceScore: 550, rtTier: 2, frameGenSupported: true, vram: 16 },
    "RX 7700 XT": { brand: 'amd', performanceScore: 350, rtTier: 1, frameGenSupported: true, vram: 12 },
    "RX 6800": { brand: 'amd', performanceScore: 300, rtTier: 1, frameGenSupported: false, vram: 16 },
    "RX 6700 XT": { brand: 'amd', performanceScore: 240, rtTier: 1, frameGenSupported: false, vram: 12 },
    "RX 6600": { brand: 'amd', performanceScore: 110, rtTier: 0, frameGenSupported: false, vram: 8 }
};


const cpus = {
    "Intel i9-13900K": { performanceScore: 100 },
    "Intel i7-12700K": { performanceScore: 85 },
    "Intel i5-12400": { performanceScore: 70 },
    "Ryzen 9 7950X": { performanceScore: 98 },
    "Ryzen 5 5600": { performanceScore: 65 }
};

const resolutions = {
    "1080p": { width: 1920, height: 1080 },
    "1440p": { width: 2560, height: 1440 },
    "4K": { width: 3840, height: 2160 }
};

const upscalingBoostMap = {
    "None": 1.0,
    "Quality": 1.25,
    "Balanced": 1.45,
    "Performance": 1.7
};

const rtPenaltyMap = {
    0: 0.10, // Not supported hardware
    1: 0.45, // Poor penalty
    2: 0.65, // Decent penalty
    3: 0.80  // Excellent peak
};

const presetDeltas = {
    "Low": 40,
    "Medium": 20,
    "High": 0,
    "Ultra": -20
};

// --- INITIALIZATION ---

const gpuSelect = document.getElementById('gpu');
const brandRadios = document.getElementsByName('gpuBrand');
const rtCheckbox = document.getElementById('raytracing');
const calcBtn = document.getElementById('calculateBtn');

function populateGpus(brand) {
    gpuSelect.innerHTML = '<option value="">-- Choose a Model --</option>';
    
    // Update button color
    if (brand === 'nvidia') {
        calcBtn.classList.add('btn-nvidia');
        calcBtn.classList.remove('btn-amd');
    } else {
        calcBtn.classList.add('btn-amd');
        calcBtn.classList.remove('btn-nvidia');
    }

    Object.keys(gpus).forEach(key => {
        if (gpus[key].brand === brand) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = key;
            gpuSelect.appendChild(option);
        }
    });
}

populateGpus('nvidia');

// --- EVENT LISTENERS ---

brandRadios.forEach(radio => {
    radio.addEventListener('change', (e) => populateGpus(e.target.value));
});

document.getElementById('calculateBtn').addEventListener('click', function() {
    const gameName = document.getElementById('game').value;
    const cpuName = document.getElementById('cpu').value;
    const gpuName = document.getElementById('gpu').value;
    const resolutionName = document.getElementById('resolution').value;
    const presetName = document.getElementById('preset').value;
    const ramSize = document.getElementById('ram').value;

    const options = {
        rayTracing: rtCheckbox.checked,
        upscalingMode: document.getElementById('upscaleMode').value,
        frameGen: document.getElementById('framegen').checked
    };

    if (!gameName || !cpuName || !gpuName || !ramSize) {
        alert('Please select all required options!');
        return;
    }

    const fps = calculateFPS(gameName, gpuName, cpuName, resolutionName, presetName, options, ramSize);
    
    updateResults(fps, {
        game: gameName,
        cpu: cpuName,
        gpu: gpuName,
        resolution: resolutionName,
        preset: presetName,
        rt: options.rayTracing ? 'ON' : 'OFF',
        upscale: options.upscalingMode,
        frameGen: options.frameGen ? 'ON' : 'OFF'
    });
});

/**
 * Advanced FPS Calculation Engine
 */
function calculateFPS(gameName, gpuName, cpuName, resolutionName, presetName, options, ramSize) {
    const game = games[gameName];
    const gpu = gpus[gpuName];
    const cpu = cpus[cpuName];
    const resolution = resolutions[resolutionName];
    const referenceResolution = resolutions[game.referenceResolution];
    const referenceGPU = gpus[game.referenceGPU];
    const referenceCPU = cpus[game.referenceCPU];

    // STEP 1: ANCHOR-BASED BASELINE (Logarithmic scaling)
    const gpuPowerRatio = gpu.performanceScore / referenceGPU.performanceScore;
    const cpuPowerRatio = cpu.performanceScore / referenceCPU.performanceScore;
    
    const gpuRelativePerf = Math.sqrt(gpuPowerRatio);
    const cpuRelativePerf = Math.sqrt(cpuPowerRatio);

    const baseFPS = game.referenceFPS * gpuRelativePerf;

    // STEP 2: GPU-BOUND vs CPU-BOUND SENSITIVITY
    const boundFPS = baseFPS * (game.gpuWeight * 1.0 + game.cpuWeight * cpuRelativePerf);

    // STEP 3: RESOLUTION SCALING
    const pixelRatio = (referenceResolution.width * referenceResolution.height) / (resolution.width * resolution.height);
    let currentFPS = boundFPS * pixelRatio;

    // STEP 4: PRESET SCALING
    currentFPS += presetDeltas[presetName];

    // STEP 5: RAY TRACING
    if (options.rayTracing) {
        currentFPS *= (game.rtSupported ? rtPenaltyMap[gpu.rtTier] : 0.1);
    }

    // STEP 6: UPSCALING & FRAME GENERATION
    currentFPS *= upscalingBoostMap[options.upscalingMode];
    if (options.frameGen && gpu.frameGenSupported) {
        currentFPS *= 1.6;
    }

    // STEP 7: VRAM BOTTLENECK
    if (game.vramRequirement[presetName] > gpu.vram) {
        currentFPS *= 0.6;
    }

    // RAM Bonus (legacy additive)
    const ramBonus = { '8': -5, '16': 0, '24': 3, '32': 5 };
    currentFPS += ramBonus[ramSize];

    // STEP 8: FINAL CLAMP
    currentFPS = Math.round(currentFPS);
    return Math.max(15, Math.min(240, currentFPS));
}

function updateResults(fps, details) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.classList.remove('hidden');
    
    document.getElementById('resHardware').innerText = `${details.gpu} @ ${details.resolution}`;
    document.getElementById('resFeatures').innerText = `RT: ${details.rt} | Upscale: ${details.upscale} | FG: ${details.frameGen}`;
    document.getElementById('resSettings').innerText = `Game: ${details.game} | Preset: ${details.preset} | CPU: ${details.cpu}`;

    document.getElementById('fpsValue').innerText = fps;
    const progress = document.getElementById('fpsProgress');
    progress.style.width = (Math.min(fps, 180) / 180 * 100) + '%';

    const perf = document.getElementById('perfLevel');
    const sugg = document.getElementById('suggestionText');
    if (fps < 30) { perf.innerText = 'Cinematic / Low'; perf.style.color = '#ff4d4d'; sugg.innerText = 'Turn down settings or enable aggressive upscaling.'; }
    else if (fps < 60) { perf.innerText = 'Playable / Medium'; perf.style.color = '#ffcc00'; sugg.innerText = 'Try lowering resolution or using Balanced upscaling.'; }
    else if (fps < 120) { perf.innerText = 'Smooth / High'; perf.style.color = '#4dff88'; sugg.innerText = 'Solid performance for standard refresh rates.'; }
    else { perf.innerText = 'Elite / Ultra'; perf.style.color = '#00d1ff'; sugg.innerText = 'Excellent performance for high-refresh monitors.'; }

    resultContainer.scrollIntoView({ behavior: 'smooth' });
}



