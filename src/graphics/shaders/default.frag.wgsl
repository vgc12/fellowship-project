struct Transform{

    view: mat4x4<f32>,
    projection: mat4x4<f32>,
    cameraPosition: vec4f,

}

@binding(0) @group(0) var<uniform> transform: Transform;

@binding(0) @group(1) var albedoTexture : texture_2d<f32>;
@binding(1) @group(1) var metallicRoughnessAo : texture_2d<f32>;
@binding(2) @group(1) var texSampler : sampler;


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


    const lightPosition = vec3f(0.0, 2.0, 0.0);
    const lightColor = vec3f(1.0, 1.0, 1.0);

    let l = normalize(lightPosition - worldPosition); // Calculate the light direction

    let h = normalize(l + viewDir); // Calculate the half-vector between light and view direction
    let distance = length(lightPosition - worldPosition); // Calculate the distance to the light source
    let attenuation = 1.0 / (1.0 + distance * distance); // Simple attenuation based on distance
    let radiance = lightColor * 20 * attenuation; // Scale the light color and apply attenuation

    let NdotH = DistributionGGX(normal, h, roughness); // Calculate the normal distribution function (NDF)
    let g = GeometrySmith(normal, viewDir, l, roughness); // Calculate the geometry function (G)
    let f = fresnelSchlick(max(dot(h, viewDir), 0.0), F0); // Calculate the Fresnel term (F)

    let kS = f; // Calculate the specular reflection coefficient (kS) using Fresnel term
    let kD = (vec3f(1.0) - kS) * (1.0 - metallic); // Calculate the diffuse reflection coefficient (kD) based on metallic property

    let numerator = NdotH * g * f; // Calculate the numerator for the specular term
    let denominator = 4.0 * max(dot(normal, viewDir), 0.0) * max(dot(normal, l), 0.0) + 0.001; // Add a small value to avoid division by zero
    let specular = numerator / denominator; // Calculate the specular term

    let NDotL = max(dot(normal, l), 0.0); // Calculate the dot product between normal and light direction
    Lo += (kD * albedo.xyz / 3.14159265 + specular) * radiance * NDotL; // Combine diffuse and specular contributions

    let ambient = vec3f(0.03) * albedo.xyz * ao; // Calculate ambient light contribution using ambient occlusion
    let color = ambient + Lo; // Combine ambient and direct lighting contributions
    let mapped = color / (color + vec3f(1.0)); // Apply tone mapping to the final color
    return vec4<f32>(pow(mapped, vec3f(1.0 / 2.2)), 1.0); // Return the final color with gamma correction
}



// Trowbridge-Reitz GGX normal distribution
fn DistributionGGX(n: vec3<f32>, h: vec3<f32>, roughness: f32) -> f32 {
    let a = roughness * roughness;
    let a2 = a * a;
    let NdotH = max(dot(n, h), 0.0);
    let NdotH2 = NdotH * NdotH;

    let num = a2;
    let denom = (NdotH2 * (a2 - 1.0) + 1.0);
    return num / (3.14159265 * denom * denom);
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