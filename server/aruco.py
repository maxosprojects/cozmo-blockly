import cv2
import time
import numpy as np
from numpy.linalg import norm
from rodrigues import Rodrigues
import quaternion as myquat
import transforms3d.quaternions as quaternions
import transforms3d.utils as utils3d
import transforms3d.affines as affines
import json
import math
import vector

with open('camera.json', 'r') as cameraJson:
    data=cameraJson.read().replace('\n', '')
    cameraData = json.loads(data)
    cameraMatrix = np.array(cameraData['cameraMatrix'])
    distCoeffs = np.array(cameraData['distCoeffs'])

class ArucoMarker(object):
	def __init__(self, id, position, rotation):
		self.id = id
		self.position = position
		self.rotation = rotation

	def toDict(self):
		return {
			'id': self.id,
			'pos': self.position,
			'rot': self.rotation,
			'seen': True,
			'visible': True
		}

class Aruco(object):
	def __init__(self):
		# width = 640
		# height = 480
		self._width = 1280
		self._height = 720
		self._markerSize = 0.03
		self._characters = set()
		self._seen = set()
		self._adjustQuat = [0, 0, 0, 0]

		print('Initializing Aruco')
		self._cap = cv2.VideoCapture(0)
		# Set resolution.
		self._cap.set(3, self._width)
		self._cap.set(4, self._height)

		# Try to access camera.
		i = 0
		grabbed, frame = self._cap.read()
		while not grabbed and i < 30:
			grabbed, frame = self._cap.read()
			i += 1
			time.sleep(0.1)
		if not grabbed:
			raise Exception("Cannot access camera for Aruco markers detection")

		print("Actual camera size:", frame.shape)
		self._height = frame.shape[0]
		self._width = frame.shape[1]

		self._aruco_lib = cv2.aruco.Dictionary_get(cv2.aruco.DICT_4X4_250)
		self._aruco_params = cv2.aruco.DetectorParameters_create()
		self._aruco_params.doCornerRefinement = True
		self._sceneQuat = None
		self._scenePos = None

	def detectAruco(self, gray):
		corners, ids, _ = cv2.aruco.detectMarkers(gray, self._aruco_lib, parameters=self._aruco_params)
		return ids, corners

	def estimatePose(self, corners):
		rvecs, tvecs = cv2.aruco.estimatePoseSingleMarkers(corners, self._markerSize, cameraMatrix, None)
		return tvecs, rvecs

	def getData(self, withFrame=False):
		"""
		Returns (markerDataList, frame) tuple.
		'markerDataList' is a list of dictionaries representing markers and obrained from ArucoMarker.toDict().
		If 'withFrame' is True then current resized frame is returned as a bytearray, None otherwise.
		"""
		grabbed, frm = self._cap.read()

		# frame = cv2.undistort(frm, cameraMatrix, distCoeffs)
		frame = frm

		gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
		(ids, corners) = self.detectAruco(gray)

		if ids is None:
			if withFrame:
				return list(), self._prepareFrame(frame)
			else:
				return list(), None

		positions, rotations = self.estimatePose(corners)

		## This way suits uncalibrated camera better. However, due to the uncertainty
		## with marker angles it is quite flaky. Left just in case
		# table = {}
		# for i in range(len(ids)):
		# 	if ids[i] <= 4:
		# 		table[i] = (positions[i][0], rotations[i][0])

		# if len(table) > 2:
		# 	# Find 'average' quaternion
		# 	vals = list(table.values())

		# 	def makeQuaternion(r):
		# 		rotM, _ = cv2.Rodrigues(r)
		# 		return quaternions.mat2quat(rotM)

		# 	p = np.array(vals[0][0])
		# 	q = np.array(makeQuaternion(vals[0][1]))
		# 	for i in range(len(vals) - 1):
		# 		pos, rot = vals[i + 1]
		# 		p += pos
		# 		q = myquat.slerp(q, makeQuaternion(rot), 0.5)

		# 	self._sceneQuat = q
		# 	self._sceneQuat[0] *= (-1)
		# 	self._sceneRotate = quaternions.quat2mat(self._sceneQuat)

		# 	self._scenePos = p / (-float(len(vals)))

		# This is too accurate for an uncalibrated camera, but is less flaky
		# and with some additional calibration coming from the blockly
		# program is best
		table = {}
		for i in range(len(ids)):
			if ids[i] <= 4:
				table[i] = positions[i][0]

		if len(table) == 4:
			# Find 'normal' of the scene plane (table).
			# The plane is described by 4 points - 4 markers on the table
			vals = list(table.values())
			p1 = np.array(vals[0])
			p2 = np.array(vals[1])
			p3 = np.array(vals[2])
			p4 = np.array(vals[3])
			v1 = p2 - p1
			v2 = p3 - p1
			v3 = p2 - p4
			v4 = p3 - p4
			normal1 = np.cross(v1, v2)
			normal2 = np.cross(v3, v4)
			# normal = (normal1 + normal2) / 2.0
			# normal = normal1
			# if normal[2] > 0:
			# 	normal = -1 * normal
			if normal1[2] > 0:
				normal1 = -1 * normal1
			if normal2[2] > 0:
				normal2 = -1 * normal2

			# Find quaternion between desired 'normal' and the actual 'normal' of the plane
			desiredUp = [0.0, 0.0, 1.0]
			q1 = myquat.fromUnitVectors(vector.normalize(normal1), desiredUp)
			q2 = myquat.fromUnitVectors(vector.normalize(normal2), desiredUp)
			self._sceneQuat = myquat.slerp(q1, q2, 0.5)

			# Find center of the scene - center of mass of the triangle
			self._scenePos = (p1 + p2 + p3 + p4) / (-4.0)

			# Combined transformation matrix imposes rotation first followed by translation. Here we want translation first
			# and only then - rotation.
			self._sceneRotate = quaternions.quat2mat(self._sceneQuat)

		if self._sceneQuat is None:
			if withFrame:
				return list(), self._prepareFrame(frame, ids, corners, rotations, positions)
			else:
				return list(), None

		ret = list()
		visible = set()
		for i in range(len(ids)):
			id = int(ids[i][0])
			# Skip markers that were not added in blockly program
			if not id in self._characters:
				continue
			self._seen.add(id)
			visible.add(id)
			# Find object quaternion
			rot = rotations[i][0]
			rotM, _ = cv2.Rodrigues(rot)
			if id == 10:
				quat = quaternions.mat2quat(rotM)
			elif id == 6:
				quat = self._sceneQuat
			else:
				resRotM = np.dot(self._sceneRotate, rotM)
				quat = quaternions.mat2quat(resRotM)
			# Adjust here when image isn't undistorted. That depends on camera pose
			# quat = quaternions.qmult(quat, [-0.994, 0.094, -0.024, -0.058])
			# quat = quaternions.qmult(quat, self._adjustQuat)
			# Translate position
			pos = positions[i][0]
			pos = pos + self._scenePos
			pos = np.dot(self._sceneRotate, pos)
			# pos = np.array([0, 0, 0])
			marker = ArucoMarker(id, (pos[:3] * 1000).tolist(), list(quat))
			ret.append(marker.toDict())

		# Notify about markers that have not been seen
		notSeen = self._characters.difference(self._seen)
		for id in notSeen:
			ret.append({'id': id, 'pos': {'x': 0, 'y': 0, 'z': 0}, 'rot': [0, 0, 0, 0], 'seen': False, 'visible': False})

		# Notify about markers that are not visible in this frame
		notVisible = self._characters.difference(notSeen, visible)
		for id in notVisible:
			ret.append({'id': id, 'pos': {'x': 0, 'y': 0, 'z': 0}, 'rot': [0, 0, 0, 0], 'seen': True, 'visible': False})

		if withFrame:
			return ret, self._prepareFrame(frame, ids, corners, rotations, positions)
		else:
			return ret, None

	def _prepareFrame(self, frame, ids=None, corners=None, rotations=None, positions=None):
		displayim = frame
		if not ids is None:
			displayim = cv2.aruco.drawDetectedMarkers(displayim, corners, ids)
			for i in range(len(ids)):
				displayim = cv2.aruco.drawAxis(displayim, cameraMatrix, None, rotations[i], positions[i], self._markerSize)
		displayim = cv2.resize(displayim, None, fx=0.5, fy=0.5, interpolation = cv2.INTER_CUBIC)
		ret, buf = cv2.imencode('.jpeg', displayim)
		if not ret:
			return None
		return buf.tobytes()

	def cameraSize(self):
		return self._width / 2, self._height / 2

	def addCharacter(self, character):
		if character["id"] < 5 or character["id"] > 40:
			character["elements"] = []
			return character

		for i in range(len(character["elements"])):
			element = character["elements"][i]
			element["size"]['width'] *= 10
			element["size"]['depth'] *= 10
			element["size"]['height'] *= 10
			element["moveby"]['mx'] *= 10
			element["moveby"]['my'] *= 10
			element["moveby"]['mz'] *= 10

		self._characters.add(character["id"])

		return character

	def adjustCharacterAngles(self, x, y, z):
		deg2rad = math.pi / 180.0
		self._adjustQuat = myquat.fromEuler(x * deg2rad, y * deg2rad, z * deg2rad)
