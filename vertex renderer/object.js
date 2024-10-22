import * as mat4 from "./gl-matrix/mat4.js"
import * as vec3 from "./gl-matrix/vec3.js"

export const CubeVertices = [
    // front
    { pos: [-1, -1, 1], norm: [0, 0, 1], uv: [0, 0], },
    { pos: [1, -1, 1], norm: [0, 0, 1], uv: [1, 0], },
    { pos: [-1, 1, 1], norm: [0, 0, 1], uv: [0, 1], },

    { pos: [-1, 1, 1], norm: [0, 0, 1], uv: [0, 1], },
    { pos: [1, -1, 1], norm: [0, 0, 1], uv: [1, 0], },
    { pos: [1, 1, 1], norm: [0, 0, 1], uv: [1, 1], },
    // right
    { pos: [1, -1, 1], norm: [1, 0, 0], uv: [0, 0], },
    { pos: [1, -1, -1], norm: [1, 0, 0], uv: [1, 0], },
    { pos: [1, 1, 1], norm: [1, 0, 0], uv: [0, 1], },

    { pos: [1, 1, 1], norm: [1, 0, 0], uv: [0, 1], },
    { pos: [1, -1, -1], norm: [1, 0, 0], uv: [1, 0], },
    { pos: [1, 1, -1], norm: [1, 0, 0], uv: [1, 1], },
    // back
    { pos: [1, -1, -1], norm: [0, 0, -1], uv: [0, 0], },
    { pos: [-1, -1, -1], norm: [0, 0, -1], uv: [1, 0], },
    { pos: [1, 1, -1], norm: [0, 0, -1], uv: [0, 1], },

    { pos: [1, 1, -1], norm: [0, 0, -1], uv: [0, 1], },
    { pos: [-1, -1, -1], norm: [0, 0, -1], uv: [1, 0], },
    { pos: [-1, 1, -1], norm: [0, 0, -1], uv: [1, 1], },
    // left
    { pos: [-1, -1, -1], norm: [-1, 0, 0], uv: [0, 0], },
    { pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [1, 0], },
    { pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [0, 1], },

    { pos: [-1, 1, -1], norm: [-1, 0, 0], uv: [0, 1], },
    { pos: [-1, -1, 1], norm: [-1, 0, 0], uv: [1, 0], },
    { pos: [-1, 1, 1], norm: [-1, 0, 0], uv: [1, 1], },
    // top
    { pos: [1, 1, -1], norm: [0, 1, 0], uv: [0, 0], },
    { pos: [-1, 1, -1], norm: [0, 1, 0], uv: [1, 0], },
    { pos: [1, 1, 1], norm: [0, 1, 0], uv: [0, 1], },

    { pos: [1, 1, 1], norm: [0, 1, 0], uv: [0, 1], },
    { pos: [-1, 1, -1], norm: [0, 1, 0], uv: [1, 0], },
    { pos: [-1, 1, 1], norm: [0, 1, 0], uv: [1, 1], },
    // bottom
    { pos: [1, -1, 1], norm: [0, -1, 0], uv: [0, 0], },
    { pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 0], },
    { pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 1], },

    { pos: [1, -1, -1], norm: [0, -1, 0], uv: [0, 1], },
    { pos: [-1, -1, 1], norm: [0, -1, 0], uv: [1, 0], },
    { pos: [-1, -1, -1], norm: [0, -1, 0], uv: [1, 1], },
]

