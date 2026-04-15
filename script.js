/**
 * Game Performance Analyzer - Script
 * Advanced Deterministic Engine v5.0 (Full Dataset)
 */

// --- DATASETS ---

const GPUS = {
    nvidia: [
        { id: 'gtx1080ti', name: 'GTX 1080 Ti', perfScore: 0.95, rtTier: 0, vram: 11, fg: false },
        { id: 'rtx2060', name: 'RTX 2060', perfScore: 0.85, rtTier: 1, vram: 6, fg: false },
        { id: 'rtx2070', name: 'RTX 2070', perfScore: 1.0, rtTier: 1, vram: 8, fg: false },
        { id: 'rtx2080', name: 'RTX 2080', perfScore: 1.25, rtTier: 1, vram: 8, fg: false },
        { id: 'rtx3050', name: 'RTX 3050', perfScore: 0.7, rtTier: 2, vram: 8, fg: false },
        { id: 'rtx3060', name: 'RTX 3060', perfScore: 1.0, rtTier: 2, vram: 12, fg: false },
        { id: 'rtx3070', name: 'RTX 3070', perfScore: 1.4, rtTier: 2, vram: 8, fg: false },
        { id: 'rtx3080', name: 'RTX 3080', perfScore: 1.9, rtTier: 2, vram: 10, fg: false },
        { id: 'rtx4050', name: 'RTX 4050', perfScore: 1.1, rtTier: 3, vram: 6, fg: true },
        { id: 'rtx4060', name: 'RTX 4060', perfScore: 1.3, rtTier: 3, vram: 8, fg: true },
        { id: 'rtx4070', name: 'RTX 4070', perfScore: 1.8, rtTier: 3, vram: 12, fg: true },
        { id: 'rtx4080', name: 'RTX 4080', perfScore: 2.8, rtTier: 3, vram: 16, fg: true },
        { id: 'rtx4090', name: 'RTX 4090', perfScore: 4.0, rtTier: 3, vram: 24, fg: true },
        { id: 'rtx5090', name: 'RTX 5090', perfScore: 5.8, rtTier: 4, vram: 32, fg: true }
    ],
    amd: [
        { id: 'rx6600', name: 'RX 6600', perfScore: 0.9, rtTier: 1, vram: 8, fg: false },
        { id: 'rx6700xt', name: 'RX 6700 XT', perfScore: 1.2, rtTier: 1, vram: 12, fg: false },
        { id: 'rx6800', name: 'RX 6800', perfScore: 1.6, rtTier: 1, vram: 16, fg: false },
        { id: 'rx7600', name: 'RX 7600', perfScore: 1.1, rtTier: 2, vram: 8, fg: false },
        { id: 'rx7700xt', name: 'RX 7700 XT', perfScore: 1.7, rtTier: 2, vram: 12, fg: false },
        { id: 'rx7800xt', name: 'RX 7800 XT', perfScore: 2.3, rtTier: 2, vram: 16, fg: false },
        { id: 'rx7900xt', name: 'RX 7900 XT', perfScore: 3.2, rtTier: 2, vram: 20, fg: false },
        { id: 'rx7900xtx', name: 'RX 7900 XTX', perfScore: 4.0, rtTier: 2, vram: 24, fg: false }
    ]
};

const GAMES = {
    'gtav': { refFPS: 95, gpuW: 0.8, cpuW: 0.2, vramReq: 4, rtSup: false },
    'rdr2': { refFPS: 55, gpuW: 0.85, cpuW: 0.15, vramReq: 6, rtSup: false },
    'cyberpunk': { refFPS: 38, gpuW: 0.9, cpuW: 0.1, vramReq: 10, rtSup: true },
    'spiderman': { refFPS: 75, gpuW: 0.75, cpuW: 0.25, vramReq: 8, rtSup: true },
    'minecraft': { refFPS: 80, gpuW: 0.7, cpuW: 0.3, vramReq: 4, rtSup: true },
    'codw': { refFPS: 70, gpuW: 0.75, cpuW: 0.25, vramReq: 8, rtSup: false },
    'acv': { refFPS: 60, gpuW: 0.85, cpuW: 0.15, vramReq: 8, rtSup: false },
    'forza5': { refFPS: 85, gpuW: 0.8, cpuW: 0.2, vramReq: 8, rtSup: true },
    'eldenring': { refFPS: 50, gpuW: 0.8, cpuW: 0.2, vramReq: 6, rtSup: true },
    'hogwarts': { refFPS: 45, gpuW: 0.85, cpuW: 0.15, vramReq: 12, rtSup: true }
};

