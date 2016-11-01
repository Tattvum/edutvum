module common {

  export class Chars {
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

  export class List<T> {
    constructor(protected arr: T[] = []) { }
    public size(): number {
      return this.arr.length
    }
    public list(): T[] {
      return this.arr.filter(() => true)//returns a copy
    }
    public toString(): string {
      return '[' + this.arr + ']'
    }
  }

  export class Chain<T> extends List<T> {
    protected current: T = null
    constructor(protected arr: T[] = []) {
      super(arr)
    }
    public push(t: T): Chain<T> {
      this.current = t
      this.arr.push(t)
      return this
    }
    public peek(): T {
      return this.current
    }
  }

  export class Stack<T> extends Chain<T> {
    constructor(protected arr: T[] = []) {
      super(arr)
    }
    public push(t: T): Stack<T> {
      return <Stack<T>>super.push(t)
    }
    public pop(): T {
      this.current = this.arr.pop()
      return this.current
    }
  }

  export class TreeNode {
    private _next: TreeNode = null
    public branches: TreeNode[] = []
    constructor(public readonly id: number, __next: TreeNode = null) {
      this.setNext(__next)
    }
    public next(): TreeNode {
      return this._next
    }
    public setNext(__next: TreeNode) {
      this._next = __next
    }
    public end(): TreeNode {
      if (this._next === null) return this
      return this._next.end()
    }
    public printBranches(): string {
      if (this.branches.length === 0) return ''
      let txt = '['
      this.branches.forEach(b => txt += '(' + b.print() + ')')
      txt += ']'
      return txt
    }
    public print(alsoBranches = true): string {
      let txt = this.toString()
      if (alsoBranches) txt += this.printBranches()
      if (this._next === null) return txt
      return txt + ',' + this._next.print()
    }
    public toString(): string {
      return '' + this.id
    }
  }

}