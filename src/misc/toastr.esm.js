/*
 * Toastr (without jQuery)
 * Copyright 2012-2015
 * Authors: John Papa, Hans Fjällemark, and Tim Ferrell.
 * All Rights Reserved.
 * Use, reproduction, distribution, and modification of this code is subject to the terms and
 * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
 *
 * ARIA Support: Greta Krafsig
 *
 * Project: https://github.com/CodeSeven/toastr
 */

var DEFAULTS = {
  debug: false,
  tapToDismiss: false,
  containerId: 'toast-container',
  wrapperClass: 'toast-wrapper',
  toastClass: 'toast',

  onShown: undefined,
  onHidden: undefined,
  closeMethod: false,
  closeDuration: false,
  closeEasing: false,
  closeOnHover: true,

  extendedTimeOut: 1000,
  iconClasses: {
    error: 'toast-error',
    info: 'toast-info',
    success: 'toast-success',
    warning: 'toast-warning'
  },
  iconClass: 'toast-info',
  positionClass: 'toast-bottom-left',
  closeClass: 'toast-close-button',
  titleClass: 'toast-title',
  messageClass: 'toast-message',
  progressClass: 'toast-progress',
  preventDuplicates: false,
  progressBar: false,
  escapeHtml: false,
  newestOnTop: true,
  rtl: false
}