const CPUS = {
    'i5-10400f': 0.8, 'i5-12400f': 1.0, 'i7-12700h': 1.1, 'i9-13900k': 1.3,
    'r5-5600x': 1.0, 'r7-5800h': 1.05, 'r7-6800h': 1.1, 'r7-7435hs': 1.1,
    'r9-5900x': 1.15, 'r9-7950x': 1.3
};

// --- INITIALIZATION ---

const gpuSelect = document.getElementById('gpu');
const brandRadios = document.getElementsByName('gpuBrand');
const rtCheckbox = document.getElementById('raytracing');
const presetGroup = document.getElementById('presetGroup');
const calcBtn = document.getElementById('calculateBtn');

function populateGpus(brand) {
    const list = GPUS[brand];
    gpuSelect.innerHTML = '<option value="">-- Choose a Model --</option>';
    
    if (brand === 'nvidia') {
        calcBtn.classList.add('btn-nvidia');
        calcBtn.classList.remove('btn-amd');
    } else {
        calcBtn.classList.add('btn-amd');
        calcBtn.classList.remove('btn-nvidia');
    }

    list.forEach(gpu => {
        const option = document.createElement('option');
        option.value = gpu.id;
        option.textContent = gpu.name;
        // Data mapping
        option.dataset.perf = gpu.perfScore;
        option.dataset.rt = gpu.rtTier;
        option.dataset.vram = gpu.vram;
        option.dataset.fg = gpu.fg;
        gpuSelect.appendChild(option);
    });
}

populateGpus('nvidia');

// --- HANDLERS ---

brandRadios.forEach(radio => {
    radio.addEventListener('change', (e) => populateGpus(e.target.value));
});

rtCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
        presetGroup.classList.remove('hidden');
    } else {
        presetGroup.classList.add('hidden');
    }
});

/**
 * ADVANCED FPS CALCULATION ENGINE v5.0
 */
function calculateFPS(gameKey, gpuData, cpuScore, resolution, preset, options) {
    const game = GAMES[gameKey];
    const { perfScore, rtTier, vram, fgSupported } = gpuData;

    // 1. Anchor-based Baseline with Weighting
    // We use sqrt on GPU scaling for diminishing returns
    const gpuContribution = Math.sqrt(perfScore) * game.gpuW;
    const cpuContribution = cpuScore * game.cpuW;
    let fps = game.refFPS * (gpuContribution + cpuContribution);

    // 2. Resolution Scaling
    const resFactors = { '720p': 1.5, '1080p': 1.0, '1440p': 0.65 };
    fps *= resFactors[resolution] || 1.0;

    // 3. Preset Adjustment
    const presetFactors = { 'low': 1.4, 'medium': 1.2, 'high': 1.05, 'veryhigh': 1.0, 'ultra': 0.9 };
    fps *= presetFactors[preset] || 1.0;

    // 4. Ray Tracing (Tier-based Penalty)
    if (options.rtEnabled && game.rtSup) {
        // Higher RT Tier GPUs take less penalty
        const rtPenalty = 0.5 + (rtTier * 0.05); // Tier 0 = 0.5, Tier 1 = 0.55, Tier 2 = 0.6, etc.
        fps *= rtPenalty;
    }

    // 5. Upscaling Boost
    const upscaleFactors = { 'none': 1.0, 'quality': 1.15, 'balanced': 1.25, 'performance': 1.4 };
    fps *= upscaleFactors[options.upscaleMode] || 1.0;

    // 6. Frame Generation
    if (options.fgEnabled && fgSupported) {
        fps *= 1.5;
    }

    // 7. VRAM Bottleneck Penalty
    if (vram < game.vramReq) {
        fps *= 0.65;
    }

    // 8. Round and Clamp
    fps = Math.round(fps);
    return Math.max(20, Math.min(240, fps)); // Expanded ceiling to 240 for high end builds
}

