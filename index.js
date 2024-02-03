const {
  default: makeWASocket,
  MessageType,
  MessageOptions,
  Mimetype,
  DisconnectReason,
  BufferJSON,
  AnyMessageContent,
  delay,
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
const { manejarRespuestas } = require('./respuestas');
const fs = require('fs');
const guardarConversacion = require('./guardarConversacion');

let sock;
let qrDinamic;
let session;

async function connectToWhatsApp() {
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
    const shouldReconnect =
      lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
    console.log(`se desconecto whatsapp`);

    if(shouldReconnect){
      connectToWhatsApp();
    }

}
  if(connection === "open"){
    console.log("conexión abierta");
  }
});
  // este codigo es el que recibe los mensajes
  const timers = {};
  // Escuchar el evento de respuesta automática enviada
  sock.ev.on("respuestaAutomaticaEnviada", ({ numberWa }) => {
      // Verificar si hay un temporizador existente y cancelarlo
      if (timers[numberWa]) {
          clearTimeout(timers[numberWa]);
          delete timers[numberWa];
      }
  });
  const numberEmcargado = getNumberEmcargado();

    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if(type === "notify"){
            const m = messages[0];


            if (!m.message) return;
          const messageType = Object.keys(m.message)[0];

          if(!messages[0]?.key.fromMe){

              let mensajeEntrante;
            let contexto;

            switch (messageType) {
                case 'imageMessage':
                    mensajeEntrante = m.message.imageMessage.caption || '';
                    break;
                case 'documentMessage':
                const documentMessage = m.message.documentMessage;
                mensajeEntrante = 'Recibido un documento:', documentMessage;
                // Extrae la información necesaria para descargar el archivo
               /* const { directPath, url, mediaKey, mimetype, fileLength } = documentMessage;

                // Ahora necesitas descargar el archivo, ver el paso siguiente
                await descargarArchivo(directPath, mediaKey, mimetype, fileLength, url); // Esta función necesita ser implementada
              */
                break;
                case 'conversation':
                    mensajeEntrante = m.message.conversation || '';
                    break;
                case 'extendedTextMessage':
                mensajeEntrante = m.message?.extendedTextMessage?.text || '';
                contexto = m.message.extendedTextMessage.contextInfo.body;
                //console.log(contexto);
                if(mensajeEntrante == "Vi esto en Facebook..."){
                  console.log(contexto);
                }
                    break;
                default:
                    mensajeEntrante = '';
                    break;
            }


              const numberWa = m.key.remoteJid;
            console.log("mensaje de: "+ numberWa + " : " + mensajeEntrante +" mensajetipo: " + messageType);
            guardarConversacion({ persona: numberWa, tipoMensaje: "recibido", contenidoMensaje: mensajeEntrante });

            //este es el timer de los mensajes
            const horaActual = new Date().getHours();
            if((horaActual >= 12 && horaActual < 23) || (horaActual >= 0 && horaActual < 1)){
              if (!timers[numberWa]){

            timers[numberWa] = setTimeout(() => {
                //console.log(`¡No se ha contestado el mensaje de ${numberWa} en 5 minutos!`);
              const numeroCliente = formatearNumeroTelefono(numberWa);
              //envia mensaje a encargado de que conteste
              sock.sendMessage(numberEmcargado, { text: `¡No se ha contestado el mensaje de ${numeroCliente} en 10 minutos!` });
            }, 10 * 60 * 1000);
              }
              }

            // Aquí se meten las respuestas automáticas que están en el archivo respuestas.js
             await delay(5000);
             await manejarRespuestas({ mensajeEntrante, numberWa, messages, sock });
          }else{
            // esta parte muestra los que yo envio
            let mensajeSaliente;
            switch (messageType) {
                case 'conversation':

                mensajeSaliente = m.message.conversation || '';
                    break;
                case 'extendedTextMessage':
                  mensajeSaliente = m.message?.extendedTextMessage?.text || '';

                    break;
                default:
                      mensajeSaliente = '';
                    break;
            }

              const numberWa = messages[0]?.key?.remoteJid;

              console.log("mensaje para: "+ numberWa + " : " + mensajeSaliente +" mensajetipo: " + messageType);
            guardarConversacion({ persona: numberWa, tipoMensaje: "enviado", contenidoMensaje: mensajeSaliente });

            if (timers[numberWa]){
              clearTimeout(timers[numberWa]);
              delete timers[numberWa];
            }


          }



        }
    });

  // hasta qui termina el codigo que recibe los mensajes
  sock.ev.on("creds.update", saveCreds);
}

// Call the function to connect to WhatsApp
connectToWhatsApp();

// funcion que da formato normal al telefono
function formatearNumeroTelefono(numeroCompleto) {
    // Suponemos que el formato es "5213331875581@s.whatsapp.net"
    const partes = numeroCompleto.split('@')[0].split(''); // Dividir y eliminar la parte después de '@'
    //partes.shift(); // Eliminar el primer dígito "5"
    return partes.join(''); // Unir las partes restantes para obtener "5213331875581"
}

function getNumberEmcargado() {
  const currentHour = new Date().getHours();

  if (currentHour >= 12 && currentHour < 19) {
    return "5213312494578@s.whatsapp.net";
  } else if ((currentHour >= 20) || (currentHour >= 0 && currentHour < 1)){
    return "5213331875581@s.whatsapp.net";
  } else {
    // Fuera del horario definido, puedes manejar este caso según tus necesidades
    return "Fuera del horario";
  }
}
