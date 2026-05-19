<template>
  <div class="qs-page">
    <div class="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 标题区 -->
      <div class="qs-header">
        <h1 class="qs-title">{{ t('quickStart.pageTitle') }}</h1>
        <p class="qs-subtitle">{{ t('quickStart.pageSubtitle') }}</p>
      </div>

      <!-- Tab 切换 -->
      <div class="qs-tabs">
        <button
          class="qs-tab"
          :class="{ active: activeTab === 'agent' }"
          @click="activeTab = 'agent'; agentStep = 0"
        >
          <component :is="Bot" :size="16" :stroke-width="2" />
          <span>{{ t('quickStart.tabAgent') }}</span>
        </button>
        <button
          class="qs-tab"
          :class="{ active: activeTab === 'manual' }"
          @click="activeTab = 'manual'; manualStep = 0"
        >
          <component :is="Terminal" :size="16" :stroke-width="2" />
          <span>{{ t('quickStart.tabManual') }}</span>
        </button>
      </div>

      <!-- Agent Tab -->
      <div v-if="activeTab === 'agent'" class="qs-wizard">
        <button class="qs-wizard-arrow" :disabled="agentStep === 0" @click="agentStep--">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <div class="qs-wizard-inner">
          <!-- 步骤条 -->
          <div class="qs-step-nav">
            <button
              v-for="(step, idx) in agentSteps"
              :key="idx"
              class="qs-step-nav-item"
              :class="{ 'is-active': agentStep === idx, 'is-completed': agentStep > idx }"
              @click="agentStep = idx"
            >
              <span class="qs-step-nav-num">{{ idx + 1 }}</span>
              <span class="qs-step-nav-label">{{ step.label }}</span>
            </button>
          </div>

          <!-- 内容面板 -->
          <div class="qs-step-panels">
            <div v-for="(step, idx) in agentSteps" :key="idx" v-show="agentStep === idx" class="qs-step-panel">
              <div class="qs-panel-title">{{ step.label }}</div>
              <div class="qs-panel-subtitle">{{ step.description }}</div>

              <template v-for="(cmd, ci) in step.commands" :key="ci">
                <div v-if="ci > 0" class="qs-prompt-or">
                  <span class="qs-prompt-or-text">{{ t('quickStart.or') }}</span>
                </div>
                <div class="qs-prompt-bubble">
                  <div class="qs-prompt-row">
                    <div class="qs-prompt-text">
                      <span class="qs-quote-mark" aria-hidden="true">"</span>{{ cmd.code }}<span class="qs-quote-mark" aria-hidden="true">"</span>
                    </div>
                    <button class="qs-prompt-copy" @click="copyCommand('agent', idx, ci, cmd.code)">
                      <component :is="copiedKey === `agent-${idx}-${ci}` ? Check : Clipboard" :size="14" :stroke-width="2" />
                      {{ copiedKey === `agent-${idx}-${ci}` ? t('quickStart.copied') : t('quickStart.copy') }}
                    </button>
                  </div>
                </div>
              </template>

              <p v-if="step.note" class="qs-step-note">{{ step.note }}</p>
            </div>
          </div>
        </div>

        <button class="qs-wizard-arrow" :disabled="agentStep === agentSteps.length - 1" @click="agentStep++">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <!-- Manual Tab -->
      <div v-if="activeTab === 'manual'" class="qs-wizard">
        <button class="qs-wizard-arrow" :disabled="manualStep === 0" @click="manualStep--">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <div class="qs-wizard-inner">
          <div class="qs-step-nav">
            <button
              v-for="(section, idx) in manualSections"
              :key="idx"
              class="qs-step-nav-item"
              :class="{ 'is-active': manualStep === idx, 'is-completed': manualStep > idx }"
              @click="manualStep = idx"
            >
              <span class="qs-step-nav-num">{{ manualEmojis[idx] }}</span>
              <span class="qs-step-nav-label">{{ section.title }}</span>
            </button>
          </div>

          <div class="qs-step-panels">
            <div v-for="(section, idx) in manualSections" :key="idx" v-show="manualStep === idx" class="qs-step-panel">
              <div class="qs-panel-title">{{ section.title }}</div>
              <div class="qs-panel-subtitle">{{ section.desc }}</div>

              <div v-for="(block, bi) in section.blocks" :key="bi" class="qs-terminal">
                <div class="qs-term-bar">
                  <span class="qs-term-dots"><i></i><i></i><i></i></span>
                  <span class="qs-term-name">{{ block.label }}</span>
                  <button class="qs-prompt-copy qs-term-copy" @click="copyCommand('m', idx, bi, block.code)">
                    <component :is="copiedKey === `m-${idx}-${bi}` ? Check : Clipboard" :size="14" :stroke-width="2" />
                    {{ copiedKey === `m-${idx}-${bi}` ? t('quickStart.copied') : t('quickStart.copy') }}
                  </button>
                </div>
                <pre class="qs-term-body" v-html="termHtml(block.code)"></pre>
              </div>
            </div>
          </div>
        </div>

        <button class="qs-wizard-arrow" :disabled="manualStep === manualSections.length - 1" @click="manualStep++">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      <!-- FAQ 区域 -->
      <div class="qs-faq">
        <h2 class="qs-faq-title">{{ t('quickStart.faqTitle') }}</h2>

        <div class="qs-faq-tabs">
          <button
            class="qs-faq-tab"
            :class="{ active: faqTab === 'agent' }"
            @click="faqTab = 'agent'; openFaq = -1"
          >{{ t('quickStart.faqTabAgent') }}</button>
          <button
            class="qs-faq-tab"
            :class="{ active: faqTab === 'user' }"
            @click="faqTab = 'user'; openFaq = -1"
          >{{ t('quickStart.faqTabUser') }}</button>
          <button
            class="qs-faq-tab"
            :class="{ active: faqTab === 'admin' }"
            @click="faqTab = 'admin'; openFaq = -1"
          >{{ t('quickStart.faqTabAdmin') }}</button>
        </div>

        <div class="qs-faq-list">
          <div
            v-for="(item, fi) in currentFaqs"
            :key="fi"
            class="qs-faq-item"
            :class="{ open: openFaq === fi }"
          >
            <button class="qs-faq-q" @click="openFaq = openFaq === fi ? -1 : fi">
              <span>{{ item.q }}</span>
              <svg class="qs-faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="qs-faq-a" v-html="item.a"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { Clipboard, Check, Bot, Terminal } from 'lucide-vue-next'

