const express = require('express'); // Framework web para Node.js
const path = require('path');       // Para manejar rutas de archivos y directorios
const fs = require('fs').promises;  // Módulo de sistema de archivos de Node.js con promesas (para async/await)
const Client = require('basic-ftp'); // Cliente FTP básico (renombrado de 'ftp' a 'Client' para claridad)
const { exec } = require('child_process'); // Para ejecutar comandos del sistema operativo

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 80; // Define el puerto del servidor, usa 8000 por defecto

// Middleware para servir archivos estáticos desde la carpeta 'public'
// Esto permite que el navegador cargue index.html, style.css y app.js
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para parsear cuerpos de solicitud JSON
// Necesario para que el servidor pueda leer los datos enviados desde el frontend en formato JSON
app.use(express.json());

// ====================================================================
// Endpoint para el Servicio FTP
// ====================================================================
// Se usa POST para enviar credenciales de forma más segura en el cuerpo de la petición
app.post('/api/ftp/list', async (req, res) => {
    // Este endpoint recibe credenciales FTP (host, user, password) y devuelve una lista de archivos
    const { host, user, password } = req.body; // Obtiene los datos del cuerpo de la petición

    // Validar que se recibieron todos los datos necesarios
    if (!host || !user || !password) {
        return res.status(400).json({ error: 'Se requieren host, usuario y contraseña para FTP.' });
    }

    const client = new Client.Client(); // Crea una nueva instancia del cliente FTP
    client.ftp.verbose = false; // Desactiva la salida de depuración detallada del cliente FTP

    try {
        // Conectar al servidor FTP
        // Aquí debes asegurarte de que el servidor FTP (vsftpd) esté corriendo
        // y que las credenciales sean correctas.
        await client.access({
            host: host,
            user: user,
            password: password,
            secure: false // Cambiar a true si tu FTP usa TLS/SSL (FTPS)
        });

        // Obtener la lista de archivos en el directorio actual (o el especificado)
        const list = await client.list();
        // Mapear la lista para incluir solo los nombres de los archivos/directorios
        const fileNames = list.map(item => item.name);

        // Enviar la lista de nombres de archivos como respuesta JSON
        res.json({ files: fileNames });

    } catch (err) {
        // Capturar y manejar cualquier error que ocurra durante la conexión o listado FTP
        console.error('Error al conectar o listar FTP:', err.message);
        // Devolver un error 500 con un mensaje descriptivo
        res.status(500).json({ error: `Error de FTP: ${err.message}` });
    } finally {
        // Asegurarse de cerrar la conexión FTP, incluso si hubo un error
        client.close();
    }
});

// ====================================================================
// Endpoint para el Visor de Syslog
// ====================================================================
// Se usa GET para obtener los logs, ya que no se envían datos sensibles en el cuerpo
app.get('/api/syslog/logs', async (req, res) => {
    // Este endpoint lee el archivo de logs del sistema y devuelve las últimas líneas
    // Asegúrate de que rsyslog esté configurado para escribir en este archivo
    const logFilePath = '/var/log/network-events.log';

    try {
        // Leer el contenido completo del archivo de logs de forma asíncrona
        const data = await fs.readFile(logFilePath, 'utf8');
        // Dividir el contenido por líneas
        const lines = data.split('\n');
        // Filtrar líneas vacías y obtener las últimas 50 líneas (puedes ajustar este número)
        const last50Lines = lines.filter(line => line.trim() !== '').slice(-50);

        // Enviar las últimas líneas como un array JSON
        res.json({ logs: last50Lines });

    } catch (err) {
        // Manejar errores si el archivo no existe, no se puede leer, etc.
        console.error('Error al leer el archivo de logs de Syslog:', err.message);
        // Si el archivo no existe (ENOENT) o no hay permisos (EACCES), enviar un mensaje de error específico
        if (err.code === 'ENOENT') {
            res.status(404).json({ error: `Archivo de logs no encontrado: ${logFilePath}. Asegúrate de que rsyslog esté configurado para escribir aquí.` });
        } else if (err.code === 'EACCES') {
            res.status(403).json({ error: `Permiso denegado para leer ${logFilePath}. Asegúrate de que el usuario que ejecuta el servidor tenga permisos de lectura.` });
        } else {
            // Para otros errores, enviar un mensaje de error genérico del servidor
            res.status(500).json({ error: `Error interno del servidor al cargar logs: ${err.message}` });
        }
    }
});

// ====================================================================
// Endpoint para Pruebas de Red (Ping)
// ====================================================================
// Se usa POST para enviar el objetivo del ping en el cuerpo de la petición
app.post('/api/ping', (req, res) => {
    // Este endpoint ejecuta un comando ping a una IP/dominio y devuelve el resultado
    const { target } = req.body; // Obtiene el objetivo del ping (IP o dominio)

    // Validar que se recibió un objetivo
    if (!target) {
        return res.status(400).json({ error: 'Se requiere un objetivo (IP o dominio) para el ping.' });
    }

    // Comando a ejecutar. Limitamos el número de pings a 4 para no saturar la red.
    // Usamos 'ping -c 4' para Linux. Si fuera Windows, sería 'ping -n 4'.
    const command = `ping -c 4 ${target}`;

    // Ejecutar el comando ping en el sistema operativo
    exec(command, (error, stdout, stderr) => {
        if (error) {
            // Si hay un error (ej. host no alcanzable, comando no encontrado)
            console.error(`Error al ejecutar ping a ${target}: ${error.message}`);
            // Devolver un error 500 con el mensaje de error estándar o el mensaje del error
            return res.status(500).json({ error: `Error al ejecutar ping: ${stderr || error.message}` });
        }
        if (stderr) {
            // Si hay salida de error estándar (warnings, etc.), registrarla pero aún enviar stdout
            console.warn(`Stderr del ping a ${target}: ${stderr}`);
        }
        // Si todo va bien, enviar la salida estándar del comando ping como JSON
        res.json({ output: stdout });
    });
});

// Iniciar el servidor Express
app.listen(PORT, () => {
    console.log(`Servidor web iniciado en http://localhost:${PORT}`);
    // Muestra la IP del servidor si está disponible como variable de entorno, o un placeholder
    console.log(`Accede desde la VM cliente usando http://${process.env.SERVER_IP || 'TU_IP_DEL_SERVIDOR'}:${PORT}`);
});
