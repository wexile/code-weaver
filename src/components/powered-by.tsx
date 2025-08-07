
'use client';

import { FirebaseLogo } from "./icons/firebase-logo";
import { GeminiLogo } from "./icons/gemini-logo";


export function PoweredBy() {
    return (
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="font-medium">Powered by</span>
            <div className="flex items-center gap-2">
                <FirebaseLogo className="w-5 h-5" />
                <span>Firebase Studio</span>
            </div>
            <div className="flex items-center gap-2">
                <GeminiLogo className="w-5 h-5" />
                <span>Gemini</span>
            </div>
        </div>
    )
}

    