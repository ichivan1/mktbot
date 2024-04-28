const fs = require('fs');

/////////////////////////////////////////////
const {
  default: makeWASocket,
  MessageType,
  MessageOptions,
  Mimetype,
  DisconnectReason,
  BufferJSON,
  AnyMessageContent,
  fetchLatestBaileysVersion,
  isJidBroadcast,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  MessageRetryMap,
  useMultiFileAuthState,
  msgRetryCounterMap,
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const log = (pino = require("pino"));


// Aquí colocas tu código principal donde tienes el resto de la lógica
// En algún lugar de tu código principal, llama a la función enviarMensajesAutomaticos()

// Por ejemplo:
// enviarMensajesAutomaticos();

let con = 1;
let sock;
let qrDinamic;
let session;
//paea whats
async function iniwa(campaña) {
const { state, saveCreds } = await useMultiFileAuthState("session_auth_info");

sock = makeWASocket({
  printQRInTerminal: true,
  auth: state,
  markOnlineOnConnect: false,
  logger: log({ level: "silent" }),

});

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    qrDinamic = qr;
    if (connection === "close") {
      let reason = new Boom(lastDisconnect.error).output.statusCode;
      if (reason === DisconnectReason.badSession) {
        console.log(
          `Bad Session File, Please Delete ${session} and Scan Again`
        );
        sock.logout();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("Conexión cerrada, reconectando....");
        connectToWhatsApp();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log("Conexión perdida del servidor, reconectando...");
        connectToWhatsApp();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(
          "Conexión reemplazada, otra nueva sesión abierta, cierre la sesión actual primero"
        );
        sock.logout();
      } else if (reason === DisconnectReason.loggedOut) {
        console.log(
          `Dispositivo cerrado, elimínelo ${session} y escanear de nuevo.`
        );
        sock.logout();
      } else if (reason === DisconnectReason.restartRequired) {
        console.log("Se requiere reinicio, reiniciando...");
        connectToWhatsApp();
      } else if (reason === DisconnectReason.timedOut) {
        console.log("Se agotó el tiempo de conexión, conectando...");
        connectToWhatsApp();
      } else {
        sock.end(
          `Motivo de desconexión desconocido: ${reason}|${lastDisconnect.error}`
        );
      }
    } else if (connection === "open") {
      console.log("conexión abierta");
      //haver que pasa
      enviarMensajesAutomaticos(campaña)
      //


      
    }
    
  });


  sock.ev.on("creds.update", saveCreds);
}



///////////////////////////////////////////

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// funcion para modificar botones al terminar
function modificarEstadoBotones(campaña) {
    // Ruta al archivo estado_botones.json
    const rutaArchivo = 'estado_botones.json';

    // Lee el contenido del archivo
    fs.readFile(rutaArchivo, 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return;
        }

        try {
            // Convierte el contenido del archivo a un objeto JavaScript
            const estadoBotones = JSON.parse(data);

            // Verifica si la campaña existe en el objeto
            if (estadoBotones.hasOwnProperty(campaña)) {
                // Modifica el valor de la campaña
                estadoBotones[campaña] = 'detenido';

                // Escribe los cambios de vuelta al archivo
                fs.writeFile(rutaArchivo, JSON.stringify(estadoBotones), 'utf8', (err) => {
                    if (err) {
                        console.error('Error al escribir en el archivo:', err);
                    } else {
                        console.log('Estado de la campaña actualizado correctamente.');
                    }
                });
            } else {
                console.log('La campaña especificada no existe en el archivo.');
            }
        } catch (error) {
            console.error('Error al analizar el contenido del archivo:', error);
        }
    });
}


// funcion obtener mensaje
function obtenerMensajePorCampaña(campaña) {
    // Lee el contenido del archivo registro.json
    const contenidoArchivo = fs.readFileSync('registro.json', 'utf8');

    // Convierte el contenido del archivo a un array de objetos JavaScript
    const registros = JSON.parse(contenidoArchivo);

    // Busca el registro con la campaña correspondiente
    const registroEncontrado = registros.find(registro => registro.campaña === campaña);

    // Si se encuentra un registro con la campaña correspondiente, retorna el mensaje
    // de lo contrario, retorna null o algún otro valor predeterminado según lo desees
    if (registroEncontrado) {
        return registroEncontrado.mensaje;
    } else {
        return null; // O puedes devolver un mensaje de error u otro valor según tu necesidad
    }
}


// Objeto para almacenar el estado de ejecución de cada campaña
const ejecucionActivaPorCampaña = {};

// Función para iniciar la ejecución de una campaña
async function iniciarEjecucionCampaña(campaña) {
    ejecucionActivaPorCampaña[campaña] = true;
    //await enviarMensajesAutomaticos(campaña);
    await iniwa(campaña);
}

// Función para detener la ejecución de una campaña
function detenerEjecucion(campaña) {
    // Marcar la ejecución de la campaña como inactiva
    ejecucionActivaPorCampaña[campaña] = false;
}

async function enviarMensajesAutomaticos(campaña) {
    ejecucionActivaPorCampaña[campaña] = true;
  
    try {
        const data = fs.readFileSync(`uploads/${campaña}.json`, 'utf8');
        let listaNumeros = JSON.parse(data);

        for (let i = 0; i < listaNumeros.length; i++) {
            if (!ejecucionActivaPorCampaña[campaña]) {
                console.log(`Ejecución de campaña ${campaña} detenida por solicitud del usuario.`);
              await sock.end(new Error("closed by user"))
              // meter sock end
                return;
            }
          const mensaje = obtenerMensajePorCampaña(campaña);
          if (listaNumeros[i].estatus === "espera") { // Solo enviar mensajes si el estado es "espera"
              const numero = listaNumeros[i].numero;
            //await enviarMensaje(numero,campaña);
            await sock.sendMessage(numero, { text: mensaje });
            console.log(`Se envió mensaje ${mensaje} al número: ${numero}`);

                listaNumeros[i].estatus = "enviado";
                listaNumeros[i].fecha_envio = obtenerFechaActual();

                fs.writeFileSync(`uploads/${campaña}.json`, JSON.stringify(listaNumeros, null, 2));

                await delay(20000);
            }
        }

        console.log(`Mensajes automáticos para la campaña ${campaña} enviados con éxito.`);
    } catch (err) {
        console.error(`Error al enviar mensajes automáticos para la campaña ${campaña}:`, err);
    } finally {
       await modificarEstadoBotones(campaña);
        ejecucionActivaPorCampaña[campaña] = false;
      await sock.end(new Error("closed by user"));
    }
}






function obtenerFechaActual() {
    const now = new Date();
    const year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    let hour = now.getHours();
    let minute = now.getMinutes();
    let second = now.getSeconds();

    // Ajustar el formato de la fecha y hora si es necesario (agregar ceros a la izquierda)
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    hour = hour < 10 ? '0' + hour : hour;
    minute = minute < 10 ? '0' + minute : minute;
    second = second < 10 ? '0' + second : second;

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

module.exports = {
    iniciarEjecucionCampaña,
    detenerEjecucion,
  obtenerMensajePorCampaña
};
