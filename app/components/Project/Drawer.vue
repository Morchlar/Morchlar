<script setup lang="ts">
import { DrawerContent, DrawerOverlay, DrawerPortal, DrawerRoot, DrawerTrigger } from 'vaul-vue';
import type { TimelineItemWithData } from '~/utils/types/timeline';

defineProps<{
  selectedTask: TimelineItemWithData | null
}>()

const isOpen = defineModel('isOpen', { default: false });
</script>

<template>
  <DrawerRoot should-scale-background direction="right" v-model:open="isOpen">
    <DrawerPortal>
      <DrawerOverlay class="fixed bg-black/40 inset-0" />
      <DrawerContent
        class="bg-main-800 rounded-t-[10px] h-full w-sm fixed bottom-0 right-0 z-50"
      >
        <div class="p-4 bg-main-700 rounded-t-[10px] flex-1">
          <DrawerHandle data-testid="handle" class="mb-8 mt-2" />

          <div class="max-w-md mx-auto">
            
          </div>
        </div>
        <div class="px-7 pt-2">
          <DialogTitle class="text-center mb-3 text-2xl text-bold">
            <h5 class="text-left">Selected Task:</h5>
            {{ selectedTask?.data.title }}
          </DialogTitle>
          <DialogDescription class="p-2 bg-main-700 rounded-[10px] ">
            <h4>Description:</h4>
            {{ selectedTask?.data.description }}
          </DialogDescription>
          
        </div>
        <div class="bottom-0 px-7 pt-2">
            <slot>
            
            </slot>
        </div>
      </DrawerContent>
    </DrawerPortal>
  </DrawerRoot>
</template>