

@fragment
fn main(@location(0) color: vec4f) -> @location(0) vec4f {
    // This is the fragment shader, which is called for every pixel that is drawn in the triangle
    // the background color is decided by the clear color of the render pass
    //return vec4(random(vertex_position.xy),random(vertex_position.xz), 0.0, 1.0);
    return color;
}