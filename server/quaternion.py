import numpy as np
import math

EPS = 0.000001

def nonNegative(quat):
   '''Cozmo version'''
   # quat = np.array(quat)
   # if abs(np.sum(quat**2) - 1.0) > 1e-6:
   #    raise ValueError('Quaternion must be normalized so sum(quat**2) == 1; use "normalize"')
   return (quat if quat[3] > 0 else negate(quat))

def div(quat1, quat2):
   '''Cozmo version'''
   return mul(quat1, inv(quat2))

def mul(q1, q2):
   '''Cozmo version'''
   # mult = np.zeros(4)
   mult = [0] * 4
   mult[0] = -q1[1]*q2[1] - q1[2]*q2[2] - q1[3]*q2[3] + q1[0]*q2[0]
   mult[1] = q1[1]*q2[0] + q1[2]*q2[3] - q1[3]*q2[2] + q1[0]*q2[1]
   mult[2] = -q1[1]*q2[3] + q1[2]*q2[0] + q1[3]*q2[1] + q1[0]*q2[2]
   mult[3] = q1[1]*q2[2] - q1[2]*q2[1] + q1[3]*q2[0] + q1[0]*q2[3]
   return nonNegative(mult)

def inv(quat):
   '''Cozmo version'''
   return [quat[0], quat[1], quat[2], -quat[3]]

def negate(quat):
   return [-x for x in quat]

def fromEuler(x, y, z, order='XYZ'):
  xx = x/2.0
  yy = y/2.0
  zz = z/2.0
  cx = math.cos(xx)
  cy = math.cos(yy)
  cz = math.cos(zz)
  sx = math.sin(xx)
  sy = math.sin(yy)
  sz = math.sin(zz)
  if order == 'XYZ':
    return np.array([
             cx*cy*cz - sx*sy*sz,
             cx*sy*sz + cy*cz*sx,
             cx*cz*sy - sx*cy*sz,
             cx*cy*sz + sx*cz*sy])
  elif order == 'ZYX':
    return np.array([
             cx*cy*cz + sx*sy*sz,
             sx*cy*cz - cx*sy*sz,
             cx*sy*cz + sx*cy*sz,
             cx*cy*sz - sx*cy*cz])
  elif order == 'XZY':
    return np.array([
             cx*cy*cz + sx*sy*sz,
             sx*cy*cz - cx*sy*sz,
             cx*sy*cz - sx*cy*sz,
             cx*cy*sz + sx*sy*cz])
  elif order == 'YZX':
    return np.array([
             cx*cy*cz - sx*sy*sz,
             sx*cy*cz + cx*sy*sz,
             cx*sy*cz + sx*cy*sz,
             cx*cy*sz - sx*sy*cz])

def toWlast(quat):
   '''Converts quaternion to W-last notation'''
   return [quat[1], quat[2], quat[3], quat[0]]

def fromRotationMatrix(M):
   m00 = M[0, 0]
   m01 = M[0, 1]
   m02 = M[0, 2]
   m10 = M[1, 0]
   m11 = M[1, 1]
   m12 = M[1, 2]
   m20 = M[2, 0]
   m21 = M[2, 1]
   m22 = M[2, 2]
   # symmetric matrix K
   K = np.array([
      [m00-m11-m22, 0.0,         0.0,         0.0],
      [m01+m10,     m11-m00-m22, 0.0,         0.0],
      [m02+m20,     m12+m21,     m22-m00-m11, 0.0],
      [m21-m12,     m02-m20,     m10-m01,     m00+m11+m22]])
   K /= 3.0
   # quaternion is eigenvector of K that corresponds to largest eigenvalue
   w, V = np.linalg.eigh(K)
   q = V[[3, 0, 1, 2], np.argmax(w)]
   if q[0] < 0.0:
      np.negative(q, q)
   return q

def fromUnitVectors(vFrom, vTo):
   r = np.dot(vFrom, vTo) + 1.0

   if r < EPS:
      r = 0.0
      if abs(vFrom[0]) > abs(vFrom[2]):
         v = [-vFrom[1], vFrom[0], 0]
      else:
         v = [0, -vFrom[2], vFrom[1]]
   else:
      v = np.cross(vFrom, vTo)

   return normalize([r, v[0], v[1], v[2]])

def normalize(q):
  leng = length(q)

  if leng == 0:
    return [1.0, 0.0, 0.0, 0.0]
  else:
    return list(np.array(q) / leng)

def length(q):
  return math.sqrt(np.dot(q, q))

def invWfirst(qin):
  '''Non-Cozmo version with W going first'''
  q = np.array(qin)
  q[0] = -q[0]
  return q

def slerp( a, b, t ):

  qa = np.array(a)
  qb = np.array(b)

  res = np.array([0, 0, 0, 0])

  if t == 0:
    return qa;
  if t == 1:
    return np.array(qb)

  x = qa[1]
  y = qa[2]
  z = qa[3]
  w = qa[0]

  # http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

  cosHalfTheta = w * qb[0] + x * qb[1] + y * qb[2] + z * qb[3]

  if cosHalfTheta < 0:
    res[0] = -qb[0]
    res[1] = -qb[1]
    res[2] = -qb[2]
    res[3] = -qb[3]

    cosHalfTheta = -cosHalfTheta;
  else:
    res = np.array(qb)

  if cosHalfTheta >= 1.0:
    res[0] = w
    res[1] = x
    res[2] = y
    res[3] = z

    return res

  sinHalfTheta = math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta )

  if abs( sinHalfTheta ) < 0.001:
    res[0] = 0.5 * ( w + qa[0] )
    res[1] = 0.5 * ( x + qa[1] )
    res[2] = 0.5 * ( y + qa[2] )
    res[3] = 0.5 * ( z + qa[3] )

    return res

  halfTheta = math.atan2( sinHalfTheta, cosHalfTheta )
  ratioA = math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta
  ratioB = math.sin( t * halfTheta ) / sinHalfTheta

  res[0] = ( w * ratioA + qa[0] * ratioB )
  res[1] = ( x * ratioA + qa[1] * ratioB )
  res[2] = ( y * ratioA + qa[2] * ratioB )
  res[3] = ( z * ratioA + qa[3] * ratioB )

  return res
