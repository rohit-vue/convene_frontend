<template>
  <div class="grid min-h-screen place-items-center bg-slate-50 p-4">
    <div class="w-full max-w-sm">
      <div class="mb-6 flex items-center justify-center gap-3">
        <div class="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-bold text-white shadow-sm">
          C
        </div>
        <span class="text-xl font-semibold tracking-tight text-slate-800">Convene</span>
      </div>
      <div class="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <slot />
      </div>
    </div>
  </div>
</template>
