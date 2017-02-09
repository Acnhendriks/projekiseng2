import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { routing } from './app.routes';
import { XHRBackend, Http, RequestOptions } from '@angular/http';

// COMPONENTS
import { AppComponent } from './app.component';
import { HeaderComponent } from './shared/components/header.component';
import { LeftMenuComponent } from './shared/components/left-menu.component';
import { SlidingLeftRightComponent } from './shared/components/sliding-left-right.component';
import { ModalComponent } from './shared/components/modal.component';
import { LandingPageComponent } from './landing-page/components/landing-page.component'; // update this landing page
import { ChatRoomComponent } from './landing-page/components/chat-room.component'; // update this landing page
import { Test1Component } from './test-route/components/test-1.component';

// SERVICES
import { MyHttp } from './shared/services/my-http.service';
import { LayoutService } from './shared/services/layout.service';
import { HeaderService } from './shared/services/header.service';
import { MatchMediaService } from './shared/services/match-media.service';
import { PageNavigationService } from './shared/services/page-navigation.service';
import { ChatRoomService } from './landing-page/services/chat-room.service';
import { Modal } from './shared/services/modal.service';
// import { EncryptionService } from './shared/services/encryption.service';

// Angular 2 Material
// import { MdInputModule } from '@angular2-material/input';
// import { MdButtonModule } from '@angular2-material/button';

// reload css for webpack w/o grunt
var css = require('../scss/app.scss');

export function HttpFactory(backend: XHRBackend,
    defaultOptions: RequestOptions,
    _pageNavigationService: PageNavigationService) {

    return new MyHttp(backend, defaultOptions, _pageNavigationService);
}

@NgModule({
	imports: [
		BrowserModule,
		routing,
		HttpModule,
		FormsModule
	],
	declarations: [
		AppComponent,
		HeaderComponent,
		LeftMenuComponent,
		ModalComponent,
		SlidingLeftRightComponent,
		LandingPageComponent,
		ChatRoomComponent,
		Test1Component
	],
	bootstrap: [
		AppComponent
	],
	providers: [
		LayoutService,
		HeaderService,
		MatchMediaService,
		PageNavigationService,
		ChatRoomService,
		Modal.ModalService,
		{
            provide: Http,
            useFactory: HttpFactory,
            deps: [XHRBackend, RequestOptions, PageNavigationService]
        }
	]
})

export class AppModule {}