const { t } = useI18n()
const activeTab = ref<'agent' | 'manual'>('agent')
const agentStep = ref(0)
const manualStep = ref(0)
const copiedKey = ref('')
const manualEmojis = ['📦', '🔍', '🚀', '🔌']
const faqTab = ref<'agent' | 'user' | 'admin'>('agent')
const openFaq = ref(-1)

const agentSteps = computed(() => {
  const serverUrl = typeof window !== 'undefined' ? window.location.origin : 'https://skill-base-server'
  return [
    {
      label: t('quickStart.agent.step1Label'),
      description: t('quickStart.agent.step1Desc'),
      commands: [
        { label: 'Prompt · URL', code: t('quickStart.agent.step1CodeB') },
        { label: 'Prompt · ClawHub', code: t('quickStart.agent.step1CodeA') },
      ],
      note: '',
    },
    {
      label: t('quickStart.agent.step2Label'),
      description: t('quickStart.agent.step2Desc'),
      commands: [
        { label: 'Prompt', code: t('quickStart.agent.step2Code', { url: serverUrl }) },
      ],
      note: '',
    },
    {
      label: t('quickStart.agent.step3Label'),
      description: t('quickStart.agent.step3Desc'),
      commands: [
        { label: 'Prompt', code: t('quickStart.agent.step3Code') },
      ],
      note: '',
    },
    {
      label: t('quickStart.agent.step4Label'),
      description: t('quickStart.agent.step4Desc'),
      commands: [
        { label: 'Prompt', code: t('quickStart.agent.step4Code') },
      ],
      note: t('quickStart.agent.step4Note'),
    },
    {
      label: t('quickStart.agent.step5Label'),
      description: t('quickStart.agent.step5Desc'),
      commands: [
        { label: 'Prompt', code: t('quickStart.agent.step5Code') },
      ],
      note: t('quickStart.agent.step5Note'),
    },
    {
      label: t('quickStart.agent.step6Label'),
      description: t('quickStart.agent.step6Desc'),
      commands: [
        { label: 'Prompt', code: t('quickStart.agent.step6Code') },
      ],
      note: t('quickStart.agent.step6Note', { url: serverUrl }),
    },
    {
      label: t('quickStart.agent.step7Label'),
      description: t('quickStart.agent.step7Desc'),
      commands: [
        { label: 'Prompt', code: t('quickStart.agent.step7Code') },
      ],
      note: t('quickStart.agent.step7Note'),
    },
  ]
})

