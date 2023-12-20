<!-- BarChart.vue -->
<template>
    <div>
      <canvas ref="canvas"></canvas>
    </div>
  </template>
  
  <script>
  import { Bar, mixins } from 'vue-chartjs';
  
  export default {
    extends: Bar,
    mixins: [mixins.reactiveProp],
    props: {
      chartData: {
        type: Object,
        required: true
      },
      options: {
        type: Object,
        default: () => ({
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        })
      }
    },
    mounted() {
      this.renderChart(this.chartData, this.options);
    }
  }
  </script>
  