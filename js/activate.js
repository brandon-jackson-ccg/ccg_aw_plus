console.log('activate.js START')

var currentUrl = window.location.href

setTimeout(() => { // wait 2 seconds to allow Workflow to load everything.
  // if (currentUrl.includes('sp/custom-table/list')) { loadAllTableValues('CustomTablePageTable') }
  // if (currentUrl.includes('sp/custom-table/entries')) { prePopulateSqlFilter() }
  if (currentUrl.includes('sp/system-log')) { loadAllTableValues('logTable') }
  if (document.getElementById('search-btn')) { addSearchShortcut() }
  if (currentUrl.includes('sp/scripts')) { 
    addValidateShortcut()
    preventCtrlS()
    addPublishShortcut()
  }
}, 2000);


console.log('activate.js END')

/*
** Loads all rows in a table.
** Currently turned off as I need to add a limit so very large tables do not take forever
*/
function loadAllTableValues(tableId) {
  var query = String(`#${ tableId } table`)

  var table = document.querySelector(query)
  var rowCount = table.getAttribute('aria-rowcount')
  var tableBody = table.querySelector('tbody')

  for (let i = 0; (i < rowCount / 10) && i <= 10; i++) {
      tableBody.scrollTop = tableBody.scrollHeight;
      tableBody.dispatchEvent(new Event('scroll'));
  }

  tableBody.scrollTop = 0;
}

function getOpenScriptSystemId() {
  var scriptLabels = document.querySelectorAll('div .script-editor .script-tab-label .label-value')
  var systemId = scriptLabels[scriptLabels.length - 2]

  return systemId
}

/*
** Automatically adds "select * from [tableName]" to the SQL filter on Custom Table pages
** Currently turned off as I need to update it to run when the Angular modal is loaded instead of only on page refreshes
*/
function prePopulateSqlFilter() {
  var pageTitle = document.querySelector('#page-title h1').textContent.split(' - ')
  var tableName = pageTitle[pageTitle.length - 1]

  var baseSqlFilter = "select * from " + tableName + " "
  var sqlFilter = document.querySelector('#sqlFilter')

  if (!sqlFilter.value.includes(baseSqlFilter)) {
    sqlFilter.value += baseSqlFilter

    sqlFilter.focus()
  }
}

/*
** Sets Ctrl + ; as a shortcut to search on the System Log page
**
*/
function addSearchShortcut() {
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key == ';') {
      document.getElementById('search-btn').click()
    }
  })
}

/*
** Sets Ctrl + ; as a shortcut to validate on the script editor page
**
*/
function addValidateShortcut() {
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key == ';') {
      document.getElementById('validate-btn').click()
    }
  })
}

/*
** Sets Ctrl + S; as a shortcut to Publish on the script editor page
**
*/
function addPublishShortcut() {
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key == 's') {
      document.getElementById('publish-btn').click()
    }
  })
}

/*
** Prevents the script editor page from trying save the file when Ctrl + S is pressed
**
*/
function preventCtrlS() {
  document.onkeydown = function (e) {
    e = e || window.event;//Get event
    if (e.ctrlKey) {
        var c = e.which || e.keyCode; //Get key code
        switch (c) {
            case 83://Block Ctrl+S
                e.preventDefault();     
                e.stopPropagation();
            break;
        }
    }
  };
}

function addResultTableRowFix(characterLimit) {
  var dataCells = document.getElementsByClassName('ui-cell-data')

  for (var i = 0; i < dataCells.length; i++) {
    var message = dataCells[i].textContent

    if (message.length >= characterLimit) {
      dataCells[i].title = message
      dataCells[i].textContent = message.substring(0, characterLimit - 7) + ' <...>'
    }
  }
}


