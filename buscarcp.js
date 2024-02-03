// searchPostalCode.js
const fs = require('fs').promises;
const guardarConversacion = require('./guardarConversacion');

async function searchPostalCode(postalCode) {
    try {
        const data = await fs.readFile('codigos_postales_cdmx.json', 'utf8');
        const postalCodes = JSON.parse(data);
        return postalCodes.find(pc => pc.postal_code === parseInt(postalCode, 10)) || null;
    } catch (error) {
        console.error(`Error reading or parsing the file: ${error}`);
        return null;
    }
}

// handleMessages.js

async function handlePostalCodeLookup({ mensajeEntrante, numberWa, sock }) {
  let rpositiva ="El envío es express🛵(se te puede entregar de 24 a 48 horas al día siguiente de realizar el pedido)\n\nEl método de pago💰 disponible es\n\n✅ Tarjeta de crédito o débito  💳\n✅ Transferencia  📥🧾\n✅ Mercado pago o tiendas de \n      conveniencia  ( por ejemplo \n      Oxxo) 🤩\n✅ Efectivo al momento de la \n      entrega  😀";
    const result = await searchPostalCode(mensajeEntrante);
  console.log(result+"---"+ mensajeEntrante);
    if (result) {
        // Enviar mensaje de éxito
        await sock.sendMessage(numberWa, {
            text: rpositiva
        });
      console.log(rpositiva);

      guardarConversacion({ persona: numberWa, tipoMensaje: "enviado", contenidoMensaje: rpositiva });

       sock.ev.emit("respuestaAutomaticaEnviada", { numberWa });
    } else {
        // Enviar mensaje de fallo
        console.log(`Postal code ${mensajeEntrante} not found.`);
    }
}

module.exports = handlePostalCodeLookup;
