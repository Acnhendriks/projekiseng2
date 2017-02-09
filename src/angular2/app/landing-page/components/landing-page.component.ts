import { Component } from '@angular/core';

import { LayoutService } from '../../shared/services/layout.service';
import { HeaderService } from '../../shared/services/header.service';
import { Modal } from '../../shared/services/modal.service';
import { PageNavigationService } from '../../shared/services/page-navigation.service';

@Component({
    selector: 'landing-page',
    templateUrl: './landing-page.component.html'
})

export class LandingPageComponent {
    
    vPage: any;
    vLanguage: string;

    constructor(
        private _layoutService: LayoutService,
        private _headerService: HeaderService,
        private _modalService: Modal.ModalService,
        private _pageNavigationService: PageNavigationService
    ) {
        this._layoutService.setCurrentPage('landing');
        this._headerService.setTitle('T.I.V.A.');
        this.vLanguage = '';
    }

    showModal() {
        this._modalService.showModal();
    }

    onChangeSelectLanguage(pParam:any) {
        this.vLanguage = pParam;
    }

    pop() {
        this._pageNavigationService.popParam();
        console.log('pop'+this._pageNavigationService.vListParams.length);
        console.log(this._pageNavigationService.vListParams);
    }

    getStarted() {
        this.vPage = ['/chat-room'];
        this._pageNavigationService.navigate(this.vPage);
    }
    
}