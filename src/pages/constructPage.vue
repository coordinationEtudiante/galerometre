<template>
  <div v-if="!questionData.data">
    <p>Error while loading the form</p>
  </div>
  <template v-else>
    <div class="constructPage">
      <div class="page">
        <UiProgress :max="8" :steps="vPage"></UiProgress>
      </div>
      <div class="page">
        <h1 v-if="questionData.data.name" class="title">
          {{ questionData.data.name }}
        </h1>
        <p v-if="questionData.data.description" class="subtitle">
          {{ questionData.data.description }}
        </p>
        <template v-for="field in questionData.data.fields" :key="field.qu_id">
          <template
            v-if="
              field.qu_format === 'text' &&
              fieldVisibility[field.qu_id] != false
            "
          >
            <FormInput
              :label="field.qu_text"
              type="text"
              @input="updateAnswer(field.qu_id, $event)"
              :errored="requiredOnSubmit && !getAnswer(field.qu_id)"
              :help="field.help"
            />
          </template>
          <template
            v-else-if="
              (field.qu_format === 'number' ||
                (field.qu_format as any) === 'delay') &&
              fieldVisibility[field.qu_id] != false
            "
          >
            <FormInput
              :label="field.qu_text"
              type="number"
              @input="updateAnswer(field.qu_id, $event)"
              :errored="requiredOnSubmit && getAnswer(field.qu_id) == undefined"
              :help="field.help"
            />
          </template>
          <template
            v-else-if="
              field.qu_format === 'select' &&
              field.qu_issues &&
              fieldVisibility[field.qu_id] != false
            "
          >
            <FormSelect
              :label="field.qu_text"
              :options="
                Object.entries(field.qu_issues).map(([key, label]) => ({
                  label: label as string,
                  value: String(Number(key) + 1),
                }))
              "
              other
              @input="updateAnswer(field.qu_id, $event)"
              :errored="requiredOnSubmit && !getAnswer(field.qu_id)"
              :help="field.help"
            />
          </template>
          <template
            v-else-if="
              field.qu_format === 'radio' &&
              field.qu_issues &&
              fieldVisibility[field.qu_id] != false
            "
          >
            <FormRadio
              :label="field.qu_text"
              :options="
                Object.entries(field.qu_issues).map(([key, label]) => ({
                  label: label as string,
                  value: String(Number(key) + 1),
                }))
              "
              @input="updateAnswer(field.qu_id, $event)"
              :errored="requiredOnSubmit && !getAnswer(field.qu_id)"
              :help="field.help"
            />
          </template>
          <template
            v-else-if="
              field.qu_format === 'true_false' &&
              field.qu_issues &&
              fieldVisibility[field.qu_id] != false
            "
          >
            <FormTrueFalse
              :label="field.qu_text"
              :options="
                Object.entries(field.qu_issues).map(([key, label]) => ({
                  label: label as string,
                  value: String(Number(key) + 1),
                }))
              "
              @input="updateAnswer(field.qu_id, $event)"
              :errored="requiredOnSubmit && !getAnswer(field.qu_id)"
              :help="field.help"
            />
          </template>
        </template>
        <div class="links">
          <UiLink :active="vPage > 1" @click="prev">{{
            t("previous-page")
          }}</UiLink>
          <UiLink @click="next">{{ t("next-page") }}</UiLink>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import FormInput from "@/components/formElement/FormInput.vue";
