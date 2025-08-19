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
}

export const LanguageControls: React.FC<LanguageControlsProps> = ({
    language,
    onLanguageChange,
    showWordMeaning,
    onToggleWordMeaning
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


        </CardContent>
    </Card>
);