function termHtml(code: string): string {
  return code.split('\n').map(line => {
    const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const trimmed = line.trimStart()
    if (trimmed.startsWith('#')) return `<span class="term-cmt">${escaped}</span>`
    if (trimmed.startsWith('✓')) return `<span class="term-ok">${escaped}</span>`
    if (trimmed === '') return ''
    return `<span class="term-cmd">${escaped}</span>`
  }).join('\n')
}

const manualSections = computed(() => {
  const serverUrl = typeof window !== 'undefined' ? window.location.origin : 'https://skill-base-server'
  return [
    {
      icon: '📦',
      title: t('quickStart.manual.s1Title'),
      desc: t('quickStart.manual.s1Desc'),
      blocks: [
        {
          label: 'bash',
          code: `# ${t('quickStart.manual.s1c1')}\nnpm install -g skill-base-cli\n\n# ${t('quickStart.manual.s1c2')}\nskb init -s ${serverUrl}\n\n# ${t('quickStart.manual.s1c3')}\nskb login`,
        },
      ],
    },
    {
      icon: '🔍',
      title: t('quickStart.manual.s2Title'),
      desc: t('quickStart.manual.s2Desc'),
      blocks: [
        {
          label: 'bash',
          code: `# ${t('quickStart.manual.s2c1')}\nskb search react\n\n  react-best-practice  v2024.03  React ${t('quickStart.manual.s2d1')}\n  react-hooks          v2024.01  React Hooks ${t('quickStart.manual.s2d2')}\n\n# ${t('quickStart.manual.s2c2')}\nskb install react-best-practice\n✓ Installed react-best-practice@v20240320.143022`,
        },
      ],
    },
    {
      icon: '🚀',
      title: t('quickStart.manual.s3Title'),
      desc: t('quickStart.manual.s3Desc'),
      blocks: [
        {
          label: 'bash',
          code: `# ${t('quickStart.manual.s3c1')}\nmkdir my-team-skill && cd my-team-skill\n\n# ${t('quickStart.manual.s3c2')}\ncat > SKILL.md << 'EOF'\n---\nname: my-team-skill\nversion: 1.0.0\ndescription: ${t('quickStart.manual.s3d1')}\ntags: [coding, team]\n---\n\n# My Team Skill\n${t('quickStart.manual.s3d2')}\nEOF\n\n# ${t('quickStart.manual.s3c3')}\nskb publish --changelog "${t('quickStart.manual.s3d3')}"\n✓ Published my-team-skill@v1.0.0`,
        },
      ],
    },
    {
      icon: '🔌',
      title: t('quickStart.manual.s4Title'),
      desc: t('quickStart.manual.s4Desc'),
      blocks: [
        {
          label: 'bash',
          code: `# Cursor\nskb install my-skill --ide cursor\n\n# Qoder\nskb install my-skill --ide qoder\n\n# Windsurf\nskb install my-skill --ide windsurf\n\n# GitHub Copilot\nskb install my-skill --ide copilot\n\n# Claude Code\nskb install my-skill --ide claude-code\n\n# OpenCode\nskb install my-skill --ide opencode`,
        },
      ],
    },
  ]
})

async function copyCommand(tab: string, blockIdx: number, cmdIdx: number, code: string) {
  try {
    await navigator.clipboard.writeText(code)
    copiedKey.value = `${tab}-${blockIdx}-${cmdIdx}`
    setTimeout(() => { copiedKey.value = '' }, 2000)
  } catch { /* ignore */ }
}

