function clickNotRobot() {
  var checkbox = $('.recaptcha-checkbox')
  if (checkbox.length) {
    checkbox.click()
    console.log("✅ Checkbox was clicked!")
  }
}

function clickReload(callback) {
  $('.reload-button-holder button').click()
}

function clickValidate() {
  var button = $('.verify-button-holder button')
  if (button.length) {
    button.click()
  }
}

function getCaptchaUrl() {
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
}

function getGrid() {
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

function recognize() {
  chrome.runtime.sendMessage({
    from: "load_json"
  }, function(whitelist) {
    if (whitelist.lenght == 0) {
      return
    }

    if (location.href.startsWith("https://www.google.com/recaptcha/api2/bframe?") == false) {
      return
    }

    var selectMore = $('.rc-imageselect-error-select-more')[0]
    if (!isHidden(selectMore)) {
      console.log("❌ Our answer was not enough, go to next")
		clickReload()
        setTimeout(recognize, 1500)
      return
    }

    var checkNewImages = $('.rc-imageselect-error-dynamic-more')[0]
    if (!isHidden(checkNewImages)) {
      console.log("❌ Our answer was wrong, go to next")
				clickReload()
        setTimeout(recognize, 1500)
      return;
    }

    var submitButton = $('button[id="recaptcha-verify-button"]')[0]
    var submitButtonDisabled = submitButton.classList.contains("rc-button-default-disabled")
    if (!submitButtonDisabled) {
      var term = getTerm()
      var terms = parseTerm(term, whitelist)
      if (terms.length == 0) {
        console.log("❌ Skipping this term out of bad experience ;)")
				clickReload()
        setTimeout(recognize, 1500)
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
        } else {
          console.log("error");
        }
      }
	  return
    }
    console.log("✅ We are done, it was a pleasure!")
  });
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
      if (obj.isCorrectImage) {
        clickTile(obj.row, obj.column)
      }
    })
    setTimeout(clickValidate, 3000)
    setTimeout(recognize, 4000)
  })
}

function isHidden(el) {
  if (el == null) {
    return true;
  }
  return window.getComputedStyle(el).display === 'none'
}

clickNotRobot()
setTimeout(function() {
  recognize()
}, 1500)