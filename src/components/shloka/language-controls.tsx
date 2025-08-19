import React from 'react';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ModeToggle } from '../ui/mode-toggle';

interface LanguageControlsProps {
    language: "hindi" | "english";
    onLanguageChange: (lang: "hindi" | "english") => void;
    showWordMeaning: boolean;
    onToggleWordMeaning: (show: boolean) => void;
    voiceRate: number;
    onVoiceRateChange: (rate: number) => void;
}

export const LanguageControls: React.FC<LanguageControlsProps> = ({
    language,
    onLanguageChange,
    showWordMeaning,
    onToggleWordMeaning,
    voiceRate,
    onVoiceRateChange
}) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-lg">Settings</CardTitle>
            <CardAction>
                <ModeToggle />
            </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
                <Label htmlFor="language-select">Meaning Language</Label>
                <Select value={language} onValueChange={onLanguageChange}>
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="hindi">हिंदी</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-between">
                <Label htmlFor="word-meaning">Show Word Meaning</Label>
                <Switch
                    id="word-meaning"
                    checked={showWordMeaning}
                    onCheckedChange={onToggleWordMeaning}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label htmlFor="voice-rate">Speech Rate</Label>
                <Select value={voiceRate.toString()} onValueChange={(value) => onVoiceRateChange(Number(value))}>
                    <SelectTrigger className="w-20">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="0.5">0.5x</SelectItem>
                        <SelectItem value="0.8">0.8x</SelectItem>
                        <SelectItem value="1">1x</SelectItem>
                        <SelectItem value="1.2">1.2x</SelectItem>
                        <SelectItem value="1.5">1.5x</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
    </Card>
);
