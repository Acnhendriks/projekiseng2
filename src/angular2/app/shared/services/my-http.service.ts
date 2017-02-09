import { Injectable } from '@angular/core';
import { Http, Request, RequestOptions, ConnectionBackend, RequestMethod, RequestOptionsArgs, Headers } from '@angular/http';

import { Observable } from 'rxjs/Observable';

// Configuration put in here
import { Configuration } from '../config/configuration';
import 'rxjs/add/operator/timeout';

import { PageNavigationService } from './page-navigation.service';
// Encyption is optional
// import { EncryptionService } from './encryption.service';

@Injectable()
export class MyHttp extends Http {
    serviceBase: string;
    serviceBaseHTTP: string;
    timeout: number;

    sslServer: string;
    sslFinger: string;

    private vHttpPendingRequestEvent: Array<any>;
    private vIsRetrying: boolean;

    constructor(
        backend: ConnectionBackend,
        defaultOptions: RequestOptions,
        private _pageNavigationService: PageNavigationService
        // private _encryptionService: EncryptionService
    ) {

        super(backend, defaultOptions);
        this.serviceBase = Configuration.SERVICE.BASE_URL;
        // this.serviceBaseHTTP = Configuration.SERVICE.BASE_URL_HTTP;
        this.timeout = Configuration.SERVICE.TIME_OUT;

        // this.sslServer = Configuration.SSL.SERVER;
        // this.sslFinger = Configuration.SSL.FINGERPRINT;

        this.vHttpPendingRequestEvent = new Array<Function>();
        this.vIsRetrying = false;

    }

    public get(url: string, options?: RequestOptionsArgs) {
        // console.log(url);
        // if (url === API_Endpoints.AUTH.GGSN) {
        //     console.log('http connection');
        //     return this._requestHTTP(RequestMethod.Get, url, null, options);
        // }else {
        //     console.log('https connection');
        return this._request(RequestMethod.Get, url, null, options);
        // }
    }

    public post(url: string, body: string, options?: RequestOptionsArgs) {
        return this._request(RequestMethod.Post, url, body, options);
    }

    public put(url: string, body: string, options?: RequestOptionsArgs) {
        return this._request(RequestMethod.Put, url, body, options);
    }

    public delete(url: string, options?: RequestOptionsArgs) {
        return this._request(RequestMethod.Delete, url, null, options);
    }

    private _createAuthHeaders(method: RequestMethod): Headers {
        let headers: Headers = new Headers();
        if (method !== RequestMethod.Get) {
            headers.append('Content-Type', 'application/json');
        }

        // TODO: depends on encryption we will using, implemented appropirate decryption
        // headers.append('Authorization','test');
        // let accessToken = localStorage.getItem('accessToken');
        // if (accessToken) {
        //     // headers.append('Authorization', 'Bearer ' + accessToken);
        //     // headers.append('Authorization',accessToken);
        // }

        return headers;
    }

    private handleHTTPError(pError:any, pObserver:any) {
        switch (pError.code) {
            case 408: // timeout
                pObserver.error(pError);
                break;
            case 400: // system error
                pObserver.error(pError);
                break;
            case 500: // functional error
                pObserver.error(pError);
            default:
                // throw error
                pObserver.error(pError);
                break;
        }
    }

