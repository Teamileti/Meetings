import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Meeting} from "../model/Meeting";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {HttpClient} from "@angular/common/http";
import {
  DateRange,
  MatDatepickerInput,
  MatDatepickerInputEvent,
  MatDatepickerModule
} from "@angular/material/datepicker";
import {MatDatetimePickerInputEvent} from "@angular-material-components/datetime-picker";
import {MatInputModule} from "@angular/material/input";
import {MeetingServiceService} from "../meeting-service.service";
import {DatePipe} from "@angular/common";
import {ToastrService} from "ngx-toastr";
import {MatTableDataSource} from "@angular/material/table";


@Component({
  selector: 'app-add-meeting-dialog',
  templateUrl: './add-meeting-dialog.component.html',
  styleUrls: ['./add-meeting-dialog.component.css'],
  providers: [DatePipe],
})
export class AddMeetingDialogComponent implements OnInit {
  meetingInfo !: FormGroup;
  actionText: string = "Save";
  meetingsList: Meeting[] =[];
  // @ViewChild('start') start !: MatDatepickerInput<any>;
  // @ViewChild('startDate') startDate !: MatInputModule;

  constructor(public http: HttpClient,
              private meetingService: MeetingServiceService,
              public dialogRef: MatDialogRef<AddMeetingDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public meetingData: any,
              private datepipe: DatePipe,
              private toastr: ToastrService) {

      this.meetingInfo = new FormGroup({
        id: new FormControl(''),
        title: new FormControl(''),
        startDate: new FormControl( new Date()),
        durationMinutes: new FormControl ( ['', [Validators.required]]),
        endDate: new FormControl(''),
      });
      if(this.meetingData){
        this.actionText = "Update"
        this.meetingInfo.controls['title'].setValue(this.meetingData.title);
        this.meetingInfo.controls['startDate'].setValue(this.meetingData.startDate);
        this.meetingInfo.controls['durationMinutes'].setValue(this.meetingData.durationMinutes);
      }
    }

  ngOnInit(): void {
    this.getMeetings();

    }

  private getMeetings() {
    this.meetingService.getMeetingList().subscribe((result : any)=>{
      this.meetingsList = result;
      console.log(this.meetingsList);
    });
  }


  saveJob() {
    this.calculateId();
    this.calulateEndDate();
    let newMeeting: Meeting = this.meetingInfo.value;

    function isMeetingOverlap(newMeeting: Meeting, existingMeetings: Meeting[]): boolean {
      // Convert the new meeting's timestamps to Date objects
      const newMeetingStartDate = new Date(newMeeting.startDate);
      const newMeetingEndDate = new Date(newMeeting.startDate + newMeeting.durationMinutes * 60000);

      // Filter existing meetings that have the same date as the new meeting
      const sameDateMeetings = existingMeetings.filter(existingMeeting => {
        const existingMeetingStartDate = new Date(existingMeeting.startDate);
        return (
          newMeetingStartDate.toDateString() === existingMeetingStartDate.toDateString()
        );
      });

      // Iterate through the filtered existing meetings and check for overlaps
      for (const existingMeeting of sameDateMeetings) {
        // Convert existing meeting's timestamps to Date objects
        const existingMeetingStartDate = new Date(existingMeeting.startDate);
        const existingMeetingEndDate = new Date(existingMeeting.startDate + existingMeeting.durationMinutes * 60000);

        // Check for overlaps
        if (
          (newMeetingStartDate >= existingMeetingStartDate && newMeetingStartDate < existingMeetingEndDate) ||
          (newMeetingEndDate > existingMeetingStartDate && newMeetingEndDate <= existingMeetingEndDate) ||
          (newMeetingStartDate <= existingMeetingStartDate && newMeetingEndDate >= existingMeetingEndDate)
        ) {
          // Overlap found
          return true;
        }
      }

      // No overlap found
      return false;
    }

    if (!this.meetingData) {
      const overlappingMeeting = isMeetingOverlap(newMeeting, this.meetingsList);
        //console.log('the datessss overlap valuee is' + overlappingMeeting);
      if (overlappingMeeting){
        this.toastr.error("The new meeting overlaps with an existing meeting");
        console.error('The new meeting overlaps with an existing meeting.');
      }
      else {
        this.meetingService.addMeeting(this.meetingInfo.value).subscribe(
          result => {
            console.log(result);
            this.toastr.success("New meeting added succesfully");
          },
          error => {
            console.error('Error', error);
          }
        )
      }
    }
    else {
      this.updateJob();
    }
  }

  updateJob() {
    this.meetingService.updateMeeting(this.meetingData.id, this.meetingInfo.value,)
      .subscribe({
        next:(result) =>{
          console.log('updated the dataaaa')
          this.meetingInfo.reset();
          this.dialogRef.close('update');
        }
      })

  }

  private calulateEndDate() {
        const startDateString = this.meetingInfo.get('startDate')?.value;
        const durationMinutes = this.meetingInfo.get('durationMinutes')?.value;
        // Convert the string representation of startDate into a Date object
        const startDate = new Date(startDateString);
        if (!isNaN(startDate.getTime())) { // Check if the conversion was successful
          // Calculate the end date
          const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
          console.log("End date iiiiiiis:    "+ endDate)// 1 minute = 60000 milliseconds
          // Format the endDate as a string
          const formattedEndDate = endDate.getTime(); // This gives you a string representation of the date
          console.log('The formated end date is:   ' + formattedEndDate);
          // Set the endDate in the form control
          this.meetingInfo.get('endDate')?.setValue(formattedEndDate);
          //console.log('The end date is  ' + this.meetingInfo.get('endDate')?.value)
        } else {
          console.error('Invalid start date format');
        }

  }

  onSelectedStartDate(event: MatDatetimePickerInputEvent<Date>) {
    const date = event.value;
    console.log('The date isssss: ' + date);
    if (date) {
      const timestamp = date?.getTime(); // Convert Date to timestamp (milliseconds)
      const startDate = this.meetingInfo.get('startDate')?.value;

      if (startDate !== null && startDate !== undefined) {
        this.meetingInfo.get('startDate')?.setValue(timestamp);
        //startDate.setValue(timestamp);
     } else {
       console.error('startDate control is null or undefined');
     }
     console.log(this.meetingInfo.get('startDate')?.value)
    }
 }

  onSelectedEndDate(event: MatDatetimePickerInputEvent<Date>) {
    const dateEnd = event.value;
    this.meetingInfo.get('endDate')?.setValue(dateEnd);
  }
  formatTimestampToDateString(timestamp: number): string {
    // Convert the timestamp to a Date object
    const date = new Date(timestamp);

    // Use DatePipe to format the Date object into a string
    return <string>this.datepipe.transform(date, 'yyyy-MM-dd HH:mm:ss');
  }


  private calculateId() {
    let min = 1;
    let max = 200;
   let id =  Math.floor(Math.random()* (max-min + 1)) + min;
    this.meetingInfo.get('id')?.setValue(id);
  }
}

