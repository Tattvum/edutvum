module iupac3 {
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

  type NumberStack = number[]
  type NumberMap = { [key: string]: number; }

  class Graph {
    private chars: Chars
    constructor(private smiles: string) {
      this.chars = new Chars(smiles)
    }

    private n = 0
    public countNodes(): number {
      return this.n
    }
    private newNode(): number {
      this.n++
      return this.n
    }

    //store both a-b and b-a. 
    //value is bond type (1,2,3)
    private _bonds: NumberMap = {}
    private _degrees: number[] = [0]
    public bonds(): NumberMap {
      return this._bonds
    }
    public degrees(): number[] {
      return this._degrees
    }
    public countBonds(): number {
      return Object.keys(this._bonds).length / 2
    }
    private addDegree(n: number) {
      let v = this._degrees[n]
      this._degrees[n] = (v === undefined) ? 1 : v + 1
    }
    private mapBond(n1, n2: number, b: number) {
      if (n1 === undefined) return
      if (n2 === undefined) return
      this._bonds[n1 + '-' + n2] = b
      this._bonds[n2 + '-' + n1] = b
      this.addDegree(n1)
      this.addDegree(n2)
    }

    private last: number
    private bases: NumberStack = []
    private bond: number = 1

    public build() {
      var ch = this.chars.next()
      //console.log(this.n + ' ' + ch)
      switch (ch) {
        case '(':
          this.bond = 1
          this.bases.push(this.last)
          //console.log(this.bases)
          this.build()
          break
        case ')':
          this.bond = 1
          this.last = this.bases.pop()
          //console.log(this.bases)
          this.build()
          break;
        case '-':
          this.bond = 1
          this.build()
          break
        case '=':
          this.bond = 2
          this.build()
          break
        case '#':
          this.bond = 3
          this.build()
          break
        case 'C':
        case 'c':
          let C = this.newNode()
          //console.log('C' + C)
          this.mapBond(C, this.last, this.bond)
          this.last = C
          this.bond = 1
          this.build()
          break
        case null:
          //break when no more chars ( = null)
          break
        default:
          //skip unknown chars
          this.build()
          break
      }
    }
  }

  export function main(smiles: string) {
    console.clear()
    console.log(smiles)
    let g = new Graph(smiles)
    g.build()
    console.log('nodes: ' + g.countNodes())
    console.log('bonds: ' + g.countBonds())
    console.log(JSON.stringify(g.bonds()))
    console.log(JSON.stringify(g.degrees()))
  }

  main('CC(C)/C(=C/C)C(C(C)C#C)C')
}