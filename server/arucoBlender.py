import GameLogic
from bge import logic
from mathutils import *

controller = GameLogic.getCurrentController()
own = controller.owner
scene = logic.getCurrentScene()

from aruco import Aruco
ar = Aruco()

def test():
	markers, frameBuf = ar.getData(True)
	for marker in markers:
		if marker['id'] == 6:
			print(marker)
			pos = marker['pos']
			cube = scene.objects['Cube']
			cube.worldPosition = [pos[0]/100, pos[1]/100, pos[2]/100]

