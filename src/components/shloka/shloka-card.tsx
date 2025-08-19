import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShlokaRow } from "@/types/shloka.types";

interface ShlokaCardProps {
    shloka: ShlokaRow;
    meaning: string;
    showWordMeaning: boolean;
}

export const ShlokaCard: React.FC<ShlokaCardProps> = ({
    shloka,
    meaning,
    showWordMeaning
}) => (
    <Card className="mb-6">
        <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">
                अध्याय {shloka.Chapter}, श्लोक {shloka.Verse}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
                Chapter {shloka.Chapter}, Verse {shloka.Verse}
            </p>
        </CardHeader>

        <CardContent className="space-y-6">
            {/* Sanskrit Shloka */}
            <div className="text-center">
                <p className="text-2xl font-bold leading-relaxed mb-4 text-primary whitespace-pre-line font-serif">
                    {shloka.Shloka}
                </p>

                <p className="text-lg italic text-muted-foreground whitespace-pre-line leading-relaxed">
                    {shloka.Transliteration}
                </p>
            </div>

            {/* Meaning */}
            <div className="bg-secondary/30 p-6 rounded-lg">
                <h3 className="font-semibold mb-3 text-lg">अर्थ / Meaning:</h3>
                <p className="text-lg leading-relaxed whitespace-pre-line">
                    {meaning}
                </p>
            </div>

            {/* Word by Word Meaning */}
            {showWordMeaning && (
                <div className="bg-accent/30 p-6 rounded-lg">
                    <h3 className="font-semibold mb-3 text-lg">शब्दार्थ / Word by Word Meaning:</h3>
                    <p className="whitespace-pre-line leading-relaxed">
                        {shloka.WordMeaning}
                    </p>
                </div>
            )}
        </CardContent>
    </Card>
);
