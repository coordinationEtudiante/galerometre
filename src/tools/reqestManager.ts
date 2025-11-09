/// <reference types="vite/client" />

import type { pageType } from "@/types/request";
import { getLocalResponse, uid } from "./jsTools";
import { ref } from "vue";

class RequestManager {
  private static instance: RequestManager;
  private user: {
    id: string;
    location: string | undefined;
    email: string | undefined;
    phone: string | undefined;
    name: string | undefined;
    lastname: string | undefined;
    activist: string | undefined;
    afiliation: string | undefined;
  };

  private customQR = ref<
    Array<{
      id: string;
      location: string;
      email: string;
      phone: string;
      name: string;
      lastname: string;
      activist: true;
      afiliation: string;
      reason: string;
    }>
  >([]);
  link: string;

  private dependencyQuestion: Array<{
    questionToShowID: number;
    ifAnswer: string;
    ifQuestion: number;
  }> = [];

  static getInstance(): RequestManager {
    if (!RequestManager.instance) {
      RequestManager.instance = new RequestManager();
    }
    return RequestManager.instance;
  }

  constructor() {
    let id;
    if (typeof window.localStorage.getItem("id") == "string") {
      id = window.localStorage.getItem("id") || uid();
    } else {
      id = uid();
    }

    this.user = {
      id,
      location: undefined,
      email: undefined,
      phone: undefined,
      name: undefined,
      lastname: undefined,
      activist: undefined,
      afiliation: undefined,
    };

    this.updateUser(JSON.parse(window.localStorage.getItem("user") ?? "{}"));
    this.customQR.value =
      JSON.parse(window.localStorage.getItem("customQR") ?? "[]") ?? [];
    this.link =
      import.meta.env.VITE_API_URL ?? "https://api.precariscore.qamp.fr";
  }

