/**
 * Game Performance Analyzer - Script
 * Advanced Deterministic Simulation
 */

// --- DATASETS ---

const NVIDIA_GPUS = [
    { id: 'gtx1080ti', name: 'GTX 1080 Ti', factor: 0.95 },
    { id: 'rtx2060', name: 'RTX 2060', factor: 0.9 },
    { id: 'rtx3060', name: 'RTX 3060', factor: 1.0 },
    { id: 'rtx4060', name: 'RTX 4060', factor: 1.15 },
    { id: 'rtx4070', name: 'RTX 4070', factor: 1.35 },
    { id: 'rtx4080', name: 'RTX 4080', factor: 1.7 },
    { id: 'rtx4090', name: 'RTX 4090', factor: 2.0 },
    { id: 'rtx5090', name: 'RTX 5090', factor: 2.4 }
];

const AMD_GPUS = [
    { id: 'rx6600', name: 'RX 6600', factor: 0.95 },
    { id: 'rx6700xt', name: 'RX 6700 XT', factor: 1.1 },
    { id: 'rx6800', name: 'RX 6800', factor: 1.25 },
    { id: 'rx7600', name: 'RX 7600', factor: 1.05 },
    { id: 'rx7700xt', name: 'RX 7700 XT', factor: 1.3 },
    { id: 'rx7800xt', name: 'RX 7800 XT', factor: 1.5 },
    { id: 'rx7900xt', name: 'RX 7900 XT', factor: 1.8 },
    { id: 'rx7900xtx', name: 'RX 7900 XTX', factor: 2.0 }
];

const BASE_FPS = {
    'gtav': 95, 
    'rdr2': 55, 
    'spiderman': 75, 
    'minecraft': 80,
    'cyberpunk': 38, 
    'codw': 70, 
    'acv': 60, 
    'forza5': 85,
    'eldenring': 50, 
    'hogwarts': 45
};

const CPU_FACTORS = {
    // Low Tier (0.9)
    'i5-10400f': 0.9, 'r5-5600x': 0.9,
    // Mid Tier (1.0)
    'i5-12400f': 1.0, 'r7-5800h': 1.0, 'r7-6800h': 1.0, 'r7-7435hs': 1.0,
    // High Tier (1.05)
    'i7-12700h': 1.05, 'i9-13900k': 1.05, 'r9-5900x': 1.05, 'r9-7950x': 1.05
};

const PRESET_MULTIPLIERS = {
    'low': 1.4, 
    'medium': 1.2, 
    'high': 1.05, 
    'veryhigh': 1.0, 
    'ultra': 0.9
};

// --- INITIALIZATION ---

const gpuSelect = document.getElementById('gpu');
const brandRadios = document.getElementsByName('gpuBrand');
const rtCheckbox = document.getElementById('raytracing');
const presetGroup = document.getElementById('presetGroup');
const calcBtn = document.getElementById('calculateBtn');

function populateGpus(brand) {
    const list = brand === 'nvidia' ? NVIDIA_GPUS : AMD_GPUS;
    gpuSelect.innerHTML = '<option value="">-- Choose a Model --</option>';
    
    // Update button color
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
        option.dataset.factor = gpu.factor;
        gpuSelect.appendChild(option);
    });
}

// Set default
populateGpus('nvidia');

// --- EVENT LISTENERS ---

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


document.getElementById('calculateBtn').addEventListener('click', function() {
    const game = document.getElementById('game').value;
    const cpu = document.getElementById('cpu').value;
    const gpuId = document.getElementById('gpu').value;
    const ramSize = document.getElementById('ram').value;
    const isRtEnabled = rtCheckbox.checked;
    const isUpscaleEnabled = document.getElementById('upscale').checked;
    const preset = document.getElementById('preset').value;

    if (!game || !cpu || !gpuId || !ramSize) {
        alert('Please select all required options!');
        return;
    }

    // Step 1: Base Calculation (RAW FPS)
    let fps = BASE_FPS[game];

    // Apply scaling factors
    const gpuFactor = parseFloat(gpuSelect.options[gpuSelect.selectedIndex].dataset.factor);
    const cpuFactor = CPU_FACTORS[cpu];
    const presetFactor = isRtEnabled ? PRESET_MULTIPLIERS[preset] : 1.0; // Preset only applies to RT mode as per user request flow? 
    // Wait, the user's flow says "fps *= presetFactor" as a step, but they also have RT.
    // I'll apply it normally as it represents general quality settings.
    
    fps = fps * gpuFactor * cpuFactor * PRESET_MULTIPLIERS[preset];

    // Step 2: Ray Tracing Impact
    if (isRtEnabled) {
        fps *= 0.6;
    }

    // Step 3: Upscaling & Frame Generation
    if (isUpscaleEnabled) {
        fps *= 1.3;
    }

    // Step 4: RAM Bonus
    const ramBonus = { '8': -5, '16': 0, '24': 3, '32': 5 };
    fps += ramBonus[ramSize];

    // Step 5: Final Clamping (DETERMINISTIC)
    fps = Math.round(fps);
    if (fps < 20) fps = 20;
    if (fps > 180) fps = 180;

    // UI UPDATES
    updateResults(fps, {
        game: document.getElementById('game').options[document.getElementById('game').selectedIndex].text,
        cpu: document.getElementById('cpu').options[document.getElementById('cpu').selectedIndex].text,
        gpu: gpuSelect.options[gpuSelect.selectedIndex].text,
        ram: ramSize + 'GB',
        rt: isRtEnabled ? 'ON' : 'OFF',
        upscale: isUpscaleEnabled ? 'ON' : 'OFF',
        preset: isRtEnabled ? document.getElementById('preset').options[document.getElementById('preset').selectedIndex].text : 'N/A'
    });
});

function updateResults(fps, details) {
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.classList.remove('hidden');
    
    document.getElementById('resHardware').innerText = `${details.gpu} | ${details.cpu} | ${details.ram}`;
    document.getElementById('resFeatures').innerText = `Ray Tracing: ${details.rt} | Upscaling: ${details.upscale}`;
    document.getElementById('resSettings').innerText = `Game: ${details.game} | Preset: ${details.preset}`;

    document.getElementById('fpsValue').innerText = fps;
    const progress = document.getElementById('fpsProgress');
    progress.style.width = (fps / 180 * 100) + '%';

    // Difficulty labels
    const perf = document.getElementById('perfLevel');
    const sugg = document.getElementById('suggestionText');
    if (fps < 30) { perf.innerText = 'Low'; perf.style.color = '#ff4d4d'; sugg.innerText = 'Highly advise enabling Upscaling or turning off RT.'; }
    else if (fps < 60) { perf.innerText = 'Medium'; perf.style.color = '#ffcc00'; sugg.innerText = 'Decent experience. Lowering RT preset might help.'; }
    else if (fps < 120) { perf.innerText = 'High'; perf.style.color = '#4dff88'; sugg.innerText = 'Very smooth gameplay settings.'; }
    else { perf.innerText = 'Ultra'; perf.style.color = '#00d1ff'; sugg.innerText = 'Top-tier performance metrics.'; }

    resultContainer.scrollIntoView({ behavior: 'smooth' });
}



