<template>
  <div v-if="asyncDataStatus_ready" class="container">
    <div class="col-full push-top">
      <div v-if="forum" class="forum-header">
        <div class="forum-details">
          <h1>{{ forum.name }}</h1>
          <p class="text-lead">{{ forum.description }}</p>
        </div>
        <router-link
          :to="{name:'ThreadCreate', params: {forumId: forum.id}}"
          class="btn-green btn-small"
        >
          Start a thread
        </router-link>
      </div>
    </div>

    <div class="col-full push-top">
      <ThreadList :threads="threads"/>
      <v-pagination
        v-model="page"
        :pages="totalPages"
        active-color="#57Ad8d"
      />
    </div>
  </div>
</template>

<script>
import ThreadList from '@/components/ThreadList'
import { findById } from '@/helpers'
import { mapActions } from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'
export default {
  components: { ThreadList },
  props: {
    id: {
      required: true,
      type: String
    }
  },
  data () {
    return {
      page: parseInt(this.$route.query.page) || 1,
      perPage: 5
    }
  },
  watch: {
    async page (page) {
      this.$router.push({ query: { page: this.page } })
    }
  },
  mixins: [asyncDataStatus],
  computed: {
    forum () {
      return findById(this.$store.state.forums, this.id)
    },
    threads () {
      if (!this.forum) return []
      return this.$store.state.threads
        .filter(thread => thread.forumId === this.forum.id)
        .map(thread => this.$store.getters.thread(thread.id))
    },
    threadsCount () {
      return this.forum.threads.length
    },
    totalPages () {
      if (!this.threadsCount) return 0
      return Math.ceil(this.threadsCount / this.perPage)
    }
  },
  methods: {
    ...mapActions(['fetchForum', 'fetchThreadsByPage', 'fetchUsers'])
  },
  async created () {
    const forum = await this.fetchForum({ id: this.id })
    const threads = await this.fetchThreadsByPage({ ids: forum.threads, page: this.page, perPage: this.perPage })
    await this.fetchUsers({ ids: threads.map(thread => thread.userId) })
    this.asyncDataStatus_fetched()
  }
}
</script>

<style scoped>

</style>
