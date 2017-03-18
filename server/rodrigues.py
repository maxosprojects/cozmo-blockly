
import math
from vector import Vector

class Rodrigues(object):
	def __init__(self, x, y, z):
		ax = abs(x)
		ay = abs(y)
		az = abs(z)

		mx = max(ax,ay)
		mx = max(mx,az)
		
		if mx == 0:
			self.theta = 0;
			self.unitAxisRotation = Vector(1,0,0)
		else:
			x /= mx
			y /= mx
			z /= mx
			self.theta = math.sqrt(x*x + y*y + z*z)
			self.unitAxisRotation = Vector(x/self.theta, y/self.theta, z/self.theta)
			self.theta *= mx

	def toQuaternion(self):
		w = math.cos(self.theta / 2.0)
		s = math.sin(self.theta / 2.0)

		x = self.unitAxisRotation.x * s
		y = self.unitAxisRotation.y * s
		z = self.unitAxisRotation.z * s

		return [w, x, y, z]
