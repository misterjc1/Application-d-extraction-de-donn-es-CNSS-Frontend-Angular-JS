import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConstruireRequeteComponent } from './components/construire-requete/construire-requete/construire-requete.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { QueryResultModalComponent } from './components/query-result-modal/query-result-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { DataSet, Network } from 'vis';
import { RelationManagerComponent } from './components/relation-manager/relation-manager.component';
import { ConditionComponent } from './components/condition/condition.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { NotificationDialogComponent } from './components/notification-dialog/notification-dialog.component';

//import { KeysPipe } from './pipes/keys.pipe';




@NgModule({
  declarations: [
    AppComponent,
    ConstruireRequeteComponent,
    QueryResultModalComponent,
    RelationManagerComponent,
    ConditionComponent,
    HeaderComponent,
    FooterComponent,
    ConfirmDialogComponent,
    NotificationDialogComponent,    
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    DragDropModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatTableModule,
    NgxGraphModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
