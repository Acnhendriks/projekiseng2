import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Injectable()
export class PageNavigationService{

    vCurrentPage: string;
    vListParams: any;
    vPrevPage: string;

    constructor(
        private _router: Router,
        private _activatedRouter: ActivatedRoute
    ) {
        this.vListParams = [];
        this.vCurrentPage = '';
        this.vPrevPage = '';
    }

    getUrlParams(pParams:string) {
        let vParams:any;
        this._activatedRouter.firstChild.params.forEach((params: Params) => {
            vParams = params[pParams]; // + make the parameter into number
        });
        console.log(vParams);
        return vParams;
    }

    getCurrentParams() {
        if (this.vListParams.length > 0) {
            return this.peekParam();
        } else return null;

        // old
        // if (this.vListParams.length > 0) {
        //     return this.peekParam().param;
        // } else return null;
    }

    getCurrentPage() {
        return this.vCurrentPage;
    }

    setCurrentPage(pCurrentPage: string, pParam?: any) {
        console.log(this._router.url);
        // get url
        let vCurrentUrl:string = this._router.url;
        // slice first element, because _router.url first element return `/`
        let vLink:any[] = vCurrentUrl.slice(1, vCurrentUrl.length).split('/');
        console.log(vLink); 

        // if stack is still null or
        // if last stack is not current page,
        // push to the list of params
        if (this.vListParams.length === 0 || this.vListParams[this.vListParams.length - 1][0] !== pCurrentPage) {
            this.vListParams.push(vLink);
        }
        console.log(this.vListParams);

        // old
        // this.vCurrentPage = pCurrentPage;
        // if stack is still null or
        // if last stack is not current page,
        // push new stack of page of current page
        // if (this.vListParams.length === 0 || this.vListParams[this.vListParams.length - 1].page !== this.vCurrentPage) {
        //     this.pushParam(this.vCurrentPage, pParam, this.vPrevPage);
        // }
    }

    getPreviousPage() {
        return this.vPrevPage;
    }

    setPreviousPage(pPrevPage: string) {
        this.vPrevPage = pPrevPage;
    }

    reset() {
        this.vCurrentPage = '';
        this.vPrevPage = '';
        this.vListParams = [];
    }

    pushParam(pPage: string, pParam: any, pPrevious: string) {
        let vData = {
            page: pPage,
            param: pParam,
            previous: pPrevious
        };
        this.vListParams.push(vData);
    }

    peekParam() {
        if (this.vListParams !== null && this.vListParams.length !== 0) {
            return this.vListParams[this.vListParams.length - 1];
        }
        else return null;
    }

    popParam() {
        if (this.vListParams.length > 0) {
            return this.vListParams.pop();
        }
    }

    gotoPreviousPage() {
        console.log('gotoPreviousPage masup ');
        if (this.vListParams.length > 0) {
            let vLink = this.popParam();
            this._router.navigate(vLink);
        }

        // old
        // console.log('SERV' + JSON.stringify(this.vListParams)+ 'from : ' + JSON.stringify(this.vCurrentPage));
        // disabled backbutton for selected page
                
        // if (this.vListParams.length > 0) {
        //     this.vCurrentPage = this.peekParam().previous;
        //     this.popParam();
        //     if (this.vListParams.length > 0) {
        //         this.vPrevPage = this.peekParam().previous;
        //     } else {
        //         this.vPrevPage = '';
        //     }
        //     this._router.navigate([this.vCurrentPage]);
        // }
    }

    navigate(pPage: any) {
        // if last stack is not current page,
        // push to the list of params
        if(this.vListParams[this.vListParams.length - 1][0] !== pPage[0]) {
            this.vListParams.push(pPage);
        }
        this._router.navigate(pPage);
    }

    getListParams() {
        return this.vListParams;
    }

}