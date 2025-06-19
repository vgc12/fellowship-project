struct Transform{
    view: mat4x4<f32>,
    projection: mat4x4<f32>
}

struct VertexOut{
    @builtin(position) pos : vec4f,
    @location(0) color: vec4f
}

struct ObjectData{
    model: array<mat4x4<f32>>
}

@binding(0) @group(0) var<uniform> transform: Transform;
@binding(1) @group(0) var<storage,read> objects: ObjectData;


@vertex
fn main(@builtin(instance_index) v_index : u32, @location(0) vertexPosition: vec3f) -> VertexOut {

  var output : VertexOut;

  output.pos = transform.projection * transform.view * objects.model[v_index] * vec4f(vertexPosition,1.0);

    var col = vertexPosition;

  output.color = vec4f(col,1.0);



  return output;
}