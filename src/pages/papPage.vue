<template>
  {{ lastName }}
  <div
    v-if="
      customQR === undefined ||
      name === undefined ||
      lastName === undefined ||
      id === undefined
    "
  >
    <h1 class="underline">{{ t("error-is-not-connected") }}</h1>
    <div>
      <div>{{ t("error-not-connected-description") }}</div>
      <UiLink to="/intro">{{ t("start-form") }}</UiLink>
    </div>
  </div>
  <div v-else-if="!isActivist" class="errored">
    <h1 class="underline">{{ t("error-is-not-activist") }}</h1>
    <div>
      <div>{{ t("error-not-activist-description") }}</div>
      <UiLink to="/joined">{{ t("becam-activist") }}</UiLink>
    </div>
  </div>
  <div v-else>
    <h1>{{ t("welcome-in-pap") }}</h1>
    <div>{{ t("welcome-in-pap-description") }}</div>
    <div>{{ t("authenticate-from", { name, lastName, id }) }}</div>
    <ul v-if="customQR.length > 0">
      <li v-for="qr in customQR" :key="qr.id">
        <span>{{ qr.reason }}</span>
        <span>{{ qr.id }}</span>
      </li>
    </ul>
    <FormInput
      type="string"
      :label="t('new-qr-code-label')"
      :help="t('new-qr-code-help')"
      :placeholder="t('new-qr-code-placeholder')"
      @input="(r) => (newQrCodeReason = r)"
    />
    <UiLink>{{ t("create-new-invitation-link") }}</UiLink>
  </div>
</template>

<script setup lang="ts">
import FormInput from "@/components/formElement/FormInput.vue";
import UiLink from "@/components/ui/uiLink.vue";
import reqestManager from "@/tools/reqestManager";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const customQR = computed(() => reqestManager.getCustomQR());
const id = computed(() => reqestManager.getId());
const isActivist = computed(() => reqestManager.getActivist());
const lastName = computed(() => reqestManager.getLasname());
const name = computed(() => reqestManager.getName());

const newQrCodeReason = ref("");
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
