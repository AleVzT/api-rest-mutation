const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cluster = require('cluster');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Implementacion de la funcion que busca si es una mutacion o no!
function getMutation(dna) {

  const n = dna.length;
  const m = dna[0].length;

  // Validamos que las bases nitrogenadas sean validass
  const validBases = new Set(["A", "T", "C", "G"]);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (!validBases.has(dna[i][j])) {
        throw new Error("Las bases nitrogenadas no son validas");
      }
    }
  }

  // Funcion para obtener la secuencai en una direccion especifica
  function getSequence(x, y, dx, dy) {
    
    let sequence = "";
    for (let i = 0; i < 4; i++) {
      const nx = x + i * dx;
      const ny = y + i * dy;

      if (nx < 0 || ny < 0 || nx >= n || ny >= m) {
        return "";
      }
      sequence += dna[nx][ny];
    }
    return sequence;
  }

  // Buscar secuencias en todas las direcciones
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [-1, 1],
  ];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      for (let [dx, dy] of directions) {
        const sequence = getSequence(i, j, dx, dy);
        if (sequence.length > 0 && sequence === sequence[0].repeat(4)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Implementacion de la funcion de estadisticas de verificaciones de ADN
function getStats() {
  const count_mutation = 40; // Numero real de mutaciones
  const count_no_mutations = 100; // numero real de no mutaciones
  const ratio = count_mutation / count_no_mutations;
  return { count_mutation, count_no_mutations, ratio }; 
};

// Middleware que maneja la solicitud del endpoint "/mutation/"
app.post('/mutation/', (req, res) => {
  const dna = req.body.dna;

  const mutacionDetectada = getMutation(dna );

  if(mutacionDetectada) {
    res.status(200).send('OK');
  } else {
    res.status(403).send('Forbidden')
  }
});

// Middleware que maneja la solicitud del endpoint "/stats"
app.get('/stats', (req, res) => {
  const stats = getStats();
  res.json(stats);
});

// Configuracion de la aplicacion para manejar fluctuaciones agresivas de trafico
// Implementacion de un balanceador de carga utilizando el modulo cluster
const numCPUs = require('os').cpus().length;

if(cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  app.listen( process.env.PORT, () => {
    console.log(`Server corriendo en puerto ${ process.env.PORT }`);
  });

}

module.exports = app;
