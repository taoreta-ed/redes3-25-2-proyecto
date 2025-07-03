#!/bin/bash

# Nombre del script: start_project.sh
# Descripción: Script para detener NetworkManager, aplicar la configuración de red con Netplan
#              y luego iniciar el servidor Node.js.

echo "Deteniendo NetworkManager para evitar conflictos de red..."
# Es importante detenerlo antes de que Netplan aplique la configuración
sudo systemctl stop NetworkManager

echo "Aplicando configuración de red con Netplan..."
sudo netplan apply

# Espera un momento para que la red se asiente (opcional, pero puede ayudar)
sleep 2

echo "Iniciando el servidor Node.js..."
# Asegúrate de que el directorio actual sea el del proyecto para que npm start funcione
# Si tu script no se ejecuta desde la raíz del proyecto, necesitarías:
# cd /home/taoreta/redes3-25-2-proyecto/
sudo npm start