const toastr = function () {
  var container
  var listener
  var toastId = 0
  var previousToast

  var toastr = {
    clear: clear,
    remove: remove,
    error: error,
    getContainer: getContainer,
    info: info,
    options: {},
    subscribe: subscribe,
    success: success,
    version: '2.1.3',
    warning: warning
  }

  return toastr

  function getContainer (options) {
    if (container) return container
    if (!options) { options = getOptions() }
    container = document.getElementById(options.containerId)
    if (!container) {
      container = document.createElement('div')
      container.setAttribute('id', options.containerId)
      container.classList.add(options.positionClass)
      document.body.appendChild(container)
    }
    return container
  }

  function subscribe (callback) {
    listener = callback
  }

  function remove (toastElement) {
    var options = getOptions()
    if (!container) { getContainer(options) }
    if (toastElement == document.activeElement) {
      removeToast(toastElement)
    }
  }

  function clear ($toastElement, clearOptions) {
    var options = getOptions()
    if (!container) { getContainer(options) }
    if (!clearToast($toastElement, options, clearOptions)) {
      clearContainer(options)
    }
  }

  function success (title, message, optionsOverride) {
    return notify({
      type: 'success',
      iconClass: getOptions().iconClasses.success,
      message: message,
      optionsOverride: optionsOverride,
      title: title
    })
  }

  function warning (title, message, optionsOverride) {
    return notify({
      optionsOverride: optionsOverride,
      iconClass: getOptions().iconClasses.warning,
      type: 'warning',
      message: message,
      title: title
    })
  }

  function error (title, message, optionsOverride) {
    return notify({
      type: 'error',
      iconClass: getOptions().iconClasses.error,
      message: message,
      optionsOverride: optionsOverride,
      title: title
    })
  }

  function info (title, message, optionsOverride) {
    return notify({
      type: 'info',
      iconClass: getOptions().iconClasses.info,
      message: message,
      optionsOverride: optionsOverride,
      title: title
    })
  }

  // internal functions

  function clearContainer (options) {
    var toastsToClear = container.children
    for (var i = toastsToClear.length - 1; i >= 0; i--) {
      clearToast(toastsToClear[i], options)
    }
  }

  function clearToast (toastElement, options, clearOptions) {
    var force = clearOptions && clearOptions.force ? clearOptions.force : false
    if (toastElement && (force || toastElement == document.activeElement)) {
      removeToast(toastElement)
      return true
    }
    return false
  }

  function removeToast (toastElement) {
    toastElement.classList.remove('active')
    setTimeout(function () {
      var parent = toastElement.parentNode
      parent.parentNode && parent.parentNode.removeChild(parent)
      toastElement = null
    }, 268)
    if (container.children.length === 0) {
      previousToast = undefined
    }
  }

  function publish (args) {
    listener && listener(args)
  }

  function getOptions () {
    return Object.assign({}, DEFAULTS, toastr.options)
  }

  function notify (map) {
    var options = getOptions()
    var iconClass = map.iconClass || options.iconClass

    if (typeof (map.optionsOverride) !== 'undefined') {
      options = Object.assign(options, map.optionsOverride)
      iconClass = map.optionsOverride.iconClass || iconClass
    }

    if (shouldExit(options, map)) {
      return
    }

    toastId++

    container = getContainer(options)

    var intervalId
    var progressElem
    var closeElem
    var messageElem = document.createElement('div')
    var titleElem = document.createElement('div')
    var toastElem = document.createElement('div')
    var progressBar = {
      maxHideTime: null,
      intervalId: null,
      hideEta: null
    }
    var response = {
      startTime: new Date(),
      toastId: toastId,
      options: options,
      state: 'visible',
      map: map
    }

    personalizeToast()

    displayToast()

    handleEvents()

    publish(response)

    if (options.debug && console) {
      console.log(response)
    }

    return toastElem

    function personalizeToast () {
      setRTL()
      setAria()
      setIcon()
      setTitle()
      setMessage()
      setCloseButton()
      setProgressBar()
    }

    function displayToast () {
      var wrapper = document.createElement('div')
      wrapper.className = options.wrapperClass

      wrapper.appendChild(toastElem)

      if (options.newestOnTop) {
        container.insertBefore(wrapper, container.firstChild)
      } else {
        container.appendChild(wrapper)
      }

      setTimeout(function () {
        toastElem.classList.add('active')
      }, 15)
      options.onShown && options.onShown()
      if (options.timeOut > 0) {
        intervalId = setTimeout(hideToast, options.timeOut)
        progressBar.maxHideTime = parseFloat(options.timeOut)
        progressBar.hideEta = new Date().getTime() + progressBar.maxHideTime
        if (options.progressBar) {
          progressBar.intervalId = setInterval(updateProgress, 10)
        }
      }
    }

    function handleEvents () {
      if (options.closeOnHover) {
        toastElem.addEventListener('mouseenter', stickAround)
        toastElem.addEventListener('mouseout', delayedHideToast)
      }

      if (options.closeButton && closeElem) {
        closeElem.addEventListener('click', function (event) {
          if (event.stopPropagation) {
            event.stopPropagation()
          } else if (event.cancelBubble !== undefined && event.cancelBubble !== true) {
            event.cancelBubble = true
          }

          if (options.onCloseClick) {
            options.onCloseClick(event)
          }

          hideToast(true)
        })
      }

      if (options.onclick) {
        toastElem.addEventListener('click', function (event) {
          options.onclick(event)
          hideToast()
        })
      } else if (options.tapToDismiss) {
        toastElem.addEventListener('click', hideToast)
      }
    }

    function setRTL () {
      if (options.rtl) {
        toastElem.classList.add('rtl')
      }
    }

    function setAria () {
      var ariaValue = ''
      switch (map.iconClass) {
        case 'toast-success':
        case 'toast-info':
          ariaValue = 'polite'
          break
        default:
          ariaValue = 'assertive'
      }
      toastElem.setAttribute('aria-live', ariaValue)
    }

    function setIcon () {
      if (map.iconClass) {
        toastElem.classList.add(options.toastClass)
        toastElem.classList.add(iconClass)
      }
    }

    function setTitle () {
      if (map.title) {
        var suffix = map.title
        if (options.escapeHtml) {
          suffix = escapeHtml(map.title)
        }
        titleElem.innerHTML += suffix
        titleElem.classList.add(options.titleClass)
        toastElem.appendChild(titleElem)
      }
    }

    function setMessage () {
      if (map.message) {
        var suffix = map.message
        if (options.escapeHtml) {
          suffix = escapeHtml(map.message)
        }
        messageElem.innerHTML += suffix
        messageElem.classList.add(options.messageClass)
        toastElem.appendChild(messageElem)
      }
    }

    function setCloseButton () {
      if (options.closeButton) {
        closeElem = document.createElement('b')
        closeElem.innerHTML = '&times'
        closeElem.classList.add(options.closeClass)
        closeElem.setAttribute('role', 'button')
        toastElem.insertBefore(closeElem, toastElem.firstChild)
      }
    }

    function setProgressBar () {
      if (options.progressBar) {
        progressElem = document.createElement('div')
        progressElem.classList.add(options.progressClass)
        var parent = progressElem.parentNode
        parent.insertBefore(progressElem, parent.firstChild)
      }
    }

    function shouldExit (options, map) {
      if (options.preventDuplicates) {
        if (map.message === previousToast) {
          return true
        } else {
          previousToast = map.message
        }
      }
      return false
    }

    function hideToast (override) {
      if (toastElem == document.activeElement && !override) {
        console.log('override')
        return
      }
      removeToast(toastElem)
      clearTimeout(progressBar.intervalId)
      clearTimeout(intervalId)
      if (options.onHidden && response.state !== 'hidden') {
        options.onHidden()
      }
      response.state = 'hidden'
      response.endTime = new Date()
      publish(response)
    }

    function delayedHideToast () {
      if (options.timeOut > 0 || options.extendedTimeOut > 0) {
        intervalId = setTimeout(hideToast, options.extendedTimeOut)
        progressBar.maxHideTime = parseFloat(options.extendedTimeOut)
        progressBar.hideEta = new Date().getTime() + progressBar.maxHideTime
      }
    }

    function stickAround () {
      clearTimeout(intervalId)
      progressBar.hideEta = 0
    }

    function updateProgress () {
      var percentage = ((progressBar.hideEta - (new Date().getTime())) / progressBar.maxHideTime) * 100
      progressElem.width(percentage + '%')
    }

    function escapeHtml (source) {
      if (source == null) {
        source = ''
      }

      return source
        .replace(/&/g, '&amp')
        .replace(/"/g, '&quot')
        .replace(/'/g, '&#39')
        .replace(/</g, '&lt')
        .replace(/>/g, '&gt')
    }
  }
}

export default toastr()
