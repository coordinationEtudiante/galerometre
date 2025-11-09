<template>
  <RouterLink
    v-if="to"
    :to
    class="ui-link"
    :class="{ inline, styled: !inline, active }"
    @click="$emit('click')"
  >
    <slot />
  </RouterLink>
  <a
    v-else-if="href"
    :href
    class="ui-link"
    :class="{ inline, styled: !inline, active }"
    @click="$emit('click')"
  >
    <slot />
  </a>
  <div
    v-else
    class="ui-link"
    :class="{ inline, styled: !inline, active }"
    @click="$emit('click')"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
const {
  href,
  to,
  inline = false,
  active = true,
} = defineProps<{
  href?: string;
  to?: string;
  inline?: boolean;
  active?: boolean;
}>();

defineEmits(["click"]);
</script>

<style scoped lang="scss">
.ui-link {
  color: var(--brand-ink);
  text-decoration: underline;
}

.styled {
  color: white;
  text-align: center;
  text-decoration: none;
  border: none;
  padding: 1em;
  border-radius: 10px;
  font-size: 1em;
  cursor: pointer;

  &.active {
    background-color: black;
  }

  &:not(.active) {
    background-color: gray;
  }
}
</style>
