Proyecto Final: Dashboard de Administración de Servicios en Red
Este proyecto implementa un dashboard web interactivo para demostrar la configuración y el funcionamiento de diversos servicios de red en una topología simulada de la Escuela Superior de Cómputo (ESCOM). El dashboard sirve como la herramienta central de validación visual, cumpliendo con los requerimientos del curso de Administración de Servicios en Red.

Curso: Administración de Servicios en Red
Grupo: 7CV1

Fecha de Entrega del Reporte: 28 de junio
Fecha de Presentación: 23 de junio

Integrantes del Equipo
Hernández Castro Eduardo

Parra Mancilla José Ramón

Descripción del Proyecto
El objetivo es administrar una red empresarial simulada que incluye múltiples routers, switches y VLANs. La gestión y demostración de los servicios se centraliza a través de una aplicación web (dashboard) que permite interactuar y visualizar el estado de los servicios configurados, como FTP, Syslog y DNS, sin necesidad de usar herramientas de validación en la línea de comandos.

Requisitos Clave del Proyecto
Este proyecto cumple con los siguientes requisitos fundamentales:

Topología: La red está montada sobre una topología con más de 4 routers.

Servicios: Se configuran 6 servicios sobre 2 máquinas virtuales:

Obligatorios: SNMP, DNS, DHCP.

Opcionales Implementados: HTTP, FTP, Syslog.

DNS con BIND: El servidor DNS se levanta con BIND, resolviendo nombres de dominio para servicios y dispositivos (ej. r1.equipo8.com, etc.) y permitiendo búsquedas inversas.

Seguridad: Se implementan Listas de Control de Acceso (ACLs) extendidas para filtrar el tráfico en la red.

Validación Visual: La funcionalidad de los servicios se demuestra a través del dashboard web, evitando el uso de herramientas como curl para la validación.

Tecnologías Utilizadas
Virtualización y Simulación: GNS3, VirtualBox.

Sistema Operativo (Servidor): Linux (Debian/Ubuntu).

Servicios de Red:

DNS: BIND9

DHCP: isc-dhcp-server

FTP: vsftpd

Syslog: rsyslog

SNMP: snmpd

Backend (Dashboard Web):

Node.js

Express.js

Frontend (Dashboard Web):

HTML5

CSS3

JavaScript (Vanilla)

Estructura del Proyecto
C:\dev\redes3-25-2-proyecto\
│
├── .gitignore             # Archivos y carpetas a ignorar por Git
├── node_modules/          # Dependencias de Node.js
├── package-lock.json      # Bloqueo de versiones de dependencias
├── package.json           # Define el proyecto y sus dependencias
├── preparar_servidor.sh   # Script para instalar dependencias en la VM
├── public/                # Contenido que verá el cliente (frontend)
│   ├── index.html         # La página principal
│   ├── style.css          # Estilos para la página
│   └── app.js             # Lógica del cliente (JavaScript)
├── Readme.md              # Este archivo de documentación
└── server.js              # El corazón de tu aplicación (backend)

Guía de Instalación y Ejecución
Sigue estos pasos para levantar el proyecto desde cero en la máquina virtual designada como servidor.

1. Preparación de la Máquina Virtual (VM)
Este script instala todas las herramientas y servicios necesarios en una VM Debian/Ubuntu limpia.

# Navegar a la carpeta raíz del proyecto en la VM
cd /ruta/a/redes3-25-2-proyecto/

# Dar permisos de ejecución al script
chmod +x preparar_servidor.sh

# Ejecutar el script como superusuario o con sudo
sudo ./preparar_servidor.sh

2. Configuración de Servicios de Red
Antes de iniciar el dashboard, es crucial configurar los servicios que se instalaron en el paso anterior. Cada servicio tiene sus propios archivos de configuración que deben ser modificados según la topología y el plan de direccionamiento del proyecto.

BIND: Configurar las zonas directa (equipo12.com) e inversa en /etc/bind/named.conf.local y crear los archivos de zona correspondientes.

DHCP: Definir los subnets y rangos de IPs a asignar en /etc/dhcp/dhcpd.conf.

vsftpd: Asegurar que los usuarios locales puedan acceder editando /etc/vsftpd.conf.

rsyslog: Configurar reglas para que los logs de los dispositivos de red se centralicen en un archivo específico, como /var/log/network-events.log.

3. Instalación de Dependencias del Dashboard
Este comando lee el archivo package.json y descarga las librerías de Node.js necesarias (Express y basic-ftp).

