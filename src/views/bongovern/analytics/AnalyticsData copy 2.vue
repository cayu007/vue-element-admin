<!-- AnalyticsData.vue -->
<template>
  <div>
    <a href="https://lookerstudio.google.com/u/0/reporting/72891b0b-18b8-43ff-b361-d73763a21563/page/IYWeD/edit" 
       target="_blank" 
       rel="noopener noreferrer" 
       class="report-button">Crear y editar Informes</a>

    <h2>Estadísticas de Google Analytics</h2>

    <!-- Mostrar datos del JSON -->
    <div v-if="jsonData">
      <h3>Dimensiones</h3>
      <ul>
        <li v-for="header in jsonData.dimensionHeaders" :key="header.name">
          {{ header.name }}
        </li>
      </ul>
      
      <h3>Métricas</h3>
      <ul>
        <li v-for="header in jsonData.metricHeaders" :key="header.name">
          {{ header.name }} ({{ header.type }})
        </li>
      </ul>
      
      <h3>Valores</h3>
      <ul>
        <li v-for="(value, index) in jsonData.rows[0].metricValues" :key="index">
          {{ jsonData.metricHeaders[index].name }}: {{ value.value }}
        </li>
      </ul>
    </div>

    <!-- Gráfico -->
    <div v-if="chartData">
      <h3>Total de visitas</h3>
      <BarChart :chart-data="chartData" :options="chartOptions"></BarChart>
    </div>
    
    <iframe width="600" height="450" src="https://lookerstudio.google.com/embed/reporting/72891b0b-18b8-43ff-b361-d73763a21563/page/IYWeD" frameborder="0" style="border:0" allowfullscreen></iframe>
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
    jsonData: null,  // Aquí guardas el JSON que recibes
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
mounted() {
    this.fetchAndUpdateChart();
    this.pollingInterval = setInterval(this.fetchAndUpdateChart, 300000);  // 300,000 ms = 5 minutos
  },
  beforeDestroy() {
    clearInterval(this.pollingInterval);
  },
methods: {
  async fetchAndUpdateChart() {
      try {
        const response = await analyticsApi.get('/total-visits');
        this.jsonData = response.data;
        console.log("Datos obtenidos de la API:", this.jsonData);

        if (this.jsonData.rows && this.jsonData.rows.length > 0) {
          const metrics = this.jsonData.rows[0].metricValues;
          
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
    },  
    transformJsonToChartData() {
      // Extraer métricas y dimensiones
      const metricNames = this.jsonData.metricHeaders.map(header => header.name);
      const dimensionValues = this.jsonData.rows[0].dimensionValues;
      const metricValues = this.jsonData.rows[0].metricValues;
      
      // Configura los datos para Chart.js
      this.chartData = {
        labels: dimensionValues,
        datasets: metricNames.map((name, index) => {
          return {
            label: name,
            data: metricValues[index] // Asume que cada métrica tiene un conjunto correspondiente de valores
          }
        })
      };
    }
  },

}
</script>
<style scoped>
.report-button {
  display: inline-block;
  padding: 10px 15px;
  background-color: #3498db;
  color: #fff;
  border-radius: 5px;
  text-decoration: none;
  margin-bottom: 20px;
  transition: background-color 0.3s;
}

.report-button:hover {
  background-color: #2980b9;
}
</style>

  
  
  