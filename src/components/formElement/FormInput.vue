<template>
  <span class="input-group" :class="errored ? 'errored' : ''">
    <label :for="inputId">{{ label }}</label>
    <UiInfo v-if="help" :message="help" />
    <input
      :id="inputId"
      v-model="inputValue"
      :type="type"
      :placeholder="placeholder"
      @input="onInput"
    />
  </span>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useId } from "vue";
import UiInfo from "../ui/uiInfo.vue";

const inputId = useId();
const inputValue = ref("");

const { label, placeholder, type, value } = defineProps<{
  label: string;
  type: string;
  value?: string;
  help?: string;
  placeholder?: string;
  errored?: boolean;
}>();

const emit = defineEmits<{
  (e: "input", value: string): void;
}>();

function onInput(e: Event) {
  if ((e.target as HTMLInputElement).value && type == "number") {
    emit("input", inputValue.value);
  } else if (type !== "number") {
    emit("input", inputValue.value);
  }
}

// Synchronize the initial value if provided
if (typeof value !== "undefined") {
  inputValue.value = value;
}
</script>

<style lang="scss" scoped>
.input-group {
  display: flex;
  flex-direction: column;
  font-size: small;
  width: 100%;
  gap: 1em;
  input {
    background-color: #f3f3f5;
    border: 1px solid #f3f3f5;
    padding: 0.8rem;
    border-radius: 10px;
    font-size: medium;
  }
}

.errored {
  input {
    border: 1px solid var(--red-dark);
  }
}
</style>
