
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

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { t, setLanguage, language } = useLocalization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: t.toast_error_title, description: t.toast_password_length_error, variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await register(username, email, password);
      toast({ title: t.toast_success_title, description: t.toast_register_success });
      router.push('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: t.toast_register_failed_title,
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
                <CardTitle className="text-2xl">{t.register_title}</CardTitle>
                <CardDescription>{t.register_desc}</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                    <Label htmlFor="username">{t.form_username_label}</Label>
                    <Input
                        id="username"
                        type="text"
                        placeholder="yourusername"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    </div>
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
                    {isLoading ? t.register_button_loading : t.register_button}
                    </Button>
                    <div className="mt-4 text-center text-sm">
                    {t.register_has_account_text}{' '}
                    <Link href="/login" className="underline">
                        {t.register_has_account_link}
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
