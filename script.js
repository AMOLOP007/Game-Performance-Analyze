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

    // Check if inputs are missing
    if (!game || !cpu || !gpu || !ram) {
        alert('Please select all options before calculating!');
        return;
    }

    // Base performance data (Estimated base FPS values at 1080p Ultra)
    const baseFPS = {
        'gtav': 100,
        'rdr2': 50,
        'spiderman': 60,
        'minecraft': 120,
        'cyberpunk': 40,
        'codw': 80,
        'acv': 55,
        'forza5': 85,
        'eldenring': 60,
        'hogwarts': 50
    };

    // GPU Multipliers
    const gpuMultipliers = {
        'gtx1080ti': 1.0,
        'rtx2060': 1.1, 'rtx2070': 1.3, 'rtx2080': 1.6,
        'rtx3050': 1.0, 'rtx3060': 1.4, 'rtx3070': 1.8, 'rtx3080': 2.3,
        'rtx4050': 1.2, 'rtx4060': 1.8, 'rtx4070': 2.4, 'rtx4080': 3.2,
        'rtx5050': 1.8, 'rtx5060': 2.5, 'rtx5070': 3.5, 'rtx5080': 4.5, 'rtx5090': 6.0
    };

    // CPU Multipliers
    const cpuMultipliers = {
        'i5-10400f': 0.8, 'i5-12400f': 1.0, 'i7-12700h': 1.2, 'i9-13900k': 1.5,
        'r5-5600x': 1.0, 'r7-5800h': 1.1, 'r7-6800h': 1.2, 'r7-7435hs': 1.2,
        'r9-5900x': 1.4, 'r9-7950x': 1.6
    };

    // RAM Bonuses
    const ramBonus = {
        '8': -5,
        '16': 0,
        '24': 3,
        '32': 5
    };

    // Final Calculation Formula: (Base * GPU * CPU) + RAM Bonus
    let estimatedFPS = (baseFPS[game] * gpuMultipliers[gpu] * cpuMultipliers[cpu]) + ramBonus[ram];
    
    // Add minor randomness for realism (+/- 3 FPS)
    estimatedFPS += (Math.random() * 6) - 3;
    estimatedFPS = Math.round(estimatedFPS);

    // Get display names for the summary
    const gameName = document.getElementById('game').options[document.getElementById('game').selectedIndex].text;
    const cpuName = document.getElementById('cpu').options[document.getElementById('cpu').selectedIndex].text;
    const gpuName = document.getElementById('gpu').options[document.getElementById('gpu').selectedIndex].text;
    const ramName = ram + "GB";

    // Display Result
    showResult(estimatedFPS, gameName, cpuName, gpuName, ramName);
});

function showResult(fps, game, cpu, gpu, ram) {
    const resultContainer = document.getElementById('resultContainer');
    const fpsValue = document.getElementById('fpsValue');
    const perfLevel = document.getElementById('perfLevel');
    const suggestionText = document.getElementById('suggestionText');
    const fpsProgress = document.getElementById('fpsProgress');
    
    // Summary elements
    document.getElementById('resGame').innerText = game;
    document.getElementById('resHardware').innerText = `${cpu} | ${gpu} | ${ram} RAM`;

    // Unhide the result card
    resultContainer.classList.remove('hidden');

    // Update FPS value
    fpsValue.innerText = fps;

    // Update Progress Bar (Max 200 FPS for visual scope)
    let barWidth = (fps / 200) * 100;
    if (barWidth > 100) barWidth = 100;
    fpsProgress.style.width = barWidth + '%';

    // Determine Performance Level and Suggestion
    if (fps < 30) {
        perfLevel.innerText = 'Low (Unplayable)';
        perfLevel.style.color = '#ff4d4d';
        suggestionText.innerText = 'Highly recommend lowering resolution or enabling DLSS Ultra Performance.';
    } else if (fps < 60) {
        perfLevel.innerText = 'Medium (Playable)';
        perfLevel.style.color = '#ffcc00';
        suggestionText.innerText = 'Try lowering shadows or using DLSS/FSR Balanced mode for better stability.';
    } else if (fps < 120) {
        perfLevel.innerText = 'High (Smooth)';
        perfLevel.style.color = '#4dff88';
        suggestionText.innerText = 'Excellent performance! You can enjoy high settings with stable frame rates.';
    } else {
        perfLevel.innerText = 'Ultra (Elite)';
        perfLevel.style.color = '#00d1ff';
        suggestionText.innerText = 'True Master Race performance! Crank everything to Ultra and enjoy.';
    }

    // Smooth scroll to results
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

