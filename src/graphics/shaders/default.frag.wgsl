
@binding(0) @group(1) var texture : texture_2d<f32>;
@binding(1) @group(1) var texSampler : sampler;


@fragment
fn main(@location(0) texCoord : vec2f) -> @location(0) vec4f {

    return textureSample(texture, texSampler, texCoord);

}