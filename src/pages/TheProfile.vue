<template>
  <div class="container" style="width: 100%">
    <div class="flex-grid">
      <div class="col-3 push-top">
        <UserProfileCard v-if="!edit" :user="user" />
        <UserProfileCardEditor v-else :user="user" />
      </div>

      <div class="col-7 push-top">
        <div class="profile-header">
          <span class="text-lead"> {{user.username}} recent activity </span>
        </div>
        <hr />
        <PostList :posts="user.posts" />
        <AppInfinitScroll @load="fetchUserPosts" :done="user.posts.length === user.postsCount"/>
      </div>
    </div>
  </div>
</template>
<script>
import PostList from '@/components/PostList'
import UserProfileCard from '@/components/UserProfileCard'
import UserProfileCardEditor from '@/components/UserProfileCardEditor'
import { mapGetters } from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'
export default {
  components: { PostList, UserProfileCard, UserProfileCardEditor },
  props: {
    edit: { type: Boolean, default: false }
  },
  computed: {
    ...mapGetters({ user: 'authUser' }),
    lastPostFetched () {
      if (this.user.posts.length === 0) return null
      return this.user.posts[this.user.posts.length - 1]
    }
  },
  mixins: [asyncDataStatus],
  methods: {
    async fetchUserPosts () {
      await this.$store.dispatch('fetchAuthUsersPosts', { startAfter: this.lastPostFetched })
    }
  },
  async created () {
    console.log(this.user)
    await this.fetchUserPosts()
    this.asyncDataStatus_fetched()
  }
  // beforeRouteEnter (to, from) {
  //   if (store.state.authId) return { name: 'Home' }
  // }
}
</script>
