'use client'

import initTranslations from '@/app/i18n';
import TranslationProvider from '@/app/translation-provider';
import AuthorizationGuard from '@/components/authorization-guard';
import { AgentHeader } from '@/components/layout/agent-header';
import { AgentSidebar } from '@/components/layout/agent-sidebar';
import { Header } from '@/components/layout/header';
import { AgentProvider, useAgentContext } from '@/contexts/agent-context';
import { AuditContextProvider } from '@/contexts/audit-context';
import { ConfigContextProvider } from '@/contexts/config-context';
import { DatabaseContextProvider } from '@/contexts/db-context';
import { KeyContextProvider } from '@/contexts/key-context';
import { SaaSContextProvider } from '@/contexts/saas-context';
import { StatsContextProvider } from '@/contexts/stats-context';

const i18nNamespaces = ['translation'];

// eslint-disable-next-line @next/next/no-async-client-component
export default async function GeneralAgentLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string, locale: string };
}) {
  const { resources } = await initTranslations(params.locale, i18nNamespaces);

  return (
    <TranslationProvider locale={params.locale} resources={resources} namespaces={i18nNamespaces}>
    <DatabaseContextProvider>
      <SaaSContextProvider>
        <ConfigContextProvider>
          <AuditContextProvider>
            <AuthorizationGuard>
              <KeyContextProvider>
                <StatsContextProvider>
                  <AgentProvider>
                    <div className="flex h-screen flex-col">
                      <Header />
                      <AgentHeader />
                      <div className="flex flex-1 overflow-hidden">
                        <AgentSidebar />
                        <main className="flex-1 overflow-auto p-6">
                          {children}
                        </main>
                      </div>
                    </div>
                  </AgentProvider>
                </StatsContextProvider>
              </KeyContextProvider>
            </AuthorizationGuard>
          </AuditContextProvider>
        </ConfigContextProvider>
      </SaaSContextProvider>
    </DatabaseContextProvider>
    </TranslationProvider>
  );
}