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
        console.log(c.id + ' - ' + c.bonds.length)
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

    readonly id: number
    private bonds: Carbon[] = []

    private fixedDeg: number = 0
    public fixedDegree(): number {
      return this.fixedDeg
    }
    public fixDegree(): number {
      return this.fixedDeg = this.bonds.length
    }

    constructor(peer: Carbon) {
      this.id = Carbon.all.length
      Carbon.all.push(this)
      if (peer !== null) {
        peer.bonds.push(this)
        this.bonds.push(peer)
      }
    }
    public equals(other: Carbon): boolean {
      return this.id === other.id
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
      return '' + this.id
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
      return Namer.numPrefix(this.size() - 1)
    }
    public carbons(): Carbon[] {
      return this.chain.list()
    }
    public toString(): string {
      return '(' + this.totalDegrees + ') ' + this.chain
        + (this.alive ? '' : '*')
    }
  }

  //-----------------------------------------------------------------------------

  type SideChains = { [id: number]: string[] }

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

    private longestChainInOrder(sides: SideChains): Carbon[] {
      let locants = []
      //TBD : ASSUME exactly two paths in filter 
      let alives = this.paths.filter(p => p.alive)
      let a0 = alives[0].carbons()
      let a1 = alives[1].carbons()
      let main = a0.concat(a1.reverse().splice(1))
      let locs: number[] = []
      main.forEach((c, i) => {
        if (sides[c.id] !== undefined) locs.push(i + 1)
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

    private popChains(sides: SideChains, cid: number): string[] {
      let chains = sides[cid]
      sides[cid] = undefined
      if (chains === undefined) chains = []
      return chains
    }

    private buildSideChain(sides: SideChains, cs: Carbon[], id: number, ane: boolean = false) {
      //console.log('buildSideChain');
      let names = []
      cs.forEach((c, i) => {
        let chains = this.popChains(sides, c.id)
        chains.forEach(s => {
          if (s.search('[0-9]') >= 0) s = '(' + s + ')'
          names.push((i + 1) + '-' + s)
        })
      })
      let name = Namer.normalizeSubstituenets(names).join('-')
      name += Namer.numPrefix(cs.length) + (ane ? 'ane' : 'yl')
      if (sides[id] === undefined) sides[id] = []
      sides[id].push(Namer.synonym(name))
      console.log(JSON.stringify(sides));
    }

    private buildSideChains(sides: SideChains) {
      let nas = this.paths.filter(p => !p.alive)
      let snas = nas.sort((a, b) => a.compare(b))
      snas.forEach(p => {
        console.log('snas: ' + p);
        this.buildSideChain(sides,
          p.carbons().reverse().splice(1), p.end().id)
      })
    }

    public iupac(): string {
      let sides: { [id: number]: string[] } = {}
      this.buildSideChains(sides)
      let main = this.longestChainInOrder(sides)
      console.log('' + main)
      this.buildSideChain(sides, main, 0, true)
      return sides[0][0]
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

  console.log(main('C(CCCCCC(C(C(CC)C)C)C(C)CCCCCCCC)CCC'))
}