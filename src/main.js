import './styles/main.css'
import './styles/controls.css'
import { createStringSelector } from './ui/string-selector.js'

const stringSelectorEl = document.querySelector('.string-selector')
if (stringSelectorEl) {
  createStringSelector(stringSelectorEl)
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
