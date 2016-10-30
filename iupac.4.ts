module iupac4 {
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
    'tetradec',
  ];

  class Chars {
    private readonly LEN = 0
    private n = 0
    constructor(public src: string) {
      this.LEN = src.length
    }
    public next(): string {
      if (this.n >= this.LEN) return null
      let ch = this.src.charAt(this.n)
      this.n++
      return ch
    }
  }

  class Substituent {
    constructor(
      public root: number = 0,
      public len: number = 0
    ) { }
  }

  class Molecule {
    constructor(
      public main: Substituent = new Substituent(),
      public subs: Molecule[] = []
    ) { }
  }

  class MoleculeParser {
    private chars: Chars
    constructor(private smiles: string) {
      this.chars = new Chars(smiles)
    }

    public parse(mol: Molecule = new Molecule()): Molecule {
      var ch = this.chars.next()
      //console.log(this.n + ' ' + ch)
      switch (ch) {
        case '(':
          let sub = this.parse()
          //console.log(this.iupac(mol))
          if (sub.main.len >= mol.main.len) {
            mol.main.len--
            sub.main.len++
            sub.main.root = 0
            let temp = mol
            mol = sub
            sub = temp
          }
          sub.main.root = mol.main.len
          mol.subs.push(sub)
          console.log(this.iupac(mol))
          return this.parse(mol)
        case ')':
          return mol
        case 'C':
        case 'c':
          mol.main.len++
          return this.parse(mol)
        case null:
          //break when no more chars ( = null)
          return mol
        default:
          //skip unknown chars
          return this.parse(mol)
      }
    }

    private iupacSub(sub: Substituent): string {
      let name = sub.root + '-' + cname[sub.len] + 'yl'
      console.log(name)
      return name
    }

    public iupac(mol: Molecule): string {
      let name = '';
      mol.subs.forEach(sub => {
        name += this.iupac(sub)
      })
      //if (mol.subs.length > 1) name = '(' + name + ')'
      let prefix = ''
      if (mol.main.root > 1) prefix = mol.main.root + '-'
      let suffix = 'yl-'
      if (mol.main.root <= 1) suffix = 'ane'
      name = prefix + name + cname[mol.main.len] + suffix
      return name
    }
  }

  export function main(smiles: string) {
    console.clear()
    console.log(''+smiles+'')
    let mp = new MoleculeParser(smiles)
    let m = mp.parse()
    console.log(JSON.stringify(m))
    console.log(mp.iupac(m))
  }

  main('C(C(CC)(CC))')
}