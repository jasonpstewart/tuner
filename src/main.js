import './styles/main.css'
import './styles/controls.css'
import { createStringSelector } from './ui/string-selector.js'
import { createPermissionFlow, onStart, onStop } from './ui/permission-flow.js'

const stringSelectorEl = document.querySelector('.string-selector')
if (stringSelectorEl) {
  createStringSelector(stringSelectorEl)
}

const actionButtonsEl = document.querySelector('.action-buttons')
if (actionButtonsEl) {
  createPermissionFlow(actionButtonsEl)
  onStart((analyser) => {
    console.log('Tuner active — AnalyserNode ready', analyser)
  })
  onStop(() => {
    console.log('Tuner stopped')
  })
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
