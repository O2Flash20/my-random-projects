import openvr
import pygame
from pygame.locals import *
from OpenGL.GL import *
from OpenGL.GLU import *
from PIL import Image
import numpy as np

def load_texture(image_path):
    try:
        image = Image.open(image_path)
        image = image.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
        image_data = np.array(image, dtype=np.uint8)

        texture_id = glGenTextures(1)
        glBindTexture(GL_TEXTURE_2D, texture_id)
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR)
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR)
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE)
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE)
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, image.width, image.height, 0, GL_RGBA, GL_UNSIGNED_BYTE, image_data)

        print(f"Texture {texture_id} loaded from {image_path}")
        return texture_id, image.width, image.height
    except Exception as e:
        print(f"Error loading texture from {image_path}: {e}")
        raise

def setup_opengl():
    glClearColor(0.0, 0.0, 0.0, 1.0)
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
    glEnable(GL_TEXTURE_2D)
    glEnable(GL_BLEND)
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA)
    glMatrixMode(GL_PROJECTION)
    glLoadIdentity()
    gluPerspective(110, 1.0, 0.1, 100.0)
    glMatrixMode(GL_MODELVIEW)

def draw_textured_quad(texture_id, aspect_ratio):
    glBindTexture(GL_TEXTURE_2D, texture_id)
    width = 1.0
    height = width / aspect_ratio
    glBegin(GL_QUADS)
    glTexCoord2f(0, 0); glVertex3f(-width, -height, 0)
    glTexCoord2f(1, 0); glVertex3f( width, -height, 0)
    glTexCoord2f(1, 1); glVertex3f( width,  height, 0)
    glTexCoord2f(0, 1); glVertex3f(-width,  height, 0)
    glEnd()

def render_vr_frame(vr_system, left_texture_id, right_texture_id, left_aspect_ratio, right_aspect_ratio, framebuffers, eye_textures, width, height):
    try:
        vr_compositor = openvr.VRCompositor()
        poses = openvr.TrackedDevicePose_t * openvr.k_unMaxTrackedDeviceCount
        poses = poses()

        vr_compositor.waitGetPoses(poses, None)

        # Draw left eye texture
        glBindFramebuffer(GL_FRAMEBUFFER, framebuffers[0])
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, eye_textures[0], 0)
        glViewport(0, 0, width, height)
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
        glLoadIdentity()
        glTranslatef(0.1, -0.2, -1)  # Move quad away from the viewer
        draw_textured_quad(left_texture_id, left_aspect_ratio)
        glBindFramebuffer(GL_FRAMEBUFFER, 0)
        left_eye = openvr.Texture_t()
        left_eye.handle = int(eye_textures[0])
        left_eye.eType = openvr.TextureType_OpenGL
        left_eye.eColorSpace = openvr.ColorSpace_Gamma
        vr_compositor.submit(openvr.Eye_Left, left_eye)

        # Draw right eye texture
        glBindFramebuffer(GL_FRAMEBUFFER, framebuffers[1])
        glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, eye_textures[1], 0)
        glViewport(0, 0, width, height)
        glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT)
        glLoadIdentity()
        glTranslatef(-0.1, -0.2, -1)  # Move quad away from the viewer
        draw_textured_quad(right_texture_id, right_aspect_ratio)
        glBindFramebuffer(GL_FRAMEBUFFER, 0)
        right_eye = openvr.Texture_t()
        right_eye.handle = int(eye_textures[1])
        right_eye.eType = openvr.TextureType_OpenGL
        right_eye.eColorSpace = openvr.ColorSpace_Gamma
        vr_compositor.submit(openvr.Eye_Right, right_eye)

    except Exception as e:
        print(f"An error occurred in VR rendering: {e}")

def main():
    pygame.init()
    display = (800, 600)
    pygame.display.set_mode(display, DOUBLEBUF | OPENGL)
    setup_opengl()

    image_pairs = [
        ('P1040336.png', 'P1040337.png'),
        ('P1050012.png', 'P1050013.png'),
        ('P1050127.png', 'P1050125.png')
    ]


    textures = []
    for left_image, right_image in image_pairs:
        left_texture, left_width, left_height = load_texture(left_image)
        right_texture, right_width, right_height = load_texture(right_image)
        left_aspect_ratio = left_width / left_height
        right_aspect_ratio = right_width / right_height
        textures.append((left_texture, right_texture, left_aspect_ratio, right_aspect_ratio))

    current_pair = 0

    print("OpenGL setup and texture loading completed")

    vr_system = openvr.init(openvr.VRApplication_Scene)

    width, height = vr_system.getRecommendedRenderTargetSize()

    framebuffers = glGenFramebuffers(2)
    eye_textures = glGenTextures(2)
    for texture_id in eye_textures:
        glBindTexture(GL_TEXTURE_2D, texture_id)
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0, GL_RGBA, GL_UNSIGNED_BYTE, None)
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR)
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR)
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE)
        glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE)

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.MOUSEBUTTONDOWN:
                current_pair = (current_pair + 1) % len(textures)

        left_texture_id, right_texture_id, left_aspect_ratio, right_aspect_ratio = textures[current_pair]
        render_vr_frame(vr_system, left_texture_id, right_texture_id, left_aspect_ratio, right_aspect_ratio, framebuffers, eye_textures, width, height)
        pygame.display.flip()
        pygame.time.wait(10)

    pygame.quit()
    openvr.shutdown()
    print("Pygame closed")

if __name__ == '__main__':
    main()
