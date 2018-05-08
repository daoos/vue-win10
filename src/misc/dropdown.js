/* 绑定dropdown相关事件 */
import {closest} from './utils'

function dropdownEvent () {
  var regex = /static|selectize/g, visibleDropdown, parent, toggle
  document.body.addEventListener('click', function (e) {
    if (e && e.which === 3) {
      return  // right button (assuming a right-handed mouse)
    }
    var el = e.target
    if (visibleDropdown) {
      toggle = closest(el, '[dropdown-toggle]')
      console.log(toggle)
      if (visibleDropdown.contains(el)) {
        if (regex.test(visibleDropdown.className)) {
          return
        }
      } else {
        visibleDropdown.classList.remove('show')
        visibleDropdown = null
        if (toggle) {
          visibleDropdown = toggle.parentNode.querySelector('.dropdown-menu')
          visibleDropdown.classList.add('show')
        }
      }
      return
    }
    Array.from(document.querySelectorAll('.dropdown-menu')).forEach(m => { // close all dropdown-menus
      parent = m.parentNode
      if (parent.contains(el)) {
        if (regex.test(m.className)) {  // means dont't close right now, it will be handled somewhere
          return
        }
        m.classList.add('show')
        visibleDropdown = m
        return
      }
      m.classList.remove('show')
    })
  })
}

dropdownEvent()
