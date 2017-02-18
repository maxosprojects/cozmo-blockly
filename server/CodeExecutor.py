from multiprocessing import Process
import signal, time
from cozmobot import CozmoBot
import urllib.request

class CodeExecutor():
	def __init__(self, nonsecure = False):
		self._starter = None
		self._task = None
		self._nonsecure = nonsecure
		if nonsecure:
			print("WARNING: Code will be executed in non-secure manner - Python code is accepted from the network for execution!")

	def start(self, code, app):
		self.stop()

		if self._nonsecure:
			toExecute = code
		else:
			try:
				req = urllib.request.Request(
					url='http://localhost:9091/translate',
					headers={'Content-Type': 'text/plain'},
					data=bytes(code, 'utf-8'))
				with urllib.request.urlopen(req) as f:
					toExecute = f.read().decode('utf-8')
				print('Executing code:')
				print(toExecute)
			except Exception as e:
				import traceback
				traceback.print_exc()
				raise e

		if toExecute.find("def on_start():") == -1:
			print("Block on_start() not defined")
			return

		starter_code = toExecute + """
try:
	if callable(on_cube_tapped):
		robot.world.add_event_handler(cozmo.objects.EvtObjectTapped, on_cube_tapped)
		print("added on_cube_tapped handler")
except NameError as ex:
	print(ex)
	print("on_cube_tapped handler not added")

try:
	callable(on_start)
except NameError:
	print("Block on_start() not defined")

on_start()
"""

		self._starter = Process(target=self._exec_code, args=(starter_code, app))
		self._starter.start()

	def stop(self):
		if self._starter != None:
			self._starter.terminate()
			self._starter.join()
			self._starter = None

	def _exec_code(self, code, app):

		def signal_handler(signal, frame):
			print('CodeExecutor process got ' + str(signal) + ' signal. Exitting...')
			exit(0)

		signal.signal(signal.SIGINT, signal_handler)
		signal.signal(signal.SIGTERM, signal_handler)

		bot = CozmoBot(app)
		bot.start(code)
