// Importar módulos necesarios
const express = require('express'); // Framework web para Node.js
const path = require('path');       // Para manejar rutas de archivos y directorios
const fs = require('fs').promises;  // Módulo de sistema de archivos de Node.js con promesas (para async/await)
const Client = require('basic-ftp'); // Cliente FTP básico
const { exec } = require('child_process'); // Para ejecutar comandos del sistema operativo
const multer = require('multer');   // Middleware para manejar la subida de archivos (multipart/form-data)

// Inicializar la aplicación Express
const app = express();
const PORT = process.env.PORT || 80; // Define el puerto del servidor, usa 80 por defecto

// Configuración de Multer para la subida de archivos
// Los archivos se guardarán temporalmente en la carpeta 'uploads/'
const upload = multer({ dest: 'uploads/' });

// Middleware para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para parsear cuerpos de solicitud JSON
app.use(express.json());

// ====================================================================
// Endpoints para el Servicio FTP
// ====================================================================

// Endpoint para obtener la lista de archivos del servidor FTP
app.post('/api/ftp/list', async (req, res) => {
    const { host, user, password } = req.body;

    if (!host || !user || !password) {
        return res.status(400).json({ error: 'Se requieren host, usuario y contraseña para FTP.' });
    }

    const client = new Client.Client();
    client.ftp.verbose = false;

    try {
        await client.access({ host, user, password, secure: false });
        const list = await client.list();
        const fileNames = list.map(item => item.name);
        res.json({ files: fileNames });
    } catch (err) {
        console.error('Error al conectar o listar FTP:', err.message);
        res.status(500).json({ error: `Error de FTP: ${err.message}` });
    } finally {
        client.close();
    }
});

// Endpoint para descargar un archivo desde el servidor FTP
app.post('/api/ftp/download', async (req, res) => {
    const { host, user, password, filename } = req.body;

    if (!host || !user || !password || !filename) {
        return res.status(400).json({ error: 'Se requieren host, usuario, contraseña y nombre de archivo para descargar.' });
    }

    const client = new Client.Client();
    client.ftp.verbose = false;
    const tempFilePath = path.join(__dirname, 'temp', filename); // Ruta temporal para guardar el archivo

    try {
        await client.access({ host, user, password, secure: false });
        
        // Asegurarse de que el directorio temporal exista
        await fs.mkdir(path.dirname(tempFilePath), { recursive: true });

        // Descargar el archivo al sistema de archivos local del servidor Node.js
        await client.downloadTo(tempFilePath, filename);

        // Enviar el archivo descargado al cliente HTTP
        res.download(tempFilePath, filename, async (err) => {
            if (err) {
                console.error('Error al enviar el archivo al cliente:', err.message);
                // Si el archivo ya se envió parcialmente, no se puede cambiar el estado
                if (!res.headersSent) {
                    res.status(500).json({ error: `Error al descargar el archivo: ${err.message}` });
                }
            }
            // Eliminar el archivo temporal después de enviarlo
            try {
                await fs.unlink(tempFilePath);
            } catch (unlinkErr) {
                console.warn('Error al eliminar archivo temporal:', unlinkErr.message);
            }
        });

    } catch (err) {
        console.error('Error en la operación de descarga FTP:', err.message);
        res.status(500).json({ error: `Error de FTP al descargar: ${err.message}` });
    } finally {
        client.close();
    }
});

