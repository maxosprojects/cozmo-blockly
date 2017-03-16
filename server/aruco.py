import cv2
import time
import numpy as np
from numpy.linalg import norm
# from rodrigues import Rodrigues
import quaternion
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

		def normalize(matrix):
			if len(matrix.shape) == 1:
				l1norm = np.abs(matrix).sum()
				ret = np.divide(matrix, l1norm)
			else:
				l1norm = norm(matrix, axis=1, ord=1)
				ret = matrix / l1norm[:, None]
			return ret

		if len(table) == 3:
			vals = list(table.values())
			p1 = vals[0]
			p2 = vals[1]
			p3 = vals[2]
			v1 = np.subtract(p1, p2)
			v2 = np.subtract(p1, p3)
			normal = normalize(np.cross(v1, v2))
			if normal[0] < 0:
				normal = -1 * normal

			tempUp = [0.0, 1.0, 0.0]
			right = normalize(np.cross(normal, tempUp))
			up = normalize(np.cross(right, normal))
			rM = np.array([
				[right[0], normal[0], up[0]],
				[right[1], normal[1], up[1]],
				[right[2], normal[2], up[2]]])
			self._sceneQuat = quaternion.fromRotationMatrix(rM)

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

		if self._sceneQuat is None:
			self._sceneQuat = [1, 0, 0, 0]
		if self._scenePos is None:
			self._scenePos = [0, 0, 0]

		ret = list()
		for i in range(len(ids)):
			rot = rotations[i][0]
			# rod = Rodrigues(rot[0], rot[1], rot[2])
			rotM, _ = cv2.Rodrigues(rot)
			# marker = ArucoMarker(int(ids[i][0]), (positions[i][0] * 1000).tolist(), rod.toQuaternion())
			quat = quaternion.fromRotationMatrix(rotM)
			quat = quaternion.div(quat, self._sceneQuat)
			marker = ArucoMarker(int(ids[i][0]), (np.subtract(positions[i][0], self._scenePos) * 1000).tolist(), quat)
			ret.append(marker.toDict())
		
		marker = ArucoMarker(5, (self._scenePos * 1000).tolist(), self._sceneQuat.tolist())
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

