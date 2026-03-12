<script setup lang="ts">
import CreateProjectButton from '~/components/App/CreateProjectButton.vue';

definePageMeta({
    sidebarType: 'org',
});

const route = useRoute();
// https://nuxt.com/docs/4.x/api/composables/use-fetch#reactive-keys-and-shared-state
const orgSlug = computed(() => route.params.orgSlug);

const projectsStore = useProjectsStore();
const { projects, isPending, error } = storeToRefs(projectsStore);

</script>

<template>
    <h1 class="text-3xl font-bold">Projects</h1>

    <div 
        v-if="isPending"
        class="mt-4 grow flex items-center justify-center">
        <LoadingIcon :size="32" />
    </div>
    <div 
        v-else-if="error"
        class="mt-4 grow flex items-center justify-center">
        An error occured loading projects: {{ error ?? 'Unknown Error' }}
    </div>
    <div 
        v-else
        class="h-full mt-4 grow grid gap-2 grid-cols-4 overflow-y-auto">
        
        <NuxtLink
            v-for="project in projects"
            :key="project.id"
            class="bg-main-800 flex flex-col gap-2 max-h-40 p-4 ring-md rounded-lg hover:bg-main-700 cursor-pointer transition-all duration-75"
            :to="{ name: 'dashboard-orgSlug-projectId', params: { orgSlug, projectId: project.id }  }">
            <span class="text-lg font-semibold">{{ project.title }}</span>
        </NuxtLink>

        <CreateProjectButton />
    </div>
</template>