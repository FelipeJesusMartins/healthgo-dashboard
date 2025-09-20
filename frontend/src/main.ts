import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';

// Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './app/dashboard/dashboard';
import { FormsModule } from '@angular/forms';

bootstrapApplication(DashboardComponent, {
  providers: [
    importProvidersFrom(
      CommonModule,
      MatTableModule,
      MatInputModule,
      MatButtonModule,
      FormsModule
    )
  ]
});