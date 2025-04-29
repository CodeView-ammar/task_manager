import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Languages, Settings, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const profileSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  language: z.enum(["en", "ar"]),
  rtl: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user, updateProfileMutation } = useAuth();
  const { t } = useI18n();
  const [isClient, setIsClient] = useState(false);
  
  // Initialize form after user data is loaded on the client
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      language: "en",
      rtl: false,
    },
  });
  
  // Set initial form values once user data is available
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        language: user.language as "en" | "ar",
        rtl: user.rtl,
      });
    }
  }, [user, form]);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  function onSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 md:ml-14 lg:ml-64">
        <Header />
        <main className="container py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold gradient-heading">{t('profile.title')}</h1>
            <p className="text-muted-foreground">{t('profile.subtitle')}</p>
          </div>
          
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="account">
                <User className="h-4 w-4 mr-2" />
                {t('profile.account')}
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <Settings className="h-4 w-4 mr-2" />
                {t('profile.preferences')}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="account">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.basicInfo')}</CardTitle>
                    <CardDescription>{t('profile.basicInfoDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form id="profile-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profile.name')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('profile.namePlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('profile.email')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('profile.emailPlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </form>
                    </Form>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button 
                      type="submit" 
                      form="profile-form" 
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('profile.saving')}
                        </span>
                      ) : (
                        t('profile.saveChanges')
                      )}
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>{t('profile.accountInfo')}</CardTitle>
                    <CardDescription>{t('profile.accountInfoDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t('profile.username')}
                      </span>
                      <span className="font-medium">{user?.username}</span>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
                      <span className="text-sm font-medium text-muted-foreground">
                        {t('profile.accountId')}
                      </span>
                      <span className="font-mono text-sm">{user?.id}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-primary" />
                    <CardTitle>{t('profile.languageSettings')}</CardTitle>
                  </div>
                  <CardDescription>{t('profile.languageSettingsDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form id="language-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('profile.language')}</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('profile.selectLanguage')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="ar">العربية</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              {t('profile.languageDesc')}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="rtl"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                {t('profile.rtlMode')}
                              </FormLabel>
                              <FormDescription>
                                {t('profile.rtlModeDesc')}
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    type="submit" 
                    form="language-form" 
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('profile.saving')}
                      </span>
                    ) : (
                      t('profile.saveChanges')
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
