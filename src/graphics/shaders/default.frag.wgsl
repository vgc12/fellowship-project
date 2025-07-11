const pi: f32 = 3.1415926535897932384626433832795;

struct Transform{

    view: mat4x4<f32>,
    projection: mat4x4<f32>,
    cameraPosition: vec4f,

}
// Point light structure
struct PointLight {
    position: vec3f,
    color: vec3f,
    intensity: f32,
    radius: f32,
}

// Area light structure
struct AreaLight {
    position: vec3f,
    right: vec3f,
    width: f32,
    up: vec3f,
    height: f32,
    color: vec3f,
    intensity: f32,
}

struct Light{
    position: vec3f,
    intensity: f32,
    color: vec3f,
    lightType: f32,
    params: vec4f, // x: radius / width, y: height, z: spotangle, w: unused
    up:vec3f,
    right:vec3f,
    forward: vec3f,

}

struct LightData{
    length: i32,
}

@binding(0) @group(0) var<uniform> transform: Transform;

@binding(0) @group(1) var albedoTexture : texture_2d<f32>;
@binding(1) @group(1) var metallicRoughnessAo : texture_2d<f32>;
@binding(2) @group(1) var texSampler : sampler;

@binding(0) @group(2) var<storage, read> lights: array<Light>;
@binding(1) @group(2) var<uniform> lightData: LightData;

fn calculatePointLight(pointLight : PointLight, worldPosition: vec3f, normal: vec3f, viewDir: vec3f, roughness: f32, F0: vec3f, albedo: vec3f, metallic: f32) -> vec3f {

    let l = normalize(pointLight.position - worldPosition); // Light direction
    let h = normalize(l + viewDir); // Half-vector
    let distance = length(pointLight.position - worldPosition); // Distance to light source
    let attenuation = 1.0 / (1.0 + distance * distance); // Simple attenuation based on distance
    let radiance = pointLight.color * pointLight.intensity * attenuation; // Scale the light color and apply attenuation

    let NdotH = DistributionGGX(normal, h, roughness); // Normal distribution function (NDF)
    let g = GeometrySmith(normal, viewDir, l, roughness); // Geometry function (G)
    let f = fresnelSchlick(max(dot(h, viewDir), 0.0), F0); // Fresnel term (F)

    let kS = f; // Specular reflection coefficient (kS) using Fresnel term
    let kD = (vec3f(1.0) - kS) * (1.0 - metallic); // Diffuse reflection coefficient (kD) based on metallic property

    let numerator = NdotH * g * f; // Numerator for the specular term
    let denominator = 4.0 * max(dot(normal, viewDir), 0.0) * max(dot(normal, l), 0.0) + 0.001; // Avoid division by zero
    let specular = numerator / denominator; // Specular term

    let NDotL = max(dot(normal, l), 0.0); // Dot product between normal and light direction
    return (kD * albedo / pi + specular) * radiance * NDotL; // Combine diffuse and specular contributions


}

// Linearly Transformed Cosines (LTC) approximation for area lights
// This is more complex but provides better quality with fewer samples
fn calculateAreaLightLTC(light: AreaLight, worldPosition: vec3f, normal: vec3f, viewDir: vec3f, roughness: f32, F0: vec3f) -> vec3f {
    // This would require LTC lookup tables and is quite complex
    // For now, using a simplified version that approximates the effect

    let lightCenter = light.position;
    let lightDir = normalize(lightCenter - worldPosition);
    let distance = length(lightCenter - worldPosition);

    // Calculate the solid angle subtended by the area light
    let lightArea = light.width * light.height;
    let solidAngle = lightArea / (distance * distance);

    // Modify the BRDF based on the solid angle (rough approximation)
    let effectiveRoughness = roughness * (1.0 + solidAngle * 0.5);

    let h = normalize(lightDir + viewDir);
    let NdotL = max(dot(normal, lightDir), 0.0);
    let NdotH = max(dot(normal, h), 0.0);
    let VdotH = max(dot(viewDir, h), 0.0);

    let d = DistributionGGX(normal, h, effectiveRoughness);
    let g = GeometrySmith(normal, viewDir, lightDir, effectiveRoughness);
    let f = fresnelSchlick(VdotH, F0);

    let numerator = d * g * f;
    let denominator = 4.0 * max(dot(normal, viewDir), 0.0) * NdotL + 0.001;
    let specular = numerator / denominator;

    // Scale by solid angle to approximate area light contribution
    let attenuation = solidAngle / (1.0 + distance * distance);
    let radiance = light.color * light.intensity * attenuation;

    return specular * radiance * NdotL;
}



