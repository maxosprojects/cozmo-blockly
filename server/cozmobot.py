import cozmo
from cozmo.util import degrees, distance_mm, speed_mmps, Position
import time
import threading

animations = {
	"GREETING": cozmo.anim.Triggers.AcknowledgeFaceNamed,
	"SNEEZE": cozmo.anim.Triggers.PetDetectionSneeze,
	"WHAT": cozmo.anim.Triggers.CubeMovedSense,
	"WIN": cozmo.anim.Triggers.CubePounceWinSession,
	"LOSE": cozmo.anim.Triggers.CubePounceLoseSession,
	"FACEPALM": cozmo.anim.Triggers.FacePlantRoll,
	"BEEPING": cozmo.anim.Triggers.DroneModeBackwardDrivingLoop,
	"NEW_OBJECT": cozmo.anim.Triggers.AcknowledgeObject,
	"LOST_SOMETHING": cozmo.anim.Triggers.CubeMovedUpset,
	"REJECT": cozmo.anim.Triggers.CozmoSaysBadWord,
	"FAILED": cozmo.anim.Triggers.FrustratedByFailureMajor,
	"EXCITED_GREETING": cozmo.anim.Triggers.MeetCozmoFirstEnrollmentCelebration,
	"TALKY_GREETING": cozmo.anim.Triggers.InteractWithFacesInitialNamed
}

emotions = {
	"AMAZED": cozmo.anim.Triggers.MemoryMatchCozmoWinGame,
	"PLEASED": cozmo.anim.Triggers.BuildPyramidReactToBase,
	"HAPPY": cozmo.anim.Triggers.BuildPyramidSuccess,
	"UPSET": cozmo.anim.Triggers.CubePounceLoseSession,
	"ANGRY": cozmo.anim.Triggers.MemoryMatchPlayerWinGame,
	"BORED": cozmo.anim.Triggers.NothingToDoBoredEvent,
	"STARTLED": cozmo.anim.Triggers.ReactToUnexpectedMovement
}

class Highlighter:
	def __init__(self):
		self._client = None

	def start(self):
		from ws4py.client.threadedclient import WebSocketClient

		self._client = WebSocketClient('ws://localhost:9090/highlightPub')
		self._client.connect()

	def send(self, block):
		self._client.send(block)

