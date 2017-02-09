import { Component } from '@angular/core';

import { PageNavigationService } from '../../shared/services/page-navigation.service';
import { ChatRoomService } from '../../landing-page/services/chat-room.service';

@Component({
    selector: 'sliding-left-right',
    templateUrl: './sliding-left-right.component.html'
})

export class SlidingLeftRightComponent {

    constructor(
        private _pageNavigationService: PageNavigationService,
        private _chatRoomService: ChatRoomService
    ) {

    }

    pili(pParam:string) {
    	this._chatRoomService.setSlidingItem(pParam);
    }
}