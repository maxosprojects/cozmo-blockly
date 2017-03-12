import cozmo
from cozmo.util import degrees, radians, distance_mm, speed_mmps, Position, Pose, Rotation, pose_z_angle, rotation_z_angle
import time
import threading
import math
import quaternion
from cozmocommon import *
import json

class CozmoBot:
	def __init__(self):
		self._r3dClient = None
		# Empty object.
		self._robot = type('', (), {})()
		self._robot.pose = pose_z_angle(0, 0, 0, degrees(0))

	def start(self, code):
		highlighter = Highlighter()
		highlighter.start()

		from ws4py.client.threadedclient import WebSocketClient

		self._r3dClient = WebSocketClient('ws://localhost:9090/3dPub')
		self._r3dClient.connect()

		bot = self
		exec(code, locals(), locals())

	def _update3d(self):
		# Feed robot data
		def getData(pose):
			if not pose:
				return {
					'x': 0,
					'y': 0,
					'z': 0,
					'rot': (0, 0, 0, 0)
				}
			pos = pose.position
			rot = pose.rotation.q0_q1_q2_q3
			return {
					'x': pos.x,
					'y': pos.y,
					'z': pos.z,
					'rot': rot
				}

		def getCubeData():
			data = getData(None)
			data['seen'] = False
			data['visible'] = False
			return data

		data = {
			'cozmo': getData(self._robot.pose),
			'cubes': [
				getCubeData(),
				getCubeData(),
				getCubeData()
			]
		}
		self._r3dClient.send(json.dumps(data))

	def resetCustomObjects(self):
		pass

	def playAnimation(self, animation):
		pass

	def playEmotion(self, emotion):
		pass

	def lift(self, height):
		pass

	def head(self, angle):
		pass

	def getCubeNumber(self, cube):
		return cozmo.objects.LightCube1Id

	def getCubeSeen(self, cube_num):
		return False

	def getCubeIsVisible(self, cube_num):
		return False

	def getDistanceToCube(self, cube_num):
		return 100000

	def getDistanceBetweenCubes(self, cube1_num, cube2_num):
		return 100000

	def pickupCube(self, cube_num):
		return True

	def placeCubeOnGround(self, cube_num):
		return True

	def placeCubeOnCube(self, other_cube_num):
		return True

	def gotoOrigin(self):
		res = self._robot.go_to_pose(self._origin).wait_for_completed()
		return res.state == cozmo.action.ACTION_SUCCEEDED

	def say(self, text):
		return True

	def enableFreeWill(self, enable):
		return True

	def stop(self):
		pass

	def delay(self, seconds):
		time.sleep(seconds)

	def turn(self, angle):
		'''
		Pretends to take 2 seconds per 180 degrees, with 10 iterations per second.
		'''
		finalAngle = self._robot.pose.rotation.angle_z.degrees + angle
		iterations = abs(int(angle / 180.0 * 2 / 0.1))
		if iterations == 0:
			return
		section = angle / iterations
		for i in range(iterations):
			self._robot.pose._rotation = rotation_z_angle(degrees(self._robot.pose.rotation.angle_z.degrees + section))
			self._update3d()
			time.sleep(0.1)
		self._robot.pose._rotation = rotation_z_angle(degrees(finalAngle))
		self._update3d()

	def turnTowardCube(self, cube_num):
		return True

	def driveDistanceWithSpeed(self, distance, speed):
		finalX = self._robot.pose.position.x + math.cos(self._robot.pose.rotation.angle_z.radians) * distance * 10
		finalY = self._robot.pose.position.y + math.sin(self._robot.pose.rotation.angle_z.radians) * distance * 10
		iterations = abs(int(distance / speed / 0.1))
		sectionX = (finalX - self._robot.pose.position.x) / iterations
		sectionY = (finalY - self._robot.pose.position.y) / iterations
		for i in range(iterations):
			self._robot.pose._position._x = self._robot.pose.position.x + sectionX
			self._robot.pose._position._y = self._robot.pose.position.y + sectionY
			self._update3d()
			time.sleep(0.1)
		self._robot.pose._position._x = finalX
		self._robot.pose._position._y = finalY
		self._update3d()

	def driveWheelsWithSpeed(self, lSpeed, rSpeed):
		pass

	def driveTo(self, x, y):
		distX = x - self._robot.pose.position.x / 10.0
		distY = y - self._robot.pose.position.y / 10.0
		angleRad = math.atan2(distY, distX)
		angleDeg = angleRad * 180 / math.pi
		print(angleDeg)
		self.turn(angleDeg - self._robot.pose.rotation.angle_z.degrees)
		dist = math.sqrt(distX * distX + distY * distY)
		self.driveDistanceWithSpeed(dist, 10)

	def waitForTap(self):
		return cozmo.objects.LightCube1Id

	def addStaticObject(self, x1, y1, x2, y2, depth, height):
		print("[Bot] Executing addStaticObject({},{},{},{},{},{})".format(x1, y1, x2, y2, depth, height))
		# X1 = x1 * 10
		# Y1 = y1 * 10
		# X2 = x2 * 10
		# Y2 = y2 * 10
		# HEIGHT = height * 10

		# DEPTH = depth * 10
		# WIDTH = math.sqrt(math.pow(X1 - X2, 2) + math.pow(Y1 - Y2, 2))
		# centerX = (X1 + X2) / 2.0
		# centerY = (Y1 + Y2) / 2.0
		# centerZ = HEIGHT / 2.0
		# angle = math.atan2(Y1 - Y2, X1 - X2)
		# pose = Pose(centerX, centerY, centerZ, angle_z=radians(angle))
		# self._robot.world.create_custom_fixed_object(self._origin.define_pose_relative_this(pose), WIDTH, DEPTH, HEIGHT)
