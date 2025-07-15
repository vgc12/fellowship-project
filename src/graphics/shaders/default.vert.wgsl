struct Transform{

    view: mat4x4<f32>,
    projection: mat4x4<f32>,
    cameraPosition: vec4f,
}

struct VertexOut{
    @builtin(position) pos : vec4f,
    @location(0) texCoord : vec2f,
    @location(1) normal : vec3f,
    @location(2) worldPosition : vec3f,
    @location(3) tangent : vec3f,
    @location(4) bitangent : vec3f,


}

struct ObjectData{
    model: array<mat4x4<f32>>
}



@binding(0) @group(0) var<uniform> transform: Transform;
@binding(1) @group(0) var<storage,read> objects: ObjectData;


@vertex
fn main(@builtin(instance_index) i_index: u32, @location(0) vertexPosition: vec3f,
 @location(1) uv : vec2f, @location(2) normal: vec3f, @location(3) tangent : vec3f,
 @location(4) bitangent : vec3f) -> VertexOut {

  var output : VertexOut;

  output.pos = transform.projection * transform.view * objects.model[i_index] * vec4f(vertexPosition, 1.0);

  output.texCoord = uv;



  let worldNormal = normalize((objects.model[i_index] * vec4f(normal, 0.0)).xyz);
  let worldTangent = normalize((objects.model[i_index] * vec4f(tangent, 0.0)).xyz);
   // let worldBitangent = normalize(cross(worldNormal, worldTangent));
    output.worldPosition = (objects.model[i_index] * vec4f(vertexPosition, 1.0)).xyz;
  output.normal = worldNormal;
    output.tangent = worldTangent;
    let worldBitangent = normalize((objects.model[i_index] * vec4f(bitangent, 0.0)).xyz);
   // let worldBitangent = cross(worldNormal, worldTangent);
   output.bitangent = normalize(worldBitangent);


  return output;
}