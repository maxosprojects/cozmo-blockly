import cozmo
from cozmo.util import degrees, radians, distance_mm, speed_mmps, Position, Pose, Rotation, pose_z_angle, rotation_z_angle
import time
import threading
import math
import quaternion
import json
import io

class CozmoBot:
	def __init__(self, aruco):
		self._wsClient = None
		self._camClient = None
		self._dataPubThread = None
		# Empty object.
		self._robot = type('', (), {})()
		self._robot.pose = pose_z_angle(0, 0, 0, degrees(0))
		self._aruco = aruco

	def start(self, code):
		from ws4py.client.threadedclient import WebSocketClient

		self._wsClient = WebSocketClient('ws://localhost:9090/WsPub')
		self._wsClient.connect()

		self._camClient = WebSocketClient('ws://localhost:9090/camPub')
		self._camClient.connect()

		if self._aruco:
			width, height = self._aruco.cameraSize()
			data = {
				'cameraSize': {
					'width': width,
					'height': height
				}
			}
			self._wsClient.send(json.dumps(data))
			self._dataPubThread = threading.Thread(target=self.feedRobotDataInThread)
			self._dataPubThread.daemon = True
			self._dataPubThread.start()

		bot = self

		import cozmo
		import time
		exec(code, locals(), locals())

	def feedRobotDataInThread(self):
		print('Starting data feed')
		beaconsSent = False
		while True:
			markers, frameBuf = self._aruco.getData(True)
			data = {
				'aruco': markers
			}
			self._wsClient.send(json.dumps(data))

			if not beaconsSent:
				beacons = self._aruco.getBeacons()
				if not beacons is None:
					data = {
						'beacons': beacons
					}
					self._wsClient.send(json.dumps(data))
					beaconsSent = True

			# Send Aruco image
			if not frameBuf is None:
				self._camClient.send(frameBuf, binary=True)

			# Take a nap
			time.sleep(0.05)

	def highlight(self, block):
		data = {
			'highlight': block
		}
		self._wsClient.send(json.dumps(data))

	def addCharacter(self, character):
		if self._aruco:
			data = {
				'character': self._aruco.addCharacter(character)
			}
			self._wsClient.send(json.dumps(data))

	def adjustGroundAngles(self, x, y, z):
		if self._aruco:
			self._aruco.adjustGroundAngles(x, y, z)
