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
      return Namer.numix(this.size() - 1)
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
  type ChainLink = [number, string]

  class SemiPaths {
    private paths: SemiPath[] = []
    constructor(tips: Carbon[]) {
      tips.forEach(c => this.paths.push(new SemiPath(c)))
    }

    public reveal() {
      this.paths.forEach(path => console.log('' + path))
      console.log('--------')
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

    private addSideChain(sides: SideChains, id: number, name: string) {
      if (sides[id] === undefined) sides[id] = []
      sides[id].push(Namer.synonym(name))
      console.log(JSON.stringify(sides));
    }

    //-----------------------------------------------------------------------------

    private popChains(sides: SideChains, cid: number): string[] {
      let chains = sides[cid]
      sides[cid] = undefined
      if (chains === undefined) chains = []
      return chains
    }

    private linksPlain(sides: SideChains, cs: Carbon[]): ChainLink[] {
      let links: ChainLink[] = []
      cs.forEach((c, i) => {
        let chains = this.popChains(sides, c.id)
        chains.forEach(s => {
          if (s.search('[0-9]') >= 0) s = '(' + s + ')'
          links.push([i + 1, s])
        })
      })
      return links
    }

    private joinLinks(links: ChainLink[]): string[] {
      let names: string[] = []
      links.forEach(lnk => names.push(lnk[0] + '-' + lnk[1]))
      return names
    }

    private links(sides: SideChains, cs: Carbon[]): string[] {
      return this.joinLinks(this.linksPlain(sides, cs))
    }

    private makeName(names: string[], len: number, suffix: string): string {
      let name = Namer.normalize(names).join('-')
      name += Namer.numix(len) + suffix
      return name
    }

    private buildSideChain(sides: SideChains, cs: Carbon[], id: number) {
      //console.log('buildSideChain');
      let names = this.links(sides, cs)
      let name = this.makeName(names, cs.length, 'yl')
      this.addSideChain(sides, id, name)
    }

    private buildSideChains(sides: SideChains) {
      let nas = this.paths.filter(p => !p.alive)
      let snas = nas.sort((a, b) => a.compare(b))
      snas.forEach(p => {
        console.log('snas: ' + p);
        let cs = p.carbons().reverse().splice(1)
        this.buildSideChain(sides, cs, p.end().id)
      })
    }

    //-----------------------------------------------------------------------------

    private mainAlive(sides: SideChains): Carbon[] {
      //TBD : ASSUME exactly two paths in filter 
      let alives = this.paths.filter(p => p.alive)
      let a0 = alives[0].carbons()
      let a1 = alives[1].carbons()
      return a0.concat(a1.reverse().splice(1))
    }

    private locants(sides: SideChains, main: Carbon[]): number[] {
      let locs: number[] = []
      main.forEach((c, i) => {
        if (sides[c.id] !== undefined) locs.push(i + 1)
      })
      return locs
    }

    public checkReverseLocants(links: ChainLink[]) {
      links = links.sort((a, b) => Namer.compare(a[0], b[0]))
      //console.log('1- ' + links);
      let len = Math.floor(links.length / 2)
      for (let i = 0; i < len; i++) {
        let oend = links.length - i - 1
        if (links[i][1] > links[oend][1]) {
          let temp = links[i][0]
          links[i][0] = links[oend][0]
          links[oend][0] = temp
        }
      }
    }

    private mainChain(sides: SideChains, main: Carbon[]) {
      let locs = this.locants(sides, main)
      //console.log('main. ' + main);
      let links = null
      let loccomp = Namer.compareLocants(locs, main.length + 1)
      if (loccomp > 0) main = main.reverse()
      else if (loccomp === 0) {
        console.log('TBD  iupac2:  loccomp === 0');
        links = this.linksPlain(sides, main)
        this.checkReverseLocants(links)
      }
      if (links === null) links = this.linksPlain(sides, main)
      return links
    }

    public iupac(): string {
      let sides: { [id: number]: string[] } = {}
      this.buildSideChains(sides)

      let main = this.mainAlive(sides)
      let names = this.joinLinks(this.mainChain(sides, main))
      return this.makeName(names, main.length, 'ane')
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
      let ch = this.chars.next()
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