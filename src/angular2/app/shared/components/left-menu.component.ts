import { Component } from '@angular/core';
import { LayoutService } from '../../shared/services/layout.service';
import { PageNavigationService } from '../../shared/services/page-navigation.service';

@Component({
    selector: 'left-menu',
    templateUrl: './left-menu.component.html'
})
export class LeftMenuComponent {
    
    constructor (
        private _layoutService:LayoutService,
        private _pageNavigationService:PageNavigationService
    ) {
        
    }

    goToTest() {
        let vLink:any = ['test-1', '1'];
        this._pageNavigationService.navigate(vLink);
        this.toggleLeftMenu();
    }

    goToLanding() {
        let vLink:any = ['landing-page'];
        this._pageNavigationService.navigate(vLink);
        this.toggleLeftMenu();
    }
    
    getLeftMenuState() {
        return this._layoutService.getLayoutState().leftMenu;
    }
    
    toggleLeftMenu() {
        this._layoutService.toggleLeftMenu();
    }
}