import { defineStore } from 'pinia';
import type { ClientInsertProjectSchema } from '~~/lib/db/schema';

type ProjectsInfo = ApiResponse<'/api/projects/by-slug/:orgSlug', 'get'>;

export const useProjectsStore = defineStore('projects', () => {
    const fetchWithCookies = useRequestFetch();
    const { $csrfFetch } = useNuxtApp();

    const projects = ref<ProjectsInfo['projects'] | null>(null);
    const orgInfo = ref<ProjectsInfo['organization'] | null>(null);

    const isPending = ref(false);
    const error = ref<string | null>(null);

    async function fetchForSlug(orgSlug: string) {
        isPending.value = true;
        error.value = null;
        
        try {
            const response = await fetchWithCookies(`/api/projects/by-slug/${orgSlug}`, { method: 'GET' });
            projects.value = response.projects;
            orgInfo.value = response.organization;
        } catch (err) {
            if (err instanceof Error) {
                error.value = err.message;
            } else {
                error.value = String(err);
            }
        } finally {
            isPending.value = false;
        }
    }

    async function createProject(repo: string, title: string) {
        if (!orgInfo.value) return;

        const body: ClientInsertProjectSchema = {
            organizationId: orgInfo.value.id,
            repo,
            title,
        };

        await $csrfFetch('/api/projects', {
            method: 'POST',
            body,
        });

        fetchForSlug(orgInfo.value.slug);
    }

    return {
        projects,
        isPending,
        error,

        createProject,
        
        fetchForSlug,
    }
});
