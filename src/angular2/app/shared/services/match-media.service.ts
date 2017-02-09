import { Injectable } from '@angular/core';

@Injectable()
export class MatchMediaService {

    vKey:any;

    vRules = {
            print: 'print',
            screen : 'screen',
            small : '(max-width: 640px)',
            medium : '(min-width: 640px) and (max-width: 1024px)',
            large : '(min-width: 1024px)',
            xlarge : '(min-width: 1920px)',
            portrait : '(orientation: portrait)',
            landscape : '(orientation: landscape)'
        };

    vMmqry = {
            print: false,
            screen : false,
            small : false,
            medium : false,
            large : false,
            xlarge : false,
            portrait : false,
            landscape : false,
            largeUp : false,
            mediumUp : false
        };

    OnResize() {
        // get media query
        for (this.vKey in this.vRules) {
            if (this.vRules.hasOwnProperty(this.vKey)) {
            this.vMmqry[this.vKey] = window.matchMedia(this.vRules[this.vKey]).matches;
            }
        }

        if (this.vMmqry.large || this.vMmqry.xlarge) {
            this.vMmqry.largeUp = true;
        } else {
            this.vMmqry.largeUp = false;
        }
        if (this.vMmqry.medium || this.vMmqry.large || this.vMmqry.xlarge) {
            this.vMmqry.mediumUp = true;
        } else {
            this.vMmqry.mediumUp = false;
        }
    }

    getMm() {
        return this.vMmqry;
    }

}
