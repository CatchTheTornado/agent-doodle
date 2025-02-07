import { z } from 'zod';
import { tool } from 'ai';
import { ResultDTO } from '@/data/dto';
import ServerResultRepository from '@/data/server/server-result-repository';
import { ToolDescriptor } from './registry';
import ServerSessionRepository from '@/data/server/server-session-repository';
import ServerAgentRepository from '@/data/server/server-agent-repository';
import { Agent } from '@/data/client/models';
import { CreateResultEmailTemplateProps } from '@/email-templates/en/result-email-template';
import { Resend } from 'resend';
import i18next from 'i18next';
const resend = new Resend(process.env.RESEND_API_KEY);

export function createUpdateResultTool(databaseIdHash: string): ToolDescriptor
{
  return {
  displayName: 'Sage result',
  tool:tool({
          description: 'Save results',
          parameters: z.object({
            sessionId: z.string().describe('The result/session ID to be updated'),
            language: z.string().describe('Result language code for example "pl" or "en"'),
            format: z.string().describe('The format of the inquiry results (requested by the user - could be: JSON, markdown, text etc.)'),
            result: z.string().describe('The inquiry results - in different formats (requested by the user - could be JSON, markdown, text etc.)'),
          }),
          execute: async ({ sessionId, result, format, language }) => {
            try {
              const resultRepo = new ServerResultRepository(databaseIdHash);
              const sessionsRepo = new ServerSessionRepository(databaseIdHash);
              const agentsRepo = new ServerAgentRepository(databaseIdHash);
              const existingSessionDTO = await sessionsRepo.findOne({ id: sessionId });
              const currentAgentDTO = await agentsRepo.findOne({ id: existingSessionDTO?.agentId });

              i18next.init({
                preload: [language]
              });
              i18next.loadLanguages([language]);
            

              if(!existingSessionDTO) {
                return 'Session not found, please check the sessionId';
              }

              const storedResult = {
                sessionId,
                agentId: existingSessionDTO?.agentId,
                userEmail: existingSessionDTO?.userEmail,
                userName: existingSessionDTO?.userName,
                createdAt: new Date().toISOString()
              } as ResultDTO;

              if (currentAgentDTO) {
                const currentAgent = Agent.fromDTO(currentAgentDTO);
                if(currentAgent.options?.resultEmail) {
                  (async function () {
                    const ReactDOMServer = (await import('react-dom/server')).default

                    const templatePath = '@/email-templates/' + language + '/result-email-template.tsx';
                    const templatePathPlain = '@/email-templates/' + language + '/result-email-template-plain.tsx';
                    const CreateResultEmailTemplate = (await import(templatePath)).default as React.FC<CreateResultEmailTemplateProps>
                    const CreateResultEmailTemplatePlain = (await import(templatePathPlain)).default as React.FC<CreateResultEmailTemplateProps>

                    const url = process.env.APP_URL + '/agent/' + currentAgent.id + '/results/' + sessionId;
                    const renderedHtmlTemplate = ReactDOMServer.renderToStaticMarkup(<CreateResultEmailTemplate agent={currentAgentDTO} result={result} resultFormat={format} url={url}/>)
                    const renderedTextTemplate = ReactDOMServer.renderToStaticMarkup(<CreateResultEmailTemplatePlain agent={currentAgentDTO} result={result} resultFormat={format} url={url}/>)
        
                    const { data, error } = await resend.emails.send({
                      from: 'Agent Doodle <results@updates.agentdoodle.com>',
                      to: [currentAgent.options?.resultEmail ?? ''],
                      subject: i18next.t('Agent Doodle result', { lng: language }),
                      text: renderedTextTemplate,
                      html: renderedHtmlTemplate
                    });
                    console.error(error);
                    console.log(data);
                })();
        
                }
              }
            
              storedResult.updatedAt = new Date().toISOString();
              storedResult.finalizedAt = new Date().toISOString();
              storedResult.content = result;
              storedResult.format = format;      
              await sessionsRepo.upsert({ id: sessionId }, { ...existingSessionDTO, finalizedAt: new Date().toISOString() });
              await resultRepo.upsert({ sessionId }, storedResult);
              return 'Results saved!';
            } catch (e) {
              console.error(e);
              return 'Error saving results';
            }
          },
        }),
      }
    }

