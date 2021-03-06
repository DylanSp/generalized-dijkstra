import { createGraph } from "./graph";
import { EdgeBlueprint, vertexIDIso } from "./types";

describe("Graphs", () => {
  it("Graph construction", () => {
    const vertices = [vertexIDIso.wrap(3), vertexIDIso.wrap(4)];

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
