<script setup lang="ts">
const route = useRoute();

const orgSlug = computed(() => route.params.orgSlug);
const projectId = computed(() => route.params.projectId);

const popoverOpen = ref(false);
</script>

<template>
    <AppPopover v-model:is-open="popoverOpen">
        <template #trigger>
            <ButtonSecondary
                v-if="projectId"
                class="inline-flex items-center gap-2"
                :to="{ name: 'dashboard-orgSlug', params: { orgSlug } }">
                <Icon name="hugeicons:arrow-left-01" />
                Projects
            </ButtonSecondary>
            <ButtonSecondary
                v-else-if="orgSlug"
                class="inline-flex items-center gap-2"
                disabled>
                All Projects
            </ButtonSecondary>
        </template>

        <template #content>
            test
        </template>
    </AppPopover>
</template>