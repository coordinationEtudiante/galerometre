<template>
  <div class="page">
    <h1>{{ t("register-title") }}</h1>
    <p class="subtitle">{{ t("register-subtitle") }}</p>
    <div class="form">
      <FormInput
        :label="t('form-registration-firstname')"
        placeholder="Martin"
        type="text"
        @input="(value) => (firstName = value)"
        :errored="requiredOnSubmit && firstName === ''"
      />
      <FormInput
        :label="t('form-registration-name')"
        placeholder="Léa"
        type="text"
        @input="(value) => (name = value)"
        :errored="requiredOnSubmit && name === ''"
      />
      <FormInput
        type="tel"
        :label="t('form-registration-phone')"
        placeholder="0712345678"
        @input="(value) => (tel = value)"
        :errored="
          requiredOnSubmit && !phoneNumberCheck(clearPhone(tel)) && tel != '-'
        "
      ></FormInput>
      <FormInput
        type="mail"
        :label="t('form-registration-mail')"
        :placeholder="`${name ? name : 'pierre'}.${firstName ? firstName : 'martin'}@mail.com`"
        @input="(value) => (email = value)"
        :errored="requiredOnSubmit && email === ''"
      ></FormInput>
      <div />
    </div>
    <UiLink @click="next">{{ t("see-result") }}</UiLink>
  </div>
</template>

<script setup lang="ts">
import FormInput from "@/components/formElement/FormInput.vue";
import UiLink from "@/components/ui/uiLink.vue";
import { clearPhone, phoneNumberCheck, saveResponse } from "@/tools/jsTools";
import reqestManager from "@/tools/reqestManager";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();

const name = ref("");
const firstName = ref("");
const tel = ref("");
const email = ref("");
const requiredOnSubmit = ref(false);

function next() {
  requiredOnSubmit.value = false;

  if (
    email.value === "" ||
    (!phoneNumberCheck(clearPhone(tel.value)) && tel.value != "-") ||
    firstName.value === "" ||
    name.value === ""
  ) {
    requiredOnSubmit.value = true;
    return;
  }

  saveResponse("name", name.value);
  saveResponse("firstName", firstName.value);

  reqestManager.updateAccount({
    email: email.value,
    phone: clearPhone(tel.value),
    name: firstName.value,
    lastname: name.value,
  });

  router.push({ path: "/end" });
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

  h1 {
    text-align: center;
  }

  h1,
  p {
    margin: 0 auto;
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
