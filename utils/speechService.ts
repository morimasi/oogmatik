
export const speechService = {
    synth: window.speechSynthesis,
    utterance: null as SpeechSynthesisUtterance | null,
    isSpeaking: false,

    speak: (text: string, onEnd?: () => void) => {
        if (speechService.synth.speaking) {
            speechService.synth.cancel();
        }

        if (!text) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR'; // Turkish priority
        utterance.rate = 0.9; // Slightly slower for clarity
        utterance.pitch = 1;

        // Try to find a Turkish voice
        const voices = speechService.synth.getVoices();
        const trVoice = voices.find(v => v.lang.includes('tr'));
        if (trVoice) utterance.voice = trVoice;

        utterance.onend = () => {
            speechService.isSpeaking = false;
            if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
            console.error("Speech error", e);
            speechService.isSpeaking = false;
        };

        speechService.utterance = utterance;
        speechService.isSpeaking = true;
        speechService.synth.speak(utterance);
    },

    stop: () => {
        if (speechService.synth.speaking) {
            speechService.synth.cancel();
            speechService.isSpeaking = false;
        }
    },

    pause: () => {
        if (speechService.synth.speaking && !speechService.synth.paused) {
            speechService.synth.pause();
        }
    },

    resume: () => {
        if (speechService.synth.paused) {
            speechService.synth.resume();
        }
    },

    isActive: () => speechService.synth.speaking
};
