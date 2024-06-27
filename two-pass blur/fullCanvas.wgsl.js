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
        output.texcoord = (xy + 1.) / 2.;

        return output;
    }


    @group(0) @binding(0) var imgSampler: sampler;
    @group(0) @binding(1) var texture: texture_2d<f32>;
    @group(0) @binding(2) var<uniform> textureSize: vec2u;
    @group(0) @binding(3) var<uniform> R: i32;
    @group(0) @binding(4) var<uniform> ifHorizontalThen15: u32;

    fn sampleWeights(x: i32, r:i32) -> f32{
        return 0.9375 * (powInt(f32(x) / f32(r+1), 4) - 2. * powInt(f32(x) / f32(r+1), 2) + 1.) / f32(r+1);
    }

    fn powInt(x:f32, y:u32)->f32{
        var z = 1.;
        for (var i = u32(0); i < y; i++){
            z *= x;
        }
        return z;
    }

    @fragment fn fs(fsInput:vertexShaderOutput)->@location(0)vec4f{
        var avgColor = vec4f(0.);

        if (ifHorizontalThen15 != 15) {
            for (var i = -R; i <= R; i++){
                let thisTexCoord = fsInput.texcoord + vec2f(0, f32(i)/f32(textureSize.y));
                avgColor += sampleWeights(i, R) * textureSample(texture, imgSampler, thisTexCoord);
            }
        }else{
            for (var i = -R; i <= R; i++){
                let thisTexCoord = fsInput.texcoord + vec2f(f32(i)/f32(textureSize.x), 0);
                avgColor += sampleWeights(i, R) * textureSample(texture, imgSampler, thisTexCoord);
            }
        }

        return avgColor;
    }
`