// Endpoint para subir un archivo al servidor FTP
// 'fileToUpload' debe coincidir con el 'name' del input type="file" en el frontend
app.post('/api/ftp/upload', upload.single('fileToUpload'), async (req, res) => {
    const { host, user, password } = req.body;
    const file = req.file; // Archivo subido por Multer

    if (!host || !user || !password || !file) {
        // Asegurarse de eliminar el archivo temporal si hay un error
        if (file && file.path) {
            await fs.unlink(file.path).catch(err => console.warn('Error al eliminar archivo temporal:', err.message));
        }
        return res.status(400).json({ error: 'Se requieren host, usuario, contraseña y un archivo para subir.' });
    }

    const client = new Client.Client();
    client.ftp.verbose = false;

    try {
        await client.access({ host, user, password, secure: false });
        
        // Subir el archivo desde la ruta temporal de Multer al servidor FTP
        await client.uploadFrom(file.path, file.originalname);

        res.json({ message: `Archivo "${file.originalname}" subido exitosamente.` });

    } catch (err) {
        console.error('Error en la operación de subida FTP:', err.message);
        res.status(500).json({ error: `Error de FTP al subir: ${err.message}` });
    } finally {
        client.close();
        // Asegurarse de eliminar el archivo temporal de Multer
        if (file && file.path) {
            await fs.unlink(file.path).catch(err => console.warn('Error al eliminar archivo temporal:', err.message));
        }
    }
});

// ====================================================================
// Endpoints para el Visor de Syslog
// ====================================================================

// Endpoint para obtener los logs del sistema
app.get('/api/syslog/logs', async (req, res) => {
    const logFilePath = '/var/log/network-events.log';

    try {
        const data = await fs.readFile(logFilePath, 'utf8');
        const lines = data.split('\n');
        const last50Lines = lines.filter(line => line.trim() !== '').slice(-50);
        res.json({ logs: last50Lines });
    } catch (err) {
        console.error('Error al leer el archivo de logs de Syslog:', err.message);
        if (err.code === 'ENOENT') {
            res.status(404).json({ error: `Archivo de logs no encontrado: ${logFilePath}. Asegúrate de que rsyslog esté configurado para escribir aquí.` });
        } else if (err.code === 'EACCES') {
            res.status(403).json({ error: `Permiso denegado para leer ${logFilePath}. Asegúrate de que el usuario que ejecuta el servidor tenga permisos de lectura.` });
        } else {
            res.status(500).json({ error: `Error interno del servidor al cargar logs: ${err.message}` });
        }
    }
});

// Endpoint para crear (añadir) un nuevo mensaje de log en el archivo de Syslog
app.post('/api/syslog/create', async (req, res) => {
    const { message } = req.body;
    const logFilePath = '/var/log/network-events.log';

    if (!message) {
        return res.status(400).json({ error: 'Se requiere un mensaje para el log.' });
    }

    // Formato del mensaje de log (puedes ajustarlo)
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - Dashboard: ${message}\n`;

    try {
        // Añadir el mensaje al final del archivo de logs
        await fs.appendFile(logFilePath, logEntry, 'utf8');
        res.json({ success: true, message: 'Log creado exitosamente.' });
    } catch (err) {
        console.error('Error al escribir en el archivo de logs de Syslog:', err.message);
        if (err.code === 'EACCES') {
            res.status(403).json({ error: `Permiso denegado para escribir en ${logFilePath}. Asegúrate de que el usuario que ejecuta el servidor tenga permisos de escritura.` });
        } else {
            res.status(500).json({ error: `Error interno del servidor al crear log: ${err.message}` });
        }
    }
});


// ====================================================================
// Endpoint para Pruebas de Red (Ping)
// ====================================================================
app.post('/api/ping', (req, res) => {
    const { target } = req.body;

    if (!target) {
        return res.status(400).json({ error: 'Se requiere un objetivo (IP o dominio) para el ping.' });
    }

    const command = `ping -c 4 ${target}`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al ejecutar ping a ${target}: ${error.message}`);
            return res.status(500).json({ error: `Error al ejecutar ping: ${stderr || error.message}` });
        }
        if (stderr) {
            console.warn(`Stderr del ping a ${target}: ${stderr}`);
        }
        res.json({ output: stdout });
    });
});

// Iniciar el servidor Express
app.listen(PORT, () => {
    console.log(`Servidor web iniciado en http://localhost:${PORT}`);
    console.log(`Accede desde la VM cliente usando http://${process.env.SERVER_IP || 'TU_IP_DEL_SERVIDOR'}:${PORT}`);
});
