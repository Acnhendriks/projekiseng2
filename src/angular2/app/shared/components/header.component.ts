import { Component } from '@angular/core'

import { MatchMediaService } from '../services/match-media.service';
import { LayoutService } from '../services/layout.service';
import { HeaderService } from '../services/header.service';

@Component({
    selector: 'header',
    templateUrl: './header.component.html'
})

export class HeaderComponent {

    constructor(
        private _matchMediaService: MatchMediaService,
        private _layoutService: LayoutService,
        private _headerService: HeaderService
    ) {

    }

    getResize() {
        return this._matchMediaService.getMm();
    }

    // toggleLeftMenu() {
    //     this._layoutService.toggleLeftMenu();
    // }

    getTitle() {
        return this._headerService.getTitle();
    }

    getHeaderLayout() {
        return this._layoutService.getHeaderItem();
    }
}