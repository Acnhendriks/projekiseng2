import { Component } from '@angular/core';

import { Modal } from '../services/modal.service';

@Component({
    selector: 'modal',
    templateUrl: './modal.component.html'
})

export class ModalComponent {

    constructor(
        private _modalService: Modal.ModalService
    ) {

    }

    getModalState() {
        return this._modalService.getModalState();
    }

    closeModal() {
        return this._modalService.closeModal();
    }

    getModalHeader() {
        return this._modalService.getModalHeader();
    }

    getModalMessage() {
        return this._modalService.getModalMessage();
    }

    getFootNote() {
        return this._modalService.getFootNote();
    }
}