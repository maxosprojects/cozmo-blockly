import cv2
import time
import numpy as np
from numpy.linalg import norm
# from rodrigues import Rodrigues
import quaternion as myquat
import transforms3d.quaternions as quaternions
import transforms3d.utils as utils3d
import transforms3d.affines as affines
import json

# width = 640
# height = 480
width = 1280
height = 960

markerSize = 0.03

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
			'rot': self.rotation
		}

class Aruco(object):
	def __init__(self):
		print('Initializing Aruco')
		self._cap = cv2.VideoCapture(0)
		# Set resolution.
		self._cap.set(3, width)
		self._cap.set(4, height)

		# Try to access camera.
		i = 0
		grabbed, frame = self._cap.read()
		while not grabbed and i < 30:
			grabbed, frame = self._cap.read()
			i += 1
			time.sleep(0.1)
		if not grabbed:
			raise Exception("Cannot access camera for Aruco markers detection")

		self._aruco_lib = cv2.aruco.Dictionary_get(cv2.aruco.DICT_4X4_250)
		self._aruco_params = cv2.aruco.DetectorParameters_create()
		self._aruco_params.doCornerRefinement = True
		self._sceneQuat = None
		self._scenePos = None

	def detectAruco(self, gray):
		corners, ids, _ = cv2.aruco.detectMarkers(gray, self._aruco_lib, parameters=self._aruco_params)
		return ids, corners

	def estimatePose(self, corners):
		rvecs, tvecs = cv2.aruco.estimatePoseSingleMarkers(corners, markerSize, cameraMatrix, None)
		return tvecs, rvecs

	def getData(self, withFrame=False):
		"""
		Returns (markerDataList, frame) tuple.
		'markerDataList' is a list of dictionaries representing markers and obrained from ArucoMarker.toDict().
		If 'withFrame' is True then current resized frame is returned as a bytearray, None otherwise.
		"""
		grabbed, frame = self._cap.read()

		gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
		(ids, corners) = self.detectAruco(gray)

		if ids is None:
			if withFrame:
				return list(), self._prepareFrame(frame)
			else:
				return list(), None

		positions, rotations = self.estimatePose(corners)

		table = {}
		for i in range(len(ids)):
			if ids[i] <= 3:
				table[i] = positions[i][0]

		if len(table) == 3:
			# Find 'normal' of the scene plane (table).
			# The plane is described by 3 points - 3 markers on the table
			vals = list(table.values())
			p1 = vals[0]
			p2 = vals[1]
			p3 = vals[2]
			v1 = np.subtract(p2, p1)
			v2 = np.subtract(p3, p1)
			# normal = utils3d.normalized_vector(np.cross(v1, v2))
			normal = np.cross(v1, v2)
			if normal[0] < 0:
				normal = -1 * normal

			# Find quaternion between desired 'normal' and the actual 'normal' of the plane
			desiredUp = [0.0, 1.0, 0.0]
			# Rotation vector
			rotVect = np.cross(normal, desiredUp)
			length = np.linalg.norm(normal)
			w = length + np.dot(normal, desiredUp)
			# Make quaternion
			self._sceneQuat = utils3d.normalized_vector(np.insert(rotVect, 0, w))

			minim = np.minimum(p1, p2)
			minim = np.minimum(minim, p3)
			maxim = np.maximum(p1, p2)
			maxim = np.maximum(maxim, p3)
			pos = np.add(minim, maxim)
			pos = np.divide(pos, 2)
			self._scenePos = pos
			# positions = np.append(positions, [[pos]], axis=0)

			# ids = np.append(ids, [[10]], axis=0)
			# corners.append(corners[0])
			# rotations = np.append(rotations, [rotations[0]], axis=0)

			self._sceneTransform = affines.compose(self._scenePos, quaternions.quat2mat(self._sceneQuat), [1.0, 1.0, 1.0])

		if self._sceneQuat is None:
			if withFrame:
				return list(), self._prepareFrame(frame, ids, corners, rotations, positions)
			else:
				return list(), None

		ret = list()
		for i in range(len(ids)):
			id = int(ids[i][0])
			rot = rotations[i][0]
			rotM, _ = cv2.Rodrigues(rot)
			quat = quaternions.mat2quat(rotM)
			quat = myquat.div(quat, self._sceneQuat)
			pos = positions[i][0]
			# Translate pos
			pos = np.dot(self._sceneTransform, np.append(pos, 1))
			marker = ArucoMarker(id, (pos * 1000).tolist(), list(quat))
			# rod = Rodrigues(rot[0], rot[1], rot[2])
			# marker = ArucoMarker(int(ids[i][0]), (positions[i][0] * 1000).tolist(), rod.toQuaternion())
			ret.append(marker.toDict())
		
		marker = ArucoMarker(10, (self._scenePos * 1000).tolist(), list(self._sceneQuat))
		ret.append(marker.toDict())

		if withFrame:
			return ret, self._prepareFrame(frame, ids, corners, rotations, positions)
		else:
			return ret, None

	def _prepareFrame(self, frame, ids=None, corners=None, rotations=None, positions=None):
		displayim = frame
		if not ids is None:
			displayim = cv2.aruco.drawDetectedMarkers(displayim, corners, ids)
			for i in range(len(ids)):
				displayim = cv2.aruco.drawAxis(displayim, cameraMatrix, None, rotations[i], positions[i], markerSize)
		displayim = cv2.resize(displayim, None, fx=0.5, fy=0.5, interpolation = cv2.INTER_CUBIC)
		ret, buf = cv2.imencode('.jpeg', displayim)
		if not ret:
			return None
		return buf.tobytes()

	def cameraSize(self):
		return width / 2, height / 2

