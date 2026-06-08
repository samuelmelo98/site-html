import { Component, Input, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserPanel } from '../user-panel/user-panel';
import { KeycloakService } from '../../auth/keycloak.service';
import { signal } from '@angular/core';
import { UserProfile } from '../../auth/models/user-profile';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [RouterModule, UserPanel, MenuComponent],
  templateUrl: './side-bar.html',
  styleUrl: './side-bar.css',
})
export class SideBar implements OnInit {
  @Input() open = true;

  private keycloak = inject(KeycloakService);

  userProfile = signal<UserProfile | null>(null);

  ngOnInit() {
    this.userProfile.set(this.keycloak.getUserProfile());
  }

  onLogout() {
    // depois você liga no KeycloakService
    console.log('Logout');
    this.keycloak.logout();
  }

  onChangeVinculo() {
    console.log('Alterar vínculo');
    // this.router.navigate(['/alterar-vinculo']);
  }

  onOpenSettings() {
    console.log('Abrir configurações');
    // abrir modal ou rota
  }

  onProfileInfo() {
    console.log('onProfileInfo');
    return this.keycloak.getUserProfile();
  }
}
