struct FragmentInput {
    @location(0) texCoord: vec2<f32>,

    @location(1) normal: vec3<f32>,
    @location(2) worldPosition: vec3<f32>,
    @location(3) tangent: vec3<f32>,
    @location(4) bitangent: vec3<f32>,
};

struct GBufferOutput {
    @location(0) albedo: vec4<f32>,
    @location(1) normal: vec4<f32>,
    @location(2) metallicRoughnessAo: vec4<f32>,
    @location(3) position: vec4<f32>,
};

@binding(0) @group(1) var albedoTexture : texture_2d<f32>;
@binding(1) @group(1) var normalTexture : texture_2d<f32>;
@binding(2) @group(1) var metallicRoughnessAo : texture_2d<f32>;
@binding(3) @group(1) var texSampler : sampler;

@fragment
fn main(fragment: FragmentInput) -> GBufferOutput {
    var output : GBufferOutput;
    let albedo = textureSample(albedoTexture, texSampler, fragment.texCoord); // Sample the albedo texture
    let metallic = textureSample(metallicRoughnessAo, texSampler, fragment.texCoord).r; // Sample the metallic texture
    let roughness = textureSample(metallicRoughnessAo, texSampler, fragment.texCoord).g; // Sample the roughness texture
    let ao = textureSample(metallicRoughnessAo, texSampler, fragment.texCoord).b; // Sample the ambient occlusion texture
    let normal = textureSample(normalTexture, texSampler, fragment.texCoord); // Sample the normal texture

   let t = normalize(fragment.tangent);
   let b = normalize(fragment.bitangent);
   let n = normalize(fragment.normal);

   let tbn : mat3x3<f32> = mat3x3<f32>(t, b, n);

   var tangentNormal : vec3f = normal.xyz * 2.0 - 1.0 ;

   var worldNormal : vec3f = normalize(tbn * tangentNormal);

    output.albedo = vec4<f32>(albedo.xyz, 1.0);
    output.normal = vec4f(worldNormal,1.0);
    output.metallicRoughnessAo = vec4<f32>(metallic, roughness, ao, 1.0);

    output.position = vec4<f32>(fragment.worldPosition, 1.0);

  return output;


 }