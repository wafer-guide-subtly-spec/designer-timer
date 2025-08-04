document.addEventListener('DOMContentLoaded', function () {
    // Timer State Variables
    let workTime = 25 * 60;
    let breakTime = 5 * 60;
    let timer;
    let isWork = true;
    let isPaused = false;
    let selectedWorkTime = workTime;
    let selectedBreakTime = breakTime;

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

    // Design Tips Collection
    const designTips = [
        "Design for systemic change, not just screens. Map how your UI affects behavior across the entire ecosystem.",
        "State transitions matter more than static states. Design how things change, not just what they look like.",
        "Every design is a policy. Ask: what behaviors does this interface reward or discourage?",
        "Favor recognition over recall — but teach recall when mastery matters (e.g. in expert tools).",
        "Use progressive disclosure not just for hierarchy, but to time cognitive load effectively.",
        "Add intentional friction where it increases engagement, reflection, or safety.",
        "Design with temporal gradients — think about how expectations shift over time, not just in flow.",
        "Use elevation and shadow to express intent and focus, not just visual depth.",
        "Color is a functional language — use it to communicate urgency, system state, or emotion.",
        "Motion is grammar: timing and easing convey relationship and hierarchy.",
        "Design the apology state. Empty, error, and fail states are moments for trust repair.",
        "Make exits as clear as entries. Great UX supports graceful opt-out or undo paths.",
        "Don't just reduce clicks — maximize clarity per click.",
        "Microcopy isn't decoration. Write interface text with tone, pacing, and clarity in mind.",
        "Prototype to test beliefs, not just flows. What's the riskiest assumption you can invalidate?",
        "Design version 1 with version 3 in mind — leave room for scale, change, and evolution.",
        "Watch what users do, not just what they say. Behavior reveals truth.",
        "Think in systems, not screens. UI is only one surface in the experience.",
        "Visual hierarchy isn't just about size — it's about flow, contrast, rhythm, and repetition.",
        "Create interfaces that earn user attention, not demand it."
    ];

    // Utility Functions
    function updateDesignTip() {
        const tip = designTips[Math.floor(Math.random() * designTips.length)];
        const tipContent = challengeDisplay.querySelector("div.mt-3");
        if (tipContent) {
            tipContent.textContent = tip;
            challengeDisplay.classList.remove("fade-in");
            void challengeDisplay.offsetWidth; // Force reflow
            challengeDisplay.classList.add("fade-in");
        }
    }

    function updateButtonColor(button, newColorClass) {
        const colorClasses = [
            'bg-green-500', 'bg-blue-500', 'bg-orange-500', 
            'bg-red-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'
        ];
        colorClasses.forEach(cls => button.classList.remove(cls));
        button.classList.add(newColorClass);
    }

    function updateButton(button, { text = '', colorClass = '' }) {
        if (text) button.textContent = text;
        if (colorClass) updateButtonColor(button, colorClass);
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

    // Timer Control Functions
    function startTimer(type) {
        if (type === 'work') {
            // Play start sound when work timer begins
            playStartSound();
            
            updateButton(startWorkButton, {
                text: "Pause",
                colorClass: "bg-yellow-600"
            });

            updateButton(startBreakButton, {
                text: "Start",
                colorClass: "bg-green-500"
            });

            isWork = true;

            timer = setInterval(() => {
                if (workTime > 0) {
                    workTime--;
                    updateTimerDisplay(workTime, 'work');
                } else {
                    clearInterval(timer);
                    timer = null;
                    // Play completion sound when work timer finishes
                    playCompletionSound();
                    startBreak();
                }
            }, 1000);

            startBreakButton.disabled = false;
            updateOpacity('work');
            ambientBackground.style.opacity = 0;

        } else if (type === 'break') {
            updateButton(startBreakButton, {
                text: "Pause",
                colorClass: "bg-yellow-600"
            });

            updateButton(startWorkButton, {
                text: "Start",
                colorClass: "bg-green-500"
            });

            isWork = false;
            updateDesignTip();

            timer = setInterval(() => {
                if (breakTime > 0) {
                    breakTime--;
                    updateTimerDisplay(breakTime, 'break');
                } else {
                    clearInterval(timer);
                    timer = null;
                    startTimer('work');
                }
            }, 1000);

            updateOpacity('break');
            ambientBackground.style.opacity = 1;
        }

        isPaused = false;
    }

    function stopTimer(type) {
        clearInterval(timer);
        timer = null;
        
        if (type === 'work') {
            updateButton(startWorkButton, {
                text: "Start",
                colorClass: "bg-green-500"
            });
        } else if (type === 'break') {
            updateButton(startBreakButton, {
                text: "Start",
                colorClass: "bg-green-500"
            });
        }
        
        isPaused = true;
        ambientBackground.style.opacity = 0;
    }

    function startBreak() {
        updateDesignTip();
        startBreakButton.disabled = false;
        startTimer('break');
    }

    function resetTimers() {
        workTime = selectedWorkTime;
        breakTime = selectedBreakTime;
        clearInterval(timer);
        timer = null;
        
        updateTimerDisplay(workTime, 'work');
        updateTimerDisplay(breakTime, 'break');

        updateButton(startWorkButton, {
            text: "Start",
            colorClass: "bg-green-500"
        });
        updateButton(startBreakButton, {
            text: "Start",
            colorClass: "bg-green-500"
        });

        startBreakButton.disabled = true;
        isPaused = false;
        isWork = true;
        updateOpacity('work');
        ambientBackground.style.opacity = 0;
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
            if (isPaused || !timer) {
                startTimer('work');
            } else {
                stopTimer('work');
            }
        });

        // Start/Pause Break Timer
        startBreakButton.addEventListener("click", function () {
            if (isPaused || !timer) {
                startTimer('break');
            } else {
                stopTimer('break');
            }
        });

        // Reset Button
        resetButton.addEventListener("click", resetTimers);

        // Dark Mode Toggle
        toggleButton.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            updateDarkModeButton();
        });
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

    // Initialize Application
    function initializeApp() {
        updateTimerDisplay(workTime, 'work');
        updateTimerDisplay(breakTime, 'break');
        
        updateButton(startWorkButton, {
            text: "Start",
            colorClass: "bg-green-500"
        });
        updateButton(startBreakButton, {
            text: "Start",
            colorClass: "bg-green-500"
        });
        
        startBreakButton.disabled = true;
        updateDarkModeButton(); // Initialize dark mode button text and icon
        setupEventListeners();
    }

    // Start the application
    initializeApp();
});
