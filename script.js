/**
 * Game Performance Analyzer - Script
 * Refined Advanced Deterministic Engine v4.0
 */

// --- DATASETS ---

// Baseline: RTX 3060 at 1080p Ultra = 1.0 power
const GPUS = {
    nvidia: [
        { id: 'gtx1080ti', name: 'GTX 1080 Ti', power: 0.9, vram: 11, frameGen: false },
        { id: 'rtx2060', name: 'RTX 2060', power: 0.8, vram: 6, frameGen: false },
        { id: 'rtx3060', name: 'RTX 3060', power: 1.0, vram: 12, frameGen: false },
        { id: 'rtx4060', name: 'RTX 4060', power: 1.3, vram: 8, frameGen: true },
        { id: 'rtx4070', name: 'RTX 4070', power: 1.8, vram: 12, frameGen: true },
        { id: 'rtx4080', name: 'RTX 4080', power: 2.9, vram: 16, frameGen: true },
        { id: 'rtx4090', name: 'RTX 4090', power: 4.0, vram: 24, frameGen: true },
        { id: 'rtx5090', name: 'RTX 5090', power: 5.8, vram: 32, frameGen: true }
    ],
    amd: [
        { id: 'rx6600', name: 'RX 6600', power: 0.9, vram: 8, frameGen: false },
        { id: 'rx6700xt', name: 'RX 6700 XT', power: 1.2, vram: 12, frameGen: false },
        { id: 'rx6800', name: 'RX 6800', power: 1.6, vram: 16, frameGen: false },
        { id: 'rx7600', name: 'RX 7600', power: 1.1, vram: 8, frameGen: false },
        { id: 'rx7700xt', name: 'RX 7700 XT', power: 1.7, vram: 12, frameGen: false },
        { id: 'rx7800xt', name: 'RX 7800 XT', power: 2.3, vram: 16, frameGen: false },
        { id: 'rx7900xt', name: 'RX 7900 XT', power: 3.2, vram: 20, frameGen: false },
        { id: 'rx7900xtx', name: 'RX 7900 XTX', power: 4.0, vram: 24, frameGen: false }
    ]
};

const GAMES = {
    'gtav': { base: 95, vram: 4 },
    'rdr2': { base: 55, vram: 6 },
    'spiderman': { base: 75, vram: 8 },
    'minecraft': { base: 80, vram: 4 },
    'cyberpunk': { base: 38, vram: 10 },
    'codw': { base: 70, vram: 8 },
    'acv': { base: 60, vram: 8 },
    'forza5': { base: 85, vram: 8 },
    'eldenring': { base: 50, vram: 6 },
    'hogwarts': { base: 45, vram: 12 }
};

const CPUS = {
    'i5-10400f': 0.9, 'r5-5600x': 0.9,
    'i5-12400f': 1.0, 'r7-5800h': 1.0, 'r7-6800h': 1.0, 'r7-7435hs': 1.0,
    'i7-12700h': 1.05, 'i9-13900k': 1.1, 'r9-5900x': 1.05, 'r9-7950x': 1.15
};

// --- INITIALIZATION ---

const gpuSelect = document.getElementById('gpu');
const brandRadios = document.getElementsByName('gpuBrand');
const rtCheckbox = document.getElementById('raytracing');
const presetGroup = document.getElementById('presetGroup');
const calcBtn = document.getElementById('calculateBtn');

/**
 * Populates the GPU dropdown based on brand
 */
function populateGpus(brand) {
    const list = GPUS[brand];
    gpuSelect.innerHTML = '<option value="">-- Choose a Model --</option>';
    
    // Update button color theme
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
        // Store technical data on option
        option.dataset.power = gpu.power;
        option.dataset.vram = gpu.vram;
        option.dataset.fg = gpu.frameGen;
        gpuSelect.appendChild(option);
    });
}

// Initial state
populateGpus('nvidia');

// --- INTERACTIVE UI HANDLERS ---

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
 * THE CORE FPS CALCULATION ENGINE
 */
