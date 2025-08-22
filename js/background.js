// background.js

function activate() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      files: ['js/activate.js']
    }).then(() => console.log("js/activate.js has been triggered"))   
  })
}

function updateStatus() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    let iconPath = "/media/ccg_logo_dark_xs.png"

    if (tabs[0].url?.includes('webcomserver')) {
      iconPath = "/media/ccg_logo_light_xs.png"
    }

    chrome.action.setIcon({
      path: {
        "16": iconPath,
        "32": iconPath,
        "48": iconPath,
        "128":iconPath
      }
    })
  })
}

chrome.tabs.onActivated.addListener( function ( activeInfo ) {
  // check url change and run again if so.
  console.log('onActivated - trigger js/activate.js && update extension icon status')
  activate()
  updateStatus()
});

chrome.tabs.onUpdated.addListener( function ( activeInfo ) {
  console.log('onUpdate - update extension icon status')
  updateStatus()
});
