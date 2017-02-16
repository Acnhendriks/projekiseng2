import { Component, ElementRef, ViewChild, OnDestroy, AfterViewChecked, OnInit } from '@angular/core';

import { LayoutService } from '../../shared/services/layout.service';
import { HeaderService } from '../../shared/services/header.service';
import { Modal } from '../../shared/services/modal.service';
import { PageNavigationService } from '../../shared/services/page-navigation.service';
import { ChatRoomService } from '../services/chat-room.service';


@Component({
	selector: 'chat-room',
	templateUrl: './chat-room.component.html'
})

export class ChatRoomComponent implements OnInit, AfterViewChecked, OnDestroy {
	@ViewChild('scrollMe') myScrollContainer: ElementRef;
	
	vPage:any;
	vText:any = '';
	vLoggingList:any = [];
	vResponse:any;
	vSubscriptionPolling: any;
	vChatRefreshDone: boolean = true;
	vAutoScroll:boolean = false;
	vTotalBox:boolean = false;

	vHeight: any = 500;
	vHeightTmp: any = 500;

	vDate: Date = new Date();
	vKeyboardShow: boolean = false;

	constructor(
		private _layoutService: LayoutService,
		private _headerService: HeaderService,
		private _modalService: Modal.ModalService,
		private _pageNavigationService: PageNavigationService,
		private _chatRoomService: ChatRoomService
	) {
		this._layoutService.setCurrentPage('chat-room');
		this._headerService.setTitle('T.I.V.A.');

		this.initializePolling();
	}

	getDate() {
		this.vDate = new Date();
		let hour = this.vDate.getHours();
		let hourTemp = hour;
		let format = 'AM';
		if (hour >= 12) {
			hour = hourTemp - 12;
			format = 'PM';
		}
		if (hour === 0) {
			hour = 12;
		}

        let sHour = hour > 9 ? hour : '0' + hour;
        let min = this.vDate.getMinutes();
        let sMin = min > 9 ? min : '0' + min;
        return sHour+ ':' +sMin+ ' ' +format;
	}

	ngOnInit() {
		this.vHeight = document.body.scrollHeight - 150;
		this.vHeightTmp = document.body.scrollHeight - 150;
		console.log('this.vHeight : ' +this.vHeight);
		document.addEventListener('deviceready', this.onDeviceReady, false);
	}

	onDeviceReady() {
		console.log('onDeviceReady');
		document.addEventListener('hidekeyboard', this.onKeyboardHide, false);
		document.addEventListener('showkeyboard', this.onKeyboardShow, false);
	}

	onKeyboardHide() {
		console.log('onKeyboardHide');
	}

	onKeyboardShow() {
		console.log('onKeyboardShow');
	}

	ngOnDestroy() {
		clearInterval(this.vSubscriptionPolling);
	}

	ngAfterViewChecked() {
		console.log('this.vHeight : ' +this.vHeight);
		console.log('ngAfterViewChecked : ' +this.myScrollContainer.nativeElement.scrollTop+ ' ' +this.myScrollContainer.nativeElement.scrollHeight+ ' ' +this.myScrollContainer.nativeElement.offsetTop);
		// console.log('asd : ' +document.getElementById('scroll-div').scrollTop+ ' - ' +document.getElementById('scroll-div').scrollHeight+ ' - ' +document.getElementById('scroll-div').offsetTop);
		if (this.vAutoScroll) {
			this.scrollToBottom();
		}
	}

	getHeight() {
		return this.vHeight;
	}

	scrollToBottom(): void {
		try {
			this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
		} catch (err) {

		}

		if (this.myScrollContainer.nativeElement.scrollHeight - this.myScrollContainer.nativeElement.scrollTop === this.vHeight) {
			this.vAutoScroll = false;
		}
	}

