<template>
  <div>
    <NuxtLoadingIndicator color="#264e70" :height="3" :duration="2000" :throttle="200" />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ToastHost />
  </div>
</template>
