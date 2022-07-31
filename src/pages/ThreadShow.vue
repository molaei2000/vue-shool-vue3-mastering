<template>
  <div v-if="asyncDataStatus_ready" class="col-large push-top">
    <h1>
      {{ thread.title }}
      <router-link
        v-if="thread.userId === authUser?.id"
        :to="{ name: 'ThreadEdit', id:this.id }"
        class="btn-green btn-small"
      >
        Edit Thread
      </router-link>
    </h1>
    <p>
      By <a href="#" class="link-unstyled">{{thread.author?.name}}</a>, <AppDate :timestamp="thread.publishedAt" />.
      <span
        style="float:right; margin-top: 2px;"
        class="hide-mobile text-faded text-small"
        >{{thread.repliesCount}} replies by {{thread.contributorsCount}} contributors</span
      >
    </p>

    <post-list v-if="threadPosts" :posts="threadPosts" />

    <post-editor v-if="authUser" @save="addPost" @dirty="isPostDirty= true" @clean="isPostDirty= false" />
    <div v-else class="text-center" style="margin-bottom: 50px">
      <router-link :to="{ name:'SignIn', query: {redirectTo: $route.path}}">
        Sign In
      </router-link>
      or
      <router-link :to="{ name:'Register', query: {redirectTo: $route.path}}">
        Register
      </router-link>
      to reply.
    </div>
  </div>
</template>

<script>
import PostList from '@/components/PostList'
import PostEditor from '@/components/PostEditor'
import { mapActions, mapGetters } from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'
import useNotifications from '@/composables/useNotification'
import difference from 'lodash/difference'

export default {
  name: 'ThreadShow',
  components: {
    PostList,
    PostEditor
  },
  props: {
    id: {
      required: true,
      type: String
    }
  },
  data () {
    return {
      isPostDirty: false
    }
  },
  setup () {
    const { addNotification } = useNotifications()
    return { addNotification }
  },
  computed: {
    ...mapGetters(['authUser']),
    threads () {
      return this.$store.state.threads
    },
    posts () {
      return this.$store.state.posts
    },
    thread () {
      return this.$store.getters.thread(this.id)
    },
    threadPosts () {
      return this.posts.filter(post => post.threadId === this.id)
    }
  },
  mixins: [asyncDataStatus],
  methods: {
    ...mapActions(['fetchThread', 'fetchUser', 'fetchPosts', 'fetchUsers', 'createPost']),
    addPost (eventData) {
      const post = {
        ...eventData.post,
        threadId: this.id
      }
      this.createPost(post)
    },
    async fetchPostsWithUsers (ids) {
      // fetch the posts
      const posts = await this.fetchPosts({
        ids,
        onSnapshot: ({ isLocal, prevItem }) => {
          if (!this.asyncDataStatus_ready || isLocal || prevItem(prevItem?.edited && !prevItem?.edited?.at)) return
          this.addNotification({ message: 'thread recently added', timeout: 5000 })
        }
      })
      // fetch the users associate with the posts
      const users = posts.map(post => post.userId).concat(this.thread.userId)
      await this.fetchUsers({ ids: users })
    }
  },
  async created () {
    // fetch the thread
    const thread = await this.fetchThread({
      id: this.id,
      onSnapshot: async ({ isLocal, item, prevItem }) => {
        if (!this.asyncDataStatus_ready || isLocal) return
        const newPostIds = difference(item.posts, prevItem.posts)
        const hasNewPosts = newPostIds.length > 0
        if (hasNewPosts) {
          await this.fetchPostsWithUsers(newPostIds)
        } else {
          this.addNotification({ message: 'thread recently added', timeout: 5000 })
        }
      }

    })

    await this.fetchPostsWithUsers(thread.posts)
    this.asyncDataStatus_fetched()
  },
  beforeRouteLeave () {
    if (this.isPostDirty) {
      const confirm = window.confirm('Are You sure you want to leave? Unsaved changes will be lost')
      if (!confirm) return false
    }
  }
}
</script>