const agentFaqs = computed(() => [
  { q: t('quickStart.faq.g1q'), a: t('quickStart.faq.g1a') },
  { q: t('quickStart.faq.g2q'), a: t('quickStart.faq.g2a') },
  { q: t('quickStart.faq.g3q'), a: t('quickStart.faq.g3a') },
  { q: t('quickStart.faq.g4q'), a: t('quickStart.faq.g4a') },
  { q: t('quickStart.faq.g5q'), a: t('quickStart.faq.g5a') },
  { q: t('quickStart.faq.g6q'), a: t('quickStart.faq.g6a') },
])

const userFaqs = computed(() => [
  { q: t('quickStart.faq.u1q'), a: t('quickStart.faq.u1a') },
  { q: t('quickStart.faq.u2q'), a: t('quickStart.faq.u2a') },
  { q: t('quickStart.faq.u3q'), a: t('quickStart.faq.u3a') },
  { q: t('quickStart.faq.u4q'), a: t('quickStart.faq.u4a') },
  { q: t('quickStart.faq.u5q'), a: t('quickStart.faq.u5a') },
])

const adminFaqs = computed(() => [
  { q: t('quickStart.faq.a1q'), a: t('quickStart.faq.a1a') },
  { q: t('quickStart.faq.a2q'), a: t('quickStart.faq.a2a') },
  { q: t('quickStart.faq.a3q'), a: t('quickStart.faq.a3a') },
  { q: t('quickStart.faq.a4q'), a: t('quickStart.faq.a4a') },
  { q: t('quickStart.faq.a5q'), a: t('quickStart.faq.a5a') },
])

const currentFaqs = computed(() => {
  if (faqTab.value === 'agent') return agentFaqs.value
  if (faqTab.value === 'user') return userFaqs.value
  return adminFaqs.value
})
</script>

<style scoped>
/* ===== Page & Header ===== */
.qs-page {
  min-height: calc(100vh - 10rem);
}

.qs-header {
  text-align: center;
  margin-bottom: 2rem;
}

.qs-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-fg-strong);
  font-family: 'JetBrains Mono', monospace;
  margin: 0;
}

.qs-subtitle {
  margin: 0.75rem 0 0;
  font-size: 0.9375rem;
  color: var(--color-base-400);
  line-height: 1.6;
}

/* ===== Tab 切换 ===== */
.qs-tabs {
  display: flex;
  gap: 4px;
  margin: 0 auto 2rem;
  background: var(--color-base-900);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid var(--color-base-800);
  width: fit-content;
  max-width: 100%;
}

.qs-tab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 10px 24px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-base-400);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.qs-tab:hover {
  color: var(--color-fg-strong);
}

.qs-tab.active {
  background: var(--color-base-950);
  color: var(--color-neon-400);
}

/* ===== Wizard 布局（左右箭头 + 中间卡片） ===== */
.qs-wizard {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  max-width: 900px;
  margin: 0 auto;
}

.qs-wizard-inner {
  flex: 1;
  min-width: 0;
  border-radius: 16px;
  border: 1px solid var(--color-base-800);
  background: var(--color-base-900);
  padding: 28px 24px 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.qs-wizard-arrow {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid var(--color-base-800);
  border-radius: 12px;
  background: var(--color-base-900);
  color: var(--color-fg-strong);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s, opacity 0.2s;
}

.qs-wizard-arrow:hover:not(:disabled) {
  border-color: var(--color-neon-400);
  color: var(--color-neon-400);
}

.qs-wizard-arrow:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

/* ===== 步骤导航条（圆圈 + 连接线） ===== */
.qs-step-nav {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  margin-bottom: 28px;
  padding-top: 8px;
  padding-bottom: 8px;
  overflow-x: auto;
  overflow-y: visible;
  gap: 0;
  scrollbar-width: thin;
}

.qs-step-nav-item {
  flex: 1 1 0;
  min-width: 44px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
  padding: 0 2px;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  font: inherit;
  color: inherit;
}

.qs-step-nav-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 20px;
  left: 50%;
  width: 100%;
  height: 3px;
  background-color: var(--color-base-800);
  z-index: -1;
  transition: background-color 0.25s ease;
}

.qs-step-nav-item.is-completed:not(:last-child)::after {
  background-color: var(--color-neon-400);
}

