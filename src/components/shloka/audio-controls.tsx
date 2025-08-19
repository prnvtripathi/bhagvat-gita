import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";

interface AudioControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onReciteShloka: () => void;
    onReciteMeaning: () => void;
    isAutoPlaying: boolean;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
    isPlaying,
    onPlayPause,
    onPrevious,
    onNext,
    onReciteShloka,
    onReciteMeaning,
    isAutoPlaying
}) => (
    <div className="flex flex-col space-y-4">
        {/* Main playback controls */}
        <div className="flex items-center justify-center space-x-2">
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
        </div>

        {/* Individual recitation buttons */}
        <div className="flex items-center justify-center space-x-2">
            <Button variant="secondary" size="sm" onClick={onReciteShloka}>
                <Volume2 className="h-4 w-4 mr-2" />
                Recite Shloka
            </Button>
            <Button variant="secondary" size="sm" onClick={onReciteMeaning}>
                <Volume2 className="h-4 w-4 mr-2" />
                Recite Meaning
            </Button>
        </div>
    </div>
);
