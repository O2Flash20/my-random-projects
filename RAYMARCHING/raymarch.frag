#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;

uniform vec2 uRes;
uniform float uTime;
uniform sampler2D uSkyTex;

// CONTROLS
const int MaxMarchingSteps = 1000;
const float MinDist = 0.0;
const float MaxDist = 1000.0;
const float Epsilon = 0.0001; //the distance needed to be considered "hitting"

const float pi = 3.1415926535897932384226;

// polynomial smooth min 2 (k=0.1)
float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * k * (1.0 / 4.0);
}

// SDFs ______________
float sphereSDF(vec3 p, vec3 pos, float radius) {
    return distance(p, pos) - radius;
}

float boxSDF(vec3 p, vec3 pos, vec3 radii, float rounding) {
    p -= pos;
    vec3 q = abs(p) - radii;
    return length(max(q, 0.)) + min(max(q.x, max(q.y, q.z)), 0.) - rounding;
}

float segmentSDF(vec3 p, vec3 a, vec3 b, float r) {
    float h = min(1.0, max(0.0, dot(p - a, b - a) / dot(b - a, b - a)));

    return length(p - a - (b - a) * h) - r;
}

float elongatedSDF(vec3 p, float l) {
    p.y -= min(l, max(0.0, p.y));

    // replace with another sdf
    return boxSDF(p, vec3(0.), vec3(1.), 0.5);
}

// 
vec4 sdIntersect(vec4 a, vec4 b) {
    return a.w > b.w ? a : b;
}
  
vec4 sdUnion(vec4 a, vec4 b) {
    return a.w < b.w? a : b;
}
 
vec4 sdDifference(vec4 a, vec4 b) {
    return a.w > -b.w? a : vec4(b.rgb,-b.w);
}

// ___________________

float sceneSDF(vec3 p) {
    float d1 = p.y;
    // float d2 = boxSDF(p, vec3(0.), vec3(1., 3., 1.), 0.1);
    float d2 = sphereSDF(p, vec3(0., 2., 0.), 2.);
    float d3 = sphereSDF(p, vec3(2., 4., 0.), 2.);
    float d0 = smin(d1, d2, 1.);

    return smin(d0, d3, 1.);
}

// eye: origin of the ray
// marchDirection: the normalized direction to march in
// start: starting distance from the eye
// end: the max distance away from the surface before giving up
float getDistToSurface(vec3 eye, vec3 marchDirection, float start, float end) {
    float depth = start;
    for (int i = 0; i < MaxMarchingSteps; i++) {
        float dist = sceneSDF(eye + depth * marchDirection);
        if (dist < Epsilon) {
            // pretty much touching, return
            return depth;
        }
        // move forward the safe amount (dist)
        depth += dist;
        if (depth >= end) {
            // hit max distance
            return end;
        }
    }
    // hit max marching steps
    return end;
}

// size: screen resolution
// screenUV: the pixel's position on screen
vec3 getRayDirection(float fov, vec2 size, vec2 screenUV) {
    vec2 xy = (screenUV * uRes) - size / 2.0;
    float z = size.y * 0.5 / tan(radians(fov) / 2.0);
    return normalize(vec3(xy, -z));
}

// estimate the normal on the surface at point p
vec3 estimateNormal(vec3 p) {
    return normalize(vec3(sceneSDF(vec3(p.x + Epsilon, p.y, p.z)) - sceneSDF(vec3(p.x - Epsilon, p.y, p.z)), sceneSDF(vec3(p.x, p.y + Epsilon, p.z)) - sceneSDF(vec3(p.x, p.y - Epsilon, p.z)), sceneSDF(vec3(p.x, p.y, p.z + Epsilon)) - sceneSDF(vec3(p.x, p.y, p.z - Epsilon))));
}

// THE IDK ZONE_________________________________________________________
/**
 * Lighting contribution of a single point light source via Phong illumination.
 * 
 * The vec3 returned is the RGB color of the light's contribution.
 *
 * k_a: Ambient color
 * k_d: Diffuse color
 * k_s: Specular color
 * alpha: Shininess coefficient
 * p: position of point being lit
 * eye: the position of the camera
 * lightPos: the position of the light
 * lightIntensity: color/intensity of the light
 *
 * See https://en.wikipedia.org/wiki/Phong_reflection_model#Description
 */
vec3 phongContribForLight(vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye, vec3 lightPos, vec3 lightIntensity) {
    vec3 N = estimateNormal(p);
    vec3 L = normalize(lightPos - p);
    vec3 V = normalize(eye - p);
    vec3 R = normalize(reflect(-L, N));

    float dotLN = clamp(dot(L, N), 0., 1.);
    float dotRV = dot(R, V);

    if (dotLN < 0.0) {
        // Light not visible from this point on the surface
        return vec3(0.0, 0.0, 0.0);
    }

    if (dotRV < 0.0) {
        // Light reflection in opposite direction as viewer, apply only diffuse
        // component
        return lightIntensity * (k_d * dotLN);
    }
    return lightIntensity * (k_d * dotLN + k_s * pow(dotRV, alpha));
}

