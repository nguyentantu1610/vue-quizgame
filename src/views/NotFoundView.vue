<template>
  <main>
    <div
      id="my-div"
      class="flex flex-col justify-center items-center text-zinc-200 space-y-6"
      style="height: 90vh"
    >
      <h1 class="text-5xl font-bold">404 Not Found</h1>
      <div>
        <RouterLink :to="{ name: 'home' }">Quay lại trang chủ</RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped>
#my-div {
  background-image: url("/bg-snowflake.png");
  background-size: cover;
  background-position: center;
}
</style>
