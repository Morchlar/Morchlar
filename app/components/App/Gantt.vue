<script setup lang="ts">
import { Timeline } from 'vue-timeline-chart';
import "vue-timeline-chart/style.css";

import type { TimelineItemWithData, TimelineTaskGroup } from '~/utils/types/timeline';

const props = defineProps<{
    items: TimelineItemWithData[],
    groupsInfo: TimelineTaskGroup[], // all inlcluding hidden
}>();

defineEmits<{
    (e: 'selectedTask', item: TimelineItemWithData): void,
}>();


// How much time to put on the timeline as padding before the start of the earliest task
// and end of the latest task
const PADDING_MS = 604800000;

const bounds = computed<{ lower: number; upper: number }>(() => {
    // 1 month behind, 1 month ahead as default view range
    const defaultValues = {
        lower: Date.now() - 2629800000,
        upper: Date.now() + 2629800000,
    };

    if (!props.items || !props.items[0]) return defaultValues;

    const lowest = props.items.reduce(
        (lowest, item) => (item.start < lowest.start ? item : lowest),
        props.items[0],
    );
    const highest = props.items.reduce(
        (highest, item) => (item.start > highest.start ? item : highest),
        props.items[0],
    );

    return {
        lower: lowest.start - PADDING_MS,
        upper: (highest.end ?? defaultValues.upper) + PADDING_MS,
    };
});

function toggleExpanded(groupId: string) {
    const group = props.groupsInfo.find(g => g.id === groupId);
    if (group) group.expanded = !group.expanded;
}

function hasChildren(groupId: string): boolean {
    const taskId = Number(groupId.replace('-group', ''));
    
    return props.groupsInfo.some(g => g.parentId === taskId);
}


function isGroupVisible(group: TimelineTaskGroup): boolean {
    if (group.depth === 0) return true;

    return group.path.slice(0, -1).every((ancestorId) => {
        const ancestor = props.groupsInfo.find(g => g.id === `${ancestorId}-group`);
        return ancestor?.expanded === true;
    });
}

const groups = computed<TimelineTaskGroup[]>(() => {
    // Only show if ancestor expanded
    return props.groupsInfo.filter(isGroupVisible);
});
</script>

<template>
    <ClientOnly>
        <Timeline 
            :items 
            :groups 
            :initial-viewport-start="bounds.lower" 
            :initial-viewport-end="bounds.upper">
            <template #group-label="{ group }">
                <div 
                    class="flex items-center"
                    :style="{ 'margin-left': `${(group.path.length - 1) * 16}px` }">
                    <button 
                        v-if="hasChildren(group.id)"
                        class="flex flex-row gap-1 items-center justify-center"
                        @click="toggleExpanded(group.id)">
                        <Icon 
                            name="hugeicons:arrow-right-01"
                            class="transition-discrete duration-75"
                            size="16"
                            :class="{ 'rotate-90': group.expanded }" />
                        {{ group.label }}
                    </button>
                    <span 
                        v-else
                        class="ml-5">
                        {{ group.label }}
                    </span>
                </div>
            </template>

            <template #item="{ item }">
                <div 
                    class="size-full bg-brand ring-md rounded-sm"
                    @click="$emit('selectedTask', item)"></div>
            </template>
        </Timeline>

        <template #fallback>
            <AppGanttFallback />
        </template>
    </ClientOnly>
</template>