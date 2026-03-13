<template>
    <div class="w-full h-36 flex flex-col">
        <div class="h-[1.9em] bg-(--timestamps-background)"></div>
        <div class="h-px bg-(--group-border-top)"></div>
        <div 
            class="grow flex items-center justify-center text-txt-secondary text-sm animate-pulse">
            <slot>Loading chart...</slot>
        </div>
    </div>
</template>