import FormRadio from "@/components/formElement/FormRadio.vue";
import FormSelect from "@/components/formElement/FormSelect.vue";
import FormTrueFalse from "@/components/formElement/FormTrueFalse.vue";
import UiLink from "@/components/ui/uiLink.vue";
import UiProgress from "@/components/ui/UiProgress.vue";
import { saveResponse } from "@/tools/jsTools";
import reqestManager from "@/tools/reqestManager";
import type { pageType } from "@/types/request";
import { onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";

const { locale, t } = useI18n();
const router = useRouter();

const pageLine = [
  [-Infinity, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, Infinity],
];

const vPage = ref(1); // page dynamique locale

const requiredOnSubmit = ref(false);
const response = ref<{ id: number | string; answer: string }[]>([]);
const fieldVisibility = ref<Record<number, boolean>>({});

type LocalDependency = {
  questionToShowID: number;
  conditions: { ifAnswer: string; ifQuestion: number };
};

const questionData = ref<{
  data: pageType;
  localDependency: LocalDependency[] | undefined;
}>({ data: undefined, localDependency: undefined });

function loadQuestionData() {
  try {
    const result = reqestManager.questions(locale.value, vPage.value);
    if (!result || !result.question) {
      questionData.value = { data: undefined, localDependency: undefined };
      return;
    }

    // Iinitialize visibility for all fields if not already set
    if (result.question.fields) {
      result.question.fields.forEach((field) => {
        if (!(field.qu_id in fieldVisibility.value)) {
          fieldVisibility.value[field.qu_id] = field.isVisible ?? true;
        }
      });
    }

    questionData.value = {
      data: result.question,
      localDependency: result.localDependency,
    };
  } catch (error) {
    console.error("Error loading questions:", error);
    questionData.value = { data: undefined, localDependency: undefined };
  }
}

function updateAnswer(id: number, value: string) {
  // update or add the answer
  const existingIndex = response.value.findIndex((res) => res.id === id);
  if (existingIndex !== -1) {
    response.value[existingIndex].answer = value;
  } else {
    response.value.push({ id, answer: value });
  }

  saveResponse(id, value);

  // manage dependencies
  const updatedDependencies = questionData.value.localDependency?.filter(
    (dep) => Number(dep.conditions.ifQuestion) == id
  );

  if (updatedDependencies && updatedDependencies.length > 0) {
    updatedDependencies.forEach((dep) => {
      const shouldBeVisible = value === dep.conditions.ifAnswer;
      fieldVisibility.value[dep.questionToShowID] = shouldBeVisible;
    });
  }
}

function getAnswer(id: number) {
  return response.value.find((res) => res.id === id)?.answer;
}

function next() {
  if (!questionData.value.data) return;

  if (
    questionData.value.data.fields.some((f) => {
      const answer = getAnswer(f.qu_id);
      const isEmpty = answer === undefined || answer === null || answer === "";
      return fieldVisibility.value[f.qu_id] != false && isEmpty;
    })
  ) {
    requiredOnSubmit.value = true;
    return;
  }

  try {
    const sendResult = reqestManager.sendResponse(
      questionData.value.data.fields.map((f) => ({
        id: f.qu_id,
        answer: getAnswer(f.qu_id) ?? "",
      })) ?? []
    );

    if (!sendResult) {
      alert("Error while sending the response");
      return;
    }

    const nextPage = pageLine.find((e) => e[0] === Number(vPage.value))?.[1];
    if (nextPage == Infinity) {
      router.push({ path: `/register` });
      return;
    }

    vPage.value = nextPage ?? vPage.value + 1;
    requiredOnSubmit.value = false;
    loadQuestionData();
  } catch (error) {
    console.error("Error processing next:", error);
    alert("An error occurred. Please try again.");
  }
}

function prev() {
  if (vPage.value <= 1) return;
  const prevPage = pageLine.find((e) => e[1] === vPage.value)?.[0];
  if (prevPage === -Infinity || prevPage === undefined) return;
  vPage.value = prevPage;
  requiredOnSubmit.value = false;
  loadQuestionData();
}

onMounted(() => {
  requiredOnSubmit.value = false;
  loadQuestionData();
});

watch(
  () => [vPage.value, locale.value],
  () => {
    requiredOnSubmit.value = false;
    loadQuestionData();
    window.scrollTo(0, 0);
  }
);
</script>

<style lang="css" scoped>
.constructPage {
  height: 100%;
  .page {
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

    .links {
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
