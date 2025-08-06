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


fn fresnelSchlick(cosTheta: f32, F0: vec3f) -> vec3f {
    return F0 + (1.0 - F0) * pow(clamp(1.0-cosTheta,0.0,1.0),5.0);
}


fn geometrySchlick( NdotV : f32, roughness: f32,) -> f32 {
    let r = (roughness + 1.0);
    let k = (r * r) / 8.0;
    let num = NdotV;
    let denom = NdotV * (1.0 - k) + k;

    return num / denom;
}


fn GeometrySmith( normal : vec3f, viewDir : vec3f, lightDir : vec3f, roughness : f32) -> f32 {
    let NdotV = max(dot(normal, viewDir), 0.0);
    let NdotL = max(dot(normal, lightDir), 0.0);
    let ggx2 = geometrySchlick(NdotV, roughness);
    let ggx1 = geometrySchlick(NdotL, roughness);
    return ggx1 * ggx2;

}


fn DistributionGGX( normal: vec3f, halfVector: vec3f, roughness : f32) -> f32 {
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
       var lightIntensity : f32 = pointLight.intensity ;
       var lightColor : vec3f = pointLight.color * lightIntensity;


        var l : vec3f = normalize(lightPosition - worldPosition);

        var h : vec3f = normalize(l + viewDir); // Half-vector
        let lightDistance = length(lightPosition - worldPosition);
        let attenuation = 1.0 / (lightDistance * lightDistance);
        let radiance = lightColor * attenuation * lightIntensity;

        let ndf = DistributionGGX(worldNormal, h, roughness);
        let g = GeometrySmith(worldNormal, h, l, roughness);
        let f = fresnelSchlick(max(dot(h, viewDir),0.0), F0);

        let kS = f;
        var kD = vec3f(1.0) - kS;
        kD *= max(1.0 - metallic, 0.1);

        let NdotL = max(dot(worldNormal,l),0.0);
        let numerator = ndf * g * f;
        let denominator = 4.0 * max(dot(worldNormal, viewDir),0.0) * NdotL + 0.0001;
        let specular = numerator/denominator;

        return (kD * albedo.xyz / pi + specular) * radiance * NdotL ;
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
    var lightIntensity : f32 = light.intensity ;
    var lightColor : vec3f = light.color * lightIntensity;


    // Calculate direction from light to fragment
    var lightToFragment = normalize( worldPosition - lightPosition);

    // Compare with light's forward direction
    var theta = dot(lightToFragment, normalize(-light.up));// Angle between light direction and fragment position



    let innerAngle : f32 = cos(light.params.x); // Cosine of the spotlight angle
    let outerAngle : f32 = cos(light.params.y); // Cosine of outer falloff angle

    if(theta <= outerAngle) {
        return vec3f(0.0); // Outside the spotlight cone, no contribution
    }

    let attenuation = smoothstep( outerAngle, innerAngle, theta); // Smoothstep for soft edges

     var l : vec3f = normalize(lightPosition - worldPosition);

    var h : vec3f = normalize(l + viewDir); // Half-vector
    let lightDistance = length(lightPosition - worldPosition);

    let radiance = lightColor * attenuation * lightIntensity;

    let ndf = DistributionGGX(worldNormal, h, roughness);
    let g = GeometrySmith(worldNormal, h, l, roughness);
    let f = fresnelSchlick(max(dot(h, viewDir),0.0), F0);

    let kS = f;
    var kD = vec3f(1.0) - kS;
    kD *= max(1.0 - metallic, 0.1);

    let NdotL = max(dot(worldNormal,l),0.0);
    let numerator = ndf * g * f;
    let denominator = 4.0 * max(dot(worldNormal, viewDir),0.0) * NdotL + 0.0001;
    let specular = numerator/denominator;

    return (kD * albedo.xyz / pi + specular) * radiance * NdotL ;

}

@group(0) @binding(0) var<uniform> camera: Transform;

@group(1) @binding(0) var gBufferAlbedo: texture_2d<f32>;
@group(1) @binding(1) var gBufferNormal: texture_2d<f32>;
@group(1) @binding(2) var gBufferMetallicRoughnessAO: texture_2d<f32>;
@group(1) @binding(3) var gBufferPosition: texture_2d<f32>;
@group(1) @binding(4) var gBufferDepth: texture_depth_2d;

@binding(0) @group(2) var<storage, read> lights: array<Light>;
@binding(1) @group(2) var<uniform> lightData: LightData;

@group(3) @binding(1) var skyTexture: texture_cube<f32>;
@group(3) @binding(2) var skySampler: sampler;




@fragment
fn main(@builtin(position) coord: vec4f ) -> @location(0) vec4f {

    let c = vec2i(coord.xy);
    let depth = textureLoad(gBufferDepth, c, 0); // Sample the depth texture

      if (depth >= 1.0) {
        discard;
      }

    let albedo = textureLoad(gBufferAlbedo, c, 0); // Sample the albedo texture
    let metallic = textureLoad(gBufferMetallicRoughnessAO, c, 0).g; // Sample the metallic texture
    let roughness = max(textureLoad(gBufferMetallicRoughnessAO, c, 0).r, 0.04); // Sample the roughness texture
   // let ao = textureLoad(gBufferMetallicRoughnessAO, c, 0).g; // Sample the ambient occlusion texture
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
                default :
                {
                   L0 += vec3f(0.0);
                }
        }


    }

    let eyeToSurfaceDir = worldPosition - camera.cameraPosition.xyz;

    let fresnel = pow(1.0 - max(dot(normalize(v), worldNormal), 0.0), 5.0);

    let reflectionDir = reflect(eyeToSurfaceDir, worldNormal);

    let reflect = textureSample(skyTexture,  skySampler, reflectionDir );

    let ambient = mix(albedo.xyz *0.01, reflect.xyz, fresnel); // Ambient light contribution
    var color =  L0 + vec3f(emissivity) + ambient; // Combine all contributions
    color = color / (color + vec3f(1.0)); // Simple tone mapping
    color = pow(color, vec3f(1.0 / 2.2)); // Gamma correction
    return vec4f(color,1.0);


}