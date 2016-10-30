module iupac5 {
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

  class Stack<T> {
    private arr: T[] = []
    private current: T = null
    public push(c: T): Stack<T> {
      this.current = c
      this.arr.push(c)
      return this
    }
    public peek(): T {
      return this.current
    }
    public pop(): T {
      this.current = this.arr.pop()
      return this.current
    }
    public size(): number {
      return this.arr.length
    }
    public toString(): string {
      return '[' + this.arr + ']'
    }
  }

  class Carbon {
    private static all: Carbon[] = []
    static star = new Carbon(null)
    static reset() {
      Carbon.all = []
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

    private _id: number
    bonds: Carbon[] = []

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
    public _shrink1(): Carbon {
      if (this.bonds.length !== 1) return null
      //console.log('removing ' + this.id() + '-' + this.bonds[0].id())
      let bs = this.bonds[0].bonds
      bs.splice(bs.indexOf(this), 1)
      return this.bonds.splice(0, 1)[0]
    }
    public toString(): string {
      return '' + this._id
    }
  }

  class Molecule {
    private chars: Chars
    constructor(private smiles: string) {
      this.chars = new Chars(smiles)
      Carbon.reset()
      let stop = new Carbon(null)
      this.build(null, new Stack<Carbon>())
      //Carbon.reveal()
    }

    private build(peer: Carbon, past: Stack<Carbon>): Carbon {
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

    private printChains(chains: Stack<Carbon>[]) {
      chains.forEach(chn => console.log('' + chn))
      console.log('--------')
    }

    private buildChain(chain: Stack<Carbon>): boolean {
      let c = chain.peek()._shrink1()
      if (c !== null) {
        chain.push(c)
        if (c.bonds.length > 1) chain.push(Carbon.star)
        return true
      }
      return false
    }

    private buildChains(chains: Stack<Carbon>[]) {
      //this.printChains(chains)
      let todo = false
      chains.forEach(chn => {
        //todo = todo || this.buildChain(chn)
        let t = this.buildChain(chn)
        todo = todo || t
      })
      if (todo) this.buildChains(chains)
    }

    public iupac(): string {
      console.log('----iupac----')
      let name = ''
      let chains: Stack<Carbon>[] = []
      Carbon.tips().forEach(c => {
        let s = new Stack<Carbon>()
        chains.push(s.push(c))
      })
      this.buildChains(chains)
      this.printChains(chains)
      let longs = chains.filter(chn => chn.peek().id() !== 0)
      let n = longs[0].size() + longs[1].size() - 1
      //Carbon.reveal()
      return cname[n] + 'ane'
    }
  }

  export function main(smiles: string): string {
    console.clear()
    console.log(smiles)
    let m = new Molecule(smiles)
    return m.iupac()
  }

  console.log(main('CC(C(C)C)CC'))
}