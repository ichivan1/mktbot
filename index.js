
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const path = require('path');
const { generarTablaHTML } = require('./visual.js');
const {iniciarEjecucionCampaña, detenerEjecucion} = require('./automa.js');

//para el html
// funcion para actualizar registros
function actualizarRegistros() {
    // Leer el archivo registro.json
    const registroPath = path.join(__dirname, 'registro.json');

    // Verificar si el archivo existe
    if (fs.existsSync(registroPath)) {
        const registros = JSON.parse(fs.readFileSync(registroPath, 'utf8'));

        // Iterar sobre cada registro
        registros.forEach(registro => {
            // Obtener el nombre de la campaña
            const campaña = registro.campaña;

            // Construir la ruta del archivo de la campaña
            const campañaPath = path.join(__dirname, `uploads/${campaña}.json`);

            // Verificar si el archivo de la campaña existe
            if (fs.existsSync(campañaPath)) {
                // Leer el archivo de la campaña
                const campañaPreData = fs.readFileSync(campañaPath, 'utf8');

                // Verificar si el archivo de la campaña no está vacío
                if (campañaPreData.trim() !== '') {
                    const campañaData = JSON.parse(campañaPreData);

                    // Contar el número de registros totales
                    registro.registros_totales = campañaData.length;

                    // Contar el número de registros en espera
                    registro.registros_en_espera = campañaData.filter(objeto => objeto.estatus === 'espera').length;
                } else {
                    console.error(`El archivo '${campaña}.json' está vacío.`);
                }
            } else {
                console.error(`El archivo '${campaña}.json' no existe.`);
            }
        });

        // Escribir los registros actualizados de vuelta al archivo registro.json
        fs.writeFileSync(registroPath, JSON.stringify(registros, null, 2));
    } else {
        console.error("El archivo 'registro.json' no existe o está vacío.");
    }
}



// aqui termina la funcion de actualizar registros
// funcion de formato de archivo nuevo
const agregarPropiedades = (file, campaignName) => {
  try {
    // Leer el archivo JSON cargado
    const jsonData = fs.readFileSync(file.path, 'utf8');
    const data = JSON.parse(jsonData);

    // Agregar las propiedades adicionales a cada objeto del arreglo
    const newData = data.map(item => ({
      numero: item.numero,
      estatus: 'espera',
      fecha_envio: ''
    }));

    // Nombre del nuevo archivo basado en campaignName
    const newFileName = `${campaignName}.json`;
    const newFilePath = `${uploadDirectory}/${newFileName}`;

    // Guardar el nuevo archivo JSON
    fs.writeFileSync(newFilePath, JSON.stringify(newData, null, 2));

    // Eliminar el archivo original
    fs.unlinkSync(file.path);

    // Devolver la ruta del nuevo archivo JSON generado
    return newFilePath;
  } catch (error) {
    console.error('Error al procesar el archivo JSON:', error);
    return null;
  }
};

// aqui termina funcion de formato de archivo nuevo
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

const uploadDirectory = 'uploads';
const registroPath = 'registro.json';

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/upload', (req, res) => {
  res.redirect('/');
});

app.get('/registro.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'registro.html'));
});
//aqui empieza funcion agregar
// Configura body-parser para analizar solicitudes con tipo de contenido application/json
app.use(bodyParser.json());
app.post('/agregar', upload.single('json'), async (req, res) => {
    const nombreCampaña = req.body.nombre;
    const archivoJSON = req.file;

    if (!nombreCampaña || !archivoJSON) {
        return res.status(400).send('Error: Falta el nombre de la campaña o el archivo JSON');
    }

    // Leer el archivo cargado y mostrar en consola
    const contenidoCargado = fs.readFileSync(archivoJSON.path, 'utf8');
    const numeros = JSON.parse(contenidoCargado).map(item => {
        return {
            numero: item.numero,
            estatus: 'espera',
            fecha_envio: ''
        };
    });

    const filePath = `uploads/${nombreCampaña}.json`;
    let contenidoArray = [];
    try {
        const contenidoJSON = fs.readFileSync(filePath, 'utf8');
        contenidoArray = JSON.parse(contenidoJSON);
    } catch (err) {
        console.error('Error al leer el archivo JSON:', err);
    }

    function numeroExiste(numero) {
        return contenidoArray.some(objeto => objeto.numero === numero);
    }

    numeros.forEach(nuevoNumero => {
        if (!numeroExiste(nuevoNumero.numero)) {
            contenidoArray.push(nuevoNumero);
            console.log("Objeto agregado correctamente:", nuevoNumero);
        } else {
            console.log("El objeto ya existe en el registro. No se agregó:", nuevoNumero);
        }
    });

    console.log("Contenido del archivo JSON después de la operación:", contenidoArray);

    try {
        await new Promise((resolve, reject) => {
            fs.writeFile(filePath, JSON.stringify(contenidoArray), (err) => {
                if (err) {
                    console.error('Error al escribir en el archivo JSON:', err);
                    reject(err);
                } else {
                    console.log('Contenido actualizado correctamente en el archivo JSON.');
                    resolve();
                }
            });
        });

        await new Promise((resolve, reject) => {
            fs.unlink(archivoJSON.path, (err) => {
                if (err) {
                    console.error('Error al eliminar el archivo cargado:', err);
                    reject(err);
                } else {
                    console.log('Archivo cargado eliminado correctamente.');
                    resolve();
                }
            });
        });

        // Llamar a las funciones después de que las operaciones asíncronas hayan terminado
        await actualizarRegistros();
        await generarTablaHTML();

      // Después de que todas las operaciones sean exitosas
      res.status(200).json({ redirectTo: '/registro.html' });

    } catch (error) {
        console.error('Error en la operación asíncrona:', error);
        res.status(500).send('Error interno del servidor');
    }
});