// --- CALCULATION TRIGGER ---

calcBtn.addEventListener('click', function() {
    const game = document.getElementById('game').value;
    const cpu = document.getElementById('cpu').value;
    const gpuId = document.getElementById('gpu').value;
    const ram = document.getElementById('ram').value;
    const res = document.getElementById('resolution').value;
    const upscale = document.getElementById('upscale').value;
    const fg = document.getElementById('framegen').checked;
    const rt = rtCheckbox.checked;
    const preset = document.getElementById('preset').value;

    if (!game || !cpu || !gpuId || !ram) {
        alert('Please fill all requirements!');
        return;
    }

    const selGpu = gpuSelect.options[gpuSelect.selectedIndex];
    const gpuData = {
        perfScore: parseFloat(selGpu.dataset.perf),
        rtTier: parseInt(selGpu.dataset.rt),
        vram: parseInt(selGpu.dataset.vram),
        fgSupported: selGpu.dataset.fg === 'true'
    };

    const finalFPS = calculateFPS(game, gpuData, CPUS[cpu], res, preset, {
        rtEnabled: rt,
        upscaleMode: upscale,
        fgEnabled: fg
    });

    // DISPLAY
    updateResults(finalFPS, {
        game: document.getElementById('game').options[document.getElementById('game').selectedIndex].text,
        cpu: document.getElementById('cpu').options[document.getElementById('cpu').selectedIndex].text,
        gpu: selGpu.text,
        ram: ram + 'GB',
        res: res,
        rt: rt ? 'ON' : 'OFF',
        upscale: upscale.charAt(0).toUpperCase() + upscale.slice(1),
        fg: fg ? (gpuData.fgSupported ? 'Active' : 'Not Supported') : 'OFF'
    });
});

function updateResults(fps, details) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.classList.remove('hidden');
    
    document.getElementById('resHardware').innerText = `${details.gpu} | ${details.cpu} | ${details.ram} RAM`;
    document.getElementById('resFeatures').innerText = `Res: ${details.res} | RT: ${details.rt} | Frame Gen: ${details.fg}`;
    document.getElementById('resSettings').innerText = `Game: ${details.game} | Upscaling: ${details.upscale}`;

    document.getElementById('fpsValue').innerText = fps;
    const progress = document.getElementById('fpsProgress');
    progress.style.width = (fps / 240 * 100) + '%';

    // Labels
    const perf = document.getElementById('perfLevel');
    const sugg = document.getElementById('suggestionText');
    if (fps < 30) { perf.innerText = 'Low (Laggy)'; perf.style.color = '#ff4d4d'; sugg.innerText = 'Highly recommend lowering resolution or enabling Upscaling.'; }
    else if (fps < 60) { perf.innerText = 'Medium (Playable)'; perf.style.color = '#ffcc00'; sugg.innerText = 'Decent experience. Consider disabling RT for smoother frames.'; }
    else if (fps < 120) { perf.innerText = 'High (Smooth)'; perf.style.color = '#4dff88'; sugg.innerText = 'Excellent performance! Everything is fluid.'; }
    else { perf.innerText = 'Ultra (Elite)'; perf.style.color = '#00d1ff'; sugg.innerText = 'True 144Hz experience. Your PC is a beast.'; }

    resultContainer.scrollIntoView({ behavior: 'smooth' });
}



