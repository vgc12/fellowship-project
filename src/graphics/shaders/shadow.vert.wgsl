    struct Camera{
        view_matrix: mat4x4<f32>,
        projection_matrix: mat4x4<f32>,
        position: vec4f,
    }





    @group(0) @binding(0) var<uniform> camera: Camera;
    @group(0) @binding(1) var<storage, read> model_matrices: array<mat4x4<f32>>;

    struct VertexInput {
        @location(0) position: vec3<f32>,
    }

    struct VertexOutput {
        @builtin(position) position: vec4<f32>,
        @location(0) worldPos: vec3<f32>,
    }

    @vertex
    fn main(@builtin(instance_index) i_index: u32,input: VertexInput) -> VertexOutput {
        var output: VertexOutput;
        let worldPos = model_matrices[i_index] * vec4<f32>(input.position, 1.0);
        output.worldPos = worldPos.xyz;
        output.position = camera.projection_matrix * camera.view_matrix * worldPos;
        return output;
    }