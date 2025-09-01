import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';

export interface MoodLogEntry {
  id: number; // unique ID (timestamp)
  date: string; // ISO string
  notificationId: string | null;
  selections: { [id: number]: number }; // moodId → intensity
  comment?: string;
}

@Component({
  selector: 'app-mood-log-graph',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  templateUrl: './mood-log-graph.component.html',
  styleUrls: ['./mood-log-graph.component.scss'],
})
export class MoodLogGraphComponent implements OnChanges {
  @Input() history: MoodLogEntry[] = [];
  @Input() moodItems: { id: number; name: string }[] = [];

  chartOptions: any;

  ngOnChanges() {
    if (this.history && this.moodItems) {
      this.buildChart();
    }
  }

  private buildChart() {
    // Sort history by date
    const sortedHistory = [...this.history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // X-axis labels (dates)
    const dates = sortedHistory.map((entry) =>
      new Date(entry.date).toLocaleDateString()
    );

    // Generate a line series for each mood item
    const series = this.moodItems.map((mood, index) => {
      const data = sortedHistory.map(
        (entry) => entry.selections[mood.id] ?? null
      );

      // Check if this mood has at least one non-null value
      const hasValues = data.some((v) => v !== null && v !== undefined);
      if (!hasValues) return null;

      return {
        name: mood.name,
        type: 'line',
        data,
        smooth: true,
        connectNulls: true,
        lineStyle: {
          width: 2,
        },
        symbol: 'circle',
        symbolSize: 6,
      };
    });

this.chartOptions = {
  tooltip: {
    trigger: 'axis',
    formatter: (params: any) => {
      const date = new Date(sortedHistory[params[0].dataIndex].date);

      // Format: YYYY-MM-DD HH:mm (24h, no seconds)
      const formattedDate = date.toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // ✅ 24h format
      });

      let content = `<b>${formattedDate}</b><br/>`;
      params.forEach((p: any) => {
        if (p.data !== null && p.data !== undefined) {
          content += `
            <span style="display:inline-block;margin-right:5px;
              border-radius:10px;width:10px;height:10px;
              background-color:${p.color};"></span>
            ${p.seriesName}: <b>${p.data}</b><br/>
          `;
        }
      });

      return content;
    },
  },
  legend: {
    type: 'plain',
    orient: 'horizontal',
    bottom: 0,
    left: 'center',
    align: 'auto',
    itemWidth: 20,
    itemHeight: 10,
    textStyle: {
      fontSize: 12,
    },
    itemGap: 16,
    width: '90%',
  },
  grid: {
    left: '1%',
    right: '1%',
    bottom: '15%',
    top: '5%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: dates,
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 10,
    interval: 1,
    name: 'Intensity',
  },
  series,
};
  }
}