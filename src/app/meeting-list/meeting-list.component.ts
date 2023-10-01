import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {Meeting} from "../model/Meeting";
import {HttpClient} from "@angular/common/http";
import {MatDialog} from "@angular/material/dialog";
import {AddMeetingDialogComponent} from "../add-meeting-dialog/add-meeting-dialog.component";
import {DeleteMeetingDialogComponent} from "../delete-meeting-dialog/delete-meeting-dialog.component";
import {MeetingServiceService} from "../meeting-service.service";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-meeting-list',
  templateUrl: './meeting-list.component.html',
  styleUrls: ['./meeting-list.component.css'],
  //standalone: true,
  //imports: [MatTableModule, MatPaginatorModule],
})

export class MeetingListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'startDate', 'endDate', 'action'];
  dataSource !: MatTableDataSource<Meeting>;
  meetings : Meeting[] = [];
  filteredData: Meeting[] = [];
  totalItems : number = 0;
  pageSize: any;
  pageIndex: any;
  @ViewChild(MatPaginator) paginator !: MatPaginator;
  startDateFilter: Date | null = null;
  endDateFilter: Date | null = null;

  constructor(public http: HttpClient, private dialog: MatDialog,
              private meetingService: MeetingServiceService) { }

  ngOnInit() {
    this.filteredData = this.meetings;
    this.getMeetingsList();
    //this.dataSource.paginator = this.paginator;
  }

  // applyFilter(event: Event){
  //   const filterValue = (event.target as HTMLInputElement).value;
  //   this.dataSource.filter = filterValue.trim().toLowerCase();
  // }

  openAddDialog() {
    const dialogRef = this.dialog.open(AddMeetingDialogComponent, {
      width: '400px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe(result =>{
      this.getMeetingsList();
      console.log('Modal closed with result:', result)
    });
    this.getMeetingsList();

  }

  private getMeetingsList() {
    this.meetingService.getMeetingList().subscribe((result : any)=>{
      this.meetings = result;
      console.log(this.meetings)
      this.dataSource = new MatTableDataSource(this.meetings);
      this.totalItems = this.dataSource.data.length;
      this.paginator.length = this.totalItems;
    })
  }

  applyFilters() {
    if (this.startDateFilter && this.endDateFilter){
      this.dataSource.data = this.meetings.filter((meeting) =>{
        const meetingDate = new Date(meeting.startDate);
        return(
          meetingDate>= this.startDateFilter! &&
            meetingDate <= this.endDateFilter!
        );
      });
    }
    // this.dataSource.data = this.meetings.filter((meeting) => {
    //   // Check if the meeting's start and end dates fall within the selected range
    //   if (
    //     (!this.startDateFilter || new Date(meeting.startDate) >= this.startDateFilter) &&
    //     (!this.endDateFilter || new Date(meeting.endDate) <= this.endDateFilter)
    //   ) {
    //     return true; // Meeting matches the filter criteria
    //   }
    //   return false; // Meeting doesn't match the filter criteria
    // });
  }

  removeMeeting(id: any) {
    this.dialog.open(DeleteMeetingDialogComponent)
      .afterClosed().subscribe((confirm:any)=>{
      if(confirm){
        this.meetingService.deleteMeeting(id).subscribe( ()=>{
          this.dataSource.data = this.dataSource.data.filter(
            (m : Meeting) => m.id != id);
        });
      }
      this.getMeetingsList();
      //location.reload();
    });

  }

  clearFilters() {
      this.startDateFilter = null;
      this.endDateFilter = null;
      this.getMeetingsList();
      //this.applyFilters(); // Reapply filters to update the table
  }

  editSelectedMeeting(element: any) {
      this.dialog.open(AddMeetingDialogComponent, {
        width: '400px',
        data: element,
      }).afterClosed().subscribe(value => {
        this.getMeetingsList();
      })

    }
}

// export interface PeriodicElement {
//   id: string,
//   title: string,
//   startDate: string,
//   endDate: string,
// }
//
// const ELEMENT_DATA: PeriodicElement[] = [
//   {id: '1', title: 'Hydrogen', startDate: '9/23/2023 12:00PM', endDate: '9/23/2023 12:23PM'},
//   {id: '2', title: 'Hydrogen', startDate: '9/23/2023 12:00PM', endDate: '9/23/2023 12:23PM'},
//   {id: '3', title: 'Hydrogen', startDate: '9/23/2023 12:00PM', endDate: '9/23/2023 12:23PM'},
//   {id: '4', title: 'Hydrogen', startDate: '9/23/2023 12:00PM', endDate: '9/23/2023 12:23PM'},
//   {id: '5', title: 'Hydrogen', startDate: '9/23/2023 12:00PM', endDate: '9/23/2023 12:23PM'},
//   {id: '6', title: 'Hydrogen', startDate: '9/23/2023 12:00PM', endDate: '9/23/2023 12:23PM'},
//   {id: '7', title: 'Hydrogen', startDate: '9/23/2023 12:00PM', endDate: '9/23/2023 12:23PM'},
//   {id: '8', title: 'Hydrogen', startDate: '9/23/2023 12:00PM', endDate: '9/23/2023 12:23PM'},
// ];


