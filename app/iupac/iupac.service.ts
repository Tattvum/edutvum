import { Injectable } from '@angular/core';
import { main } from './iupac';

@Injectable()
export class IupacService {
  public iupac(smiles: string): string {
    return main(smiles)[0];
  }
}
