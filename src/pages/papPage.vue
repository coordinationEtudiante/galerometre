<template>
  <div class="errored">
    <h1 class="underline">{{ t("error-form-is-not-compete") }}</h1>
    <div>
      <div>{{ t("error-form-not-competed-description") }}</div>
      <UiLink to="/intro">{{ t("compete-form") }}</UiLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import UiLink from "@/components/ui/uiLink.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style scoped lang="scss">
.errored {
  padding: 1em;
  .underline {
    text-decoration-line: underline;
    text-decoration-thickness: 4px;
    text-underline-offset: 8px;
  }

  div {
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 2em;
  }
}
</style>
