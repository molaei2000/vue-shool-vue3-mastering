<template>
  <img :src="src || '/user-placeholder.png'" :alt="alt">
</template>

<script>
export default {
  name: 'AppAvatarImg',
  props: {
    src: {
      type: String
    },
    alt: {
      type: String
    }
  }
}
</script>

<style scoped>
  img {
    object-fit: cover;
  }
</style>
