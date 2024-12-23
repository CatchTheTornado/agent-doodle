"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader } from "./ui/card";
import { AuthorizeDatabaseForm } from "./authorize-database-form";
import { CreateDatabaseForm } from "./create-database-form";
import { Suspense, useContext, useEffect, useState } from 'react';
import DataLoader from './data-loader';
import { useTheme } from 'next-themes';
import { SaaSContext } from '@/contexts/saas-context';
import { CookieConsentBannerComponent } from '@/components/cookie-consent-banner';
import { SaaSContextLoader } from './saas-context-loader';
import FeedbackWidget from './feedback-widget';
import { useTranslation } from 'react-i18next';

export function AuthorizePopup({ autoLoginInProgress }: { autoLoginInProgress: boolean }) {
  const [applicationLoaded, setApplicationLoaded] = useState(false);
  const { theme, systemTheme } = useTheme();
  const { t } = useTranslation();
  const currentTheme = (theme === 'system' ? systemTheme : theme)
  const saasContext = useContext(SaaSContext);
  const [currentTab, setCurrentTab] = useState('authorize');

  useEffect(() => {
    setApplicationLoaded(true);
  },[]);

  useEffect(() => {
    if (saasContext?.email) {
      const defaultTab = saasContext?.email && ((saasContext?.currentQuota.allowedDatabases - (saasContext?.currentUsage !== null ? saasContext.currentUsage.usedDatabases : 0)) > 0) ? `create` : `authorize`;
      setCurrentTab(defaultTab);
    }
  }, [saasContext?.email]);
  return (
    <div className="p-4 grid items-center justify-center h-screen">
     {!applicationLoaded || autoLoginInProgress ? (<div className="w-96 flex items-center justify-center flex-col"><div className="flex-row h-40 w-40"><img src="/img/agent-doodle-logo.svg" /></div><div><DataLoader /></div></div>):(
      <div>
        <Suspense fallback={<div>{t('Loading SaaSContext...')}</div>}>
          <SaaSContextLoader />
        </Suspense>
        <FeedbackWidget />
        {saasContext?.email ? (
          <div className="text-xs w-96 p-3 border-2 border-green-500 background-green-200 text-sm font-semibold text-green-500">
            {t('Hello ')}{saasContext?.email}{t('! Welcome to Agent Doodle. You can spend ')}{saasContext.currentQuota.allowedUSDBudget}{t('$ for AI requests. Read ')}<a className="underline" target="_blank" href="/content/terms">terms</a>{t(' and ')}<a className="underline" target="_blank" href="/content/privacy">{t('privacy')}</a>{t(' before using the app.')}
          </div>
        ): ((process.env.NEXT_PUBLIC_SAAS_REGISTER_URL && process.env.NEXT_PUBLIC_SAAS) ? (
          <div className="text-xs w-96 p-3 border-2 border-red-500 background-red-200 text-sm font-semibold text-red-500">
            {t('This is a closed beta test period. ')}<a className="underline" href={process.env.NEXT_PUBLIC_SAAS_REGISTER_URL}>{t('Please apply')}</a>{t(' for the beta test to use the application.')}
          </div>
        ) : (null))}
        
        <div className="flex">
          <img alt="Application logo" className="w-16 mr-5" src={currentTheme === 'dark' ? `/img/agent-doodle-logo-white.svg` : `/img/agent-doodle-logo.svg`} />
          <h1 className="text-5xl text-center p-8 pl-0">{t('Agent Doodle')}</h1>
        </div>
        <Tabs defaultValue="authorize" value={currentTab} onValueChange={(value) => setCurrentTab(value)} className="w-96">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="authorize" className="dark:data-[state=active]:bg-zinc-900 data-[state=active]:bg-zinc-100 data-[state=active]:text-gray-200">{t('Log in')}</TabsTrigger>
            <TabsTrigger value="create" className="dark:data-[state=active]:bg-zinc-900 data-[state=active]:bg-zinc-100 data-[state=active]:text-gray-200">{t('Create account')}</TabsTrigger>
          </TabsList>
          <TabsContent value="authorize" className="max-w-600">
            <Card>
              <CardHeader>
              </CardHeader>
              <CardContent className="space-y-2">
                <AuthorizeDatabaseForm />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="create">
            <Card>
              <CardHeader>
              </CardHeader>
              <CardContent className="space-y-2">
                <CreateDatabaseForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
        )}
      <CookieConsentBannerComponent />
    </div>
  )
}