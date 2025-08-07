
'use client';

import { GeminiStar } from "../icons/gemini-star";

export default function GeminiLoadingAnimation() {
    return (
        <div className="flex items-center w-full gap-3">
            <GeminiStar className="w-5 h-5 text-blue-400" />
            <div className="flex flex-col flex-grow gap-2">
                <span className="text-sm font-medium text-blue-300">Thinking...</span>
                <div className="relative w-full h-1 overflow-hidden rounded-full bg-blue-500/30">
                    <div className="absolute top-0 left-0 h-full w-full bg-white opacity-40 animate-progress-bar" />
                </div>
            </div>
        </div>
    );
}
