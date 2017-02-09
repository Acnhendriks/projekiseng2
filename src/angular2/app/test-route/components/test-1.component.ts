import { Component } from '@angular/core';

import { LayoutService } from '../../shared/services/layout.service';
import { PageNavigationService } from '../../shared/services/page-navigation.service';

@Component({
    selector: 'test-1',
    template: '<h1>To test-1 component</h1>'
})

export class Test1Component {
    vUrlParam:string;

    constructor(
        private _layoutService: LayoutService,
        private _pageNavigationService: PageNavigationService
    ) {
        this._layoutService.setCurrentPage('test-1');
        // get parameter from url
        this.vUrlParam = this._pageNavigationService.getUrlParams('id');
    }

}