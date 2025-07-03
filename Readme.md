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

Topología: La red está montada sobre una topología con más de 4 routers. (Actualmente en fase de pruebas con 2 VMs y 1 PC conectadas a un switch, con DNS configurado).

Servicios: Se configuran 6 servicios sobre 2 máquinas virtuales:

Obligatorios: SNMP, DNS, DHCP.

Opcionales Implementados: HTTP, FTP, Syslog.

DNS con BIND: El servidor DNS se levanta con BIND, resolviendo nombres de dominio para servicios y dispositivos (ej. r1.equipo8.com, www.equipo12.com, server.equipo12.com, client.equipo12.com, pc1.equipo12.com) y permitiendo búsquedas inversas.

Seguridad: Se implementan Listas de Control de Acceso (ACLs) extendidas para filtrar el tráfico en la red.

Validación Visual: La funcionalidad de los servicios se demuestra a través del dashboard web, evitando el uso de herramientas como curl para la validación.

Tecnologías Utilizadas
Virtualización y Simulación: GNS3, VirtualBox.

Sistema Operativo (Servidor/Cliente): Linux (Debian/Ubuntu).

Servicios de Red:

DNS: BIND9

DHCP: isc-dhcp-server

FTP: vsftpd

Syslog: rsyslog

SNMP: snmpd

Backend (Dashboard Web):

Node.js

Express.js

basic-ftp (para cliente FTP)

child_process (para ejecutar comandos del sistema como ping)

Frontend (Dashboard Web):

HTML5

CSS3

JavaScript (Vanilla)

Estructura del Proyecto
C:\dev\redes3-25-2-proyecto\
│
├── .gitignore             # Archivos y carpetas a ignorar por Git
├── node_modules/          # Dependencias de Node.js (generado por npm install)
├── package-lock.json      # Bloqueo de versiones de dependencias
├── package.json           # Define el proyecto y sus dependencias
├── preparar_servidor.sh   # Script para instalar dependencias de sistema en la VM
├── public/                # Contenido que verá el cliente (frontend)
│   ├── index.html         # La página principal del dashboard
│   ├── style.css          # Estilos para la página
│   └── app.js             # Lógica del cliente (JavaScript)
├── Readme.md              # Este archivo de documentación
├── server.js              # El corazón de tu aplicación (backend)
└── start_project.sh       # Script para iniciar el servidor Node.js y configurar la red



Guía de Instalación y Ejecución
Sigue estos pasos para levantar el proyecto desde cero en la máquina virtual designada como servidor (server-escom) y acceder desde la VM cliente (client-escom).

1. Preparación de las Máquinas Virtuales (VMs) en VirtualBox y GNS3
Es crucial configurar los adaptadores de red en VirtualBox y las conexiones en GNS3 para asegurar la persistencia de IP y la conectividad adecuada.

Apaga ambas VMs (server-escom y client-escom) en VirtualBox.

Configura los Adaptadores de Red en VirtualBox (para cada VM):

Ve a Configuración > Red.

Adaptador 1 (para Internet/Host):

Habilítalo.

Adjuntar a: NAT (para acceso a Internet) o Adaptador solo anfitrión (si quieres que tu host PC acceda a la VM).

Esta será la interfaz que obtendrá IP por DHCP (ej. enp0s3).

Adaptador 2 (para GNS3):

Habilítalo.

Adjuntar a: Red interna.

Nombre: red-gns3 (o el nombre que prefieras, debe ser el mismo para todas las VMs y el Cloud en GNS3).

Esta será la interfaz para tu topología GNS3 (ej. enp0s8).

Configura el Cloud en GNS3:

Arrastra un nodo Cloud al lienzo de GNS3.

Haz clic derecho en el Cloud y selecciona Configurar.

En la pestaña Ethernet, selecciona la Red interna que creaste en VirtualBox (ej. red-gns3) y haz clic en Añadir.

Conecta la interfaz del Cloud (red-gns3) a tu Switch1 en GNS3.

Conecta tus VMs al Cloud en GNS3:

Arrastra tus VMs (server-escom y client-escom) al lienzo de GNS3.

