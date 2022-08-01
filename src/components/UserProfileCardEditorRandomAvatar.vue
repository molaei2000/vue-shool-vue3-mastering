<template>
  <div class="text-center">
    <button class="btn-green btn-xsmall" @click.prevent="getRandomImage">
      Random Avatar
    </button>
    <br>
    <small style="opacity: 0.5">Powered by <a href="http://pixabay.com">Pixabay</a> </small>
  </div>
</template>

<script>
import { arrayRandom } from '@/helpers'

export default {
  name: 'UserProfileCardEditorRandomAvatar',
  methods: {
    async getRandomImage () {
      const searchTerms = [
        'cats',
        'dogs',
        'abstract',
        'cars',
        'mountains',
        'beach',
        'landscape',
        'object',
        'food',
        'flowers',
        'architecture',
        'yellow',
        'green',
        'blue',
        'orange',
        'black',
        'white',
        'brown',
        'red',
        'patterns',
        'animal',
        'code',
        'space'
      ]
      const randomWord = arrayRandom(searchTerms)
      const res = await fetch(`https://pixabay.com/api/?key=25393280-e69bb6ffc2e55687d1137cde8&q=${randomWord}`)
      const data = await res.json()
      const randomImage = arrayRandom(data.hits)
      this.$emit('hit', randomImage.webformatURL)
    }
  }
}
</script>

<style scoped>

</style>
