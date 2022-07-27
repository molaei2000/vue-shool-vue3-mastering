<template>
  <div v-if="asyncDataStatus_ready" class="col-large push-top">
    <h1>
      {{ thread.title }}
      <router-link
        v-if="id"
        :to="{ name: 'ThreadEdit', id }"
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

    <post-editor @save="addPost" @dirty="isPostDirty= true" @clean="isPostDirty= false" />
  </div>
</template>

<script>
import PostList from '@/components/PostList'
import PostEditor from '@/components/PostEditor'
import { mapActions } from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'
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
  computed: {
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
    }
  },
  async created () {
    // fetch the thread
    const thread = await this.fetchThread({ id: this.id })

    // fetch the user
    // this.fetchUser({ id: thread.userId })

    // fetch the posts
    const posts = await this.fetchPosts({ ids: thread.posts })
    // fetch the users associate with the posts
    const users = posts.map(post => post.userId).concat(thread.userId)
    await this.fetchUsers({ ids: users })
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
