
@fragment
fn main(@location(0) vertex_position : vec3f) -> @location(0) vec4f {
    // This is the fragment shader, which is called for every pixel that is drawn in the triangle
    // the background color is decided by the clear color of the render pass
    return vec4(vertex_position, 1.0);
}