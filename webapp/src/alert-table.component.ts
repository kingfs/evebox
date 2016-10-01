/* Copyright (c) 2014-2016 Jason Ish
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    AfterViewChecked,
    OnDestroy
} from "@angular/core";
import {AppService} from "./app.service";
import {MousetrapService} from "./mousetrap.service";
import {ActivatedRoute} from "@angular/router";

declare var $:any;

@Component({
    selector: "alert-table",
    templateUrl: "./alert-table.component.html",
})
export class AlertTableComponent implements OnInit, OnDestroy, AfterViewChecked {

    @Input() private rows:any[] = [];
    @Output() private rowClicked:EventEmitter<any> = new EventEmitter<any>();
    @Input() activeRow:number = 0;
    @Output() activeRowChange:EventEmitter<number> = new EventEmitter<number>();
    @Output() toggleEscalation:EventEmitter<any> = new EventEmitter<any>();
    @Output() archiveEvent:EventEmitter<any> = new EventEmitter<any>();

    @Output() escalateAndArchiveEvent:EventEmitter<any> = new EventEmitter<any>();

    constructor(private appService:AppService,
                private mousetrap:MousetrapService,
                private route:ActivatedRoute) {
    }

    ngOnInit() {
        this.mousetrap.bind(this, ".", () => {
            this.openDropdownMenu();
        });

        this.mousetrap.bind(this, "1", () => {
            this.selectBySignatureId(this.rows[this.activeRow]);
        });
        this.mousetrap.bind(this, "2", () => {
            this.filterBySignatureId(this.rows[this.activeRow]);
        });
    }

    ngOnDestroy() {
        this.mousetrap.unbind(this);
    }

    ngAfterViewChecked() {
        $(".dropdown-toggle").dropdown();
        $('[data-toggle="tooltip"]').tooltip({
            container: 'body',
            delay: {show: 500},
        });
    }

    openDropdownMenu() {
        // Toggle.
        let element = $("#dropdown-" + this.activeRow);
        element.dropdown('toggle');

        // Focus.
        element.find("li:first-child a").focus();
    }

    isArchived(row:any) {
        if (row.event.event._source.tags) {
            if (row.event.event._source.tags.indexOf("archived") > -1) {
                return true;
            }
        }
        return false;
    }

    selectBySignatureId(row:any) {

        let signatureId = row.event.event._source.alert.signature_id;

        this.rows.forEach((row:any) => {
            if (row.event.event._source.alert.signature_id === signatureId)
                row.selected = true;
        });

        // Probably a little broad but gets the job done.
        $("table .open").dropdown('toggle');
    }

    filterBySignatureId(row:any) {

        // Probably a little broad but gets the job done.
        $(".open").dropdown('toggle');

        let signatureId = row.event.event._source.alert.signature_id;
        this.appService.updateParams(this.route, {
            q: `alert.signature_id:${signatureId}`
        });

    }
}