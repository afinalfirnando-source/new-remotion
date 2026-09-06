import bpy
import math
import random
from mathutils import Vector

# ========================
# SCENE & RENDER SETUP
# ========================
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 3840
scene.render.resolution_y = 2160
scene.render.fps = 60
scene.frame_start = 1
scene.frame_end = 720  # 12 seconds at 60fps
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = "output/frame_"
scene.render.use_motion_blur = True
scene.render.motion_blur_shutter = 0.5
scene.render.use_compositing = True

# Color management for cinematic look
scene.view_settings.look = 'AgX - Base Contrast'
scene.view_settings.view_transform = 'AgX'
scene.display_settings.display_device = 'sRGB'

# ========================
# LIGHTING (HDR / Cinematic)
# ========================
# Main key light (sun-like)
bpy.ops.object.light_add(type='SUN', location=(10, -10, 15))
sun = bpy.context.active_object
sun.data.energy = 10
sun.data.angle = math.radians(1)
sun.data.color = (1.0, 0.95, 0.9)

# Fill light (cool blue)
bpy.ops.object.light_add(type='AREA', location=(-8, 8, 5))
fill = bpy.context.active_object
fill.data.energy = 500
fill.data.size = 5
fill.data.color = (0.6, 0.7, 1.0)
fill.rotation_euler = (math.radians(-30), 0, math.radians(45))

# Rim light (golden)
bpy.ops.object.light_add(type='SPOT', location=(0, -12, 3))
rim = bpy.context.active_object
rim.data.energy = 5000
rim.data.spot_size = math.radians(25)
rim.data.spot_blend = 0.5
rim.data.color = (1.0, 0.8, 0.4)
rim.rotation_euler = (math.radians(75), 0, 0)

# Ambient light to ensure scene is not too dark
bpy.ops.object.light_add(type='POINT', location=(0, 0, 0))
ambient = bpy.context.active_object
ambient.data.energy = 50
ambient.data.color = (0.8, 0.85, 1.0)

# Ground plane to catch shadows
bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, -3.5))
ground = bpy.context.active_object
ground.name = "Ground"

ground_mat = bpy.data.materials.new(name="GroundMat")
ground_mat.use_nodes = True
nodes = ground_mat.node_tree.nodes
nodes.clear()
node_out = nodes.new(type='ShaderNodeOutputMaterial')
node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
node_bsdf.inputs['Base Color'].default_value = (0.02, 0.02, 0.03, 1)
node_bsdf.inputs['Roughness'].default_value = 0.3
node_bsdf.inputs['Metallic'].default_value = 0.5
ground_mat.node_tree.links.new(node_bsdf.outputs[0], node_out.inputs['Surface'])
ground.data.materials.append(ground_mat)


# Volumetric light beam (using mesh with volume)
bpy.ops.mesh.primitive_cone_add(radius1=2, radius2=0.1, depth=20, location=(0, 0, 8))
vol_cone = bpy.context.active_object
vol_cone.rotation_euler = (math.radians(90), 0, 0)
vol_cone.scale = (1.5, 1.5, 1)
vol_cone.hide_render = True

vol_mat = bpy.data.materials.new(name="VolumetricBeam")
vol_mat.use_nodes = True
nodes = vol_mat.node_tree.nodes
nodes.clear()
node_out = nodes.new(type='ShaderNodeOutputMaterial')
node_vol = nodes.new(type='ShaderNodeVolumePrincipled')
node_vol.inputs['Density'].default_value = 0.08
node_vol.inputs['Anisotropy'].default_value = 0.3
vol_mat.node_tree.links.new(node_vol.outputs[0], node_out.inputs['Volume'])
vol_cone.data.materials.append(vol_mat)

# ========================
# HOURGLASS CREATION
# ========================
# Main glass body (two cones joined)
bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=1.2, radius2=0.05, depth=2.5, location=(0, 0, 1.25))
top_cone = bpy.context.active_object

bpy.ops.mesh.primitive_cone_add(vertices=64, radius1=0.05, radius2=1.2, depth=2.5, location=(0, 0, -1.25))
bottom_cone = bpy.context.active_object

# Join cones
bpy.ops.object.select_all(action='DESELECT')
top_cone.select_set(True)
bpy.context.view_layer.objects.active = top_cone
bottom_cone.select_set(True)
bpy.ops.object.join()
hourglass = bpy.context.active_object
hourglass.name = "Hourglass"

# Glass material
glass_mat = bpy.data.materials.new(name="Glass")
glass_mat.use_nodes = True
nodes = glass_mat.node_tree.nodes
nodes.clear()
node_out = nodes.new(type='ShaderNodeOutputMaterial')
node_glass = nodes.new(type='ShaderNodeBsdfGlass')
node_glass.inputs['IOR'].default_value = 1.45
node_glass.inputs['Roughness'].default_value = 0.05
glass_mat.node_tree.links.new(node_glass.outputs[0], node_out.inputs['Surface'])
glass_mat.blend_method = 'BLEND'
glass_mat.show_transparent_back = False
hourglass.data.materials.append(glass_mat)

