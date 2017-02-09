// - Routes instead of RouteConfig
// - RouterModule instead of provideRoutes
import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';

// Import Component goes here
import { LandingPageComponent } from './landing-page/components/landing-page.component';
import { ChatRoomComponent } from './landing-page/components/chat-room.component';
import { Test1Component } from './test-route/components/test-1.component';

const routes: Routes = [
	{
		path: 'landing-page',
		component: LandingPageComponent
	},
	{
		path: 'chat-room',
		component: ChatRoomComponent
	},
	{
		path: 'test-1/:id',
		component: Test1Component
	},
	// No Routes found
	{
		path: '',
		redirectTo: 'landing-page',
		pathMatch: 'full'
	}
];

// - Updated Export
export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
