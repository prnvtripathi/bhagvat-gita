"use client";

import React, { useEffect, useRef } from "react";
import Papa from "papaparse";
import { Loader2, Play } from "lucide-react";
import { ShlokaRow } from "@/types/shloka.types";
import { useLocalStorage } from "@/hooks/use-local-storage";

// Components
import { ProgressIndicator } from "@/components/shloka/progress-indicator";
import { AudioControls } from "@/components/shloka/audio-controls";
import { LanguageControls } from "@/components/shloka/language-controls";
import { ShlokaCard } from "@/components/shloka/shloka-card";
import { useSpeech } from "@/hooks/use-speech";

export default function Shloka() {

    // State management (persisted)
    const [data, setData] = useLocalStorage<ShlokaRow[]>("gita-data", []);
    const [index, setIndex] = useLocalStorage<number>("gita-index", 0);
    const [language, setLanguage] = useLocalStorage<"hindi" | "english">("gita-language", "english");
    const [showWordMeaning, setShowWordMeaning] = useLocalStorage<boolean>("gita-showWordMeaning", false);
    const [isPlaying, setIsPlaying] = useLocalStorage<boolean>("gita-isPlaying", false);
    const [isAutoPlaying, setIsAutoPlaying] = useLocalStorage<boolean>("gita-isAutoPlaying", false);
    const [voiceRate, setVoiceRate] = useLocalStorage<number>("gita-voiceRate", 1);
    const [isLoading, setIsLoading] = useLocalStorage<boolean>("gita-isLoading", true);

    // Refs for managing timeouts and cleanup
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Custom speech hook
    const { speak, stopSpeaking } = useSpeech(voiceRate);

    // Load CSV data on component mount
    useEffect(() => {
        if (data.length > 0) {
            setIsLoading(false);
            return;
        }
        const loadData = async () => {
            try {
                Papa.parse("/csv/gita.csv", {
                    download: true,
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: false,
                    complete: (results) => {
                        if (results.errors.length > 0) {
                            console.warn("CSV parsing warnings:", results.errors);
                        }
                        const validData = (results.data as ShlokaRow[]).filter(
                            row => row.Shloka && row.Chapter && row.Verse
                        );
                        setData(validData);
                        setIsLoading(false);
                    },
                    error: (error) => {
                        console.error("Error loading CSV:", error);
                        setIsLoading(false);
                    }
                });
            } catch (error) {
                console.error("Failed to load shloka data:", error);
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // auto-play functionality
    const autoPlayCurrent = () => {
        if (!data[index]) return;

        const shloka = data[index];
        const meaning = language === "hindi" ? shloka.HinMeaning : shloka.EngMeaning;

        const shlokaText = data[index].Shloka.split('||')[0].trim();
        const cleanShloka = shlokaText.replace(/\|/g, '').trim();


        // First recite the shloka
        setIsPlaying(true);
        speak(cleanShloka, "hi-IN", () => {
            if (!isAutoPlaying) return; // Check if still auto-playing

            // Pause between shloka and meaning
            timeoutRef.current = setTimeout(() => {
                if (!isAutoPlaying) return;

                // Recite the meaning
                speak(meaning, language === "hindi" ? "hi-IN" : "en-US", () => {
                    if (!isAutoPlaying) return;

                    setIsPlaying(false);

                    // Pause before next shloka
                    autoPlayTimeoutRef.current = setTimeout(() => {
                        if (!isAutoPlaying) return;

                        if (index < data.length - 1) {
                            setIndex(prev => prev + 1);
                        } else {
                            // Reached the end, stop auto-playing
                            setIsAutoPlaying(false);
                            setIsPlaying(false);
                        }
                    }, 2000); // 2 second pause before next shloka
                });
            }, 1500); // 1.5 second pause between shloka and meaning
        });
    };

    // Handle auto-play when index changes during auto-play mode
    useEffect(() => {
        if (isAutoPlaying && data.length > 0 && !isPlaying) {
            // Small delay before starting next shloka to prevent rapid firing
            const delay = setTimeout(() => {
                autoPlayCurrent();
            }, 500);

            return () => clearTimeout(delay);
        }
    }, [index, isAutoPlaying, language, data]);

    // Main play/pause handler
    const handlePlayPause = () => {
        if (isAutoPlaying) {
            // Stop auto-playing
            setIsAutoPlaying(false);
            setIsPlaying(false);
            stopSpeaking();

            // Clear all timeouts
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (autoPlayTimeoutRef.current) {
                clearTimeout(autoPlayTimeoutRef.current);
                autoPlayTimeoutRef.current = null;
            }
        } else {
            // Start auto-playing
            setIsAutoPlaying(true);
            autoPlayCurrent();
        }
    };

    // Navigation handlers
    const handlePrevious = () => {
        // Stop any ongoing playback
        if (isAutoPlaying) {
            setIsAutoPlaying(false);
            stopSpeaking();
            setIsPlaying(false);
        }

        // Clear timeouts
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);

        // Navigate to previous shloka
        setIndex(prev => Math.max(prev - 1, 0));
    };

    const handleNext = () => {
        // Stop any ongoing playback
        if (isAutoPlaying) {
            setIsAutoPlaying(false);
            stopSpeaking();
            setIsPlaying(false);
        }

        // Clear timeouts
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);

        // Navigate to next shloka
        setIndex(prev => Math.min(prev + 1, data.length - 1));
    };

    // Individual recitation handlers
    const handleReciteShloka = () => {
        // Stop auto-play if active
        if (isAutoPlaying) {
            setIsAutoPlaying(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
        }

        setIsPlaying(true);
        const shlokaText = data[index].Shloka.split('||')[0].trim();
        const cleanShloka = shlokaText.replace(/\|/g, '').trim();
        speak(cleanShloka, "hi-IN", () => {
            setIsPlaying(false);
        });
    };

    const handleReciteMeaning = () => {
        // Stop auto-play if active
        if (isAutoPlaying) {
            setIsAutoPlaying(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
        }

        const meaning = language === "hindi" ? data[index].HinMeaning : data[index].EngMeaning;
        setIsPlaying(true);
        speak(meaning, language === "hindi" ? "hi-IN" : "en-US", () => {
            setIsPlaying(false);
        });
    };

    // Settings handlers
    const handleLanguageChange = (newLanguage: "hindi" | "english") => {
        setLanguage(newLanguage);
    };

    const handleToggleWordMeaning = (show: boolean) => {
        setShowWordMeaning(show);
    };

    const handleVoiceRateChange = (rate: number) => {
        setVoiceRate(rate);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Clean up all timeouts and speech synthesis
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
            window.speechSynthesis.cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Add keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    handlePlayPause();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    handlePrevious();
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    handleNext();
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAutoPlaying, index, data.length]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
                    <p className="text-lg text-muted-foreground">Loading Bhagavad Gita...</p>
                    <p className="text-sm text-muted-foreground mt-2">Please wait while we prepare the sacred texts</p>
                </div>
            </div>
        );
    }

    // Error state
    if (data.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Failed to Load Shloka Data</h2>
                    <p className="text-muted-foreground mb-4">Please ensure the CSV file is properly placed in the public/csv/ directory.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const currentShloka = data[index];
    const currentMeaning = language === "hindi" ? currentShloka.HinMeaning : currentShloka.EngMeaning;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent py-3">
                        श्रीमद्भगवद्गीता
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-4">Bhagavad Gita</p>

                    {/* Progress Indicator */}
                    <ProgressIndicator
                        current={index}
                        total={data.length}
                        onChange={(newIndex) => {
                            // Stop any ongoing playback if user seeks
                            if (isAutoPlaying) {
                                setIsAutoPlaying(false);
                                setIsPlaying(false);
                                stopSpeaking();
                                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                                if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
                            }
                            setIndex(newIndex);
                        }}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Shloka Content - Takes 2/3 of the space on large screens */}
                    <div className="lg:col-span-2">
                        <ShlokaCard
                            shloka={currentShloka}
                            meaning={currentMeaning}
                            showWordMeaning={showWordMeaning}
                        />
                    </div>

                    {/* Settings Panel - Takes 1/3 of the space on large screens */}
                    <div className="lg:col-span-1 flex md:flex-col flex-col-reverse gap-3">
                        <LanguageControls
                            language={language}
                            onLanguageChange={handleLanguageChange}
                            showWordMeaning={showWordMeaning}
                            onToggleWordMeaning={handleToggleWordMeaning}
                            voiceRate={voiceRate}
                            onVoiceRateChange={handleVoiceRateChange}
                        />

                        {/* Audio Controls */}
                        <AudioControls
                            isPlaying={isPlaying}
                            onPlayPause={handlePlayPause}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            onReciteShloka={handleReciteShloka}
                            onReciteMeaning={handleReciteMeaning}
                            isAutoPlaying={isAutoPlaying}
                        />
                    </div>
                </div>

                {/* Auto-play Status Indicator */}
                {isAutoPlaying && (
                    <div className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 animate-pulse">
                        <Play className="h-4 w-4" />
                        <span className="text-sm font-medium">Auto-playing...</span>
                    </div>
                )}

                {/* Keyboard shortcuts info */}
                <div className="mt-8 text-center text-sm text-muted-foreground">
                    <p>Use arrow keys for navigation • Space bar for play/pause</p>
                </div>
            </div>
        </div>
    );


}