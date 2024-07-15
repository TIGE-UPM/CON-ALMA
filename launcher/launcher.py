import subprocess
import os
import stat
import shutil
import socket
import signal
import sys

if os.name == 'nt':  # Windows
	null_device = 'NUL'
else:  # Unix/Linux/MacOS
	null_device = '/dev/null'

def obtener_y_escribir_ip():
	s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
	try:
		# no necesitamos hacer una llamada real
		s.connect(('10.255.255.255', 1))
		ip = s.getsockname()[0]
	except Exception:
		ip = '127.0.0.1'
	finally:
		s.close()


	ruta_env_frontend = "./AgoraEval/frontend/.env"
	try:
		with open(ruta_env_frontend, "w") as file:
			file.write(f"REACT_APP_IP={ip}\n")
		print(f"\nDirección IP {ip} escrita en el archivo .env del frontend.")
	except IOError:
		print("\nHubo un error al escribir en el archivo .env del frontend.")

def modificar_credenciales_admin(nuevo_usuario, nueva_contrasena):
	ruta_api = "./AgoraEval/backend/app/server/api.py"
	try:
		with open(ruta_api, "r") as file:
			contenido = file.readlines()

		admin_changed = False
		password_changed = False
		with open(ruta_api, "w") as file:
			for linea in contenido:
				if "ADMIN_USER" in linea and not admin_changed:
					file.write(f'ADMIN_USER = "{nuevo_usuario}"\n')
					admin_changed = True
				elif "ADMIN_PASSWORD" in linea and not password_changed:
					file.write(f'ADMIN_PASSWORD = "{nueva_contrasena}"\n')
					password_changed = True
				else:
					file.write(linea)
	except IOError:
		print("Hubo un error al actualizar las credenciales del administrador.")

def mostrar_info_admin():
	user, password = "No encontrado", "No encontrado"
	try:
		with open("./AgoraEval/backend/app/server/api.py", "r") as file:
			for line in file:
				if "ADMIN_USER" in line and user == "No encontrado":
					user = line.split('=')[1].strip().replace('"', '').replace("'", "")

				elif "ADMIN_PASSWORD" in line and password == "No encontrado":
					password =  line.split('=')[1].strip().replace('"', '').replace("'", "")
	except IOError:
		print("No se pudo leer la configuración del administrador.")

	obtener_y_escribir_ip()
	print("\nInformación del administrador")
	print(f"Usuario: {user}")
	print(f"Contraseña: {password}")
	cambiar = input("\n¿Desea cambiar estas credenciales? (y/n): ")
	if cambiar.lower() == 'y':
		cambiar_credenciales()

def cambiar_credenciales():
	nuevo_usuario = input("Ingrese el nuevo usuario: ")
	nueva_contrasena = input("Ingrese la nueva contraseña: ")
	modificar_credenciales_admin(nuevo_usuario, nueva_contrasena)

def signal_handler(sig, frame):
	print('Señal de interrupción capturada, cerrando procesos...')
	if proceso_frontend.poll() is None:
		proceso_frontend.terminate()
	if proceso_backend.poll() is None:
		proceso_backend.terminate()
	sys.exit(0)

def lanzar_comandos_en_paralelo():
	# Define los comandos para frontend y backend
	comando_frontend = "npm start"
	comando_backend = "python ./app/main.py"

	# Directorios de trabajo para cada comando
	dir_frontend = "./AgoraEval/frontend"
	dir_backend = "./AgoraEval/backend"

	# Verificar si existe local.db y generarla si no existe
	if not os.path.isfile("./AgoraEval/backend/app/db/local.db"):
		generar_base_de_datos()

	# Dispositivo nulo para redirigir la salida


	# Iniciar los procesos en paralelo
	global proceso_frontend
	global proceso_backend
	print("\nIniciando frontend y backend...")
	proceso_frontend = subprocess.Popen(comando_frontend, shell=True, cwd=dir_frontend, stdout=open(null_device, 'w'), stderr=open(null_device, 'w'))
	proceso_backend = subprocess.Popen(comando_backend, shell=True, cwd=dir_backend, stdout=open(null_device, 'w'), stderr=open(null_device, 'w'))

	# Esperar a que ambos procesos terminen
	proceso_frontend.wait()
	proceso_backend.wait()

def opcion_iniciar():
	mostrar_info_admin()
	cambiar = input("\n¿Desea cambiar estas credenciales? (y/n): ")
	if cambiar.lower() == 'y':
		cambiar_credenciales()
	lanzar_comandos_en_paralelo()