Conecta la interfaz de Red Interna de cada VM (ej. enp0s8) al Cloud en GNS3.

2. Configuración de Red Persistente en las VMs (Netplan y cloud-init)
Para asegurar que las IPs estáticas persistan y que cloud-init no interfiera:

Inicia ambas VMs.

Identifica los nombres de tus interfaces (ip a). Generalmente enp0s3 para Internet y enp0s8 para GNS3.

Configura Netplan en cada VM:

Para server-escom (IP: 192.168.1.10):

sudo nano /etc/netplan/01-internet.yaml

network:
  version: 2
  renderer: networkd
  ethernets:
    enp0s3: # Reemplaza con el nombre real de tu interfaz de Internet
      dhcp4: yes
      optional: true

sudo nano /etc/netplan/02-gns3-static.yaml

network:
  version: 2
  renderer: networkd
  ethernets:
    enp0s8: # Reemplaza con el nombre real de tu interfaz de GNS3
      dhcp4: no
      addresses: [192.168.1.10/24]
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4] # DNS públicos para acceso a internet
      optional: true

Para client-escom (IP: 192.168.1.20):

sudo nano /etc/netplan/01-internet.yaml

network:
  version: 2
  renderer: networkd
  ethernets:
    enp0s3: # Reemplaza con el nombre real de tu interfaz de Internet
      dhcp4: yes
      optional: true

sudo nano /etc/netplan/02-gns3-static.yaml

network:
  version: 2
  renderer: networkd
  ethernets:
    enp0s8: # Reemplaza con el nombre real de tu interfaz de GNS3
      dhcp4: no
      addresses: [192.168.1.20/24]
      nameservers:
        addresses: [192.168.1.10] # ¡Apuntar al DNS de server-escom!
        search: [equipo12.com] # Para resolución de nombres cortos
      optional: true

Guarda ambos archivos en cada VM.

Aplica permisos correctos a los archivos Netplan:

