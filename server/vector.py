
import math
import numpy as np

class Vector(object):
	def __init__(self, x=0, y=0, z=0):
		self.x = x
		self.y = y
		self.z = z

def normalize(v):
		leng = length(v)

		if leng == 0:
			return [0.0, 0.0, 0.0]
		else:
			return list(np.array(v) / leng)

def length(v):
	return math.sqrt(np.dot(v, v))