function addLogWindowToContextMenu() {
  var existingLogElement = document.getElementById('systemLogWrap')
  console.log(existingLogElement)
  if (existingLogElement) { return }

  getSystemLogResults().then(function(result) {
    var allLogTableRowTags = ""

    for (i = 0; i < result.length; i++) {
      allLogTableRowTags += getLogTableRowElement(result[i])
    }
    
  var tabsSection = document.getElementById('script-ide-section-context').firstElementChild
  var logElement = `
                    <div id="systemLogWrap">
                      <div class="newEntityLinkAdmin">
                        <span style="font-weight: bold;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;System Logs</span>
                    </div>
                    <div class="apmp border">
                    <div class="apmp where-clause-container">
    <textarea class="apmp where-clause-input" id="query" name="query"></textarea>
    <div class="button-container">
        <button class="apmp btn btn-primary center" id="search-btn" type="button">
            <span aria-hidden="true" class="sap-icon--search" aria-label="Search"></span> Search 
        </button>
    </div>
</div>
                    <table class="apmp">
                    <tr>
                        <th>EVENT_DATE</th>
                        <th>LOG_LEVEL</th>
                        <th>MESSAGE</th>
                        <th>SCRIPT_SYSTEM_ID</th>
                        <th>CASE_ID</th>
                        <th>USER_NAME</th>
                    </tr>
                    ${allLogTableRowTags}
                </table>
                    </div>
                  </div>  

                  `
    tabsSection.insertAdjacentHTML('beforeend', logElement)
  }).catch(function(reject) {
    console.log('ERROR create System Log Table Rows: ' + reject)
  })
}

function getLogTableRowElement(row) {
  return `
    <tr>
      <th>${row.eventDate}</th>
      <th>${row.logLevel}</th>
      <th>${row.message}</th>
      <th>${row.scriptName}</th>
      <th>${row.caseId}</th>
      <th>${row.userName}</th>
    </tr>
  `
}

function getWorkflowObject() { // This returns a 24MB object
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    var url = "https://sandbox.webcomserver.com/wpm/api_ui/action_defns/casetype/29";
  
    xhr.open("GET", url, true)
    xhr.setRequestHeader("Authorization", "Bearer BXJAYfdu76JIaNJvxA6qYb0JfI+VSJP/NxobGJOuWIvG+qcYHNiDxi70jFKZ836EhEm3BtpBsq+KvlVK+Lbp3JUKA8mKgst/pwVilDTAzSd9r+A3S6KLoMjXEaNYqgfmAGvN9wrAiw5ekZyXAgeAKdVPCiUz1Wj00mjedYzFdTkVrGjhSRplFAQTJb9qkalVjcaZklviEvk5TMM/H1echTKkHd7xqnecMmgCPuuXhHdyk3Yy0Bgp3lN2M5AgrkRZuCPlWe12kinPi9AHutNdNg==")
    xhr.setRequestHeader("Content-Type", "application/json")
  
    // var data = JSON.stringify({"firstResult": "110", "maxResult": "10", "sortOrder": "1", "filterMetadata": []})

    xhr.onload = function() {
      // resolve(JSON.parse(this.responseText).content)
      console.log(this.responseText)
    }

    xhr.onerror = reject
    xhr.send()
  })
}

function getSystemLogResults(additionalPageAmount = 1) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    var url = "https://sandbox.webcomserver.com/wpm/api_ui/system_log/pageable?whereClause=";
  
    xhr.open("POST", url, true)
    xhr.setRequestHeader("Authorization", "Bearer BXJAYfdu76JIaNJvxA6qYb0JfI+VSJP/NxobGJOuWIvG+qcYHNiDxi70jFKZ836EhEm3BtpBsq+KvlVK+Lbp3JUKA8mKgst/pwVilDTAzSd9r+A3S6KLoMjXEaNYqgfmAGvN9wrAiw5ekZyXAgeAKdVPCiUz1Wj00mjedYzFdTkVrGjhSRplFAQTJb9qkalVjcaZklviEvk5TMM/H1echTKkHd7xqnecMmgCPuuXhHdyk3Yy0Bgp3lN2M5AgrkRZuCPlWe12kinPi9AHutNdNg==")
    xhr.setRequestHeader("Content-Type", "application/json")
  
    var data = JSON.stringify({"firstResult": "110", "maxResult": "10", "sortOrder": "1", "filterMetadata": []})

    xhr.onload = function() {
      resolve(JSON.parse(this.responseText).content)
    }

    xhr.onerror = reject
    xhr.send(data)
  })
}
