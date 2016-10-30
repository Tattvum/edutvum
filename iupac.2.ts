module iupac2 {
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

  class Bond {
    constructor(
      public atom: Atom,
      public n: number = 1,
    ) { }
    public toString(): string {
      return '-'
    }
  }

  class Atom {
    public static root() {
      return new Atom(null, null, '*')
    }
    constructor(
      public parent: Bond,
      public branch: Atom = null,
      public symbol: string = 'C',
      public bonds: Bond[] = [],
    ) { }
    public newName(): string {
      let p = this.parent
      let out = p === null ? '' : p.atom.symbol
      return out + this.bonds.length
    }
    public toString(): string {
      return this.symbol
    }
  }

  let n = 0
  function build(smiles: string, parent: Atom, a: number = 0, bond: number = 1) {
    //console.log('smiles : ' + smiles.substr(a))
    var ch = smiles.charAt(a)
    console.log(a + ' ' + ch)
    switch (ch) {
      case '(':
        parent.branch = parent
        build(smiles, parent, a + 1, bond)
        break
      case ')':
        build(smiles, parent.branch, a + 1)
        break;
      case '-':
        build(smiles, parent, a + 1, 1)
        break
      case '=':
        build(smiles, parent, a + 1, 2)
        break
      case '#':
        build(smiles, parent, a + 1, 3)
        break
      case 'C':
      case 'c':
        n++
        console.log('C' + n)
        let C = new Atom(new Bond(parent, bond), parent.branch, 'C' + n)
        parent.bonds.push(new Bond(C, bond))
        build(smiles, C, a + 1)
        break
    }
  }

  function maxn(a: Atom, isRoot: boolean = false): number {
    let mxn = 0;
    for (var i = 0; i < a.bonds.length; i++) {
      let k = maxn(a.bonds[i].atom)
      if (k > mxn) mxn = k
    }
    return mxn + (isRoot?0:1)
  }

  function bonds(a: Atom) {
    console.log(a.symbol, a.bonds.length)
    for (var i = 0; i < a.bonds.length; i++) {
      bonds(a.bonds[i].atom)
    }
  }

  export function main(smiles: string) {
    console.clear()
    console.log(smiles)
    let root = Atom.root()
    n = 0
    build(smiles, root)
    //console.log(bonds(root))
    console.log(maxn(root.bonds[0].atom, false))
  }

  main('C=CC(CCC)C(C(C)C)CCC')
  //main('C(C(C))CCC')
}