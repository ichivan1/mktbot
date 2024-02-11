// respuestas.js
// las respuestas tienen un tiempo de espera de 5 segundos
const { delay } = require("@whiskeysockets/baileys");;
const guardarConversacion = require('./guardarConversacion');
const fs = require('fs');
// esto es para el envio de archivo historial
const filePath = 'historialconversacion.json';
const fileBuffer = fs.readFileSync(filePath);
const handlePostalCodeLookup = require('./buscarcp');
// crea un estado para esperar una respuesta especifica
const comandos = {};
const cp = {};

const manejarRespuestas = async ({ mensajeEntrante, numberWa, messages, sock }) => {
  // Primero, verificar si hay un comando pendiente para este número
  if (cp[numberWa]) {
      handlePostalCodeLookup({mensajeEntrante, numberWa, sock});
      delete cp[numberWa]; // Limpiar estado
  }

  if (comandos[numberWa]) {
      // Si el comando es 'xls' y esperamos una respuesta
    switch (mensajeEntrante) {
      case 'Historial':
          await sock.sendMessage(numberWa, { document: fileBuffer, mimetype: 'application/json', fileName: "historialconversacion.json" });
          delete comandos[numberWa]; // Limpiar después de responder
          break;

      case 'Borrar':
          eliminarArchivo(filePath);
          await sock.sendMessage(numberWa, { text: "Se borró el historial de conversaciones." });
          delete comandos[numberWa]; // Limpiar después de responder
          break;

      case 'Hora':
          const horaActual = hora(); // Llama a tu función hora()
          await sock.sendMessage(numberWa, { text: `La hora actual es: ${horaActual}` });
          delete comandos[numberWa]; // Limpiar después de responder
          break;

      default:
          // Opcional: manejar cualquier otro caso o comando no reconocido
          break;
    }

    return; // Salir después de manejar la respuesta

  }
    
  switch (mensajeEntrante) {
      case "¿Me podrias dar mas informacion para ser distribuidora?":
      case "¿Como puedo ser distribuidora?":
      await sock.sendMessage(numberWa, { text: "Hola 😊" }, { quoted: messages[0] });
              await delay(3000);
              await sock.sendMessage(numberWa, { text: "en el siguiente enlace puedes acceder al video que da toda la informacion que necesitas para ser distribuidora https://productosafrodita.com/pages/distribuidoras-informacion" });

              console.log("mensaje bot para: "+ numberWa + " : " + "hola, en el siguiente enlace puedes acceder al video que da toda la informacion que necesitas para ser distribuidora https://productosafrodita.com/pages/distribuidoras-informacion");

      guardarConversacion({ persona: numberWa, tipoMensaje: "enviado", contenidoMensaje: "hola, en el siguiente enlace puedes acceder al video que da toda la informacion que necesitas para ser distribuidora https://productosafrodita.com/pages/distribuidoras-informacion" });

       sock.ev.emit("respuestaAutomaticaEnviada", { numberWa });
      break;
      case "xls":
      // Aquí configuramos el estado para esperar una respuesta a este comando
      comandos[numberWa] = 'esperando respuesta de xls';
      await sock.sendMessage(numberWa, { text: "Ingresa comando" }, { quoted: messages[0] });
      break;
        case "hola":
        await sock.sendMessage(numberWa, { text: "Hola 😊" }, { quoted: messages[0] });
                await delay(3000);
                await sock.sendMessage(numberWa, { text: "Como podemos ayudarte?" });

                console.log("mensaje bot para: "+ numberWa + " : " + "hola, como podemos ayudarte?");
         
        guardarConversacion({ persona: numberWa, tipoMensaje: "enviado", contenidoMensaje: "hola, como podemos ayudarte?" });

         sock.ev.emit("respuestaAutomaticaEnviada", { numberWa });
        break;  
        
      case "Hola":
        await sock.sendMessage(numberWa, { text: "Hola" }, { quoted: messages[0] });
        await delay(3000);
        await sock.sendMessage(numberWa, { text: "Como podemos ayudarte?" });

        console.log("mensaje bot para: "+ numberWa + " : " + "hola, como podemos ayudarte?");

        guardarConversacion({ persona: numberWa, tipoMensaje: "enviado", contenidoMensaje: "hola, como podemos ayudarte?" });
         sock.ev.emit("respuestaAutomaticaEnviada", { numberWa });
break;
        
      case "¿Qué métodos de entrega hay disponibles?":
        await sock.sendMessage(numberWa, { text: "Hola 😊" });
        await delay(3000);
            await sock.sendMessage(numberWa, { text: "Los metodos de pago y entrega cambian segun la zona" });
        await delay(3000);
        await sock.sendMessage(numberWa, { text: "me podrias proporcionar tu codigo postal para revisar la informacion de tu zona?" });

        console.log("mensaje bot para: "+ numberWa + " : " + "Los metodos de pago y entrega cambian segun la zona me podrias proporcionar tu codigo postal para revisar la informacion de tu zona?");

        guardarConversacion({ persona: numberWa, tipoMensaje: "enviado", contenidoMensaje: "Los metodos de pago y entrega cambian segun la zona me podrias proporcionar tu codigo postal para revisar la informacion de tu zona?"});
        
         sock.ev.emit("respuestaAutomaticaEnviada", { numberWa });
      cp[numberWa] = 'esperando respuesta de codigo postal';
            break;
        
      case "¿Puedo saber el precio del Kit Cremas Desmanchadora y Nutrtitiva Antiedad?":
        await sock.sendMessage(numberWa, { text: "Hola 😊" });
        await delay(3000);
            await sock.sendMessage(numberWa, { text: "El Kit Cremas Desmanchadora y Nutritiva AntiEdad tiene un Valor de 620 y de momento el envio es GRATIS" });

        console.log("mensaje bot para: "+ numberWa + " : " + "hola, El Kit Cremas Desmanchadora y Nutritiva AntiEdad tiene un Valor de 620 y de momento el envio es GRATIS");

        guardarConversacion({ persona: numberWa, tipoMensaje: "enviado", contenidoMensaje: "hola, El Kit Cremas Desmanchadora y Nutritiva AntiEdad tiene un Valor de 620 y de momento el envio es GRATIS" });
         sock.ev.emit("respuestaAutomaticaEnviada", { numberWa });
            break;

        case "¿Puedo realizar una compra?":
            await sock.sendMessage(numberWa, { text: "Claro que si" }, { quoted: messages[0] });
        await delay(3000);
        
         await sock.sendMessage(numberWa, { text: "Tienes alguna duda antes de realizar tu pedido?" });

        console.log("mensaje bot para: "+ numberWa + " : " + "Claro que si, Tienes alguna duda antes de realizar tu pedido?");

        guardarConversacion({ persona: numberWa, tipoMensaje: "enviado", contenidoMensaje: "Claro que si, Tienes alguna duda antes de realizar tu pedido?"});
         sock.ev.emit("respuestaAutomaticaEnviada", { numberWa });
            break;
      case "¿Puedo saber el precio del Kit Antiedad?":
              await sock.sendMessage(numberWa, { text: "Hola 😄" });
              await delay(3000);
              await sock.sendMessage(numberWa, { text: "El Kit Anti-edad tiene un valor de 635 y el envío es GRATIS.\nEste paquete contiene 2 productos que combina sus potentes activos para mejorar la apariencia de tu piel." });

              console.log("mensaje bot para: "+ numberWa + " : " + "hola, El Kit Anti-edad tiene un valor de 635 y el envío es GRATIS.\nEste paquete contiene 2 productos que combina sus potentes activos para mejorar la apariencia de tu piel.");

              guardarConversacion({ persona: numberWa, tipoMensaje: "enviado", contenidoMensaje: "hola, El Kit Anti-edad tiene un valor de 635 y el envío es GRATIS.\nEste paquete contiene 2 productos que combina sus potentes activos para mejorar la apariencia de tu piel." });
               sock.ev.emit("respuestaAutomaticaEnviada", { numberWa });
      break;
        // Puedes agregar más casos según tus necesidades
        default:
            // Caso predeterminado si no hay coincidencia
            break;
    }
};
// funcion hora
function hora(){
  const horaActual = new Date().getHours();
  return horaActual;
}

// funcion elimina archivos
function eliminarArchivo(rutaDelArchivo) {
  fs.unlink(rutaDelArchivo, (err) => {
    if (err) {
      console.error("Error al eliminar el archivo:", err);
      return;
    }
    console.log("Archivo eliminado con éxito:", rutaDelArchivo);
  });
}

// funcion buscar codigos postales

async function searchPostalCode(postalCode) {
    try {
        const data = await fs.readFile('codigos_cdmx.json', 'utf8'); // Read the file asynchronously
        const postalCodes = JSON.parse(data); // Parse the JSON string into an object
        const result = postalCodes.find(pc => pc.postal_code === postalCode); // Search for the postal code
        return result || null; // Return the found object or null if not found
    } catch (error) {
        console.error(`Error reading or parsing the file: ${error}`);
        return null; // Return null in case of error
    }
}



module.exports = { manejarRespuestas };