function calculateFPS(gameKey, gpuData, cpuFactor, resolution, preset, options) {
    const game = GAMES[gameKey];
    const { power, vram, frameGenSupported } = gpuData;

    // 1. GPU Relative Scaling (sqrt-based for realism / diminishing returns)
    let fps = game.base * Math.sqrt(power);

    // 2. CPU Impact
    fps *= cpuFactor;

    // 3. Resolution Scaling
    const resFactors = { '720p': 1.5, '1080p': 1.0, '1440p': 0.65 };
    fps *= resFactors[resolution] || 1.0;

    // 4. Graphics Preset Scaling (Finalized)
    const presetFactors = { 'low': 1.4, 'medium': 1.2, 'high': 1.05, 'veryhigh': 1.0, 'ultra': 0.9 };
    fps *= presetFactors[preset] || 1.0;

    // 5. Ray Tracing Penalty
    if (options.rayTracing) {
        fps *= 0.6; // 40% performance drop
    }

    // 6. Upscaling Boost
    const upscaleFactors = { 'none': 1.0, 'quality': 1.15, 'balanced': 1.25, 'performance': 1.4 };
    fps *= upscaleFactors[options.upscaleMode] || 1.0;

    // 7. Frame Generation (Only if supported by GPU)
    if (options.frameGen && frameGenSupported) {
        fps *= 1.5; // Moderate AI frame boost
    }

    // 8. VRAM Bottleneck Check
    if (vram < game.vram) {
        fps *= 0.65; // High penalty for memory overflow (stuttering)
    }

    // 9. Round and Clamp
    fps = Math.round(fps);
    return Math.max(20, Math.min(180, fps));
}

// --- MAIN TRIGGER ---

calcBtn.addEventListener('click', function() {
    const game = document.getElementById('game').value;
    const cpu = document.getElementById('cpu').value;
    const gpuId = document.getElementById('gpu').value;
    const ram = document.getElementById('ram').value;
    const resolution = document.getElementById('resolution').value;
    const upscaleMode = document.getElementById('upscale').value;
    const frameGen = document.getElementById('framegen').checked;
    const isRtEnabled = rtCheckbox.checked;
    const preset = document.getElementById('preset').value;

    if (!game || !cpu || !gpuId || !ram) {
        alert('Please select all required options!');
        return;
    }

    const selectedGpuOption = gpuSelect.options[gpuSelect.selectedIndex];
    const gpuData = {
        power: parseFloat(selectedGpuOption.dataset.power),
        vram: parseInt(selectedGpuOption.dataset.vram),
        frameGenSupported: selectedGpuOption.dataset.fg === 'true'
    };

    // RUN ENGINE
    const finalFPS = calculateFPS(game, gpuData, CPUS[cpu], resolution, preset, {
        rayTracing: isRtEnabled,
        upscaleMode: upscaleMode,
        frameGen: frameGen
    });

    // DISPLAY
    updateResults(finalFPS, {
        game: document.getElementById('game').options[document.getElementById('game').selectedIndex].text,
        cpu: document.getElementById('cpu').options[document.getElementById('cpu').selectedIndex].text,
        gpu: selectedGpuOption.text,
        ram: ram + 'GB',
        res: resolution,
        rt: isRtEnabled ? 'ON' : 'OFF',
        upscale: upscaleMode.charAt(0).toUpperCase() + upscaleMode.slice(1),
        fg: frameGen ? (gpuData.frameGenSupported ? 'Active' : 'Not Supported') : 'OFF'
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
    progress.style.width = (fps / 180 * 100) + '%';

    // Labels
    const perf = document.getElementById('perfLevel');
    const sugg = document.getElementById('suggestionText');
    if (fps < 30) { perf.innerText = 'Low (Laggy)'; perf.style.color = '#ff4d4d'; sugg.innerText = 'Highly recommend lowering resolution or enabling Upscaling.'; }
    else if (fps < 60) { perf.innerText = 'Medium (Playable)'; perf.style.color = '#ffcc00'; sugg.innerText = 'Decent experience. Consider disabling RT for smoother frames.'; }
    else if (fps < 120) { perf.innerText = 'High (Smooth)'; perf.style.color = '#4dff88'; sugg.innerText = 'Excellent performance! Everything is fluid.'; }
    else { perf.innerText = 'Ultra (Elite)'; perf.style.color = '#00d1ff'; sugg.innerText = 'True 144Hz experience. Your PC is a beast.'; }

    resultContainer.scrollIntoView({ behavior: 'smooth' });
}



