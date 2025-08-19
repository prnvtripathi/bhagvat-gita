import { useRef, useCallback } from "react";

export const useSpeech = (voiceRate: number) => {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback(
    (text: string, lang: string, callback?: () => void) => {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = voiceRate;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to find a better voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice =
        voices.find(
          (voice) =>
            voice.lang.startsWith(lang === "hi-IN" ? "hi" : "en") &&
            (voice.name.includes("Google") ||
              voice.name.includes("Microsoft") ||
              voice.name.includes("Neural"))
        ) ||
        voices.find((voice) =>
          voice.lang.startsWith(lang === "hi-IN" ? "hi" : "en")
        );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        if (callback) callback();
      };

      utterance.onerror = (error) => {
        console.error("Speech synthesis error:", error);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [voiceRate]
  );

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  return { speak, stopSpeaking };
};
