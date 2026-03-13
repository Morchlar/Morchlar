<script setup lang="ts">
import type { DateRange } from "reka-ui";
import {
    Timeline,
    type TimelineGroup,
    type TimelineItem,
} from "vue-timeline-chart";
import "vue-timeline-chart/style.css";

import {
    type InsertTaskSchema,
    type ModifyTaskSchema,
    type DeleteTaskSchema,
} from "~~/lib/db/schema";
import type { ApiResponse } from "~/composables/apiResponse";

type TimelineTaskGroup = TimelineGroup & {
    expanded?: boolean,
    parentId: number | null,

    order: number | null,
    depth: number,
    path: number[],
};

type TimelineItemWithData = TimelineItem & {
    data: ApiResponse<"/api/task/:projectId", "get">[number];
};

definePageMeta({
    sidebarType: "project",
});

const { $csrfFetch} = useNuxtApp();
const { subscribeToProject, updateChannel } = usePusher();
const route = useRoute();
const projectId = computed(() => route.params.projectId);

const {
    data: projectInfo,
    pending: projectInfoPending,
    error: projectInfoError,
} = useFetch(() => `/api/project/${projectId.value}`, { method: "GET" });

const {
    data: tasksInfo,
    pending: tasksPending,
    error: tasksError,
} = useFetch(() => `/api/task/${projectId.value}`, { method: "GET" });

// maybe add controls later on
// https://laurens94.github.io/vue-timeline-chart/examples/set-viewport.html#set-viewport-example

const items = computed<TimelineItemWithData[]>(() => {
    if (!tasksInfo.value) return [];

    return tasksInfo.value.map((task) => {
        return {
            id: task.id.toString(),
            group: `${task.id}-group`,
            type: "range",
            start: new Date(task.startTime).getTime(),
            end: new Date(task.endTime).getTime(),
            data: task,
        };
    });
});

// TEST
// Pusher

// Sub to pusher channel for active project.
watch(projectId, () => {
    const projectIdFromInfo = projectInfo.value?.id;
    if (!projectIdFromInfo) return;

    subscribeToProject(projectIdFromInfo, (newTasks) => {
        console.log('Received new tasks from pusher', newTasks);
        tasksInfo.value = newTasks;
    });
}, {
    immediate: true,
});

function refreshChannel() {
    const projectIdFromInfo = projectInfo.value?.id;
    if (!projectIdFromInfo) return;

    updateChannel(projectIdFromInfo)
}

// How much time to put on the timeline as padding before the start of the earliest task
// and end of the latest task
const PADDING_MS = 604800000;

const bounds = computed<{ lower: number; upper: number }>(() => {
    // 1 month behind, 1 month ahead as default view range
    const defaultValues = {
        lower: Date.now() - 2629800000,
        upper: Date.now() + 2629800000,
    };

    if (!items.value || !items.value[0]) return defaultValues;

    const lowest = items.value.reduce(
        (lowest, item) => (item.start < lowest.start ? item : lowest),
        items.value[0],
    );
    const highest = items.value.reduce(
        (highest, item) => (item.start > highest.start ? item : highest),
        items.value[0],
    );

    return {
        lower: lowest.start - PADDING_MS,
        upper: (highest.end ?? defaultValues.upper) + PADDING_MS,
    };
});

const groupsInfo = reactive<TimelineTaskGroup[]>([]);
watch(tasksInfo, (newTasks) => {
    if (!newTasks) return;

    const incoming = newTasks.map<TimelineTaskGroup>((task) => {
        const existing = groupsInfo.find((g) => g.id === `${task.id}-group`);

        return {
            id: `${task.id}-group`,
            label: task.title,
            expanded: existing?.expanded ?? true,
            parentId: task.parentId,
            cssVariables: { '--item-background': 'transparent' },

            order: task.order,
            depth: task.depth,
            path: task.path,
        };
    })

    // instead of re-assigning groupsInfo, we use this to simultaneously
    // remove all items and add in new ones, causing the chart to catch the
    // update and change accordingly
    groupsInfo.splice(0, groupsInfo.length, ...incoming);
}, {
    immediate: true,
});

const groups = computed<TimelineTaskGroup[]>(() => {
    if (!tasksInfo.value) return [];

    return groupsInfo.filter(isVisible);
});

