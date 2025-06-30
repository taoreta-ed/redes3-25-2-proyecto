document.addEventListener('DOMContentLoaded', () => {
    const ftpBtn = document.getElementById('ftp-btn');
    const ftpList = document.getElementById('ftp-file-list');
    const syslogBtn = document.getElementById('syslog-btn');
    const syslogContent = document.getElementById('syslog-content');
    const pingBtn = document.getElementById('ping-btn');
    const pingHostInput = document.getElementById('ping-host');
    const pingOutput = document.getElementById('ping-output');

    // Cargar lista de archivos FTP
    ftpBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/ftp/list');
            if (!response.ok) throw new Error('Error en el servidor FTP.');
            const files = await response.json();
            
            ftpList.innerHTML = ''; // Limpiar lista
            if (files.length === 0) {
                ftpList.innerHTML = '<li>No hay archivos en el directorio.</li>';
            } else {
                files.forEach(file => {
                    const li = document.createElement('li');
                    li.textContent = `${file.name} (${file.size} bytes) - Tipo: ${file.type}`;
                    ftpList.appendChild(li);
                });
            }
        } catch (error) {
            ftpList.innerHTML = `<li>Error: ${error.message}</li>`;
        }
    });

    // Cargar logs de Syslog
    syslogBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/syslog');
            if (!response.ok) throw new Error('No se pudieron cargar los logs.');
            const logData = await response.text();
            syslogContent.textContent = logData || 'El archivo de log está vacío.';
        } catch (error) {
            syslogContent.textContent = `Error: ${error.message}`;
        }
    });

    // Ejecutar Ping
    pingBtn.addEventListener('click', async () => {
        const host = pingHostInput.value;
        if (!host) {
            pingOutput.textContent = 'Por favor, ingresa un host válido.';
            return;
        }
        pingOutput.textContent = `Haciendo ping a ${host}...`;

        try {
            const response = await fetch('/api/ping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ host: host })
            });
            const result = await response.text();
            pingOutput.textContent = result;
        } catch (error) {
            pingOutput.textContent = `Error al ejecutar ping: ${error.message}`;
        }
    });
});