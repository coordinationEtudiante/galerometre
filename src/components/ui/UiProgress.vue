<template>
  <span class="progress-container">
    <div class="progress-bar-container">
      <div
        class="progress-bar-indicator"
        :style="{ width: (steps / max) * 100 + '%' }"
      />
      <div class="motivationIcon" ref="motivationIconRef">
        {{ getRandom(motivationIcon.get(steps) ?? ["🔥"]) }}
      </div>
    </div>
    <div class="progress-info">
      {{ t("progress.progression", { max, steps }) }}
    </div>
  </span>
</template>

<script setup lang="ts">
import { getRandom } from "@/tools/jsTools";
import { useI18n } from "vue-i18n";
import { ref, watch, nextTick } from "vue";
import confetti from "canvas-confetti";

const { steps } = defineProps<{
  max: number;
  steps: number;
}>();

const { t } = useI18n();
const motivationIcon = new Map<number, string[]>();

motivationIcon.set(1, ["🙏", "😱", "🤷‍♂️"]);
motivationIcon.set(2, ["🌊", "🧔", "👩‍🦰"]);
motivationIcon.set(3, ["🚀", "💪", "👨‍💻"]);
motivationIcon.set(4, ["🤝", "📋", "🎉"]);
motivationIcon.set(5, ["🌈", "🔥", "🔪"]);
motivationIcon.set(6, ["💭", "🗣️", "🤝"]);
motivationIcon.set(7, ["🎉", "🤯", "🙂‍↕️"]);
motivationIcon.set(8, ["❤️", "😍", "🫵"]);

const motivationIconRef = ref<HTMLElement | null>(null);

// confeti on change
watch(
  () => steps,
  async (newVal, oldVal) => {
    if (oldVal !== undefined && newVal !== oldVal) {
      await nextTick();
      if (motivationIconRef.value) {
        const el = motivationIconRef.value;
        const rect = el.getBoundingClientRect();
        //center of icon
        const x = (rect.left + rect.right) / 2 / window.innerWidth;
        const y = (rect.top + rect.bottom) / 2 / window.innerHeight;
        confetti({
          particleCount: 80,
          spread: 720,
          angle: 280,
          startVelocity: 5,
          origin: { x, y },
        });
      }
    }
  }
);
</script>

<style lang="scss" scoped>
.progress-container {
  display: flex;
  flex-direction: column;

  .progress-bar-container {
    height: 25px;
    margin: 2px 2px;
    background: whitesmoke;
    position: relative;
    align-items: center;
    border-radius: 25px;
    display: flex;

    .motivationIcon {
      margin-left: -2em;
      z-index: 9;
    }
  }

  .progress-bar-indicator {
    height: 100%;
    border-radius: 25px;
    transition-duration: 1000ms;
    /* this will do the magic */
    -webkit-mask: linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0);
  }
  .progress-bar-indicator::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: linear-gradient(
      to right,
      var(--purple-dark),
      var(--green-dark),
      var(--blue-dark)
    );
  }

  .progress-info {
    font-size: 14px;
  }
}
</style>
