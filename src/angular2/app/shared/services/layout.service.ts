import { Injectable } from '@angular/core';
import { PageNavigationService } from './page-navigation.service';

@Injectable()
export class LayoutService {
	vCurrentPage: string;
	
	vHeaderItem = {
		hamburger: false,
		back: false
	}; 
    
	vLayoutState = {
	    appHeader: false,
		appFooter: false,
		leftMenu: false
	};
    
	constructor (
		private _pageNavigationService: PageNavigationService
	) {
		
	}
   
	setCurrentPage (current: string) {
		this.vCurrentPage = current;
		this.reset();
       
		if (this.vCurrentPage === 'landing') {
			this.vLayoutState = {
				appHeader: true,
				appFooter: false,
				leftMenu: false
			};
			this.vHeaderItem = {
				hamburger: false,
				back: false
			}; 
		}
		else if (this.vCurrentPage === 'chat-room') {
			this.vLayoutState = {
				appHeader: true,
				appFooter: false,
				leftMenu: false
			};

			this.vHeaderItem = {
				hamburger: true,
				back: true
			}; 
		}

		this._pageNavigationService.setCurrentPage(current);
	}
    
	reset () {
		for(let key in this.vHeaderItem) {
			this.vHeaderItem[key] = false;
		}
	}

	getHeaderItem () {
		return this.vHeaderItem;
	}

	getLayoutState () {
		return this.vLayoutState;
	}

	getCurrentPage () {
		return this.vCurrentPage;
	}

	toggleLeftMenu() {
		this.vLayoutState.leftMenu = !this.vLayoutState.leftMenu;
	}

}