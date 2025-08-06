
'use client';

import { Loader2 } from "lucide-react";
import { LogoIcon } from "../icons/logo";
import { cn } from "@/lib/utils";

type LoadingSpinnerProps = {
    text?: string;
    className?: string;
}

export function LoadingSpinner({ text = "Loading...", className }: LoadingSpinnerProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-4 text-muted-foreground", className)}>
            <div className="relative w-16 h-16">
                <LogoIcon className="w-16 h-16 text-accent animate-pulse" />
                <Loader2 className="absolute inset-0 m-auto w-8 h-8 animate-spin-slow" />
            </div>
            <p>{text}</p>
        </div>
    );
}
