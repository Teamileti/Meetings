import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-delete-meeting-dialog',
  templateUrl: './delete-meeting-dialog.component.html',
  styleUrls: ['./delete-meeting-dialog.component.css']
})
export class DeleteMeetingDialogComponent implements OnInit {
  message: string = "Are you sure you want to delete this meeting?"

  constructor() { }

  ngOnInit(): void {
  }

}
