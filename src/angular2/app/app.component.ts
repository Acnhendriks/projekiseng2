import { Component, OnInit, Renderer } from '@angular/core';
import { Router, Routes, RouterModule } from '@angular/router';

// SERVICE
import { LayoutService } from './shared/services/layout.service';
import { MatchMediaService } from './shared/services/match-media.service';
import { PageNavigationService } from './shared/services/page-navigation.service';

var FastClick = require('fastclick');
var navigator:any;

// enableProdMode();
// @HostListener('window:scroll', ['$event'])

@Component({
	selector: 'angular2-baseline',
    template: `
            <header></header>
            <left-menu></left-menu>
            <modal></modal>
            <div class="body-container"
                (window:resize)="OnResize()"
                (window:scroll)="OnScroll()">
                <div class="content" [ngClass]="{'small': !getResize().largeUp}" >
                    <router-outlet></router-outlet>
                </div>
            </div>
        `
})

export class AppComponent implements OnInit {
    globalListenFunc: Function;

    constructor(
        private _renderer: Renderer,
        private _layoutService: LayoutService,
        private _matchMediaService: MatchMediaService,
        private _pageNavigationService: PageNavigationService
    ) {
    }

    ngOnInit() {
        this.OnResize();
        // attach fastclick
        FastClick.attach(document.body);

        // override backbutton
        this.globalListenFunc = this._renderer.listenGlobal('document', 'backbutton', (event:any) => {
            // put pageNavigationService
            this._pageNavigationService.gotoPreviousPage();
            console.log('angular back button');

            var vLength: number = this._pageNavigationService.getListParams().length;
            if (vLength === 0) {
                navigator.Backbutton.goHome(function() {
                    console.log('success');
                }, function() {
                    console.log('fail');
                });
            }
        });
    }

    OnResize() {
        this._matchMediaService.OnResize();
    }

    OnScroll() {
        // code related to scrolling put here
    }

    OnClick() {
    }

    getResize() {
        return this._matchMediaService.getMm();
    }
}