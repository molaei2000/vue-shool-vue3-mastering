<template>
  <div class="col-full">
    <VeeForm @submit="save" :key="formKey">
      <AppFormField name="text" v-model="postCopy.text" as="textarea" row="8" cols="140" rules="required" />
      <div class="form-actions">
        <button class="btn-blue">{{post.id ? 'Update Post' : 'Submit post'}}</button>
      </div>
    </VeeForm>
  </div>
</template>

<script>
export default {
  props: {
    post: { type: Object, default: () => ({ text: null }) }
  },
  data () {
    return {
      postCopy: { ...this.post },
      formKey: Math.random()
    }
  },
  watch: {
    postCopy: {
      handler () {
        if (this.postCopy.text !== this.post.text) {
          this.$emit('dirty')
        } else {
          this.$emit('clean')
        }
      },
      deep: true
    }
  },
  methods: {
    save () {
      this.$emit('clean')
      this.$emit('save', { post: this.postCopy }) // access under eventData.post
      this.postCopy.text = ''
      this.formKey = Math.random()
    }
  }
}
</script>

<style scoped>

</style>