def menu_existente():
	while True:
		limpiar_consola()
		print("\nBienvenido a AgoraEval . Elige una opción:")
		print("1. Iniciar programa")
		print("2. Reinstalar/Reparar")
		print("3. Eliminar programa")
		print("Para salir, presiona Ctrl + C dos veces, o cierra la ventana.\n")
		opcion = input("Ingresa tu opción (1, 2, 3): ")

		if opcion == '1':
			limpiar_consola()
			mostrar_info_admin()
			lanzar_comandos_en_paralelo()
			break
		elif opcion == '2':
			limpiar_consola()
			reinstalar_programa()
			print("Programa reinstalado correctamente.")
			menu_existente()
			break
		elif opcion == '3':
			limpiar_consola()
			eliminar_programa()
			print("Programa eliminado correctamente.")
			break
		else:
			print("Opción no válida, intenta de nuevo.")

def reinstalar_programa():
	eliminar_programa()
	instalar_backend()
	instalar_frontend()

def limpiar_consola():
	# Windows
	if os.name == 'nt':
		_ = os.system('cls')
	# Linux y macOS
	else:
		_ = os.system('clear')

def eliminar_programa():
	ruta = "./AgoraEval"

	def manejar_errores(func, path, exc_info):
		"""
		Cambiar los permisos y volver a intentar la eliminación
		"""
		if not os.access(path, os.W_OK):
			# Quitar el atributo de solo lectura y volver a intentar
			os.chmod(path, stat.S_IWUSR)
			func(path)
		else:
			raise

	confirmacion = input("¿Estás seguro de que quieres eliminar AgoraEval? (y/n): ")
	if confirmacion.lower() == 'y':
		if os.path.isdir(ruta):
			shutil.rmtree(ruta, onerror=manejar_errores)
			print("Programa eliminado correctamente.")
		else:
			print("No se encontró la carpeta AgoraEval.")
	else:
		print("Eliminación cancelada.")

def preguntar_instalar():
	if not existe_carpeta_logaquizz():
		respuesta = input("La carpeta AgoraEval no existe. ¿Desea instalar el programa? (y/n): ")
		if respuesta.lower() == 'y':
			instalar_backend()
			instalar_frontend()
	else:
		menu_existente()

def existe_carpeta_logaquizz():
	return os.path.isdir("./AgoraEval")

def generar_base_de_datos():
	comando_db = "python app/server/db_config.py"

	subprocess.call(comando_db, shell=True, cwd="./AgoraEval/backend", stdout=open(null_device, 'w'), stderr=open(null_device, 'w'))
	print("Base de datos local.db creada.")

def instalar_backend():
	if not os.path.isdir("./AgoraEval/backend"):


		print("Clonando el repositorio...")
		subprocess.call("git clone https://github.com/drosell271/AgoraEval", shell=True, stdout=open(null_device, 'w'), stderr=open(null_device, 'w'))

		print("Creando entorno virtual...")
		subprocess.call("python -m venv venv", shell=True, cwd="./AgoraEval/backend", stdout=open(null_device, 'w'), stderr=open(null_device, 'w'))

		print("Activando entorno virtual")
		if os.name == 'nt':  # Windows
			subprocess.call(".\\venv\\Scripts\\activate", shell=True, cwd="./AgoraEval/backend", stdout=open(null_device, 'w'), stderr=open(null_device, 'w'))
		else:  # Unix (Linux, macOS)
			subprocess.call("source ./venv/bin/activate", shell=True, cwd="./AgoraEval/backend", stdout=open(null_device, 'w'), stderr=open(null_device, 'w'))

		print("Actualizando pip...")
		subprocess.call("python -m pip install --upgrade pip", shell=True, cwd="./AgoraEval/backend", stdout=open(null_device, 'w'), stderr=open(null_device, 'w'))

		print("Instalando dependencias del backend...")
		subprocess.call("pip install -r requeriments.txt", shell=True, cwd="./AgoraEval/backend", stdout=open(null_device, 'w'), stderr=open(null_device, 'w'))

	else:
		print("El backend ya está configurado.")

def instalar_frontend():
	print("Instalando dependencias del frontend...")

	subprocess.call("npm i", shell=True, cwd="./AgoraEval/frontend", stdout=open(null_device, 'w'), stderr=open(null_device, 'w'))

def preguntar_instalar():
	# Registrar el handler para la señal SIGINT
	signal.signal(signal.SIGINT, signal_handler)

	if not existe_carpeta_logaquizz():
		respuesta = input("La carpeta AgoraEval no existe. ¿Desea instalar el programa? (y/n): ")
		if respuesta.lower() == 'y':
			instalar_backend()
			instalar_frontend()
			print("Programa instalado correctamente.")
			menu_existente()
	else:
		menu_existente()

def main():
	preguntar_instalar()

if __name__ == "__main__":
	main()
