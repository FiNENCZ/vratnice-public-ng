import { Component, Input } from '@angular/core';
import { polozkyMenu } from 'src/app/consts/polozky-menu.const';
import { AuthService } from '../../services/auth.service';
import { PolozkaMenu } from '../../dto/polozka-menu.dto';
import { PolozkaMenuEnum } from 'src/app/enums/polozka-menu.enum';

@Component({
  selector: 'app-left-menu-item',
  templateUrl: './left-menu-item.component.html',
  styleUrls: []
})

export class LeftMenuItemComponent {
  @Input() polozkaMenu!: PolozkaMenuEnum;

  polozkyMenu = polozkyMenu;


  constructor(
    private readonly authService: AuthService
  ) {
  }

  jeRole(roles: string[]): boolean {
    if (roles.length == 0) return true;
    return this.authService.maUzivatelRole(roles);
  }

  menuClass(polozkaMenu: PolozkaMenu){
    return (0, eval)(polozkaMenu.menuClass);
  }

  public hideMenu() {
    if (window.getComputedStyle(document.querySelector('.app-header__mobile-menu')!, null).display != "none") {
      document.querySelector('.mobile-toggle-nav')?.classList.toggle("is-active");
      document.querySelector('.app-container')?.classList.toggle("sidebar-mobile-open");
    }
  }
}
