struct Transform{
    model: mat4x4<f32>,
    view: mat4x4<f32>,
    projection: mat4x4<f32>
}

@binding(0) @group(0) var<uniform> transform: Transform;

@vertex
fn main(@location(0) vertexPosition: vec3f) -> @builtin(position) vec4f {

  var pos: vec4f = transform.projection * transform.view * transform.model * vec4f(vertexPosition,1.0);

  return pos;
}