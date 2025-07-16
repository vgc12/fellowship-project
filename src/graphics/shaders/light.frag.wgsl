const pi: f32 = 3.1415926535897932384626433832795;

struct Transform{

    view: mat4x4<f32>,
    projection: mat4x4<f32>,
    cameraPosition: vec4f,


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


fn fresnelSchlick(F0: vec3f, viewDir: vec3f, h : vec3f ) -> vec3f {
    return F0 + (vec3(1.0) - F0) * pow(1.0- max(dot(viewDir, h), 0.0), 5.0);
}


fn geometrySchlick(roughness: f32, NdotV : f32) -> f32 {
    let r = (roughness + 1.0);
    let k = (r * r) / 8.0;
    let num = NdotV;
    let denom = NdotV * (1.0 - k) + k;

    return num / denom;
}


fn GeometrySmith(roughness : f32, normal : vec3f, viewDir : vec3f, lightDir : vec3f) -> f32 {
    let NdotV = max(dot(normal, viewDir), 0.0);
    let NdotL = max(dot(normal, lightDir), 0.0);
    let ggx2 = geometrySchlick(roughness, NdotV);
    let ggx1 = geometrySchlick(roughness, NdotL);
    return ggx1 * ggx2;

}


fn DistributionGGX(normal: vec3f, halfVector: vec3f, roughness: f32) -> f32 {
    let a = roughness * roughness;
    let numerator = a * a;
    let NdotH = max(dot(normal, halfVector), 0.0);
    let denominator = pow((NdotH * NdotH) * (numerator - 1.0) + 1.0, 2.0) * pi;


    return numerator / denominator;
}

// View https://learnopengl.com/PBR/Lighting as a reference to what is going on here
fn calculatePointLight(pointLight : Light,
    worldPosition: vec3f,
    worldNormal: vec3f,
    viewDir: vec3f,
    F0: vec3f,
    albedo: vec4f,
    metallic: f32,
    roughness: f32) -> vec3f {

        var lightPosition : vec3f = pointLight.position;
        var lightColor : vec3f = pointLight.color;
        var lightIntensity : f32 = pointLight.intensity;
        // directional light
        var l : vec3f = normalize(lightPosition - worldPosition);

        var h : vec3f = normalize(l + viewDir); // Half-vector

        let kS : vec3f = fresnelSchlick(F0, viewDir, h);
        let kD : vec3f = (vec3(1.0) - kS) * (1.0 - metallic) ;

        let lambert = albedo / pi;

        let numerator = DistributionGGX(worldNormal, h, roughness) * GeometrySmith(roughness, worldNormal, viewDir, l) * kS;
        let denominator = max( 4.0 * max(dot(viewDir, worldNormal), 0.0) * max(dot(l, worldNormal), 0.0) , 0.000001);
        let specular = numerator / denominator;

        let lightDistance = length(lightPosition - worldPosition);
        let attenuation = 1.0 / (lightDistance * lightDistance);
        let radiance = lightColor * lightIntensity * attenuation;
        let brdf = kD * lambert.xyz + specular;
        let NdotL = max(dot(worldNormal, l), 0.0);
        let outgoingLight =  brdf * radiance * NdotL;

        return outgoingLight;
}

fn calculateSpotLight(
    light: Light,
    worldPosition: vec3f,
    worldNormal: vec3f,
    viewDir: vec3f,
    F0: vec3f,
    albedo : vec4f,
    metallic: f32,
    roughness: f32) -> vec3f {
    var lightPosition : vec3f = light.position;
    var lightColor : vec3f = light.color;
    var lightIntensity : f32 = light.intensity;

// Calculate direction from light to fragment
    var lightToFragment = normalize( worldPosition - lightPosition);

    // Compare with light's forward direction
    var theta = dot(lightToFragment, normalize(-light.up));// Angle between light direction and fragment position



    let innerAngle : f32 = cos(light.params.x); // Cosine of the spotlight angle
    let outerAngle : f32 = cos(light.params.y); // Cosine of outer falloff angle

    if(theta <= outerAngle) {
        return vec3f(0.0); // Outside the spotlight cone, no contribution
    }

    let intensity = smoothstep( outerAngle, innerAngle, theta); // Smoothstep for soft edges

    // Rest of your lighting calculations...
    var l : vec3f = normalize(lightPosition - worldPosition);
    var h : vec3f = normalize(l + viewDir);

    let kS : vec3f = fresnelSchlick(F0, viewDir, h);
    let kD : vec3f = (vec3(1.0) - kS) * (1.0 - metallic);

    let lambert = albedo / pi;

    let numerator = DistributionGGX(worldNormal, h, roughness) * GeometrySmith(roughness, worldNormal, viewDir, l) * kS;
    let denominator = max(4.0 * max(dot(viewDir, worldNormal), 0.0) * max(dot(l, worldNormal), 0.0), 0.000001);
    let specular = numerator / denominator;


    let lightDistance = length(lightPosition - worldPosition);
    let attenuation = 1.0 / (lightDistance * lightDistance);
    let radiance = lightColor * lightIntensity *  attenuation ; // Apply spotlight attenuation
    let brdf = (intensity * kD * lambert.xyz) + (specular * intensity);
    let NdotL = max(dot(worldNormal, l), 0.0);
    let outgoingLight = brdf * radiance * NdotL ; // Apply spotlight intensity

    return outgoingLight ;// Scale by spotlight intensity

}


fn calculateDirectionalLight(light: Light, worldPosition: vec3f, worldNormal: vec3f, viewDir: vec3f, F0: vec3f, albedo : vec4f, metallic: f32, roughness: f32) -> vec3f {
    var lightColor : vec3f = light.color;
    var lightIntensity : f32 = light.intensity;

    // directional light
    var l : vec3f = normalize(light.forward);

    var h : vec3f = normalize(l + viewDir); // Half-vector

    let kS : vec3f = fresnelSchlick(F0, viewDir, h);
    let kD : vec3f = (vec3(1.0) - kS) * (1.0 - metallic) ;

    let lambert = albedo / pi;

    let numerator = DistributionGGX(worldNormal, h, roughness) * GeometrySmith(roughness, worldNormal, viewDir, l) * kS;
    let denominator = max( 4.0 * max(dot(viewDir, worldNormal), 0.0) * max(dot(l, worldNormal), 0.0) , 0.000001);
    let specular = numerator / denominator;

    let radiance = lightColor * lightIntensity;
    let brdf = kD * lambert.xyz + specular;
    let NdotL = max(dot(worldNormal, l), 0.0);
    let outgoingLight =  brdf * radiance * NdotL;

    return outgoingLight;
}

@group(0) @binding(0) var<uniform> camera: Transform;

@group(1) @binding(0) var gBufferAlbedo: texture_2d<f32>;
@group(1) @binding(1) var gBufferNormal: texture_2d<f32>;
@group(1) @binding(2) var gBufferMetallicRoughnessAO: texture_2d<f32>;
@group(1) @binding(3) var gBufferPosition: texture_2d<f32>;
@group(1) @binding(4) var gBufferDepth: texture_depth_2d;

@binding(0) @group(2) var<storage, read> lights: array<Light>;
@binding(1) @group(2) var<uniform> lightData: LightData;

@group(0) @binding(1) var skyTexture: texture_cube<f32>;
@group(0) @binding(2) var skySampler: sampler;




@fragment
fn main(@builtin(position) coord: vec4f ) -> @location(0) vec4f {

    let c = vec2i(coord.xy);
    let depth = textureLoad(gBufferDepth, c, 0); // Sample the depth texture

      if (depth >= 1.0) {
        discard;
      }

    let albedo = textureLoad(gBufferAlbedo, c, 0); // Sample the albedo texture
    let metallic = textureLoad(gBufferMetallicRoughnessAO, c, 0).g; // Sample the metallic texture
    let roughness = textureLoad(gBufferMetallicRoughnessAO, c, 0).r; // Sample the roughness texture
    let ao = textureLoad(gBufferMetallicRoughnessAO, c, 0).b; // Sample the ambient occlusion texture
    let worldNormal = textureLoad(gBufferNormal, c, 0).xyz; // Sample the normal texture
    let worldPosition = textureLoad(gBufferPosition, c, 0).xyz; // Sample the world position texture

    let emissivity : f32 = 0.0;
    let F0 : vec3f = mix(vec3(0.04), albedo.xyz, metallic);
    var L0 : vec3f = vec3f(0.0);
    var v : vec3f = normalize(camera.cameraPosition.xyz - worldPosition);


    for (var i = 0; i < lightData.length; i++) {
        let light = lights[i];

         switch (i32(light.lightType)) {
                case 0: {

                   L0 +=  calculatePointLight(light, worldPosition, worldNormal, v, F0, albedo,  metallic, roughness);
                }
                case 1: {
                  L0 +=  calculateSpotLight(light, worldPosition, worldNormal, v, F0, albedo, metallic, roughness);
                }
                case 2: {
                   L0 +=  calculateDirectionalLight(light, worldPosition, worldNormal, v, F0, albedo, metallic, roughness);
                }
                default :
                {
                   L0 += vec3f(0.0);
                }
        }


    }

    let eyeToSurfaceDir = worldPosition - camera.cameraPosition.xyz;

    let reflectionDir = reflect(eyeToSurfaceDir, worldNormal);



    let ambient = albedo.xyz * ao * 0.1; // Ambient light contribution
    var color =  L0 + vec3f(emissivity); // Combine all contributions
    color = color / (color + vec3f(1.0)); // Simple tone mapping
    color = pow(color, vec3f(1.0 / 2.2)); // Gamma correction
    return vec4f(color,1.0);


}