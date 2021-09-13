import { Injectable }           from '@angular/core';
import {AtdConfigComponent} from './atd-config/atd-config.component' 
import {InstallationComponent} from './installation/installation.component'

@Injectable()
export class ComponentService {
  getComponents() {
    return {
      'atd_config': {
        component: AtdConfigComponent
      },
      'installation': {
        component: InstallationComponent
      }
    }
  }
}
