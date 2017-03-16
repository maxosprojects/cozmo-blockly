import numpy as np
from math import sqrt

def nonNegative(quat):
   # quat = np.array(quat)
   # if abs(np.sum(quat**2) - 1.0) > 1e-6:
   #    raise ValueError('Quaternion must be normalized so sum(quat**2) == 1; use "normalize"')
   return (quat if quat[3] > 0 else negate(quat))

def div(quat1, quat2):
   return mul(quat1, inv(quat2))

def mul(q1, q2):
   # mult = np.zeros(4)
   mult = [0] * 4
   mult[0] = -q1[1]*q2[1] - q1[2]*q2[2] - q1[3]*q2[3] + q1[0]*q2[0]
   mult[1] = q1[1]*q2[0] + q1[2]*q2[3] - q1[3]*q2[2] + q1[0]*q2[1]
   mult[2] = -q1[1]*q2[3] + q1[2]*q2[0] + q1[3]*q2[1] + q1[0]*q2[2]
   mult[3] = q1[1]*q2[2] - q1[2]*q2[1] + q1[3]*q2[0] + q1[0]*q2[3]
   return nonNegative(mult)

def inv(quat):
   return [quat[0], quat[1], quat[2], -quat[3]]

# def normalize(array):
#    quat = np.array(array)
#    return (quat / np.sqrt(np.dot(quat, quat))

def negate(quat):
   return [-x for x in quat]

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

