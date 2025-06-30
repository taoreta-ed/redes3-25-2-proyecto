#!/bin/bash

# ==============================================================================
# Script de preparación para el Servidor de Servicios del Proyecto ESCOM
# Instala: Node.js, NPM, BIND9 (DNS), vsftpd (FTP)
# ==============================================================================

echo "--- Iniciando actualización de paquetes ---"
sudo apt-get update
sudo apt-get upgrade -y

echo "--- Instalando dependencias y servicios ---"
# build-essential es necesario para compilar algunos paquetes de npm si fuera necesario
# nodejs y npm para el servidor web
# bind9 para el servicio DNS obligatorio [cite: 17]
# vsftpd para el servicio FTP
sudo apt-get install -y nodejs npm build-essential bind9 vsftpd

echo "--- Verificando versiones instaladas ---"
echo "Node.js:"
node -v
echo "NPM:"
npm -v
echo "BIND9 (named):"
named -v
echo "vsftpd:"
vsftpd -v

echo "--- Script de preparación finalizado ---"
echo "Recuerda configurar cada servicio (BIND, vsftpd, rsyslog) según los requerimientos del proyecto."