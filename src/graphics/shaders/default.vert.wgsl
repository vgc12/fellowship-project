struct Transform{

    view: mat4x4<f32>,
    projection: mat4x4<f32>,
    cameraPosition: vec4f,
}

struct VertexOut{
    @builtin(position) pos : vec4f,
    @location(0) position : vec3f,
    @location(1) texCoord : vec2f,
    @location(2) normal : vec3f,
    @location(3) worldPosition : vec3f,

}

struct ObjectData{
    model: array<mat4x4<f32>>
}



@binding(0) @group(0) var<uniform> transform: Transform;
@binding(1) @group(0) var<storage,read> objects: ObjectData;


@vertex
fn main(@builtin(instance_index) i_index: u32, @location(0) vertexPosition: vec3f,
 @location(1) uv : vec2f, @location(2) normal: vec3f) -> VertexOut {

  var output : VertexOut;

  var worldPosition = objects.model[i_index] * vec4f(vertexPosition, 1.0);

  output.pos = transform.projection * transform.view * worldPosition;

  output.texCoord = uv;

  output.position = output.pos.xyz;

  output.normal = normalize((objects.model[i_index] * vec4f(normal, 0.0)).xyz);

  output.worldPosition = worldPosition.xyz;


  return output;
}