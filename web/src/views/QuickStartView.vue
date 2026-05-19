<template>
  <div class="qs-page">
    <div class="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 标题区 -->
      <div class="qs-header">
        <h1 class="qs-title">{{ t('quickStart.pageTitle') }}</h1>
        <p class="qs-subtitle">{{ t('quickStart.pageSubtitle') }}</p>
      </div>

      <!-- 主卡片 -->
      <div class="qs-card">
        <!-- Tab 切换 -->
        <div class="qs-tabs">
          <button
            class="qs-tab"
            :class="{ active: activeTab === 'agent' }"
            @click="activeTab = 'agent'"
          >
            <component :is="Bot" :size="16" :stroke-width="2" />
            <span>{{ t('quickStart.tabAgent') }}</span>
          </button>
          <button
            class="qs-tab"
            :class="{ active: activeTab === 'manual' }"
            @click="activeTab = 'manual'"
          >
            <component :is="Terminal" :size="16" :stroke-width="2" />
            <span>{{ t('quickStart.tabManual') }}</span>
          </button>
        </div>

        <!-- Tab: 让 Agent 帮我装 -->
        <div v-if="activeTab === 'agent'" class="qs-tab-content">
          <div class="qs-steps-nav">
            <button
              v-for="(step, idx) in agentSteps"
              :key="idx"
              class="qs-step-btn"
              :class="{ active: agentStep === idx }"
              @click="agentStep = idx"
            >
              <span class="qs-step-circle">{{ idx + 1 }}</span>
              <span class="qs-step-label">{{ step.label }}</span>
            </button>
          </div>

          <div class="qs-step-content">
            <div v-for="(step, idx) in agentSteps" :key="idx" v-show="agentStep === idx">
              <p class="qs-step-desc">{{ step.description }}</p>

              <div v-for="(cmd, ci) in step.commands" :key="ci" class="qs-cmd-block">
                <div class="qs-cmd-header">
                  <span class="qs-cmd-lang">{{ cmd.label }}</span>
                  <button class="qs-copy-btn" @click="copyCommand('agent', idx, ci, cmd.code)">
                    <component :is="copiedKey === `agent-${idx}-${ci}` ? Check : Clipboard" :size="14" :stroke-width="2" />
                    {{ copiedKey === `agent-${idx}-${ci}` ? t('quickStart.copied') : t('quickStart.copy') }}
                  </button>
                </div>
                <pre class="qs-cmd-code"><code>{{ cmd.code }}</code></pre>
              </div>

              <p v-if="step.note" class="qs-note">{{ step.note }}</p>
            </div>
          </div>

          <div class="qs-nav-arrows">
            <button class="qs-arrow-btn" :disabled="agentStep === 0" @click="agentStep--">
              <ChevronLeft :size="20" :stroke-width="2" />
            </button>
            <span class="qs-page-indicator">{{ agentStep + 1 }} / {{ agentSteps.length }}</span>
            <button class="qs-arrow-btn" :disabled="agentStep === agentSteps.length - 1" @click="agentStep++">
              <ChevronRight :size="20" :stroke-width="2" />
            </button>
          </div>
        </div>

        <!-- Tab: 我自己装 -->
        <div v-if="activeTab === 'manual'" class="qs-tab-content">
          <div class="qs-steps-nav">
            <button
              v-for="(section, idx) in manualSections"
              :key="idx"
              class="qs-step-btn"
              :class="{ active: manualStep === idx }"
              @click="manualStep = idx"
            >
              <span class="qs-step-circle">{{ manualEmojis[idx] }}</span>
              <span class="qs-step-label">{{ section.title }}</span>
            </button>
          </div>

          <div class="qs-step-content">
            <div v-for="(section, idx) in manualSections" :key="idx" v-show="manualStep === idx">
              <p class="qs-step-desc">{{ section.desc }}</p>
              <div v-for="(block, bi) in section.blocks" :key="bi" class="qs-terminal">
                <div class="qs-term-bar">
                  <span class="qs-term-dots"><i></i><i></i><i></i></span>
                  <span class="qs-term-name">{{ block.label }}</span>
                  <button class="qs-copy-btn qs-term-copy" @click="copyCommand('m', idx, bi, block.code)">
                    <component :is="copiedKey === `m-${idx}-${bi}` ? Check : Clipboard" :size="14" :stroke-width="2" />
                    {{ copiedKey === `m-${idx}-${bi}` ? t('quickStart.copied') : t('quickStart.copy') }}
                  </button>
                </div>
                <pre class="qs-term-body" v-html="termHtml(block.code)"></pre>
              </div>
            </div>
          </div>

          <div class="qs-nav-arrows">
            <button class="qs-arrow-btn" :disabled="manualStep === 0" @click="manualStep--">
              <ChevronLeft :size="20" :stroke-width="2" />
            </button>
            <span class="qs-page-indicator">{{ manualStep + 1 }} / {{ manualSections.length }}</span>
            <button class="qs-arrow-btn" :disabled="manualStep === manualSections.length - 1" @click="manualStep++">
              <ChevronRight :size="20" :stroke-width="2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { ChevronLeft, ChevronRight, Clipboard, Check, Bot, Terminal } from 'lucide-vue-next'

