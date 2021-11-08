import { createGraph } from "./graph";
import { EdgeBlueprint, isoVertexID } from "./types";

describe("Graphs", () => {
  it("Graph construction", () => {
    const vertices = [isoVertexID.wrap(3), isoVertexID.wrap(4)];

    const edges: Array<EdgeBlueprint<1>> = [
      {
        vertex1: vertices[0],
        vertex2: vertices[1],
        weight: [5],
      },
    ];
    const graph = createGraph(vertices, edges);
  });
});

export {};
