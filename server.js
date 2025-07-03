// Importar los módulos necesarios
const express = require('express');
const path = require('path');
const fs = 'fs'; // Módulo para leer archivos (para Syslog)
const { exec } = require('child_process'); // Módulo para ejecutar comandos (para Ping)
const ftp = require('basic-ftp'); // Módulo para interactuar con FTP

// Crear la aplicación Express
const app = express();
const PORT = 8000; // El puerto HTTP estándar

// --- Middleware ---
// Servir los archivos estáticos (HTML, CSS, JS del cliente) de la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));
// Permitir que el servidor entienda peticiones con cuerpo en formato JSON
app.use(express.json());


// --- RUTAS DEL API ---

// 1. Ruta para obtener la lista de archivos del servidor FTP
app.get('/api/ftp/list', async (req, res) => {
    const client = new ftp.Client();
    try {
        // Conectar al servidor FTP (debes configurar vsftpd primero)
        await client.access({
            host: '127.0.0.1', // O la IP de tu servidor FTP
            user: 'TU_USUARIO_FTP', // Reemplaza con un usuario FTP válido
            password: 'TU_CONTRASEÑA_FTP', // Reemplaza con la contraseña
        });
        const files = await client.list();
        res.json(files); // Enviar la lista de archivos como JSON
    } catch (err) {
        console.error("Error de FTP:", err);
        res.status(500).json({ error: 'No se pudo conectar al servidor FTP.' });
    } finally {
        client.close();
    }
});

// 2. Ruta para obtener los logs del sistema
app.get('/api/syslog', (req, res) => {
    // Ruta al archivo de log. Deberás configurar rsyslog para que escriba aquí.
    const logFilePath = '/var/log/network-events.log'; 

    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error al leer el archivo de log:", err);
            return res.status(500).send('No se pudo leer el archivo de logs.');
        }
        res.setHeader('Content-Type', 'text/plain');
        res.send(data); // Enviar el contenido del log
    });
});

// 3. Ruta para ejecutar una prueba de Ping
app.post('/api/ping', (req, res) => {
    const { host } = req.body;
    if (!host) {
        return res.status(400).send('Se requiere un host para hacer ping.');
    }

    // Ejecuta el comando ping con 4 paquetes. Es seguro porque no concatenamos texto sin validar.
    exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
        if (error) {
            res.status(500).send(stderr);
            return;
        }
        res.setHeader('Content-Type', 'text/plain');
        res.send(stdout);
    });
});


// --- Iniciar el servidor ---
app.listen(PORT, () => {
    console.log(`Servidor web iniciado en http://localhost:${PORT}`);
    console.log(`Accede desde la VM cliente usando el nombre de dominio configurado en BIND.`);
});