export class Object {
    constructor(x, y, z, materialIndex, contextInfo) { //*contextInfo should contain .device, .formats (the formats of the outputs of the rasterizer), .renderCode, .cameraUniformBuffer
        this.x = x
        this.y = y
        this.z = z
        this.rotX = 0
        this.rotY = 0
        this.rotZ = 0
        this.scaleX = 1
        this.scaleY = 1
        this.scaleZ = 1

        this.material = materialIndex

        this.ci = contextInfo

        this.transformationMatrix = mat4.create(); this.rotationMatrix = mat4.create()

        this.transformationSize = 256 // transformationBindGroup offset must be 256-byte aligned
        this.matrixSize = 4 * 4 * 4 //a 4x4 matrix, 4 bytes per entry

        this.vertices = []
        this.perVertex = 1 + 3 + 3 + 2 //bytes per vertex: 1d material, 3d pos, 3d norm, 2d uv
        this.stride = this.perVertex * 4 //the number of bits per vertex

        const module = this.ci.device.createShaderModule({ code: this.ci.renderCode })

        this.renderPipeline = this.ci.device.createRenderPipeline({
            layout: "auto",
            vertex: {
                module,
                buffers: [{
                    arrayStride: this.stride, // ( 1 (material) + 3 (pos) + 3 (norm) + 2 (uv) ) * 4 bytes
                    attributes: [
                        {
                            // material,
                            shaderLocation: 0,
                            offset: 0,
                            format: "uint32"
                        },
                        {
                            // position
                            shaderLocation: 1,
                            offset: (1) * 4,
                            format: "float32x3"
                        },
                        {
                            // normal
                            shaderLocation: 2,
                            offset: (1 + 3) * 4,
                            format: "float32x3"
                        },
                        {
                            // texture uv
                            shaderLocation: 3,
                            offset: (1 + 3 + 3) * 4,
                            format: "float32x2"
                        }
                    ]
                }]
            },
            fragment: {
                module,
                targets: this.ci.formats
            },
            primitive: {
                topology: "triangle-list",
                cullMode: "back"
            },
            // enable depth testing so that things closer to the camera are rendered in front
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: "less",
                format: "depth24plus-stencil8"
            }
        })
    }

    setVertices(vertexArray) {
        this.vertices = vertexArray
        this.verticesBuffer = this.ci.device.createBuffer({
            size: this.vertices.length * this.stride,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true
        })

        const bufferMapping = this.verticesBuffer.getMappedRange()

        const materialMapping = new Uint32Array(bufferMapping)
        const vertexMapping = new Float32Array(bufferMapping)

        for (let i = 0; i < this.vertices.length; i++) {
            const v = this.vertices[i]
            const offset = this.perVertex * i

            // material is per vertex, maybe I could use that later

            materialMapping.set(
                [this.material], offset+0
            )
            vertexMapping.set(
                v.pos, offset + 1
            )
            vertexMapping.set(
                v.norm, offset + 1 + 3
            )
            vertexMapping.set(
                v.uv, offset + 1 + 3 + 3
            )
        }
        this.verticesBuffer.unmap()

        this.transformationBuffer = this.ci.device.createBuffer({
            size: this.transformationSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })

        const bindGroupEntries = [
            {
                binding: 0,
                resource: {
                    buffer: this.transformationBuffer,
                    offset: 0,
                    size: this.matrixSize * 2 // multiplied by 2 because both the transformation and the rotation matrices are in there 
                }
            },
            {
                binding: 1,
                resource: {
                    buffer: this.ci.cameraUniformBuffer,
                    offset: 0,
                    size: this.matrixSize
                }
            }
        ]

        this.transformationBindGroup = this.ci.device.createBindGroup({
            layout: this.renderPipeline.getBindGroupLayout(0),
            entries: bindGroupEntries
        })
    }

    updateTransformationMatrix() {
        const transform = mat4.create()
        const rotate = mat4.create()

        mat4.translate(transform, transform, vec3.fromValues(this.x, this.y, this.z))
        mat4.rotateX(transform, transform, this.rotX)
        mat4.rotateY(transform, transform, this.rotY)
        mat4.rotateZ(transform, transform, this.rotZ)

        mat4.rotateX(rotate, rotate, this.rotX)
        mat4.rotateY(rotate, rotate, this.rotY)
        mat4.rotateZ(rotate, rotate, this.rotZ)

        mat4.copy(this.transformationMatrix, transform)
        mat4.copy(this.rotationMatrix, rotate)
    }

    draw(renderPass) {
        this.updateTransformationMatrix()

        renderPass.setPipeline(this.renderPipeline)
        this.ci.device.queue.writeBuffer(
            this.transformationBuffer,
            0,
            this.transformationMatrix.buffer,
            this.transformationMatrix.byteOffset,
            this.transformationMatrix.byteLength
        )
        this.ci.device.queue.writeBuffer(
            this.transformationBuffer,
            4 * 4 * 4, //offset it by the transformation matrix, which is already there
            this.rotationMatrix.buffer,
            this.rotationMatrix.byteOffset,
            this.rotationMatrix.byteLength
        )
        renderPass.setVertexBuffer(0, this.verticesBuffer)
        renderPass.setBindGroup(0, this.transformationBindGroup)
        renderPass.draw(this.vertices.length, 1, 0, 0)
    }
}


// there should be a function to get vertices from an obj