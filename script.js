/**
 * Game Performance Analyzer - Script
 * Advanced Deterministic Simulation
 */

// --- DATASETS ---

const NVIDIA_GPUS = [
    { id: 'gtx1080ti', name: 'GTX 1080 Ti', factor: 1.0 },
    { id: 'rtx2060', name: 'RTX 2060', factor: 1.1 },
    { id: 'rtx3060', name: 'RTX 3060', factor: 1.3 },
    { id: 'rtx4060', name: 'RTX 4060', factor: 1.5 },
    { id: 'rtx4070', name: 'RTX 4070', factor: 1.7 },
    { id: 'rtx4080', name: 'RTX 4080', factor: 2.0 },
    { id: 'rtx4090', name: 'RTX 4090', factor: 2.4 },
    { id: 'rtx5090', name: 'RTX 5090', factor: 2.8 }
];

const AMD_GPUS = [
    { id: 'rx6600', name: 'RX 6600', factor: 1.1 },
    { id: 'rx6700xt', name: 'RX 6700 XT', factor: 1.3 },
    { id: 'rx6800', name: 'RX 6800', factor: 1.5 },
    { id: 'rx7600', name: 'RX 7600', factor: 1.3 },
    { id: 'rx7700xt', name: 'RX 7700 XT', factor: 1.7 },
    { id: 'rx7800xt', name: 'RX 7800 XT', factor: 1.9 },
    { id: 'rx7900xt', name: 'RX 7900 XT', factor: 2.2 },
    { id: 'rx7900xtx', name: 'RX 7900 XTX', factor: 2.4 }
];

const BASE_FPS = {
    'gtav': 80, 'rdr2': 50, 'spiderman': 60, 'minecraft': 70,
    'cyberpunk': 35, 'codw': 75, 'acv': 55, 'forza5': 80,
    'eldenring': 60, 'hogwarts': 45
};

const CPU_FACTORS = {
    'i5-10400f': 0.85, 'i5-12400f': 1.0, 'i7-12700h': 1.1, 'i9-13900k': 1.15,
    'r5-5600x': 1.0, 'r7-5800h': 1.05, 'r7-6800h': 1.1, 'r7-7435hs': 1.1,
    'r9-5900x': 1.12, 'r9-7950x': 1.15
};

const PRESET_MULTIPLIERS = {
    'low': 1.6, 'medium': 1.3, 'high': 1.1, 'veryhigh': 1.0, 'ultra': 0.85
};

// --- INITIALIZATION ---

const gpuSelect = document.getElementById('gpu');
const brandRadios = document.getElementsByName('gpuBrand');
const rtCheckbox = document.getElementById('raytracing');
const presetGroup = document.getElementById('presetGroup');

function populateGpus(brand) {
    const list = brand === 'nvidia' ? NVIDIA_GPUS : AMD_GPUS;
    gpuSelect.innerHTML = '<option value="">-- Choose a Model --</option>';
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

    // Step 1: Base Calculation
    const base = BASE_FPS[game];
    const gpuFactor = parseFloat(gpuSelect.options[gpuSelect.selectedIndex].dataset.factor);
    const cpuFactor = CPU_FACTORS[cpu];
    
    let finalFPS = base * gpuFactor * cpuFactor;

    // RAM Bonus
    const ramBonus = { '8': -5, '16': 0, '24': 3, '32': 5 };
    finalFPS += ramBonus[ramSize];

    // Step 2: Ray Tracing Penalty
    if (isRtEnabled) {
        finalFPS *= 0.7; // 30% drop
        // Step 3: Preset (Only if RT is ON)
        finalFPS *= PRESET_MULTIPLIERS[preset];
    }

    // Step 4: Upscaling/Frame Gen Boost
    if (isUpscaleEnabled) {
        finalFPS *= 1.45;
    }

    // Step 5: Clamping (No randomness)
    finalFPS = Math.round(finalFPS);
    finalFPS = Math.max(20, Math.min(180, finalFPS));

    // UI UPDATES
    updateResults(finalFPS, {
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



