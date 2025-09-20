import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Papa from 'papaparse';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild('vitalChart') chartRef!: ElementRef<HTMLCanvasElement>;

  rawData: any[] = [];
  patients: Patient[] = [];
  selectedPatient: string = '';
  patientName = '';
  displayedData: any[] = [];
  chart: Chart | null = null;

  ngAfterViewInit(): void {}

  onFileSelect(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (result) => {
        this.rawData = result.data as any[];
        const uniquePatients = new Map<string, string>();
        this.rawData.forEach(row => {
          if (row.paciente_id && row.paciente_nome) {
            uniquePatients.set(row.paciente_id, row.paciente_nome);
          }
        });

        this.patients = Array.from(uniquePatients.entries()).map(([id, name]) => ({
          id: id,
          name: name
        }));

        if (this.patients.length) {
          this.selectedPatient = this.patients[0].id;
          this.applyPatient(this.selectedPatient);
        }
      }
    });
  }

  applyPatient(patientId: string) {
    this.selectedPatient = patientId;
    this.displayedData = this.rawData.filter(r => r.paciente_id === patientId);
    this.patientName = this.displayedData[0]?.paciente_nome || '';
    
    // Usa setTimeout para garantir que o elemento `<canvas>` exista antes de criar o gráfico.
    setTimeout(() => {
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
            plugins: {
              legend: { position: 'bottom' }
            },
            scales: {
              y: { beginAtZero: false }
            }
          }
        });
      } else if (this.chart) {
        // Se o gráfico já existe, apenas atualize os dados.
        this.updateChart();
      }
    }, 0);
  }

  updateChart() {
    if (!this.chart) {
      return;
    }
    
    const labels = this.displayedData.map(r => r.timestamp);
    const hr = this.displayedData.map(r => r.hr);
    const spo2 = this.displayedData.map(r => r.spo2);
    const systolic = this.displayedData.map(r => r.pressao_sys);
    const diastolic = this.displayedData.map(r => r.pressao_dia);
    const temp = this.displayedData.map(r => r.temp);

    this.chart.data.labels = labels;
    (this.chart.data.datasets[0].data as number[]) = hr;
    (this.chart.data.datasets[1].data as number[]) = spo2;
    (this.chart.data.datasets[2].data as number[]) = systolic;
    (this.chart.data.datasets[3].data as number[]) = diastolic;
    (this.chart.data.datasets[4].data as number[]) = temp;
    this.chart.update();
  }

  downloadCSV() {
    if (!this.displayedData.length) return;
    const csv = Papa.unparse(this.displayedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.selectedPatient || 'data'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

interface Patient {
  id: string;
  name: string;
}