namespace iupac {

  class Carbon {
    private static all: Carbon[] = []
    static reset() {
      Carbon.all = []
      new Carbon(null)//dummy - to make it start from 1
    }
    static reveal() {
      console.log('Carbons: [' + Carbon.all.join(',') + ']')
      Carbon.all.forEach(c => {
        console.log(c._id + ' - ' + c.bonds.length)
      })
      console.log(',,,,,,,,,,,')
    }
    static tips(): Carbon[] {
      return Carbon.all.filter(c => c.bonds.length === 1)
    }
    static fixDegrees(): number {
      let total = 0
      Carbon.all.forEach(c => total += c.fixDegree())
      return total
    }

    private _id: number
    private bonds: Carbon[] = []

    private fixedDeg: number = 0
    public fixedDegree(): number {
      return this.fixedDeg
    }
    public fixDegree(): number {
      return this.fixedDeg = this.bonds.length
    }

    constructor(peer: Carbon) {
      this._id = Carbon.all.length
      Carbon.all.push(this)
      if (peer !== null) {
        peer.bonds.push(this)
        this.bonds.push(peer)
      }
    }
    public id(): number {
      return this._id
    }
    public equals(other: Carbon): boolean {
      return this.id() === other.id()
    }
    public _shrink1(): Carbon {
      if (this.bonds.length !== 1) return null
      //console.log('removing ' + this.id() + '-' + this.bonds[0].id())
      let bs = this.bonds[0].bonds
      bs.splice(bs.indexOf(this), 1)
      return this.bonds.splice(0, 1)[0]
    }
    public degree(): number {
      return this.bonds.length
    }
    public toString(): string {
      return '' + this._id
    }
  }

  //-----------------------------------------------------------------------------

  class SemiPath {
    public totalDegrees = 0
    private chain = new common.Chain<Carbon>()
    public alive = true
    constructor(c: Carbon) {
      this.chain.push(c)
    }
    public size(): number {
      return this.chain.size()
    }
    private sign(x: number): number {
      return (x > 0) ? 1 : (x === 0) ? 0 : -1
    }
    public compare(other: SemiPath): number {
      return this.sign(this.totalDegrees - other.totalDegrees)
    }
    public build(builder: (c: Carbon) => Carbon): boolean {
      if (!this.alive) return false
      let c = builder(this.chain.peek())
      if (c !== null) {
        this.chain.push(c)
        this.totalDegrees += c.fixedDegree()
        if (c.degree() > 1) this.alive = false
        return true
      }
      return false
    }
    public end(): Carbon {
      return this.chain.peek()
    }
    public iupac(): string {
      return cname[this.size() - 1]
    }
    public corbons(): Carbon[] {
      return this.chain.list()
    }
    public toString(): string {
      return '(' + this.totalDegrees + ') ' + this.chain
        + (this.alive ? '' : '*')
    }
  }

  //-----------------------------------------------------------------------------

  class SemiPaths {
    private paths: SemiPath[] = []
    constructor(tips: Carbon[]) {
      tips.forEach(c => this.paths.push(new SemiPath(c)))
    }

    public build() {
      //this.reveal()
      let todo = false
      this.paths.sort((a, b) => a.compare(b)).forEach(path => {
        //todo = todo || this.buildChain(chn)
        let t = path.build(c => c._shrink1())
        todo = todo || t
      })
      if (todo) this.build()
    }

    public longestChainInOrder(branches): Carbon[] {
      let locants = []
      //TBD : ASSUME exactly two paths in filter 
      let alives = this.paths.filter(p => p.alive)
      let a0 = alives[0].corbons()
      let a1 = alives[1].corbons()
      let main = a0.concat(a1.reverse().splice(1))
      let locs: number[] = []
      main.forEach((c, i) => {
        if (branches[c.id()] !== undefined) locs.push(i + 1)
      })
      //console.log('main. ' + main);
      let loccomp = Namer.compareLocants(locs, main.length + 1)
      if (loccomp > 0) main = main.reverse()
      else if (loccomp === 0) {
        console.log('TBD:  loccomp === 0');
      }
      //console.log('main. ' + main);
      return main
    }

    public iupac(): string {
      let branches = {}
      this.paths.filter(p => !p.alive).forEach(p => {
        branches[p.end().id()] = p
      })
      let main = this.longestChainInOrder(branches)
      let subs: string[] = []
      main.forEach((c, i) => {
        let p = branches[c.id()]
        if (p !== undefined) subs.push((i + 1) + '-' + p.iupac() + 'yl')
      })
      subs = Namer.normalizeSubstituenets(subs)
      return subs.join('-') + cname[main.length] + 'ane'
    }

    public reveal() {
      this.paths.forEach(path => console.log('' + path))
      console.log('--------')
    }
  }

  //-----------------------------------------------------------------------------

  class Molecule {
    private chars: common.Chars
    constructor(private smiles: string) {
      this.chars = new common.Chars(smiles)
    }

    public iupac(): string {
      Carbon.reset()
      this.build(null, new common.Stack<Carbon>())
      Carbon.fixDegrees()
      //Carbon.reveal()
      //console.log('----iupac----')
      let paths = new SemiPaths(Carbon.tips())
      paths.build()
      //paths.reveal()
      return paths.iupac()
    }

    private build(peer: Carbon, past: common.Stack<Carbon>): Carbon {
      var ch = this.chars.next()
      //console.log(ch + ' ' + peer + ' ' + past)
      switch (ch) {
        case '(': return this.build(peer, past.push(peer))
        case ')': return this.build(past.pop(), past)
        case 'C':
        case 'c': return this.build(new Carbon(peer), past)
        case null: return peer
        default: return this.build(peer, past)
      }
    }
  }

  //-----------------------------------------------------------------------------

  export function main(smiles: string): string {
    console.clear()
    console.log(smiles)
    let m = new Molecule(smiles)
    return m.iupac()
  }

  console.log(main('CCC(CC(CC)CC)C'))
}