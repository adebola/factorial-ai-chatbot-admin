import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RagInspectorComponent } from './rag-inspector/rag-inspector.component';

const routes: Routes = [
  {
    path: '',
    component: RagInspectorComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RagInspectorRoutingModule {}
