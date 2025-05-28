import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-query-result-modal',
  templateUrl: './query-result-modal.component.html',
  styleUrls: ['./query-result-modal.component.scss']
})
export class QueryResultModalComponent {
  constructor(
    public dialogRef: MatDialogRef<QueryResultModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { results: any }
  ) {}

  closeModal() {
    this.dialogRef.close();
  }
}
