import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject, OnDestroy, Injectable, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Uom } from '../../../../../shared/entities';
@Injectable({ providedIn: 'root' })
export class AddUomDialogService {

    private dataSource = new BehaviorSubject<any>('');
    data = this.dataSource.asObservable();

    constructor() { }

    getData(data: any) {
        this.dataSource.next(data);
    }

}
@Component({
  selector: 'app-add-uom-dialog',
  templateUrl: './add-uom-dialog.component.html',
  styleUrls: ['./add-uom-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AddUomDialogComponent implements OnInit, OnDestroy {

    title: string;
    dialogData: any;
    mode = 'Add';

    constructor( public dialogRef: MatDialogRef<AddUomDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public incoming: any) {

        this.title = incoming.title;
        this.dialogData = incoming.data;
        if (incoming.data.selectedUom){
            let current: Uom = incoming.data.selectedUom;
            this.dialogData.Key = current.Key;
            this.dialogData.Title = current.Title;
            this.dialogData.Multiplier = current.Multiplier;
            this.mode = 'Edit';
        }
    }

    ngOnInit() {
    }

    ngOnDestroy(){
        this.dialogData = null;
    }

    onValueChanged(element, $event) {
        switch(element) {
            case 'ID': {
                this.dialogData.Key = $event.value;
                break;
            }
            case 'Title': {
                this.dialogData.Title = $event.value;
                break;
            }
            case 'Multiplier': {
                this.dialogData.Multiplier = $event.value;
                break;
            }
        }
    }
}
