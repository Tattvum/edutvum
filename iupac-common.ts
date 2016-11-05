namespace iupac {
  let units = [
    '^',
    'meth',
    'eth',
    'prop',
    'but',
    'pent',
    'hex',
    'hept',
    'oct',
    'non',
  ]

  let prefix = [
    '',
    'hen',
    'do',
    'tri',
    'tetra',
    'penta',
    'hexa',
    'hepta',
    'octa',
    'nona',
  ]

  let retained = {
    '1-methylethyl': 'isopropyl',
    '1-methylpropyl': 'sec-butyl',
    '2-methylpropyl': 'isobutyl',
    '1,1-dimethylethyl': 'tert-butyl',
    '3-methylbutyl': 'isopentyl',
    '1,1-dimethylpropyl': 'tert-pentyl',
    '2,2-dimethylpropyl': 'neopentyl',
    '4-methylpentyl': 'isohexyl',
  }

  let noname = [
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

  let noname2 = [
    '',
    '',
    'bis',
    'tris',
    'tetrakis',
    'pentakis',
    'hexakis',
    'heptakis',
    'octakis',
    'nonakis',
    'decakis',
  ]

  //-----------------------------------------------------------------------------

  export class Namer {
    public static synonym(name: string): string {
      let syn = retained[name]
      if (syn === undefined) return name
      console.log('synonym: ' + name + ' -> ' + syn)
      return syn
    }

    public static numix(n: number): string {
      var selfn = this.numix
      let oo = n % 10
      let t = Math.floor(n / 10)
      let tt = n % 100
      let h = Math.floor(t / 10)
      let hh = n % 1000
      let th = Math.floor(h / 10)

      if (n <= 0) return ''
      if (n < 10) return units[oo]
      if (n === 10) return 'dec'
      if (n === 11) return 'undec'
      if (n < 20) return prefix[oo] + 'dec'
      if (n === 20) return 'icos'
      if (n === 21) return 'henicos'
      if (n < 30) return prefix[oo] + 'cos'
      if (n < 100) return prefix[oo] + prefix[t] + 'cont'
      if (n === 100) return 'hect'
      if (n < 200) return selfn(tt) + 'a' + 'hect'
      if (n === 200) return 'dict'
      if (n < 300) return selfn(tt) + 'a' + 'dict'
      if (n < 1000) return selfn(tt) + 'a' + prefix[h] + 'ct'
      if (n === 1000) return 'kili'
      if (n < 2000) return selfn(hh) + 'a' + 'kili'
      if (n === 2000) return 'dili'
      if (n < 3000) return selfn(hh) + 'a' + 'dili'
      if (n < 10000) return selfn(hh) + 'a' + prefix[th] + 'li'
      return '' + n
    }

    private static subCore(s: string): string {
      if (s === '' || s === undefined || s === null) return ''
      //This accounts for sec- and tert- too! 
      //As well as the locant numbers like 2- or 2,3-
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
      let numul = noname[sames.length]
      if (sames[0].indexOf('(') >= 0) numul = noname2[sames.length]
      let base = this.subCore(sames[0])
      let locants = []
      sames.forEach(s => locants.push(this.subCorePrefix(s)))
      let locant = locants.join(',')
      //console.log('prefix: ' + prefix + ' suffix: ' + suffix + ' locant: ' + locant);
      return locant + '-' + numul + base
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