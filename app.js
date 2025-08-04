document.addEventListener('DOMContentLoaded', function () {
    let workTime = 25 * 60;
    let breakTime = 5 * 60;
    let timer;
    let isWork = true;
    let isPaused = false;

    let selectedWorkTime = workTime;
    let selectedBreakTime = breakTime;

    const timerDisplay = document.getElementById("timerDisplay");
    const breakTimerDisplay = document.getElementById("breakTimerDisplay");
    const startWorkButton = document.getElementById("startWorkButton");
    const startBreakButton = document.getElementById("startBreakButton");
    const resetButton = document.getElementById("resetButton");
    const challengeDisplay = document.getElementById("challengeDisplay");
    const ambientBackground = document.getElementById("ambientBackground");

    // Design tips array
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
        "Don’t just reduce clicks — maximize clarity per click.",
        "Microcopy isn’t decoration. Write interface text with tone, pacing, and clarity in mind.",
        "Prototype to test beliefs, not just flows. What’s the riskiest assumption you can invalidate?",
        "Design version 1 with version 3 in mind — leave room for scale, change, and evolution.",
        "Watch what users do, not just what they say. Behavior reveals truth.",
        "Think in systems, not screens. UI is only one surface in the experience.",
        "Visual hierarchy isn't just about size — it’s about flow, contrast, rhythm, and repetition.",
        "Create interfaces that earn user attention, not demand it."
      ];

    function updateDesignTip() {
        const tip = designTips[Math.floor(Math.random() * designTips.length)];
        const tipContent = challengeDisplay.querySelector("div.mt-3");
        if (tipContent) {
            tipContent.textContent = tip;
            challengeDisplay.classList.remove("fade-in");
            void challengeDisplay.offsetWidth; // force reflow
            challengeDisplay.classList.add("fade-in");
        }
    }

    function updateButtonColor(button, newColorClass) {
        const colorClasses = [
            'bg-green-500',
            'bg-blue-500',
            'bg-orange-500',
            'bg-red-500',
            'bg-yellow-500',
            'bg-purple-500',
            'bg-pink-500'
        ];
        colorClasses.forEach(cls => button.classList.remove(cls));
        button.classList.add(newColorClass);
    }

    function updateButton(button, { text = '', colorClass = '' }) {
        if (text) button.textContent = text;
        if (colorClass) updateButtonColor(button, colorClass);
    }

    const workButtons = document.querySelectorAll('.timer-button');
    workButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedWorkTime = parseInt(button.dataset.time) * 60;
            workTime = selectedWorkTime;
            updateTimerDisplay(workTime, 'work');
        });
    });

    const breakButtons = document.querySelectorAll('.break-button');
    breakButtons.forEach(button => {
        button.addEventListener('click', () => {
            selectedBreakTime = parseInt(button.dataset.time) * 60;
            breakTime = selectedBreakTime;
            updateTimerDisplay(breakTime, 'break');
        });
    });

    startWorkButton.addEventListener("click", function () {
        if (isPaused || !timer) {
            startTimer('work');
        } else {
            stopTimer('work');
        }
    });

    startBreakButton.addEventListener("click", function () {
        if (isPaused || !timer) {
            startTimer('break');
        } else {
            stopTimer('break');
        }
    });

    function startTimer(type) {
        if (type === 'work') {
            updateButton(startWorkButton, {
                text: "Pause",
                colorClass: "bg-yellow-600"
            });
    
            // 🔁 Reset break button to default state
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
                    alert("Time's up! Starting Break...");
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
    
            // 🔁 Reset work button to default state
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
                    alert("Break's over! Starting Work...");
                    startTimer('work');
                }
            }, 1000);
    
            updateOpacity('break');
            ambientBackground.style.opacity = 1;
        }
    
        isPaused = false;
    }
    
    const toggleButton = document.getElementById("toggleDarkMode");
    toggleButton.addEventListener("click", () => {
      document.body.classList.toggle("dark-mode");
    
      // Small delay to match CSS transition for smooth UX
      setTimeout(() => {
        toggleButton.textContent = document.body.classList.contains("dark-mode")
          ? "☀️ Light Mode"
          : "🌙 Dark Mode";
      }, 150);
    });

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

    function updateTimerDisplay(time, type) {
        let minutes = Math.floor(time / 60);
        let seconds = time % 60;
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

    resetButton.addEventListener("click", function () {
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
    });

    function startBreak() {
        updateDesignTip();
        startBreakButton.disabled = false;
        startTimer('break');
    }

    // Initial state
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
});
