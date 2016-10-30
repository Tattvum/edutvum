
module iupac1 {
  let cname = [
    '',
    'meth',
    'eth',
    'prop',
    'but',
    'pent',
    'hex',
    'hept',
    'oct',
    'non',
    'dec',
    'undec',
    'dodec',
    'tridec',
  ];

  class Trans {
    constructor(
      public a: number = 0,
      public iupac: string = '',
    ) { }
    public toString(): string {
      return this.iupac
    }
  }

  function smilesToIupac(smiles: string, a: number = 0): Trans {
    console.log('smiles : ' + smiles.substr(a))
    let out = new Trans(a)
    let cs = 0;
    loop:
    for (; out.a < smiles.length; out.a++) {
      var ch = smiles.charAt(out.a)
      console.log(out.a + ' ' + ch)
      switch (ch) {
        case '(':
          let out2 = smilesToIupac(smiles, out.a + 1)
          out.a = out2.a
          out.iupac += cs + '-' + out2.iupac + '-'
          break
        case ')':
          break loop;
        case 'C':
        case 'c':
          cs++;
          break
      }
    }
    out.iupac += cname[cs] + (a === 0 ? 'ane' : 'yl')
    console.log('iupac @' + a + ': ' + out.iupac + ' (' + out.a + ')')
    return out
  }

  export function main(smiles: string) {
    var div = document.getElementById('iupac')
    div.textContent = '' + smilesToIupac(smiles)
  }

  main('C=CC(CCC)C(C(C)C)CCC')
}