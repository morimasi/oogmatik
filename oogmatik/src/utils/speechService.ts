export const speechService = {
    synth: typeof window !== 'undefined' ? window.speechSynthesis : null,
    utterance: null as SpeechSynthesisUtterance | null,
    isSpeaking: false,

    speak: (text: string, onEnd?: () => void) => {
        if (!speechService.synth) {
            console.warn("Speech synthesis not supported in this browser.");
            if (onEnd) onEnd();
            return;
        }

        // Cancel any ongoing speech to prevent queueing
        if (speechService.synth.speaking || speechService.isSpeaking) {
            speechService.synth.cancel();
        }

        if (!text) {
            if (onEnd) onEnd();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR'; // Default to Turkish
        utterance.rate = 0.9; // Slightly slower for better clarity
        utterance.pitch = 1;

        // Function to select the best available Turkish voice
        const selectVoice = () => {
            if (!speechService.synth) return;
            const voices = speechService.synth.getVoices();
            
            // Priority 1: Exact Turkish Match
            let voice = voices.find(v => v.lang === 'tr-TR');
            
            // Priority 2: Any Turkish Match
            if (!voice) {
                voice = voices.find(v => v.lang.toLowerCase().includes('tr'));
            }

            // Priority 3: Google Turkish (common in Chrome)
            if (!voice) {
                voice = voices.find(v => v.name.includes('Turkish') || v.name.includes('Türkçe'));
            }

            if (voice) {
                utterance.voice = voice;
            }
        };

        // If voices aren't loaded yet (common in Chrome), wait for them
        if (speechService.synth.getVoices().length === 0) {
            speechService.synth.onvoiceschanged = () => {
                selectVoice();
            };
        } else {
            selectVoice();
        }

        utterance.onstart = () => {
            speechService.isSpeaking = true;
        };

        utterance.onend = () => {
            speechService.isSpeaking = false;
            if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
            // 'interrupted' and 'canceled' are expected when we stop speech manually.
            // We ignore them to prevent console noise.
            if (e.error === 'interrupted' || e.error === 'canceled') {
                speechService.isSpeaking = false;
                return;
            }
            
            console.error("Speech synthesis error:", e.error);
            speechService.isSpeaking = false;
            if (onEnd) onEnd();
        };

        try {
            speechService.utterance = utterance;
            speechService.synth.speak(utterance);
        } catch (err) {
            console.error("Failed to execute speak:", err);
            speechService.isSpeaking = false;
            if (onEnd) onEnd();
        }
    },

    stop: () => {
        if (speechService.synth) {
            speechService.synth.cancel();
            speechService.isSpeaking = false;
        }
    },

    pause: () => {
        if (speechService.synth && speechService.synth.speaking && !speechService.synth.paused) {
            speechService.synth.pause();
        }
    },

    resume: () => {
        if (speechService.synth && speechService.synth.paused) {
            speechService.synth.resume();
        }
    },

    isActive: () => {
        return speechService.synth ? speechService.synth.speaking : false;
    }
};