var styles = `.theme-cosmos{--variable-shim-primary-background: #00020e; --variable-shim-property: #06e1ff; font-family: monospace !important; --variable-shim-number: #d36565; --variable-shim-string: #18d141; --variable-shim-keyword: #00ffb5; }`

var styleSheet = document.createElement("style")
styleSheet.type = "text/css"
styleSheet.innerText = styles
document.head.appendChild(styleSheet)
document.getElementById("sidebar").style.backgroundImage = "linear-gradient(90deg, #00706b, #02000a00)"