export function setPagecss(css = '') {
  const id = 'page-css'
  let element = document.getElementById(id)
  const head = document.querySelector('head')

  document.body.setAttribute('style', '')

  if (!element) {
    element = document.createElement('style')
    element.setAttribute('type', 'text/css')
    element.setAttribute('id', id)

    element.innerHTML = css
    head.appendChild(element)
  } else {
    element.innerHTML = css
  }
}