# Metallic frame
bpy.ops.mesh.primitive_torus_add(major_radius=1.25, minor_radius=0.08, major_segments=64, location=(0, 0, 2.6))
frame_top = bpy.context.active_object

bpy.ops.mesh.primitive_torus_add(major_radius=1.25, minor_radius=0.08, major_segments=64, location=(0, 0, -2.6))
frame_bottom = bpy.context.active_object

bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=5.2, location=(0, 0, 0))
frame_center = bpy.context.active_object
frame_center.scale = (1.2, 1.2, 1)

# Join frames
bpy.ops.object.select_all(action='DESELECT')
for obj in [frame_top, frame_bottom, frame_center]:
    obj.select_set(True)
bpy.context.view_layer.objects.active = frame_top
bpy.ops.object.join()
frame = bpy.context.active_object
frame.name = "Frame"

frame_mat = bpy.data.materials.new(name="GoldFrame")
frame_mat.use_nodes = True
nodes = frame_mat.node_tree.nodes
nodes.clear()
node_out = nodes.new(type='ShaderNodeOutputMaterial')
node_bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
node_bsdf.inputs['Base Color'].default_value = (0.9, 0.7, 0.2, 1)
node_bsdf.inputs['Metallic'].default_value = 1.0
node_bsdf.inputs['Roughness'].default_value = 0.15
frame_mat.node_tree.links.new(node_bsdf.outputs[0], node_out.inputs['Surface'])
frame.data.materials.append(frame_mat)

# ========================
# PARTICLES (Gold Sand / Light Flow)
# ========================
# Create particle emitter inside top bulb
bpy.ops.mesh.primitive_ico_sphere_add(radius=0.8, subdivisions=2, location=(0, 0, 1.2))
emitter = bpy.context.active_object
emitter.name = "ParticleEmitter"
emitter.scale = (0.8, 0.8, 0.3)

# Hide emitter from render
emitter.hide_render = True

# Particle system
psys = emitter.modifiers.new(name="GoldFlow", type='PARTICLE_SYSTEM').particle_system
psys.settings.frame_start = 1
psys.settings.frame_end = 720
psys.settings.lifetime = 200
psys.settings.lifetime_random = 0.2
psys.settings.count = 5000
psys.settings.emit_from = 'VOLUME'
psys.settings.distribution = 'RAND'
psys.settings.object_align_factor = (0, 0, -1)

# Physics
psys.settings.physics_type = 'NEWTON'
psys.settings.mass = 0.05
psys.settings.use_rotations = True
psys.settings.rotation_factor_random = 0.5

# Render as object (small glowing sphere)
bpy.ops.mesh.primitive_ico_sphere_add(radius=0.03, subdivisions=1)
particle_obj = bpy.context.active_object
particle_obj.name = "GoldParticle"

gold_particle_mat = bpy.data.materials.new(name="GoldParticleMat")
gold_particle_mat.use_nodes = True
nodes = gold_particle_mat.node_tree.nodes
nodes.clear()
node_out = nodes.new(type='ShaderNodeOutputMaterial')
node_em = nodes.new(type='ShaderNodeEmission')
node_em.inputs['Color'].default_value = (1.0, 0.84, 0.0, 1)
node_em.inputs['Strength'].default_value = 20
gold_particle_mat.node_tree.links.new(node_em.outputs[0], node_out.inputs['Surface'])
particle_obj.data.materials.append(gold_particle_mat)
particle_obj.hide_render = False

psys.settings.render_type = 'OBJECT'
psys.settings.instance_object = particle_obj

# ========================
# CAMERA (Smooth cinematic movement)
# ========================
bpy.ops.object.camera_add(location=(6, -6, 3), rotation=(math.radians(75), 0, math.radians(45)))
camera = bpy.context.active_object
camera.name = "CinematicCamera"
camera.data.lens = 50
camera.data.dof.aperture_fstop = 2.8  # Shallow depth of field
camera.data.dof.aperture_blades = 6
scene.camera = camera

# Animate camera: slow dolly in + slight orbit (seamless loop)
# Make camera look at origin using track_to constraint
bpy.ops.object.constraint_add(type='TRACK_TO')
camera.constraints['Track To'].target = hourglass
camera.constraints['Track To'].track_axis = 'TRACK_NEGATIVE_Z'
camera.constraints['Track To'].up_axis = 'UP_Y'

for f in range(1, 721):
    t = f / 720
    angle = t * math.pi * 2  # Full circle for loop
    radius = 8 - (math.sin(t * math.pi * 2) * 1.5)  # Subtle breathing
    x = math.cos(angle) * radius
    y = math.sin(angle) * radius
    z = 3 + math.sin(t * math.pi * 4) * 0.5  # Gentle vertical float
    
    camera.location = (x, y, z)
    camera.keyframe_insert(data_path="location", frame=f)

# Set interpolation to smooth (Bezier)
try:
    for fcurve in camera.animation_data.action.fcurves:
        for kf in fcurve.keyframe_points:
            kf.interpolation = 'BEZIER'
            kf.handle_left_type = 'AUTO'
            kf.handle_right_type = 'AUTO'
