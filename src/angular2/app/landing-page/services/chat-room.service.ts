import { Injectable } from '@angular/core';
import { Http, Response, RequestOptionsArgs, Headers } from '@angular/http';

@Injectable()
export class ChatRoomService {

	vSlidingItem: string;

	constructor(
		private _http: Http) {
	}

	sendMessage(pParam: string) {
		console.log('pParam : '+pParam);
		let vMessage = {
			"message" : pParam
		};
		return this._http.post('/sendMessage/14', JSON.stringify(vMessage));
  //       return this._http.get('https://tsel-chat-bot-demo.herokuapp.com/getResponse/209345212').toPromise()
  //       	.then((response:any) => console.log('HELLO '+JSON.stringify(response.json()))
		// );
	}

	getResponse() {
		return this._http.get('/getResponse/14');
	}

	getSlidingItem() {
		return this.vSlidingItem;
	}

	setSlidingItem(pParam: any) {
		this.vSlidingItem = pParam;
	}

}
