import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserPanel } from '../user-panel/user-panel';
import { KeycloakService } from '../../auth/keycloak.service';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [RouterModule,UserPanel],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css'
})
export class SideBar {
  @Input() open = true;


  onLogout() {
    // depois você liga no KeycloakService
    console.log('Logout');
   KeycloakService.logout();
  }

  onChangeVinculo() {
    console.log('Alterar vínculo');
    // this.router.navigate(['/alterar-vinculo']);
  }

  onOpenSettings() {
    console.log('Abrir configurações');
    // abrir modal ou rota
  }

  onProfileInfo(){
    console.log("onProfileInfo");
    return "teste";
  }
}
