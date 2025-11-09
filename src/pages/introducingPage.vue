<template>
  <div class="page">
    <h1>{{ t("intro-title") }}</h1>
    <p class="subtitle">{{ t("intro-subtitle") }}</p>
    <div class="form">
      <FormSearch
        :label="t('form-registration-university')"
        :searchList="universityLocation"
        @input="(e: string) => (location = e)"
        other
        :errored="requiredOnSubmit && location === ''"
      />
    </div>
    <UiLink @click="next">{{ t("next-pages") }}</UiLink>
  </div>
</template>

<script setup lang="ts">
import FormSearch from "@/components/formElement/formSearch.vue";
import UiLink from "@/components/ui/uiLink.vue";
import { router } from "@/main";
import { saveResponse } from "@/tools/jsTools";
import reqestManager from "@/tools/reqestManager";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const location = ref("");
const requiredOnSubmit = ref(false);

import universityLocation from "@/assets/universityPlacement.json";

function next() {
  requiredOnSubmit.value = false;
  console.log(location.value);
  if (location.value === "") {
    requiredOnSubmit.value = true;
    return;
  }

  saveResponse("location", location.value);

  reqestManager.updateAccount({ location: location.value });

  router.push({ path: "/page/1" });
}
</script>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  margin: 2vh;
  padding: 2vh;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
  background-color: white;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  gap: 2vh;

  h1,
  p {
    margin: 0 auto;
    text-align: center;
  }

  p {
    font-size: small;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