sudo chmod 600 /etc/netplan/*.yaml

Deshabilita la configuración de red de cloud-init (en ambas VMs):

sudo nano /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg

Añade el contenido: network: {config: disabled}. Guarda el archivo.

Reinicia ambas VMs (sudo reboot).

Configura PC1 (VPCS) para persistencia:

En la consola de PC1: ip 192.168.1.30 255.255.255.0

Luego: save

Guarda tu proyecto GNS3.

3. Configuración de Servicios de Red en server-escom
Asegúrate de que los servicios principales estén instalados y configurados.

Ejecuta el script preparar_servidor.sh (en server-escom con acceso a Internet):

chmod +x preparar_servidor.sh
sudo ./preparar_servidor.sh

Esto instalará Node.js, BIND9, vsftpd, rsyslog, etc.

Configuración de BIND9 (DNS):

Editar /etc/bind/named.conf.local:

zone "equipo12.com" { type master; file "/etc/bind/db.equipo12.com"; allow-update { none; }; };
zone "1.168.192.in-addr.arpa" { type master; file "/etc/bind/db.192.168.1"; allow-update { none; }; };

Crear /etc/bind/db.equipo12.com:

$TTL    604800
@       IN      SOA     ns1.equipo12.com. admin.equipo12.com. ( 3 604800 86400 2419200 604800 )
@       IN      NS      ns1.equipo12.com.
ns1     IN      A       192.168.1.10
www     IN      A       192.168.1.10
server  IN      A       192.168.1.10
client  IN      A       192.168.1.20
pc1     IN      A       192.168.1.30
r1      IN      A       192.168.1.1 ; Si R1 tuviera la IP 192.168.1.1

Crear /etc/bind/db.192.168.1:

$TTL    604800
@       IN      SOA     ns1.equipo12.com. admin.equipo12.com. ( 3 604800 86400 2419200 604800 )
@       IN      NS      ns1.equipo12.com.
10      IN      PTR     server.equipo12.com.
20      IN      PTR     client.equipo12.com.
30      IN      PTR     pc1.equipo12.com.
1       IN      PTR     r1.equipo12.com.

Verificar sintaxis: sudo named-checkconf y sudo named-checkzone ...

Reiniciar BIND9: sudo systemctl restart bind9

Configuración de vsftpd (FTP):

Editar /etc/vsftpd.conf: Asegúrate de que listen=YES, local_enable=YES, write_enable=YES estén descomentadas y listen_ipv6=YES esté comentado.

Crear usuario FTP: sudo adduser ftpuser y sudo passwd ftpuser (contraseña: April).

Reiniciar vsftpd: sudo systemctl restart vsftpd

Configuración de rsyslog (Syslog):

Crear /etc/rsyslog.d/network-events.conf:

*.* -/var/log/network-events.log

Reiniciar rsyslog: sudo systemctl restart rsyslog

Asegurar permisos del log: sudo touch /var/log/network-events.log y sudo chmod 644 /var/log/network-events.log

4. Instalación y Ejecución del Dashboard
Navega a la carpeta raíz del proyecto (C:\dev\redes3-25-2-proyecto\ en tu host, o /home/taoreta/redes3-25-2-proyecto/ en la VM).

Instala las dependencias de Node.js (en server-escom):

npm install

Asegúrate de que server.js esté configurado para el puerto 80:

Cambia const PORT = process.env.PORT || 8000; a const PORT = process.env.PORT || 80; en server.js.

Ejecuta el script de inicio del proyecto (en server-escom):

./start_project.sh

Este script detendrá NetworkManager, aplicará Netplan e iniciará tu servidor Node.js con sudo.

5. Acceso y Pruebas desde client-escom
Abre un navegador web en client-escom.

Navega a la URL de tu dashboard:

http://www.equipo12.com

o

http://server.equipo12.com

Deberías ver la interfaz de tu dashboard.

Prueba las funcionalidades del Dashboard:

Servicio FTP: Ingresa 192.168.1.10 como host, ftpuser como usuario y April como contraseña. Haz clic en "Actualizar Lista de Archivos". Deberías ver la lista de archivos.

Visor de Syslog: Haz clic en "Actualizar Logs". Deberías ver los logs (genera algunos con logger "test log" en las VMs para poblarlo).

Pruebas de Red (Ping): Ingresa client.equipo12.com o pc1.equipo12.com y haz clic en "Ejecutar Ping". Deberías ver los resultados del ping.

Solución de Problemas Comunes
Esta sección detalla los errores comunes que puedes encontrar durante la configuración y ejecución del proyecto, junto con sus soluciones.

1. Error de FTP: 530 Login incorrect. o connect ECONNREFUSED
Este error indica que el servidor FTP (vsftpd) está rechazando la conexión debido a credenciales de inicio de sesión incorrectas o a que el servicio no está disponible o no está escuchando.

Posibles causas y soluciones:

vsftpd.service could not be found. (Servicio no instalado):

Solución: Instala vsftpd en tu VM servidor:

sudo apt update
sudo apt install vsftpd -y

Luego, inicia y habilita el servicio: sudo systemctl start vsftpd y sudo systemctl enable vsftpd.

connect ECONNREFUSED 192.168.1.10:21 (control socket) (Servicio no escuchando o bloqueado):

Solución:

Verifica el estado de vsftpd: sudo systemctl status vsftpd. Debe estar active (running). Si no, intenta iniciarlo y revisa sudo journalctl -u vsftpd.service --no-pager para ver errores de inicio.

Verifica que está escuchando: sudo ss -tulnp | grep :21. Deberías ver una línea LISTEN en el puerto 21.

Revisa /etc/vsftpd.conf:

Asegúrate de que listen=YES, local_enable=YES, write_enable=YES estén descomentadas.

Asegúrate de que listen_ipv6=YES esté comentada (si listen=YES ya está activo) para evitar conflictos de doble escucha (status=2/INVALIDARGUMENT).

Guarda y reinicia vsftpd: sudo systemctl restart vsftpd.

Firewall: Aunque lo deshabilitaste, asegúrate de que no haya reglas residuales o que no se haya reactivado. sudo ufw status debe ser inactive.

530 Login incorrect. (Credenciales incorrectas):

Solución:

Verifica el usuario y la contraseña: Asegúrate de que estás utilizando el usuario ftpuser y la contraseña April (o la que hayas configurado).

Crea el usuario si no existe: sudo adduser ftpuser y sudo passwd ftpuser.

Asegúrate de que el dashboard envía las credenciales correctas: Revisa tu public/app.js y public/index.html para que los campos de FTP envíen host: '192.168.1.10', user: 'ftpuser', password: 'April'.

2. Problemas de Persistencia de IP (La IP se desconfigura)
Si la dirección IP estática de tu VM se pierde después de un reinicio o de un tiempo, es probable que haya un servicio de gestión de red que la esté sobrescribiendo.

Posibles causas y soluciones:

cloud-init activo:

Solución: Deshabilita la configuración de red de cloud-init en la VM.

sudo nano /etc/cloud/cloud.cfg.d/99-disable-network-config.cfg

Añade el contenido: network: {config: disabled}. Guarda el archivo y reinicia la VM (sudo reboot).

NetworkManager activo y en conflicto con Netplan:

Solución: Detén y deshabilita NetworkManager en la VM. Esto se incluye automáticamente en el script start_project.sh.

sudo systemctl stop NetworkManager
sudo systemctl disable NetworkManager

Reinicia la VM (sudo reboot).

Permisos incorrectos en archivos de Netplan:

Solución: Asegúrate de que los archivos .yaml en /etc/netplan/ tengan permisos restrictivos (solo lectura/escritura para root).

sudo chmod 600 /etc/netplan/*.yaml

Luego, sudo netplan apply y reinicia la VM.

3. Error de Syslog: El archivo de log está vacío o no se encontraron logs. o NetworkError when attempting to fetch resource.
Estos errores indican que el dashboard no puede mostrar los logs de Syslog.

Posibles causas y soluciones:

NetworkError when attempting to fetch resource. (Problema de comunicación con el endpoint):

Solución: Asegúrate de que el server.js esté ejecutándose correctamente y que el endpoint /api/syslog/logs no tenga errores internos. Revisa la consola del servidor Node.js para ver si hay errores cuando intentas cargar los logs desde el cliente. Si el FTP y el Ping funcionan, la conectividad básica al servidor web es correcta.

El archivo de log está vacío o no se encontraron logs. (Archivo de logs sin contenido o inaccesible):

Solución:

Verifica el estado de rsyslog: sudo systemctl status rsyslog. Debe estar active (running).

Configura rsyslog para escribir en el archivo: Edita /etc/rsyslog.d/network-events.conf (o /etc/rsyslog.conf) y asegúrate de que la línea *.* -/var/log/network-events.log esté presente y descomentada. Reinicia rsyslog: sudo systemctl restart rsyslog.

Genera un log de prueba: logger "Mensaje de prueba para Syslog" y luego sudo tail /var/log/network-events.log para verificar que el mensaje aparezca.

Verifica permisos del archivo de logs: El usuario que ejecuta npm start (taoreta) necesita permisos de lectura sobre /var/log/network-events.log.

sudo touch /var/log/network-events.log # Asegura que el archivo exista
sudo chmod 644 /var/log/network-events.log # Asegura permisos de lectura
ls -l /var/log/network-events.log

Reinicia tu servidor Node.js (npm start) después de cualquier cambio en la configuración de rsyslog o permisos.

4. Problema de resolución DNS en cliente (nameserver 127.0.0.53 en resolv.conf)
Si tu cliente no puede resolver nombres de dominio a pesar de que el servidor DNS está configurado, es probable que systemd-resolved esté interfiriendo.

Posibles causas y soluciones:

systemd-resolved sobrescribiendo /etc/resolv.conf:

Solución: Deshabilita el stub resolver de systemd-resolved y configura /etc/resolv.conf manualmente.

Detén y deshabilita systemd-resolved:

sudo systemctl disable systemd-resolved
sudo systemctl stop systemd-resolved

Elimina el symlink y crea un archivo estático para resolv.conf:

sudo rm /etc/resolv.conf
sudo nano /etc/resolv.conf

Añade el contenido:

nameserver 192.168.1.10
search equipo12.com

Guarda y cierra.

Haz el archivo inmutable (opcional): sudo chattr +i /etc/resolv.conf.

Reinicia la VM (sudo reboot).