class CozmoBot:
	def __init__(self):
		self._robot = None
		self._origin = None
		self._dataPubThread = None

	def start(self, code):
		def run(sdk_conn):
			'''The run method runs once Cozmo SDK is connected.'''
			self._robot = sdk_conn.wait_for_robot()
			self._origin = self._robot.pose
			self.cubes_to_numbers = {}
			for key in self._robot.world.light_cubes:
				self.cubes_to_numbers[self._robot.world.light_cubes.get(key).object_id] = key
			self.resetCubes()

			self._robot.camera.image_stream_enabled = True

			bot = self

			highlighter = Highlighter()
			highlighter.start()

			import cozmo
			exec(code, locals(), locals())

		self._dataPubThread = threading.Thread(target=self.feedRobotDataInThread)
		self._dataPubThread.daemon = True
		self._dataPubThread.start()

		cozmo.setup_basic_logging()
		cozmo.robot.Robot.drive_off_charger_on_connect = False
		cozmo.connect(run)
		self._robot = None

	def feedRobotDataInThread(self):
		import io
		from ws4py.client.threadedclient import WebSocketClient
		import json

		camClient = WebSocketClient('ws://localhost:9090/camPub')
		camClient.connect()

		r3dClient = WebSocketClient('ws://localhost:9090/3dPub')
		r3dClient.connect()

		print('Starting data feed')
		while True:
			if self._robot is None:
				print('No robot')
				time.sleep(0.1)
				continue
			# Feed camera
			image = self._robot.world.latest_image
			if image is None:
				print('No image')
				time.sleep(0.1)
				continue
			fobj = io.BytesIO()
			image.raw_image.save(fobj, format="jpeg")
			fobj.seek(0)
			binaryImage = fobj.read()
			if binaryImage is None:
				continue
			camClient.send(binaryImage, binary=True)
			# Feed robot data
			def getData(pose):
				# Don't fail if one of the cubes has flat battery.
				if not pose:
					return {
						'x': 0,
						'y': 0,
						'z': 0,
						'rot': (0, 0, 0, 0)
					}
				pos = pose.position
				rot = pose.rotation
				return {
						'x': pos.x,
						'y': pos.y,
						'z': pos.z,
						'rot': rot.q0_q1_q2_q3
					}

			def getCubeData(num):
				cube = self._robot.world.light_cubes.get(num)
				return getData(cube.pose)

			data = {
				'cozmo': getData(self._robot.pose),
				'cubes': [
					getCubeData(1),
					getCubeData(2),
					getCubeData(3)
				]
			}
			r3dClient.send(json.dumps(data))
			# Sleep a while
			time.sleep(0.1)

	def resetCubes(self):
		'''
		Resets position of all cubes to make them "not yet seen".
		'''
		for key in self._robot.world.light_cubes:
			cube = self._robot.world.light_cubes.get(key)
			# Don't fail if one of the cubes has flat battery.
			if cube.pose:
				cube.pose._position = Position(0, 0, 0)

	def playAnimation(self, animation):
		self._robot.play_anim_trigger(animations[animation], in_parallel=False).wait_for_completed()

	def playEmotion(self, emotion):
		self._robot.play_anim_trigger(emotions[emotion], in_parallel=False).wait_for_completed()

	def lift(self, height):
		'''
		height - float, 0=bottom to 1=top
		'''
		self._robot.set_lift_height(height).wait_for_completed()

	def head(self, angle):
		'''
		angle - degrees (low=-25, high=44.5)
		'''
		self._robot.set_head_angle(degrees(angle)).wait_for_completed()

	def getCubeNumber(self, cube):
		return self.cubes_to_numbers.get(cube.object_id)

	def getCubeSeen(self, cube_num):
		'''
		Returns whether cube has been seen since program start.
		'''
		cube = self._robot.world.light_cubes[cube_num]
		pos = cube.pose.position.x_y_z
		return not (pos == (0.0, 0.0, 0.0))

	def pickupCube(self, cube_num):
		'''
		Now this is tricky because the action is quite unreliable.
		'''
		cube = self._robot.world.light_cubes[cube_num]
		# res = self._robot.pickup_object(cube).wait_for_completed()
		# print('pickupCube res:', res)
		res = None
		while res == None or (res.state == cozmo.action.ACTION_FAILED and res.failure_reason[1] in ["repeat", "aborted"]):
		# while res == None or res.state == cozmo.action.ACTION_FAILED:
			res = self._robot.pickup_object(cube).wait_for_completed()
			print('pickupCube res:', res)
		return res.state == cozmo.action.ACTION_SUCCEEDED

	def placeCubeOnGround(self, cube_num):
		cube = self._robot.world.light_cubes[cube_num]
		res = self._robot.place_object_on_ground_here(cube).wait_for_completed()
		return res.state == cozmo.action.ACTION_SUCCEEDED

	def placeCubeOnCube(self, other_cube_num):
		'''
		Another unreliable action.
		'''
		print("[Bot] Executing placeCubeOnCube()")
		cube = self._robot.world.light_cubes[other_cube_num]
		# res.state = cozmo.action.ACTION_FAILED
		# res.failure_reason = ("repeat", "")
		res = None
		while res == None or (res.state == cozmo.action.ACTION_FAILED and res.failure_code in ["repeat", "aborted"]):
			res = self._robot.go_to_object(cube, distance_mm(100)).wait_for_completed()
			print(res)
		if res.state == cozmo.action.ACTION_SUCCEEDED:
			res = None
			while res == None or (res.state == cozmo.action.ACTION_FAILED and res.failure_code in ["repeat", "aborted"]):
				res = self._robot.place_on_object(cube).wait_for_completed()
				print(res)
			print("[Bot] placeCubeOnCube() finished")
			return res.state == cozmo.action.ACTION_SUCCEEDED
		print("[Bot] placeCubeOnCube() failed", res)
		return False

	def gotoOrigin(self):
		res = self._robot.go_to_pose(self._origin).wait_for_completed()
		return res.state == cozmo.action.ACTION_SUCCEEDED

	def say(self, text):
		print("[Bot] Executing Say: " + text)
		res = self._robot.say_text(text).wait_for_completed()
		print("[Bot] Say finished")
		return res.state == cozmo.action.ACTION_SUCCEEDED

	def stop(self):
		print("[Bot] Executing stop")
		self._robot.stop_all_motors()

	def delay(self, seconds):
		'''
		seconds - can be float for fractions of a second
		'''
		# print("[Bot] Executing delay " + str(seconds))
		time.sleep(seconds)

	def turn(self, angle):
		print("[Bot] Executing turn " + str(angle))
		res = self._robot.turn_in_place(degrees(angle)).wait_for_completed()
		print("[Bot] turn finished")
		return res.state == cozmo.action.ACTION_SUCCEEDED

	def driveDistanceWithSpeed(self, distance, speed):
		print("[Bot] Executing driveDistanceSpeed(" + str(distance) + ", " + str(speed) + ")")
		res = self._robot.drive_straight(distance_mm(distance * 10), speed_mmps(speed * 10)).wait_for_completed()
		print("[Bot] driveDistanceSpeed finished")
		return res.state == cozmo.action.ACTION_SUCCEEDED

	def driveWheelsWithSpeed(self, lSpeed, rSpeed):
		print("[Bot] Executing driveWheelsWithSpeed(" + str(lSpeed * 10) + ", " + str(rSpeed * 10) + ")")
		self._robot.drive_wheels(lSpeed, rSpeed)

	def waitForTap(self):
		print("[Bot] Executing waitForTap()")
		return self._robot.world.wait_for(cozmo.objects.EvtObjectTapped, timeout=None).obj
