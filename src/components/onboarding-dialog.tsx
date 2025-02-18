import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "./ui/dialog";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { DialogHeader } from "./ui/dialog";
import { useContext, useEffect, useState } from "react";
import { TemplateContext } from "@/contexts/template-context";
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import { set } from "date-fns";
import { useAgentContext } from "@/contexts/agent-context";
import { useRouter } from "next/navigation";
import { Checkbox } from "./ui/checkbox";
import { Label } from "@uiw/react-json-view";

export function OnboardingDialog() {

    const [onboardingOpen, setOnboardingOpen] = useState(false);
    const templateContext = useContext(TemplateContext);
    const agentContext = useAgentContext();
    const router = useRouter();

    const { t } = useTranslation();

    useEffect(() => {
        if (localStorage.getItem('onboarding') === 'false') {
            setOnboardingOpen(false);
        } else {
            setOnboardingOpen(true);
        }
    }, []);

    return (
        <Dialog open={onboardingOpen} onOpenChange={(v) =>{
            setOnboardingOpen(v);
        }}>
            <DialogContent className="sm:max-w-[600px] md:max-w-[800px] z-50 bg-background">
                <DialogHeader>
                    <DialogTitle className="text-center items-center justify-center">
                        <div className="flex justify-center"><img src="/img/agent-doodle-logo.svg" className="w-40 h-40" /></div>
                        <h2 className="text-2xl font-bold">{t('Welcome to Agent Doodle')}</h2>
                        <p className="text-sm pt-3 pb-3">{t('In Agent Doodle, you create an AI Assistant that will chat with your customers, colleagues, or anyone who gets the link. Choose a template to get started creating your first Assistant.')}</p>
                    </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {templateContext?.templates.map((template, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                            <CardContent className="p-4">
                                <div className="flex items-center mb-3">
                                    <img src={'/img/onboarding-icons/' + template.icon} alt={template.displayName} className="w-12 h-12 mr-3" />
                        
                                    <div>
                                        <h3 className="text-lg font-semibold dark:text-gray-200 text-gray-800">{template.displayName}</h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-500"><Markdown>{template.options?.welcomeMessage?.length > 80 ? template.options?.welcomeMessage.slice(0, 80)  : template.options?.welcomeMessage}</Markdown></p>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full text-sm" onClick={async (e) => {
                                    const newAgent = await agentContext.newFromTemplate(template)
                                    templateContext?.setTemplatePopupOpen(false);
                                    setOnboardingOpen(false);
                                    router.push(`/admin/agent/${newAgent.id}/general`);                                    
                                }}>
                                    {t('Use Template')}
                                    <ArrowRight className="w-3 h-3 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="text-center mt-6">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={(e) => {
                        setOnboardingOpen(false)
                        templateContext?.setTemplatePopupOpen(true)                        
                    }}>
                        {t('More templates ...')}
                        <Sparkles className="w-4 h-4 ml-2" />
                    </Button>
                </div>
                <div className="mt-2 text-center">
                        <Checkbox id="dont-show-again" defaultChecked={false} className="text-xs mr-2" onChange={(e) => {
                            localStorage.setItem('onboarding', (!e.target.checked).toString());
                        }} />
                        <label className="text-xs" htmlFor="dont-show-again">{t('Do not show this dialog again')}</label>
                    </div>

            </DialogContent>
        </Dialog>
    );
}