except Exception:
    pass

# ========================
# COMPOSITING (Color Grading + Lens Flare)
# ========================
# Blender 5.0+ compositor API
tree = bpy.data.node_groups.new(name="CinematicComp", type='CompositorNodeTree')
tree.interface.new_socket(name="Image", in_out='INPUT', socket_type='NodeSocketColor')
tree.interface.new_socket(name="Image", in_out='OUTPUT', socket_type='NodeSocketColor')

node_render = tree.nodes.new(type='CompositorNodeRLayers')
node_render.location = (-300, 0)

node_glare = tree.nodes.new(type='CompositorNodeGlare')
if bpy.app.version >= (5, 0, 0):
    node_glare.inputs['Type'].default_value = 'Fog Glow'
    node_glare.inputs['Quality'].default_value = 'High'
    node_glare.inputs['Size'].default_value = 0.85
else:
    node_glare.glare_type = 'FOG_GLOW'
    node_glare.quality = 'HIGH'
    node_glare.size = 6
node_glare.inputs['Threshold'].default_value = 0.8
node_glare.location = (0, 0)

node_output = tree.nodes.new(type='NodeGroupOutput')
node_output.location = (300, 0)

tree.links.new(node_render.outputs["Image"], node_glare.inputs["Image"])
tree.links.new(node_glare.outputs["Image"], node_output.inputs["Image"])

scene.compositing_node_group = tree

# ========================
# WORLD SETTINGS (HDR / Volumetric)
# ========================
world = bpy.data.worlds["World"]
world.use_nodes = True
tree_w = world.node_tree
tree_w.nodes.clear()

node_tex_sky = tree_w.nodes.new(type='ShaderNodeTexSky')
node_tex_sky.sky_type = 'HOSEK_WILKIE'
node_tex_sky.sun_elevation = math.radians(15)
node_tex_sky.sun_rotation = math.radians(45)
node_tex_sky.turbidity = 2
node_tex_sky.ground_albedo = 0.3

node_bg = tree_w.nodes.new(type='ShaderNodeBackground')
node_bg.inputs['Strength'].default_value = 0.5

node_vol = tree_w.nodes.new(type='ShaderNodeVolumePrincipled')
node_vol.inputs['Density'].default_value = 0.02
node_vol.inputs['Anisotropy'].default_value = 0.2

node_out_w = tree_w.nodes.new(type='ShaderNodeOutputWorld')

tree_w.links.new(node_tex_sky.outputs[0], node_bg.inputs[0])
tree_w.links.new(node_bg.outputs[0], node_out_w.inputs[0])
tree_w.links.new(node_vol.outputs[0], node_out_w.inputs[1])

# ========================
# RENDER SETTINGS SUMMARY
# ========================
print("=" * 60)
print("CINEMATIC STOCK VIDEO SETUP COMPLETE")
print("=" * 60)
print(f"Resolution : {scene.render.resolution_x}x{scene.render.resolution_y} (4K UHD)")
print(f"FPS        : {scene.render.fps}")
print(f"Duration   : 12 seconds ({scene.frame_end} frames)")
print(f"Engine     : {scene.render.engine}")
print(f"Output     : {scene.render.filepath}####.png")
print("=" * 60)
print("Scene Elements:")
print("  - Futuristic floating hourglass (glass + gold frame)")
print("  - Flowing gold light particles (5000 instances)")
print("  - Volumetric light beam")
print("  - Cinematic 3-point lighting (Sun + Fill + Rim)")
print("  - Smooth orbiting camera with shallow DOF")
print("  - HDR sky environment")
print("  - Compositing: Color grading + Lens flare")
print("=" * 60)
print("STARTING RENDER...")
print("=" * 60)

# Clean old frames
import os
frame_dir = "output"
if not os.path.exists(frame_dir):
    os.makedirs(frame_dir)
for f in os.listdir(frame_dir):
    if f.startswith("frame_") and f.endswith(".png"):
        os.remove(os.path.join(frame_dir, f))

# Render animation
bpy.ops.render.render(animation=True)
print("Render completed!")

# Encode to video using FFmpeg
video_output = "output/cinematic_hourglass.mp4"
ffmpeg_cmd = [
    'ffmpeg', '-y',
    '-framerate', str(scene.render.fps),
    '-i', 'output/frame_%04d.png',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', '18',
    '-preset', 'slow',
    video_output
]

print("Encoding video with FFmpeg...")
try:
    subprocess.run(ffmpeg_cmd, check=True)
    print("=" * 60)
    print("VIDEO RENDER COMPLETE!")
    print("=" * 60)
    print(f"Output : {video_output}")
    print(f"Duration: 12 seconds")
    print(f"Resolution: 4K UHD (3840x2160)")
    print(f"FPS: {scene.render.fps}")
    print("=" * 60)
except subprocess.CalledProcessError as e:
    print("FFmpeg encoding failed: " + str(e))
