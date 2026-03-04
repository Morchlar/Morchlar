<script setup lang="ts">
const route = useRoute();

const orgSlug = computed(() => route.params.orgSlug);
</script>

<template>
    <div class="flex flex-col gap-2">
        <SidebarLink
            :to="{ name: 'dashboard-group-orgSlug', params: { orgSlug } }"
            label="Projects"
            icon="hugeicons:grid-view" />
        <SidebarLink
            :to="{ name: 'dashboard-group-orgSlug-members', params: { orgSlug } }"
            label="Members"
            icon="hugeicons:user-group" />
        <SidebarLink
            :to="{ name: 'dashboard-group-orgSlug-settings', params: { orgSlug } }"
            label="Settings"
            icon="hugeicons:settings-01" />
    </div>
</template>