import debounce from 'lodash/debounce'
const pageScrollDirective = {
  mounted (el, binding) {
    el.__pageScroll__ = debounce(() => {
      // console.log('scrolling')
      binding.value()
    }, 200, { leading: true })
    document.addEventListener('scroll', el.__pageScroll__)
  },
  unmounted (el) {
    document.removeEventListener('scroll', el.__pageScroll__)
  }
}

export default (app) => {
  app.directive('page-scroll', pageScrollDirective)
}
