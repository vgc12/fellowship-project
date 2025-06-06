/*struct VertexIn{
    @location(0) position: vec3f,

}
*/
@vertex
fn main(
  @builtin(vertex_index) VertexIndex : u32, @location(0) inVertex: VertexIn
) -> @builtin(position) vec4f {



  return vec4f(inVertex.position, 0.0, 1.0);
}