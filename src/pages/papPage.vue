<template>
  <div
    v-if="name === undefined || lastName === undefined || id === undefined"
    class="errored"
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
  <div v-else class="page">
    <h1>{{ t("welcome-in-pap") }}</h1>
    <div>{{ t("welcome-in-pap-description") }}</div>
    <div>{{ t("authenticate-from", { name, lastName, id }) }}</div>
  </div>
  <div
    class="page"
    v-if="name !== undefined && lastName !== undefined && id !== undefined"
  >
    <ul v-if="customQRs.length > 0" class="qrList">
      <li
        v-for="qr in customQRs"
        :key="qr.id"
        :class="{ selected: selectedQr?.id == qr.id }"
        :onclick="
          () => {
            selectedQr = qr;
          }
        "
      >
        <span>{{ qr.reason }}</span>
        <span>{{ qr.id }}</span>
      </li>
    </ul>
    <FormInput
      type="string"
      :label="t('new-qr-code-label')"
      :help="t('new-qr-code-help')"
      :placeholder="t('new-qr-code-placeholder')"
      @input="(r: string) => (newQrCodeReason = r)"
    />
    <UiLink
      :onclick="createNewLink"
      :active="newQrCodeReason != undefined && newQrCodeReason != ''"
    >
      {{ t("create-new-invitation-link") }}
    </UiLink>
  </div>
  <div
    class="page"
    v-if="
      selectedQr &&
      name !== undefined &&
      lastName !== undefined &&
      id !== undefined
    "
  >
    <h1>{{ t("your-qr-code", { reason: selectedQr.reason }) }}</h1>
    <img
      :src="qrcode"
      :alt="`https://precariscore.qamp.fr/#/${selectedQr.id}`"
    />
  </div>
</template>

<script setup lang="ts">
import FormInput from "@/components/formElement/FormInput.vue";
import UiLink from "@/components/ui/uiLink.vue";
import reqestManager from "@/tools/reqestManager";
import { useQRCode } from "@vueuse/integrations/useQRCode.mjs";
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const customQRs = reqestManager.getCustomQRs();
const id = computed(() => reqestManager.getId());
const isActivist = computed(() => reqestManager.getActivist());
const lastName = computed(() => reqestManager.getLasname());
const name = computed(() => reqestManager.getName());

const newQrCodeReason = ref("");
const selectedQr = ref<
  | {
      id: string;
      location: string;
      email: string;
      phone: string;
      name: string;
      lastname: string;
      activist: true;
      afiliation: string;
      reason: string;
    }
  | undefined
>();

const qrUrl = computed(() =>
  selectedQr.value !== undefined
    ? `https://precariscore.qamp.fr/#/${selectedQr.value.id}`
    : ""
);
const qrcode = useQRCode(qrUrl);

onMounted(() => {
  if (customQRs.value && customQRs.value.length > 1)
    selectedQr.value = customQRs.value[0];
});

function createNewLink() {
  //maybe handle error
  reqestManager.createCustomQrcode(newQrCodeReason.value);
}
</script>

<style scoped lang="scss">
.errored {
  margin: 1em 2vh;
  padding: 2em;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  background-color: white;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  gap: 2vh;

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

.page {
  margin: 1em 2vh;
  padding: 2em;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  background-color: white;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  gap: 2vh;

  .qrList {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 0;

    li {
      border: 1px solid silver;
      color: gray;
      padding: 10px;
      display: flex;
      gap: 1em;
      border-radius: 5px;

      span:nth-child(2) {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      &.selected {
        background-color: black;
        color: white;
      }
    }
  }
}
</style>
