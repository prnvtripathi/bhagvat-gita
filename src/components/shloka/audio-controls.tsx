import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Card, CardFooter, CardHeader } from '../ui/card';
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

interface AudioControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onReciteShloka: () => void;
    onReciteMeaning: () => void;
    isAutoPlaying: boolean;
    audioProgress: number;
    audioDuration: number;
    onSeek: (seekTime: number) => void;
    reciteMeaningEnabled: boolean;
    onToggleReciteMeaning: (enabled: boolean) => void;
}


export const AudioControls: React.FC<AudioControlsProps> = ({
    isPlaying,
    onPlayPause,
    onPrevious,
    onNext,
    onReciteShloka,
    onReciteMeaning,
    isAutoPlaying,
    audioProgress,
    audioDuration,
    onSeek,
    reciteMeaningEnabled,
    onToggleReciteMeaning
}) => {
    // Format time as mm:ss
    const formatTime = (s: number) => {
        if (!isFinite(s)) return "0:00";
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, "0")}`;
    };

    // Handle click on progress bar for seeking
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!audioDuration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = Math.min(Math.max(x / rect.width, 0), 1);
        onSeek(percent * audioDuration);
    };

    return (
        <Card>
            {/* Audio progress bar */}
            <div className="px-4 pt-4 pb-2 select-none">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-8 text-right">
                        {formatTime(audioProgress)}
                    </span>
                    <div
                        className="flex-1 cursor-pointer"
                        onClick={handleProgressClick}
                        title="Seek"
                    >
                        <Progress value={audioDuration ? (audioProgress / audioDuration) * 100 : 0} />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">
                        {formatTime(audioDuration)}
                    </span>
                </div>
            </div>

            {/* Recite Meaning Toggle */}
            <div className="flex items-center justify-between gap-2 px-4 pb-2">
                <label htmlFor="recite-meaning-toggle" className="text-sm font-medium">Recite Meaning</label>
                <Switch
                    id="recite-meaning-toggle"
                    checked={reciteMeaningEnabled}
                    onCheckedChange={onToggleReciteMeaning}
                />
            </div>

            {/* Main playback controls */}
            <CardHeader className="flex items-center justify-center space-x-2">
                <Button variant="outline" size="icon" onClick={onPrevious}>
                    <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                    size="icon"
                    onClick={onPlayPause}
                    className="h-12 w-12"
                    variant={isAutoPlaying ? "default" : "outline"}
                >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>

                <Button variant="outline" size="icon" onClick={onNext}>
                    <SkipForward className="h-4 w-4" />
                </Button>
            </CardHeader>

            {/* Individual recitation buttons */}
            <CardFooter className="flex items-center justify-center space-x-2">
                <Button variant="secondary" size="sm" onClick={onReciteShloka}>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Recite Shloka
                </Button>
                <Button variant="secondary" size="sm" onClick={onReciteMeaning}>
                    <Volume2 className="h-4 w-4 mr-2" />
                    Recite Meaning
                </Button>
            </CardFooter>
        </Card>
    );
};
