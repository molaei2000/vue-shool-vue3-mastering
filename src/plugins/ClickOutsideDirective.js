const ClickOutsideDirective = {
  mounted (el, binding) {
    el.__handler__ = event => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event)
      }
    }
    document.body.addEventListener('click', el.__handler__)
  },
  unmounted (el) {
    document.body.removeEventListener('click', el.__handler__)
  }
}

export default (app) => {
  app.directive('click-outside', ClickOutsideDirective)
}
