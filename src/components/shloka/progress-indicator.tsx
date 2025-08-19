import React from 'react';
import { Slider } from "@/components/ui/slider";

interface ProgressIndicatorProps {
    current: number;
    total: number;
    onChange?: (newIndex: number) => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ current, total, onChange }) => {
    return (
        <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground select-none">
            <span>{current + 1} of {total}</span>
            <div className="w-32">
                <Slider
                    min={0}
                    max={total - 1}
                    value={[current]}
                    onValueChange={val => {
                        if (onChange && val[0] !== current) onChange(val[0]);
                    }}
                    step={1}
                    aria-label="Progress"
                />
            </div>
        </div>
    );
};