fn calculateLight(light: Light, worldPosition: vec3f, normal: vec3f, viewDir: vec3f, roughness: f32, F0: vec3f, albedo: vec3f, metallic: f32) -> vec3f {
    switch (i32(light.lightType)) {
        case 0: {
            let pointLight = PointLight(
                light.position,
                light.color,
                light.intensity,
                light.params.x
            );
            return calculatePointLight(pointLight, worldPosition, normal, viewDir, roughness, F0, albedo, metallic);
        }
        case 1: {
            let areaLight = AreaLight(
                light.position,
                light.right,
                light.params.x, // width
                light.up,
                light.params.y, // height
                light.color,
                light.intensity
            );
            return calculateAreaLightLTC(areaLight, worldPosition, normal, viewDir, roughness, F0);
        }

        default: {
            return vec3f(0.0);
        }
    }
}






// Trowbridge-Reitz GGX normal distribution
fn DistributionGGX(n: vec3<f32>, h: vec3<f32>, roughness: f32) -> f32 {
    let a = roughness * roughness;
    let a2 = a * a;
    let NdotH = max(dot(n, h), 0.0);
    let NdotH2 = NdotH * NdotH;

    let num = a2;
    let denom = (NdotH2 * (a2 - 1.0) + 1.0);
    return num / (pi * denom * denom);
}

// Schlick-GGX geometry function
fn GeometrySchlickGGX(NdotV: f32, roughness: f32) -> f32 {
    let r = (roughness + 1.0);
    let k = (r * r) / 8.0;
    return NdotV / (NdotV * (1.0 - k) + k);
}


fn GeometrySmith(n: vec3<f32>, v: vec3<f32>, l: vec3<f32>, roughness: f32) -> f32 {
    let NdotV = max(dot(n, v), 0.0);
    let NdotL = max(dot(n, l), 0.0);
    let ggx1 = GeometrySchlickGGX(NdotV, roughness);
    let ggx2 = GeometrySchlickGGX(NdotL, roughness);
    return ggx1 * ggx2;
}

// Fresnel-Schlick approximation
fn fresnelSchlick(cosTheta: f32, F0: vec3<f32>) -> vec3<f32> {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

@fragment
fn main(@location(0) position: vec3f, @location(1) texCoord : vec2f, @location(2) vertexNormal: vec3f, @ location(3) worldPosition: vec3f) -> @location(0) vec4f {
    let albedo = textureSample(albedoTexture, texSampler, texCoord); // Sample the albedo texture
    let ao = textureSample(metallicRoughnessAo, texSampler, texCoord).r; // Sample the ambient occlusion texture
    let metallic = textureSample(metallicRoughnessAo, texSampler, texCoord).b; // Sample the metallic texture
    let roughness = textureSample(metallicRoughnessAo, texSampler, texCoord).g; // Sample the roughness texture

    let normal = normalize(vertexNormal);

    let viewDir = normalize(transform.cameraPosition.xyz - worldPosition); // Calculate the view direction

    let F0 = mix(vec3f(0.04), albedo.xyz, metallic); // Calculate the base reflectivity (F0) based on metallic property

    var Lo = vec3f(0.0); // Initialize the outgoing light color

    for(var i = 0; i < lightData.length; i++) {

        Lo += calculateLight(lights[i], worldPosition, normal, viewDir, roughness, F0, albedo.xyz, metallic);
    }

    let ambient = vec3f(0.03) * albedo.xyz * ao; // Calculate ambient light contribution using ambient occlusion
    let color = ambient + Lo; // Combine ambient and direct lighting contributions
    let mapped = color / (color + vec3f(1.0)); // Apply tone mapping to the final colo

    return vec4<f32>(pow(mapped, vec3f(1.0 / 2.2)), 1.0); // Return the final color with gamma correction

}