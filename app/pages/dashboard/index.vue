<script setup lang="ts">
definePageMeta({
    sidebarType: 'user',
    middleware: [ 'dashboard' ],
});

const { $authClient } = useNuxtApp();

const organizations = $authClient.useListOrganizations();
</script>

<template>
    <div 
        v-if="organizations.error"
        class="mt-4 grow flex items-center justify-center">
        An error occured loading organizations: {{ organizations.error.statusText ?? 'Unknown Error' }}
    </div>
    <div 
        v-else-if="organizations.isPending"
        class="mt-4 grow flex items-center justify-center">
        <LoadingIcon :size="32" />
    </div>
    <div 
        v-else
        class="h-full mt-4 grow grid gap-2 grid-cols-4 overflow-y-auto">
        <NuxtLink
            v-for="org in organizations.data"
            :key="org.id"
            class="bg-main-800 flex flex-col gap-2 max-h-40 p-4 ring-md rounded-lg hover:bg-main-700 cursor-pointer transition-all duration-75"
            :to="{ name: 'dashboard-orgSlug', params: { orgSlug: org.slug }  }"
            @click.native="$authClient.organization.setActive({ organizationId: org.id })">
            <span class="text-lg font-semibold">{{ org.name }}</span>
            <!-- <span class="capitalize">Role: <i>{{ org. }}</i></span> -->
        </NuxtLink>
    </div>
</template>