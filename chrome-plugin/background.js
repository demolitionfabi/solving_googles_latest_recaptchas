/*chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.executeScript(null, { 
        file: "solver.js"
    })
})

chrome.browserAction.onClicked.addListener(function(tab) {
	alert("test");
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(settings) {
      console.log(settings.target.response)

      chrome.tabs.executeScript(null, { 
        file: "solver.js"
    })
  };
  xhr.open("GET", chrome.extension.getURL('/whitelist.json'), true);
  xhr.send();

})*/


chrome.extension.onMessage.addListener(function(request, sender, response) {
    if(request.from === "load_json") {
        var xhr = new XMLHttpRequest()
        xhr.responseType = "json"
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                response(xhr.response)
            }
        }
        xhr.open("GET", chrome.extension.getURL('/whitelist.json'), true)
        xhr.send();
        return true
    } else {
        response()
    }
})
