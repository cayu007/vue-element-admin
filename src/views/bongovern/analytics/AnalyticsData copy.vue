<!-- AnalyticsData.vue -->
<template>
  <div>
    <h2>Estadísticas de Google Analytics</h2>
    <div v-if="chartData">
      <h3>Total de visitas</h3>
      <BarChart :chart-data="chartData" :options="chartOptions"></BarChart>

    </div>
  </div>
</template>

<script>
import BarChart from '@/components/BarChart.vue';

import analyticsApi from "@/api/analytics";

export default {
  components: {
    BarChart
  },
  data() {
  return {
    chartData: null,
    chartOptions: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      }
    }
  };
},
  async mounted() {
  try {
    const response = await analyticsApi.get('/total-visits');
    console.log("Datos obtenidos de la API:", response.data);
    console.log("Valores específicos de las métricas:", response.data.rows[0].metricValues);

    if (response.data.rows && response.data.rows.length > 0) {
      const metrics = response.data.rows[0].metricValues;
      
      // Convertir los valores en números
      const eventCountValue = Number(metrics[0].value);
      const activeUsersValue = Number(metrics[1].value);
      
      this.chartData = {
        labels: ['Eventos', 'Usuarios Activos'],
        datasets: [{
          label: 'Visitas',
          backgroundColor: ['#f87979', '#7f8c8d'],
          data: [eventCountValue, activeUsersValue]
        }]
      };
    }
  } catch (error) {
    console.error('Error al obtener las visitas totales:', error);
  }
}

}
</script>

  
  
  