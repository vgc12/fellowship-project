struct LightUniforms {
    lightPos: vec3<f32>,
    farPlane: f32,
}

@group(0) @binding(2) var <uniform> light_uniforms: LightUniforms;

@fragment
fn main(@location(0) worldPos: vec3<f32>) -> @location(0) f32 {
    let lightDistance = length(worldPos - light_uniforms.lightPos);
    let normalizedDistance = lightDistance / light_uniforms.farPlane;
    return normalizedDistance;
}