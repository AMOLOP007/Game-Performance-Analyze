/**
 * Game Performance Analyzer - Script
 * Handles logic for FPS estimation
 */

document.getElementById('calculateBtn').addEventListener('click', function() {
    // Get form values
    const game = document.getElementById('game').value;
    const gpu = document.getElementById('gpu').value;
    const ram = document.getElementById('ram').value;

    // Check if inputs are missing
    if (!game || !gpu || !ram) {
        alert('Please select all options before calculating!');
        return;
    }

    // Base performance data (Example values for demonstration)
    const baseFPS = {
        'gtav': 90,
        'rdr2': 45,
        'spiderman': 55,
        'minecraft': 70
    };

    const gpuMultipliers = {
        'rtx3050': 1.0,
        'rtx3060': 1.3,
        'rtx4060': 1.6,
        'rtx4070': 2.0
    };

    const ramBonus = {
        '8': -5,
        '16': 0,
        '24': 3,
        '32': 5
    };

    // Calculation Logic
    let estimatedFPS = baseFPS[game] * gpuMultipliers[gpu] + ramBonus[ram];
    
    // Add some "simulation" randomness (e.g., +/- 2 FPS)
    estimatedFPS += (Math.random() * 4) - 2;
    estimatedFPS = Math.round(estimatedFPS);

    // Display Result
    showResult(estimatedFPS);
});

function showResult(fps) {
    const resultContainer = document.getElementById('resultContainer');
    const fpsValue = document.getElementById('fpsValue');
    const perfLevel = document.getElementById('perfLevel');
    const suggestionText = document.getElementById('suggestionText');
    const fpsProgress = document.getElementById('fpsProgress');

    // Unhide the result card
    resultContainer.classList.remove('hidden');

    // Update FPS value
    fpsValue.innerText = fps;

    // Update Progress Bar (Max 144 FPS for bar visual)
    let barWidth = (fps / 144) * 100;
    if (barWidth > 100) barWidth = 100;
    fpsProgress.style.width = barWidth + '%';

    // Determine Performance Level and Suggestion
    if (fps < 30) {
        perfLevel.innerText = 'Low (Unplayable/Laggy)';
        perfLevel.style.color = '#ff4d4d';
        suggestionText.innerText = 'Consider lowering your resolution to 720p or upgrading your GPU.';
    } else if (fps < 60) {
        perfLevel.innerText = 'Medium (Playable)';
        perfLevel.style.color = '#ffcc00';
        suggestionText.innerText = 'Try lowering some graphics settings like Shadows or Ambient Occlusion.';
    } else if (fps < 100) {
        perfLevel.innerText = 'High (Smooth)';
        perfLevel.style.color = '#4dff88';
        suggestionText.innerText = 'Great performance! You can enable some higher settings or DLSS for more stability.';
    } else {
        perfLevel.innerText = 'Ultra (Excellent)';
        perfLevel.style.color = '#00d1ff';
        suggestionText.innerText = 'Your system handles this game like a beast! Feel free to max out all settings.';
    }

    // Smooth scroll to results
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}
