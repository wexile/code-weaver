
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { PoweredBy } from '@/components/powered-by';
import { useLocalization } from '@/hooks/use-localization';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appLanguages } from '@/lib/locales';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t, setLanguage, language } = useLocalization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      toast({ title: t.toast_success_title, description: t.toast_login_success });
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast({
        title: t.toast_login_failed_title,
        description: error.message || t.toast_unexpected_error,
        variant: 'destructive',
      });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center">
             <div className="absolute top-4 right-4">
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                        {appLanguages.map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Card className="w-full max-w-sm">
                <CardHeader>
                <CardTitle className="text-2xl">{t.login_title}</CardTitle>
                <CardDescription>{t.login_desc}</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                    <Label htmlFor="email">{t.form_email_label}</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="password">{t.form_password_label}</Label>
                    <Input 
                        id="password" 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    </div>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? t.login_button_loading : t.login_button}
                    </Button>
                    <div className="mt-4 text-center text-sm">
                    {t.login_no_account_text}{' '}
                    <Link href="/register" className="underline">
                        {t.login_no_account_link}
                    </Link>
                    </div>
                </CardFooter>
                </form>
            </Card>
            <div className="mt-8">
                <PoweredBy />
            </div>
      </div>
    </div>
  );
}
