document.addEventListener('DOMContentLoaded', function () {
    // Timer State Variables
    let workTime = 25 * 60;
    let breakTime = 5 * 60;
    let timer;
    let selectedWorkTime = workTime;
    let selectedBreakTime = breakTime;
    
    // Centralized Timer State
    let timerState = {
        activeTimer: null, // 'work', 'break', or null
        isRunning: false
    };

    // DOM Element References
    const timerDisplay = document.getElementById("timerDisplay");
    const breakTimerDisplay = document.getElementById("breakTimerDisplay");
    const startWorkButton = document.getElementById("startWorkButton");
    const startBreakButton = document.getElementById("startBreakButton");
    const resetButton = document.getElementById("resetButton");
    const challengeDisplay = document.getElementById("challengeDisplay");
    const ambientBackground = document.getElementById("ambientBackground");
    const toggleButton = document.getElementById("toggleDarkMode");

    // Audio Context for Sound Effects
    let audioContext;
    
    // Initialize Audio Context
    function initAudioContext() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContext;
    }

    // Animation and Effects Functions
    function createFireworks() {
        const container = document.getElementById('fireworksContainer');
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8'];
        
        // Create multiple firework bursts
        for (let burst = 0; burst < 5; burst++) {
            setTimeout(() => {
                const centerX = Math.random() * window.innerWidth;
                const centerY = Math.random() * (window.innerHeight * 0.6) + window.innerHeight * 0.1;
                
                // Create particles for each burst
                for (let i = 0; i < 30; i++) {
                    const particle = document.createElement('div');
                    particle.className = 'firework firework-particle';
                    
                    const angle = (Math.PI * 2 * i) / 30;
                    const velocity = 50 + Math.random() * 100;
                    const dx = Math.cos(angle) * velocity;
                    const dy = Math.sin(angle) * velocity;
                    
                    particle.style.left = centerX + 'px';
                    particle.style.top = centerY + 'px';
                    particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                    
                    // Set CSS custom properties for animation
                    particle.style.setProperty('--dx', dx + 'px');
                    particle.style.setProperty('--dy', dy + 'px');
                    
                    container.appendChild(particle);
                    
                    // Remove particle after animation
                    setTimeout(() => {
                        if (particle.parentNode) {
                            particle.parentNode.removeChild(particle);
                        }
                    }, 1500);
                }
            }, burst * 300);
        }
        
        // Use canvas-confetti library for additional effects
        if (typeof confetti !== 'undefined') {
            // Multiple confetti bursts
            setTimeout(() => confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            }), 200);
            
            setTimeout(() => confetti({
                particleCount: 50,
                spread: 60,
                origin: { x: 0.25, y: 0.7 }
            }), 600);
            
            setTimeout(() => confetti({
                particleCount: 50,
                spread: 60,
                origin: { x: 0.75, y: 0.7 }
            }), 1000);
        }
    }

    function addShakeAnimation(element) {
        element.classList.add('shake-animation');
        setTimeout(() => {
            element.classList.remove('shake-animation');
        }, 2400); // 0.8s * 3 repetitions
    }

    function addBuzzAnimation(element) {
        element.classList.add('buzz-animation');
        setTimeout(() => {
            element.classList.remove('buzz-animation');
        }, 2000); // 0.5s * 4 repetitions
    }

    function addPulseAnimation(element) {
        element.classList.add('pulse-animation');
        setTimeout(() => {
            element.classList.remove('pulse-animation');
        }, 3000); // 1s * 3 repetitions
    }

    function addCelebrationFlash() {
        document.body.classList.add('celebration-flash');
        setTimeout(() => {
            document.body.classList.remove('celebration-flash');
        }, 900); // 0.3s * 3 repetitions
    }

    function celebrateWorkCompletion() {
        // Add fireworks
        createFireworks();
        
        // Add celebration flash
        addCelebrationFlash();
        
        // Animate timer displays
        addBuzzAnimation(timerDisplay);
        addPulseAnimation(document.querySelector('.glass'));
        
        // Shake the work timer section
        const workTimerSection = timerDisplay.closest('.text-center');
        addShakeAnimation(workTimerSection);
    }

    function celebrateBreakCompletion() {
        // Add shake animation to break timer
        const breakTimerSection = breakTimerDisplay.closest('.text-center');
        addShakeAnimation(breakTimerSection);
        
        // Add buzz animation to break timer display
        addBuzzAnimation(breakTimerDisplay);
        
        // Add pulse to the design tip area
        addPulseAnimation(challengeDisplay);
    }

    // Sound Effect Functions
    function playStartSound() {
        try {
            const ctx = initAudioContext();
            
            // Create a pleasant "ba-ding" sound
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            // Two-tone ding: first note at 800Hz, second at 1000Hz
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);
            oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
            
            // Envelope for pleasant sound
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            
            oscillator.type = 'sine';
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
        } catch (error) {
            console.log('Audio not supported or blocked');
        }
    }

    function playCompletionSound() {
        try {
            const ctx = initAudioContext();
            
            // Create a pleasant bong sound
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            // Deep, resonant bong frequency
            oscillator.frequency.setValueAtTime(220, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 1.5);
            
            // Long, gentle decay like a bell
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
            
            oscillator.type = 'sine';
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 2);
        } catch (error) {
            console.log('Audio not supported or blocked');
        }
    }

    // OpenAI API Configuration
    let openaiApiKey = localStorage.getItem('openaiApiKey') || '';
    
    // Advanced Fallback Design Tips
    const fallbackTips = [
        "Challenge convention: The most elegant solutions often emerge when you deliberately break established design patterns and rebuild from first principles.",
        "Exploit perceptual boundaries: Use the liminal space between conscious and subconscious perception to guide behavior without explicit instruction.",
        "Design for cognitive friction: Strategic difficulty can increase engagement and perceived value—not everything should be effortless.",
        "Weaponize white space: Negative space isn't empty—it's a powerful tool for creating hierarchy, rhythm, and emotional breathing room.",
        "Embrace asymmetrical balance: Perfect symmetry is predictable; intentional imbalance creates visual tension that holds attention longer.",
        "Design with synaesthetic principles: Cross-sensory design creates deeper emotional connections—think about how colors 'sound' and shapes 'feel'.",
        "Leverage the uncanny valley in UI: Slightly imperfect, human-like elements can be more engaging than sterile perfection.",
        "Use temporal design patterns: Consider how your interface ages—design for the fourth, fortieth, and four-hundredth use, not just the first.",
        "Apply quantum design thinking: Design for multiple simultaneous states rather than linear user journeys—users exist in superposition.",
        "Exploit the Zeigarnik effect: Incomplete visual elements create psychological tension that drives users to seek closure and completion.",
        "Design for peripheral vision: 80% of visual processing happens outside the focal point—design for the edges, not just the center.",
        "Use micro-interactions as emotional punctuation: Every hover, click, and transition is an opportunity to inject personality and delight.",
        "Challenge the tyranny of the grid: Sometimes the most powerful layouts emerge from controlled chaos and organic asymmetry.",
        "Design with chromesthetic principles: Colors have temperature, weight, and texture—use these properties to create invisible information architecture.",
        "Leverage the paradox of choice in reverse: Sometimes overwhelming users initially leads to deeper engagement and better long-term retention.",
        "Apply biomimetic interface patterns: Nature has solved complex information problems—study how organisms process and display data.",
        "Design for the liminal user: The most interesting insights come from edge cases and boundary conditions, not average users.",
        "Use negative affordances: Sometimes the most powerful design choice is making certain actions deliberately difficult or impossible.",
        "Exploit the psychology of scarcity: Artificial constraints can increase perceived value and drive more thoughtful user behavior.",
        "Design with entropic principles: Embrace controlled decay and imperfection—systems that show wear can feel more authentic and trustworthy.",
        "Apply the principle of least astonishment—then deliberately violate it: Surprise users in exactly one unexpected way per interaction.",
        "Use semantic satiation in design: Repeat visual elements until they lose meaning, then introduce variation to restore attention.",
        "Design for the observer effect: Users behave differently when they know they're being watched—design for both observed and unobserved states.",
        "Leverage the cocktail party effect: Design interfaces that can filter signal from noise and highlight personally relevant information.",
        "Apply the Benjamin Franklin effect to UX: Users value interfaces more when they've invested effort in customizing or contributing to them.",
        "Design with quantum entanglement principles: Create interface elements that are mysteriously connected across space and time.",
        "Use the psychology of flow interruption: Strategic friction points can actually increase satisfaction by making easy tasks feel more rewarding.",
        "Apply the principle of emergent complexity: Simple rules can create sophisticated behaviors—design the rules, not the outcomes.",
        "Design for the paradox of automation: The more automated a system becomes, the more critical human judgment becomes in edge cases.",
        "Leverage the psychology of mental models: Users don't see your interface—they see their mental model of your interface projected onto it.",
        "Use the principle of graceful degradation in aesthetics: Design should remain beautiful even when content, context, or technology fails.",
        "Apply the concept of design dark matter: The invisible systems, processes, and decisions that shape user experience are often more important than visible elements.",
        "Design with the principle of requisite variety: Your interface must be at least as complex as the problem it's trying to solve.",
        "Leverage the psychology of cognitive dissonance: Contradictory interface elements can create memorable tension that drives deeper engagement.",
        "Use the principle of adjacent possible: The most innovative designs exist at the boundary between the familiar and the impossible.",
        "Apply the concept of design debt: Every shortcut and compromise accumulates interest—design for long-term maintainability, not just immediate needs.",
        "Design with the principle of antifragility: Create interfaces that get stronger under stress rather than just surviving it.",
        "Leverage the psychology of loss aversion in reverse: Sometimes taking features away creates more value than adding them.",
        "Use the principle of constructive interference: When design elements reinforce each other, they create experiences greater than the sum of their parts.",
        "Apply the concept of design emergence: The most powerful interfaces arise from the interaction between users and systems, not from predetermined flows."
    ];
    
    // Utility function to get random fallback tip
    function getRandomFallbackTip() {
        return fallbackTips[Math.floor(Math.random() * fallbackTips.length)];
    }
    
    // Validate API key format
    function isValidApiKey(key) {
        return key && key.trim().startsWith('sk-') && key.trim().length > 20;
    }
    
    // OpenAI API Integration
    async function fetchDesignTipFromOpenAI() {
        if (!openaiApiKey) {
            throw new Error('API_KEY_NOT_CONFIGURED');
        }

        if (!isValidApiKey(openaiApiKey)) {
            throw new Error('INVALID_API_KEY_FORMAT');
        }

        const prompt = `Generate a single, advanced design insight for an expert UX/UI designer. Make it provocative, technically sophisticated, and challenge conventional thinking. Focus on cutting-edge design theory, cognitive psychology, or unconventional approaches. Keep it under 150 characters. Be bold and thought-provoking. Return only the tip text, no quotes or extra formatting.`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    max_tokens: 100,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.8
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('INVALID_API_KEY');
                } else if (response.status === 429) {
                    throw new Error('RATE_LIMIT_EXCEEDED');
                } else if (response.status >= 500) {
                    throw new Error('SERVER_ERROR');
                } else {
                    throw new Error(`API_ERROR_${response.status}`);
                }
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('INVALID_API_RESPONSE');
            }
            
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('Error fetching tip from OpenAI:', error);
            
            // Re-throw network errors with specific error codes
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('NETWORK_ERROR');
            }
            
            throw error;
        }
    }

    // Settings Management
    window.showApiKeySettings = function() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="glass p-6 rounded-lg max-w-md w-full mx-4">
                <h3 class="text-lg font-semibold mb-4">OpenAI API Settings</h3>
                <p class="text-sm text-gray-600 mb-4">Enter your OpenAI API key to enable dynamic design tips:</p>
                <input 
                    type="password" 
                    id="apiKeyInput" 
                    placeholder="sk-..." 
                    value="${openaiApiKey}"
                    class="w-full p-2 border rounded mb-2 bg-white text-gray-800"
                />
                <div id="keyValidation" class="text-xs mb-4 min-h-4"></div>
                <div class="flex gap-2 mb-4">
                    <button id="testApiKey" class="bg-green-500 text-white px-4 py-2 rounded flex-1">Test Connection</button>
                    <button id="saveApiKey" class="bg-blue-500 text-white px-4 py-2 rounded flex-1">Save</button>
                    <button id="cancelApiKey" class="bg-gray-500 text-white px-4 py-2 rounded flex-1">Cancel</button>
                </div>
                <div id="testResult" class="text-xs mb-2 min-h-4"></div>
                <p class="text-xs text-gray-500">Your API key is stored locally and never shared.</p>
                <div class="mt-4 p-3 bg-gray-100 rounded text-xs">
                    <strong>Need an API key?</strong><br>
                    1. Visit <a href="https://platform.openai.com/api-keys" target="_blank" class="text-blue-500 underline">OpenAI API Keys</a><br>
                    2. Create a new secret key<br>
                    3. Copy and paste it above
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const apiKeyInput = document.getElementById('apiKeyInput');
        const keyValidation = document.getElementById('keyValidation');
        const testResult = document.getElementById('testResult');
        const testButton = document.getElementById('testApiKey');
        const saveButton = document.getElementById('saveApiKey');

        // Real-time validation
        apiKeyInput.addEventListener('input', () => {
            const key = apiKeyInput.value.trim();
            if (!key) {
                keyValidation.textContent = '';
                keyValidation.className = 'text-xs mb-4 min-h-4';
            } else if (isValidApiKey(key)) {
                keyValidation.textContent = '✓ API key format looks valid';
                keyValidation.className = 'text-xs mb-4 min-h-4 text-green-600';
            } else {
                keyValidation.textContent = '⚠ Invalid API key format (should start with "sk-")';
                keyValidation.className = 'text-xs mb-4 min-h-4 text-red-600';
            }
            testResult.textContent = '';
        });

        // Test API key
        testButton.onclick = async () => {
            const testKey = apiKeyInput.value.trim();
            if (!testKey) {
                testResult.textContent = 'Please enter an API key first';
                testResult.className = 'text-xs mb-2 min-h-4 text-red-600';
                return;
            }

            testButton.textContent = 'Testing...';
            testButton.disabled = true;
            testResult.textContent = 'Testing connection...';
            testResult.className = 'text-xs mb-2 min-h-4 text-blue-600';

            const tempKey = openaiApiKey; // Save original key before try block
            
            try {
                openaiApiKey = testKey;
                await fetchDesignTipFromOpenAI();
                
                testResult.textContent = '✓ Connection successful! API key is working.';
                testResult.className = 'text-xs mb-2 min-h-4 text-green-600';
            } catch (error) {
                let errorMsg = 'Connection failed: ';
                
                switch (error.message) {
                    case 'INVALID_API_KEY':
                        errorMsg += 'Invalid API key';
                        break;
                    case 'RATE_LIMIT_EXCEEDED':
                        errorMsg += 'Rate limit exceeded (but key is valid)';
                        testResult.className = 'text-xs mb-2 min-h-4 text-yellow-600';
                        break;
                    case 'NETWORK_ERROR':
                        errorMsg += 'Network connection issue';
                        break;
                    default:
                        errorMsg += 'Unknown error';
                        break;
                }
                
                testResult.textContent = errorMsg;
                if (!testResult.className.includes('yellow')) {
                    testResult.className = 'text-xs mb-2 min-h-4 text-red-600';
                }
            }

            // Always restore the original key
            openaiApiKey = tempKey;
            testButton.textContent = 'Test Connection';
            testButton.disabled = false;
        };

        // Save API key
        saveButton.onclick = () => {
            const newKey = apiKeyInput.value.trim();
            if (newKey && isValidApiKey(newKey)) {
                openaiApiKey = newKey;
                localStorage.setItem('openaiApiKey', newKey);
                document.body.removeChild(modal);
            } else if (newKey) {
                keyValidation.textContent = '⚠ Please enter a valid API key format';
                keyValidation.className = 'text-xs mb-4 min-h-4 text-red-600';
            } else {
                // Allow saving empty key to clear it
                openaiApiKey = '';
                localStorage.removeItem('openaiApiKey');
                document.body.removeChild(modal);
            }
        };

        // Cancel
        document.getElementById('cancelApiKey').onclick = () => {
            document.body.removeChild(modal);
        };

        // Close on escape key
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', escapeHandler);
            }
        });

        // Focus the input
        setTimeout(() => apiKeyInput.focus(), 100);
    }

    // Utility Functions
    async function updateDesignTip() {
        const tipContent = challengeDisplay.querySelector("div.text-xl");
        if (!tipContent) return;

        // Show loading state
        tipContent.textContent = "Generating design tip...";
        challengeDisplay.classList.remove("fade-in");
        void challengeDisplay.offsetWidth; // Force reflow
        challengeDisplay.classList.add("fade-in");

        try {
            const tip = await fetchDesignTipFromOpenAI();
            tipContent.textContent = tip;
            challengeDisplay.classList.remove("fade-in");
            void challengeDisplay.offsetWidth; // Force reflow
            challengeDisplay.classList.add("fade-in");
        } catch (error) {
            console.error('Failed to fetch design tip:', error);
            
            // Handle specific error types with appropriate messages and fallbacks
            let errorMessage = '';
            let showFallback = false;
            
            switch (error.message) {
                case 'API_KEY_NOT_CONFIGURED':
                    tipContent.innerHTML = `
                        <span>Configure your OpenAI API key to get dynamic tips!</span>
                        <button onclick="showApiKeySettings()" class="ml-2 text-blue-500 underline">Settings</button>
                    `;
                    return;
                    
                case 'INVALID_API_KEY_FORMAT':
                    errorMessage = 'Invalid API key format. Please check your API key.';
                    break;
                    
                case 'INVALID_API_KEY':
                    errorMessage = 'Invalid API key. Please verify your OpenAI API key.';
                    break;
                    
                case 'RATE_LIMIT_EXCEEDED':
                    errorMessage = 'Rate limit exceeded. Showing offline tip instead.';
                    showFallback = true;
                    break;
                    
                case 'SERVER_ERROR':
                    errorMessage = 'OpenAI service temporarily unavailable. Showing offline tip.';
                    showFallback = true;
                    break;
                    
                case 'NETWORK_ERROR':
                    errorMessage = 'Network connection issue. Showing offline tip.';
                    showFallback = true;
                    break;
                    
                case 'INVALID_API_RESPONSE':
                    errorMessage = 'Received invalid response from API. Showing offline tip.';
                    showFallback = true;
                    break;
                    
                default:
                    errorMessage = 'Unable to generate tip. Showing offline tip instead.';
                    showFallback = true;
                    break;
            }
            
            if (showFallback) {
                // Show fallback tip with a subtle indication it's offline
                const fallbackTip = getRandomFallbackTip();
                tipContent.innerHTML = `
                    <div class="mb-3">${fallbackTip}</div>
                    <div class="text-xs text-gray-400 font-normal italic">${errorMessage}</div>
                `;
            } else {
                // Show error message with settings link
                tipContent.innerHTML = `
                    <div class="text-sm text-red-500 mb-2">${errorMessage}</div>
                    <button onclick="showApiKeySettings()" class="text-blue-500 underline">Check API Settings</button>
                `;
            }
            
            challengeDisplay.classList.remove("fade-in");
            void challengeDisplay.offsetWidth; // Force reflow
            challengeDisplay.classList.add("fade-in");
        }
    }

    function updateButtonColor(button, newColorClass) {
        const colorClasses = [
            'bg-green-500', 'bg-blue-500', 'bg-orange-500', 
            'bg-red-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-yellow-600'
        ];
        colorClasses.forEach(cls => button.classList.remove(cls));
        button.classList.add(newColorClass);
    }

    function updateButton(button, { text = '', colorClass = '', iconClass = '' }) {
        if (text || iconClass) {
            // Clear existing content
            button.innerHTML = '';
            
            // Create icon element if specified
            if (iconClass) {
                const icon = document.createElement('i');
                icon.className = iconClass + ' mr-2';
                button.appendChild(icon);
            }
            
            // Add text content
            if (text) {
                const textNode = document.createTextNode(text);
                button.appendChild(textNode);
            }
        }
        if (colorClass) updateButtonColor(button, colorClass);
    }

    // Unified Button State Management
    function updateButtonStates() {
        if (timerState.activeTimer === 'work' && timerState.isRunning) {
            // Work timer is running - work button shows "Pause" (orange), break button shows "Start" (green)
            updateButton(startWorkButton, {
                text: 'Pause',
                iconClass: 'fas fa-pause',
                colorClass: "bg-yellow-600"
            });
            updateButton(startBreakButton, {
                text: 'Start',
                iconClass: 'fas fa-play',
                colorClass: "bg-green-500"
            });
            startBreakButton.disabled = false;
        } else if (timerState.activeTimer === 'break' && timerState.isRunning) {
            // Break timer is running - break button shows "Pause" (orange), work button shows "Start" (green)
            updateButton(startBreakButton, {
                text: 'Pause',
                iconClass: 'fas fa-pause',
                colorClass: "bg-yellow-600"
            });
            updateButton(startWorkButton, {
                text: 'Start',
                iconClass: 'fas fa-play',
                colorClass: "bg-green-500"
            });
            startBreakButton.disabled = false;
        } else {
            // No timer running - both buttons show "Start" (green)
            updateButton(startWorkButton, {
                text: 'Start',
                iconClass: 'fas fa-play',
                colorClass: "bg-green-500"
            });
            updateButton(startBreakButton, {
                text: 'Start',
                iconClass: 'fas fa-play',
                colorClass: "bg-green-500"
            });
            startBreakButton.disabled = timerState.activeTimer === null;
        }
    }

    function updateTimerDisplay(time, type) {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (type === 'work') {
            timerDisplay.textContent = formattedTime;
        } else {
            breakTimerDisplay.textContent = formattedTime;
        }
    }

    function updateOpacity(activeTimer) {
        if (activeTimer === 'work') {
            timerDisplay.classList.remove('opacity-50');
            breakTimerDisplay.classList.add('opacity-50');
        } else {
            breakTimerDisplay.classList.remove('opacity-50');
            timerDisplay.classList.add('opacity-50');
        }
    }

    // New Timer Control Functions with Mutual Exclusivity
    function stopCurrentTimer() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        timerState.isRunning = false;
        ambientBackground.style.opacity = 0;
    }

    function startTimer(type) {
        // Stop any currently running timer first
        stopCurrentTimer();
        
        // Set new timer state
        timerState.activeTimer = type;
        timerState.isRunning = true;
        
        // Play start sound
        playStartSound();
        
        if (type === 'work') {
            timer = setInterval(() => {
                if (workTime > 0) {
                    workTime--;
                    updateTimerDisplay(workTime, 'work');
                } else {
                    clearInterval(timer);
                    timer = null;
                    timerState.isRunning = false;
                    
                    // Play completion sound when work timer finishes
                    playCompletionSound();
                    // Celebrate work completion with fireworks and animations
                    celebrateWorkCompletion();
                    
                    // Reset work timer to original value before starting break
                    workTime = selectedWorkTime;
                    updateTimerDisplay(workTime, 'work');
                    
                    // Start break timer after a brief delay to allow animations to complete
                    setTimeout(() => {
                        startBreak();
                    }, 500);
                }
            }, 1000);
            
            updateOpacity('work');
            ambientBackground.style.opacity = 0;
            
        } else if (type === 'break') {
            updateDesignTip();
            
            timer = setInterval(() => {
                if (breakTime > 0) {
                    breakTime--;
                    updateTimerDisplay(breakTime, 'break');
                } else {
                    clearInterval(timer);
                    timer = null;
                    timerState.isRunning = false;
                    
                    // Celebrate break completion with animations
                    celebrateBreakCompletion();
                    
                    // Reset break timer to original value before starting work
                    breakTime = selectedBreakTime;
                    updateTimerDisplay(breakTime, 'break');
                    
                    // Start work timer after a brief delay to allow animations to complete
                    setTimeout(() => {
                        timerState.activeTimer = 'work';
                        timerState.isRunning = true;
                        startTimer('work');
                    }, 500);
                }
            }, 1000);
            
            updateOpacity('break');
            ambientBackground.style.opacity = 1;
        }
        
        // Update button states
        updateButtonStates();
    }

    function pauseTimer() {
        stopCurrentTimer();
        updateButtonStates();
    }

    function startBreak() {
        startTimer('break');
    }

    function resetTimers() {
        stopCurrentTimer();
        
        // Reset timer values
        workTime = selectedWorkTime;
        breakTime = selectedBreakTime;
        
        // Reset state
        timerState.activeTimer = null;
        timerState.isRunning = false;
        
        // Update displays
        updateTimerDisplay(workTime, 'work');
        updateTimerDisplay(breakTime, 'break');
        updateOpacity('work');
        
        // Update button states
        updateButtonStates();
    }

    // Event Listeners Setup
    function setupEventListeners() {
        // Work Timer Length Selection
        const workButtons = document.querySelectorAll('.timer-button');
        workButtons.forEach(button => {
            button.addEventListener('click', () => {
                selectedWorkTime = parseInt(button.dataset.time) * 60;
                workTime = selectedWorkTime;
                updateTimerDisplay(workTime, 'work');
            });
        });

        // Break Timer Length Selection
        const breakButtons = document.querySelectorAll('.break-button');
        breakButtons.forEach(button => {
            button.addEventListener('click', () => {
                selectedBreakTime = parseInt(button.dataset.time) * 60;
                breakTime = selectedBreakTime;
                updateTimerDisplay(breakTime, 'break');
            });
        });

        // Start/Pause Work Timer
        startWorkButton.addEventListener("click", function () {
            if (timerState.activeTimer === 'work' && timerState.isRunning) {
                // Work timer is running, pause it
                pauseTimer();
            } else {
                // Start work timer (this will stop any other running timer)
                startTimer('work');
            }
        });

        // Start/Pause Break Timer
        startBreakButton.addEventListener("click", function () {
            if (timerState.activeTimer === 'break' && timerState.isRunning) {
                // Break timer is running, pause it
                pauseTimer();
            } else {
                // Start break timer (this will stop any other running timer)
                startTimer('break');
            }
        });

        // Reset Button
        resetButton.addEventListener("click", resetTimers);

        // Dark Mode Toggle
        toggleButton.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            updateDarkModeButton();
        });

        // Settings Dropdown Toggle
        const settingsToggle = document.getElementById("settingsToggle");
        const settingsPanel = document.getElementById("settingsPanel");
        const settingsChevron = document.getElementById("settingsChevron");

        if (settingsToggle && settingsPanel && settingsChevron) {
            settingsToggle.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const currentMaxHeight = settingsPanel.style.maxHeight;
                const isOpen = currentMaxHeight && currentMaxHeight !== "0px";
                
                if (isOpen) {
                    // Close the panel
                    settingsPanel.style.maxHeight = "0px";
                    settingsChevron.style.transform = "rotate(0deg)";
                } else {
                    // Open the panel - calculate the actual content height
                    settingsPanel.style.maxHeight = "none";
                    const height = settingsPanel.scrollHeight;
                    settingsPanel.style.maxHeight = "0px";
                    
                    // Force reflow then animate
                    requestAnimationFrame(() => {
                        settingsPanel.style.maxHeight = height + "px";
                        settingsChevron.style.transform = "rotate(180deg)";
                    });
                }
            });
        } else {
            console.warn("Settings dropdown elements not found");
        }
    }

    // Dark Mode Button Update Function
    function updateDarkModeButton() {
        const isDarkMode = document.body.classList.contains("dark-mode");
        
        if (isDarkMode) {
            toggleButton.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
            toggleButton.title = 'Switch to Light Mode';
        } else {
            toggleButton.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
            toggleButton.title = 'Switch to Dark Mode';
        }
    }

    // Font Awesome Loading Check
    function waitForFontAwesome() {
        return new Promise((resolve) => {
            // Check if Font Awesome is already loaded
            if (document.querySelector('.fas, .fa')) {
                resolve();
                return;
            }
            
            // Wait for Font Awesome to load
            const checkInterval = setInterval(() => {
                const testElement = document.createElement('i');
                testElement.className = 'fas fa-play';
                testElement.style.position = 'absolute';
                testElement.style.visibility = 'hidden';
                document.body.appendChild(testElement);
                
                const computedStyle = window.getComputedStyle(testElement);
                const fontFamily = computedStyle.getPropertyValue('font-family');
                
                document.body.removeChild(testElement);
                
                // Font Awesome is loaded when font-family contains "Font Awesome"
                if (fontFamily.includes('Font Awesome') || fontFamily.includes('FontAwesome')) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // Fallback timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 5000);
        });
    }

    // Initialize Application
    async function initializeApp() {
        // Wait for Font Awesome to load
        await waitForFontAwesome();
        
        // Initialize timer displays
        updateTimerDisplay(workTime, 'work');
        updateTimerDisplay(breakTime, 'break');
        
        // Initialize timer state
        timerState.activeTimer = null;
        timerState.isRunning = false;
        
        // Initialize UI
        updateOpacity('work');
        updateButtonStates();
        updateDarkModeButton();
        
        // Setup event listeners
        setupEventListeners();
    }

    // Start the application
    initializeApp();
});