/**
 * Lighting via Phong illumination.
 * 
 * The vec3 returned is the RGB color of that point after lighting is applied.
 * k_a: Ambient color
 * k_d: Diffuse color
 * k_s: Specular color
 * alpha: Shininess coefficient
 * p: position of point being lit
 * eye: the position of the camera
 *
 * See https://en.wikipedia.org/wiki/Phong_reflection_model#Description
 */
vec3 phongIllumination(vec3 k_a, vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye) {
    const vec3 ambientLight = 0.5 * vec3(1.0, 1.0, 1.0);
    vec3 color = ambientLight * k_a;

    vec3 light1Pos = vec3(4.0 * sin(uTime), 2.0, 4.0 * cos(uTime));
    vec3 light1Intensity = vec3(0.4, 0.4, 0.4);

    color += phongContribForLight(k_d, k_s, alpha, p, eye, light1Pos, light1Intensity);

    vec3 light2Pos = vec3(2.0 * sin(0.37 * uTime), 2.0 * cos(0.37 * uTime), 2.0);
    vec3 light2Intensity = vec3(0.4, 0.4, 0.4);

    color += phongContribForLight(k_d, k_s, alpha, p, eye, light2Pos, light2Intensity);
    return color;
}
// ________________________________________________________________

// a transform matrix for camera rotation
mat4 viewMatrix(vec3 eye, vec3 center, vec3 up) {
    vec3 f = normalize(center - eye);
    vec3 s = normalize(cross(f, up));
    vec3 u = cross(s, f);
    return mat4(vec4(s, 0.0), vec4(u, 0.0), vec4(-f, 0.0), vec4(0.0, 0.0, 0.0, 1));
}

// direct illumination
float softshadow(in vec3 rayOrigin, in vec3 marchDirection, vec3 light, float sharpness) {
    float res = 1.0;
    float prevDistToSDF = 1e20;

    float depth = MinDist;
    for (int i = 0; i < 10000000; i++) {
        if (depth > distance(rayOrigin, light)) {
            break;
        }

        float distToSDF = sceneSDF(rayOrigin + marchDirection * depth);

        if (distToSDF < Epsilon) {
            return 0.0;
        }

        float y = distToSDF * distToSDF / (2.0 * prevDistToSDF);
        float d = sqrt(distToSDF * distToSDF - y * y);

        res = min(res, sharpness * d / max(0.0, depth - y));
        prevDistToSDF = distToSDF;
        depth += distToSDF;
    }
    return res;
}

void main() {
    vec2 uv = vTexCoord;

    // set fov
    vec3 viewDir = getRayDirection(45., uRes, uv);

    // camera position
    vec3 eye = vec3(sin(uTime) * 20., 7., cos(uTime) * 20.);

    // direction looking "center"
    mat4 viewToWorld = viewMatrix(eye, vec3(0., 5., 0.), vec3(0., 1., 0.));

    vec3 worldDir = (viewToWorld * vec4(viewDir, 0.)).xyz;
    float dist = getDistToSurface(eye, worldDir, MinDist, MaxDist);

    if (dist > MaxDist - Epsilon) {
        // didn't hit anything (sky)
        float u = 0.5 + atan(worldDir.x, worldDir.z) / (2. * pi);
        float v = 0.5 + (asin(worldDir.y) / pi);

        gl_FragColor = texture2D(uSkyTex, vec2(u, v));
        return;
    }

    // hit something, find that point
    vec3 p = eye + dist * worldDir;

    // // ambient color
    // vec3 K_a = vec3(0.2, 0.2, 0.2);
    // // diffuse color
    // vec3 K_d = vec3(0.2, 0.8, 0.8);
    // // specular color
    // vec3 K_s = vec3(0.7, 1.0, 1.0);
    // float shininess = 5.0;

    // vec3 color = phongIllumination(K_a, K_d, K_s, shininess, p, eye);

    vec3 Light = vec3(sin(-uTime) * 3., 10., cos(uTime) * 3.);

    vec3 toLight = normalize(Light - p);
    float brightness = softshadow(p + estimateNormal(p) / 100., toLight, Light, 5.);

    vec3 color = estimateNormal(p) * max(brightness, 0.1);

    gl_FragColor = vec4(color, 1.0);
}

// raytracing reflections
// colors
// in sceneSDF, along with the nearest dist, include nearest color and nearest reflectivity
// vec4.w is dist, .r, .g, .b for the color
// controls with js