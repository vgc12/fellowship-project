struct Transform{

    view: mat4x4<f32>,
    projection: mat4x4<f32>,
    cameraPosition: vec4f,


}

struct ObjectData{
    model: array<mat4x4<f32>>
}



@binding(0) @group(0) var<uniform> transform: Transform;
@binding(1) @group(0) var<storage,read> objects: ObjectData;

@vertex
fn main(@builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4f {
  const pos = array(
    vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0),
    vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0),
  );

  return vec4f(pos[VertexIndex], 0.0, 1.0);
}