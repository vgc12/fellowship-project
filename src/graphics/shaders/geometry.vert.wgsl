struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) normal: vec3<f32>,
    @location(3) tangent: vec3<f32>,
    @location(4) bitangent: vec3<f32>,
}

struct VertexOut{
    @builtin(position) pos : vec4f,
    @location(0) texCoord : vec2f,
    @location(1) normal : vec3f,
    @location(2) worldPosition : vec3f,
    @location(3) tangent : vec3f,
    @location(4) bitangent : vec3f,

}
struct Camera{

    view_matrix: mat4x4<f32>,
    projection_matrix: mat4x4<f32>,
    position: vec4f,

}


@group(0) @binding(0) var<uniform> camera: Camera;
@group(0) @binding(1) var<storage, read> model_matrices: array<mat4x4<f32>>;

@vertex
fn main(@builtin(instance_index) i_index: u32, vertex: VertexInput) -> VertexOut {
    var output : VertexOut;

    let model_matrix = model_matrices[i_index];

    output.pos = camera.projection_matrix * camera.view_matrix * model_matrix * vec4f(vertex.position, 1.0);
    output.texCoord = vertex.uv;

    let worldNormal = normalize((model_matrix * vec4f(vertex.normal, 0.0)).xyz);
    let worldTangent = normalize((model_matrix * vec4f(vertex.tangent, 0.0)).xyz);
    let worldBitangent = normalize((model_matrix * vec4f(vertex.bitangent, 0.0)).xyz);


    output.worldPosition = (model_matrices[i_index] * vec4f(vertex.position, 1.0)).xyz;
    output.normal = worldNormal;
    output.tangent = worldTangent;
    output.bitangent = worldBitangent;

    return output;
}