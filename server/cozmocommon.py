import time
import threading
import math
import quaternion

class Highlighter:
	def __init__(self):
		self._client = None

	def start(self):
		from ws4py.client.threadedclient import WebSocketClient

		self._client = WebSocketClient('ws://localhost:9090/highlightPub')
		self._client.connect()

	def send(self, block):
		self._client.send(block)
