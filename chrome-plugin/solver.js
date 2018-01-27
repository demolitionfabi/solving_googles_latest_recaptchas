var iframe = $("iframe[src*='https://www.google.com/recaptcha']").contents()

function clickNotRobot() {
  var checkbox = iframe.find('.recaptcha-checkbox')
  checkbox.click()
}

function getCaptchaUrl() {
  var src = iframe.find('img[class^=rc-image-tile-]').attr('src')
  return src
}

function getTerm() {
  var container = null

  var container1 = iframe.find('.rc-imageselect-desc-wrapper .rc-imageselect-desc')
  var container2 = iframe.find('.rc-imageselect-desc-wrapper .rc-imageselect-desc-no-canonical')

  if(container1.length) {
    container = container1

  } else if(container2.length) {
    container = container2

  } else {
    return null
  }

  var term = container.find('strong').html()
  return term;
}

function parseTerm(term) {
  var terms = new Array()
  terms = term.split(' or ')
  return terms
}

function getGrid() {
  var container = iframe.find('table[class^=rc-imageselect-table-]')
  var className = container.attr('class')
  var tableSizeString = className.slice(-2)
  var rows = tableSizeString.charAt(0)
  var columns = tableSizeString.charAt(1)
  var tableSize = {
    'rows': rows,
    'columns': columns
  }

  return tableSize
}

function recognize() {
  var captchaUrl = getCaptchaUrl()
  var tableSize = getGrid()
  var term = getTerm()
  var terms = parseTerm(term)
  console.log(captchaUrl)

  var rows = tableSize["rows"]
  var columns = tableSize["columns"]

  request(captchaUrl, rows, columns, terms)
}

function click(row, column) {
  row += 1
  column += 1
  iframe.find('table[class^=rc-imageselect-table-] tbody tr:nth-child(' + row + ') td:nth-child(' + column + ')').click()
}

function request(url, rows, columns, terms) {
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
          click(obj.row, obj.column)
        }
      })
  })
}

setTimeout(clickNotRobot, 1000)
setTimeout(recognize, 4000)
