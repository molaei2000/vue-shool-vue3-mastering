<template>
  <the-navbar/>
  <div class="container">
    <router-view v-show="showPage" @ready="onPageReady" :key="`${$route.path}${JSON.stringify($route.query)}`"/>
    <AppSpinner v-show="!showPage">loading...</AppSpinner>
  </div>
</template>

<script>
import TheNavbar from '@/components/TheNavbar'
import { mapActions } from 'vuex'
import NProgress from 'nprogress'

export default {
  name: 'App',
  components: { TheNavbar },
  methods: {
    ...mapActions(['fetchAuthUser']),
    onPageReady () {
      this.showPage = true
      NProgress.done()
    }
  },
  data () {
    return {
      showPage: false
    }
  },
  created () {
    NProgress.configure({
      speed: 200,
      showSpinner: false
    })
    this.fetchAuthUser()
    this.$router.beforeEach(() => {
      this.showPage = false
      NProgress.start()
    })
  }
}
</script>

<style>
@import "assets/style.css";
@import "~nprogress/nprogress.css";

#nprogress .bar{
  background: #57AD8D !important;
}
</style>
