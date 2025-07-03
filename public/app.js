document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM para los botones y áreas de visualización
    const ftpBtn = document.getElementById('ftp-btn');
    const ftpList = document.getElementById('ftp-file-list');
    const syslogBtn = document.getElementById('syslog-btn');
    const syslogContent = document.getElementById('syslog-content');
    const pingBtn = document.getElementById('ping-btn');
    const pingHostInput = document.getElementById('ping-host'); // Asumo que este es el input para el objetivo del ping
    const pingOutput = document.getElementById('ping-output');

    // --- Elementos para FTP (Necesitarás añadirlos a tu index.html) ---
    // He añadido placeholders. Deberías crear estos inputs en tu HTML.
    const ftpHostInput = document.getElementById('ftp-host-input');
    const ftpUserInput = document.getElementById('ftp-user-input');
    const ftpPasswordInput = document.getElementById('ftp-password-input');

    // ====================================================================
    // Funcionalidad para Cargar lista de archivos FTP
    // ====================================================================
    ftpBtn.addEventListener('click', async () => {
        // Obtener las credenciales del usuario desde los campos de entrada
        // Si no tienes estos inputs en tu HTML, puedes hardcodear los valores para pruebas:
        const host = ftpHostInput ? ftpHostInput.value : '127.0.0.1'; // IP del servidor FTP (tu VM server)
        const user = ftpUserInput ? ftpUserInput.value : 'your_ftp_user'; // Usuario FTP configurado en vsftpd
        const password = ftpPasswordInput ? ftpPasswordInput.value : 'your_ftp_password'; // Contraseña del usuario FTP

        // Limpiar la lista y mostrar un mensaje de carga
        ftpList.innerHTML = '<li>Cargando archivos FTP...</li>';

        try {
            // Realizar una solicitud POST al endpoint /api/ftp/list
            // Se envían host, user y password en el cuerpo de la solicitud JSON
            const response = await fetch('/api/ftp/list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ host, user, password })
            });

            // Verificar si la respuesta fue exitosa (código 2xx)
            if (!response.ok) {
                // Si hay un error, intentar parsear el JSON de error del servidor
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido al conectar al servidor FTP.');
            }

            // Parsear la respuesta JSON
            const result = await response.json();
            const files = result.files; // El servidor devuelve un objeto con la propiedad 'files'

            // Limpiar la lista actual
            ftpList.innerHTML = '';
            if (files.length === 0) {
                ftpList.innerHTML = '<li>No hay archivos en el directorio FTP.</li>';
            } else {
                // Iterar sobre los archivos y añadirlos a la lista
                files.forEach(file => {
                    const li = document.createElement('li');
                    li.textContent = file; // El servidor ahora solo devuelve el nombre
                    ftpList.appendChild(li);
                });
            }
        } catch (error) {
            // Mostrar cualquier error que ocurra durante la operación FTP
            ftpList.innerHTML = `<li>Error: ${error.message}</li>`;
            console.error('Error en la operación FTP (frontend):', error);
        }
    });

    // ====================================================================
    // Funcionalidad para Cargar logs de Syslog
    // ====================================================================
    syslogBtn.addEventListener('click', async () => {
        syslogContent.textContent = 'Cargando logs de Syslog...'; // Mensaje de carga

        try {
            // Realizar una solicitud GET al endpoint /api/syslog/logs
            // El servidor ahora devuelve un objeto JSON con la propiedad 'logs'
            const response = await fetch('/api/syslog/logs');

            // Verificar si la respuesta fue exitosa
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'No se pudieron cargar los logs.');
            }

            // Parsear la respuesta JSON
            const result = await response.json();
            const logs = result.logs; // El servidor devuelve un objeto con la propiedad 'logs'

            // Unir las líneas de log con saltos de línea para mostrarlas
            syslogContent.textContent = logs.join('\n') || 'El archivo de log está vacío o no se encontraron logs.';
        } catch (error) {
            // Mostrar cualquier error que ocurra
            syslogContent.textContent = `Error: ${error.message}`;
            console.error('Error al cargar logs de Syslog (frontend):', error);
        }
    });

    // ====================================================================
    // Funcionalidad para Ejecutar Ping
    // ====================================================================
    pingBtn.addEventListener('click', async () => {
        const target = pingHostInput.value; // Obtener el objetivo del ping del campo de entrada

        // Validar que se ingresó un objetivo
        if (!target) {
            pingOutput.textContent = 'Por favor, ingresa un host o IP válido para el ping.';
            return;
        }
        pingOutput.textContent = `Haciendo ping a ${target}...`; // Mensaje de carga

        try {
            // Realizar una solicitud POST al endpoint /api/ping
            // Se envía el objetivo (target) en el cuerpo de la solicitud JSON
            const response = await fetch('/api/ping', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ target: target }) // El servidor espera 'target', no 'host'
            });

            // Verificar si la respuesta fue exitosa
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido al ejecutar ping.');
            }

            // Parsear la respuesta JSON
            const result = await response.json();
            // El servidor devuelve un objeto con la propiedad 'output'
            pingOutput.textContent = result.output;
        } catch (error) {
            // Mostrar cualquier error que ocurra
            pingOutput.textContent = `Error al ejecutar ping: ${error.message}`;
            console.error('Error en la operación de ping (frontend):', error);
        }
    });
});
