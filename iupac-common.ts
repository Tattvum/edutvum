namespace iupac {
  export let noname = [
    '',
    '',
    'di',
    'tri',
    'tetra',
    'penta',
    'hexa',
    'hepta',
    'octa',
    'nona',
    'deca',
  ]

  export let cname = [
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
  ]

  //-----------------------------------------------------------------------------

  export class Namer {
    private static subCore(s: string): string {
      if (s === '' || s === undefined || s === null) return ''
      return s.substr(s.indexOf('-') + 1)
    }
    private static subCorePrefix(s: string): string {
      if (s === '' || s === undefined || s === null) return ''
      return s.substring(s.indexOf('-'), 0)
    }
    //a>b is 1, a=b is 0, a<b is -1
    private static compare(a, b): number {
      return (a > b) ? 1 : (a === b) ? 0 : -1
    }
    private static coreCompare(a, b): number {
      let aa = this.subCore(a)
      let bb = this.subCore(b)
      return this.compare(aa, bb)
    }
    private static coreEquals(a, b): boolean {
      return this.coreCompare(a, b) === 0
    }

    private static unify(sames: string[]): string {
      if (sames === null || sames.length < 1) return ''
      if (sames.length === 1) return sames[0]
      let prefix = noname[sames.length]
      let suffix = this.subCore(sames[0])
      let locants = []
      sames.forEach(s => locants.push(this.subCorePrefix(s)))
      let locant = locants.join(',')
      //console.log('prefix: ' + prefix + ' suffix: ' + suffix + ' locant: ' + locant);
      return locant + '-' + prefix + suffix
    }

    public static normalizeSubstituenets(subs: string[]): string[] {
      subs = subs.sort((a, b) => this.coreCompare(a, b))
      //console.log('[' + subs + ']');
      let newSubs = []
      let sames = []
      let prev = null
      subs.forEach(s => {
        let eq = this.coreEquals(s, prev)
        if ((sames.length > 0) && !eq) {
          newSubs.push(this.unify(sames))
          sames = []
        }
        prev = s
        sames.push(s)
      })
      newSubs.push(this.unify(sames))
      return newSubs
    }

    public static compareLocants(locs: number[], n: number): number {
      //console.log('FPOD: ' + locs + ' -- (' + n + ')');
      let comp = 0
      let len = locs.length - 1
      //let locs2 = []
      locs.forEach((l, i) => {
        let ll = n - locs[len - i]
        //locs2.push(ll)
        let newComp = this.compare(l, ll)
        //console.log(l + ' .. ' + ll);
        //console.log(comp + ' -- ' + newComp);
        if (comp === 0) comp = newComp
      })
      //console.log('FPOD: ' + locs2 + ' -- ' + comp);
      return comp
    }

  }

}