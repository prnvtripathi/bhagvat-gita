
import React, { useState } from "react";
import { ShlokaRow } from "@/types/shloka.types";
import { Input } from "@/components/ui/input";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";

interface SearchProps {
    data: ShlokaRow[];
    language: "hindi" | "english";
    onResult: (index: number) => void;
}

export const Search: React.FC<SearchProps> = ({ data, language, onResult }) => {
    const [chapter, setChapter] = useState("");
    const [verse, setVerse] = useState("");
    const [query, setQuery] = useState("");
    const [error, setError] = useState("");

    // Search by chapter and verse
    const handleChapterVerseSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!chapter || !verse) {
            setError("Please enter both chapter and verse.");
            return;
        }
        const idx = data.findIndex(
            (row) => String(Number(row.Chapter)) === String(Number(chapter)) && String(Number(row.Verse)) === String(Number(verse))
        );
        if (idx !== -1) {
            onResult(idx);
        } else {
            setError("No shloka found for this chapter and verse.");
        }
    };


    return (
        <div className="flex flex-col items-center justify-center">
            {/* Chapter & Verse Search */}
            <form onSubmit={handleChapterVerseSearch} className="flex gap-2 items-center">
                <Input
                    type="number"
                    min={"1"}
                    max={"18"}
                    placeholder="Chapter"
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    className="w-28"
                />
                <span className="text-gray-500">:</span>
                <Input
                    type="number"
                    min={"1"}
                    max={"78"}
                    placeholder="Verse"
                    value={verse}
                    onChange={(e) => setVerse(e.target.value)}
                    className="w-28"
                />
                <Button type="submit" variant={"outline"} size={"icon"} className="ml-2 px-3 py-1">
                    <ChevronRight />
                </Button>
            </form>
            {error && <div className="text-red-500 text-sm mt-2 w-full text-center">{error}</div>}
        </div>
    );
};