const selectedTask = ref<TimelineItemWithData | null>(null);

function selectTask(item: TimelineItemWithData) {
    if (item.type === "range") {
        selectedTask.value = item;
    }
}

const taskName = ref<string | null>(null);
const taskDesc = ref<string | null>(null);
// TODO: type this
const dateValue = ref<DateRange | undefined>();

async function addTask(subtaskId?: number) {
    // TODO: better validation
    if (
        !taskName.value ||
        !taskDesc.value ||
        !dateValue.value ||
        !projectId.value
    )
        return;
    if (isNaN(Number(projectId.value))) return;

    if (!dateValue.value.start || !dateValue.value.end) return;

    const startDate = new Date(
        dateValue.value.start.year,
        dateValue.value.start.month - 1,
        dateValue.value.start.day,
    );

    const endDate = new Date(
        dateValue.value.end.year,
        dateValue.value.end.month - 1,
        dateValue.value.end.day,
    );

    const body: InsertTaskSchema = {
        title: taskName.value,
        projectId: Number(projectId.value.toString()),
        startTime: startDate,
        endTime: endDate,
        description: taskDesc.value,
        parentId: subtaskId,
    };

    const result = await $csrfFetch(`/api/tasks`, { method: "POST", body });

    if (!result.id) {
        alert("Failed to add task");
        return;
    }

    refreshChannel();
}

async function modifyTask() {
    //copy of addTask could probably be turned into one function
    // TODO: better validation
    if (
        !taskName.value ||
        !taskDesc.value ||
        !dateValue.value ||
        !projectId.value
    )
        return;
    if (isNaN(Number(projectId.value))) return;

    if (!dateValue.value.start || !dateValue.value.end) return;

    if (!selectedTask.value) return;

    const startDate = new Date(
        dateValue.value.start.year,
        dateValue.value.start.month - 1,
        dateValue.value.start.day,
    );

    const endDate = new Date(
        dateValue.value.end.year,
        dateValue.value.end.month - 1,
        dateValue.value.end.day,
    );

    const body: ModifyTaskSchema = {
        title: taskName.value,
        projectId: Number(projectId.value.toString()),
        id: selectedTask.value.data.id,
        startTime: startDate,
        endTime: endDate,
        description: taskDesc.value,
    };

    const result = await $csrfFetch(`/api/tasks`, { method: "PUT", body });

    if (!result.id) {
        alert("Failed to modify task");
        return;
    } 
    
    refreshChannel();
}

async function deleteTask() {
    if (!selectedTask.value) return;
    const taskId = selectedTask.value.data.id;

    const body: DeleteTaskSchema = {
        id: taskId,
    };

    const result = await $csrfFetch(`/api/tasks`, { method: "DELETE", body });

    if (!result.id) {
        alert("Failed to delete task");
        return;
    }

    refreshChannel();
}

function isVisible(group: TimelineTaskGroup): boolean {
    if (group.depth === 0) return true;

    return group.path.slice(0, -1).every((ancestorId) => {
        const ancestor = groupsInfo.find(g => g.id === `${ancestorId}-group`);
        return ancestor?.expanded === true;
    });
}

function toggleExpanded(groupId: string) {
    const group = groupsInfo.find(g => g.id === groupId);
    if (group) group.expanded = !group.expanded;
}

function hasChildren(groupId: string): boolean {
    const taskId = Number(groupId.replace('-group', ''));
    
    return groupsInfo.some(g => g.parentId === taskId);
}
</script>

