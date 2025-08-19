import React from 'react';

interface ProgressIndicatorProps {
    current: number;
    total: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ current, total }) => (
    <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
        <span>{current + 1} of {total}</span>
        <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
            <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((current + 1) / total) * 100}%` }}
            />
        </div>
    </div>
);