<template>
  <div v-if="asyncDataStatus_ready" class="col-full push-top">
    <h1>
      Create new thread in <i>{{ forum.name }}</i>
    </h1>

    <ThreadEditor @save="save" @cancel="cancel" @dirty="formIsDirty=true" @clean="formIsDirty=false"/>
  </div>
</template>
<script>
import ThreadEditor from '@/components/ThreadEditor'
import { findById } from '@/helpers'
import { mapActions } from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'
export default {
  components: { ThreadEditor },
  props: {
    forumId: { type: String, required: true }
  },
  computed: {
    forum () {
      return findById(this.$store.state.forums, this.forumId)
    }
  },
  data () {
    return {
      formIsDirty: false
    }
  },
  mixins: [asyncDataStatus],
  methods: {
    ...mapActions(['createThread', 'fetchForum']),
    async save ({ title, text }) {
      const thread = await this.createThread({
        forumId: this.forum.id,
        title,
        text
      })
      this.$router.push({ name: 'ThreadShow', params: { id: thread.id } })
    },
    cancel () {
      this.$router.push({ name: 'Forum', params: { id: this.forum.id } })
    }
  },
  async created () {
    await this.fetchForum({ id: this.forumId })
    this.asyncDataStatus_fetched()
  },
  beforeRouteLeave () {
    if (this.formIsDirty) {
      const confirm = window.confirm('Are You sure you want to leave? Unsaved changes will be lost')
      if (!confirm) return false
    }
  }
}
</script>
