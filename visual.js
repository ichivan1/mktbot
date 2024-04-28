const fs = require('fs');

                function generarTablaHTML() {
                  // Lee el contenido del archivo registro.json
                  fs.readFile('registro.json', 'utf8', (err, data) => {
                      if (err) {
                          console.error('Error al leer el archivo:', err);
                          return;
                      }

                      try {
                          // Parsea el contenido JSON
                          const registros = JSON.parse(data);

                          // Crea la tabla HTML
                          let tablaHTML = `
                      <table border="1">
                        <tr>
                          <th>Campaña</th>
                          <th>Fecha Últimos Registros</th>
                          <th>Registros Totales</th>
                          <th>Registros en Espera</th>
                          <th>Mensaje</th>
                          <th>Acciones</th>
                        </tr>
                    `;

                          // Itera sobre cada registro y agrega una fila a la tabla HTML
                          registros.forEach(registro => {
                              tablaHTML += `
                        <tr>
                          <td>${registro.campaña}</td>
                          <td>${registro["fecha ultimos registros"]}</td>
                          <td>${registro["registros_totales"]}</td>
                          <td>${registro["registros_en_espera"]}</td>
                          <td>${registro.mensaje}</td>
                          <td>
                            <button id="comenzarBtn${registro.campaña}" onclick="comenzar('${registro.campaña}')">Comenzar</button>
<button id="detenerBtn${registro.campaña}" style="display: none;" onclick="detener('${registro.campaña}')">Detener</button>
<button id="agregarBtn${registro.campaña}" onclick="agregar('${registro.campaña}')">Agregar</button>

                          </td>
                        </tr>
                      `;
                          });

                          tablaHTML += `</table>`;

                          // Agregar funciones de los botones
                          tablaHTML += `
                      <script>
                      function guardarEstadoBotones(campaña, estado) {
                          fetch('/guardar_estado', {
                              method: 'POST',
                              headers: {
                                  'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({ campaña: campaña, estado: estado })
                          })
                          .then(response => {
                              if (!response.ok) {
                                  throw new Error('Error al guardar el estado de los botones');
                              }
                              return response.text();
                          })
                          .catch(error => {
                              console.error('Error al guardar el estado de los botones:', error);
                              alert('Ocurrió un error al guardar el estado de los botones');
                          });
                      }

                      
                        function comenzar(campaña) {

                        document.getElementById('comenzarBtn' + campaña).style.display = 'none';
                        document.getElementById('detenerBtn' + campaña).style.display = 'inline-block';
                        document.getElementById('agregarBtn' + campaña).style.display = 'none';
                          fetch('/comenzar', {
                              method: 'POST',
                              headers: {
                                  'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({ nombre: campaña })
                          })
                          .then(response => {
                              if (!response.ok) {
                                  throw new Error('Error al iniciar la campaña');
                              }
                              return response.text();
                          })
                          .then(data => {
                              console.log(data);
                              alert('La campaña ha sido iniciada');
                          })
                          .catch(error => {
                              console.error('Error:', error);
                              alert('Ocurrió un error al iniciar la campaña');
                          });
                           guardarEstadoBotones(campaña, 'comenzado');
                        }

function detener(campaña) {
    alert('Detener ' + campaña);
    document.getElementById('comenzarBtn' + campaña).style.display = 'inline-block';
    document.getElementById('detenerBtn' + campaña).style.display = 'none';
    document.getElementById('agregarBtn' + campaña).style.display = 'inline-block';
fetch('/detener', {
                              method: 'POST',
                              headers: {
                                  'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({ nombre: campaña })
                          })
                          .then(response => {
                              if (!response.ok) {
                                  throw new Error('Error al detener la campaña');
                              }
                              return response.text();
                          })
                          .then(data => {
                              console.log(data);
                              alert('La campaña ha sido detenida');
                          })
                          .catch(error => {
                              console.error('Error:', error);
                              alert('Ocurrió un error al detener la campaña');
                          });
                          guardarEstadoBotones(campaña, 'detenido');
                        }
                        
                        function agregar(campaña) {
                          // Crear un formulario
                          const form = document.createElement('form');
                          form.enctype = 'multipart/form-data'; // Para enviar archivos

                          // Construir el HTML del formulario
                          let formHTML = '<label for="nombre">Nombre de la campaña:</label>';
                          formHTML += '<input type="text" value="' + campaña + '" id="nombre" name="nombre"  readonly><br>';
                          formHTML += '<label for="json">Seleccionar archivo JSON:</label>';
                          formHTML += '<input type="file" id="json" name="json" accept=".json" required><br>';
                          formHTML += '<button type="submit">Agregar</button>';

                          // Establecer el HTML del formulario
                          form.innerHTML = formHTML;

                          // Al enviar el formulario
                          form.addEventListener('submit', function(event) {
                              event.preventDefault();

                              const nombre = document.getElementById('nombre').value;
                              const archivo = document.getElementById('json').files[0];

                              // Crear un FormData para enviar los datos
                              const formData = new FormData();
                              formData.append('nombre', nombre);
                              formData.append('json', archivo);

                              // Realizar la solicitud POST usando Fetch API
                              fetch('/agregar', {
                    method: 'POST',
                    body: formData
                })
                .then(response => {
                    if (response.ok) {
                        window.location.href = '/'; // Redirigir al usuario a la página principal
                    } else {
                        throw new Error('Error al agregar campaña');
                    }
                })
                .catch(error => {
                    console.error('Error al agregar campaña:', error);
                    alert('Error al agregar campaña');
                });
        });

        // Agregar el formulario al cuerpo del documento
        document.body.appendChild(form);
        guardarEstadoBotones(campaña, 'agregado');
    }

    // Al cargar la página, recuperar el estado de los botones desde el servidor
    window.onload = function() {
        fetch('/recuperar_estado')
        .then(response => response.json())
        .then(data => {
            // Actualizar los botones según el estado recuperado
            for (const campaña in data) {
                const estado = data[campaña];
                if (estado === 'comenzado') {
                    document.getElementById('comenzarBtn' + campaña).style.display = 'none';
                    document.getElementById('detenerBtn' + campaña).style.display = 'inline-block';
                    document.getElementById('agregarBtn' + campaña).style.display = 'none';
                } else if (estado === 'detenido') {
                    document.getElementById('comenzarBtn' + campaña).style.display = 'inline-block';
                    document.getElementById('detenerBtn' + campaña).style.display = 'none';
                    document.getElementById('agregarBtn' + campaña).style.display = 'inline-block';
                } else if (estado === 'agregado') {
                    // Aquí puedes manejar el estado 'agregado' si es necesario
                }
            }
        })
        .catch(error => {
            console.error('Error al recuperar el estado de los botones:', error);
            // Manejar el error si es necesario
        });
    };
</script>
                    `;

                          fs.writeFile('registro.html', tablaHTML, (err) => {
                              if (err) {
                                  console.error('Error al escribir el archivo registro.html:', err);
                                  return;
                              }
                              console.log('Se ha generado el archivo registro.html exitosamente.');
                          });
                      } catch (error) {
                          console.error('Error al parsear los datos del archivo registro.json:', error);
                      }
                  });
                }

                generarTablaHTML();
                module.exports = { generarTablaHTML };