  async createAccont(
    user: {
      location?: string;
      email?: string;
      phone?: string;
      name?: string;
      lastname?: string;
      activist?: string;
      afiliation?: string;
    },
    camp_id: string = "001"
  ) {
    window.localStorage.setItem("id", this.user.id);

    const existingId = window.localStorage.getItem("account_created");
    if (existingId === this.user.id) {
      await this.dependency();
      return true;
    }

    this.updateUser(user);

    const response = await fetch(this.link + "/rest/respondent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...this.user,
        camp_id,
        resp_id: this.user.id,
        id_from: this.user.afiliation,
      }),
    });

    if (response.status === 200) {
      window.localStorage.setItem("account_created", this.user.id);
      await this.dependency();
      return true;
    }

    await this.dependency();
    return false;
  }

  updateAccount(
    user: {
      location?: string;
      email?: string;
      phone?: string;
      name?: string;
      lastname?: string;
      activist?: string;
      afiliation?: string;
    },
    camp_id: string = "001"
  ) {
    window.localStorage.setItem("id", this.user.id);

    this.updateUser(user);

    const request = new XMLHttpRequest();
    request.open("PUT", this.link + "/rest/respondent");
    request.setRequestHeader("Content-Type", "application/json");

    const body = JSON.stringify({
      ...this.user,
      camp_id,
      resp_id: this.user.id,
      id_from: this.user.afiliation,
    });

    request.send(body);
    return request.status === 200;
  }

  questions(
    language: string = "fr",
    pages: number = 1
  ):
    | {
        question: pageType;
        localDependency: {
          questionToShowID: number;
          conditions: { ifAnswer: string; ifQuestion: number };
        }[];
      }
    | undefined {
    const request = new XMLHttpRequest();
    request.open("GET", this.link + `/rest/form/${language}/${pages}`, false);
    request.setRequestHeader("Content-Type", "application/json");
    request.send();

    if (request.status != 200) {
      return;
    }

    const result = JSON.parse(JSON.parse(request.responseText));
    const dependency = this.dependencyQuestion;
    // consolidate dependencies
    const localDependency: {
      questionToShowID: number;
      conditions: { ifAnswer: string; ifQuestion: number };
    }[] = [];
    const consolidatedDependencies: {
      questionToShowID: number;
      conditions: Array<{ ifAnswer: string; ifQuestion: number }>;
    }[] = [];

    dependency.forEach((dep) => {
      if (
        Math.floor(dep.questionToShowID / 100) == pages &&
        Math.floor(dep.ifQuestion / 100) == pages
      ) {
        localDependency.push({
          questionToShowID: dep.questionToShowID,
          conditions: { ifAnswer: dep.ifAnswer, ifQuestion: dep.ifQuestion },
        });
      } else {
        const existing = consolidatedDependencies.find(
          (c) => c.questionToShowID === dep.questionToShowID
        );
        if (existing) {
          existing.conditions.push({
            ifAnswer: dep.ifAnswer,
            ifQuestion: dep.ifQuestion,
          });
        } else {
          consolidatedDependencies.push({
            questionToShowID: dep.questionToShowID,
            conditions: [
              { ifAnswer: dep.ifAnswer, ifQuestion: dep.ifQuestion },
            ],
          });
        }
      }
    });

    // result.fields.[xx].isVisible = false;
    localDependency.forEach((dep) => {
      const question = result.fields.find(
        (q: { qu_id: number }) => q.qu_id === dep.questionToShowID
      );
      if (question) question.isVisible = false;
    });

    // Filter questions based on dependencies and local responses
    // if dependency is not in answered questions, show it
    // if dependency is on answered questions, check if the answer is the same as the one in dependency
    const filter = result.fields.filter((res: { qu_id: number }) => {
      const dependency = consolidatedDependencies.find(
        (dep) => dep.questionToShowID === res.qu_id
      );
      if (!dependency) return true;

      // All conditions must be satisfied for the question to be shown expect if tow conditions are on the same question. in this case, only one needs to be satisfied

      // Group conditions by ifQuestion
      const conditionsByQuestion = dependency.conditions.reduce(
        (acc, cond) => {
          if (!acc[cond.ifQuestion]) acc[cond.ifQuestion] = [];
          acc[cond.ifQuestion].push(cond.ifAnswer);
          return acc;
        },
        {} as Record<number, string[]>
      );

      // For each ifQuestion, at least one answer must match
      return Object.entries(conditionsByQuestion).every(
        ([ifQuestion, answers]) => {
          const response = getLocalResponse(Number(ifQuestion));
          if (response === null) return true;
          return answers.includes(response);
        }
      );
    });

    result.fields = filter;
    return { question: result, localDependency };
  }

  async dependency() {
    if (this.dependencyQuestion.length > 0) return this.dependencyQuestion;

    const response = await fetch(this.link + `/rest/dependency`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    if (response.status == 200) {
      this.dependencyQuestion = JSON.parse(result);
      return this.dependencyQuestion;
    }
  }

  sendResponse(
    answers: Array<{ id: number | string; answer: string | undefined }>,
    method: string = "POST"
  ): boolean {
    const remainingAnswers: Array<{
      id: number | string;
      answer: string | undefined;
    }> = [];

    for (const { id: questionId, answer } of answers) {
      if (!answer) continue;

      const request = new XMLHttpRequest();
      request.open(method, this.link + `/rest/answer`, false);
      request.setRequestHeader("Content-Type", "application/json");
      request.send(
        JSON.stringify({
          resp_id: this.user.id,
          qu_id: questionId,
          ans: answer ? String(answer) : answer,
        })
      );

      if (request.status == 400 && method != "PUT") {
        // Add this answer and all remaining ones to retry with PUT
        remainingAnswers.push({ id: questionId, answer });
      } else if (request.status != 200) {
        console.error(
          `Error sending response for question ${questionId}: ${request.statusText}`
        );
        return false;
      }
    }

    // If we had 403 errors, retry only those answers with PUT
    if (remainingAnswers.length > 0 && method === "POST") {
      return this.sendResponse(remainingAnswers, "PUT");
    }

    return true;
  }

  score() {
    const request = new XMLHttpRequest();
    request.open("GET", this.link + `/rest/score/${this.user.id}`, false);
    request.setRequestHeader("Content-Type", "application/json");
    request.send();

    if (request.status != 200) {
      return -1;
    }

    return JSON.parse(JSON.parse(request.responseText));
  }

  createCustomQrcode(reason: string) {
    if (
      this.user.location === undefined ||
      this.user.email === undefined ||
      this.user.phone === undefined ||
      this.user.name === undefined ||
      this.user.lastname === undefined
    ) {
      console.log(
        this.user.location === undefined,
        this.user.email === undefined,
        this.user.phone === undefined,
        this.user.name === undefined,
        this.user.lastname === undefined
      );
      return false;
    }

    const qrUID = uid();
    this.customQR.value.push({
      location: this.user.location,
      email: this.user.email,
      phone: this.user.phone,
      name: this.user.name,
      lastname: this.user.lastname,
      afiliation: this.user.id,
      activist: true,
      id: qrUID,
      reason,
    });

    window.localStorage.setItem(
      "customQR",
      JSON.stringify(this.customQR.value)
    );

    return qrUID;
  }

  getId() {
    return this.user.id;
  }

  getActivist() {
    return this.user.activist;
  }

  getName() {
    return this.user.name;
  }

  getLasname() {
    console.log(this.user);
    return this.user.lastname;
  }

  getCustomQRs() {
    return this.customQR;
  }

  private updateUser(obj: Record<string, string>) {
    for (const [key, value] of Object.entries(this.user)) {
      // @ts-expect-error 7053 \\ this.user is an user obj so this.user[key], is not unknow
      this.user[key] = obj[key] ? obj[key] : value;
    }

    window.localStorage.setItem("user", JSON.stringify(this.user));
  }
}

export default RequestManager.getInstance();
