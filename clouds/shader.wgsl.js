export default /*wgsl*/ `
    struct vertexShaderOutput {
        @builtin(position) position: vec4f,
        @location(0) uv: vec2f
    };

    @vertex fn vs(
        @builtin(vertex_index) vertexIndex : u32
    ) -> vertexShaderOutput {
        let pos = array( //two triangles making a quad that covers the whole screen
            vec2f(-1.0, -1.0),
            vec2f(1.0, -1.0),
            vec2f(-1.0, 1.0),

            vec2f(-1.0, 1.0),
            vec2f(1.0, -1.0),
            vec2f(1.0, 1.0)
        );

        var output: vertexShaderOutput;
        let xy = pos[vertexIndex];
        output.position = vec4f(xy, 0.0, 1.0);
        output.uv = (xy + 1.)/2.;

        return output;
    };

    //----------------------------------------

    const pi  = 3.1415926535;

    struct cameraInfo {
        position:vec3f,
        direction:vec2f
    };

    @group(0) @binding(0) var<uniform> time: u32;
    @group(0) @binding(1) var<uniform> camera: cameraInfo;

    fn rotate3d(inputVec:vec3f, yaw:f32, pitch:f32) -> vec3f{
        let angleZtoY = atan(inputVec.y/inputVec.z);
        let magZY = length(inputVec.zy);
        let newAngleZtoY = angleZtoY + pitch;
        let newY = magZY * sin(newAngleZtoY);
        let zIntermediate = magZY * cos(newAngleZtoY);

        let angleXtoZ = atan(zIntermediate / inputVec.x);
        let newAngleXtoZ = angleXtoZ + yaw;
        let magXZ = length(vec2f(zIntermediate, inputVec.x));
        var newX = magXZ*cos(newAngleXtoZ);
        var newZ = magXZ*sin(newAngleXtoZ);

        if (inputVec.x<0.) {
            newX = -newX;
            newZ = -newZ;
        }

        return vec3f(newX, newY, newZ);
    }

    fn uvToScreenDir(uv:vec2f, projectionDistance:f32)->vec3f{
        let z = projectionDistance;
        let x = uv.x * -2.0 * projectionDistance + projectionDistance;
        let yProjectionDistance = 0.75*projectionDistance;
        let y = uv.y *2.0*yProjectionDistance -yProjectionDistance;
        return normalize(vec3f(x, y, z));
    }

    @fragment fn fs(fsi:vertexShaderOutput)->@location(0)vec4f{
        let timeSec = f32(time)/1000.;
        let p = camera.position;
        let d = camera.direction;

        const projectionDistance = 1.0;

        const sunDir = normalize(vec3f(0., -1., 1.));

        let screenDir = uvToScreenDir(fsi.uv, projectionDistance);

        let worldDir = rotate3d(screenDir, d.x, d.y);

        var col = vec3f(0., 0., 0.);

        if (worldDir.y < 0.) {
            col = vec3f(0.2, 0.2, 0.2);
            col += vec3f(max(-pow(dot(vec3f(worldDir.x, -worldDir.y, worldDir.z,), sunDir), 5.), 0.));
        }else{
            if (dot(worldDir, sunDir) < -0.99){
                col = vec3f(1., 1., 1.); //looking at the sun
            }
            else{
                col = vec3f(0.0, 0.5, 1.0); //some color for the sky
            }
        }

        return vec4f(col, 1.);

        // return vec4f(worldDir.x, worldDir.y, worldDir.z, 1.);
    }
`