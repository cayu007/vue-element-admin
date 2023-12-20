const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const cors = require('cors');
const { google } = require('googleapis');
const keys = require('./chart-gpt-393704-140c5ae12ac5.json');
const { Pool } = require('pg');

const app = express();

const pool = new Pool({
  user: 'postgresql',
  host: 'localhost',
  database: 'documize',
  password: 'Mesimania10',
  port: 5432,
});
// Configura fluent-ffmpeg para usar los binarios locales
ffmpeg.setFfmpegPath(path.join(__dirname, '../ffmpeg-binaries', 'ffmpeg'));
ffmpeg.setFfprobePath(path.join(__dirname, '../ffmpeg-binaries', 'ffprobe'));
// Habilita todas las solicitudes CORS
app.use(cors());

const PORT = process.env.PORT || 3001;


const propertyId = '351322003';  // Reemplaza con tu ID de propiedad de GA4

const jwt = new google.auth.JWT(
  keys.client_email,
  null,
  keys.private_key,
  ['https://www.googleapis.com/auth/analytics.readonly']
);

google.options({ auth: jwt });

const analyticsData = google.analyticsdata('v1beta');

// Obtener número total de visitas (usuarios y sesiones)
async function getTotalVisits() {
    const response = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'yesterday' }],
        metrics: [
          { name: 'eventCount' },
          { name: 'activeUsers' }
        ]
      }
    });
    return response.data;
  }
  
  // Obtener visitas por ubicación (países)
  async function getVisitsByLocation() {
    const response = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'yesterday' }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'eventCount' }]
      }
    });
    return response.data;
  }
  
  // Obtener tecnología (navegadores y sistemas operativos)
  async function getTechnology() {
    const response = await analyticsData.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: '30daysAgo', endDate: 'yesterday' }],
        dimensions: [{ name: 'browser' }, { name: 'operatingSystem' }],
        metrics: [{ name: 'eventCount' }]
      }
    });
    return response.data;
  }
 
  
  
  app.get('/total-visits', async (req, res) => {
    try {
      const data = await getTotalVisits();
      res.json(data);
    } catch (error) {
      res.status(500).send(`Error al obtener total de visitas: ${error}`);
    }
  });
  
  app.get('/visits-by-location', async (req, res) => {
    try {
      const data = await getVisitsByLocation();
      res.json(data);
    } catch (error) {
      res.status(500).send(`Error al obtener visitas por ubicación: ${error}`);
    }
  });
  
  app.get('/technology', async (req, res) => {
    try {
      const data = await getTechnology();
      res.json(data);
    } catch (error) {
      res.status(500).send(`Error al obtener información de tecnología: ${error}`);
    }
  });
  
  
// Aquí agregarás las funciones para obtener datos de GA4 en los siguientes pasos.

app.get('/', (req, res) => {
    res.send('¡Servidor Express funcionando!');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

app.post('/convert', (req, res) => {
  // Por ahora, supongamos que estás convirtiendo un archivo específico
  // En una implementación real, probablemente recibirías el archivo a través de una solicitud POST o lo obtendrías de otra fuente
  const inputPath = path.join(__dirname, 'path-to-input-file.mp4');
  const outputPath = path.join(__dirname, 'path-to-output-file.avi');
  
  ffmpeg(inputPath)
      .output(outputPath)
      .on('end', () => {
          res.send('Conversión completada.');
      })
      .on('error', (err) => {
          console.error(err);
          res.status(500).send('Error durante la conversión.');
      })
      .run();
});
const multer = require('multer');

// Configura multer para guardar los archivos subidos en la carpeta 'uploads'
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Modifica la ruta de conversión para usar multer y manejar la subida de archivos
app.post('/convert', upload.single('video'), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join(__dirname, 'output', Date.now() + '-converted.avi');
  
  ffmpeg(inputPath)
      .output(outputPath)
      .on('end', () => {
          res.json({ message: 'Conversión completada.', downloadPath: outputPath });
      })
      .on('error', (err) => {
          console.error(err);
          res.status(500).json({ message: 'Error durante la conversión.' });
      })
      .run();
});