	scrollToBott(scrollObject: string) {
		// console.log('this.vHeight : ' +this.vHeight);

		// console.log('scrollToBott : ' +this.myScrollContainer.nativeElement.scrollTop+ ' - '  +this.myScrollContainer.nativeElement.scrollHeight);
		// console.log('asd : ' +document.getElementById(scrollObject).offsetTop+ ' - ' +document.getElementById(scrollObject).scrollTop);

	}

	showModal() {
		this._modalService.showModal();
	}

	pop() {
		this._pageNavigationService.popParam();
		console.log('pop'+this._pageNavigationService.vListParams.length);
		console.log(this._pageNavigationService.vListParams);
	}

	pilih(pParam: string) {

		this.vLoggingList[this.vLoggingList.length-1].options = null;
		
		var vParam = {
			'type' : 'right',
			'text' : pParam,
			'options' : '',
			'date' : this.getDate()
		};
		this.vLoggingList.push(vParam);
		this._chatRoomService.sendMessage(pParam).subscribe(
			response => {
				let vResponse = response.json();
				console.log('sendMessage : ' +JSON.stringify(vResponse));

				if (vResponse.status === "OK") {
					this.agentTyping();
				}
			},
			error => {
				
			}
		);
		this.vAutoScroll = true;
		this.scrollToBottom();
	}

	sendText() {
		if (this.vText !== '') {
			var vParam = {
				'type' : 'right',
				'text' : this.vText,
				'options' : '',
				'date' : this.getDate()
			};
			this.vLoggingList.push(vParam);

			this._chatRoomService.sendMessage(this.vText).subscribe(
				response => {
					let vResponse = response.json();
					console.log('sendMessage : ' +JSON.stringify(vResponse));

					if (vResponse.status === "OK") {
						this.agentTyping();
					}
				},
				error => {
					
				}
			);
			this.vText = '';
		}
		this.vAutoScroll = true;
		this.scrollToBottom();
	}

	agentTyping() {
		var vParam = {
			'type' : 'typing',
			'text' : 'TIVA sedang mengetik ...',
			'options' : '',
			'date' : this.getDate()
		};
		this.vLoggingList.push(vParam);
	}

	getResp() {
		var vSlidingShow: boolean = false;
		this._chatRoomService.getResponse().subscribe(
			response => {
				this.vResponse = response.json();

				if (this.vResponse.response.length > 0) {
					console.log('masup if');

					if (this.vLoggingList[this.vLoggingList.length - 1].type === 'typing') {
						console.log('buang typing');
						this.vLoggingList.pop();
					}

					for (var a = 0; a < this.vResponse.response.length ; a++) {
						console.log('masup for');
						var vText = this.vResponse.response[a].text;
						let vParam = {
							'type' : 'left',
							'text' : vText,
							'options' : this.vResponse.response[a].options,
							'date' : this.getDate()
						};

						if (this.vResponse.response[a].options.length > 0) {
							if (this.vResponse.response[a].options.length === 3) {
								this.vTotalBox = false;
							} else {
								this.vTotalBox = true;
							}
							vSlidingShow = true;
						}
						
						if (vSlidingShow) {
							vParam = {
								'type' : 'left',
								'text' : vText,
								'options' : '',
								'date' : this.getDate()
							};
							this.vLoggingList.push(vParam);

							vParam = {
								'type' : 'sliding',
								'text' : '',
								'options' : this.vResponse.response[a].options,
								'date' : this.getDate()
							};
							this.vLoggingList.push(vParam);
						} else {
							if (vText === 'QR.png') {
								vParam = {
									'type' : 'image',
									'text' : '',
									'options' : '',
									'date' : this.getDate()
								};
							}
							this.vLoggingList.push(vParam);
						}
					}

					this.scrollToBottom();
					this.vAutoScroll = true;
				}

			},
			error => {
				this.scrollToBottom();
			}
		);
	}



	initializePolling() {
		// console.log('--START INITIALIZE POLLING--');
		this.vSubscriptionPolling = setInterval(() => {
				this.getResp();

		}, 2 * 1000);
	}
	destroyPolling() {
		clearInterval(this.vSubscriptionPolling);
	}

	
}