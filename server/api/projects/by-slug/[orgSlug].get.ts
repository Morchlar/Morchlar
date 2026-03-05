import { eq } from "drizzle-orm";
import { auth } from "~~/lib/auth";
import db from "~~/lib/db";
import { listProjects } from "~~/lib/db/queries/projects";
import { organization } from "~~/lib/db/schema";
import validateRouterParam from "~~/server/utils/validateRouterParam";

export default defineAuthenticatedEventHandler(async (event) => {
    const orgSlug = validateRouterParam(event, 'orgSlug', false);

    // Get org by slug
    const org = await db.query.organization.findFirst({
        where: eq(organization.slug, orgSlug),
    });

    if (!org) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Organization not found',
        });
    }

    // Check if user is a member using better-auth's hasPermission
    const { success, error } = await auth.api.hasPermission({
        headers: event.headers,
        body: {
            permissions: {
                organization: [ 'update' ],
            },
            organizationId: org.id,
        },
    });

    if (error || !success) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Organization not found',
        });
    }

    const orgProjects = await listProjects(org.id);

    return {
        projects: orgProjects,
        organization: {
            id: org.id,
            name: org.name,
            slug: org.slug,
        },
    };
});
