// respuestas.js
// las respuestas tienen un tiempo de espera de 5 segundos
const { delay } = require("@whiskeysockets/baileys");;
const guardarConversacion = require('./guardarConversacion');


const manejarRespuestas = async ({ mensajeEntrante, numberWa, messages, sock }) => {
    switch (mensajeEntrante) {
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
            break;
        
      case "¿Puedo saber el precio del Kit Cremas Desmanchadora y Nutritiva Antiedad?":
        await sock.sendMessage(numberWa, { text: "Hola 😊" });
        await delay(3000);
            await sock.sendMessage(numberWa, { text: "El Kit Cremas Desmanchadora y Nutritiva AntiEdad tiene un Valor de 620 y de momento el envio es GRATIS" });

        console.log("mensaje bot para: "+ numberWa + " : " + "ho la, El Kit Cremas Desmanchadora y Nutritiva AntiEdad tiene un Valor de 620 y de momento el envio es GRATIS");

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
        // Puedes agregar más casos según tus necesidades
        default:
            // Caso predeterminado si no hay coincidencia
            break;
    }
};

module.exports = { manejarRespuestas };
