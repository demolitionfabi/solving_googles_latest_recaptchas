function clickNotRobot() {
  // console.log("Try to click on the checkbox \"I'm not a robot\"...")

  var checkbox = $('.recaptcha-checkbox')
  if (checkbox.length) {
    checkbox.click()
    console.log("✅ Checkbox was clicked!")
  } else {
    // console.log("❌ Checkbox not found!")
  }
}

function clickReload(callback) {
  var reload = $('.reload-button-holder button')
  if (reload.length) {
    reload.click()
    setTimeout(callback, 1000)
  }
}

function clickValidate() {
  var button = $('.verify-button-holder button')
  if (button.length) {
    button.click()
  }
}

function getCaptchaUrl() {
  // console.log("Try to find the reCaptcha image...")

  var image = $('img[class^=rc-image-tile-]')
  if (image.length) {
    console.log("✅ reCaptcha image was found!")
    return image.attr('src')
  } else {
    // console.log("❌ reCaptcha image not found!")
    return null
  }
}

function getTerm() {
  // console.log("Try to find the term...")

  var container = $('[class^=rc-imageselect-desc]')
  if (container.length) {
    var term = container.find('strong').html()
    console.log("✅ Term was found: " + term)
    return term
  } else {
    // console.log("❌ Term not found!")
  }
}

function parseTerm(term, whitelist) {
  var terms = whitelist[term]
  if (typeof(terms) == 'undefined') {
    return []
  } else {
    return terms
  }

  // if (whitelist[term] && whitelist[term] == true) {
  //   return whitelist[term]
  // } else {
  //   return []
  // }
  // console.log(whitelist[term] && whitelist[term] == true)
  // return whitelist[term]

  // if (term in whitelist) {
  //   return whitelist[term]
  // } else {
  //   return []
  // }
}

function getGrid() {
  // console.log("Try to find the grid...")

  var container = $('table[class^=rc-imageselect-table-]')
  if (container.length) {
    var className = container.attr('class')
    var tableSizeString = className.slice(-2)
    var rows = tableSizeString.charAt(0)
    var columns = tableSizeString.charAt(1)
    var tableSize = {
      'rows': rows,
      'columns': columns
    }
    console.log("✅ Grid was found! Rows: " + rows + ", columns: " + columns)
    return tableSize
  } else {
    // console.log("❌ Grid not found!")
    return null
  }
}

function recognize(whitelist) {
  if (whitelist.lenght == 0) {
    return
  }

  if (location.href.startsWith("https://www.google.com/recaptcha/api2/bframe?") == false) {
    return
  }

  var term = getTerm()
  var terms = parseTerm(term, whitelist)
  if (terms.length == 0) {
    setTimeout(clickReload, 1000)
    setTimeout(function() {
      recognize(whitelist)
    }, 2000)
  } else {
    var captchaUrl = getCaptchaUrl()

    var tableSize = getGrid()
    if (tableSize) {
      var rows = tableSize["rows"]
      var columns = tableSize["columns"]
    }

    if (captchaUrl, rows, columns, terms) {
      console.log(terms)
      request(captchaUrl, rows, columns, terms)
    }
  }
}

function clickTile(row, column) {
  row += 1
  column += 1
  $('table[class^=rc-imageselect-table-] tbody tr:nth-child(' + row + ') td:nth-child(' + column + ')').click()
}

function request(url, rows, columns, terms) {
  if (url == null) {
    return
  }

  var getUrlParameter = function getUrlParameter(url, sParam) {
    var sPageURL = decodeURIComponent(url),
    sURLVariables = sPageURL.split(/\?|&/),
    sParameterName,
    i;
    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');
      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1];
      }
    }
  }

  var c = getUrlParameter(url, "c")
  var k = getUrlParameter(url, "k")
  var u = url.split("?")[0]

  $.ajax({
    url: "https://www.htfs.de/captchas/captchas.php?u=" + u + "&c=" + c + "&k=" + k + "&rows=" + rows + "&columns=" + columns + "&terms=" + terms.join(','),
  }).done(function(data) {
    console.log(data)
    //var jsonData = jQuery.parseJSON(data)
    data.forEach(function(obj) {
      if(obj.isCorrectImage) {
        clickTile(obj.row, obj.column)
      }
    })
    setTimeout(clickValidate, 1000)
  })
}

chrome.runtime.sendMessage({from: "load_json"}, function(response) {
  clickNotRobot()
  setTimeout(function() { recognize(response) }, 1000)
});


