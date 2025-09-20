import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Patient {
  filename: string; // agora o HTML e TS batem
  name: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('vitalChart') chartRef!: ElementRef<HTMLCanvasElement>;

  patients: Patient[] = [];
  selectedPatient: string = '';
  patientName = '';
  displayedData: any[] = [];
  chart: Chart | null = null;

  constructor(private http: HttpClient) {} // ✅ injeta HttpClient

  ngAfterViewInit(): void {
    this.loadFiles();
  }

  // ✅ Upload CSV
  uploadToApi(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file, file.name);

    this.http.post('/api/upload-csv/', formData).subscribe(() => {
      this.loadFiles();
    });
  }

  // ✅ Carregar lista de arquivos (pacientes)
  loadFiles() {
    this.http.get<{ files: string[] }>('/api/files').subscribe(res => {
      this.patients = res.files.map(f => ({ filename: f, name: f }));
      if (this.patients.length && !this.selectedPatient) {
        this.selectedPatient = this.patients[0].filename;
        this.loadPatientData(this.selectedPatient);
      }
    });
  }

  // ✅ Carregar dados do paciente selecionado
  loadPatientData(filename: string) {
    this.http.get<any[]>(`/api/data/${filename}`).subscribe(res => {
      this.displayedData = res;
      this.patientName = filename;
      this.updateOrCreateChart();
    });
  }

  updateOrCreateChart() {
    if (!this.chart && this.chartRef?.nativeElement) {
      const ctx = this.chartRef.nativeElement.getContext('2d')!;
      this.chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.displayedData.map(r => r.timestamp),
          datasets: [
            { label: 'Heart Rate (bpm)', data: this.displayedData.map(r => r.hr), borderColor: '#1f77b4', tension: 0.2, pointRadius: 0 },
            { label: 'SpO₂ (%)', data: this.displayedData.map(r => r.spo2), borderColor: '#2ca02c', tension: 0.2, pointRadius: 0 },
            { label: 'Systolic (mmHg)', data: this.displayedData.map(r => r.pressao_sys), borderColor: '#9467bd', tension: 0.2, pointRadius: 0 },
            { label: 'Diastolic (mmHg)', data: this.displayedData.map(r => r.pressao_dia), borderColor: '#ff7f0e', tension: 0.2, pointRadius: 0 },
            { label: 'Temperature (°C)', data: this.displayedData.map(r => r.temp), borderColor: '#d62728', tension: 0.2, pointRadius: 0 }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          scales: { y: { beginAtZero: false } }
        }
      });
    } else {
      this.updateChart();
    }
  }

  updateChart() {
    if (!this.chart) return;

    this.chart.data.labels = this.displayedData.map(r => r.timestamp);
    (this.chart.data.datasets[0].data as number[]) = this.displayedData.map(r => r.hr);
    (this.chart.data.datasets[1].data as number[]) = this.displayedData.map(r => r.spo2);
    (this.chart.data.datasets[2].data as number[]) = this.displayedData.map(r => r.pressao_sys);
    (this.chart.data.datasets[3].data as number[]) = this.displayedData.map(r => r.pressao_dia);
    (this.chart.data.datasets[4].data as number[]) = this.displayedData.map(r => r.temp);
    this.chart.update();
  }

  // ✅ Download CSV
  downloadCSV() {
    if (!this.selectedPatient) return;
    this.http.get(`/api/data/${this.selectedPatient}?format=csv`, { responseType: 'blob' }).subscribe((blob: Blob) => {
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = this.selectedPatient;
      a.click();
    });
  }
}
