/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faPencilAlt, faCamera } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faPencilAlt, faCamera)

export default (app) => app.component('f-a', FontAwesomeIcon)
