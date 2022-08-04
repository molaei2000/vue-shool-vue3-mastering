<template>
  <Head>
    <title>
      Vue.js 3 master class Forum
    </title>
    <meta name="description" content="An Awesome vue forum application" >
  </Head>
  <the-navbar/>
  <div class="container">
    <router-view v-show="showPage" @ready="onPageReady" :key="`${$route.path}${JSON.stringify($route.query)}`"/>
    <AppSpinner v-show="!showPage">loading...</AppSpinner>
  </div>
  <AppNotifications/>
</template>

<script>
import TheNavbar from '@/components/TheNavbar'
import { mapActions } from 'vuex'
import NProgress from 'nprogress'
import AppNotifications from '@/components/AppNotifications'
import { Head } from '@vueuse/head'

export default {
  name: 'App',
  components: { AppNotifications, TheNavbar, Head },
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
