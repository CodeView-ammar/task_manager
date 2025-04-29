import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/use-i18n";
import { Redirect } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, AtSign, User, Key, LogIn, UserPlus, Globe } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6).max(100),
  passwordConfirm: z.string().min(6),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords don't match",
  path: ["passwordConfirm"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const [authTab, setAuthTab] = useState<string>("login");
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      passwordConfirm: "",
      email: "",
      name: "",
      language: "en",
      rtl: false,
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { passwordConfirm, ...registerData } = data;
    registerMutation.mutate(registerData);
  };
  
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  // Redirect if the user is already authenticated
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-muted-foreground absolute top-4 right-4" 
        onClick={toggleLanguage}
      >
        <Globe className="h-5 w-5" />
      </Button>
      
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold gradient-heading">{t('app.title')}</h1>
            </div>
          </div>
          
          <Tabs value={authTab} onValueChange={setAuthTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="register">{t('auth.register')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>{t('auth.welcomeBack')}</CardTitle>
                  <CardDescription>{t('auth.loginDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.username')}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input className="pl-10" placeholder={t('auth.usernamePlaceholder')} {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.password')}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input className="pl-10" type="password" placeholder={t('auth.passwordPlaceholder')} {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('auth.loggingIn')}
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <LogIn className="mr-2 h-5 w-5" />
                            {t('auth.login')}
                          </span>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-muted-foreground">
                    {t('auth.noAccount')}{' '}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setAuthTab("register")}
                    >
                      {t('auth.registerHere')}
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>{t('auth.createAccount')}</CardTitle>
                  <CardDescription>{t('auth.registerDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.fullName')}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input className="pl-10" placeholder={t('auth.fullNamePlaceholder')} {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.email')}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input className="pl-10" type="email" placeholder={t('auth.emailPlaceholder')} {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('auth.username')}</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input className="pl-10" placeholder={t('auth.usernamePlaceholder')} {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.password')}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  <Input className="pl-10" type="password" placeholder={t('auth.passwordPlaceholder')} {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="passwordConfirm"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  <Input className="pl-10" type="password" placeholder={t('auth.confirmPasswordPlaceholder')} {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t('auth.creatingAccount')}
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <UserPlus className="mr-2 h-5 w-5" />
                            {t('auth.createAccount')}
                          </span>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-muted-foreground">
                    {t('auth.alreadyAccount')}{' '}
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => setAuthTab("login")}
                    >
                      {t('auth.loginHere')}
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <div className="hidden md:block md:w-1/2 bg-gradient-to-r from-primary to-blue-600 text-white p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-4xl font-bold mb-6">{t('auth.heroTitle')}</h2>
          <p className="text-lg opacity-90 mb-8">{t('auth.heroSubtitle')}</p>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <CheckSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">{t('auth.featureTitle1')}</h3>
                <p className="opacity-80">{t('auth.featureDesc1')}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <CheckSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">{t('auth.featureTitle2')}</h3>
                <p className="opacity-80">{t('auth.featureDesc2')}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <CheckSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xl">{t('auth.featureTitle3')}</h3>
                <p className="opacity-80">{t('auth.featureDesc3')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
