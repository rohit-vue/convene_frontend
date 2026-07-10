<template>
  <div class="flex min-h-screen bg-surface text-fg">
    <!-- Brand / marketing panel -->
    <div class="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-800 via-indigo-700 to-violet-600 p-12 text-white lg:flex">
      <div class="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-surface/10 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl" />

      <div class="relative w-fit rounded-2xl bg-white/95 px-4 py-2.5 shadow-sm">
        <img
          src="/convenelogo.png"
          alt="Convene"
          class="h-12 w-auto max-w-full object-contain sm:h-14"
        />
      </div>

      <div class="relative max-w-md">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Meet. Connect. Convert.</p>
        <h2 class="mt-3 text-3xl font-bold leading-tight">
          Run client meetings that actually move the needle.
        </h2>
        <p class="mt-4 text-sm leading-relaxed text-white/80">
          Convene is the workspace where your team plans meetings, captures outcomes,
          and turns every conversation into follow-through and results.
        </p>

        <ul class="mt-10 space-y-6">
          <li v-for="f in features" :key="f.title" class="flex items-start gap-4">
            <span
              class="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface/10 ring-1 ring-white/15 backdrop-blur"
              v-html="f.icon"
            />
            <div>
              <p class="text-sm font-semibold">{{ f.title }}</p>
              <p class="mt-0.5 text-xs leading-relaxed text-white/70">{{ f.desc }}</p>
            </div>
          </li>
        </ul>
      </div>

      <div class="relative flex items-center justify-between text-xs text-white/60">
        <p>© {{ year }} Convene</p>
        <p>Meetings · Follow-ups · Teams</p>
      </div>
    </div>

    <!-- Form panel -->
    <div class="flex w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:w-1/2">
      <div class="w-full max-w-sm">
        <div class="mb-8 flex justify-center rounded-2xl bg-white px-6 py-4 shadow-sm lg:hidden">
          <img src="/convenelogo.png" alt="Convene" class="h-20 w-auto object-contain" />
        </div>
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
const year = new Date().getFullYear()

const features = [
  {
    title: 'Organize every meeting',
    desc: 'Schedule client meetings with agendas, attendees, and notes in one shared place.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>',
  },
  {
    title: 'Capture outcomes & action items',
    desc: 'Log decisions and follow-ups so nothing slips between conversations.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
  },
  {
    title: 'Convert conversations to results',
    desc: 'Track follow-ups and see what every client meeting actually delivers.',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
  },
]
</script>
