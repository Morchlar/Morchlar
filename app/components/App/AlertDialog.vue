<script setup lang="ts">
withDefaults(defineProps<{
    description: string,
    title?: string,
    triggerAsChild?: boolean,
}>(), {
    title: 'Are you sure?',
    triggerAsChild: true,
});
</script>

<template>
    <AlertDialogRoot>
        <AlertDialogTrigger :as-child="triggerAsChild">
            <slot name="trigger" />
        </AlertDialogTrigger>
        <AlertDialogPortal>
            <AlertDialogOverlay />

            <AlertDialogContent>
                <AlertDialogTitle>
                    {{ title }}
                </AlertDialogTitle>

                <AlertDialogDescription>
                    {{ description }}
                </AlertDialogDescription>

                <div class="flex justify-end">
                    <AlertDialogCancel>
                        <slot name="cancel-button">
                            <ButtonSecondary>
                                Cancel
                            </ButtonSecondary>
                        </slot>
                    </AlertDialogCancel>
                    
                    <AlertDialogAction>
                        <slot name="action-button">
                            <ButtonPrimary>
                                Confirm
                            </ButtonPrimary>
                        </slot>
                    </AlertDialogAction>
                </div>
            </AlertDialogContent>
        </AlertDialogPortal>
    </AlertDialogRoot>
</template>