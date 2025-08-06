
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code2 } from "lucide-react";
import { Button } from '@/components/ui/button';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="flex items-center gap-4 mb-8">
                <Code2 className="w-16 h-16 text-accent" />
                <div>
                    <h1 className="text-5xl font-bold">Code Weaver</h1>
                    <p className="text-muted-foreground">The intelligent cloud IDE.</p>
                </div>
            </div>

            <Card className="w-full max-w-md border-border shadow-lg">
                <CardHeader>
                    <CardTitle>Welcome</CardTitle>
                    <CardDescription>Log in or create an account to start weaving your code.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Button size="lg" onClick={() => router.push('/login')}>
                        Login
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => router.push('/register')}>
                        Register
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
