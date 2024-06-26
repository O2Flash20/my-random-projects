export default /*wgsl*/ `
    struct vertexShaderOutput {
        @builtin(position) position: vec4f,
        @location(0) texcoord: vec2f
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
        output.texcoord = (xy + 1.)/2.;

        return output;
    }

    struct uniforms {
        time: f32,
        sunDirection:vec3f,
        textureSize:vec2u
    };

    @group(0) @binding(0) var linearSampler: sampler;
    @group(0) @binding(1) var nearestSampler: sampler;
    @group(0) @binding(2) var colorTexture: texture_2d<f32>;
    @group(0) @binding(3) var depthTexture: texture_2d<f32>;
    @group(0) @binding(4) var<uniform> u: uniforms;

    fn getMapHeight(samplePos:vec3f, textureSize:vec2u) -> f32{
        return textureSample(depthTexture, linearSampler, samplePos.xy/vec2f(textureSize)).r * 255.;
    }

    @fragment fn fs(fsInput:vertexShaderOutput) -> @location(0) vec4f {
        let timeSec = f32(u.time)/1000.;

        let dirToSun = -normalize(u.sunDirection);
        let sampleStep = dirToSun / length(dirToSun.xy); //the step size for sampling the depth texture

        let startPos = vec3f(
            fsInput.texcoord * vec2f(u.textureSize), 
            textureSample(depthTexture, linearSampler, fsInput.texcoord).r * 255.
        );
        var pos = startPos;

        var isInShadow = false;
        for(
            var i = u32(0);
            i * i < 4 * u.textureSize.x * u.textureSize.x + u.textureSize.y * u.textureSize.y; 
            i++
        ){
            pos += sampleStep / 4.;
            if (pos.z < getMapHeight(pos, u.textureSize)){
                isInShadow = true;
            }
        }

        let thisDepth = 255. * textureSample(depthTexture, nearestSampler, fsInput.texcoord).r;

        let depthDerivative = vec2f(
            thisDepth -
            255. * textureSample(depthTexture, nearestSampler, (fsInput.texcoord*vec2f(u.textureSize)+vec2f(1., 0.))/vec2f(u.textureSize)).r,

            thisDepth -
            255. * textureSample(depthTexture, nearestSampler, (fsInput.texcoord*vec2f(u.textureSize)+vec2f(0., 1.))/vec2f(u.textureSize)).r,
        );

        let normal = normalize(vec3f(depthDerivative, 2)); //the 2 should be 1 but 1 looks nicer :)
        let illumination = clamp(dot(normal, dirToSun), 0., 1.);

        var color = textureSample(colorTexture, nearestSampler, fsInput.texcoord);
        color *= illumination;

        if(isInShadow == true){
            return color * vec4f(0.2, 0.2, 0.2, 1.);
        }else{
            return color;
        }
    }
`