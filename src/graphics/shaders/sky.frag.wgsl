
@group(0) @binding(1) var skyTexture: texture_cube<f32>;
@group(0) @binding(2) var skySampler: sampler;


@fragment
fn main(@location(0) direction : vec3<f32>) -> @location(0) vec4<f32> {
    return textureSample(skyTexture, skySampler, direction);
}