# Asegúrate de estar en la carpeta raíz del proyecto
cd C:\dev\redes3-25-2-proyecto\

# Instalar dependencias
npm install

4. Ejecución del Proyecto
Una vez que los servicios están configurados y las dependencias instaladas, inicia el servidor web.

# Asegúrate de estar en la carpeta raíz del proyecto
cd C:\dev\redes3-25-2-proyecto\

# Iniciar el servidor Node.js
npm start

El servidor se ejecutará y mostrará un mensaje en la consola. Para acceder al dashboard:

Abre un navegador web en la máquina virtual cliente.

Navega usando el nombre de dominio configurado en BIND (ej. http://www.equipo12.com) o directamente la dirección IP del servidor (ej. http://<IP_del_Servidor>).

Funcionalidades del Dashboard
El dashboard web ofrece las siguientes funcionalidades para la demostración:

Servicio FTP: Permite visualizar en tiempo real la lista de archivos alojados en el servidor FTP, demostrando conectividad y acceso.

Visor de Syslog: Muestra los últimos eventos de red capturados por el servidor Syslog. Permite demostrar la centralización de logs al generar un evento (ej. un intento de login fallido en un router) y verlo aparecer en el visor.

Pruebas de Red: Proporciona una utilidad para ejecutar ping a cualquier dispositivo de la red por su nombre de dominio, demostrando el correcto funcionamiento de DNS y la conectividad básica. Es ideal para probar el efecto de las ACLs.

Solución de Problemas Comunes
Error de FTP: 530 Login incorrect.
Este error indica que el servidor FTP (vsftpd) está rechazando la conexión debido a credenciales de inicio de sesión incorrectas (usuario o contraseña) o a una configuración inadecuada.

Posibles causas y soluciones:

Credenciales Incorrectas:

Verifica el usuario y la contraseña: Asegúrate de que estás utilizando un usuario y una contraseña válidos que existan en tu sistema Linux (la VM del servidor) y que tengan permisos para acceder al servidor FTP.

Crear un usuario de prueba (opcional): Si no estás seguro, puedes crear un nuevo usuario en tu VM del servidor específicamente para FTP.

sudo adduser ftptestuser
sudo passwd ftptestuser

Luego, intenta conectarte con este nuevo usuario desde tu dashboard.

Configuración de vsftpd:

Permitir usuarios locales: Por defecto, vsftpd puede estar configurado para no permitir el inicio de sesión de usuarios locales. Necesitas editar el archivo de configuración de vsftpd, que generalmente se encuentra en /etc/vsftpd.conf.
Abre el archivo con un editor de texto (ej. nano o vim):

sudo nano /etc/vsftpd.conf

Descomenta o añade local_enable=YES: Busca la línea local_enable=YES y asegúrate de que no esté comentada (es decir, que no tenga un # al principio). Si no existe, añádela.

Descomenta o añade write_enable=YES: Si quieres que los usuarios puedan subir archivos, asegúrate de que write_enable=YES también esté descomentado o añadido.

Reinicia vsftpd: Después de cualquier cambio en el archivo de configuración, debes reiniciar el servicio para que los cambios surtan efecto:

sudo systemctl restart vsftpd

Firewall (en la VM del servidor):

Asegúrate de que el firewall de tu VM del servidor (si lo tienes habilitado, como ufw) no esté bloqueando el puerto 21 (FTP de control) y los puertos pasivos (generalmente un rango alto, como 40000-50000, si usas FTP pasivo).

Puedes permitir el puerto FTP con ufw (ejemplo):

sudo ufw allow ftp
sudo ufw allow 20/tcp # Puerto de datos FTP
sudo ufw allow 21/tcp # Puerto de control FTP

Si usas FTP pasivo, también necesitarías abrir el rango de puertos pasivos que configures en vsftpd.conf (usando pasv_min_port y pasv_max_port).

Pasos para depurar adicionales:

Verifica el estado del servicio vsftpd:

sudo systemctl status vsftpd

Asegúrate de que el estado sea active (running).

Revisa los logs de vsftpd:
Los logs te darán más detalles sobre por qué falló el inicio de sesión. Pueden estar en /var/log/syslog o /var/log/auth.log, o incluso en un log específico de vsftpd si lo configuraste.

tail -f /var/log/syslog
# O
tail -f /var/log/auth.log

Intenta iniciar sesión de nuevo y observa las nuevas entradas en el log para identificar la causa raíz.