<script setup lang="ts">
// const { $authSession } = useNuxtApp();

// const selectedGroup = computed(() => $authSession.data.value?.user.selectedGroup);
// const selectedProject = computed(() => $authSession.data.value?.user.selectedProject);

const route = useRoute();

const orgSlug = computed(() => route.params.orgSlug);
const projectId = computed(() => route.params.projectId);

const sidebarType = computed(() => route.meta.sidebarType);

</script>

<template>
    <div class="w-full min-h-dvh max-h-dvh overflow-hidden flex flex-col">
        <nav 
            class="flex flex-row gap-2 p-2
            bg-main-800 ring-1 ring-inset ring-main-50/10">
            <ButtonSecondary 
                v-if="orgSlug"
                class="inline-flex items-center gap-2"
                :to="{ name: 'dashboard' }">
                <Icon name="hugeicons:arrow-left-01" />
                All orgs
            </ButtonSecondary>
            <ButtonSecondary
                v-else
                class="inline-flex items-center gap-2"
                disabled>
                <Icon name="hugeicons:arrow-left-01" />
                All orgs
            </ButtonSecondary>

            <ButtonSecondary
                v-if="projectId"
                class="inline-flex items-center gap-2"
                :to="{ name: 'dashboard-orgSlug', params: { orgSlug } }">
                <Icon name="hugeicons:arrow-left-01" />
                Projects
            </ButtonSecondary>
        </nav>
        <div class="grow w-full flex flex-row min-h-0">
            <aside class="w-xs bg-main-800 border-r border-main-50/10 p-2">
                <UserSidebar v-if="sidebarType === 'user'" />
                <OrgSidebar v-else-if="sidebarType === 'org'" />
                <ProjectSidebar v-else-if="sidebarType === 'project'" />
            </aside>
            <main class="grow w-full flex flex-col p-2 overflow-y-auto">
                <NuxtPage />
            </main>
        </div>
    </div>
</template>