<script setup lang="ts">
type BaseField = {
    label: string,
    name: string,
}

type FieldOptions = 
    { 
        as: 'input', 
        type: 'text' | 'number' | 'date',
    } | { 
        as: 'textarea'
    };

defineProps<{
    onSubmit: () => void,
    isLoading: boolean,
    errors: Record<string, string | undefined>,
    submitBtn: {
        icon: string,
        label: string,
    },
    fields: (Record<string, any> & (BaseField & FieldOptions))[],
}>();
</script>

<template>
    <form class="flex flex-col gap-2" @submit.prevent="onSubmit">
        <div v-for="{ label, name, as: asType, type, ...attrs } in fields">
            <label>
                <span class="font-medium">
                    {{ label }}
                </span>
                <div class="flex flex-row gap-2">
                    <Field
                        :as="asType"
                        :name
                        :type
                        :disabled="isLoading"
                        :error="errors[name]"
                        v-bind="attrs"
                        class="w-full outline-none ring-1 focus:ring-2 ring-main-50/10 focus:ring-main-50/25 p-2 rounded-md"
                        :class="{
                            'ring-danger-bg!': errors[name],
                            'opacity-50': isLoading,
                        }">
                    </Field>
                </div>
                <ErrorMessage :name class="text-sm text-danger-txt" />
            </label>
        </div>
        
        <div class="flex justify-end mt-2">
            <ButtonPrimary 
                type="submit" 
                :disabled="isLoading">
                <Icon v-if="!isLoading" :name="submitBtn.icon" />
                <LoadingIcon v-else />
                {{ submitBtn.label }}
            </ButtonPrimary>
        </div>
    </form>
</template>