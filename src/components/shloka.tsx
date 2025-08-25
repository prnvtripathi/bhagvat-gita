"use client";

import React, { useEffect, useRef, useState } from "react"
import Papa from "papaparse";
import { Loader2, Play } from "lucide-react";
import { ShlokaRow } from "@/types/shloka.types";
import { useLocalStorage } from "@/hooks/use-local-storage";

// Components
import { ProgressIndicator } from "@/components/shloka/progress-indicator";
import { AudioControls } from "@/components/shloka/audio-controls";
import { LanguageControls } from "@/components/shloka/language-controls";
import { ShlokaCard } from "@/components/shloka/shloka-card";
import { Search } from "@/components/shloka/search";
import { useSpeech } from "@/hooks/use-speech";

export default function Shloka() {

    // State management (persisted)
    const [data, setData] = useLocalStorage<ShlokaRow[]>("gita-data", []);
    const [index, setIndex] = useLocalStorage<number>("gita-index", 0);
    const [language, setLanguage] = useLocalStorage<"hindi" | "english">("gita-language", "english");
    const [showWordMeaning, setShowWordMeaning] = useLocalStorage<boolean>("gita-showWordMeaning", false);
    // Toggle for reciting meaning aloud
    const [reciteMeaningEnabled, setReciteMeaningEnabled] = useLocalStorage<boolean>("gita-reciteMeaningEnabled", true);
    const [isPlaying, setIsPlaying] = useLocalStorage<boolean>("gita-isPlaying", false);
    const [isAutoPlaying, setIsAutoPlaying] = useLocalStorage<boolean>("gita-isAutoPlaying", false);

    const [isLoading, setIsLoading] = useLocalStorage<boolean>("gita-isLoading", true);
    // Audio progress state
    const [audioProgress, setAudioProgress] = useState(0); // seconds
    const [audioDuration, setAudioDuration] = useState(0); // seconds

    // Refs for managing timeouts, audio, and cleanup
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Custom speech hook
    const { speak, stopSpeaking } = useSpeech(1);

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


    // Helper to get S3 audio URL for current shloka
    const getAudioUrl = (row: ShlokaRow) => {
        // Remove leading zeros for S3 path if needed
        const chapter = String(Number(row.Chapter));
        const verse = String(Number(row.Verse));
        return `https://gita-shloka-recitation.s3.ap-south-1.amazonaws.com/gita_audios/${chapter}/${verse}.mp3`;
    };

    // auto-play functionality (audio for verse, then speech for meaning)
    const autoPlayCurrent = () => {
        if (!data[index]) return;
        setIsPlaying(true);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
    };

    // When audio ends, speak the meaning
    const handleAudioEnded = () => {
        setAudioProgress(0);
        if (!isAutoPlaying) {
            setIsPlaying(false);
            return;
        }
        const shloka = data[index];
        const meaning = language === "hindi" ? shloka.HinMeaning : shloka.EngMeaning;
        // Pause before meaning
        timeoutRef.current = setTimeout(() => {
            if (!reciteMeaningEnabled) {
                setIsPlaying(false);
                if (!isAutoPlaying) return;
                // Pause before next shloka
                autoPlayTimeoutRef.current = setTimeout(() => {
                    if (!isAutoPlaying) return;
                    if (index < data.length - 1) {
                        setIndex(prev => prev + 1);
                    } else {
                        setIsAutoPlaying(false);
                        setIsPlaying(false);
                    }
                }, 2000);
                return;
            }
            speak(meaning, language === "hindi" ? "hi-IN" : "en-US", () => {
                setIsPlaying(false);
                if (!isAutoPlaying) return;
                // Pause before next shloka
                autoPlayTimeoutRef.current = setTimeout(() => {
                    if (!isAutoPlaying) return;
                    if (index < data.length - 1) {
                        setIndex(prev => prev + 1);
                    } else {
                        setIsAutoPlaying(false);
                        setIsPlaying(false);
                    }
                }, 2000);
            });
        }, 1000); // 1s pause after audio
    };

    // Audio progress handlers
    const handleAudioTimeUpdate = () => {
        if (audioRef.current) {
            setAudioProgress(audioRef.current.currentTime);
        }
    };
    const handleAudioLoadedMetadata = () => {
        if (audioRef.current) {
            setAudioDuration(audioRef.current.duration);
        }
    };

    // Seek audio
    const handleSeek = (seekTime: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = seekTime;
            setAudioProgress(seekTime);
        }
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
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
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
            setIsAutoPlaying(true);
            autoPlayCurrent();
        }
    };

    // Navigation handlers
    const handlePrevious = () => {
        // Stop any ongoing playback
        setIsAutoPlaying(false);
        stopSpeaking();
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        // Clear timeouts
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
        setIndex(prev => Math.max(prev - 1, 0));
    };

    const handleNext = () => {
        setIsAutoPlaying(false);
        stopSpeaking();
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
        setIndex(prev => Math.min(prev + 1, data.length - 1));
    };


    // Individual recitation handlers
    const handleReciteShloka = () => {
        setIsAutoPlaying(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
        stopSpeaking();
        setIsPlaying(true);
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
    };

    const handleReciteMeaning = () => {
        setIsAutoPlaying(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        stopSpeaking();
        if (!reciteMeaningEnabled) {
            setIsPlaying(false);
            return;
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

    // Handler for recite meaning toggle
    const handleToggleReciteMeaning = (enabled: boolean) => {
        setReciteMeaningEnabled(enabled);
    };



    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
            window.speechSynthesis.cancel();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            setAudioProgress(0);
            setAudioDuration(0);
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
    const audioUrl = getAudioUrl(currentShloka);


    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
            {/* Hidden audio element for verse playback */}
            <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={handleAudioEnded}
                onTimeUpdate={handleAudioTimeUpdate}
                onLoadedMetadata={handleAudioLoadedMetadata}
                preload="auto"
                style={{ display: "none" }}
            />
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent py-3">
                        श्रीमद्भगवद्गीता
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-4">Bhagavad Gita</p>

                    <div className="flex flex-col-reverse md:flex-row mx-auto items-center justify-between gap-y-4">

                        {/* Progress Indicator */}
                        <ProgressIndicator
                            current={index}
                            total={data.length}
                            onChange={(newIndex) => {
                                setIsAutoPlaying(false);
                                setIsPlaying(false);
                                stopSpeaking();
                                if (audioRef.current) {
                                    audioRef.current.pause();
                                    audioRef.current.currentTime = 0;
                                }
                                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                                if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
                                setIndex(newIndex);
                            }}
                        />

                        {/* Search Bar */}
                        <Search
                            data={data}
                            language={language}
                            onResult={(newIndex) => {
                                setIsAutoPlaying(false);
                                setIsPlaying(false);
                                stopSpeaking();
                                if (audioRef.current) {
                                    audioRef.current.pause();
                                    audioRef.current.currentTime = 0;
                                }
                                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                                if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
                                setIndex(newIndex);
                            }}
                        />
                    </div>
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
                            audioProgress={audioProgress}
                            audioDuration={audioDuration}
                            onSeek={handleSeek}
                            reciteMeaningEnabled={reciteMeaningEnabled}
                            onToggleReciteMeaning={handleToggleReciteMeaning}
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