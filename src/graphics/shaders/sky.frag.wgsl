@group(0) @binding(0) var<uniform> uni: Uniforms;

struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) pos: vec4f,
};

struct Uniforms {
  viewDirectionProjectionInverse: mat4x4f,
};

@group(0) @binding(1) var skyTexture: texture_cube<f32>;
@group(0) @binding(2) var skySampler: sampler;


@fragment
fn main(vsOut: VSOutput) -> @location(0) vec4f {
    let t = uni.viewDirectionProjectionInverse * vsOut.pos;
    return textureSample(skyTexture, skySampler, normalize(t.xyz / t.w) * vec3f(1, 1, -1));
}