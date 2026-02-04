import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatSessionListComponent } from './chat-session-list/chat-session-list.component';

const routes: Routes = [
  {
    path: '',
    component: ChatSessionListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChatMonitoringRoutingModule { }
