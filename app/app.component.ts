import { Component, NgZone } from '@angular/core';
import { IupacService } from './iupac/iupac.service';

@Component({
  moduleId: module.id,
  selector: 'my-app',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  isHidden = false
  buttonName = 'Hide'
  smiles = '-'
  iupac = '-'

  constructor(private ngZone: NgZone, private service: IupacService) {
    window.ng2iupac = this.ng2iupac.bind(this)
  }

  visibilityTogggle() {
    this.isHidden = !this.isHidden
    if(this.isHidden) this.buttonName = 'Show'
    else this.buttonName = 'Hide'
  }

  ng2iupac(_smiles: string) {
    this.ngZone.run(() => {
      this.smiles = _smiles
      console.log('ng2iupac called')
      this.iupac = this.service.iupac(_smiles)
    });
  }

}
