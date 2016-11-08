$(function () {
  console.log('inside jquery2')
});

declare var JSApplet: any;
let jsmeApplet

//this function will be called after the JavaScriptApplet code has been loaded.
function jsmeOnLoad() {
  jsmeApplet = new JSApplet.JSME("jsme_container", "380px", "340px", {
    "options": "nocanonize,autonumber"
  });
  jsmeApplet.setNotifyStructuralChangeJSfunction("show_smiles");
}

function show_smiles() {
  let smiles = jsmeApplet.smiles(); //atom that are colored are numbered
  document.getElementById("smiles_container").innerHTML = smiles
  var spn = document.getElementById("iupac")
  spn.innerHTML = iupac.main(smiles)
  //jsmeApplet.setAtomBackgroundColors(1, '1,2,2,2,3,2,5,2,6,2,9,2')
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