    private _request(method: RequestMethod, url: string, body?: string, options?: RequestOptionsArgs): Observable<any> {
        let requestOptions = new RequestOptions({
            method: method,
            body: body
        });
        // // using custom options
        if (options) {
            for (let attrname in options) {
                requestOptions[attrname] = options[attrname];
            }
        } else {
            requestOptions.headers = this._createAuthHeaders(method);
        }
        requestOptions.url = this.serviceBase + url;
        return Observable.create((observer:any) => {
            let currentContext = this;
            let requestObject: Request = new Request(requestOptions);
            // this.request(requestObject).subscribe(
            this.request(requestObject).timeout(this.timeout, { status: 408 }).subscribe(
                (response:any) => {
                    observer.next(response);
                    observer.complete();
                },
                (error:any) => {
                    switch (error.status) {
                        case 403:
                            try {
                                // request to get access token for the first time
                                // should not get error 403
                                if (requestOptions.url.indexOf('token') !== -1) {
                                    observer.error(error); // prepare send back to login
                                } else {
                                    // caused by invalid token sent to server
                                    // push pending request
                                    this.pushRetryHTTPRequestEvent(requestObject, observer);
                                    // try access once again using refresh token
                                    // only need to make one call to refresh token
                                    if (!currentContext.vIsRetrying) {
                                       
                                        currentContext.vIsRetrying = true;
                                        this.renewToken();
                                    }
                                }
                                break;
                            } catch (pErr) {
                                console.log('error.status: ' + error.status + '. ' + pErr);
                                break;
                            }
                        default:
                            let vError = error;
                            console.log(vError);
                            this.handleHTTPError(error, observer);
                            break;
                    }
                }
            );
        });

        // return null;
    }

    // handling for paralel request of refresh token
    private executePendingRequest(pRequestObject: Request, pObservableInstance: any) {
        // update the header with new accessToken
        pRequestObject.headers = this._createAuthHeaders(pRequestObject.method);
        console.log('pop : ' + pRequestObject.url + ' pending request from stack');
        // retry previous request
        this.request(pRequestObject).timeout(this.timeout, { status: 408 }).subscribe(
            (response:any) => {
                pObservableInstance.next(response);
                pObservableInstance.complete();
            },
            (error:any) => {
                this.handleHTTPError(error, pObservableInstance);
            }
        );
    }

    private pushRetryHTTPRequestEvent(pRequestObject: Request, pObservablesInstance: any) {
        // console.log('push : ' + pRequestObject.url + ' pending request to stack');
        // let vPendingRequestObject = {
        //     request: pRequestObject,
        //     observables: pObservablesInstance
        // };
        // this.vHttpPendingRequestEvent.push(vPendingRequestObject);
    }

    private renewToken() {
        // let vURL = this.serviceBase + '/auth/token/refresh';
        // let refreshToken: string = localStorage.getItem('refreshToken');
        // let encryRT: string = this._encryptionService.enryptWithLength(refreshToken, 64);
        // let vRequestHeader = new Headers();
        // vRequestHeader.append('Content-Type', 'application/json');
        // let vRequestOptions = new RequestOptions({
        //     method: RequestMethod.Post,
        //     body: JSON.stringify(encryRT),
        //     url: vURL,
        //     headers: vRequestHeader
        // });
        // let vRequesObject = new Request(vRequestOptions);
        // this.request(vRequesObject).subscribe(
        //     (response) => {
        //         this.vIsRetrying = false;
        //         let vCurrentContext = this;

        //         // renew the token
        //         let payload = JSON.parse(this._encryptionService.decrypt(response.json().substring(64), response.json().substring(0, 64)));
        //         let newAccessToken = payload.token;
        //         let newRefreshToken = payload.refresh_token;

        //         // TODO : depends on how we implements encryption on local storage we need to change these part
        //         localStorage.setItem('accessToken', newAccessToken);
        //         localStorage.setItem('refreshToken', newRefreshToken);

        //         // execute all pending retry request
        //         this.vHttpPendingRequestEvent.forEach(function (pRequestEvent, pIndex, pObject) {
        //             vCurrentContext.executePendingRequest(pRequestEvent.request, pRequestEvent.observables);
        //         });
        //         this.vHttpPendingRequestEvent = [];
        //     },
        //     (error) => {
        //         // failed to update token
        //         localStorage.removeItem('accessToken');
        //         localStorage.removeItem('refreshToken');
        //         this._pageNavigationService.navigate('/login');
        //     }
        // );
    }

}