//aqui termina funcion agregar


app.post('/upload', upload.single('file'), (req, res) => {
  const { campaignName, message, formSubmitTime } = req.body;
  const file = req.file;

  let registro = [];
  if (fs.existsSync(registroPath)) {
    const registroData = fs.readFileSync(registroPath);
    registro = JSON.parse(registroData);
  }

  const nuevoRegistro = {
    campaña: campaignName,
    'fecha ultimos registros': formSubmitTime,
    'registros_totales': registro.length + 1,
    registros_en_espera: 0,
    mensaje: message
  };

  registro.push(nuevoRegistro);

  fs.writeFileSync(registroPath, JSON.stringify(registro, null, 2));
  const newFilePath = agregarPropiedades(file, campaignName);


     if (newFilePath) {
       // Si se generó el nuevo archivo, imprimir la ruta en la consola
       console.log('Nuevo archivo JSON generado:', newFilePath);
     } else {
       console.log('No se pudo generar el nuevo archivo JSON.');
     }

  //res.send('¡Archivo subido exitosamente!');
  actualizarRegistros();
  generarTablaHTML();
  res.redirect('/');

  });

// aqui es el codigo del enpoint de comenzar y una funcion esxtra
// Endpoint para comenzar una campaña

app.post('/comenzar', (req, res) => {
    const campaña = req.body.nombre;

    // Llama a la función comenzar con el nombre de la campaña recibida
    comenzar(campaña);

    res.send('Campaña iniciada: ' + campaña);
});

// Función para comenzar la campaña (similar a como la tenías)

async function comenzar(campaña) {
    // Realiza las operaciones necesarias
    console.log('Comenzar ' + campaña);
  
  
  await iniciarEjecucionCampaña(campaña);
  await actualizarRegistros();
  await generarTablaHTML();
}
// aqui termina lo necesario de la funcion comenzar
/////////////////////////


//aqui comienza el codigo del endpoint para detener la campaña
app.post('/detener', (req, res) => {
    const campaña = req.body.nombre;

    // Llama a la función comenzar con el nombre de la campaña recibida
      detener(campaña);

    res.send('Campaña detenida: ' + campaña);
});

// Función para comenzar la campaña (similar a como la tenías)


async function detener(campaña) {
    // Realiza las operaciones necesarias
    console.log('detener ' + campaña);
  await detenerEjecucion(campaña);
  await actualizarRegistros();
  await generarTablaHTML();
}
// aqui termina el codigo endpoin para detener campaña
//////////////////////////////


// aqui empieza funcion de los endpoints para los botones
// Ruta para guardar el estado de los botones en un archivo JSON
app.post('/guardar_estado', (req, res) => {
    const { campaña, estado } = req.body;
    const estadoBotonesPath = 'estado_botones.json';

    try {
        let estadoBotones = {};

        // Verificar si el archivo existe
        if (fs.existsSync(estadoBotonesPath)) {
            // Leer el archivo JSON existente si hay datos
            const data = fs.readFileSync(estadoBotonesPath, 'utf8');
            // Intentar parsear los datos del archivo
            try {
                estadoBotones = JSON.parse(data);
            } catch (parseError) {
                console.error('Error al parsear el archivo JSON:', parseError);
            }
        }

        // Verificar si el objeto estadoBotones está vacío
        if (Object.keys(estadoBotones).length === 0) {
            // Si el objeto estadoBotones está vacío, crear la información que se va a guardar
            estadoBotones = {
                [campaña]: estado
            };
        } else {
            // Si el objeto estadoBotones no está vacío, actualizar el estado para la campaña especificada
            estadoBotones[campaña] = estado;
        }

        // Escribir los cambios en el archivo JSON
        fs.writeFileSync(estadoBotonesPath, JSON.stringify(estadoBotones));

        res.send('Estado de botones guardado correctamente');
    } catch (error) {
        console.error('Error al guardar el estado de los botones:', error);
        res.status(500).send('Error al guardar el estado de los botones');
    }
});


// Ruta para recuperar el estado de los botones desde el archivo JSON
// Ruta para recuperar el estado de los botones desde el archivo JSON
app.get('/recuperar_estado', (req, res) => {
    const estadoBotonesPath = 'estado_botones.json';

    try {
        let estadoBotones = {};

        // Verificar si el archivo existe y no está vacío
        if (fs.existsSync(estadoBotonesPath) && fs.statSync(estadoBotonesPath).size > 0) {
            const data = fs.readFileSync(estadoBotonesPath, 'utf8');
            estadoBotones = JSON.parse(data);
        }

        res.json(estadoBotones);
    } catch (error) {
        console.error('Error al recuperar el estado de los botones:', error);
        res.status(500).send('Error al recuperar el estado de los botones');
    }
});

// aqui termina el codigo de los estados de botones
/////////////////////////////////


//actualizarRegistros();
//generarTablaHTML();
app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});


//aqui termina html


// Call the function to connect to WhatsApp

//connectToWhatsApp();

