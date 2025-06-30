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