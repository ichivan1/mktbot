const fs = require('fs');

// Función para guardar la conversación en un archivo JSON


const guardarConversacion = ({ persona, tipoMensaje, contenidoMensaje }) => {
    const nombreArchivo = 'historialconversacion.json';

    // Lee el archivo existente o crea uno nuevo si no existe
    let conversacionesGuardadas = [];
    try {
        const archivoExistente = fs.readFileSync(nombreArchivo, 'utf8');
        conversacionesGuardadas = JSON.parse(archivoExistente);
    } catch (error) {
        // Si el archivo no existe o está vacío, no hace nada
    }

    // Busca el chat actual en las conversaciones guardadas
    const chatExistente = conversacionesGuardadas.find(chat => chat.persona === persona);

    // Obtén la fecha y hora actual
    const fechaHoraActual = new Date().toISOString();

    // Crea el objeto de mensaje
    const mensaje = {
        tipo: tipoMensaje,
        contenido: contenidoMensaje,
        fecha_hora: fechaHoraActual
    };

    // Si no existe un chat con la persona, crea uno nuevo
    if (!chatExistente) {
        const nuevoChat = {
            persona: persona,
            mensajes: [mensaje]
        };

        // Agrega el nuevo chat al array de conversaciones guardadas
        conversacionesGuardadas.push(nuevoChat);
    } else {
        // Si el chat ya existe, agrega el mensaje al array de mensajes del chat
        chatExistente.mensajes.push(mensaje);
    }

    // Escribe la conversación actualizada en el archivo JSON
    fs.writeFileSync(nombreArchivo, JSON.stringify(conversacionesGuardadas, null, 2), 'utf8');
};
module.exports = guardarConversacion;