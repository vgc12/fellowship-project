/*struct VertexIn{
    @location(0) position: vec3f,

}
*/
@vertex
fn main(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4f {

   var pos = array<vec3<f32>, 3>(
                 vec3<f32>(0.0, 0.5, 0.0),  // Top vertex
                 vec3<f32>(-0.5, -0.5, 0.0), // Bottom-left vertex
                 vec3<f32>(0.5, -0.5, 0.0)   // Bottom-right vertex
             );

  return vec4f(pos[VertexIndex], 1.0);
}