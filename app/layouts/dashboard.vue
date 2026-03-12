<script setup lang="ts">
const route = useRoute();
const sidebarType = computed(() => route.meta.sidebarType);

const organizationsStore = useOrganizationsStore();
const projectsStore = useProjectsStore();

await callOnce('organizationsStore', () => organizationsStore.fetchOrganizations());

watch(route, (route) => {
    if (!route.params.orgSlug) return;

    projectsStore.fetchForSlug(String(route.params.orgSlug));
});
</script>

<template>
    <div class="w-full min-h-dvh max-h-dvh overflow-hidden flex flex-row">
        <aside class="min-w-3xs max-w-3xs bg-main-800 border-r border-main-50/10 p-2 flex flex-col justify-between">
            <div class="flex flex-col gap-2">
                <NavbarOrgsDropdown />
                <UserSidebar v-if="sidebarType === 'user'" />
                <OrgSidebar v-else-if="sidebarType === 'org'" />
                <ProjectSidebar v-else-if="sidebarType === 'project'" />
            </div>

            <SidebarAccountCard />
        </aside>

        <div class="grow flex flex-col min-h-0">
            <nav 
                class="min-h-14 flex flex-row gap-2 p-2
                bg-main-800 border-b border-main-50/10">
                <NavbarProjectsDropdown />
            </nav>
            <main class="grow flex flex-col p-2 overflow-y-auto">
                <NuxtPage />
            </main>
        </div>
    </div>
</template>