<template>
    <div class="mb-4">
        <div v-if="projectInfoPending">
            <span>Selected project:</span>
            <h1 class="text-3xl font-bold animate-pulse">Loading...</h1>
            <h2 class="mt-4">Tasks:</h2>
        </div>
        <div v-else-if="projectInfoError || !projectInfo">
            There was an error fetching project info. {{ projectInfoError }}
        </div>
        <div v-else class="flex flex-col">
            <span>Selected project:</span>
            <h1 class="text-3xl font-bold">{{ projectInfo.title }}</h1>
            <span class="mt-4">Tasks:</span>
        </div>
    </div>

    <div class="ring-md rounded-sm touch-none">
        <div v-if="tasksPending">Loading timeline...</div>
        <div v-else-if="tasksError">There was an error loading the timeline</div>
        <Timeline 
            v-else 
            :items 
            :groups 
            :initial-viewport-start="bounds.lower" 
            :initial-viewport-end="bounds.upper">
            <template #group-label="{ group }">
                <div 
                    class="flex items-center gap-1"
                    :class="{
                        'ml-2': group.path.length > 1,
                        'ml-4': group.path.length > 2
                    }">
                    <button 
                        v-if="hasChildren(group.id)"
                        @click="toggleExpanded(group.id)">
                        <Icon 
                            name="hugeicons:arrow-right-01"
                            :class="{ 'rotate-90': group.expanded }" />
                        {{ group.label }}
                    </button>
                    <span 
                        v-else
                        class="ml-4">
                        {{ group.label }}
                    </span>
                </div>
            </template>

            <template #item="{ item }">
                <div 
                    class="size-full bg-brand ring-md rounded-sm"
                    @click="selectTask(item)"></div>
            </template>
        </Timeline>
    </div>

    <h2 class="mt-4">Add a new task:</h2>
    <AppDialog title="Add a new task" description="Select a title, description, and date range.">
        <template #trigger>
            <ButtonSecondary> New Task </ButtonSecondary>
        </template>
        <template #body>
            <form class="flex flex-col gap-2" @submit.prevent="addTask()">
                <AppFormInput v-model="taskName" label="Title" name="title" placeholder="My Task" />
                <AppFormInput v-model="taskDesc" label="Description" name="description" placeholder="We need to..." />
                <DatePicker date-picker-label="Timespan" v-model="dateValue" />
                <div class="flex justify-end mt-4">
                    <ButtonPrimary type="submit"> Create Task </ButtonPrimary>
                </div>
            </form>
        </template>
    </AppDialog>
    <div v-if="selectedTask" class="mt-4">
        <h2>{{ selectedTask.data.title }}</h2>
        <p>{{ selectedTask.data.description }}</p>
        <AppDialog title="Modify a task" description="Select a title, description, and date range.">
            <template #trigger>
                <ButtonSecondary> Modify Task </ButtonSecondary>
            </template>
            <template #body>
                <form class="flex flex-col gap-2" @submit.prevent="modifyTask">
                    <AppFormInput v-model="taskName" label="Title" name="title"
                        :placeholder="selectedTask?.data?.title" />
                    <AppFormInput v-model="taskDesc" label="Description" name="description"
                        :placeholder="selectedTask?.data?.description || 'We need to...'" />
                    <DatePicker date-picker-label="Timespan" v-model="dateValue" />
                    <div class="flex justify-end mt-4">
                        <ButtonPrimary type="submit"> Modify Task </ButtonPrimary>
                    </div>
                </form>
            </template>
        </AppDialog>

        <AppDialog title="Delete task" description="Are you sure you want to delete this task?">
            <template #trigger>
                <ButtonSecondary> Delete Task </ButtonSecondary>
            </template>
            <template #body>
                <form class="flex flex-col gap-2" @submit.prevent="deleteTask">
                    <div class="flex justify-end mt-4">
                        <ButtonPrimary type="submit"> Delete Task </ButtonPrimary>
                    </div>
                </form>
            </template>
        </AppDialog>
        <div v-if="(selectedTask.data.depth <= 3) || (selectedTask.data.depth === 0)">
            <h2 class="mt-4">Add a new task:</h2>
            <AppDialog title="Add a new sub-task" description="Select a title, description, and date range.">
                <template #trigger>
                    <ButtonSecondary> New Sub-Task </ButtonSecondary>
                </template>
                <template #body>
                    <form class="flex flex-col gap-2" @submit.prevent="addTask(selectedTask.data.id)">
                        <AppFormInput v-model="taskName" label="Title" name="title" placeholder="My Task" />
                        <AppFormInput v-model="taskDesc" label="Description" name="description"
                            placeholder="We need to..." />
                        <DatePicker date-picker-label="Timespan" v-model="dateValue" />
                        <div class="flex justify-end mt-4">
                            <ButtonPrimary type="submit"> Create Sub-Task </ButtonPrimary>
                        </div>
                    </form>
                </template>
            </AppDialog>
        </div>
    </div>
</template>