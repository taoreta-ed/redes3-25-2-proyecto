document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    // FTP
    const ftpListBtn = document.getElementById('ftp-list-btn');
    const ftpDownloadBtn = document.getElementById('ftp-download-btn');
    const ftpUploadBtn = document.getElementById('ftp-upload-btn');
    const ftpHostInput = document.getElementById('ftp-host-input');
    const ftpUserInput = document.getElementById('ftp-user-input');
    const ftpPasswordInput = document.getElementById('ftp-password-input');
    const ftpDownloadFilenameInput = document.getElementById('ftp-download-filename');
    const ftpUploadFileInput = document.getElementById('ftp-upload-file');
    const ftpList = document.getElementById('ftp-file-list');

    // Syslog
    const syslogCreateBtn = document.getElementById('syslog-create-btn');
    const syslogViewBtn = document.getElementById('syslog-view-btn');
    const syslogMessageInput = document.getElementById('syslog-message-input');
    const syslogContent = document.getElementById('syslog-content');

    // Ping
    const pingBtn = document.getElementById('ping-btn');
    const pingHostInput = document.getElementById('ping-host');
    const pingOutput = document.getElementById('ping-output');

    // Función auxiliar para obtener credenciales FTP
    function getFtpCredentials() {
        const host = ftpHostInput.value;
        const user = ftpUserInput.value;
        const password = ftpPasswordInput.value;
        if (!host || !user || !password) {
            alert('Por favor, ingresa el Host, Usuario y Contraseña de FTP.');
            return null;
        }
        return { host, user, password };
    }

    // ====================================================================
    // Funcionalidad para FTP
    // ====================================================================

    // Ver Archivos FTP
    ftpListBtn.addEventListener('click', async () => {
        const credentials = getFtpCredentials();
        if (!credentials) return;

        ftpList.innerHTML = '<li>Cargando archivos FTP...</li>';

        try {
            const response = await fetch('/api/ftp/list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido al conectar al servidor FTP.');
            }

            const result = await response.json();
            const files = result.files;

            ftpList.innerHTML = '';
            if (files.length === 0) {
                ftpList.innerHTML = '<li>No hay archivos en el directorio FTP.</li>';
            } else {
                files.forEach(file => {
                    const li = document.createElement('li');
                    li.textContent = file;
                    // Opcional: añadir un botón de descarga junto a cada archivo si se desea
                    // const downloadBtn = document.createElement('button');
                    // downloadBtn.textContent = 'Descargar';
                    // downloadBtn.onclick = () => { /* lógica de descarga para este archivo */ };
                    // li.appendChild(downloadBtn);
                    ftpList.appendChild(li);
                });
            }
        } catch (error) {
            ftpList.innerHTML = `<li>Error: ${error.message}</li>`;
            console.error('Error en la operación FTP (listar):', error);
        }
    });

    // Descargar Archivo FTP
    ftpDownloadBtn.addEventListener('click', async () => {
        const credentials = getFtpCredentials();
        if (!credentials) return;

        const filename = ftpDownloadFilenameInput.value;
        if (!filename) {
            alert('Por favor, ingresa el nombre del archivo a descargar.');
            return;
        }

        try {
            // Mostrar un mensaje de carga
            alert(`Iniciando descarga de "${filename}"...`);

            const response = await fetch('/api/ftp/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...credentials, filename })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido al descargar el archivo.');
            }

            // Si la respuesta es OK, el navegador debería iniciar la descarga
            // Crear un blob del archivo y un enlace para descargarlo
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename; // Nombre del archivo para guardar
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url); // Limpiar URL del objeto
            alert(`Archivo "${filename}" descargado exitosamente.`);

        } catch (error) {
            alert(`Error al descargar archivo: ${error.message}`);
            console.error('Error en la operación FTP (descargar):', error);
        }
    });

    // Subir Archivo FTP
    ftpUploadBtn.addEventListener('click', async () => {
        const credentials = getFtpCredentials();
        if (!credentials) return;

        const file = ftpUploadFileInput.files[0];
        if (!file) {
            alert('Por favor, selecciona un archivo para subir.');
            return;
        }

        // Crear un objeto FormData para enviar el archivo
        const formData = new FormData();
        formData.append('host', credentials.host);
        formData.append('user', credentials.user);
        formData.append('password', credentials.password);
        formData.append('fileToUpload', file); // 'fileToUpload' debe coincidir con el nombre en Multer en server.js

        try {
            alert(`Subiendo archivo "${file.name}"...`);

            const response = await fetch('/api/ftp/upload', {
                method: 'POST',
                body: formData // FormData se encarga de establecer el Content-Type correcto
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido al subir el archivo.');
            }

            const result = await response.json();
            alert(result.message);
            // Opcional: Actualizar la lista de archivos después de subir
            ftpListBtn.click();

        } catch (error) {
            alert(`Error al subir archivo: ${error.message}`);
            console.error('Error en la operación FTP (subir):', error);
        }
    });


    // ====================================================================
    // Funcionalidad para Syslog
    // ====================================================================

    // Crear Log
    syslogCreateBtn.addEventListener('click', async () => {
        const message = syslogMessageInput.value;
        if (!message) {
            alert('Por favor, ingresa un mensaje para el log.');
            return;
        }

        syslogContent.textContent = 'Creando log...';

        try {
            const response = await fetch('/api/syslog/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido al crear el log.');
            }

            const result = await response.json();
            alert(result.message);
            syslogMessageInput.value = ''; // Limpiar el input
            syslogViewBtn.click(); // Actualizar la vista de logs
        } catch (error) {
            syslogContent.textContent = `Error al crear log: ${error.message}`;
            console.error('Error en la operación Syslog (crear):', error);
        }
    });

    // Ver Logs (anteriormente Actualizar Logs)
    syslogViewBtn.addEventListener('click', async () => {
        syslogContent.textContent = 'Cargando logs de Syslog...';

        try {
            const response = await fetch('/api/syslog/logs');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'No se pudieron cargar los logs.');
            }

            const result = await response.json();
            const logs = result.logs;

            syslogContent.textContent = logs.join('\n') || 'El archivo de log está vacío o no se encontraron logs.';
        } catch (error) {
            syslogContent.textContent = `Error: ${error.message}`;
            console.error('Error al cargar logs de Syslog (ver):', error);
        }
    });


    // ====================================================================
    // Funcionalidad para Ejecutar Ping
    // ====================================================================
    pingBtn.addEventListener('click', async () => {
        const target = pingHostInput.value;

        if (!target) {
            pingOutput.textContent = 'Por favor, ingresa un host o IP válido para el ping.';
            return;
        }
        pingOutput.textContent = `Haciendo ping a ${target}...`;

        try {
            const response = await fetch('/api/ping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: target })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido al ejecutar ping.');
            }

            const result = await response.json();
            pingOutput.textContent = result.output;
        } catch (error) {
            pingOutput.textContent = `Error al ejecutar ping: ${error.message}`;
            console.error('Error en la operación de ping (frontend):', error);
        }
    });
});
