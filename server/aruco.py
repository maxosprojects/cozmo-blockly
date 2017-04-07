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

renderAxes = False

with open('camera.json', 'r') as cameraJson:
    data=cameraJson.read().replace('\n', '')
    cameraData = json.loads(data)
    cameraMatrix = np.array(cameraData['cameraMatrix'])
    distCoeffs = np.array(cameraData['distCoeffs'])

class ArucoMarker(object):
	def __init__(self, id, position, rotation, seen=True, visible=True):
	# def __init__(self, id, position, rotation, arPos=[0, 0, 0], arRot=[0, 0, 0, 0], seen=True, visible=True):
	# 	'''
	# 	arPos - nontranslated position
	# 	'''
		self.id = id
		self.position = position
		self.rotation = rotation
		# self.arPos = arPos
		# self.arRot = arRot
		self.seen = seen
		self.visible = visible

	def toDict(self):
		return {
			'id': self.id,
			'pos': self.position,
			'rot': self.rotation,
			# 'arPos': self.arPos,
			# 'arRot': self.arRot,
			'seen': self.seen,
			'visible': self.visible
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
		self._aruco_lib = cv2.aruco.Dictionary_get(cv2.aruco.DICT_4X4_250)
		self._aruco_params = cv2.aruco.DetectorParameters_create()
		self._aruco_params.doCornerRefinement = True
		# self._sceneQuat = None
		# self._scenePos = None
		# self._sceneRotate = None
		# self._adjustQuat = None
		# self._adjusted = False
		self._beacons = {}

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

	def detectAruco(self, gray):
		corners, ids, _ = cv2.aruco.detectMarkers(gray, self._aruco_lib, parameters=self._aruco_params)
		return ids, corners

	def estimatePose(self, corners):
		rvecs, tvecs = cv2.aruco.estimatePoseSingleMarkers(corners, self._markerSize, cameraMatrix, None)
		# rvecs, tvecs = cv2.aruco.estimatePoseSingleMarkers(corners, self._markerSize, cameraMatrix, distCoeffs)
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

		def populateNotVisibleNotSeen(ret, visible):
			# Notify about markers that have not been seen
			notSeen = self._characters.difference(self._seen)
			for id in notSeen:
				marker = ArucoMarker(id, [0, 0, 0], [0, 0, 0, 0], seen=False, visible=False)
				ret.append(marker.toDict())

			# Notify about markers that are not visible in this frame
			notVisible = self._characters.difference(notSeen, visible)
			for id in notVisible:
				marker = ArucoMarker(id, [0, 0, 0], [0, 0, 0, 0], seen=True, visible=False)
				ret.append(marker.toDict())

			return ret

		if ids is None:
			ret = populateNotVisibleNotSeen(list(), set())
			if withFrame:
				return ret, self._prepareFrame(frame)
			else:
				return ret, None

		positions, rotations = self.estimatePose(corners)

		# if self._sceneQuat is None and not self._adjustQuat is None and not self._adjusted:
		# # if self._sceneQuat is None:
		# 	table = {}
		# 	for i in range(len(ids)):
		# 		id = ids[i][0]
		# 		if id <= 3:
		# 			table[id] = (positions[i][0], rotations[i][0])
		# 	if len(table) > 2:
		# 		self.setup(table)
		# 	elif self._sceneRotate is None:
		# 		if withFrame:
		# 			return list(), self._prepareFrame(frame, ids, corners, rotations, positions)
		# 		else:
		# 			return list(), None

		ret = list()
		visible = set()
		beacons = {}
		for i in range(len(ids)):
			id = int(ids[i][0])
			# Populate beacons
			if id < 5:
				rot = rotations[i][0]
				rotM, _ = cv2.Rodrigues(rot)
				quatFromMat = quaternions.mat2quat(rotM)
				beacons[id] = {
					'pos': positions[i][0],
					'rot': quatFromMat
				}
			# Skip markers that were not added in blockly program
			if not id in self._characters:
				continue
			self._seen.add(id)
			visible.add(id)
			# # Translate position
			# if not self._adjustQuat is None:
			# 	pos = positions[i][0]
			# 	pos = pos - self._scenePos
			# 	pos = np.dot(self._sceneRotate, pos)
			# else:
			# 	pos = np.array([0, 0, 0])
			# Establish arPos as actual marker position and its projected xy coordinates. Greately simplifies rendering in ThreeJs
			arPos = np.array(positions[i][0])
			proj, _ = cv2.projectPoints(np.array([arPos]), np.array([0, 0, 0], dtype=np.float32), np.array([0, 0, 0], dtype=np.float32), cameraMatrix, None)
			arPos *= 1000
			arPos = [arPos[0], arPos[1], arPos[2], proj[0][0][0], proj[0][0][1]]
			# Find object and AR quaternions
			rot = rotations[i][0]
			rotM, _ = cv2.Rodrigues(rot)
			quatFromMat = quaternions.mat2quat(rotM)
			# # # resRotM = np.dot(self._sceneRotate, rotM)
			# # # quat = quaternions.mat2quat(resRotM)
			# # vecFromCam = vector.normalize(arPos)
			# # # print(vecFromCam)
			# # quatFromCam = myquat.fromUnitVectors([0, 0, 1], vecFromCam)
			# # quatFromCam[0] *= (-1)
			# # # print(quatFromCam)
			# if not self._adjustQuat is None:
			# 	quat = quaternions.qmult(self._sceneQuat, quatFromMat)
			# else:
			# 	quat = np.array([1.0, 0, 0, 0])
			# # quat = quaternions.qmult(quatFromCam, quat)
			# # # quat = [1, 0, 0, 0]
			# # # quat = quatFromCam
			# # # quat = quatWithoutCam
			# # # quat = quatFromMat
			# # # quat = quaternions.qmult(self._sceneQuat, quatFromMat)
			# # # quat = quaternions.qmult(quatFromMat, self._sceneQuat)
			# # pos = np.array([0, 0, 0])
			arQuat = np.array(quatFromMat)
			arQuat[2] *= (-1)
			# Add marker
			# marker = ArucoMarker(id, (pos[:3] * 1000).tolist(), list(quat), arPos, list(arQuat))
			marker = ArucoMarker(id, arPos, list(arQuat))
			ret.append(marker.toDict())

		populateNotVisibleNotSeen(ret, visible)

		if len(beacons) > len(self._beacons):
			for key in beacons:
				self._beacons[key] = {
					'pos': list(beacons[key]['pos'] * 1000),
					'rot': list(beacons[key]['rot'])
				}

		if withFrame:
			return ret, self._prepareFrame(frame, ids, corners, rotations, positions)
		else:
			return ret, None

	def _prepareFrame(self, frame, ids=None, corners=None, rotations=None, positions=None):
		displayim = frame
		if renderAxes and not ids is None:
			displayim = cv2.aruco.drawDetectedMarkers(displayim, corners, ids)
			for i in range(len(ids)):
				displayim = cv2.aruco.drawAxis(displayim, cameraMatrix, None, rotations[i], positions[i], self._markerSize)
				# if ids[i][0] == 1 and not self._sceneRotate is None:
				# 	tvec = positions[i][0]
				# 	tvec[0] += 0.05
				# 	# print(tvec)
				# 	rvec, _ = cv2.Rodrigues(self._sceneRotate)
				# 	displayim = cv2.aruco.drawAxis(displayim, cameraMatrix, None, rvec, tvec, self._markerSize)

		# start = time.time()
		displayim = cv2.resize(displayim, None, fx=0.5, fy=0.5, interpolation = cv2.INTER_CUBIC)
		ret, buf = cv2.imencode('.jpeg', displayim, [cv2.IMWRITE_JPEG_QUALITY, 50])
		# ret, buf = cv2.imencode('.jpeg', displayim, [cv2.IMWRITE_JPEG_QUALITY, 10])
		# print('to encode', time.time() - start)
		# points, _ = cv2.projectPoints(np.array([[0, 0, 0]], dtype=np.float32), np.array([0, 0, 0], dtype=np.float32), np.array([0, 0, 0], dtype=np.float32), cameraMatrix, None)
		# print(points)
		if not ret:
			return None
		return buf.tobytes()

	def cameraSize(self):
		# return self._width / 2, self._height / 2
		return self._width, self._height

	def addCharacter(self, character):
		if character["id"] < 5 or character["id"] > 40:
			character["elements"] = []
			return character

		def updateCoords(obj, key):
			obj[key]['mx'] *= 10
			obj[key]['my'] *= 10
			obj[key]['mz'] *= 10

		for i in range(len(character["elements"])):
			element = character["elements"][i]
			element["size"]['width'] *= 10
			element["size"]['depth'] *= 10
			element["size"]['height'] *= 10
			updateCoords(element, "moveby")
			if "rotate" in element:
				updateCoords(element["rotate"], "pivot")

		if "moveby" in character:
			updateCoords(character, "moveby")

		if "rotate" in character:
			updateCoords(character["rotate"], "pivot")

		self._characters.add(character["id"])

		return character

	# def adjustGroundAngles(self, x, y, z):
	# 	deg2rad = math.pi / 180.0
	# 	self._adjustQuat = myquat.fromEuler(x * deg2rad, y * deg2rad, z * deg2rad, 'XYZ')

	# def getArInitData(self):
	# 	if self._sceneQuat is None or self._scenePos is None:
	# 		return None
	# 	else:
	# 		# http://answers.opencv.org/question/17076/conversion-focal-distance-from-mm-to-pixels/
	# 		# focal_pixel = (image_width_in_pixels * 0.5) / tan(FOV * 0.5 * PI/180)
	# 		fxPix = cameraMatrix[0][0]
	# 		fyPix = cameraMatrix[1][1]
	# 		fovx = math.atan((self._width / 2.0) / fxPix) / (math.pi * 0.5 / 180.0)
	# 		fovy = math.atan((self._height / 2.0) / fyPix) / (math.pi * 0.5 / 180.0)
	# 		data = {
	# 			'pos': (self._scenePos * 1000).tolist(),
	# 			'rot': self._sceneQuat.tolist(),
	# 			'fov': {
	# 				'x': fovx,
	# 				'y': fovy
	# 			}
	# 			# 'cameraMatrix': cameraMatrix
	# 		}
	# 		return data

	def getBeacons(self):
		if len(self._beacons) > 3:
			return self._beacons
		else:
			return None

	# def setup(self, table):
	# 	## This way suit uncalibrated camera better. However, due to the uncertainty
	# 	## with marker angles it is quite flaky. Left just in case
	# 	# table = {}
	# 	# for i in range(len(ids)):
	# 	# 	if ids[i] <= 4:
	# 	# 		table[i] = (positions[i][0], rotations[i][0])

	# 	# if len(table) > 2:
	# 	# 	# Find 'average' quaternion
	# 	# 	vals = list(table.values())

	# 	# 	def makeQuaternion(r):
	# 	# 		rotM, _ = cv2.Rodrigues(r)
	# 	# 		return quaternions.mat2quat(rotM)

	# 	# 	p = np.array(vals[0][0])
	# 	# 	q = np.array(makeQuaternion(vals[0][1]))
	# 	# 	for i in range(len(vals) - 1):
	# 	# 		pos, rot = vals[i + 1]
	# 	# 		p += pos
	# 	# 		q = myquat.slerp(q, makeQuaternion(rot), 0.5)

	# 	# 	self._sceneQuat = q
	# 	# 	self._sceneQuat[0] *= (-1)
	# 	# 	self._sceneRotate = quaternions.quat2mat(self._sceneQuat)

	# 	# 	self._scenePos = p / (-float(len(vals)))

	# 	# This is too accurate for an uncalibrated camera, but is less flaky
	# 	# and with some additional calibration coming from the blockly
	# 	# program is best

	# 	# Find 'normal' of the scene plane (table).
	# 	# The plane is described by 4 points - 4 markers on the table
	# 	p1 = np.array(table[1][0])
	# 	p2 = np.array(table[2][0])
	# 	p3 = np.array(table[3][0])
	# 	# p4 = np.array(vals[3])
	# 	v1 = vector.normalize(p2 - p1)
	# 	v2 = vector.normalize(p3 - p1)
	# 	# v3 = p2 - p4
	# 	# v4 = p3 - p4
	# 	normal1 = np.cross(v1, v2)
	# 	# normal2 = np.cross(v3, v4)
	# 	# normal = (normal1 + normal2) / 2.0
	# 	normal = normal1
	# 	# normal = normal * (-1)
	# 	# if normal[2] < 0:
	# 	# 	normal[2] *= (-1)
	# 	# if normal1[2] > 0:
	# 	# 	normal1 = -1 * normal1
	# 	# if normal2[2] > 0:
	# 	# 	normal2 = -1 * normal2

	# 	# Find quaternion between desired 'normal' and the actual 'normal' of the plane
	# 	desiredUp = [0.0, 0.0, 1.0]
	# 	# q1 = myquat.fromUnitVectors(vector.normalize(normal1), desiredUp)
	# 	# q2 = myquat.fromUnitVectors(vector.normalize(normal2), desiredUp)
	# 	# self._sceneQuat = myquat.slerp(q1, q2, 0.5)

	# 	self._sceneQuat = np.array(myquat.fromUnitVectors(normal, desiredUp))
	# 	# self._sceneQuat[0] *= (-1)
	# 	if not self._adjustQuat is None:
	# 		self._sceneQuat = quaternions.qmult(self._sceneQuat, self._adjustQuat)
	# 		self._adjusted = True

	# 	# Find center of the scene - center of mass of the triangle or center of the square
	# 	# self._scenePos = (p1 + p2 + p3 + p4) / (-4.0)

	# 	# Scene rotation point is the one which was used for normal extraction. This should give consistent results
	# 	self._scenePos = p1

	# 	# # Also adjust _sceneQuat to the fact that _scenePos isn't in the center of the scene
	# 	# p1norm = vector.normalize(p1)
	# 	# # print(p1norm)
	# 	# toCenterQuat = myquat.fromUnitVectors([0, 0, 1], p1norm)
	# 	# # toCenterQuat[0] *= (-1)
	# 	# # print(toCenterQuat)
	# 	# # self._sceneQuat = quaternions.qmult(self._sceneQuat, toCenterQuat)
	# 	# self._sceneQuat = quaternions.qmult(toCenterQuat, self._sceneQuat)

	# 	# Combined transformation matrix imposes rotation first followed by translation. Here we want translation first
	# 	# and only then - rotation.
	# 	self._sceneRotate = quaternions.quat2mat(self._sceneQuat)
	# 	# print(self._sceneRotate)
