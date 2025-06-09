struct VertexIn{
    @location(0) position: vec3f,

}

@vertex
fn main(vertIn: VertexIn) -> @builtin(position) vec4f {

  return vec4f(vertIn.position, 1.0);
}