const { t } = useI18n()
const activeTab = ref<'agent' | 'manual'>('agent')
const agentStep = ref(0)
const manualStep = ref(0)
const copiedKey = ref('')
const manualEmojis = ['📦', '🔍', '🚀', '🔌']

const agentSteps = computed(() => {
  const serverUrl = typeof window !== 'undefined' ? window.location.origin : 'https://skill-base-server'
  return [
    {
      label: t('quickStart.agent.step1Label'),
      description: t('quickStart.agent.step1Desc'),
      commands: [
        { label: 'Prompt · ClawHub', code: t('quickStart.agent.step1CodeA') },
        { label: 'Prompt · URL', code: t('quickStart.agent.step1CodeB') },
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
</script>

<style scoped>
.qs-page {
  min-height: calc(100vh - 10rem);
}

.qs-header {
  text-align: center;
  margin-bottom: 2.5rem;
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

.qs-card {
  background: var(--color-base-900);
  border: 1px solid var(--color-base-800);
  border-radius: 1rem;
  padding: 2rem;
  max-width: 56rem;
  margin: 0 auto;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.25),
    0 1px 4px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

/* Tab 切换 */
.qs-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 2rem;
  border: 1px solid var(--color-base-800);
  border-radius: 0.75rem;
  overflow: hidden;
  background: var(--color-base-950);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.qs-tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-base-400);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qs-tab:first-child {
  border-right: 1px solid var(--color-base-800);
}

.qs-tab:hover {
  color: var(--color-fg);
  background: color-mix(in srgb, var(--color-fg-strong) 4%, transparent);
}

.qs-tab.active {
  color: var(--color-neon-400);
  background: rgba(var(--color-neon-rgb), 0.1);
}

/* Tab 内容 */
.qs-tab-content {
  min-height: 12rem;
}

/* 步骤导航 */
.qs-steps-nav {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
}

.qs-step-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  min-width: 5rem;
}

.qs-step-btn:hover {
  background: color-mix(in srgb, var(--color-fg-strong) 4%, transparent);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.qs-step-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-base-400);
  border: 1.5px solid var(--color-base-700);
  transition: all 0.2s ease;
}

.qs-step-label {
  font-size: 0.75rem;
  color: var(--color-base-400);
  white-space: nowrap;
  font-family: 'JetBrains Mono', monospace;
  transition: color 0.2s ease;
}

.qs-step-btn.active .qs-step-circle {
  background: var(--color-neon-400);
  border-color: var(--color-neon-400);
  color: var(--color-base-950);
  box-shadow: 0 0 12px rgba(var(--color-neon-rgb), 0.3), 0 0 24px rgba(var(--color-neon-rgb), 0.12);
}

.qs-step-btn.active .qs-step-label {
  color: var(--color-fg-strong);
}

/* 步骤内容 */
.qs-step-content {
  min-height: 12rem;
}

.qs-step-desc {
  font-size: 0.9375rem;
  color: var(--color-fg);
  margin: 0 0 1.25rem;
  line-height: 1.7;
}

/* 代码块 */
.qs-cmd-block {
  background: color-mix(in srgb, var(--color-base-950) 80%, transparent);
  border: 1px solid var(--color-base-800);
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  overflow: hidden;
}

.qs-cmd-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--color-base-800);
}

.qs-cmd-lang {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6875rem;
  color: var(--color-neon-400);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.qs-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-base-400);
  background: transparent;
  border: 1px solid var(--color-base-800);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qs-copy-btn:hover {
  border-color: var(--color-neon-500);
  color: var(--color-neon-400);
  background: rgba(var(--color-neon-rgb), 0.08);
}

.qs-cmd-code {
  margin: 0;
  padding: 1rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--color-fg-strong);
  overflow-x: auto;
  background: transparent;
  white-space: pre-wrap;
  word-break: break-word;
}

.qs-cmd-code code {
  font-family: inherit;
}

/* 备注 */
.qs-note {
  font-size: 0.8125rem;
  color: var(--color-base-400);
  margin: 1rem 0 0;
  padding: 0.75rem 1rem;
  background: rgba(var(--color-neon-rgb), 0.06);
  border-left: 2px solid var(--color-neon-500);
  border-radius: 0 0.5rem 0.5rem 0;
  line-height: 1.6;
}

/* 底部导航 */
.qs-nav-arrows {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-base-800);
}

.qs-arrow-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--color-base-800);
  background: transparent;
  color: var(--color-fg);
  cursor: pointer;
  transition: all 0.2s ease;
}

.qs-arrow-btn:hover:not(:disabled) {
  border-color: var(--color-neon-500);
  color: var(--color-neon-400);
  background: rgba(var(--color-neon-rgb), 0.08);
}

.qs-arrow-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qs-page-indicator {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8125rem;
  color: var(--color-base-400);
}

@media (max-width: 640px) {
  .qs-card {
    padding: 1.25rem;
  }

  .qs-tab {
    font-size: 0.8125rem;
    padding: 0.625rem 0.75rem;
  }

  .qs-step-btn {
    min-width: 3.5rem;
    padding: 0.5rem 0.5rem;
  }

  .qs-step-label {
    font-size: 0.625rem;
  }

  .qs-term-body {
    font-size: 0.6875rem;
    padding: 0.75rem;
  }
}

/* Terminal block */
.qs-terminal {
  background: #0d0d11;
  border: 1px solid var(--color-base-800);
  border-radius: 0.75rem;
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
</style>
