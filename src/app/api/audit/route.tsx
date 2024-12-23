import { AuditDTO, auditDTOSchema, KeyDTO, keyDTOSchema } from "@/data/dto";
import ServerAuditRepository from "@/data/server/server-audit-repository";
import { authorizeRequestContext, authorizeSaasContext, genericGET, genericPUT } from "@/lib/generic-api";
import { getErrorMessage } from "@/lib/utils";
import { NextRequest, NextResponse, userAgent } from "next/server";

export async function PUT(request: NextRequest, response: NextResponse) {
    const requestContext = await authorizeRequestContext(request, response);
    const saasContext = await authorizeSaasContext(request); // authorize SaaS context

    const inputObj = (await request.json())
    const valRes = auditDTOSchema.safeParse(inputObj);
    if(!valRes.success) {
        return Response.json({ message: 'Invalid input', issues: valRes.error.issues }, { status: 400 });
    }

    const logObj = valRes.data;
    logObj.ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || request.ip;
    const { device, ua } = userAgent(request)
    logObj.ua = ua;
    logObj.emailHash = requestContext.emailHash
    logObj.keyLocatorHash = requestContext.keyLocatorHash;
    logObj.createdAt = new Date().toISOString();

    // TODO: Add audit rotation
    const now = new Date();
    const dbPartition = `${now.getFullYear()}-${now.getMonth()}`; // partition daily
    const apiResult = await genericPUT<AuditDTO>(logObj, auditDTOSchema, new ServerAuditRepository(requestContext.emailHash, 'audit', dbPartition), 'id');

    if (saasContext.apiClient) {
         saasContext.apiClient.saveEvent(requestContext.emailHash, {
            eventName: logObj.eventName as string,
            emailHash: requestContext.emailHash,
            params: { recordLocator: JSON.parse(valRes.data.recordLocator as string)}
        });
    }

    return Response.json(apiResult, { status: apiResult.status });
}

export async function GET(request: NextRequest, response: NextResponse) {
    try {
        const requestContext = await authorizeRequestContext(request, response);
        const now = new Date();
        let dbPartition = `${now.getFullYear()}-${now.getMonth()}`; // partition daily

        if (request.nextUrl.searchParams.has('partition')) {
            dbPartition = request.nextUrl.searchParams.get('partition') as string;
        }
        return Response.json(await genericGET<AuditDTO>(request, new ServerAuditRepository(requestContext.emailHash, 'audit', dbPartition)));
    } catch (error) {
        return Response.json({ message: 'Error accessing audit partition ' + getErrorMessage(error), status: 400 });
        console.error(error);
    }
}
