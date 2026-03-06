import pusher from '~~/lib/pusher';
import z from 'zod';

export default defineAuthenticatedEventHandler(async (event) => {
    try {
        const userId = event.context.user.id;
        const projectId = validateRouterParam(event, 'projectId');
        const bodySchema = z.object({
            orgId: z.string(),
        })
        const body = await validateBody(event, bodySchema);
        await ensureUserInOrg(event, userId, body.orgId);

        await pusher.trigger("project"+projectId, "update", {});
        return true;
    } catch(error: any) {
        console.log(error?.body);
        throw createError({
            status: 500,
            statusMessage: "An error has occured, "+error
        });
    }
});