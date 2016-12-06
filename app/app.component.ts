import { Component, NgZone } from '@angular/core';
import { main } from './iupac';

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

  constructor(private ngZone: NgZone) {
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
      this.iupac = main(_smiles)[0]
    });
  }

}
