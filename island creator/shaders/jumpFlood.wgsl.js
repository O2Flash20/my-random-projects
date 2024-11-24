export default /*wgsl*/ `

struct uniforms {
    stepSize: u32
}

@group(0) @binding(0) var inputTexture: texture_2d<u32>; //contains pixels with the color of their seed pixel (originally an edge)
@group(0) @binding(1) var<uniform> u: uniforms;
@group(0) @binding(2) var outputTexture: texture_storage_2d<rg32uint, write>;

const imageSize = _IS;

fn isUndefined(value: vec2u) -> bool {
    return value.x == imageSize+1 && value.y == imageSize+1;
}

fn jumpFloodDirection(centerPos: vec2i, centerValue: vec2u, centerIsUndefined: bool, otherPos: vec2i) -> vec2u {
    let otherValue = textureLoad(inputTexture, otherPos, 0).xy;

    if (!isUndefined(otherValue)) {
        if (centerIsUndefined) { return otherValue; }
        else {
            if (distance(vec2f(centerPos), vec2f(centerValue)) < distance(vec2f(centerPos), vec2f(otherValue))) { //the distance from this point to its seed is closer than the seed of the other pixel, so keep it as it is
                return centerValue;
            }
            else {
                return otherValue;
            }
        }
    }
    else { //neither of the points are defined, keep it that way
        return centerValue;
    }
}

@compute @workgroup_size(1) fn jumpFlood(
    @builtin(global_invocation_id) id: vec3<u32>
) {
    let i = vec2i(id.xy);
    let stepSize = i32(u.stepSize);

    let center = textureLoad(inputTexture, i, 0).xy;

    let centerIsUndefined = isUndefined(center);

    var outputValue = center;
    var samplePos = vec2i(0);

    samplePos = (i + vec2i(0, stepSize));
    if (samplePos.y < imageSize) {
        outputValue = jumpFloodDirection(i, outputValue, centerIsUndefined, samplePos); // up
    }

    samplePos = (i + vec2i(0, -stepSize));
    if (samplePos.y > 0) {
        outputValue = jumpFloodDirection(i, outputValue, centerIsUndefined, samplePos); // down
    }

    samplePos = (i + vec2i(stepSize, 0));
    if (samplePos.x < imageSize) {
        outputValue = jumpFloodDirection(i, outputValue, centerIsUndefined, samplePos); // right
    }

    samplePos = (i + vec2i(-stepSize, 0));
    if (samplePos.x > 0) {
        outputValue = jumpFloodDirection(i, outputValue, centerIsUndefined, samplePos); // left
    }


    samplePos = (i + vec2i(stepSize, stepSize));
    if (samplePos.x < imageSize && samplePos.y < imageSize) {
        outputValue = jumpFloodDirection(i, outputValue, centerIsUndefined, samplePos); // up-right
    }

    samplePos = (i + vec2i(-stepSize, stepSize));
    if (samplePos.x > 0 && samplePos.y < imageSize) {
        outputValue = jumpFloodDirection(i, outputValue, centerIsUndefined, samplePos); // up-left
    }

    samplePos = (i + vec2i(stepSize, -stepSize));
    if (samplePos.x < imageSize && samplePos.y > 0) {
        outputValue = jumpFloodDirection(i, outputValue, centerIsUndefined, samplePos); // down-right
    }

    samplePos = (i + vec2i(-stepSize, -stepSize));
    if (samplePos.x > 0 && samplePos.y > 0) {
        outputValue = jumpFloodDirection(i, outputValue, centerIsUndefined, samplePos); // down-left
    }


    textureStore(outputTexture, i, vec4u(outputValue.x, outputValue.y, 0, 0));
}

`