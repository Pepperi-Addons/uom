import { Component, OnInit } from '@angular/core';
import {FactoryComponent} from '../factory interface/factory'

@Component({
  selector: 'addon-installation',
  templateUrl: './installation.component.html',
  styleUrls: ['./installation.component.scss']
})
export class InstallationComponent implements OnInit, FactoryComponent {
  name = 'installation';

  constructor() { }

  ngOnInit(): void {
  }

}
