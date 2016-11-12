$(function () {
  console.log('inside jquery2')
});

declare var JSApplet: any;
let jsmeApplet

//this function will be called after the JavaScriptApplet code has been loaded.
function jsmeOnLoad() {
  jsmeApplet = new JSApplet.JSME("jsme_container", "380px", "340px", {
    "options": "canonize,autonumber"
  });
  jsmeApplet.setNotifyStructuralChangeJSfunction("show_smiles");
}

function show_smiles() {
  let smiles = jsmeApplet.smiles(); //atom that are colored are numbered
  document.getElementById("smiles_container").innerHTML = smiles
  var spn = document.getElementById("iupac")
  let info = iupac.main(smiles)
  spn.innerHTML = info[0]
  let ids = info[1]
  //console.log('main: ' + ids)
  //let clrs = info[1].join(',2,')
  //let clrs = ''
  //info[1].forEach(cid => clrs += (cid - 1) + ',2,')
  //ids.forEach(cid => clrs += (cid) + ',2,')
  //console.log('main clrs: ' + clrs)
  //jsmeApplet.setAtomBackgroundColors(1, '1,2,2,2,3,2,5,2,6,2,9,2')
  //jsmeApplet.resetAtomColors(1)
  //jsmeApplet.setAtomBackgroundColors(1, clrs)
}

var shown = true

function toggle() {
  let spn = document.getElementById("iupac")
  let btn = <HTMLButtonElement>document.getElementById("disp")
  if (shown) {
    spn.style.visibility = "hidden"
    btn.value = "Show"
  } else {
    spn.style.visibility = "visible"
    btn.value = "Hide"
  }
  shown = !shown
}