.qs-step-nav-num {
  width: 40px;
  height: 40px;
  background-color: var(--color-base-900);
  border: 3px solid var(--color-base-800);
  color: var(--color-base-400);
  font-weight: 700;
  font-size: 0.95rem;
  font-family: 'JetBrains Mono', monospace;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.25s ease, background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
  box-sizing: border-box;
}

.qs-step-nav-label {
  margin-top: 8px;
  font-size: 0.72rem;
  color: var(--color-base-400);
  font-weight: 500;
  text-align: center;
  line-height: 1.25;
  transition: color 0.25s ease;
  white-space: nowrap;
}

.qs-step-nav-item.is-active .qs-step-nav-num {
  background-color: var(--color-neon-400);
  border-color: var(--color-neon-400);
  color: var(--color-base-950);
  box-shadow: 0 0 0 4px rgba(var(--color-neon-rgb), 0.22);
}

.qs-step-nav-item.is-active .qs-step-nav-label {
  color: var(--color-neon-400);
  font-weight: 700;
}

.qs-step-nav-item.is-completed .qs-step-nav-num {
  border-color: var(--color-neon-400);
  color: var(--color-neon-400);
}

/* ===== 面板内容 ===== */
.qs-step-panels {
  min-height: 200px;
}

.qs-step-panel {
  padding: 0 0 8px;
  animation: qsPanelIn 0.38s ease forwards;
}

@keyframes qsPanelIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.qs-panel-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 6px;
  color: var(--color-fg-strong);
  font-family: 'JetBrains Mono', monospace;
  line-height: 1.35;
}

.qs-panel-title code {
  font-size: 0.88em;
  padding: 2px 6px;
  background: rgba(var(--color-neon-rgb), 0.08);
  border-radius: 4px;
}

.qs-panel-subtitle {
  font-size: 0.95rem;
  color: var(--color-base-400);
  margin: 0 0 20px;
  line-height: 1.6;
}

/* ===== OR 分割线 ===== */
.qs-prompt-or {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 14px;
  color: var(--color-base-400);
}

.qs-prompt-or::before,
.qs-prompt-or::after {
  content: '';
  flex: 1;
  border-top: 1px dashed var(--color-base-800);
}

.qs-prompt-or-text {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 10px;
  border: 1px solid var(--color-base-800);
  border-radius: 4px;
  color: var(--color-base-400);
}

/* ===== 气泡 Prompt ===== */
.qs-prompt-bubble {
  position: relative;
  background: rgba(var(--color-neon-rgb), 0.08);
  color: var(--color-fg-strong);
  padding: 16px 18px;
  border-radius: 12px 12px 12px 0;
  margin: 0 0 18px;
  font-size: 1rem;
  line-height: 1.65;
  font-weight: 500;
  display: block;
  max-width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(var(--color-neon-rgb), 0.18);
}

.qs-prompt-bubble::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: -8px;
  width: 0;
  height: 0;
  border-bottom: 12px solid rgba(var(--color-neon-rgb), 0.08);
  border-left: 12px solid transparent;
}

.qs-prompt-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.qs-prompt-text {
  flex: 1;
  min-width: 0;
  word-break: break-word;
}

.qs-quote-mark {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.2em;
  font-weight: 700;
  color: var(--color-neon-400);
  margin: 0 2px;
  opacity: 0.85;
}

.qs-prompt-copy {
  flex-shrink: 0;
  margin: 0;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--color-base-800);
  border-radius: 6px;
  color: var(--color-base-400);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.qs-prompt-copy:hover {
  border-color: var(--color-neon-400);
  color: var(--color-neon-400);
}

/* ===== 备注 ===== */
.qs-step-note {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.65;
  color: var(--color-base-400);
  background: rgba(var(--color-neon-rgb), 0.03);
  padding: 12px 16px;
  border-left: 4px solid var(--color-base-800);
  border-radius: 4px;
}

.qs-step-note code {
  font-size: 0.88em;
  padding: 2px 6px;
  background: rgba(var(--color-neon-rgb), 0.08);
  border-radius: 4px;
}

/* ===== Terminal block (manual tab) ===== */
.qs-terminal {
  background: #0d0d11;
  border: 1px solid var(--color-base-800);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 0.75rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
}

