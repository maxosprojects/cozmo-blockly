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
