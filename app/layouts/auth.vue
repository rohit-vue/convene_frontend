<template>
  <div class="grid min-h-screen place-items-center bg-slate-50 p-4">
    <div class="w-full max-w-sm">
      <div class="mb-6 flex justify-center">
        <img src="/convenelogo.png" alt="Convene" class="h-28 w-auto object-contain" />
      </div>
      <div class="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <slot />
      </div>
    </div>
  </div>
</template>