.qs-term-bar {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid var(--color-base-800);
}

.qs-term-dots {
  display: flex;
  gap: 0.375rem;
  margin-right: 0.75rem;
}

.qs-term-dots i {
  display: block;
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
}

.qs-term-dots i:nth-child(1) { background: #ff5f57; }
.qs-term-dots i:nth-child(2) { background: #febc2e; }
.qs-term-dots i:nth-child(3) { background: #28c840; }

.qs-term-name {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6875rem;
  color: var(--color-base-400);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.qs-term-copy {
  margin-left: auto;
}

.qs-term-body {
  margin: 0;
  padding: 1rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8125rem;
  line-height: 1.8;
  color: var(--color-fg-strong);
  overflow-x: auto;
  background: transparent;
  white-space: pre;
}

.qs-term-body :deep(.term-cmt) {
  color: #6b7280;
}

.qs-term-body :deep(.term-cmd) {
  color: #e2e8f0;
}

.qs-term-body :deep(.term-ok) {
  color: #34d399;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .qs-wizard {
    gap: 8px;
  }

  .qs-wizard-arrow {
    width: 40px;
    height: 40px;
  }

  .qs-wizard-inner {
    padding: 20px 16px 16px;
  }

  .qs-step-nav-item {
    min-width: 38px;
  }

  .qs-step-nav-num {
    width: 34px;
    height: 34px;
    font-size: 0.85rem;
  }

  .qs-step-nav-label {
    font-size: 0.65rem;
  }

  .qs-panel-title {
    font-size: 1.05rem;
  }

  .qs-prompt-bubble {
    padding: 12px 14px;
    font-size: 0.9rem;
  }
}

@media (max-width: 520px) {
  .qs-wizard-arrow {
    width: 36px;
    height: 36px;
  }

  .qs-term-body {
    font-size: 0.6875rem;
    padding: 0.75rem;
  }
}

/* ===== FAQ 区域 ===== */
.qs-faq {
  max-width: 900px;
  margin: 3rem auto 0;
}

.qs-faq-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-fg-strong);
  font-family: 'JetBrains Mono', monospace;
  margin: 0 0 1rem;
  text-align: center;
}

.qs-faq-tabs {
  display: flex;
  gap: 4px;
  margin: 0 auto 1.5rem;
  background: var(--color-base-900);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--color-base-800);
  width: fit-content;
}

.qs-faq-tab {
  padding: 8px 20px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-base-400);
  background: transparent;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qs-faq-tab:hover {
  color: var(--color-fg-strong);
}

.qs-faq-tab.active {
  background: var(--color-base-950);
  color: var(--color-neon-400);
}

.qs-faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qs-faq-item {
  border: 1px solid var(--color-base-800);
  border-radius: 12px;
  background: var(--color-base-900);
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.qs-faq-item.open {
  border-color: rgba(var(--color-neon-rgb), 0.3);
}

.qs-faq-q {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-fg-strong);
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  line-height: 1.5;
}

.qs-faq-q:hover {
  color: var(--color-neon-400);
}

.qs-faq-chevron {
  flex-shrink: 0;
  color: var(--color-base-400);
  transition: transform 0.25s ease, color 0.2s ease;
}

.qs-faq-item.open .qs-faq-chevron {
  transform: rotate(180deg);
  color: var(--color-neon-400);
}

.qs-faq-a {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
  padding: 0 18px;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--color-base-400);
}

.qs-faq-item.open .qs-faq-a {
  max-height: 300px;
  padding: 0 18px 16px;
}

.qs-faq-a :deep(code) {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85em;
  padding: 2px 6px;
  background: rgba(var(--color-neon-rgb), 0.08);
  border-radius: 4px;
  color: var(--color-fg-strong);
}

.qs-faq-a :deep(b) {
  color: var(--color-fg-strong);
  font-weight: 600;
}

.qs-faq-a :deep(br) {
  display: block;
  content: '';
  margin-top: 0.4em;
}

@media (max-width: 768px) {
  .qs-faq {
    margin-top: 2rem;
  }

  .qs-faq-q {
    padding: 12px 14px;
    font-size: 0.875rem;
  }

  .qs-faq-a {
    font-size: 0.85rem;
  }
}
</style>
