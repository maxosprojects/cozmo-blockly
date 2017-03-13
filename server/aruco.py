import cv2
import time
import numpy as np

# width = 640
# height = 480
width = 1280
height = 960

cameraMatrix = np.array([[ 1346.22773, 0, 212.547040], [ 0, 1410.94807, 350.119588], [ 0, 0, 1]])

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
		self._cap = cv2.VideoCapture(1)
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

	def detectAruco(self, gray):
		(corners, ids, _) = cv2.aruco.detectMarkers(gray, self._aruco_lib, parameters=self._aruco_params)
		return (ids, corners)

	# def annotateAruco(image, ids, corners, scale_factor=None):
	# 	if scale_factor:
	# 		scaled_corners = [ np.multiply(corner, scale_factor) for corner in corners ]
	# 		displayim = cv2.aruco.drawDetectedMarkers(image, scaled_corners, ids)
	# 	else:
	# 		displayim = cv2.aruco.drawDetectedMarkers(image, corners, ids)
	# 	return displayim

	def estimatePose(self, corners):
		rvecs, tvecs = cv2.aruco.estimatePoseSingleMarkers(corners, 0.03, cameraMatrix, None)

		# for i in range(len(mrvecs)):
		# 	displayim = cv2.aruco.drawAxis(displayim, cameraMatrix, None, mrvecs[i], mtvecs[i], 0.03)
		return tvecs, rvecs

	def getMarkers(self):
		grabbed, frame = self._cap.read()

		gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
		(ids, corners) = self.detectAruco(gray)

		if ids is None:
			return list()

		# found1 = None
		# found35 = None
		# for i in range(len(ids)):
		# 	if ids[i] == 1:
		# 		found1 = corners[i]
		# 	if ids[i] == 35:
		# 		found35 = corners[i]
		# if not found1 or not found35:
		# 	return list()

		ret = list()
		positions, rotations = self.estimatePose(corners)
		for i in range(len(ids)):
			marker = ArucoMarker(int(ids[i][0]), positions[i][0].tolist(), rotations[i][0].tolist())
			ret.append(marker.toDict())

		return ret

