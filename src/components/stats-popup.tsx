import { useContext, useEffect, useState } from "react";
import FolderItem from "./folder-item";
import { FolderContext } from "@/contexts/folder-context";
import { DatabaseAuthStatus, DataLoadingStatus } from "@/data/client/models";
import DataLoader from "./data-loader";
import { ConfigContext } from "@/contexts/config-context";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { CurrencyIcon, DollarSignIcon, FoldersIcon, LineChartIcon, ListIcon, PlusIcon, Terminal, User2Icon, Users, UserX2Icon } from "lucide-react";
import { Credenza, CredenzaContent, CredenzaDescription, CredenzaHeader, CredenzaTitle, CredenzaTrigger } from "./credenza";
import { Button } from "./ui/button";
import DatabaseLinkAlert from "./shared/database-link-alert";
import { FolderEditPopup } from "./folder-edit-popup";
import { NoRecordsAlert } from "./shared/no-records-alert";
import { DatabaseContext } from "@/contexts/db-context";
import { ChatContext } from "@/contexts/chat-context";
import { AggregatedStatsDTO } from "@/data/dto";
import { toast } from "sonner";
import { SaaSContext } from "@/contexts/saas-context";
import Link from "next/link";
import { useTranslation } from "react-i18next";
export function roundToTwoDigits(num: number): number {
  return Math.round(num * 100) / 100;
}
export default function StatsPopup() {
  const dbContext = useContext(DatabaseContext);
  const chatContext = useContext(ChatContext);
  const [aggregatedStats, setAggregatedStats] = useState<AggregatedStatsDTO>({});
  const saasContext = useContext(SaaSContext);
  const [availableBudget, setAvailableBudget] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const loadStats = async () => {
      if (dbContext?.authStatus == DatabaseAuthStatus.Authorized) {
        try { 
          await saasContext.loadSaaSContext('');
          if (saasContext.currentQuota) {
            setAvailableBudget(roundToTwoDigits(saasContext.currentQuota.allowedUSDBudget - saasContext.currentUsage.usedUSDBudget));
            setAggregatedStats(await chatContext.aggregatedStats());
          }
        } catch (e) {
          console.error(e);
          toast.error(t("Error while loading aggregated stats"));
        }
      }
    }
    loadStats();
  }, [chatContext.lastRequestStat]);

  return (
    <Credenza open={chatContext?.statsPopupOpen} onOpenChange={chatContext?.setStatsPopupOpen}>
      <CredenzaTrigger asChild>
        <Button variant="outline" size="icon">
          <DollarSignIcon className="w-6 h-6" />
        </Button>
      </CredenzaTrigger>
      <CredenzaContent className="sm:max-w-[500px] bg-white dark:bg-zinc-950">
        <CredenzaHeader>
          <CredenzaTitle>View token usage
          </CredenzaTitle>
          <CredenzaDescription>
            View current token usage and quotas
          </CredenzaDescription>
        </CredenzaHeader>
        <div className="bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800">
          <div className="h-auto overflow-auto">
            {(dbContext?.authStatus == DatabaseAuthStatus.Authorized && aggregatedStats && aggregatedStats.thisMonth && aggregatedStats.today) ? (
              <div>
                {saasContext.userId ? (
                <div className="p-4 space-y-4">
                  <div className="text-sm font-bold w-full">Available funds</div>
                  <div className="grid grid-cols-2 w-full">
                    <div className="text-xs font-bold">available budget</div>
                    <div className={availableBudget<= 0 ? `text-red-500 text-xs` : `text-xs`}>{availableBudget}$ of {saasContext.currentQuota.allowedUSDBudget}$</div>
                    <div className="text-xs font-bold">available databases</div>
                    <div className="text-xs">{saasContext?.currentQuota.allowedDatabases - saasContext.currentUsage.usedDatabases} of {saasContext.currentQuota.allowedDatabases}</div>
                  </div>
                  <div className="text-xs w-full"><Link className="underline hover-gray" href="mailto:info@catchthetornado.com">Contact us if you need more</Link></div>
                </div>) : null}
                <div className="p-4 space-y-4">
                  <div className="text-sm font-bold w-full">Today</div>
                  <div className="grid grid-cols-2 w-full">
                    <div className="text-xs font-bold">prompt tokens</div>
                    <div className="text-xs">{aggregatedStats?.today.promptTokens} tokens</div>
                    <div className="text-xs font-bold">completion tokens</div>
                    <div className="text-xs">{aggregatedStats?.today.completionTokens} tokens</div>
                    <div className="text-xs font-bold">no. of requests</div>
                    <div className="text-xs">{aggregatedStats?.today.requests}</div>
                    <div className="text-xs font-bold border-gray-500 border-t-2">overall usage</div>
                    <div className="text-xs border-gray-500 border-t-2">{aggregatedStats?.today.overallTokens} tokens</div>                
                    <div className="text-xs font-bold"></div>
                    <div className="text-xs">{aggregatedStats?.today.overalUSD} $</div>
                  </div>                
                </div>
                <div className="p-4 space-y-4">
                  <div className="text-sm font-bold w-full">This month</div>
                  <div className="grid grid-cols-2 w-full">
                    <div className="text-xs font-bold">prompt tokens</div>
                    <div className="text-xs">{aggregatedStats?.thisMonth.promptTokens} tokens</div>
                    <div className="text-xs font-bold">completion tokens</div>
                    <div className="text-xs">{aggregatedStats?.thisMonth.completionTokens} tokens</div>
                    <div className="text-xs font-bold">no. of requests</div>
                    <div className="text-xs">{aggregatedStats?.thisMonth.requests}</div>
                    <div className="text-xs font-bold border-gray-500 border-t-2">overall usage</div>
                    <div className="text-xs border-gray-500 border-t-2">{aggregatedStats?.thisMonth.overallTokens} tokens</div>                
                    <div className="text-xs font-bold"></div>
                    <div className="text-xs">{aggregatedStats?.thisMonth.overalUSD} $</div>
                  </div>                
                </div>
              </div>
              
            ) : (
              <DatabaseLinkAlert />
            )}
          </div>
        </div>
      </CredenzaContent>
    </Credenza>
  );
}